import React, { useState } from 'react';
import { 
  X, 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Unlock,
  ShieldAlert,
  CreditCard, 
  Building2, 
  Smartphone, 
  Info,
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { CreatorWallet, Channel, UserAccount, RemoteAppConfig } from '../types';
import { Language, translations } from '../locales/i18n';
import { getFirestoreSafe, addDoc, collection, doc, setDoc, serverTimestamp, cleanFirestoreData } from '../lib/firebase';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: CreatorWallet;
  channel: Channel;
  currentUser: UserAccount;
  onWithdrawalRequested: (amount: number, method: 'UPI' | 'Bank Transfer', target: string) => void;
  onOpenPolicies?: (tab?: string) => void;
  language: Language;
  remoteConfig?: RemoteAppConfig;
  onUpdateRemoteConfig?: (updated: Partial<RemoteAppConfig>) => Promise<void> | void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
  channel,
  currentUser,
  onWithdrawalRequested,
  onOpenPolicies,
  language,
  remoteConfig,
  onUpdateRemoteConfig
}) => {
  const t = translations[language];

  // Admin detection
  const isAdmin = 
    currentUser.role === 'admin' || 
    currentUser.email === 'bundelitubeapp@gmail.com' ||
    currentUser.email === 'bundelitubeapp.@gmail.com' ||
    currentUser.email === 'admin@bundelitube.com';

  // Withdrawal window rule: strictly 1st to 5th of every month
  const today = new Date();
  const currentDay = today.getDate();
  const isDateInSchedule = currentDay >= 1 && currentDay <= 5;

  // Firebase Remote Config: manual admin unlock state
  const isUnlockedByAdmin = remoteConfig?.isWithdrawalWindowUnlocked === true;

  // Operational window: active ONLY if Admin unlocked it AND today is within 1st - 5th
  const isWindowActive = isUnlockedByAdmin && isDateInSchedule;

  const minLimit = remoteConfig?.withdrawalMinAmount || wallet.minWithdrawalLimit || 5000;
  const hasEnoughBalance = wallet.currentBalance >= minLimit;
  const isEligibleForWithdrawal = hasEnoughBalance && isWindowActive;

  const [withdrawAmount, setWithdrawAmount] = useState<string>(String(minLimit));
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'Bank Transfer'>('Bank Transfer');
  const [upiId, setUpiId] = useState(channel.bankDetails?.upiId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Admin lock toggling state
  const [isTogglingLock, setIsTogglingLock] = useState(false);
  const [adminStatusMsg, setAdminStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleToggleAdminLock = async (forceUnlock?: boolean) => {
    setIsTogglingLock(true);
    setAdminStatusMsg('');
    const nextState = forceUnlock !== undefined ? forceUnlock : !isUnlockedByAdmin;
    try {
      if (onUpdateRemoteConfig) {
        await onUpdateRemoteConfig({
          isWithdrawalWindowUnlocked: nextState,
          withdrawalLastToggledBy: currentUser.email || currentUser.name || 'Admin',
          withdrawalLastToggledAt: new Date().toISOString()
        });
      } else {
        const db = getFirestoreSafe();
        if (db) {
          await setDoc(doc(db, 'config', 'app_config'), {
            isWithdrawalWindowUnlocked: nextState,
            withdrawalLastToggledBy: currentUser.email || currentUser.name || 'Admin',
            withdrawalLastToggledAt: new Date().toISOString()
          }, { merge: true });
        }
      }
      setAdminStatusMsg(
        nextState 
          ? (language === 'hi' ? '✓ निकासी विंडो सफलतापूर्वक अनलॉक (खुल गई)!' : '✓ Withdrawal window unlocked successfully!')
          : (language === 'hi' ? '✓ निकासी विंडो सफलतापूर्वक लॉक (बंद) कर दी गई!' : '✓ Withdrawal window locked successfully!')
      );
      setTimeout(() => setAdminStatusMsg(''), 4000);
    } catch (err) {
      console.warn('Failed to update remote config lock status:', err);
    } finally {
      setIsTogglingLock(false);
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isUnlockedByAdmin) {
      setErrorMsg(language === 'hi'
        ? 'निकासी विंडो व्यवस्थापक द्वारा लॉक है। व्यवस्थापक द्वारा अनलॉक किए जाने पर ही निकासी संभव है।'
        : 'Withdrawal window is currently locked by Admin. It opens when unlocked by the admin.');
      return;
    }

    if (!isDateInSchedule) {
      setErrorMsg(language === 'hi' 
        ? 'निकासी विंडो बंद है। निकासी अनुरोध केवल प्रत्येक माह की 1 से 5 तारीख के बीच ही किए जा सकते हैं।' 
        : 'Withdrawal window is closed. Requests are accepted only between 1st and 5th of each month.');
      return;
    }

    const numAmount = parseFloat(withdrawAmount);
    if (isNaN(numAmount) || numAmount < minLimit) {
      setErrorMsg(language === 'hi' 
        ? `न्यूनतम निकासी राशि ₹${minLimit.toLocaleString('en-IN')} होनी चाहिए।` 
        : `Minimum withdrawal amount is ₹${minLimit.toLocaleString('en-IN')}.`);
      return;
    }

    if (numAmount > wallet.currentBalance) {
      setErrorMsg(language === 'hi' 
        ? 'निकासी राशि वर्तमान वॉलेट शेष से अधिक नहीं हो सकती।' 
        : 'Withdrawal amount exceeds available wallet balance.');
      return;
    }

    const targetAccount = payoutMethod === 'UPI' 
      ? (upiId.trim() || channel.bankDetails?.upiId || 'UPI Account')
      : `${channel.bankDetails?.bankName || 'Bank'} A/C ****${channel.bankDetails?.accountNumber?.slice(-4) || 'XXXX'}`;

    setIsSubmitting(true);

    try {
      const db = getFirestoreSafe();
      const payoutDoc = cleanFirestoreData({
        creatorUid: currentUser.id || 'user',
        creatorName: currentUser.name || '',
        channelName: channel.name || '',
        amount: numAmount,
        paymentMethod: payoutMethod,
        upiId: payoutMethod === 'UPI' ? upiId.trim() : '',
        targetAccount: targetAccount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      });
      await addDoc(collection(db, 'payout_requests'), payoutDoc);
      await addDoc(collection(db, 'withdrawals'), payoutDoc);
    } catch (err) {
      console.error('Firestore payout write error:', err);
    } finally {
      onWithdrawalRequested(numAmount, payoutMethod, targetAccount);
      setIsSubmitting(false);
      setRequestSuccess(true);
    }
  };

  const resetAndClose = () => {
    setRequestSuccess(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-slate-100 my-8 max-h-[90vh] overflow-y-auto transition-colors">
        <button
          onClick={resetAndClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {requestSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'hi' ? 'निकासी अनुरोध दर्ज हुआ!' : 'Withdrawal Request Submitted!'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {language === 'hi'
                ? `₹${parseFloat(withdrawAmount).toLocaleString('en-IN')} का निकासी अनुरोध व्यवस्थापक पेआउट डेस्क को भेज दिया गया है। 24-48 व्यावसायिक घंटों में राशि आपके खाते में क्रेडिट होगी।`
                : `Your withdrawal request of ₹${parseFloat(withdrawAmount).toLocaleString('en-IN')} is submitted for processing. Funds will be credited within 24-48 business hours.`}
            </p>
            <div className="pt-4">
              <button
                onClick={resetAndClose}
                className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 shrink-0">
                <IndianRupee className="w-7 h-7 text-slate-950" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{t.walletTitle}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                    {language === 'hi' ? 'सत्यापित क्रिएटर' : 'Verified Creator'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {channel.name} • {t.privacyNote}
                </p>
              </div>
            </div>

            {/* Admin Manual Payout Control Panel */}
            {isAdmin && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-purple-500/15 border-2 border-amber-500/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-amber-500 uppercase tracking-wider block">
                        एडमिन पेआउट कंट्रोल (Firebase Manual Control)
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Firebase doc: <code>config/app_config.isWithdrawalWindowUnlocked</code>
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${
                    isUnlockedByAdmin 
                      ? 'bg-emerald-500 text-slate-950 animate-pulse' 
                      : 'bg-rose-500 text-white'
                  }`}>
                    {isUnlockedByAdmin ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>🔓 UNLOCKED (विंडो खुली है)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>🔒 LOCKED (विंडो बंद है)</span>
                      </>
                    )}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'hi'
                    ? '💡 एडमिन निर्देश: हर महीने की 1 तारीख को यहाँ से "विंडो अनलॉक करें" (या Firebase Console में जाकर True करें)। 6 तारीख को यहाँ से "विंडो लॉक करें" (False) कर दें। क्रिएटर्स केवल 1 से 5 तारीख के मध्य ही निकासी कर सकते हैं।'
                    : '💡 Admin Notice: Unlock the window on the 1st of each month and lock it back on the 6th. Creators can submit withdrawals strictly between 1st and 5th.'}
                </p>

                {adminStatusMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{adminStatusMsg}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleToggleAdminLock(!isUnlockedByAdmin)}
                    disabled={isTogglingLock}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 ${
                      isUnlockedByAdmin
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    }`}
                  >
                    {isTogglingLock ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>अपडेट हो रहा है...</span>
                      </>
                    ) : isUnlockedByAdmin ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>🔒 6 तारीख: विंडो तुरंत लॉक करें (Lock Payouts)</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>🔓 1 तारीख: विंडो तुरंत अनलॉक करें (Open Payouts)</span>
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isUnlockedByAdmin
                      ? 'वर्तमान स्थिति: क्रिएटर्स के लिए विंडो खुली है (1-5 तारीख अनुपालन)'
                      : 'वर्तमान स्थिति: क्रिएटर्स के लिए निकासी फॉर्म पूरी तरह लॉक है'}
                  </span>
                </div>
              </div>
            )}

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
              {/* Current Balance */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 border border-emerald-300 dark:border-emerald-500/30 shadow-xs">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  {t.currentBalance}
                </span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-300 mt-1 flex items-center gap-1 font-mono">
                  <span>₹{wallet.currentBalance.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  न्यूनतम निकासी सीमा ₹{minLimit.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Lifetime Earnings */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  {t.totalEarnings}
                </span>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-1 font-mono">
                  <span>₹{wallet.lifetimeEarnings.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {language === 'hi' ? '50% विज्ञापन राजस्व हिस्सा' : '50% Ad Revenue Share'}
                </span>
              </div>

              {/* Total Withdrawn */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  {t.totalWithdrawn}
                </span>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-1 font-mono">
                  <span>₹{wallet.totalWithdrawn.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                  {language === 'hi' ? 'सफलतापूर्वक क्रेडिट' : 'Settled payouts'}
                </span>
              </div>
            </div>

            {/* Monetization Rules Breakdown */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                {language === 'hi' ? '50-50 मुद्रीकरण व भुगतान नीतियां (Policies)' : '50/50 Monetization & Payout Rules'}
              </span>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{language === 'hi' ? '50% - 50% रेवेन्यू शेयर: AdSense व AdMob शुद्ध विज्ञापन आय का आधा क्रिएटर को।' : '50/50 Revenue Split: Half of verified net ad income goes directly to creator.'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{language === 'hi' ? 'न्यूनतम निकासी सीमा ₹5,000 है (बैंक या UPI द्वारा)।' : 'Minimum payout threshold is ₹5,000 via Bank Transfer or UPI.'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{language === 'hi' ? 'निकासी विंडो: प्रत्येक माह 1 से 5 तारीख तक, एडमिन द्वारा मैन्युअल नियंत्रण में।' : 'Payout Window: 1st to 5th of every month, manually controlled by Admin.'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>{language === 'hi' ? 'पारदर्शी पेआउट: सभी विज्ञापन व वीडियो कमाई सीधे एडमिन पैनल द्वारा जाँची जाकर आपके वॉलेट में जोड़ी जाती है।' : 'Transparent Payout: All ad & video revenue is verified and credited directly to your wallet via the Admin Panel.'}</span>
                </li>
              </ul>
              {onOpenPolicies && (
                <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenPolicies('bundelitube')}
                    className="text-[11px] font-bold text-amber-500 hover:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{language === 'hi' ? 'विस्तृत 50-50 अर्निंग नीति व AdSense नियम पढ़ें →' : 'Read Full 50/50 Monetization Policy →'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Withdrawal Window Status Banner */}
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-900 border border-amber-200 dark:border-amber-500/30 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-bold text-xs text-amber-800 dark:text-amber-300">
                    {language === 'hi' ? 'मासिक निकासी विंडो (1 से 5 तारीख • एडमिन नियंत्रण)' : 'Monthly Payout Window (1st - 5th • Admin Controlled)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isWindowActive 
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' 
                      : !isUnlockedByAdmin
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30'
                      : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30'
                  }`}>
                    {isWindowActive 
                      ? (language === 'hi' ? '🔓 विंडो खुली है (सक्रिय)' : 'Window Open (Active)')
                      : !isUnlockedByAdmin
                      ? (language === 'hi' ? '🔒 एडमिन द्वारा लॉक (बंद)' : 'Admin Locked')
                      : (language === 'hi' ? '📅 1 से 5 तारीख को खुलेगी' : 'Opens 1st-5th')}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                {isWindowActive ? (
                  language === 'hi'
                    ? '✓ निकासी विंडो सक्रिय है! व्यवस्थापक द्वारा यह विंडो अनलॉक है और वर्तमान तारीख 1 से 5 के मध्य है। यदि आपका बैलेंस ₹5,000 या अधिक है, तो आप निकासी सबमिट कर सकते हैं।'
                    : '✓ Withdrawal window is active! Unlocked by admin and date is within 1st-5th. You can request payouts if balance is ₹5,000 or above.'
                ) : !isUnlockedByAdmin ? (
                  language === 'hi'
                    ? '⚠️ निकासी विंडो वर्तमान में व्यवस्थापक द्वारा लॉक (बंद) है। 1 तारीख को व्यवस्थापक द्वारा मैन्युअल रूप से अनलॉक किए जाने पर ही निकासी स्वीकार होगी।'
                    : '⚠️ Withdrawal window is currently locked by the admin. It opens when unlocked by the admin on the 1st of the month.'
                ) : (
                  language === 'hi'
                    ? '⚠️ निकासी केवल प्रत्येक माह की 1 से 5 तारीख के बीच ही मान्य है। वर्तमान में तारीख 1-5 के बाहर है।'
                    : '⚠️ Payout requests are valid strictly between the 1st and 5th of each month.'
                )}
              </p>
            </div>

            {/* Withdrawal Section */}
            <div className="mt-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>{t.withdrawFunds}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isEligibleForWithdrawal ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
                }`}>
                  {!hasEnoughBalance
                    ? (language === 'hi' ? `न्यूनतम शेष शेष नहीं (₹${minLimit.toLocaleString('en-IN')} आवश्यक)` : `Below ₹${minLimit} Limit`)
                    : !isUnlockedByAdmin
                    ? (language === 'hi' ? '🔒 एडमिन लॉक' : 'Admin Locked')
                    : !isDateInSchedule
                    ? (language === 'hi' ? 'विंडो बंद (1-5 तारीख)' : 'Closed (1st-5th)')
                    : (language === 'hi' ? 'निकासी योग्य' : 'Eligible')}
                </span>
              </h3>

              {!isWindowActive && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {!isUnlockedByAdmin
                      ? (language === 'hi'
                          ? '⚠️ निकासी विंडो अभी व्यवस्थापक द्वारा लॉक है। 1 से 5 तारीख के बीच एडमिन द्वारा अनलॉक होने पर ही फॉर्म खुलेगा।'
                          : '⚠️ Withdrawal window is locked by Admin. It unlocks during the 1st to 5th monthly cycle.')
                      : (language === 'hi'
                          ? '⚠️ आज की तारीख 1 से 5 के बाहर है। निकासी अनुरोध केवल माह की 1 से 5 तारीख के मध्य ही स्वीकार किए जाते हैं।'
                          : '⚠️ Today is outside the 1st-5th payout date cycle.')}
                  </span>
                </div>
              )}

              {errorMsg && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleWithdrawalSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'hi' ? `निकासी राशि (न्यूनतम ₹${minLimit.toLocaleString('en-IN')}) *` : `Withdrawal Amount (Min ₹${minLimit}) *`}
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min={minLimit}
                        max={wallet.currentBalance}
                        required
                        disabled={!isEligibleForWithdrawal}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'hi' ? 'भुगतान विधि' : 'Payout Method'}
                    </label>
                    <select
                      disabled={!isEligibleForWithdrawal}
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="Bank Transfer">
                        {language === 'hi' ? `बैंक ट्रांसफर (${channel.bankDetails?.bankName || 'Verified Bank'})` : 'Bank Transfer'}
                      </option>
                      <option value="UPI">
                        {language === 'hi' ? 'UPI (Google Pay / PhonePe / Paytm)' : 'UPI Transfer'}
                      </option>
                    </select>
                  </div>
                </div>

                {payoutMethod === 'UPI' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'hi' ? 'UPI ID' : 'UPI ID'}
                    </label>
                    <input
                      type="text"
                      placeholder="name@okaxis / 98XXXXXXXX@paytm"
                      value={upiId}
                      disabled={!isEligibleForWithdrawal}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <p className="text-[11px] text-slate-500">
                    {language === 'hi'
                      ? `न्यूनतम निकासी ₹${minLimit.toLocaleString('en-IN')} है • विंडो: 1 से 5 तारीख (एडमिन अधिकृत)`
                      : `Minimum withdrawal is ₹${minLimit} • Window: 1st to 5th (Admin Authorized)`}
                  </p>
                  <button
                    type="submit"
                    disabled={!isEligibleForWithdrawal || isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {!isWindowActive ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? 'विंडो लॉक है' : 'Window Locked'}</span>
                      </>
                    ) : (
                      <>
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? t.submitting : t.withdrawFunds}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Recent Transactions List */}
            <div className="mt-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t.recentTransactions}
              </h3>

              <div className="space-y-2">
                {wallet.transactions && wallet.transactions.length > 0 ? (
                  wallet.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.type === 'withdrawal' 
                            ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' 
                            : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        }`}>
                          {tx.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{tx.note || tx.targetAccount}</p>
                          <p className="text-[10px] text-slate-500">{tx.date} • {tx.refId}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono font-bold ${
                          tx.type === 'withdrawal' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {tx.type === 'withdrawal' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400/80 uppercase font-semibold">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                    {language === 'hi' ? 'अभी कोई हालिया लेनदेन नहीं है' : 'No recent transactions yet'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
