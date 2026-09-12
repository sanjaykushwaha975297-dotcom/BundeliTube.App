import React, { useState } from 'react';
import { 
  X, 
  Tv, 
  ShieldCheck, 
  Upload, 
  CreditCard, 
  Building2, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  Lock,
  Sparkles,
  Users,
  Timer,
  Clock,
  Info,
  FileText,
  Trash2,
  Eye,
  UserCheck,
  Image as ImageIcon
} from 'lucide-react';
import { UserAccount, Channel, ChannelSubmission } from '../types';
import { CATEGORIES } from '../data/mockData';
import { Language, translations } from '../locales/i18n';
import { getAuthSafe, getFirestoreSafe, addDoc, collection, doc, setDoc, deleteDoc, updateDoc, serverTimestamp, cleanFirestoreData, updateChannelLogoGlobally } from '../lib/firebase';
import { compressImageFile, AVATAR_COMPRESS_OPTIONS, THUMBNAIL_COMPRESS_OPTIONS } from '../lib/imageCompressor';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserAccount | null;
  onChannelSubmitted: (submission: ChannelSubmission) => void;
  onNavigateToStudio?: () => void;
  onOpenUploadModal?: () => void;
  onOpenPolicies?: (tab?: string) => void;
  language: Language;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onChannelSubmitted,
  onNavigateToStudio,
  onOpenUploadModal,
  onOpenPolicies,
  language
}) => {
  const t = translations[language];
  
  const [channelName, setChannelName] = useState('');
  const [channelCategory, setChannelCategory] = useState<string>('music');
  const [channelLogoPreview, setChannelLogoPreview] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [panCardHolderName, setPanCardHolderName] = useState('');
  const [panPhotoPreview, setPanPhotoPreview] = useState<string>('');
  const [zoomedDocPhoto, setZoomedDocPhoto] = useState<{ url: string; title: string } | null>(null);
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [upiId, setUpiId] = useState('');
  
  const [hasReadAndAgreedPolicies, setHasReadAndAgreedPolicies] = useState(false);
  const [showPolicyQuickView, setShowPolicyQuickView] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fields remain completely clean and empty for the creator to enter fresh details

  if (!isOpen) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, AVATAR_COMPRESS_OPTIONS);
        setChannelLogoPreview(compressed);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setChannelLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePanPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, THUMBNAIL_COMPRESS_OPTIONS);
        setPanPhotoPreview(compressed);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPanPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!channelName.trim()) {
      setErrorMsg(language === 'hi' ? 'कृपया चैनल का नाम दर्ज करें।' : 'Please enter channel name.');
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMsg(language === 'hi' ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    const cleanPanName = panCardHolderName.trim();
    if (!cleanPanName) {
      setErrorMsg(language === 'hi' ? 'कृपया पैन कार्ड पर दर्ज असली नाम (Original Name on PAN Card) दर्ज करें।' : 'Please enter full name exactly as printed on your PAN card.');
      return;
    }

    const cleanPan = panNumber.trim().toUpperCase();
    if (!cleanPan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      setErrorMsg(language === 'hi' ? 'कृपया 10 अक्षरों का वैध पैन कार्ड नंबर दर्ज करें (उदा. ABCDE1234F)।' : 'Please enter a valid 10-character PAN Card number (e.g. ABCDE1234F).');
      return;
    }

    if (!panPhotoPreview) {
      setErrorMsg(language === 'hi' ? 'कृपया पैन कार्ड की ओरिजिनल फोटो अपलोड करें।' : 'Please upload original PAN Card photo.');
      return;
    }

    if (accountNumber && confirmAccountNumber && accountNumber !== confirmAccountNumber) {
      setErrorMsg(language === 'hi' ? 'दोनों खाता संख्याएँ मेल नहीं खाती हैं।' : 'Account numbers do not match.');
      return;
    }

    // Mandatory Policy Verification Check
    if (!hasReadAndAgreedPolicies) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया चैनल सबमिट करने से पहले बुन्देली ट्यूब की सभी नीतियां पढ़ें और सहमति बॉक्स को चेक करें।'
          : 'Please read and agree to all BundeliTube creator, monetization and AdSense/AdMob policies before submitting.'
      );
      return;
    }

    setIsSubmitting(true);

    const generatedHandle = `@${channelName.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_]/gi, '') || 'bundelichannel'}`;
    
    // Meaningful, human-readable channel ID (e.g. BT-CH-PRIYANSH-3119)
    const cleanNameSegment = channelName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8) || 'CREATOR';
    const mobileLast4 = cleanMobile.slice(-4) || (currentUser?.id || '').slice(-4).toUpperCase() || Math.floor(1000 + Math.random() * 9000).toString();
    const cleanChanId = `BT-CH-${cleanNameSegment}-${mobileLast4}`;

    const effectiveUid = currentUser?.id || 'user';
    const effectiveLogo = channelLogoPreview || currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    const submission: ChannelSubmission = {
      id: cleanChanId,
      ownerUid: effectiveUid,
      channelName: channelName.trim(),
      channelHandle: generatedHandle,
      channelAvatar: effectiveLogo,
      channelLogoUrl: effectiveLogo,
      avatarUrl: effectiveLogo,
      logo: effectiveLogo,
      avatar: effectiveLogo,
      category: channelCategory,
      mobileNumber: cleanMobile,
      phone: cleanMobile,
      contactNumber: cleanMobile,
      panCardHolderName: cleanPanName,
      panName: cleanPanName,
      accountHolder: accountHolder.trim() || cleanPanName || currentUser?.name || undefined,
      panNumber: cleanPan,
      panCardNumber: cleanPan,
      documentNumber: cleanPan,
      aadhaarNumber: cleanPan,
      aadhaarUid: cleanPan,
      // PAN and KYC photo aliases to guarantee display in external admin portal
      panPhotoUrl: panPhotoPreview,
      panPhoto: panPhotoPreview,
      panCardPhoto: panPhotoPreview,
      panCardPhotoUrl: panPhotoPreview,
      panFrontPhotoUrl: panPhotoPreview,
      aadhaarPhotoUrl: panPhotoPreview,
      aadhaarFrontPhotoUrl: panPhotoPreview,
      frontPhotoUrl: panPhotoPreview,
      frontPhoto: panPhotoPreview,
      aadhaarBackPhotoUrl: panPhotoPreview,
      backPhotoUrl: panPhotoPreview,
      backPhoto: panPhotoPreview,
      kycPhotoUrl: panPhotoPreview,
      kycPhoto: panPhotoPreview,
      documentPhotoUrl: panPhotoPreview,
      documentUrl: panPhotoPreview,
      bankName: bankName.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      ifscCode: ifscCode.trim().toUpperCase() || undefined,
      branchName: branchName.trim() || undefined,
      upiId: upiId.trim() || undefined,
      status: 'pending',
      approvalStatus: 'pending',
      kycStatus: 'pending',
      partnerProgramStatus: 'applied',
      programType: 'BundeliTube Partner Program (BPP)',
      submittedAt: new Date().toISOString()
    };

    try {
      const db = getFirestoreSafe();
      
      // 1. Submit ONLY to channel_submissions for admin verification!
      // (Do NOT create pending duplicate in channels so external admin website displays exactly ONE card)
      const cleanSubData = cleanFirestoreData({
        ...submission,
        channelAvatar: effectiveLogo,
        channelLogoUrl: effectiveLogo,
        avatarUrl: effectiveLogo,
        serverTimestamp: serverTimestamp()
      });
      await setDoc(doc(db, 'channel_submissions', submission.id), cleanSubData, { merge: true }).catch((err) => {
        console.warn('Firestore channel_submissions write warning:', err);
      });

      // 2. Remove any old unapproved/duplicate pending document in channels collection
      if (effectiveUid && effectiveUid !== 'user') {
        deleteDoc(doc(db, 'channels', `chan-${effectiveUid}`)).catch(() => {});
        deleteDoc(doc(db, 'channels', effectiveUid)).catch(() => {});
        deleteDoc(doc(db, 'channels', submission.id)).catch(() => {});
      }

      // 3. Keep user profile as regular viewer with pending partner program status in users collection
      if (effectiveUid && effectiveUid !== 'user') {
        await setDoc(doc(db, 'users', effectiveUid), cleanFirestoreData({
          role: 'viewer', // Normal user until approved!
          channelStatus: 'pending',
          approvalStatus: 'pending',
          partnerProgramStatus: 'applied',
          channelId: submission.id,
          channelName: submission.channelName,
          channelHandle: submission.channelHandle,
          avatar: effectiveLogo,
          channelLogoUrl: effectiveLogo,
          mobileNumber: submission.mobileNumber,
          updatedAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp()
        }), { merge: true }).catch((err) => {
          console.warn('Firestore users write warning:', err);
        });
      }

      // 4. Propagate logo across user videos in Firestore immediately
      try {
        await updateChannelLogoGlobally(submission.id, effectiveUid, effectiveLogo, submission.channelName);
      } catch (err) {
        console.warn('updateChannelLogoGlobally during creation note:', err);
      }

      onChannelSubmitted(submission);
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err: any) {
      console.warn('Channel write local fallback:', err);
      onChannelSubmitted(submission);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setErrorMsg('');
    setHasReadAndAgreedPolicies(false);
    setShowPolicyQuickView(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-slate-950/90 backdrop-blur-xs p-3 sm:p-6 py-6 sm:py-10 flex items-start justify-center animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-900 dark:text-slate-100 my-auto transition-colors">
        <button
          type="button"
          onClick={resetAndClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-5">
            <div className="w-20 h-20 bg-amber-500/15 text-amber-500 rounded-3xl mx-auto flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <Clock className="w-12 h-12" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-bundeli">
                {language === 'hi' ? '⏳ चैनल आवेदन सबमिट हो गया (Pending Admin Review)' : '⏳ Channel Submitted for Admin Review'}
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                {language === 'hi' ? 'चैनल नाम: ' : 'Channel: '} <strong>{channelName}</strong>
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs max-w-lg mx-auto leading-relaxed text-left space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{language === 'hi' ? 'समीक्षाधीन (Under Admin Verification)' : 'Status: Under Admin Review'}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {language === 'hi'
                  ? 'आपका चैनल आवेदन सफलतापूर्वक प्राप्त हो गया है। एडमिन द्वारा आपके चैनल और विवरण का सत्यापन (Approve) करने के बाद आपका चैनल सक्रिय हो जाएगा और आप वीडियो अपलोड व कमाई शुरू कर सकेंगे।'
                  : 'Your channel submission has been received. Once the Admin reviews and approves your channel KYC, you will be able to upload videos and earn monetization.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Tv className="w-4 h-4 text-slate-950" />
                <span>{language === 'hi' ? 'स्टूडियो स्टेटस देखें (View Studio Status)' : 'View Studio Status'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setErrorMsg('');
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-all border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>{language === 'hi' ? 'होमपेज पर जाएँ' : 'Back to Home'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200 dark:border-slate-800 pr-10">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
                <Tv className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                  <span>{t.createChannel}</span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold">
                    {language === 'hi' ? 'एडमिन अनुमोदन अनिवार्य' : 'Admin Review Required'}
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate sm:whitespace-normal">
                  {language === 'hi' 
                    ? 'बुन्देली ट्यूब पर अपना आधिकारिक क्रिएटर चैनल बनाएं व वीडियो अपलोड करके कमाई शुरू करें'
                    : 'Create your official BundeliTube creator channel and start uploading & earning'}
                </p>
              </div>
            </div>

            {/* Connected Google Account Banner */}
            <div className="mt-3.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={currentUser?.name || 'Creator'}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-amber-400 object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300 truncate">
                    {currentUser?.name || 'बुन्देली क्रिएटर'}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                    {currentUser?.email || 'लॉगिन खाता'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300 dark:border-emerald-500/30 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'ईमेल कनेक्टेड' : 'Connected'}</span>
              </div>
            </div>

            {/* BundeliTube Partner Program Monetization Criteria Card */}
            <div className="mt-3.5 p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-50/30 dark:from-amber-500/10 dark:via-slate-950 dark:to-slate-950 border border-amber-200 dark:border-amber-500/40 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide font-bundeli">
                    Creator Monetize • BundeliTube Partner Program
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shrink-0">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">सब्सक्राइबर्स</span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">500 Subscribe</strong>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <Timer className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">वॉच टाइम</span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">2000 घण्टा</strong>
                  </div>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-3.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-5">
              {/* Section 1: Channel & Identity */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? '1. चैनल जानकारी (Channel Info)' : '1. Channel Info'}</span>
                </h3>

                {/* Channel Logo / Profile Avatar Upload */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={channelLogoPreview || currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt="Channel Logo Preview"
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl sm:rounded-3xl object-cover ring-2 ring-amber-400 shadow-md"
                    />
                    <label className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Upload className="w-5 h-5 text-amber-400 mb-1" />
                      <span className="text-[10px] font-bold">बदलें</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {language === 'hi' ? 'चैनल का लोगो / डीपी फोटो' : 'Channel Logo / Profile Photo'}
                      </p>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        {language === 'hi' ? 'वैकल्पिक' : 'Optional'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      {language === 'hi'
                        ? 'चैनल का लोगो या अपनी डीपी फोटो चुनें (JPG/PNG)। आप इसे बाद में सेटिंग्स से भी बदल सकते हैं।'
                        : 'Upload your channel logo or DP. You can also update it anytime in Settings.'}
                    </p>
                    <div className="pt-1 flex items-center justify-center sm:justify-start">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95">
                        <Upload className="w-4 h-4 stroke-[2.5]" />
                        <span>{language === 'hi' ? 'लोगो फोटो चुनें / बदलें' : 'Choose / Change Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Channel Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.channelName} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. Bundeli Sangeet Club"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Verified Google Email (Read Only) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>{t.verifiedEmail}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        सत्यापित
                      </span>
                    </label>
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={currentUser?.email || ''}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Channel Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'hi' ? 'चैनल की मुख्य श्रेणी *' : 'Primary Category *'}
                    </label>
                    <select
                      value={channelCategory}
                      onChange={(e) => setChannelCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500 font-medium"
                    >
                      {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {language === 'hi' ? cat.hindiName : cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Creator Identity & KYC (PAN Card & Mobile Number) */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{language === 'hi' ? '2. क्रिएटर पहचान व KYC सत्यापन (PAN व मोबाइल)' : '2. Creator KYC & Identity (PAN & Mobile)'}</span>
                  </h3>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 px-2.5 py-0.5 rounded-full font-bold">
                    {language === 'hi' ? '🔒 सभी विवरण अनिवार्य हैं *' : '🔒 All Fields Mandatory *'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
                  
                  {/* Active Mobile Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-500" />
                        <span>{language === 'hi' ? 'सक्रिय मोबाइल नंबर (Active Mobile Number)' : 'Active Mobile Number'} <strong className="text-rose-500">*</strong></span>
                      </span>
                      <span className={`text-[10px] font-bold ${mobileNumber.replace(/\D/g, '').length === 10 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {mobileNumber.replace(/\D/g, '').length === 10 ? (language === 'hi' ? '✓ 10 अंक पूर्ण' : '✓ 10 digits') : (language === 'hi' ? '10 अंक अनिवार्य *' : '10 digits required *')}
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 select-none">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="98XXXXXXXX"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                        className="w-full pl-12 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:border-amber-500 tracking-wider"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                      {language === 'hi' ? '🔒 चैनल सुरक्षा, एडमिन संपर्क व पेआउट सत्यापन हेतु 10 अंकों का मोबाइल नंबर दर्ज करें।' : 'Enter 10-digit mobile number for channel security, verification and payouts.'}
                    </span>
                  </div>

                  {/* Full Name on PAN Card */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          {language === 'hi' ? 'पैन कार्ड पर दर्ज असली नाम (Original Name on PAN Card)' : 'Original Name on PAN Card'} <strong className="text-rose-500">*</strong>
                        </span>
                      </span>
                      <span className={`text-[10px] font-bold ${panCardHolderName.trim() ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {panCardHolderName.trim() ? (language === 'hi' ? '✓ दर्ज' : '✓ Entered') : (language === 'hi' ? 'अनिवार्य *' : 'Required *')}
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'hi' ? 'उदा. आपका पूरा नाम' : 'e.g. FULL NAME AS PER PAN'}
                      value={panCardHolderName}
                      onChange={(e) => setPanCardHolderName(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-400/60 dark:border-amber-500/50 text-slate-900 dark:text-slate-100 text-xs font-bold uppercase focus:outline-none focus:border-amber-500 tracking-wide"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                      {language === 'hi' 
                        ? '⚠️ क्रिएटर का वही असली नाम डालें जो ओरिजिनल पैन कार्ड पर लिखा है। एडमिन इसी नाम से आपका पेआउट जारी करेगा।'
                        : 'Enter creator name exactly as printed on original PAN card. Admin uses this to verify identity and release payouts.'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* PAN Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t.panNumber || 'पैन कार्ड नंबर (PAN No.)'} <strong className="text-rose-500">*</strong></span>
                        </span>
                        <span className={`text-[10px] font-bold ${/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber) ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber) ? '✓ मान्य' : (language === 'hi' ? '10 अक्षर अनिवार्य *' : '10 chars required *')}
                        </span>
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="ABCDE1234F"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs font-mono uppercase focus:outline-none focus:border-amber-500 tracking-wider"
                      />
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                        {language === 'hi' ? '10 अक्षरों का अल्फान्यूमेरिक पैन नंबर (उदा. ABCDE1234F)' : '10-character alphanumeric PAN (e.g. ABCDE1234F)'}
                      </span>
                    </div>

                    {/* PAN Photo */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                        <span>{t.panPhoto || 'पैन कार्ड की ओरिजिनल फोटो'} <strong className="text-rose-500">*</strong></span>
                        {panPhotoPreview ? (
                          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> {language === 'hi' ? 'अपलोड' : 'Uploaded'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-500 font-bold">
                            {language === 'hi' ? 'अनिवार्य *' : 'Required *'}
                          </span>
                        )}
                      </label>
                      {panPhotoPreview ? (
                        <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <img src={panPhotoPreview} alt="PAN Preview" className="w-14 h-11 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                              {language === 'hi' ? 'पैन कार्ड फोटो' : 'PAN Card Photo'}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <button
                                type="button"
                                onClick={() => setZoomedDocPhoto({ url: panPhotoPreview, title: language === 'hi' ? 'पैन कार्ड फोटो' : 'PAN Card Photo' })}
                                className="text-[10px] text-amber-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> <span>{language === 'hi' ? 'देखें' : 'View'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setPanPhotoPreview('')}
                                className="text-[10px] text-rose-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" /> <span>{language === 'hi' ? 'हटाएं' : 'Remove'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 h-11 px-3 py-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer text-center bg-white dark:bg-slate-900">
                          <Upload className="w-4 h-4 text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {language === 'hi' ? 'पैन फोटो चुनें' : 'Upload PAN Photo'}
                          </span>
                          <input type="file" accept="image/*" onChange={handlePanPhotoUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Optional KYC & Bank */}
              <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? '3. बैंक खाता व पेआउट (वैकल्पिक - बाद में भी भर सकते हैं)' : '3. Bank & Payout (Optional)'}</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-full">
                    {language === 'hi' ? 'बाद में माय वॉलेट से भी अपडेट कर सकते हैं' : 'Can update anytime'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Account Holder Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.accountHolder}
                    </label>
                    <input
                      type="text"
                      placeholder="पासबुक के अनुसार नाम"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.bankName}
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. State Bank of India"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Account Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.accountNumber}
                    </label>
                    <input
                      type="text"
                      placeholder="खाता संख्या"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Confirm Account Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.confirmAccountNumber}
                    </label>
                    <input
                      type="text"
                      placeholder="खाता संख्या दोबारा दर्ज करें"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* IFSC Code */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.ifscCode}
                    </label>
                    <input
                      type="text"
                      placeholder="SBIN000XXXX"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* UPI ID (Optional) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.upiId} (UPI ID)
                    </label>
                    <input
                      type="text"
                      placeholder="username@upi या mobile@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Mandatory Policies & Monetization Agreement */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-amber-500" />
                        <span>
                          {language === 'hi'
                            ? 'नीतियां, मुद्रीकरण व AdSense/AdMob सहमति (अनिवार्य)'
                            : 'Policies, Monetization & AdSense/AdMob Agreement (Mandatory)'}
                        </span>
                      </h4>
                      <span className="text-[11px] text-slate-500 block">
                        {language === 'hi'
                          ? 'चैनल सबमिट करने से पहले इन सभी नीतियों को पढ़ना और स्वीकार करना अनिवार्य है।'
                          : 'Read and accept all compliance policies before final channel submission.'}
                      </span>
                    </div>
                  </div>

                  {onOpenPolicies && (
                    <button
                      type="button"
                      onClick={() => onOpenPolicies('bundelitube')}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:underline flex items-center gap-1 shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'संपूर्ण नीतियां पढ़ें (Policy Center) ↗' : 'Read Full Policies ↗'}</span>
                    </button>
                  )}
                </div>

                {/* Key Policies 4-Card Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-[11px] space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>50% - 50% रेवेन्यू शेयर</span>
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      AdSense व AdMob की शुद्ध कमाई का 50% हिस्सा क्रिएटर के वॉलेट में सीधे जमा होता है।
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-[11px] space-y-1">
                    <span className="font-bold text-amber-600 dark:text-amber-400 block flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>न्यूनतम निकासी ₹5,000 (1 से 5 तारीख)</span>
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      निकासी केवल ₹5,000 बैलेंस पर हर महीने की 1 से 5 तारीख को एडमिन द्वारा अनलॉक होने पर ही होगी।
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-[11px] space-y-1">
                    <span className="font-bold text-rose-600 dark:text-rose-400 block flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>AdSense/AdMob अवैध क्लिक प्रतिबंध</span>
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      स्वयं के वीडियो पर विज्ञापन देखना या क्लिक करवाना सख्त मना है। उल्लंघन पर चैनल स्थायी बंद होगा।
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-[11px] space-y-1">
                    <span className="font-bold text-blue-600 dark:text-blue-400 block flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>मूल बुंदेली सामग्री व कॉपीराइट</span>
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      केवल अपनी स्वयं की मूल लोककला, संगीत व वीडियो डालें। अनधिकृत कंटेंट पर कॉपीराइट स्ट्राइक होगी।
                    </p>
                  </div>
                </div>

                {/* Toggle Quick Detailed View */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPolicyQuickView(!showPolicyQuickView)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 underline"
                  >
                    <span>{showPolicyQuickView ? (language === 'hi' ? 'संक्षिप्त विवरण छिपाएं ▲' : 'Hide details ▲') : (language === 'hi' ? 'नियम व शर्तें विस्तार से पढ़ें ▼' : 'Read rules in detail ▼')}</span>
                  </button>

                  {showPolicyQuickView && (
                    <div className="mt-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                      <p><strong>1. मुद्रीकरण व भुगतान:</strong> क्रिएटर को विज्ञापनों से प्राप्त शुद्ध आय का 50% प्रदान किया जाएगा। शेष 50% प्लेटफ़ॉर्म सर्वर, वीडियो स्ट्रीमिंग CDN और रखरखाव के लिए उपयोग होता है।</p>
                      <p><strong>2. निकासी नियम:</strong> न्यूनतम निकासी राशि ₹5,000 है। निकासी विंडो प्रत्येक माह की 1 से 5 तारीख तक एडमिन नियंत्रण में सक्रिय रहती है। 6 तारीख को विंडो बंद हो जाती है।</p>
                      <p><strong>3. Google AdSense / AdMob अनुपालन:</strong> विज्ञापन कोड में कोई छेड़छाड़, बॉट ट्रैफ़िक, क्लिक रिंग या फ़र्ज़ी व्यूज पकड़े जाने पर Google नियमों के तहत तत्काल प्रभाव से बिना नोटिस चैनल ब्लैकलिस्ट किया जाएगा।</p>
                      <p><strong>4. सुरक्षा व कानूनी अनुपालन:</strong> भारतीय आईटी नियम 2021 और डिजिटल मीडिया आचार संहिता का पालन अनिवार्य है।</p>
                    </div>
                  )}
                </div>

                {/* Mandatory Agreement Checkbox */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="agree-policies-checkbox"
                      checked={hasReadAndAgreedPolicies}
                      onChange={(e) => {
                        setHasReadAndAgreedPolicies(e.target.checked);
                        if (e.target.checked) setErrorMsg('');
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 dark:border-slate-700 shrink-0 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug block">
                        {language === 'hi'
                          ? 'मैंने बुन्देली ट्यूब की 50-50 कमाई नीति, Google AdSense व AdMob अमान्य क्लिक नियम, ₹5,000 न्यूनतम निकासी (1 से 5 तारीख) और सभी नियम व शर्तें ध्यानपूर्वक पढ़ ली हैं और मैं इनसे पूर्णतः सहमत हूँ। *'
                          : 'I have read and fully agree to the BundeliTube 50/50 Monetization Policy, AdSense/AdMob Invalid Traffic Rules, ₹5,000 Minimum Payout (1st-5th), and all Terms of Service. *'}
                      </span>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">
                        {language === 'hi'
                          ? '✓ इस बॉक्स को टिक करने के बाद ही फाइनल सबमिशन बटन सक्रिय होगा।'
                          : '✓ Checking this box is required to enable the final submission button.'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Security Notice */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  {language === 'hi'
                    ? 'चैनल आवेदन एडमिन सत्यापन के बाद स्वीकृत होगा और आपका क्रिएटर स्टूडियो एक्टिवेट हो जाएगा।'
                    : 'Your channel application will be activated upon Admin verification.'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !hasReadAndAgreedPolicies}
                  title={!hasReadAndAgreedPolicies ? (language === 'hi' ? 'कृपया पहले सभी नीतियां पढ़ें और सहमति दें' : 'Please read and agree to all policies first') : ''}
                  className="px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? (language === 'hi' ? 'चैनल सबमिट हो रहा है...' : 'Submitting Channel...') 
                      : (language === 'hi' ? 'सहमति के साथ चैनल सबमिट करें (+)' : 'Agree & Submit Channel (+)')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Zoomed Document Photo Modal */}
      {zoomedDocPhoto && (
        <div 
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomedDocPhoto(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80">
              <span className="text-xs font-bold text-slate-200">{zoomedDocPhoto.title}</span>
              <button
                type="button"
                onClick={() => setZoomedDocPhoto(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-950 flex-1 overflow-auto">
              <img 
                src={zoomedDocPhoto.url} 
                alt={zoomedDocPhoto.title} 
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
