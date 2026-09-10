import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Play, 
  Youtube, 
  Sparkles, 
  FileText, 
  Building2, 
  CreditCard, 
  Smartphone, 
  User, 
  Trash2, 
  ExternalLink, 
  Search, 
  Filter, 
  Eye, 
  IndianRupee, 
  Lock, 
  Check, 
  AlertTriangle,
  Film,
  Zap,
  TrendingUp,
  RefreshCw,
  Send,
  FileVideo,
  Key,
  Server,
  Megaphone,
  Plus,
  Radio,
  HelpCircle,
  Headphones,
  MessageSquare,
  MessageCircle,
  Copy,
  Users
} from 'lucide-react';
import { 
  ChannelSubmission, 
  VideoSubmission, 
  UserAccount, 
  RemoteAppConfig, 
  CustomVideoAdConfig, 
  ShortAdPoolRecord,
  AdRevenueDistributionBatch 
} from '../types';
import { Language, translations } from '../locales/i18n';
import { safeStorage } from '../lib/safeStorage';
import { INITIAL_REMOTE_CONFIG } from '../data/mockData';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { getFirestoreSafe, sendLiveChatMessageToFirestore } from '../lib/firebase';
import { 
  updateCreatorPayoutByAdmin, 
  get24HourMetrics, 
  getCreator24HourTotals,
  subscribeToShortAdPools,
  getCreatorEligibleAds,
  distributeAdRevenueToAllCreators,
  subscribeToAdRevenueDistributions
} from '../lib/revenueService';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelSubmissions: ChannelSubmission[];
  videoSubmissions: VideoSubmission[];
  banners?: any[];
  remoteConfig?: RemoteAppConfig;
  copyrightReports?: any[];
  promotions?: any[];
  onApproveChannel: (submissionId: string) => Promise<void> | void;
  onRejectChannel: (submissionId: string, reason?: string) => Promise<void> | void;
  onDeleteChannelSubmission?: (submissionId: string) => Promise<void> | void;
  onApproveVideo?: (submissionId: string) => Promise<void> | void;
  onRejectVideo?: (submissionId: string, reason?: string) => Promise<void> | void;
  onDeleteVideoSubmission?: (submissionId: string) => Promise<void> | void;
  onApproveVideoSubmission?: (submissionId: string) => Promise<void> | void;
  onRejectVideoSubmission?: (submissionId: string, reason?: string) => Promise<void> | void;
  onUpdateBanners?: (banners: any[]) => Promise<void> | void;
  onUpdateRemoteConfig?: (config: RemoteAppConfig) => Promise<void> | void;
  onUpdateCopyrightReports?: (reports: any[]) => Promise<void> | void;
  onRefreshData?: () => Promise<void> | void;
  language: Language;
  currentUser?: UserAccount | null;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  channelSubmissions = [],
  videoSubmissions = [],
  banners = [],
  remoteConfig,
  copyrightReports = [],
  promotions = [],
  onApproveChannel,
  onRejectChannel,
  onDeleteChannelSubmission,
  onApproveVideo,
  onRejectVideo,
  onDeleteVideoSubmission,
  onApproveVideoSubmission,
  onRejectVideoSubmission,
  onUpdateBanners,
  onUpdateRemoteConfig,
  onUpdateCopyrightReports,
  onRefreshData,
  language,
  currentUser
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'videos' | 'channels' | 'revenue' | 'ads' | 'support'>('videos');
  const [videoFilter, setVideoFilter] = useState<'all' | 'pending' | 'shorts' | 'long' | 'approved' | 'rejected'>('pending');
  const [channelFilter, setChannelFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Google AdMob & Video Ads Configuration State
  const [enableVideoAds, setEnableVideoAds] = useState(remoteConfig?.enableVideoAds ?? true);
  const [adSkipSeconds, setAdSkipSeconds] = useState(remoteConfig?.adSkipSeconds || 5);
  const [cpmRate, setCpmRate] = useState(remoteConfig?.cpmRate || 100);
  const [enableAdMob, setEnableAdMob] = useState(remoteConfig?.adsEnabled ?? remoteConfig?.enableAdMob ?? true);
  const [admobAppId, setAdmobAppId] = useState(remoteConfig?.admobAppId || INITIAL_REMOTE_CONFIG.admobAppId);
  const [admobBannerId, setAdmobBannerId] = useState(remoteConfig?.admobBannerId || INITIAL_REMOTE_CONFIG.admobBannerId);
  const [admobInterstitialId, setAdmobInterstitialId] = useState(remoteConfig?.admobInterstitialId || INITIAL_REMOTE_CONFIG.admobInterstitialId);
  const [admobRewardedId, setAdmobRewardedId] = useState(remoteConfig?.admobRewardedId || INITIAL_REMOTE_CONFIG.admobRewardedId);
  const [admobNativeId, setAdmobNativeId] = useState(remoteConfig?.admobNativeId || INITIAL_REMOTE_CONFIG.admobNativeId);
  const [admobPublisherId, setAdmobPublisherId] = useState(remoteConfig?.admobPublisherId || INITIAL_REMOTE_CONFIG.admobPublisherId);
  const [copiedAdUnit, setCopiedAdUnit] = useState<string | null>(null);

  // Support Tickets & Live Chat State
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<any[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingAdminReply, setIsSendingAdminReply] = useState(false);
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');

  // Custom Ads List
  const [customAds, setCustomAds] = useState<CustomVideoAdConfig[]>(
    remoteConfig?.customVideoAds || [
      {
        id: 'ad-sample-1',
        title: 'बुंदेलखंडी पारंपरिक वस्त्र मेला',
        sponsorName: 'देसी हैंडलूम ओरछा',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        ctaText: 'विशेष 30% छूट पाएँ',
        ctaUrl: 'https://bundelkhand.gov.in',
        durationSeconds: 15,
        isActive: true
      },
      {
        id: 'ad-sample-2',
        title: 'शुद्ध देसी घी व बुंदेली मिठाईयां',
        sponsorName: 'महोबा मिष्ठान भंडार',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        ctaText: 'ऑनलाइन आर्डर करें',
        ctaUrl: 'https://bundelkhand.gov.in',
        durationSeconds: 15,
        isActive: true
      }
    ]
  );
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdSponsor, setNewAdSponsor] = useState('');
  const [newAdVideoUrl, setNewAdVideoUrl] = useState('');
  const [newAdCtaText, setNewAdCtaText] = useState('अभी देखें');
  const [newAdCtaUrl, setNewAdCtaUrl] = useState('https://bundelkhand.gov.in');
  const [newAdDuration, setNewAdDuration] = useState(15);
  const [isAddingNewAd, setIsAddingNewAd] = useState(false);

  // Saving settings state
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Rejection modal state
  const [rejectingItem, setRejectingItem] = useState<{ type: 'video' | 'channel'; id: string; title: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Video preview player
  const [previewVideo, setPreviewVideo] = useState<VideoSubmission | null>(null);

  // Aadhaar & PAN photo zoom preview
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  // Processing state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Admin Manual Payout States
  const [payoutAmounts, setPayoutAmounts] = useState<Record<string, string>>({});
  const [payoutNotes, setPayoutNotes] = useState<Record<string, string>>({});
  const [payoutSubmitting, setPayoutSubmitting] = useState<Record<string, boolean>>({});
  const [payoutStatusMsg, setPayoutStatusMsg] = useState<Record<string, { text: string; success: boolean }>>({});

  // Firebase Remote Config Withdrawal Window Admin Control State
  const [isWithdrawalUnlocked, setIsWithdrawalUnlocked] = useState(remoteConfig?.isWithdrawalWindowUnlocked ?? false);
  const [withdrawalMinAmount, setWithdrawalMinAmount] = useState(remoteConfig?.withdrawalMinAmount ?? 5000);
  const [isTogglingWithdrawal, setIsTogglingWithdrawal] = useState(false);

  useEffect(() => {
    if (remoteConfig) {
      setIsWithdrawalUnlocked(remoteConfig.isWithdrawalWindowUnlocked ?? false);
      if (remoteConfig.withdrawalMinAmount) {
        setWithdrawalMinAmount(remoteConfig.withdrawalMinAmount);
      }
    }
  }, [remoteConfig]);

  const handleToggleWithdrawalWindow = async (unlock: boolean) => {
    setIsTogglingWithdrawal(true);
    try {
      const updatedConfig: RemoteAppConfig = {
        ...(remoteConfig || INITIAL_REMOTE_CONFIG),
        isWithdrawalWindowUnlocked: unlock,
        withdrawalMinAmount: Number(withdrawalMinAmount) || 5000,
        withdrawalWindowDatesText: '1 se 5',
        withdrawalAdminNotice: unlock
          ? 'निकासी विंडो खुली है (1 से 5 तारीख)।'
          : 'निकासी विंडो एडमिन द्वारा बंद है।'
      };
      if (onUpdateRemoteConfig) {
        await onUpdateRemoteConfig(updatedConfig);
      }
      const db = getFirestoreSafe();
      if (db) {
        await updateDoc(doc(db, 'config', 'app_config'), {
          isWithdrawalWindowUnlocked: unlock,
          withdrawalMinAmount: Number(withdrawalMinAmount) || 5000,
          withdrawalWindowDatesText: '1 se 5',
          updatedAt: new Date().toISOString()
        });
      }
      setIsWithdrawalUnlocked(unlock);
      setActionSuccess(
        unlock
          ? (language === 'hi' ? '✓ निकासी विंडो सफलतापूर्वक अनलॉक (खुल) गई! क्रिएटर 1-5 तारीख को ₹5,000+ निकाल सकेंगे।' : '✓ Withdrawal window unlocked successfully!')
          : (language === 'hi' ? '✓ निकासी विंडो सफलतापूर्वक लॉक (बंद) कर दी गई!' : '✓ Withdrawal window locked successfully!')
      );
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (e) {
      console.warn('Failed to toggle withdrawal window:', e);
    } finally {
      setIsTogglingWithdrawal(false);
    }
  };

  // 5-Shorts Rule: short_ad_pools real-time review state
  const [shortAdPools, setShortAdPools] = useState<ShortAdPoolRecord[]>([]);

  // Automated Ad Revenue Distribution States (1 Ad ka kitna paisa pada or kitne rupay bane)
  const [adRateInput, setAdRateInput] = useState<string>(remoteConfig?.currentAdRate ? String(remoteConfig.currentAdRate) : '0.50');
  const [totalBudgetInput, setTotalBudgetInput] = useState<string>('5000');
  const [totalAdsInput, setTotalAdsInput] = useState<string>('10000');
  const [rateInputMode, setRateInputMode] = useState<'per_ad' | 'total_budget'>('per_ad');
  const [creatorSharePercent, setCreatorSharePercent] = useState<number>(50);
  const [calculationBasis, setCalculationBasis] = useState<'all_ads' | 'total_long_impressions' | '24h_ads'>('all_ads');
  const [customCreatorAds, setCustomCreatorAds] = useState<Record<string, number>>({});
  const [isDistributingAds, setIsDistributingAds] = useState(false);
  const [distResultMsg, setDistResultMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [distributionBatches, setDistributionBatches] = useState<AdRevenueDistributionBatch[]>([]);
  const [showBatchHistory, setShowBatchHistory] = useState(false);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [distributionAdminNote, setDistributionAdminNote] = useState<string>('');

  useEffect(() => {
    if (isOpen && activeTab === 'revenue') {
      const unsubShorts = subscribeToShortAdPools((pools) => {
        setShortAdPools(pools);
      });
      const unsubBatches = subscribeToAdRevenueDistributions((batches) => {
        setDistributionBatches(batches);
      });
      return () => {
        unsubShorts();
        unsubBatches();
      };
    }
  }, [isOpen, activeTab]);

  const handleExecuteAdRevenueDistribution = async () => {
    let effectiveRate = 0;
    if (rateInputMode === 'per_ad') {
      effectiveRate = parseFloat(adRateInput) || 0;
    } else {
      const budget = parseFloat(totalBudgetInput) || 0;
      const ads = parseFloat(totalAdsInput) || 0;
      effectiveRate = ads > 0 ? (budget / ads) : 0;
    }

    if (isNaN(effectiveRate) || effectiveRate <= 0) {
      alert(language === 'hi' ? 'कृपया 1 विज्ञापन की मान्य दर (₹) या कुल बजट/विज्ञापन संख्या दर्ज करें।' : 'Please enter a valid rate per ad.');
      return;
    }

    // Calculate preview counts
    const netRate = effectiveRate * (creatorSharePercent / 100);
    let totalPreviewAds = 0;
    let totalPreviewAmt = 0;
    let countEligible = 0;

    channelSubmissions.forEach(sub => {
      const ads = customCreatorAds[sub.id] !== undefined
        ? Number(customCreatorAds[sub.id])
        : getCreatorEligibleAds(sub, videoSubmissions as any[], calculationBasis);
      if (ads > 0) {
        const amt = Math.round(ads * netRate * 100) / 100;
        totalPreviewAds += ads;
        totalPreviewAmt += amt;
        countEligible += 1;
      }
    });

    if (totalPreviewAds === 0 || countEligible === 0) {
      alert(language === 'hi' 
        ? 'किसी भी क्रिएटर के पास इस समय विज्ञापन दर्ज नहीं हैं। आप नीचे दी गई तालिका में क्रिएटर के आगे सीधे विज्ञापन संख्या दर्ज कर सकते हैं।' 
        : 'No creators have ads recorded. You can manually enter ad count for each creator in the table.');
      return;
    }

    const confirmText = language === 'hi'
      ? `📢 विज्ञापन आय वितरण की पुष्टि करें:\n\n• 1 विज्ञापन दर: ₹${effectiveRate.toFixed(4)}\n• क्रिएटर शेयर: ${creatorSharePercent}%\n• कुल विज्ञापन: ${totalPreviewAds.toLocaleString('en-IN')}\n• कुल क्रिएटर्स: ${countEligible}\n• कुल क्रेडिट होने वाली राशि: ₹${totalPreviewAmt.toLocaleString('en-IN')}\n\nक्या आप अभी इन सभी क्रिएटर्स के वॉलेट में पैसे जोड़ना चाहते हैं?`
      : `Distribute Ad Revenue to ${countEligible} creators? Total: ₹${totalPreviewAmt.toFixed(2)}`;

    if (!window.confirm(confirmText)) return;

    setIsDistributingAds(true);
    setDistResultMsg(null);

    try {
      const res = await distributeAdRevenueToAllCreators({
        ratePerAd: effectiveRate,
        creatorSharePercentage: creatorSharePercent,
        calculationBasis,
        channels: channelSubmissions,
        videos: videoSubmissions as any[],
        adminNote: distributionAdminNote || `विज्ञापन आय ऑटो-वितरण: 1 Ad = ₹${effectiveRate.toFixed(4)} (${creatorSharePercent}% शेयर)`,
        adminEmail: 'sanjaykushwaha975297@gmail.com',
        customCreatorAdsOverride: customCreatorAds
      });

      if (res.success) {
        setDistResultMsg({ text: res.message, success: true });
        setActionSuccess(res.message);
        setTimeout(() => setActionSuccess(null), 8000);
      } else {
        setDistResultMsg({ text: res.message, success: false });
      }
    } catch (err: any) {
      setDistResultMsg({ text: err?.message || 'वितरण विफल रहा।', success: false });
    } finally {
      setIsDistributingAds(false);
    }
  };

  const handleAdminPayoutSubmit = async (sub: ChannelSubmission) => {
    const amountStr = payoutAmounts[sub.id] || '';
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert(language === 'hi' ? 'कृपया एक मान्य पेआउट राशि दर्ज करें।' : 'Please enter a valid payout amount.');
      return;
    }

    const creatorId = sub.ownerUid || sub.id;
    setPayoutSubmitting(prev => ({ ...prev, [sub.id]: true }));

    try {
      const res = await updateCreatorPayoutByAdmin({
        creatorId,
        channelId: sub.id,
        payoutAmount: amount,
        adminNote: payoutNotes[sub.id] || (language === 'hi' ? 'एडमिन पैनल द्वारा जारी पेआउट' : 'Admin Panel Manual Payout Release'),
        panCardHolderName: sub.panCardHolderName || sub.panName || sub.accountHolder,
        channelName: sub.channelName
      });

      if (res.success) {
        setPayoutStatusMsg(prev => ({
          ...prev,
          [sub.id]: { text: res.message, success: true }
        }));
        setPayoutAmounts(prev => ({ ...prev, [sub.id]: '' }));
        setPayoutNotes(prev => ({ ...prev, [sub.id]: '' }));
      } else {
        setPayoutStatusMsg(prev => ({
          ...prev,
          [sub.id]: { text: res.message, success: false }
        }));
      }
    } catch (err: any) {
      setPayoutStatusMsg(prev => ({
        ...prev,
        [sub.id]: { text: err?.message || 'त्रुटि हुई', success: false }
      }));
    } finally {
      setPayoutSubmitting(prev => ({ ...prev, [sub.id]: false }));
    }
  };

  if (!isOpen) return null;

  // Counts
  const pendingVideosCount = videoSubmissions.filter(v => v.status === 'pending').length;
  const pendingChannelsCount = channelSubmissions.filter(c => c.status === 'pending').length;
  const pendingShortsCount = videoSubmissions.filter(v => v.status === 'pending' && (v.isShort || v.videoType === 'short' || v.category === 'shorts')).length;

  // Filtered Videos
  const filteredVideos = videoSubmissions.filter(v => {
    const isShortVid = Boolean(v.isShort || v.videoType === 'short' || v.category === 'shorts' || v.youtubeUrl?.includes('/shorts/'));
    if (videoFilter === 'pending' && v.status !== 'pending') return false;
    if (videoFilter === 'approved' && v.status !== 'approved') return false;
    if (videoFilter === 'rejected' && v.status !== 'rejected') return false;
    if (videoFilter === 'shorts' && !isShortVid) return false;
    if (videoFilter === 'long' && isShortVid) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.title?.toLowerCase().includes(q) ||
        v.artist?.toLowerCase().includes(q) ||
        v.channelName?.toLowerCase().includes(q) ||
        v.verificationCode?.toLowerCase().includes(q) ||
        v.youtubeId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Channels
  const filteredChannels = channelSubmissions.filter(c => {
    if (channelFilter === 'pending' && c.status !== 'pending') return false;
    if (channelFilter === 'approved' && c.status !== 'approved') return false;
    if (channelFilter === 'rejected' && c.status !== 'rejected') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.channelName?.toLowerCase().includes(q) ||
        c.accountHolder?.toLowerCase().includes(q) ||
        c.mobileNumber?.toLowerCase().includes(q) ||
        c.verifiedEmail?.toLowerCase().includes(q) ||
        c.aadhaarNumber?.toLowerCase().includes(q) ||
        c.upiId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApproveVideoAction = async (id: string) => {
    setActionLoading(id);
    try {
      const approveFn = onApproveVideo || onApproveVideoSubmission;
      if (approveFn) {
        await approveFn(id);
      }
      setActionSuccess(language === 'hi' ? '✅ वीडियो स्वीकृत व लाइव कर दिया गया!' : '✅ Video approved & published!');
      setTimeout(() => setActionSuccess(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveChannelAction = async (id: string) => {
    setActionLoading(id);
    try {
      await onApproveChannel(id);
      setActionSuccess(language === 'hi' ? '✅ चैनल स्वीकृत कर दिया गया!' : '✅ Channel approved!');
      setTimeout(() => setActionSuccess(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectingItem) return;
    setActionLoading(rejectingItem.id);
    try {
      const rejectFn = onRejectVideo || onRejectVideoSubmission;
      if (rejectingItem.type === 'video' && rejectFn) {
        await rejectFn(rejectingItem.id, rejectionReason || undefined);
      } else {
        await onRejectChannel(rejectingItem.id, rejectionReason || undefined);
      }
      setActionSuccess(language === 'hi' ? 'आवेदन अस्वीकृत कर दिया गया।' : 'Submission rejected.');
      setTimeout(() => setActionSuccess(null), 3000);
      setRejectingItem(null);
      setRejectionReason('');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveAdsConfig = async () => {
    setIsSavingConfig(true);
    try {
      const updatedConfig: RemoteAppConfig = {
        ...(remoteConfig || INITIAL_REMOTE_CONFIG),
        enableVideoAds,
        adSkipSeconds,
        cpmRate,
        customVideoAds: customAds,
        adsEnabled: enableAdMob,
        enableAdMob,
        admobAppId: admobAppId.trim(),
        admobBannerId: admobBannerId.trim(),
        admobInterstitialId: admobInterstitialId.trim(),
        admobRewardedId: admobRewardedId.trim(),
        admobNativeId: admobNativeId.trim(),
        admobPublisherId: admobPublisherId.trim(),
        adMobBannerId: admobBannerId.trim(),
        adMobInterstitialId: admobInterstitialId.trim(),
        adMobRewardedId: admobRewardedId.trim()
      };

      if (onUpdateRemoteConfig) {
        await onUpdateRemoteConfig(updatedConfig);
      }
      safeStorage.setJSON('bt_remote_config', updatedConfig);
      setActionSuccess(language === 'hi' ? '✅ Google AdMob व वीडियो विज्ञापन सेटिंग्स सुरक्षित हो गई हैं!' : '✅ Google AdMob & Video Ads configuration saved!');
      setTimeout(() => setActionSuccess(null), 3500);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleAddNewCustomAd = () => {
    if (!newAdTitle.trim() || !newAdVideoUrl.trim()) return;
    const newAd: CustomVideoAdConfig = {
      id: `ad-${Date.now()}`,
      title: newAdTitle.trim(),
      sponsorName: newAdSponsor.trim() || 'प्रायोजित विज्ञापन',
      videoUrl: newAdVideoUrl.trim(),
      ctaText: newAdCtaText.trim() || 'अभी देखें',
      ctaUrl: newAdCtaUrl.trim() || 'https://bundelkhand.gov.in',
      durationSeconds: Number(newAdDuration) || 15,
      isActive: true
    };
    setCustomAds([newAd, ...customAds]);
    setNewAdTitle('');
    setNewAdSponsor('');
    setNewAdVideoUrl('');
    setNewAdCtaText('अभी देखें');
    setIsAddingNewAd(false);
  };

  const handleDeleteCustomAd = (adId: string) => {
    setCustomAds(customAds.filter(a => a.id !== adId));
  };

  const handleToggleCustomAd = (adId: string) => {
    setCustomAds(customAds.map(a => a.id === adId ? { ...a, isActive: !a.isActive } : a));
  };

  // Real-time Firestore sync for Support Tickets
  useEffect(() => {
    if (!isOpen) return;
    try {
      const db = getFirestoreSafe();
      const unsubscribeTickets = onSnapshot(collection(db, 'support_tickets'), (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setSupportTickets(list);
      }, (err) => {
        console.warn('Support tickets snapshot warning:', err);
      });
      return () => unsubscribeTickets();
    } catch (e) {
      console.warn('Support tickets init warning:', e);
    }
  }, [isOpen]);

  // Real-time Firestore sync for selected ticket's messages
  useEffect(() => {
    if (!isOpen || !selectedTicket) return;
    try {
      const db = getFirestoreSafe();
      const targetChatId = selectedTicket.chatId || (selectedTicket.userId ? `chat_${selectedTicket.userId}` : selectedTicket.id);
      const msgQuery = query(collection(db, 'support_messages'), where('chatId', '==', targetChatId));
      const unsubscribeMsgs = onSnapshot(msgQuery, (snapshot) => {
        const msgs: any[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push({ id: docSnap.id, ...docSnap.data() });
        });
        msgs.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setActiveChatMessages(msgs);
      }, (err) => {
        console.warn('Support messages snapshot warning:', err);
      });
      return () => unsubscribeMsgs();
    } catch (e) {
      console.warn('Support messages init warning:', e);
    }
  }, [isOpen, selectedTicket]);

  const handleSendAdminReply = async () => {
    if (!adminReplyText.trim() || !selectedTicket || isSendingAdminReply) return;
    setIsSendingAdminReply(true);
    const targetChatId = selectedTicket.chatId || (selectedTicket.userId ? `chat_${selectedTicket.userId}` : selectedTicket.id);
    try {
      await sendLiveChatMessageToFirestore({
        chatId: targetChatId,
        senderId: 'admin_sanjay',
        senderName: 'व्यवस्थापक (Admin Sanjay)',
        senderRole: 'admin',
        text: adminReplyText.trim(),
        userEmail: 'sanjaykushwaha975297@gmail.com'
      });
      setAdminReplyText('');
      setActionSuccess(language === 'hi' ? '✅ उत्तर सफलतापूर्वक भेजा गया!' : '✅ Reply sent successfully!');
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (e: any) {
      console.warn('Send admin reply error:', e);
    } finally {
      setIsSendingAdminReply(false);
    }
  };

  const handleToggleTicketStatus = async (ticketId: string, currentStatus: string) => {
    try {
      const db = getFirestoreSafe();
      const newStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev: any) => prev ? { ...prev, status: newStatus } : null);
      }
      setActionSuccess(language === 'hi' ? `टिकट स्थिति ${newStatus === 'resolved' ? 'समाधान (Resolved)' : 'खुला (Open)'} कर दी गई!` : `Status updated to ${newStatus}!`);
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (e) {
      console.warn('Ticket status update error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl shadow-amber-500/10 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                  {language === 'hi' ? 'बुन्देलीट्यूब एडमिन व व्यवस्थापक पोर्टल' : 'BundeliTube Admin Moderation Portal'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30 uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'क्रिएटर चैनल केवाईसी, यूट्यूब वीडियो व शॉर्ट्स सत्यापन और अनुमोदन केंद्र'
                  : 'Manage creator KYC verification, video/shorts moderation, and platform revenue'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toast Success Message */}
        {actionSuccess && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="px-4 sm:px-6 pt-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-950/40">
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'videos'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>{language === 'hi' ? '🎬 वीडियो व शॉर्ट्स अनुमोदन' : '🎬 Videos & Shorts Moderation'}</span>
            {pendingVideosCount > 0 && (
              <span className="px-2 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                {pendingVideosCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'channels'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{language === 'hi' ? '📋 चैनल केवाईसी आवेदन' : '📋 Channel KYC Applications'}</span>
            {pendingChannelsCount > 0 && (
              <span className="px-2 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold animate-pulse">
                {pendingChannelsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'revenue'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>{language === 'hi' ? '💰 एडमिन रेवेन्यू' : '💰 Revenue'}</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'ads'
                ? 'border-purple-400 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>{language === 'hi' ? '📢 वीडियो विज्ञापन सेटअप' : '📢 Video Ads'}</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'support'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>{language === 'hi' ? '💬 हेल्पडेस्क व लाइव सपोर्ट' : '💬 Helpdesk & Live Chat'}</span>
            {supportTickets.filter(t => t.status === 'open').length > 0 && (
              <span className="px-2 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold animate-pulse">
                {supportTickets.filter(t => t.status === 'open').length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* ======================================================== */}
          {/* 1. VIDEOS & SHORTS TAB                                   */}
          {/* ======================================================== */}
          {activeTab === 'videos' && (
            <div className="space-y-4">
              {/* Search & Sub-Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setVideoFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      videoFilter === 'pending'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? '⏳ लंबित (Pending)' : '⏳ Pending'}</span>
                    <span className="bg-slate-950/40 text-[10px] px-1.5 rounded-full">{pendingVideosCount}</span>
                  </button>

                  <button
                    onClick={() => setVideoFilter('shorts')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      videoFilter === 'shorts'
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? '⚡ शॉर्ट्स / रील्स' : '⚡ Shorts Only'}</span>
                    {pendingShortsCount > 0 && (
                      <span className="bg-slate-950/40 text-[10px] px-1.5 rounded-full">{pendingShortsCount}</span>
                    )}
                  </button>

                  <button
                    onClick={() => setVideoFilter('long')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      videoFilter === 'long'
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? '🎬 लॉन्ग वीडियो' : '🎬 Long Videos'}</span>
                  </button>

                  <button
                    onClick={() => setVideoFilter('approved')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                      videoFilter === 'approved'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {language === 'hi' ? '✅ स्वीकृत (Live)' : '✅ Approved'}
                  </button>

                  <button
                    onClick={() => setVideoFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                      videoFilter === 'all'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {language === 'hi' ? 'सभी (All)' : 'All'}
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'hi' ? 'शीर्षक, गायक, कोड खोजें...' : 'Search title, artist, code...'}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Videos Submissions List */}
              {filteredVideos.length === 0 ? (
                <div className="p-12 text-center bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-3">
                  <Film className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-300">
                    {language === 'hi' ? 'कोई वीडियो या शॉर्ट्स सबमिशन नहीं मिला' : 'No Video/Shorts Submissions Found'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {language === 'hi'
                      ? 'जैसे ही कोई क्रिएटर नया वीडियो या शॉर्ट्स अपलोड करेगा, वह यहां अनुमोदन हेतु प्रदर्शित होगा।'
                      : 'When creators upload videos or shorts, they will appear here for admin moderation.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVideos.map((vid) => {
                    const isShort = Boolean(vid.isShort || vid.videoType === 'short' || vid.category === 'shorts' || vid.youtubeUrl?.includes('/shorts/'));
                    const isPending = vid.status === 'pending';
                    const isApproved = vid.status === 'approved';
                    const isRejected = vid.status === 'rejected';

                    return (
                      <div
                        key={vid.id}
                        className={`bg-slate-950/60 border rounded-2xl p-4 space-y-3 transition ${
                          isPending 
                            ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' 
                            : isApproved 
                            ? 'border-emerald-500/30' 
                            : 'border-slate-800 opacity-75'
                        }`}
                      >
                        {/* Top Metadata Row */}
                        <div className="flex items-start gap-3">
                          {/* Thumbnail / Video Preview Button */}
                          <div 
                            onClick={() => setPreviewVideo(vid)}
                            className="relative w-28 aspect-video sm:aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800 cursor-pointer group"
                          >
                            <img
                              src={vid.thumbnailUrl || (vid.youtubeId ? `https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80')}
                              alt={vid.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/10 flex items-center justify-center transition">
                              <div className="w-8 h-8 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              </div>
                            </div>
                            {isShort && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[9px] flex items-center gap-0.5">
                                <Zap className="w-2.5 h-2.5" />
                                Short
                              </span>
                            )}
                          </div>

                          {/* Info Column */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isPending 
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                    : isApproved 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}>
                                  {isPending ? '⏳ समीक्षाधीन (Pending)' : isApproved ? '✅ स्वीकृत (Live)' : '❌ अस्वीकृत'}
                                </span>

                                {/* Source Type Badge: YouTube Video / Shorts */}
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                                  <Play className="w-3 h-3 text-red-400 fill-current" />
                                  <span>{isShort ? '⚡ यूट्यूब शॉर्ट्स' : '🎥 यूट्यूब वीडियो'}</span>
                                </span>
                              </div>

                              <span className="text-[10px] text-slate-400 font-mono">
                                {vid.createdAt ? new Date(vid.createdAt).toLocaleDateString('hi-IN') : 'अभी-अभी'}
                              </span>
                            </div>

                            <h4 className="font-bold text-xs sm:text-sm text-slate-100 line-clamp-2" title={vid.title}>
                              {vid.title}
                            </h4>

                            <p className="text-xs text-slate-400 truncate">
                              🎤 गायक: <span className="text-slate-300 font-medium">{vid.artist}</span> • 📁 {vid.category}
                              {vid.duration && <span className="ml-1 text-slate-400 font-mono">({vid.duration})</span>}
                            </p>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate pt-0.5">
                              <img
                                src={vid.channelAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                                alt={vid.channelName}
                                className="w-4 h-4 rounded-full object-cover shrink-0 border border-slate-700"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                                }}
                              />
                              <span className="truncate">📺 चैनल: <span className="text-amber-400 font-medium">{vid.channelName}</span></span>
                            </div>
                          </div>
                        </div>

                        {/* YouTube Ownership Verification Code & Direct Link */}
                        <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 text-[11px] space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-slate-400">ओनरशिप कोड:</span>
                              <span className="font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                                {vid.verificationCode || 'BT-VERIFIED'}
                              </span>
                            </div>

                            {vid.youtubeId && (
                              <a
                                href={vid.youtubeUrl || `https://www.youtube.com/watch?v=${vid.youtubeId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px] hover:underline font-bold"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>यूट्यूब पर चेक करें</span>
                              </a>
                            )}
                          </div>

                          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                            <span>यूट्यूब डिस्क्रिप्शन में यह कोड होना चाहिए</span>
                            <button
                              type="button"
                              onClick={() => setPreviewVideo(vid)}
                              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline cursor-pointer font-bold"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>प्ले करके देखें</span>
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleApproveVideoAction(vid.id)}
                                disabled={actionLoading === vid.id}
                                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer transition"
                              >
                                {actionLoading === vid.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>{language === 'hi' ? '✅ स्वीकृत व लाइव करें' : 'Approve & Publish'}</span>
                              </button>

                              <button
                                onClick={() => setRejectingItem({ type: 'video', id: vid.id, title: vid.title })}
                                disabled={actionLoading === vid.id}
                                className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>{language === 'hi' ? 'अस्वीकृत' : 'Reject'}</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center justify-between w-full text-xs text-slate-400">
                              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {vid.status === 'approved' ? 'लाइव प्रकाशित है (Live on Feed)' : 'अस्वीकृत (Rejected)'}
                              </span>

                              {onDeleteVideoSubmission && (
                                <button
                                  onClick={() => onDeleteVideoSubmission(vid.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition"
                                  title="सबमिशन हटाएं"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. CHANNELS KYC TAB                                      */}
          {/* ======================================================== */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChannelFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      channelFilter === 'pending'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? '⏳ लंबित आवेदन' : 'Pending KYC'}</span>
                    <span className="bg-slate-950/40 text-[10px] px-1.5 rounded-full">{pendingChannelsCount}</span>
                  </button>

                  <button
                    onClick={() => setChannelFilter('approved')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      channelFilter === 'approved'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {language === 'hi' ? '✅ स्वीकृत चैनल' : 'Approved Channels'}
                  </button>

                  <button
                    onClick={() => setChannelFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      channelFilter === 'all'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {language === 'hi' ? 'सभी (All)' : 'All'}
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'hi' ? 'चैनल, नाम, मोबाइल खोजें...' : 'Search name, mobile...'}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Channels List */}
              {filteredChannels.length === 0 ? (
                <div className="p-12 text-center bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-3">
                  <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-300">
                    {language === 'hi' ? 'कोई चैनल आवेदन नहीं मिला' : 'No Channel Applications Found'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {language === 'hi'
                      ? 'नए क्रिएटर का आधार व बैंक विवरण आवेदन यहां व्यवस्थापक समीक्षा हेतु प्रदर्शित होगा।'
                      : 'When new creators register their channel, their KYC applications will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredChannels.map((sub) => {
                    const isPending = sub.status === 'pending';
                    const isApproved = sub.status === 'approved';
                    const isRejected = sub.status === 'rejected';

                    return (
                      <div
                        key={sub.id}
                        className={`bg-slate-950/70 border rounded-2xl p-5 space-y-4 transition ${
                          isPending
                            ? 'border-amber-500/40 shadow-xl shadow-amber-500/5'
                            : isApproved
                            ? 'border-emerald-500/30'
                            : 'border-slate-800 opacity-75'
                        }`}
                      >
                        {/* Channel Header Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <img
                              src={sub.channelLogoUrl || sub.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={sub.channelName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/50"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-base text-slate-100">{sub.channelName}</h3>
                                {isApproved && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                              </div>
                              <p className="text-xs text-slate-400">
                                आवेदक: <strong className="text-slate-200">{sub.accountHolder || 'क्रिएटर'}</strong> • {sub.verifiedEmail}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              isPending
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : isApproved
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {isPending ? '⏳ समीक्षाधीन (Pending)' : isApproved ? '✅ स्वीकृत (Approved)' : '❌ अस्वीकृत'}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('hi-IN') : 'अभी-अभी'}
                            </span>
                          </div>
                        </div>

                        {/* PAN Card Identity Highlight */}
                        {(sub.panCardHolderName || sub.panName) && (
                          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                                🪪
                              </div>
                              <div>
                                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                                  {language === 'hi' ? 'पैन कार्ड पर मूल नाम (PAN Card Full Name)' : 'Name as per PAN Card'}
                                </span>
                                <span className="text-sm font-black text-amber-200 font-mono">
                                  {sub.panCardHolderName || sub.panName}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-slate-400">
                              चैनल: <strong className="text-slate-200">{sub.channelName}</strong> • {sub.panNumber ? `PAN: ${sub.panNumber}` : 'फोटो संलग्न'}
                            </div>
                          </div>
                        )}

                        {/* KYC, Bank Details & 24h Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* 1. Mobile, Aadhaar & PAN */}
                          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                              <span>पहचान (Aadhaar & PAN)</span>
                            </div>
                            <p className="text-xs text-slate-200 font-mono font-bold">
                              📞 {sub.mobileNumber ? `+91 ${sub.mobileNumber}` : 'उपलब्ध नहीं'}
                            </p>
                            <p className="text-xs text-slate-300 font-mono">
                              🪪 आधार: {sub.aadhaarNumber || 'लागू नहीं'}
                            </p>
                            {sub.panNumber && (
                              <p className="text-xs text-amber-300 font-mono font-semibold">
                                💳 PAN: {sub.panNumber}
                              </p>
                            )}
                            {(sub.panCardHolderName || sub.panName) && (
                              <p className="text-[11px] text-amber-400 font-medium truncate">
                                👤 PAN नाम: {sub.panCardHolderName || sub.panName}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {(sub.aadhaarFrontPhotoUrl || sub.aadhaarPhotoUrl) && (
                                <button
                                  onClick={() => setZoomedPhoto(sub.aadhaarFrontPhotoUrl || sub.aadhaarPhotoUrl || null)}
                                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>आधार Front</span>
                                </button>
                              )}
                              {sub.aadhaarBackPhotoUrl && (
                                <button
                                  onClick={() => setZoomedPhoto(sub.aadhaarBackPhotoUrl || null)}
                                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>आधार Back</span>
                                </button>
                              )}
                              {sub.panPhotoUrl && (
                                <button
                                  onClick={() => setZoomedPhoto(sub.panPhotoUrl || null)}
                                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>PAN फोटो</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 2. Bank Details */}
                          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>बैंक विवरण</span>
                            </div>
                            <p className="text-xs text-slate-200 font-bold">
                              🏦 {sub.bankName || 'स्टेट बैंक ऑफ इंडिया'}
                            </p>
                            <p className="text-xs text-slate-300 font-mono">
                              A/C: {sub.accountNumber || '****'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              IFSC: {sub.ifscCode || 'SBIN000000'} {sub.branchName ? `• ${sub.branchName}` : ''}
                            </p>
                          </div>

                          {/* 3. UPI & Account Owner */}
                          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <IndianRupee className="w-3.5 h-3.5 text-purple-400" />
                              <span>UPI व भुगतान आईडी</span>
                            </div>
                            <p className="text-xs text-amber-300 font-mono font-bold">
                              ⚡ {sub.upiId || 'लागू नहीं'}
                            </p>
                            <p className="text-xs text-slate-400">
                              खाताधारक: <span className="text-slate-200">{sub.accountHolder || sub.channelName}</span>
                            </p>
                          </div>

                          {/* 4. 24-Hour Views & Ads Real-time Tracking */}
                          {(() => {
                            const stats24h = getCreator24HourTotals(sub.ownerUid || sub.id, videoSubmissions as any[]);
                            return (
                              <div className="bg-slate-900/90 rounded-xl p-3 border border-amber-500/30 space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                                  <span>24 घंटे की गतिविधि</span>
                                  <Clock className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-400">24h व्यूज:</span>
                                  <strong className="text-blue-400 font-mono">{stats24h.views24h.toLocaleString('en-IN')}</strong>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-400">24h विज्ञापन:</span>
                                  <strong className="text-amber-400 font-mono">{stats24h.adImpressions24h.toLocaleString('en-IN')} Ads</strong>
                                </div>
                                <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                                  <span>कुल: {stats24h.totalViews} views</span>
                                  <span>{stats24h.totalAds} ads</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Admin Direct Payout Section (For Manual External/Internal Payouts) */}
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                              <span>एडमिन पेआउट अपडेट (Admin Manual Payout Release)</span>
                            </span>
                            <span className="text-[11px] text-slate-400">
                              PAN नाम: <strong className="text-amber-300">{sub.panCardHolderName || sub.panName || sub.accountHolder}</strong>
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="relative flex-1 sm:max-w-xs">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                placeholder="पेआउट राशि (₹)"
                                value={payoutAmounts[sub.id] || ''}
                                onChange={(e) => setPayoutAmounts(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                              />
                            </div>

                            <input
                              type="text"
                              placeholder="रिमार्क / नोट (जैसे: 24h विज्ञापन व व्यूज अनुसार)"
                              value={payoutNotes[sub.id] || ''}
                              onChange={(e) => setPayoutNotes(prev => ({ ...prev, [sub.id]: e.target.value }))}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                            />

                            <button
                              type="button"
                              onClick={() => handleAdminPayoutSubmit(sub)}
                              disabled={payoutSubmitting[sub.id]}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition shrink-0"
                            >
                              {payoutSubmitting[sub.id] ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <IndianRupee className="w-3.5 h-3.5" />
                              )}
                              <span>पेमेंट अपडेट करें</span>
                            </button>
                          </div>

                          {payoutStatusMsg[sub.id] && (
                            <div className={`text-xs p-2 rounded-lg ${
                              payoutStatusMsg[sub.id].success 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {payoutStatusMsg[sub.id].text}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleApproveChannelAction(sub.id)}
                                disabled={actionLoading === sub.id}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition"
                              >
                                {actionLoading === sub.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                                <span>{language === 'hi' ? '✅ चैनल स्वीकृत करें (Approve Channel)' : 'Approve Channel'}</span>
                              </button>

                              <button
                                onClick={() => setRejectingItem({ type: 'channel', id: sub.id, title: sub.channelName })}
                                disabled={actionLoading === sub.id}
                                className="py-2.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>{language === 'hi' ? 'अस्वीकृत करें' : 'Reject'}</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center justify-between w-full text-xs text-slate-400">
                              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                {sub.status === 'approved' ? 'चैनल एक्टिव व स्वीकृत है (Active Creator)' : 'आवेदन अस्वीकृत (Rejected)'}
                              </span>

                              {onDeleteChannelSubmission && (
                                <button
                                  onClick={() => onDeleteChannelSubmission(sub.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-slate-800 transition"
                                  title="आवेदन हटाएं"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. REVENUE & MANUAL PAYOUTS DASHBOARD                    */}
          {/* ======================================================== */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-900/30 border border-amber-500/40 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-300 font-bold">पेमेंट प्रणाली (Payout System)</span>
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                    100% एडमिन नियंत्रित
                  </h3>
                  <p className="text-[11px] text-amber-200/80">
                    ऑटो-स्प्लिट बंद: भुगतान केवल एडमिन पैनल से 24h रिपोर्ट व PAN देखकर जारी होगा
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/30 border border-emerald-500/40 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-300 font-bold">आधिकारिक एडमिन UPI आईडी</span>
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white font-mono truncate">
                    sanjaykushwaha975297@oksbi
                  </h3>
                  <p className="text-[11px] text-emerald-200/80">
                    प्रमोशन भुगतान व प्लेटफॉर्म रेवेन्यू प्राप्त करने हेतु अधिकृत खाता
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-blue-900/30 border border-blue-500/40 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-300 font-bold">सत्यापित क्रिएटर चैनल्स</span>
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                    {channelSubmissions.length}
                  </h3>
                  <p className="text-[11px] text-blue-200/80">
                    {channelSubmissions.filter(c => c.status === 'approved').length} एक्टिव चैनल्स • PAN कार्ड रिकॉर्ड सुरक्षित
                  </p>
                </div>
              </div>

              {/* Monthly Creator Withdrawal Window Control Panel (Firebase Remote Config) */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isWithdrawalUnlocked
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {isWithdrawalUnlocked ? <Lock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2 font-bundeli">
                        <span>मासिक क्रिएटर निकासी विंडो नियंत्रण (Withdrawal Window 1-5 तारीख)</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isWithdrawalUnlocked
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {isWithdrawalUnlocked ? '🔓 UNLOCKED (विंडो खुली है)' : '🔒 LOCKED (विंडो बंद है)'}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Firebase `config/app_config` द्वारा नियंत्रित। क्रिएटर केवल 1 से 5 तारीख के बीच न्यूनतम ₹5,000 की निकासी कर सकते हैं।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                      न्यूनतम सीमा: ₹{withdrawalMinAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block font-semibold">निकासी समय-सीमा (Allowed Window)</span>
                    <strong className="text-amber-300 font-mono text-sm block">1 से 5 तारीख (हर महीने)</strong>
                    <span className="text-[11px] text-slate-500">तारीख 6 को यह स्वचालित/मैनुअल लॉक हो जाता है</span>
                  </div>

                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block font-semibold">न्यूनतम निकासी राशि (Min Limit)</span>
                    <strong className="text-emerald-400 font-mono text-sm block">₹5,000 (पाँच हजार रुपये)</strong>
                    <span className="text-[11px] text-slate-500">₹5,000 से कम का विथड्रॉल स्वीकार नहीं होगा</span>
                  </div>

                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block font-semibold">वर्तमान स्थिति (Status in Firebase)</span>
                    <strong className={`font-mono text-sm block ${isWithdrawalUnlocked ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isWithdrawalUnlocked ? 'अनलॉक (Active in 1-5 window)' : 'लॉक (Locked by Admin)'}
                    </strong>
                    <span className="text-[11px] text-slate-500">Admin toggle directly updates Firestore</span>
                  </div>
                </div>

                {/* Big Action Button for Admin Toggle */}
                <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleWithdrawalWindow(!isWithdrawalUnlocked)}
                    disabled={isTogglingWithdrawal}
                    className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50 ${
                      isWithdrawalUnlocked
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    }`}
                  >
                    {isTogglingWithdrawal ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : isWithdrawalUnlocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span>
                      {isWithdrawalUnlocked
                        ? '🔒 [6 तारीख] निकासी विंडो लॉक करें (Lock Withdrawal Window)'
                        : '🔓 [1 तारीख] निकासी विंडो अनलॉक करें (Open Withdrawal Window for 1st-5th)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Security & Payout Instructions Notice */}
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 space-y-2">
                <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>एडमिन पेआउट व विज्ञापन आय वितरण नियम (Admin Controlled Ad Payout Protocol)</span>
                </h4>
                <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                  <p>• <strong>स्वचालित विज्ञापन आय कैलकुलेटर:</strong> नीचे दिए गए टूल में 1 विज्ञापन का रेट या कुल विज्ञापन बजट दर्ज करें। सिस्टम सभी क्रिएटर्स के विज्ञापनों की संख्या के हिसाब से उनके वॉलेट में स्वतः राशि क्रेडिट कर देगा।</p>
                  <p>• <strong>Firebase Firestore ऑटो-सिंक:</strong> जैसे ही आप वितरण बटन दबाएँगे, सभी क्रिएटर्स के <code>wallets</code>, <code>channels</code> और <code>ad_revenue_distributions</code> में तत्काल नया बैलेंस और ट्रांजेक्शन जुड़ जाएगा।</p>
                  <p>• <strong>50-50 रेवेन्यू शेयर:</strong> मानक बुंदेलीट्यूब नियम के अनुसार 50% राशि क्रिएटर के खाते में जाएगी और 50% प्लेटफॉर्म में रहेगी।</p>
                  <p>• <strong>पैन कार्ड सत्यापन:</strong> भुगतान रिकॉर्ड में क्रिएटर का ओरिजिनल पैन कार्ड नाम दर्ज रहेगा।</p>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* ⚡ AUTOMATED AD REVENUE DISTRIBUTION PANEL (1 AD KA KITNA PESA & AUTOPAY)   */}
              {/* ========================================================================= */}
              {(() => {
                const effectiveRateVal = rateInputMode === 'per_ad'
                  ? (parseFloat(adRateInput) || 0)
                  : (parseFloat(totalAdsInput) > 0 ? (parseFloat(totalBudgetInput) || 0) / parseFloat(totalAdsInput) : 0);
                const netCreatorRateVal = effectiveRateVal * (creatorSharePercent / 100);

                let livePreviewTotalAds = 0;
                let livePreviewTotalAmt = 0;
                let livePreviewEligibleCount = 0;

                channelSubmissions.forEach(sub => {
                  const ads = customCreatorAds[sub.id] !== undefined
                    ? Number(customCreatorAds[sub.id])
                    : getCreatorEligibleAds(sub, videoSubmissions as any[], calculationBasis);
                  if (ads > 0) {
                    livePreviewTotalAds += ads;
                    livePreviewTotalAmt += Math.round(ads * netCreatorRateVal * 100) / 100;
                    livePreviewEligibleCount += 1;
                  }
                });
                livePreviewTotalAmt = Math.round(livePreviewTotalAmt * 100) / 100;

                return (
                  <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-5 space-y-5 shadow-2xl">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-bundeli">
                            <span>स्वचालित विज्ञापन आय कैलकुलेटर व क्रिएटर वॉलेट क्रेडिट</span>
                            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase">
                              Auto-Credit to Firebase
                            </span>
                          </h3>
                          <p className="text-xs text-slate-300">
                            1 विज्ञापन का रेट या कुल बजट डालें — सिस्टम सभी क्रिएटर्स के विज्ञापनों के हिसाब से ऑटोमैटिक वॉलेट में पैसे जोड़ देगा।
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowBatchHistory(!showBatchHistory)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>वितरण इतिहास ({distributionBatches.length})</span>
                        </button>
                      </div>
                    </div>

                    {/* Mode Toggle & Rate Input Controls */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Left: Rate Calculation Options */}
                      <div className="lg:col-span-2 bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">दर निर्धारण विधि (Rate Setting Mode):</span>
                          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                            <button
                              type="button"
                              onClick={() => setRateInputMode('per_ad')}
                              className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                                rateInputMode === 'per_ad'
                                  ? 'bg-emerald-600 text-white shadow'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              1 Ad का सीधा रेट (₹)
                            </button>
                            <button
                              type="button"
                              onClick={() => setRateInputMode('total_budget')}
                              className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                                rateInputMode === 'total_budget'
                                  ? 'bg-emerald-600 text-white shadow'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              कुल बजट व विज्ञापनों से निकालें
                            </button>
                          </div>
                        </div>

                        {rateInputMode === 'per_ad' ? (
                          <div className="space-y-2">
                            <label className="text-xs text-emerald-400 font-bold block">
                              1 Ads का कितना पैसा पड़ा / प्रति विज्ञापन दर (₹):
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="जैसे: 0.50 या 1.00"
                                value={adRateInput}
                                onChange={(e) => setAdRateInput(e.target.value)}
                                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border-2 border-emerald-500/40 text-slate-100 font-mono font-bold text-base focus:border-emerald-400 focus:outline-none"
                              />
                            </div>
                            {/* Preset Quick Chips */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] text-slate-400 mr-1">त्वरित दर:</span>
                              {['0.20', '0.35', '0.50', '0.75', '1.00', '1.50', '2.00'].map((rate) => (
                                <button
                                  key={rate}
                                  type="button"
                                  onClick={() => setAdRateInput(rate)}
                                  className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                                    adRateInput === rate
                                      ? 'bg-emerald-500 text-slate-950'
                                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                                  }`}
                                >
                                  ₹{rate}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs text-emerald-400 font-bold block">
                                कुल विज्ञापन बजट / आय (₹):
                              </label>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="जैसे: 10000"
                                  value={totalBudgetInput}
                                  onChange={(e) => setTotalBudgetInput(e.target.value)}
                                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm focus:border-emerald-400 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs text-amber-400 font-bold block">
                                कुल चले विज्ञापन (Total Ads):
                              </label>
                              <input
                                type="number"
                                min="1"
                                placeholder="जैसे: 20000"
                                value={totalAdsInput}
                                onChange={(e) => setTotalAdsInput(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm focus:border-amber-400 focus:outline-none"
                              />
                            </div>

                            <div className="sm:col-span-2 text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                              <span>गणना दर (Auto Calculated 1 Ad Rate):</span>
                              <strong className="text-emerald-400 font-mono text-sm">
                                ₹{effectiveRateVal > 0 ? effectiveRateVal.toFixed(4) : '0.00'} प्रति विज्ञापन
                              </strong>
                            </div>
                          </div>
                        )}

                        {/* Revenue Share Percentage Selector */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-300 block">क्रिएटर शेयर प्रतिशत (Creator Share %):</span>
                            <span className="text-[11px] text-slate-400">बुंदेलीट्यूब नियम: 50% क्रिएटर, 50% प्लेटफॉर्म</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {[50, 60, 70, 100].map(pct => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setCreatorSharePercent(pct)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  creatorSharePercent === pct
                                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                              >
                                {pct}% {pct === 50 ? '(मानक)' : ''}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Note Input */}
                        <div className="pt-1">
                          <input
                            type="text"
                            placeholder="वितरण रिमार्क (उदा: मासिक विज्ञापन आय वितरण - मार्च 2026)"
                            value={distributionAdminNote}
                            onChange={(e) => setDistributionAdminNote(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Right: Live Calculation Metrics Box */}
                      <div className="bg-gradient-to-br from-emerald-950/40 via-slate-950 to-emerald-950/30 border-2 border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3">
                        <div>
                          <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block">
                            लाइव गणना सारांश (Live Summary)
                          </span>
                          <h4 className="text-sm font-bold text-slate-200 mt-1">
                            क्रिएटर वॉलेट में जाने वाली कुल राशि
                          </h4>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-emerald-400 font-mono">
                              ₹{livePreviewTotalAmt.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            1 Ad का कुल भाव: <strong className="text-white font-mono">₹{effectiveRateVal.toFixed(4)}</strong> • क्रिएटर को ({creatorSharePercent}%): <strong className="text-amber-300 font-mono">₹{netCreatorRateVal.toFixed(4)}</strong>/ad
                          </p>
                        </div>

                        <div className="space-y-2 border-t border-slate-800/80 pt-3 text-xs">
                          <div className="flex justify-between text-slate-400">
                            <span>कुल योग्य क्रिएटर:</span>
                            <strong className="text-slate-100 font-mono">{livePreviewEligibleCount} क्रिएटर</strong>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>कुल गिने गए विज्ञापन:</span>
                            <strong className="text-amber-300 font-mono">{livePreviewTotalAds.toLocaleString('en-IN')} Ads</strong>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>गणना स्रोत (Basis):</span>
                            <select
                              value={calculationBasis}
                              onChange={(e) => setCalculationBasis(e.target.value as any)}
                              className="bg-slate-900 text-[11px] text-slate-200 rounded border border-slate-700 px-1 py-0.5"
                            >
                              <option value="all_ads">सभी विज्ञापन (लॉन्ग + पूल)</option>
                              <option value="total_long_impressions">केवल लॉन्ग वीडियो ऐड्स</option>
                              <option value="24h_ads">पिछले 24 घंटे के ऐड्स</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleExecuteAdRevenueDistribution}
                          disabled={isDistributingAds || effectiveRateVal <= 0 || livePreviewTotalAmt <= 0}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                        >
                          {isDistributingAds ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4 text-amber-300" />
                          )}
                          <span>
                            {isDistributingAds 
                              ? 'वॉलेट में क्रेडिट हो रहा है...' 
                              : `⚡ सभी ${livePreviewEligibleCount} क्रिएटर्स के वॉलेट में जोड़ें`}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Result Message Alert */}
                    {distResultMsg && (
                      <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 font-bold ${
                        distResultMsg.success 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {distResultMsg.success ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                        <span>{distResultMsg.text}</span>
                      </div>
                    )}

                    {/* Live Creator Breakdown Preview Table */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>प्रत्येक क्रिएटर के विज्ञापन व जुड़ने वाली राशि की सूची:</span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          (आवश्यकतानुसार किसी क्रिएटर के विज्ञापन एडिट भी कर सकते हैं)
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {channelSubmissions.map((sub) => {
                          const currentAds = customCreatorAds[sub.id] !== undefined
                            ? Number(customCreatorAds[sub.id])
                            : getCreatorEligibleAds(sub, videoSubmissions as any[], calculationBasis);
                          const payable = Math.round(currentAds * netCreatorRateVal * 100) / 100;
                          const panName = sub.panCardHolderName || sub.panName || sub.accountHolder;

                          return (
                            <div
                              key={`preview-${sub.id}`}
                              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={sub.channelLogoUrl || sub.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                  alt={sub.channelName}
                                  className="w-10 h-10 rounded-full object-cover border border-amber-500/40 shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-xs text-slate-100">{sub.channelName}</h4>
                                    <span className="text-[10px] text-slate-400 font-mono">PAN: {panName || 'N/A'}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400">
                                    UPI: <span className="font-mono text-amber-300">{sub.upiId || 'N/A'}</span> • A/C: <span className="font-mono">{sub.accountNumber || 'N/A'}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-end sm:self-center">
                                {/* Editable or Displayed Ads count */}
                                <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700">
                                  <span className="text-[10px] text-slate-400 font-bold">Ads:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={currentAds}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseInt(e.target.value) || 0);
                                      setCustomCreatorAds(prev => ({ ...prev, [sub.id]: val }));
                                    }}
                                    className="w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-amber-300 text-center focus:outline-none"
                                  />
                                </div>

                                {/* Calculation Badge */}
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 block font-mono">
                                    {currentAds} × ₹{netCreatorRateVal.toFixed(2)}
                                  </span>
                                  <strong className="text-sm font-mono font-black text-emerald-400">
                                    +₹{payable.toFixed(2)}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Past Distribution Batches History Section */}
                    {showBatchHistory && (
                      <div className="space-y-3 pt-3 border-t border-slate-800 bg-slate-950/90 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>पिछले विज्ञापन वितरण रिकॉर्ड्स (Distribution History in Firestore)</span>
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            कुल बैच: {distributionBatches.length}
                          </span>
                        </div>

                        {distributionBatches.length === 0 ? (
                          <p className="text-xs text-slate-500 py-3 text-center">
                            अभी तक कोई स्वचालित वितरण रिकॉर्ड दर्ज नहीं है।
                          </p>
                        ) : (
                          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                            {distributionBatches.map(batch => (
                              <div
                                key={batch.id}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                                  <div>
                                    <span className="font-mono text-emerald-400 font-bold">
                                      बैच #{batch.batchId}
                                    </span>
                                    <span className="text-slate-400 ml-2">
                                      {new Date(batch.createdAt).toLocaleString('hi-IN')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-amber-300 font-mono font-bold">
                                      1 Ad दर: ₹{batch.ratePerAd.toFixed(2)} ({batch.creatorSharePercentage}% शेयर)
                                    </span>
                                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-black text-[11px]">
                                      कुल: ₹{batch.totalAmount.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-400">
                                  <span>
                                    क्रिएटर: <strong className="text-slate-200">{batch.totalCreators}</strong> • कुल विज्ञापन: <strong className="text-amber-300">{batch.totalAds}</strong> • {batch.adminNote || 'ऑटो-वितरण'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedBatchId(expandedBatchId === batch.id ? null : batch.id)}
                                    className="text-amber-400 hover:underline cursor-pointer font-bold"
                                  >
                                    {expandedBatchId === batch.id ? 'विवरण छिपाएं ▲' : 'विवरण देखें ▼'}
                                  </button>
                                </div>

                                {expandedBatchId === batch.id && batch.creatorsBreakdown && (
                                  <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                                    {batch.creatorsBreakdown.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-[10px] text-slate-300 py-0.5">
                                        <span>• {item.channelName} ({item.panCardHolderName || 'N/A'}) - {item.adsCount} Ads</span>
                                        <strong className="text-emerald-400 font-mono">+₹{item.creditedAmount.toFixed(2)}</strong>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Creators 24H Performance & Payout Management Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>क्रिएटर 24 घंटे विज्ञापन व व्यूज रिपोर्ट एवं पेआउट</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      ओरिजिनल पैन कार्ड नाम, 24 घंटे के विज्ञापन/व्यूज और सीधे पेआउट अपडेट
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    कुल क्रिएटर: {channelSubmissions.length}
                  </span>
                </div>

                {channelSubmissions.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    वर्तमान में कोई क्रिएटर चैनल पंजीकृत नहीं है।
                  </div>
                ) : (
                  <div className="space-y-4">
                    {channelSubmissions.map((sub) => {
                      const stats24h = getCreator24HourTotals(sub.ownerUid || sub.id, videoSubmissions as any[]);
                      const panName = sub.panCardHolderName || sub.panName || sub.accountHolder;

                      return (
                        <div
                          key={sub.id}
                          className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 transition"
                        >
                          {/* Channel & PAN Identity Header */}
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                            <div className="flex items-center gap-3">
                              <img
                                src={sub.channelLogoUrl || sub.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                alt={sub.channelName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40 shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-slate-100">{sub.channelName}</h4>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    sub.status === 'approved' 
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  }`}>
                                    {sub.status === 'approved' ? 'एक्टिव क्रिएटर' : 'समीक्षाधीन'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400">
                                  आवेदक: <strong className="text-slate-300">{sub.accountHolder || 'क्रिएटर'}</strong> • फोन: +91 {sub.mobileNumber || 'N/A'}
                                </p>
                              </div>
                            </div>

                            {/* Prominent PAN Card Verification Badge */}
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base">
                                🪪
                              </div>
                              <div>
                                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                                  पैन कार्ड पर मूल नाम (PAN Card Name)
                                </span>
                                <span className="text-xs sm:text-sm font-black text-amber-200 font-mono">
                                  {panName}
                                </span>
                              </div>
                              {sub.panPhotoUrl && (
                                <button
                                  type="button"
                                  onClick={() => setZoomedPhoto(sub.panPhotoUrl || null)}
                                  className="ml-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>फोटो</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 24-Hour Metrics, Long Video Impressions & Bank Info */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="bg-slate-900/90 rounded-xl p-3 border border-blue-500/20">
                              <span className="text-[10px] text-slate-400 block">24 घंटे के व्यूज</span>
                              <strong className="text-base font-black text-blue-400 font-mono">
                                {stats24h.views24h.toLocaleString('en-IN')}
                              </strong>
                              <span className="text-[9px] text-slate-500 block">कुल: {stats24h.totalViews}</span>
                            </div>

                            <div className="bg-slate-900/90 rounded-xl p-3 border border-amber-500/30">
                              <span className="text-[10px] text-amber-400 font-bold block">24h में विज्ञापन</span>
                              <strong className="text-base font-black text-amber-300 font-mono">
                                {stats24h.adImpressions24h.toLocaleString('en-IN')} Ads
                              </strong>
                              <span className="text-[9px] text-slate-500 block">कुल: {stats24h.totalAds} ads</span>
                            </div>

                            <div className="bg-slate-900/90 rounded-xl p-3 border border-purple-500/30">
                              <span className="text-[10px] text-purple-400 font-bold block">लॉन्ग वीडियो ऐड्स</span>
                              <strong className="text-base font-black text-purple-300 font-mono">
                                {(sub.total_long_impressions || sub.totalAdImpressions || 0).toLocaleString('en-IN')}
                              </strong>
                              <span className="text-[9px] text-slate-500 block">total_long_impressions</span>
                            </div>

                            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">बैंक व खाता</span>
                              <p className="text-xs text-slate-200 font-bold truncate">
                                {sub.bankName || 'SBI'}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                A/C: {sub.accountNumber || '****'}
                              </span>
                            </div>

                            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">UPI आईडी</span>
                              <p className="text-xs text-amber-300 font-mono font-bold truncate">
                                {sub.upiId || 'उपलब्ध नहीं'}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                IFSC: {sub.ifscCode || 'SBIN000000'}
                              </span>
                            </div>
                          </div>

                          {/* Direct Payout Input & Update Action */}
                          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="relative w-full sm:w-44">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                              <input
                                type="number"
                                min="1"
                                placeholder="पेआउट राशि (₹)"
                                value={payoutAmounts[sub.id] || ''}
                                onChange={(e) => setPayoutAmounts(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                className="w-full pl-7 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                              />
                            </div>

                            <input
                              type="text"
                              placeholder="रिमार्क (जैसे: 24h में 120 विज्ञापन और 1500 व्यूज हेतु भुगतान)"
                              value={payoutNotes[sub.id] || ''}
                              onChange={(e) => setPayoutNotes(prev => ({ ...prev, [sub.id]: e.target.value }))}
                              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                            />

                            <button
                              type="button"
                              onClick={() => handleAdminPayoutSubmit(sub)}
                              disabled={payoutSubmitting[sub.id]}
                              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition shrink-0"
                            >
                              {payoutSubmitting[sub.id] ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <IndianRupee className="w-3.5 h-3.5" />
                              )}
                              <span>पेमेंट अपडेट करें</span>
                            </button>
                          </div>

                          {payoutStatusMsg[sub.id] && (
                            <div className={`text-xs p-2.5 rounded-lg ${
                              payoutStatusMsg[sub.id].success 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {payoutStatusMsg[sub.id].text}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 5-Shorts Rule Ad Pools Review Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>शॉर्ट्स ऐड पूल रिकॉर्ड्स (short_ad_pools — 5-Shorts Rule)</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        प्रत्येक 5 शॉर्ट्स देखने के बाद 6ठे स्लॉट पर चले विज्ञापन पर दर्ज पिछले 5 शॉर्ट्स के क्रिएटर IDs
                      </p>
                    </div>
                    <span className="text-xs text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      कुल रिकॉर्ड्स: {shortAdPools.length}
                    </span>
                  </div>

                  {shortAdPools.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                      वर्तमान में कोई शॉर्ट्स ऐड पूल दर्ज नहीं है। जब भी कोई यूजर 5 शॉर्ट्स देखेगा और 6ठे पर विज्ञापन चलेगा, पिछले 5 क्रिएटर्स की IDs यहाँ रियल-टाइम आ जाएगी।
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {shortAdPools.map((pool) => (
                        <div key={pool.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-emerald-400">पूल ID: {pool.id}</span>
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                                {pool.watched_count || (pool.creatorIds?.length || 0)} क्रिएटर्स
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {pool.createdAt ? new Date(pool.createdAt).toLocaleString('hi-IN') : 'हाल ही में'}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 block font-bold">शॉर्ट्स देखने वाले 5 क्रिएटर IDs:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {(pool.creatorIds || pool.creator_ids || []).map((cid, i) => (
                                <span key={i} className="text-[11px] font-mono bg-slate-900 border border-slate-700 text-amber-300 px-2 py-0.5 rounded">
                                  #{i + 1} {cid}
                                </span>
                              ))}
                            </div>
                          </div>

                          {pool.watchedVideos && pool.watchedVideos.length > 0 && (
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                              वीडियोज: {pool.watchedVideos.map(v => v.videoTitle || v.channelName).filter(Boolean).join(' • ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. VIDEO ADS & MONETIZATION SETTINGS                      */}
          {/* ======================================================== */}
          {activeTab === 'ads' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header Card */}
              <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-amber-950/30 border border-purple-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {language === 'hi' ? '📢 यूट्यूब-जैसे वीडियो विज्ञापन (In-Stream Video Ads)' : '📢 YouTube-style In-Stream Video Ads'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {language === 'hi'
                          ? 'वीडियो शुरू होने से पहले (Pre-roll), बीच में (Mid-roll), व अंत में 5-सेकंड स्किपेबल विज्ञापन चलाएं और 50% रेवेन्यू कमाएं।'
                          : 'Configure pre-roll, mid-roll, and post-roll skippable video ads with 50-50 revenue split.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-300 font-semibold cursor-pointer">
                      {enableVideoAds ? (
                        <span className="text-emerald-400 font-bold">सक्रिय (Active)</span>
                      ) : (
                        <span className="text-slate-500">निष्क्रिय (Disabled)</span>
                      )}
                    </label>
                    <input
                      type="checkbox"
                      checked={enableVideoAds}
                      onChange={(e) => setEnableVideoAds(e.target.checked)}
                      className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Official Google AdMob Production Units Card */}
              <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-white">
                          {language === 'hi' ? 'Google AdMob आधिकारिक विज्ञापन इकाइयाँ' : 'Google AdMob Official Production Units'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          {language === 'hi' ? 'सत्यापित खाता' : 'Verified'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {language === 'hi' 
                          ? 'पब्लिशर ID: pub-5666532653138550 | ग्राहक ID: 647-489-8116'
                          : 'Publisher ID: pub-5666532653138550 | Customer ID: 647-489-8116'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs text-slate-300 font-semibold">
                      {enableAdMob ? (language === 'hi' ? 'AdMob ऑन' : 'AdMob ON') : (language === 'hi' ? 'AdMob ऑफ' : 'AdMob OFF')}
                    </span>
                    <input
                      type="checkbox"
                      checked={enableAdMob}
                      onChange={(e) => setEnableAdMob(e.target.checked)}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* AdMob App ID */}
                  <div className="md:col-span-2 bg-slate-900/90 p-4 rounded-xl border border-amber-500/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        <span>{language === 'hi' ? 'AdMob App ID (Android & Web App)' : 'AdMob App ID (Android & Web App)'}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(admobAppId);
                          setCopiedAdUnit('appId');
                          setTimeout(() => setCopiedAdUnit(null), 2000);
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedAdUnit === 'appId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAdUnit === 'appId' ? (language === 'hi' ? 'कॉपी हुआ!' : 'Copied!') : (language === 'hi' ? 'कॉपी' : 'Copy')}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={admobAppId}
                      onChange={(e) => setAdmobAppId(e.target.value)}
                      placeholder="ca-app-pub-5666532653138550~5941128324"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[11px] text-slate-400">
                      {language === 'hi' ? 'मुख्य AdMob एप्लिकेशन पहचानकर्ता' : 'Primary AdMob Application ID'}
                    </p>
                  </div>

                  {/* Bundeli Banner */}
                  <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200">
                        1. Bundeli Banner (Banner)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(admobBannerId);
                          setCopiedAdUnit('banner');
                          setTimeout(() => setCopiedAdUnit(null), 2000);
                        }}
                        className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedAdUnit === 'banner' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAdUnit === 'banner' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={admobBannerId}
                      onChange={(e) => setAdmobBannerId(e.target.value)}
                      placeholder="ca-app-pub-5666532653138550/9305658265"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-400">होम पेज और वीडियो प्लेयर बैनर</p>
                  </div>

                  {/* Bundeli Interstitial */}
                  <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200">
                        2. Bundeli Interstitial (Interstitial)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(admobInterstitialId);
                          setCopiedAdUnit('interstitial');
                          setTimeout(() => setCopiedAdUnit(null), 2000);
                        }}
                        className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedAdUnit === 'interstitial' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAdUnit === 'interstitial' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={admobInterstitialId}
                      onChange={(e) => setAdmobInterstitialId(e.target.value)}
                      placeholder="ca-app-pub-5666532653138550/9245948510"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-400">फुल-स्क्रीन इंटरस्टिशियल विज्ञापन</p>
                  </div>

                  {/* Bundeli Reward */}
                  <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200">
                        3. Bundeli Reward (Rewarded)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(admobRewardedId);
                          setCopiedAdUnit('rewarded');
                          setTimeout(() => setCopiedAdUnit(null), 2000);
                        }}
                        className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedAdUnit === 'rewarded' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAdUnit === 'rewarded' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={admobRewardedId}
                      onChange={(e) => setAdmobRewardedId(e.target.value)}
                      placeholder="ca-app-pub-5666532653138550/1962304537"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-400">रिवॉर्डेड वीडियो विज्ञापन (HD वीडियो अनलॉक)</p>
                  </div>

                  {/* reels feed (Native Advanced) */}
                  <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200">
                        4. reels feed (Native advance)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(admobNativeId);
                          setCopiedAdUnit('native');
                          setTimeout(() => setCopiedAdUnit(null), 2000);
                        }}
                        className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedAdUnit === 'native' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAdUnit === 'native' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={admobNativeId}
                      onChange={(e) => setAdmobNativeId(e.target.value)}
                      placeholder="ca-app-pub-5666532653138550/1582894537"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-400">रील्स / शॉर्ट्स फ़ीड और वीडियो सूची विज्ञापन</p>
                  </div>
                </div>
              </div>

              {/* Ad Rules & Timer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <label className="block text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>{language === 'hi' ? 'स्किप बटन टाइमर (Skip Countdown Seconds)' : 'Skip Countdown Seconds'}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={3}
                      max={30}
                      value={adSkipSeconds}
                      onChange={(e) => setAdSkipSeconds(Number(e.target.value) || 5)}
                      className="w-28 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500 text-center"
                    />
                    <span className="text-xs text-slate-400 font-medium">सेकंड बाद स्किप बटन दिखेगा (डिफ़ॉल्ट 5 सेकंड)</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <label className="block text-xs font-bold text-slate-200 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'hi' ? 'प्रति 1,000 व्यूज विज्ञापन दर (CPM Rate in ₹)' : 'Ad CPM Rate (₹ per 1,000 views)'}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={10}
                      max={2000}
                      value={cpmRate}
                      onChange={(e) => setCpmRate(Number(e.target.value) || 100)}
                      className="w-28 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500 text-center"
                    />
                    <span className="text-xs text-slate-400 font-medium">₹50 क्रिएटर + ₹50 एडमिन प्रति 1000 इम्प्रेशन</span>
                  </div>
                </div>
              </div>

              {/* Custom Video Ad Campaigns Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Film className="w-4 h-4 text-purple-400" />
                    <span>{language === 'hi' ? 'सक्रिय वीडियो विज्ञापन अभियान (Active Video Ads)' : 'Active Video Ad Campaigns'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold">
                      {customAds.length}
                    </span>
                  </h4>

                  <button
                    type="button"
                    onClick={() => setIsAddingNewAd(!isAddingNewAd)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'hi' ? 'नया विज्ञापन जोड़ें' : 'Add New Ad'}</span>
                  </button>
                </div>

                {/* Add New Ad Form */}
                {isAddingNewAd && (
                  <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-5 space-y-4 animate-in fade-in">
                    <h5 className="text-xs font-bold text-purple-300">
                      {language === 'hi' ? '✨ नया इन-स्ट्रीम वीडियो विज्ञापन बनाएं' : '✨ Create New In-Stream Video Ad'}
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">विज्ञापन शीर्षक (Ad Title)</label>
                        <input
                          type="text"
                          placeholder="उदा: बुंदेली हस्तशिल्प मेला"
                          value={newAdTitle}
                          onChange={(e) => setNewAdTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">प्रायोजक / ब्रांड (Sponsor)</label>
                        <input
                          type="text"
                          placeholder="उदा: ओरछा टूरिज्म"
                          value={newAdSponsor}
                          onChange={(e) => setNewAdSponsor(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">वीडियो MP4 URL (Direct Video URL)</label>
                        <input
                          type="text"
                          placeholder="उदा: https://commondatastorage.googleapis.com/.../video.mp4"
                          value={newAdVideoUrl}
                          onChange={(e) => setNewAdVideoUrl(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">बटन टेक्स्ट (CTA Button Text)</label>
                        <input
                          type="text"
                          placeholder="उदा: 30% छूट पाएँ"
                          value={newAdCtaText}
                          onChange={(e) => setNewAdCtaText(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">वेबसाइट लिंक (CTA Destination URL)</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={newAdCtaUrl}
                          onChange={(e) => setNewAdCtaUrl(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAd(false)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                      >
                        रद्द करें
                      </button>
                      <button
                        type="button"
                        onClick={handleAddNewCustomAd}
                        disabled={!newAdTitle.trim() || !newAdVideoUrl.trim()}
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg"
                      >
                        + विज्ञापन जोड़ें
                      </button>
                    </div>
                  </div>
                )}

                {/* Ads List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customAds.map((ad) => (
                    <div
                      key={ad.id}
                      className={`p-4 rounded-2xl border transition ${
                        ad.isActive 
                          ? 'bg-slate-950/80 border-purple-500/30' 
                          : 'bg-slate-950/40 border-slate-800 opacity-60'
                      } space-y-3`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                            {ad.sponsorName}
                          </span>
                          <h5 className="text-xs sm:text-sm font-bold text-white mt-1">{ad.title}</h5>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleCustomAd(ad.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                              ad.isActive
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {ad.isActive ? 'सक्रिय (ON)' : 'बंद (OFF)'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomAd(ad.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-1 font-mono truncate">
                        <p className="truncate">📹 {ad.videoUrl}</p>
                        <p className="text-purple-400">🔗 {ad.ctaText} → {ad.ctaUrl}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button for Ads Settings */}
              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={handleSaveAdsConfig}
                  disabled={isSavingConfig}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition cursor-pointer"
                >
                  {isSavingConfig ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{language === 'hi' ? 'विज्ञापन सेटिंग्स सुरक्षित करें (Save)' : 'Save Ads Settings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. HELPDESK & LIVE CHAT SUPPORT TAB                     */}
          {/* ======================================================== */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span>{language === 'hi' ? 'बुन्देलीट्यूब 24x7 हेल्पडेस्क व लाइव सपोर्ट केंद्र' : 'BundeliTube 24x7 Live Support Hub'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        {supportTickets.length} {language === 'hi' ? 'कुल टिकट' : 'Tickets'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {language === 'hi' 
                        ? 'क्रिएटर्स व दर्शकों के संदेश सीधे फायरबेस डेटाबेस से रीयल-टाइम में प्राप्त करें और उत्तर दें'
                        : 'Real-time two-way synchronization with Firestore support tickets and chat messages'}
                    </p>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setTicketStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      ticketStatusFilter === 'all'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {language === 'hi' ? 'सभी' : 'All'} ({supportTickets.length})
                  </button>
                  <button
                    onClick={() => setTicketStatusFilter('open')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      ticketStatusFilter === 'open'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {language === 'hi' ? 'लंबित' : 'Open'} ({supportTickets.filter(t => t.status === 'open').length})
                  </button>
                  <button
                    onClick={() => setTicketStatusFilter('resolved')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      ticketStatusFilter === 'resolved'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {language === 'hi' ? 'हल किया' : 'Resolved'} ({supportTickets.filter(t => t.status === 'resolved').length})
                  </button>
                </div>
              </div>

              {/* Two-Column Support Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[480px]">
                
                {/* Left Column: Tickets List */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2 max-h-[580px] overflow-y-auto">
                  <div className="flex items-center justify-between px-2 py-1 text-xs font-bold text-slate-400 border-b border-slate-800/80 mb-2">
                    <span>{language === 'hi' ? 'प्राप्त सहायता टिकट' : 'Incoming Tickets'}</span>
                    <span className="text-[10px] text-slate-500">{supportTickets.length} कुल</span>
                  </div>

                  {supportTickets.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-400" />
                      <p>{language === 'hi' ? 'अभी कोई नया टिकट नहीं मिला है।' : 'No support tickets found in Firebase.'}</p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {language === 'hi' ? 'यूजर जब हेल्प सेंटर से टिकट या चैट भेजेगा, यहाँ तुरंत दिखेगा।' : 'Tickets submitted by users will appear here live.'}
                      </p>
                    </div>
                  ) : (
                    supportTickets
                      .filter(t => ticketStatusFilter === 'all' || t.status === ticketStatusFilter)
                      .map((ticket) => {
                        const isSelected = selectedTicket?.id === ticket.id;
                        const isResolved = ticket.status === 'resolved';

                        return (
                          <div
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                              isSelected
                                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                                : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-xs text-slate-200 line-clamp-1">
                                {ticket.userName || ticket.email || 'उपयोगकर्ता'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isResolved
                                  ? 'bg-slate-800 text-slate-400'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                              }`}>
                                {isResolved ? 'सुलझा' : 'खुला'}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-emerald-300 line-clamp-1 mb-1">
                              {ticket.subject || 'सामान्य सहायता अनुरोध'}
                            </p>

                            <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                              {ticket.message || 'कोई विस्तृत विवरण नहीं'}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                              <span>🆔 {ticket.id}</span>
                              <span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'आज'}</span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>

                {/* Right Column: Active Conversation & Reply Window */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col min-h-[580px] max-h-[580px] overflow-hidden">
                  {selectedTicket ? (
                    <>
                      {/* Ticket Info Header */}
                      <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                              {selectedTicket.subject || 'सहायता चैट'}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold shrink-0">
                              {selectedTicket.category || 'सामान्य'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            👤 {selectedTicket.userName || 'उपयोगकर्ता'} {selectedTicket.email ? `• 📧 ${selectedTicket.email}` : ''} {selectedTicket.phone ? `• 📞 ${selectedTicket.phone}` : ''}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleTicketStatus(selectedTicket.id, selectedTicket.status)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                            selectedTicket.status === 'resolved'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          }`}
                        >
                          {selectedTicket.status === 'resolved' ? '🔄 पुनः खोलें (Reopen)' : '✅ समाधान चिह्नित करें (Resolve)'}
                        </button>
                      </div>

                      {/* Original Issue Card */}
                      <div className="p-3 bg-slate-900/40 border-b border-slate-800/80 text-xs text-slate-300">
                        <span className="font-bold text-slate-400 block mb-1">📝 उपयोगकर्ता द्वारा दर्ज समस्या:</span>
                        <p className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-200">
                          {selectedTicket.message || 'कोई विस्तृत संदेश नहीं'}
                        </p>
                      </div>

                      {/* Live Chat History */}
                      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-950">
                        <div className="text-center text-[11px] text-slate-500 my-1">
                          🔒 फायरबेस एन्क्रिप्टेड 24x7 रीयल-टाइम चैट
                        </div>

                        {activeChatMessages.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-xs">
                            <MessageCircle className="w-6 h-6 mx-auto mb-1 opacity-40 text-emerald-400" />
                            <p>इस चैट पर अभी तक कोई अतिरिक्त लाइव संदेश नहीं है।</p>
                            <p className="text-[11px] text-slate-600 mt-1">नीचे बॉक्स में संदेश लिखकर उत्तर दें।</p>
                          </div>
                        ) : (
                          activeChatMessages.map((msg) => {
                            const isAdmin = msg.senderRole === 'admin' || msg.senderId === 'admin_sanjay';
                            const isBot = msg.senderRole === 'agent' || msg.senderId === 'system_bot';

                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${isAdmin ? 'items-end' : isBot ? 'items-center' : 'items-start'}`}
                              >
                                <div className="text-[10px] text-slate-400 mb-0.5 px-1">
                                  {msg.senderName} • {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>
                                <div
                                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                                    isAdmin
                                      ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/20'
                                      : isBot
                                      ? 'bg-slate-800/90 text-amber-200 border border-amber-500/30'
                                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                                  }`}
                                >
                                  {msg.text}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Quick Answer Snippets */}
                      <div className="p-2 border-t border-slate-800/80 bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                        <span className="text-slate-500 font-bold shrink-0">त्वरित उत्तर:</span>
                        <button
                          type="button"
                          onClick={() => setAdminReplyText('नमस्ते! आपका पेआउट अनुरोध प्राप्त हो गया है। ₹5,000 न्यूनतम निकासी राशि माह की 1 से 5 तारीख के बीच आपके बैंक/UPI खाते में जमा कर दी जाएगी।')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium shrink-0 cursor-pointer"
                        >
                          💰 पेआउट 1-5 तारीख
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminReplyText('नमस्ते! थंबनेल बदलने के लिए ऐप के "स्टूडियो" मेनू में जाएं और अपनी वीडियो के "एडिट" बटन पर क्लिक करके नया 16:9 थंबनेल अपलोड करें।')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium shrink-0 cursor-pointer"
                        >
                          🖼️ थंबनेल बदलाव
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminReplyText('नमस्ते! आपके चैनल का सत्यापन प्रगति पर है। कृपया आधार कार्ड का दोनों तरफ (Front व Back) का साफ फोटो और 12-अंकीय नंबर सही रूप से दर्ज करें।')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium shrink-0 cursor-pointer"
                        >
                          🛡️ आधार सत्यापन
                        </button>
                      </div>

                      {/* Reply Input Bar */}
                      <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
                        <textarea
                          rows={2}
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder={language === 'hi' ? 'व्यवस्थापक के रूप में उत्तर लिखें...' : 'Type admin response...'}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                        />
                        <button
                          type="button"
                          onClick={handleSendAdminReply}
                          disabled={!adminReplyText.trim() || isSendingAdminReply}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-600/20 shrink-0"
                        >
                          {isSendingAdminReply ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          <span>{language === 'hi' ? 'उत्तर भेजें' : 'Send'}</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mb-3">
                        <Headphones className="w-7 h-7" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-300 mb-1">
                        {language === 'hi' ? 'कोई टिकट चयनित नहीं है' : 'No Ticket Selected'}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {language === 'hi'
                          ? 'बाईं सूची में से किसी टिकट या बातचीत पर क्लिक करें ताकि उसका लाइव चैट इतिहास देख सकें और सीधे फायरबेस में उत्तर दे सकें।'
                          : 'Select a ticket from the left list to view live chat history and send responses directly to Firebase.'}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span>बुन्देलीट्यूब व्यवस्थापक पोर्टल • रीयल-टाइम फायरबेस डेटाबेस सिंक</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
          >
            {language === 'hi' ? 'पोर्टल बंद करें' : 'Close Portal'}
          </button>
        </div>

      </div>

      {/* ======================================================== */}
      {/* Rejection Modal Dialog                                   */}
      {/* ======================================================== */}
      {rejectingItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-slate-100">
                {language === 'hi' ? 'आवेदन अस्वीकृत करें' : 'Reject Submission'}
              </h3>
            </div>

            <p className="text-xs text-slate-300">
              {rejectingItem.type === 'video' ? 'वीडियो: ' : 'चैनल: '}
              <strong className="text-slate-100">{rejectingItem.title}</strong>
            </p>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">
                {language === 'hi' ? 'अस्वीकृति का कारण (Reason for creator):' : 'Rejection Reason:'}
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={language === 'hi' ? 'उदा. यूट्यूब विवरण में सत्यापन कोड नहीं मिला, या कॉपीराइट उल्लंघन...' : 'e.g. Verification code not found in description...'}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRejectingItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmRejection}
                disabled={actionLoading === rejectingItem.id}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition shadow-lg shadow-rose-600/20"
              >
                {actionLoading === rejectingItem.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  <span>{language === 'hi' ? 'अस्वीकृत करें' : 'Confirm Reject'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Video Preview Embed Player                               */}
      {/* ======================================================== */}
      {previewVideo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100 line-clamp-1">{previewVideo.title}</h3>
                <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1 mt-0.5">
                  <FileVideo className="w-3 h-3" />
                  <span>📹 नेटिव वीडियो प्लेयर</span>
                </span>
              </div>
              <button onClick={() => setPreviewVideo(null)} className="text-slate-400 hover:text-slate-100 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner flex items-center justify-center">
              <video
                src={previewVideo.streamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>गायक: <strong className="text-slate-200">{previewVideo.artist}</strong></span>
              <span className="text-blue-300 font-medium">डायरेक्ट होस्टेड</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Zoomed Aadhaar Photo Modal                               */}
      {/* ======================================================== */}
      {zoomedPhoto && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md" onClick={() => setZoomedPhoto(null)}>
          <div className="relative max-w-xl max-h-[85vh] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={zoomedPhoto} alt="Aadhaar Card" className="w-full h-auto object-contain max-h-[80vh]" />
            <button
              onClick={() => setZoomedPhoto(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-slate-100 hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
