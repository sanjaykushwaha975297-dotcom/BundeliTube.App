import React, { useState, useEffect, useRef } from 'react';
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
import { 
  getFirestoreSafe, 
  addDoc, 
  collection, 
  doc, 
  getDoc,
  getDocs,
  query,
  where,
  limit,
  setDoc, 
  serverTimestamp, 
  cleanFirestoreData
} from '../lib/firebase';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: CreatorWallet;
  channel: Channel;
  currentUser: UserAccount;
  onWithdrawalRequested: (amount: number, method: 'UPI' | 'Bank Transfer', target: string, requestId?: string, newTx?: any) => void;
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

  // ✅ रिमोट स्विच का सीधा पालन करें (रिमोट स्विच ही अंतिम निर्णय लेता है, स्थानीय तारीख से लॉक नहीं होगा):
  // bool isUnlocked = config['isWithdrawalWindowUnlocked'] == true || 
  //                   config['withdrawalPageLocked'] == false;
  const isUnlocked = remoteConfig?.isWithdrawalWindowUnlocked === true || remoteConfig?.withdrawalPageLocked === false;
  const isWindowActive = isUnlocked;

  const minLimit = remoteConfig?.withdrawalMinAmount || wallet.minWithdrawalLimit || 5000;
  const hasEnoughBalance = wallet.currentBalance >= minLimit;
  const isEligibleForWithdrawal = hasEnoughBalance && isUnlocked;

  const [withdrawAmount, setWithdrawAmount] = useState<string>(String(minLimit));
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'Bank Transfer'>('Bank Transfer');
  const [upiId, setUpiId] = useState(channel.bankDetails?.upiId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const lastSubmitTimeRef = useRef(0);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // ✅ Live verified bank details from channel submission / channels in Firestore
  const [bankInfo, setBankInfo] = useState<{
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    accountHolder: string;
    branchName: string;
    upiId: string;
    mobileNumber: string;
    panNumber: string;
    panCardHolderName: string;
  }>(() => {
    const b = channel.bankDetails || ({} as any);
    let cachedSub: any = {};
    try {
      if (currentUser.id) {
        const savedBank = JSON.parse(localStorage.getItem(`bt_bank_details_${currentUser.id}`) || 'null');
        if (savedBank && (savedBank.accountNumber || savedBank.upiId)) {
          cachedSub = { ...savedBank };
        }
      }
      if (!cachedSub.accountNumber) {
        const genericBank = JSON.parse(localStorage.getItem('bt_bank_details') || 'null');
        if (genericBank && (genericBank.accountNumber || genericBank.upiId)) {
          cachedSub = { ...cachedSub, ...genericBank };
        }
      }
      const subs = JSON.parse(localStorage.getItem('bt_channel_submissions') || '[]');
      if (Array.isArray(subs) && subs.length > 0) {
        const found = subs.find((s: any) => s.ownerUid === currentUser.id || s.id === channel.id || s.channelName === channel.name);
        if (found) cachedSub = { ...found, ...cachedSub };
      }
      if (!cachedSub.accountNumber) {
        const ch = JSON.parse(localStorage.getItem('bt_channel') || '{}');
        if (ch.bankDetails) cachedSub = { ...cachedSub, ...ch.bankDetails };
      }
    } catch (_) {}

    return {
      accountNumber: b.accountNumber || cachedSub.accountNumber || '',
      bankName: b.bankName || cachedSub.bankName || '',
      ifscCode: b.ifscCode || cachedSub.ifscCode || '',
      accountHolder: b.accountHolder || cachedSub.accountHolder || cachedSub.panCardHolderName || currentUser.name || '',
      branchName: b.branchName || cachedSub.branchName || '',
      upiId: b.upiId || cachedSub.upiId || '',
      mobileNumber: cachedSub.mobileNumber || channel.mobileNumber || currentUser.phone || '',
      panNumber: cachedSub.panNumber || channel.panNumber || '',
      panCardHolderName: cachedSub.panCardHolderName || channel.panCardHolderName || ''
    };
  });

  // Fetch verified channel bank details directly from Firestore on open
  useEffect(() => {
    if (!isOpen) return;

    // Reset submission & success states when opened so previous rejections/submissions don't block new ones
    setIsSubmitting(false);
    isSubmittingRef.current = false;
    setRequestSuccess(false);
    setErrorMsg('');

    let isMounted = true;
    const fetchLatestBankDetails = async () => {
      try {
        const db = getFirestoreSafe();
        let subData: any = null;

        // 1. Check channel_submissions by channel.id
        if (channel.id) {
          const subDoc = await getDoc(doc(db, 'channel_submissions', channel.id)).catch(() => null);
          if (subDoc?.exists()) {
            subData = subDoc.data();
          }
        }

        // 2. Check channel_submissions by ownerUid
        if (!subData && currentUser.id) {
          const q = query(
            collection(db, 'channel_submissions'),
            where('ownerUid', '==', currentUser.id),
            limit(1)
          );
          const snap = await getDocs(q).catch(() => null);
          if (snap && !snap.empty) {
            subData = snap.docs[0].data();
          }
        }

        // 3. Check channels collection
        let chanData: any = null;
        if (channel.id) {
          const cDoc = await getDoc(doc(db, 'channels', channel.id)).catch(() => null);
          if (cDoc?.exists()) {
            chanData = cDoc.data();
          }
        }

        // 4. Check users collection
        let userData: any = null;
        if (currentUser.id && currentUser.id !== 'user') {
          const uDoc = await getDoc(doc(db, 'users', currentUser.id)).catch(() => null);
          if (uDoc?.exists()) {
            userData = uDoc.data();
          }
        }

        if (!isMounted) return;

        setBankInfo(prev => {
          const mergedAcc = 
            subData?.accountNumber || 
            subData?.bankDetails?.accountNumber || 
            chanData?.bankDetails?.accountNumber || 
            chanData?.accountNumber || 
            userData?.bankDetails?.accountNumber || 
            userData?.accountNumber || 
            prev.accountNumber;

          const mergedBank = 
            subData?.bankName || 
            subData?.bankDetails?.bankName || 
            chanData?.bankDetails?.bankName || 
            chanData?.bankName || 
            userData?.bankDetails?.bankName || 
            userData?.bankName || 
            prev.bankName;

          const mergedIfsc = 
            subData?.ifscCode || 
            subData?.bankDetails?.ifscCode || 
            chanData?.bankDetails?.ifscCode || 
            chanData?.ifscCode || 
            userData?.bankDetails?.ifscCode || 
            userData?.ifscCode || 
            prev.ifscCode;

          const mergedHolder = 
            subData?.accountHolder || 
            subData?.panCardHolderName || 
            subData?.bankDetails?.accountHolder || 
            chanData?.bankDetails?.accountHolder || 
            chanData?.accountHolder || 
            userData?.bankDetails?.accountHolder || 
            prev.accountHolder;

          const mergedBranch = 
            subData?.branchName || 
            subData?.bankDetails?.branchName || 
            chanData?.bankDetails?.branchName || 
            prev.branchName;

          const mergedUpi = 
            subData?.upiId || 
            subData?.bankDetails?.upiId || 
            chanData?.bankDetails?.upiId || 
            chanData?.upiId || 
            userData?.bankDetails?.upiId || 
            userData?.upiId || 
            prev.upiId;

          const mergedMobile = subData?.mobileNumber || chanData?.mobileNumber || userData?.mobileNumber || prev.mobileNumber;
          const mergedPan = subData?.panNumber || chanData?.panNumber || userData?.panNumber || prev.panNumber;
          const mergedPanName = subData?.panCardHolderName || chanData?.panCardHolderName || prev.panCardHolderName;

          if (mergedUpi && !upiId) {
            setUpiId(mergedUpi);
          }

          return {
            accountNumber: mergedAcc || '',
            bankName: mergedBank || '',
            ifscCode: mergedIfsc || '',
            accountHolder: mergedHolder || '',
            branchName: mergedBranch || '',
            upiId: mergedUpi || '',
            mobileNumber: mergedMobile || '',
            panNumber: mergedPan || '',
            panCardHolderName: mergedPanName || ''
          };
        });
      } catch (err) {
        console.warn('Could not fetch bank details from Firestore:', err);
      }
    };

    fetchLatestBankDetails();
    return () => { isMounted = false; };
  }, [isOpen, channel.id, currentUser.id]);

  const [isEditingBank, setIsEditingBank] = useState(false);

  if (!isOpen) return null;

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🛡️ Concurrency lock: Prevent rapid double clicking on the button while submission is in progress
    if (isSubmitting || isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    lastSubmitTimeRef.current = Date.now();
    setIsSubmitting(true);
    setErrorMsg('');

    // ✅ एडमिन पैनल के रिमोट स्विच का पालन करें:
    if (!isUnlocked) {
      setErrorMsg(language === 'hi'
        ? 'निकासी विंडो व्यवस्थापक द्वारा लॉक है। एडमिन पैनल वेबसाइट द्वारा अनलॉक किए जाने पर ही निकासी संभव है।'
        : 'Withdrawal window is currently locked by Admin. It opens when unlocked by the Admin Panel.');
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    const numAmount = parseFloat(withdrawAmount);
    if (isNaN(numAmount) || numAmount < minLimit) {
      setErrorMsg(language === 'hi' 
        ? `न्यूनतम निकासी राशि ₹${minLimit.toLocaleString('en-IN')} होनी चाहिए।` 
        : `Minimum withdrawal amount is ₹${minLimit.toLocaleString('en-IN')}.`);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    if (numAmount > wallet.currentBalance) {
      setErrorMsg(language === 'hi' 
        ? 'निकासी राशि वर्तमान वॉलेट शेष से अधिक नहीं हो सकती।' 
        : 'Withdrawal amount exceeds available wallet balance.');
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    const effectiveAccNum = bankInfo.accountNumber?.trim() || channel.bankDetails?.accountNumber?.trim() || '';
    const effectiveBankName = bankInfo.bankName?.trim() || channel.bankDetails?.bankName?.trim() || 'Bank Transfer';
    const effectiveIfsc = bankInfo.ifscCode?.trim() || channel.bankDetails?.ifscCode?.trim() || '';
    const effectiveHolder = bankInfo.accountHolder?.trim() || channel.bankDetails?.accountHolder?.trim() || currentUser.name || '';
    const effectiveUpi = upiId.trim() || bankInfo.upiId?.trim() || channel.bankDetails?.upiId?.trim() || '';

    if (payoutMethod === 'Bank Transfer' && (!effectiveAccNum || !effectiveIfsc)) {
      setErrorMsg(language === 'hi' 
        ? 'कृपया अपना पूरा बैंक खाता संख्या और IFSC कोड दर्ज करें।' 
        : 'Please provide full bank account number and IFSC code.');
      setIsEditingBank(true);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    if (payoutMethod === 'UPI' && !effectiveUpi) {
      setErrorMsg(language === 'hi' 
        ? 'कृपया अपनी UPI ID दर्ज करें।' 
        : 'Please enter a valid UPI ID.');
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    const targetAccountFormatted = payoutMethod === 'UPI' 
      ? effectiveUpi
      : `${effectiveBankName} - A/C: ${effectiveAccNum} (IFSC: ${effectiveIfsc}, Holder: ${effectiveHolder})`;

    let createdWithdrawalTx: any = null;
    let withdrawalRequestId = '';

    try {
      const db = getFirestoreSafe();
      const nowIso = new Date().toISOString();

      // Generate canonical unique ID for this withdrawal request
      const reqRef = doc(collection(db, 'withdrawal_requests'));
      withdrawalRequestId = reqRef.id;

      // ✅ Exact Bank Account & UPI Details submitted during channel creation
      const payoutDoc = cleanFirestoreData({
        id: withdrawalRequestId,
        requestId: withdrawalRequestId,
        creatorUid: currentUser.id || 'user',
        creatorName: currentUser.name || effectiveHolder || '',
        creatorEmail: currentUser.email || '',
        channelId: channel.id || '',
        channelName: channel.name || '',
        amount: numAmount,
        paymentMethod: payoutMethod,

        // Full unmasked bank credentials for Admin transfer
        accountNumber: effectiveAccNum,
        bankAccountNumber: effectiveAccNum,
        bankName: effectiveBankName,
        ifscCode: effectiveIfsc,
        accountHolder: effectiveHolder,
        accountHolderName: effectiveHolder,
        branchName: bankInfo.branchName || '',
        upiId: effectiveUpi,
        mobileNumber: bankInfo.mobileNumber || currentUser.phone || '',
        phone: bankInfo.mobileNumber || currentUser.phone || '',
        panNumber: bankInfo.panNumber || channel.panNumber || '',
        panCardHolderName: bankInfo.panCardHolderName || channel.panCardHolderName || effectiveHolder,

        targetAccount: targetAccountFormatted,
        status: 'pending',
        createdAt: nowIso,
        requestedAt: nowIso,
        serverTimestamp: serverTimestamp()
      });

      // 1. 🛡️ CRITICAL PERSISTENCE: Write with the same ID to BOTH `withdrawal_requests` AND `withdrawals`
      // This ensures that whether the creator, external admin portal, or Firebase Console inspects
      // `withdrawal_requests` or `withdrawals`, the record is 100% permanently saved!
      let savedToFirestore = false;
      const writeErrors: any[] = [];

      try {
        await setDoc(doc(db, 'withdrawal_requests', withdrawalRequestId), payoutDoc);
        savedToFirestore = true;
      } catch (errWr) {
        console.warn('withdrawal_requests write notice:', errWr);
        writeErrors.push(errWr);
      }

      try {
        await setDoc(doc(db, 'withdrawals', withdrawalRequestId), payoutDoc);
        savedToFirestore = true;
      } catch (errW) {
        console.warn('withdrawals write notice:', errW);
        writeErrors.push(errW);
      }

      try {
        await setDoc(doc(db, 'payout_requests', withdrawalRequestId), payoutDoc);
        savedToFirestore = true;
      } catch (_) {}

      if (!savedToFirestore) {
        throw new Error(writeErrors[0]?.message || 'Failed to save to Firebase withdrawal collections');
      }

      // Save/persist bank details to channel, users and channel_submissions for permanence
      if (effectiveAccNum || effectiveUpi) {
        const bankPayload = {
          accountNumber: effectiveAccNum,
          bankName: effectiveBankName,
          ifscCode: effectiveIfsc,
          accountHolder: effectiveHolder,
          upiId: effectiveUpi,
          branchName: bankInfo.branchName || '',
          mobileNumber: bankInfo.mobileNumber || currentUser.phone || '',
          panNumber: bankInfo.panNumber || channel.panNumber || ''
        };
        if (channel.id) {
          await setDoc(doc(db, 'channels', channel.id), { bankDetails: bankPayload }, { merge: true }).catch(() => null);
          await setDoc(doc(db, 'channel_submissions', channel.id), { ...bankPayload, ownerUid: currentUser.id }, { merge: true }).catch(() => null);
        }
        if (currentUser.id && currentUser.id !== 'user') {
          await setDoc(doc(db, 'users', currentUser.id), {
            bankDetails: bankPayload,
            accountNumber: effectiveAccNum,
            ifscCode: effectiveIfsc,
            bankName: effectiveBankName,
            accountHolder: effectiveHolder,
            upiId: effectiveUpi
          }, { merge: true }).catch(() => null);
        }
        try {
          localStorage.setItem(`bt_bank_details_${currentUser.id}`, JSON.stringify(bankPayload));
          localStorage.setItem('bt_bank_details', JSON.stringify(bankPayload));
          const ch = JSON.parse(localStorage.getItem('bt_channel') || '{}');
          ch.bankDetails = { ...(ch.bankDetails || {}), ...bankPayload };
          localStorage.setItem('bt_channel', JSON.stringify(ch));
          localStorage.setItem(`bt_channel_${currentUser.id}`, JSON.stringify(ch));
        } catch (_) {}
      }

      // 3. 🛡️ Deduct balance from Firestore `wallets/{currentUser.id}`
      const newBal = Math.max(0, Math.round((wallet.currentBalance - numAmount) * 100) / 100);
      const newWithdrawn = Math.round(((wallet.totalWithdrawn || 0) + numAmount) * 100) / 100;

      createdWithdrawalTx = {
        id: `TXN-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('hi-IN'),
        amount: numAmount,
        type: 'withdrawal' as const,
        status: 'pending' as const,
        payoutMethod: payoutMethod,
        targetAccount: targetAccountFormatted,
        accountNumber: effectiveAccNum,
        ifscCode: effectiveIfsc,
        refId: withdrawalRequestId,
        note: language === 'hi' 
          ? `${payoutMethod} द्वारा निकासी अनुरोध दर्ज (लंबित)` 
          : `Withdrawal requested via ${payoutMethod} (Pending)`
      };

      const updatedTxs = [createdWithdrawalTx, ...(wallet.transactions || []).filter(t => t.refId !== withdrawalRequestId)].slice(0, 50);

      const walletRef = doc(db, 'wallets', currentUser.id);
      await setDoc(walletRef, cleanFirestoreData({
        currentBalance: newBal,
        walletBalance: newBal,
        totalWithdrawn: newWithdrawn,
        lastWithdrawalAmount: numAmount,
        lastWithdrawalDate: nowIso,
        lastWithdrawalStatus: 'pending',
        lastWithdrawalRequestId: withdrawalRequestId,
        transactions: updatedTxs,
        lastUpdated: nowIso,
        serverTimestamp: serverTimestamp()
      }), { merge: true }).catch((err) => console.warn('Wallet deduction setDoc warning:', err));

      // 4. Record audit log
      await addDoc(collection(db, 'withdrawal_lock_logs'), cleanFirestoreData({
        action: 'withdrawal_requested',
        creatorUid: currentUser.id,
        creatorName: currentUser.name,
        channelName: channel.name,
        amount: numAmount,
        payoutMethod,
        accountNumber: effectiveAccNum,
        withdrawalRequestId,
        status: 'pending',
        timestamp: nowIso,
        serverTimestamp: serverTimestamp()
      })).catch(() => null);

      // ✅ 5. CRITICAL: Only deduct locally and show success once Firestore writes have fully succeeded!
      onWithdrawalRequested(numAmount, payoutMethod, targetAccountFormatted, withdrawalRequestId, createdWithdrawalTx);
      setRequestSuccess(true);
      setWithdrawAmount(String(minLimit));

    } catch (err) {
      console.error('Firestore payout write error:', err);
      setErrorMsg(language === 'hi'
        ? 'निकासी अनुरोध फायरबेस में दर्ज नहीं हो सका। कृपया पुनः प्रयास करें।'
        : 'Failed to submit withdrawal request to Firebase. Please try again.');
      setRequestSuccess(false);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const resetAndClose = () => {
    isSubmittingRef.current = false;
    setIsSubmitting(false);
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
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setRequestSuccess(false);
                  setIsSubmitting(false);
                  isSubmittingRef.current = false;
                  setErrorMsg('');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer text-sm"
              >
                {language === 'hi' ? 'दूसरा विड्रॉल दर्ज करें' : 'Submit Another Request'}
              </button>
              <button
                onClick={resetAndClose}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shadow-lg shadow-amber-500/20 cursor-pointer text-sm"
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
                  <span>{language === 'hi' ? 'निकासी विंडो: प्रत्येक माह 1 से 6 तारीख तक, एडमिन द्वारा रिमोट स्विच नियंत्रण में।' : 'Payout Window: 1st to 6th of every month, controlled by Admin Remote Switch.'}</span>
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
            <div className={`mt-4 p-4 rounded-2xl border space-y-2 ${
              isUnlocked 
                ? 'bg-emerald-50/60 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' 
                : 'bg-rose-50/60 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 shrink-0 ${isUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
                  <span className={`font-bold text-xs ${isUnlocked ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
                    {language === 'hi' ? 'मासिक निकासी विंडो (1 से 6 तारीख • एडमिन रिमोट स्विच)' : 'Monthly Payout Window (1st - 6th • Admin Remote Switch)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isUnlocked 
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' 
                      : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30'
                  }`}>
                    {isUnlocked 
                      ? (language === 'hi' ? '🔓 विंडो खुली है (सक्रिय)' : 'Window Open (Active)')
                      : (language === 'hi' ? '🔒 एडमिन द्वारा लॉक (बंद)' : 'Admin Locked')}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                {isUnlocked ? (
                  language === 'hi'
                    ? '✓ निकासी विंडो सक्रिय है! एडमिन पैनल वेबसाइट द्वारा यह विंडो अनलॉक है। यदि आपका बैलेंस ₹5,000 या अधिक है, तो आप निकासी सबमिट कर सकते हैं।'
                    : '✓ Withdrawal window is active! Unlocked by admin panel. You can request payouts if balance is ₹5,000 or above.'
                ) : (
                  language === 'hi'
                    ? '⚠️ निकासी विंडो वर्तमान में व्यवस्थापक द्वारा लॉक (बंद) है। 1 से 6 तारीख के चक्र में एडमिन द्वारा अनलॉक होने पर ही निकासी स्वीकार होगी।'
                    : '⚠️ Withdrawal window is currently locked by the admin. It opens when unlocked by the admin.'
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
                    : !isUnlocked
                    ? (language === 'hi' ? '🔒 एडमिन लॉक' : 'Admin Locked')
                    : (language === 'hi' ? 'निकासी योग्य' : 'Eligible')}
                </span>
              </h3>

              {!isUnlocked && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {language === 'hi'
                      ? '⚠️ निकासी विंडो अभी व्यवस्थापक द्वारा लॉक है। एडमिन पैनल वेबसाइट द्वारा अनलॉक होने पर ही फॉर्म खुलेगा।'
                      : '⚠️ Withdrawal window is locked by Admin. It unlocks via the Admin Panel.'}
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
                        {language === 'hi' ? `बैंक ट्रांसफर (${bankInfo.bankName || channel.bankDetails?.bankName || 'Verified Bank'})` : 'Bank Transfer'}
                      </option>
                      <option value="UPI">
                        {language === 'hi' ? 'UPI (Google Pay / PhonePe / Paytm)' : 'UPI Transfer'}
                      </option>
                    </select>
                  </div>
                </div>

                {/* ✅ Verified Channel Bank Account Details Preview & Edit */}
                {payoutMethod === 'Bank Transfer' && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-amber-600" />
                        {language === 'hi' ? 'चैनल का बैंक खाता विवरण' : 'Channel Bank Account Details'}
                      </span>
                      <div className="flex items-center gap-2">
                        {bankInfo.accountNumber && (
                          <button
                            type="button"
                            onClick={() => setIsEditingBank(!isEditingBank)}
                            className="text-[11px] text-amber-600 dark:text-amber-400 underline font-medium hover:text-amber-500 cursor-pointer"
                          >
                            {isEditingBank ? (language === 'hi' ? 'पूर्वावलोकन' : 'Preview') : (language === 'hi' ? '✏️ खाता बदलें' : '✏️ Edit')}
                          </button>
                        )}
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
                          ✓ VERIFIED
                        </span>
                      </div>
                    </div>

                    {(!bankInfo.accountNumber || isEditingBank) ? (
                      <div className="space-y-3 pt-2">
                        <p className="text-[11px] text-amber-600 dark:text-amber-400">
                          {language === 'hi'
                            ? 'कृपया अपना बैंक खाता संख्या और IFSC कोड सावधानीपूर्वक दर्ज करें। एडमिन इसी खाते में पैसे ट्रांसफर करेगा।'
                            : 'Please enter your full bank account number and IFSC code for payout transfers.'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-1 font-semibold">{language === 'hi' ? 'खाताधारक का नाम *' : 'Account Holder *'}</label>
                            <input
                              type="text"
                              required
                              value={bankInfo.accountHolder}
                              onChange={(e) => setBankInfo(prev => ({ ...prev, accountHolder: e.target.value }))}
                              placeholder="जैसे: SANJAY KUSHWAHA"
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-1 font-semibold">{language === 'hi' ? 'बैंक का नाम *' : 'Bank Name *'}</label>
                            <input
                              type="text"
                              required
                              value={bankInfo.bankName}
                              onChange={(e) => setBankInfo(prev => ({ ...prev, bankName: e.target.value }))}
                              placeholder="जैसे: State Bank of India"
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-1 font-semibold">{language === 'hi' ? 'खाता संख्या (A/C Number) *' : 'Account Number *'}</label>
                            <input
                              type="text"
                              required
                              value={bankInfo.accountNumber}
                              onChange={(e) => setBankInfo(prev => ({ ...prev, accountNumber: e.target.value.replace(/\s+/g, '') }))}
                              placeholder="जैसे: 30291083921"
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-1 font-semibold">{language === 'hi' ? 'IFSC कोड *' : 'IFSC Code *'}</label>
                            <input
                              type="text"
                              required
                              value={bankInfo.ifscCode}
                              onChange={(e) => setBankInfo(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase().replace(/\s+/g, '') }))}
                              placeholder="जैसे: SBIN0001234"
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-bold uppercase focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 pt-1">
                        <div>
                          <span className="text-[10px] text-slate-500 block">{language === 'hi' ? 'खाताधारक का नाम' : 'Account Holder'}</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {bankInfo.accountHolder || channel.bankDetails?.accountHolder || currentUser.name || 'उपलब्ध नहीं'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">{language === 'hi' ? 'बैंक का नाम' : 'Bank Name'}</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {bankInfo.bankName || channel.bankDetails?.bankName || 'उपलब्ध नहीं'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">{language === 'hi' ? 'खाता संख्या (A/C Number)' : 'Account Number'}</span>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400 tracking-wider text-sm">
                            {bankInfo.accountNumber || channel.bankDetails?.accountNumber || 'चैनल में दर्ज नहीं'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">IFSC Code</span>
                          <span className="font-mono font-bold uppercase text-slate-900 dark:text-slate-100">
                            {bankInfo.ifscCode || channel.bankDetails?.ifscCode || 'उपलब्ध नहीं'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {payoutMethod === 'UPI' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {language === 'hi' ? 'UPI ID (Google Pay / PhonePe / Paytm)' : 'UPI ID'}
                    </label>
                    <input
                      type="text"
                      placeholder="name@okaxis / 98XXXXXXXX@paytm"
                      value={upiId}
                      disabled={!isEligibleForWithdrawal}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {bankInfo.upiId && !upiId && (
                      <p className="text-[10px] text-amber-600 mt-1">
                        पंजीकृत UPI: {bankInfo.upiId}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <p className="text-[11px] text-slate-500">
                    {language === 'hi'
                      ? `न्यूनतम निकासी ₹${minLimit.toLocaleString('en-IN')} है • विंडो: 1 से 6 तारीख (एडमिन रिमोट स्विच अधिकृत)`
                      : `Minimum withdrawal is ₹${minLimit} • Window: 1st to 6th (Admin Remote Switch Authorized)`}
                  </p>
                  <button
                    type="submit"
                    disabled={!isEligibleForWithdrawal || isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {!isUnlocked ? (
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
