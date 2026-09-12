import React, { useState } from 'react';
import { X, AlertCircle, ShieldCheck, RefreshCw, ExternalLink } from 'lucide-react';
import { UserAccount } from '../types';
import { Language } from '../locales/i18n';
import { 
  getAuthSafe, 
  getFirestoreSafe, 
  googleProvider, 
  signInWithPopup, 
  signInWithCredential,
  GoogleAuthProvider,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from '../lib/firebase';
import { BundeliLogo } from './BundeliLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  language: Language;
  allowClose?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language,
  allowClose = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');

  if (!isOpen) return null;

  // Helper to sync user to Firestore and trigger login success
  const finishUserLogin = async (fbUser: any) => {
    const userEmail = fbUser.email || '';
    const userName = fbUser.displayName || (userEmail ? userEmail.split('@')[0] : 'बुन्देली क्रिएटर');
    const userAvatar = fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}&backgroundColor=f59e0b,d97706`;
    const cleanHandle = `@${userName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '') || 'bundeli'}`;

    let role: 'creator' | 'viewer' = 'viewer';
    let channelHandle: string | undefined = undefined;
    let userChannelId: string | undefined = undefined;
    let channelStatus: 'approved' | 'pending' | 'none' = 'none';
    let existingUserData: any = null;

    // Check existing Firestore user and channel records
    try {
      const db = getFirestoreSafe();
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const d = userSnap.data();
        existingUserData = d;
        if (d.channelId) userChannelId = d.channelId;
        if (d.channelHandle) channelHandle = d.channelHandle;
        if (d.channelStatus) {
          channelStatus = d.channelStatus;
        } else if (d.approvalStatus) {
          channelStatus = d.approvalStatus;
        }

        if (channelStatus === 'approved') {
          role = 'creator';
        } else if (channelStatus === 'pending') {
          role = 'creator';
        } else {
          role = 'viewer';
          channelStatus = 'none';
        }

        const existingLogo = d.channelLogoUrl || d.avatar;
        await updateDoc(userRef, {
          lastLoginAt: new Date().toISOString(),
          name: d.name || userName,
          email: userEmail,
          avatar: existingLogo || userAvatar
        });
      } else {
        await setDoc(userRef, {
          uid: fbUser.uid,
          name: userName,
          email: userEmail,
          avatar: userAvatar,
          role: 'viewer',
          channelStatus: 'none',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        }, { merge: true });
      }

      // Helper to evaluate approval status from channel / submission documents
      const evaluateDocApproval = (data: any) => {
        if (!data) return { isApproved: false, isPending: false, isRejected: false, status: 'none' };
        const statusStr = String(data.status || data.approvalStatus || data.channelStatus || '').toLowerCase();
        const isRejected = statusStr === 'rejected' || data.isRejected === true;
        const isApproved = !isRejected && (
          statusStr === 'approved' ||
          statusStr === 'verified' ||
          data.isApproved === true ||
          data.approved === true ||
          data.channelStatus === 'approved' ||
          data.approvalStatus === 'approved' ||
          data.kycStatus === 'verified'
        );
        const isPending = !isRejected && !isApproved && (
          statusStr === 'pending' ||
          data.approvalStatus === 'pending' ||
          data.channelStatus === 'pending' ||
          data.kycStatus === 'pending'
        );
        return { isApproved, isPending, isRejected, status: isApproved ? 'approved' : isRejected ? 'rejected' : isPending ? 'pending' : 'none' };
      };

      // If user is not yet verified as approved, check channels and submissions collections
      if (channelStatus !== 'approved') {
        // 1. Check if existing user doc had a channelId
        if (existingUserData?.channelId) {
          const directChanSnap = await getDoc(doc(db, 'channels', existingUserData.channelId)).catch(() => null);
          if (directChanSnap && directChanSnap.exists()) {
            const res = evaluateDocApproval(directChanSnap.data());
            if (res.isApproved) {
              channelStatus = 'approved';
              userChannelId = directChanSnap.id;
              channelHandle = directChanSnap.data().handle || cleanHandle;
              role = 'creator';
            } else if (channelStatus === 'none' && res.isPending) {
              channelStatus = 'pending';
              userChannelId = directChanSnap.id;
              role = 'creator';
            }
          } else {
            const directSubSnap = await getDoc(doc(db, 'channel_submissions', existingUserData.channelId)).catch(() => null);
            if (directSubSnap && directSubSnap.exists()) {
              const res = evaluateDocApproval(directSubSnap.data());
              if (res.isApproved) {
                channelStatus = 'approved';
                userChannelId = directSubSnap.id;
                channelHandle = directSubSnap.data().handle || directSubSnap.data().channelHandle || cleanHandle;
                role = 'creator';
              } else if (channelStatus === 'none' && res.isPending) {
                channelStatus = 'pending';
                userChannelId = directSubSnap.id;
                role = 'creator';
              }
            }
          }
        }

        // 2. Query channels by ownerUid
        if (channelStatus !== 'approved') {
          const chanQuery = query(collection(db, 'channels'), where('ownerUid', '==', fbUser.uid));
          const chanSnap = await getDocs(chanQuery).catch(() => null);
          if (chanSnap && !chanSnap.empty) {
            for (const docItem of chanSnap.docs) {
              const res = evaluateDocApproval(docItem.data());
              if (res.isApproved) {
                channelStatus = 'approved';
                userChannelId = docItem.id;
                channelHandle = docItem.data().handle || cleanHandle;
                role = 'creator';
                break;
              } else if (channelStatus === 'none' && res.isPending) {
                channelStatus = 'pending';
                userChannelId = docItem.id;
                role = 'creator';
              }
            }
          }
        }

        // 3. Query channel_submissions by ownerUid
        if (channelStatus !== 'approved') {
          const subQuery = query(collection(db, 'channel_submissions'), where('ownerUid', '==', fbUser.uid));
          const subSnap = await getDocs(subQuery).catch(() => null);
          if (subSnap && !subSnap.empty) {
            for (const docItem of subSnap.docs) {
              const res = evaluateDocApproval(docItem.data());
              if (res.isApproved) {
                channelStatus = 'approved';
                userChannelId = docItem.id;
                channelHandle = docItem.data().handle || docItem.data().channelHandle || cleanHandle;
                role = 'creator';
                break;
              } else if (channelStatus === 'none' && res.isPending) {
                channelStatus = 'pending';
                userChannelId = docItem.id;
                role = 'creator';
              }
            }
          }
        }

        // 4. Fallback check legacy doc IDs
        if (channelStatus !== 'approved') {
          const chanDocSnap = await getDoc(doc(db, 'channels', `chan-${fbUser.uid}`)).catch(() => null);
          if (chanDocSnap && chanDocSnap.exists()) {
            const res = evaluateDocApproval(chanDocSnap.data());
            if (res.isApproved) {
              channelStatus = 'approved';
              userChannelId = chanDocSnap.id;
              channelHandle = chanDocSnap.data().handle || cleanHandle;
              role = 'creator';
            }
          } else {
            const chanUidSnap = await getDoc(doc(db, 'channels', fbUser.uid)).catch(() => null);
            if (chanUidSnap && chanUidSnap.exists()) {
              const res = evaluateDocApproval(chanUidSnap.data());
              if (res.isApproved) {
                channelStatus = 'approved';
                userChannelId = chanUidSnap.id;
                channelHandle = chanUidSnap.data().handle || cleanHandle;
                role = 'creator';
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Firestore user sync warning:', e);
    }

    const userAccount: UserAccount = {
      id: fbUser.uid,
      uid: fbUser.uid,
      name: existingUserData?.name || userName,
      email: userEmail,
      avatar: existingUserData?.channelLogoUrl || existingUserData?.avatar || userAvatar,
      role: role,
      channelHandle: role === 'creator' ? channelHandle : undefined,
      channelId: role === 'creator' ? userChannelId : undefined,
      channelStatus: channelStatus,
      isLoggedIn: true,
      memberSince: new Date().getFullYear().toString()
    };

    onLoginSuccess(userAccount);
    onClose();
  };

  const handleAuthError = (err: any) => {
    console.error('Firebase Auth error:', err);
    const code = err?.code || '';
    setErrorCode(code);

    const msg = String(err?.message || '');
    const isMissingState = 
      code === 'auth/missing-initial-state' || 
      msg.includes('missing initial state') || 
      msg.includes('sessionStorage') || 
      msg.includes('storage-partitioned');

    if (code === 'auth/popup-closed-by-user') {
      setErrorMessage(
        language === 'hi'
          ? 'खाता चयन विंडो बंद कर दी गई। कृपया पुनः बटन दबाकर अपनी Gmail चुनें।'
          : 'Sign-in window was closed. Please tap the button again to select your Gmail.'
      );
    } else if (code === 'auth/popup-blocked') {
      setErrorMessage(
        language === 'hi'
          ? 'ब्राउज़र ने पॉपअप ब्लॉक कर दिया है। कृपया नीचे दिए गए बटन से Chrome में खोलें।'
          : 'Popup was blocked. Please tap the button below to open in Chrome.'
      );
    } else if (isMissingState) {
      setErrorCode('auth/missing-initial-state');
      setErrorMessage(
        language === 'hi'
          ? 'वर्तमान WebView में Google पॉपअप ब्लॉक है। Android Studio से बनने वाली असली APK में यह सीधे चलेगा।'
          : 'Google popup restricted in current WebView. It will work natively in the Android Studio APK build.'
      );
    } else {
      setErrorMessage(
        err?.message || (language === 'hi' ? 'लॉगिन में समस्या आई। कृपया पुनः प्रयास करें।' : 'Login failed. Please try again.')
      );
    }
  };

  // Google Sign-In with Native WebToNative Bridge + Popup Fallback
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setErrorCode('');

    try {
      const auth = getAuthSafe();

      // 1. WebToNative Native Social Login Bridge Check (if present)
      const wtn = typeof window !== 'undefined' ? ((window as any).WTN || (window as any).WebToNative) : null;
      if (wtn?.socialLogin?.google?.login) {
        wtn.socialLogin.google.login({
          callback: async (res: any) => {
            try {
              const idToken = res?.idToken || res?.id_token || res?.data?.idToken || res?.token;
              if (idToken) {
                const credential = GoogleAuthProvider.credential(idToken);
                const result = await signInWithCredential(auth, credential);
                await finishUserLogin(result.user);
              } else if (res?.error) {
                handleAuthError(new Error(res.error));
              } else {
                handleAuthError(new Error('WebToNative Google Login did not return an ID token.'));
              }
            } catch (bridgeErr: any) {
              handleAuthError(bridgeErr);
            } finally {
              setIsLoading(false);
            }
          }
        });
        return;
      }

      // 2. Standard Web Sign-In
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, googleProvider);
      await finishUserLogin(result.user);
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 dark:bg-slate-950/90 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-slate-100 transition-colors my-auto">
        {/* Close Button (if dismissible) */}
        {allowClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Logo & Heading */}
        <div className="text-center space-y-2 pt-1">
          <div className="flex justify-center">
            <BundeliLogo size="lg" animated={true} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-bundeli tracking-wide">
              {language === 'hi' ? 'Gmail से लॉगिन करें' : 'Sign in with Google'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 leading-relaxed">
              {language === 'hi' 
                ? 'अपने फोन की Gmail आईडी से एक क्लिक में सुरक्षित लॉगिन करें' 
                : 'One-tap secure sign in with your Google account'}
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-900 dark:text-red-200 text-xs leading-relaxed space-y-1.5 animate-in fade-in">
            <div className="flex items-start gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{language === 'hi' ? 'सूचना:' : 'Notice:'}</span>
            </div>
            <p className="pl-6 text-[11px]">{errorMessage}</p>
          </div>
        )}

        {/* GOOGLE / GMAIL SIGN IN BUTTON */}
        <div className="mt-5 space-y-3.5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-md active:scale-[0.98] disabled:opacity-75 cursor-pointer border-2 border-slate-300 dark:border-slate-700 hover:border-amber-500"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                <span className="text-xs sm:text-sm font-bold">
                  {language === 'hi' ? 'खाते लोड हो रहे हैं...' : 'Loading Google accounts...'}
                </span>
              </span>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.4 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.6 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span className="text-slate-900 font-black text-xs sm:text-sm tracking-wide">
                  {language === 'hi' ? 'Google (Gmail) खाता चुनें' : 'Sign in with Google'}
                </span>
              </>
            )}
          </button>

          {/* Browser fallback helper */}
          {errorCode === 'auth/missing-initial-state' && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-[11px] text-slate-700 dark:text-slate-300 space-y-1.5">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                💡 {language === 'hi' ? 'Chrome ब्राउज़र में टेस्ट करें:' : 'Test in Chrome Browser:'}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open(window.location.href, '_system');
                  }
                }}
                className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <span>{language === 'hi' ? 'Chrome ब्राउज़र में खोलें' : 'Open in Chrome'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{language === 'hi' ? 'सुरक्षित Google एवं Firebase प्रमाणीकरण' : 'Secure Google & Firebase Authentication'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
