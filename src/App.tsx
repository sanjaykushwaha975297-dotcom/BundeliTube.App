import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  INITIAL_VIDEOS, 
  DEFAULT_VIEWER_CHANNEL,
  MY_CREATOR_CHANNEL, 
  DEFAULT_CREATOR_USER,
  INITIAL_CREATOR_WALLET,
  DEFAULT_CREATOR_WALLET,
  DEFAULT_EMPTY_WALLET,
  MOCK_NOTIFICATIONS,
  MOCK_SHORTS,
  MOCK_SUBSCRIBED_CHANNELS,
  INITIAL_BANNERS,
  INITIAL_REMOTE_CONFIG,
  INITIAL_COPYRIGHT_REPORTS,
  INITIAL_CHANNEL_SUBMISSIONS
} from './data/mockData';
import { 
  Video, 
  Channel, 
  CreatorWallet, 
  UserAccount, 
  MainAppView, 
  AppNotification,
  ShortItem,
  AppUserSettings,
  AppBanner,
  RemoteAppConfig,
  CopyrightReportData,
  ChannelSubmission,
  VideoSubmission,
  VideoPromotionCampaign
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CategoryPills } from './components/CategoryPills';
import { VideoCard } from './components/VideoCard';
import { VideoPlayerView } from './components/VideoPlayerView';
import { CreatorStudioView } from './components/CreatorStudioView';
import { ShortsView } from './components/ShortsView';
import { SubscriptionsView } from './components/SubscriptionsView';
import { YouLibraryView } from './components/YouLibraryView';
import { ExploreView } from './components/ExploreView';
import { UploadVideoModal, extractYouTubeId } from './components/UploadVideoModal';
import { WalletModal } from './components/WalletModal';
import { ArtistSpotlight } from './components/ArtistSpotlight';
import { LoginModal } from './components/LoginModal';
import { CreateChannelModal } from './components/CreateChannelModal';
import { CopyrightModal } from './components/CopyrightModal';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { AppSettingsModal } from './components/AppSettingsModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { PremiumModal } from './components/PremiumModal';
import { HelpCenterModal } from './components/HelpCenterModal';
import { PolicyCenterModal, PolicyTab } from './components/PolicyCenterModal';
import { ChannelPendingModal } from './components/ChannelPendingModal';
import { DynamicBannerSlider } from './components/DynamicBannerSlider';
import { AdMobNativeCard } from './components/AdMobNativeCard';
import { TopBannerAd } from './components/TopBannerAd';
import { MiniPlayer } from './components/MiniPlayer';
import { BottomNav } from './components/BottomNav';
import { Language, translations } from './locales/i18n';
import { safeStorage, safeImageSrc } from './lib/safeStorage';
import { 
  getAuthSafe, 
  getFirestoreSafe, 
  onAuthStateChanged, 
  signOut,
  doc, 
  getDoc, 
  getDocs,
  setDoc,
  collection, 
  query, 
  where,
  limit,
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  recordSearchQuery,
  logUserActivity,
  cleanFirestoreData,
  deleteVideoFromFirestore,
  deleteChannelFromFirestore,
  updateChannelLogoGlobally,
  fetchUserSubscriptionsFromFirestore
} from './lib/firebase';
import { harmonizeVideoAvatars, propagateChannelLogoAcrossState } from './lib/channelSync';
import { 
  Play, 
  Flame, 
  Music, 
  Sparkles, 
  IndianRupee, 
  FolderHeart,
  Search,
  CheckCircle2,
  Tv,
  Coins,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Headphones,
  Plus,
  Smartphone,
  Download,
  Clock,
  X as CloseIcon
} from 'lucide-react';

export const convertToShortItem = (item: any): ShortItem | null => {
  if (!item) return null;
  const isShortVideo = Boolean(
    item.isShort === true || 
    item.videoType === 'short' || 
    item.category === 'shorts' ||
    (typeof item.youtubeUrl === 'string' && item.youtubeUrl.includes('/shorts/')) ||
    (typeof item.videoUrl === 'string' && item.videoUrl.includes('/shorts/'))
  );
  if (!isShortVideo) return null;

  // Filter out dummy mock IDs only
  const isMock = item.id === 'short-01' || item.id === 'short-02' || item.id === 'short-03' || item.id === 'short-04' || item.id === 'short-05';
  if (isMock) return null;

  let yId = item.youtubeId || '';
  if (!yId && item.youtubeUrl) {
    const m = item.youtubeUrl.match(/(?:shorts\/|v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (m) yId = m[1];
  }
  if (!yId && item.id && /^[a-zA-Z0-9_-]{11}$/.test(item.id) && !item.id.startsWith('vid-') && !item.id.startsWith('sub-')) {
    yId = item.id;
  }

  const videoUrl = item.videoUrl || item.youtubeUrl || (yId ? `https://www.youtube.com/shorts/${yId}` : (item.streamUrl || item.directFileUrl || ''));
  const thumbnail = item.thumbnail || item.thumbnailUrl || (yId ? `https://img.youtube.com/vi/${yId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80');

  return {
    id: item.id,
    title: item.title || 'बुन्देली शॉर्ट्स / रील्स',
    videoUrl: videoUrl,
    youtubeId: yId || '',
    thumbnail: thumbnail,
    channelId: item.channelId || (item.creatorId ? `chan-${item.creatorId}` : undefined),
    channelName: item.channelName || item.artist || 'बुन्देली चैनल',
    channelAvatar: item.channelAvatar || item.uploaderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    likes: Number(item.likes || 0),
    commentsCount: Number(item.commentsCount || 0),
    soundTitle: item.soundTitle || `${item.artist || item.channelName || 'बुन्देली'} - Original Audio`,
    views: Number(item.views || 0),
    isLiked: Boolean(item.isLiked),
    isSubscribed: Boolean(item.isSubscribed)
  };
};

export default function App() {
  // Localization State
  const [language, setLanguage] = useState<Language>(() => {
    const saved = safeStorage.getItem('bt_lang');
    return (saved === 'en' || saved === 'hi') ? saved : 'hi';
  });

  const t = translations[language];

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = safeStorage.getItem('bt_theme');
    return (saved === 'light') ? 'light' : 'dark';
  });

  // Sync theme with document element classList and safeStorage
  useEffect(() => {
    safeStorage.setItem('bt_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [theme]);

  // Execute one-time purge of any old cached dummy/mock data from localStorage
  try {
    const purgeKey = 'bt_purge_dummy_v3';
    if (!safeStorage.getItem(purgeKey)) {
      const rawVids = safeStorage.getJSON<any[]>('bt_videos', []);
      const cleanVids = Array.isArray(rawVids) ? rawVids.filter(v => 
        v?.id && 
        !v.id.startsWith('vid-90s-') && 
        !v.id.startsWith('vid-cid-') && 
        !v.id.startsWith('vid-spiritual-') && 
        !v.id.startsWith('vid-bundeli-0')
      ) : [];
      safeStorage.setJSON('bt_videos', cleanVids);

      const rawShorts = safeStorage.getJSON<any[]>('bt_shorts_custom', []);
      const cleanShorts = Array.isArray(rawShorts) 
        ? rawShorts.filter(s => s?.id && !['short-01', 'short-02', 'short-03', 'short-04', 'short-05'].includes(s.id)) 
        : [];
      safeStorage.setJSON('bt_shorts_custom', cleanShorts);

      const rawBanners = safeStorage.getJSON<any[]>('bt_banners', []);
      const cleanBanners = Array.isArray(rawBanners) ? rawBanners.filter(b => b?.id && b.id !== 'banner-1' && b.id !== 'banner-2') : [];
      safeStorage.setJSON('bt_banners', cleanBanners);

      const rawUser = safeStorage.getJSON<any>('bt_user', null);
      if (rawUser?.id === 'user-bundeli-maati-01') {
        safeStorage.removeItem('bt_user');
      }

      const rawChan = safeStorage.getJSON<any>('bt_channel', null);
      if (rawChan?.id === 'chan-bundeli-maati-01') {
        safeStorage.removeItem('bt_channel');
      }

      const rawWallet = safeStorage.getJSON<any>('bt_wallet', null);
      if (rawWallet?.transactions?.some((t: any) => t.id === 'tx-01' || t.id === 'tx-02')) {
        safeStorage.setJSON('bt_wallet', DEFAULT_EMPTY_WALLET);
      }

      safeStorage.removeItem('bt_subscribed_channels');
      safeStorage.removeItem('bt_channels_v2');
      safeStorage.setItem(purgeKey, 'true');
    }
  } catch (_) {}

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = safeStorage.getJSON<UserAccount | null>('bt_user', null);
    if (saved?.id === 'user-bundeli-maati-01') return null;
    return saved;
  });

  // PWA Install Prompt State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(true);

  // Videos State (strictly published & approved real videos for public viewing)
  const [videos, setVideos] = useState<Video[]>(() => {
    const cached = safeStorage.getJSON<Video[]>('bt_videos', []);
    let baseList: Video[] = [];
    if (Array.isArray(cached) && cached.length > 0) {
      const validVideos = cached.filter(v => {
        if (!v || !v.id) return false;
        if (v.status === 'pending' || v.status === 'rejected') return false;
        // Filter out dummy/mock video IDs
        if (
          v.id.startsWith('vid-90s-') ||
          v.id.startsWith('vid-cid-') ||
          v.id.startsWith('vid-spiritual-') ||
          v.id.startsWith('vid-bundeli-0')
        ) {
          return false;
        }
        if (v.id.startsWith('sub-') || v.id.startsWith('vid-custom-')) {
          return v.status === 'published' || v.status === 'approved';
        }
        return true;
      });
      baseList = validVideos;
    }
    const cachedChannel = safeStorage.getJSON<Channel>('bt_channel', null);
    const cachedSubs = safeStorage.getJSON<ChannelSubmission[]>('bt_channel_submissions', []);
    const { harmonizedVideos } = harmonizeVideoAvatars(baseList, cachedChannel, cachedSubs);
    return harmonizedVideos;
  });

  // Shorts State (Loads custom uploaded real shorts from custom cache, videos, and video submissions)
  const [shorts, setShorts] = useState<ShortItem[]>(() => {
    const cachedCustom = safeStorage.getJSON<any[]>('bt_shorts_custom', []);
    const cachedVideos = safeStorage.getJSON<any[]>('bt_videos', []);
    const cachedSubs = safeStorage.getJSON<any[]>('bt_video_submissions', []);

    const itemsMap = new Map<string, ShortItem>();

    // 1. Cached custom shorts
    if (Array.isArray(cachedCustom)) {
      cachedCustom.forEach(s => {
        if (s?.id && !['short-01', 'short-02', 'short-03', 'short-04', 'short-05'].includes(s.id)) {
          const item = convertToShortItem(s) || s;
          if (item?.id && (item.videoUrl || item.youtubeId)) {
            itemsMap.set(item.id, item);
          }
        }
      });
    }

    // 2. Cached videos that are shorts
    if (Array.isArray(cachedVideos)) {
      cachedVideos.forEach(v => {
        const item = convertToShortItem(v);
        if (item?.id && (item.videoUrl || item.youtubeId)) {
          itemsMap.set(item.id, item);
        }
      });
    }

    // 3. Cached video submissions that are shorts
    if (Array.isArray(cachedSubs)) {
      cachedSubs.forEach(sub => {
        const item = convertToShortItem(sub);
        if (item?.id && (item.videoUrl || item.youtubeId)) {
          itemsMap.set(item.id, item);
        }
      });
    }

    return Array.from(itemsMap.values());
  });

  // Creator Channel State (Defaults to pure viewer unless real channel created)
  const [channel, setChannel] = useState<Channel>(() => {
    const saved = safeStorage.getJSON<Channel>('bt_channel', DEFAULT_VIEWER_CHANNEL);
    if (saved?.id === 'chan-bundeli-maati-01') return DEFAULT_VIEWER_CHANNEL;
    return saved;
  });

  // Creator Wallet State
  const [wallet, setWallet] = useState<CreatorWallet>(() => {
    const saved = safeStorage.getJSON<CreatorWallet>('bt_wallet', DEFAULT_EMPTY_WALLET);
    if (saved?.transactions?.some(t => t.id === 'tx-01' || t.id === 'tx-02')) {
      return DEFAULT_EMPTY_WALLET;
    }
    return saved;
  });

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return safeStorage.getJSON<AppNotification[]>('bt_notifs', []);
  });

  // User Preferences / App Settings
  const [appSettings, setAppSettings] = useState<AppUserSettings>(() => {
    return safeStorage.getJSON<AppUserSettings>('bt_app_settings', {
      defaultAudioMode: false,
      videoQuality: 'auto',
      autoPlayNext: true,
      pushNotifications: true,
      payoutAlerts: true,
      emailStatements: false,
      showWatermark: true,
      preferredPayoutMethod: 'UPI',
      language: 'hi',
      theme: 'dark'
    });
  });

  // Dynamic Live Banners State
  const [banners, setBanners] = useState<AppBanner[]>(() => {
    const cached = safeStorage.getJSON<AppBanner[]>('bt_banners', []);
    return Array.isArray(cached) ? cached.filter(b => b?.id && b.id !== 'banner-1' && b.id !== 'banner-2') : [];
  });

  // AdMob & Remote Controls Config State
  const [remoteConfig, setRemoteConfig] = useState<RemoteAppConfig>(() => {
    const saved = safeStorage.getItem('bt_remote_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let updated = parsed;
        // Replace legacy dummy or outdated AdMob IDs with real production IDs if present
        if (
          parsed.admobAppId?.includes('3940256099942544') ||
          parsed.admobAppId?.includes('9305658265') ||
          !parsed.admobAppId?.includes('5941128324') ||
          parsed.admobNativeId?.includes('9305658265') ||
          !parsed.admobPublisherId
        ) {
          updated = {
            ...updated,
            admobPublisherId: INITIAL_REMOTE_CONFIG.admobPublisherId,
            adsenseCustomerId: INITIAL_REMOTE_CONFIG.adsenseCustomerId,
            admobAppId: INITIAL_REMOTE_CONFIG.admobAppId,
            admobBannerId: INITIAL_REMOTE_CONFIG.admobBannerId,
            admobInterstitialId: INITIAL_REMOTE_CONFIG.admobInterstitialId,
            admobRewardedId: INITIAL_REMOTE_CONFIG.admobRewardedId,
            admobNativeId: INITIAL_REMOTE_CONFIG.admobNativeId
          };
          safeStorage.setJSON('bt_remote_config', updated);
        }
        return updated;
      } catch (e) { /* ignore */ }
    }
    return INITIAL_REMOTE_CONFIG;
  });

  // Copyright Moderation Reports State
  const [copyrightReports, setCopyrightReports] = useState<CopyrightReportData[]>(() => {
    return safeStorage.getJSON<CopyrightReportData[]>('bt_copyright_reports', INITIAL_COPYRIGHT_REPORTS);
  });

  // Channel Applications & KYC Submissions State for Admin Moderation
  const [channelSubmissions, setChannelSubmissions] = useState<ChannelSubmission[]>(() => {
    return safeStorage.getJSON<ChannelSubmission[]>('bt_channel_submissions', []);
  });

  // Video Submissions (Long Videos & Shorts) State for Admin Moderation
  const [videoSubmissions, setVideoSubmissions] = useState<VideoSubmission[]>(() => {
    return safeStorage.getJSON<VideoSubmission[]>('bt_video_submissions', []);
  });

  // Video Promotions & Boosting Campaigns State
  const [promotions, setPromotions] = useState<VideoPromotionCampaign[]>(() => {
    return safeStorage.getJSON<VideoPromotionCampaign[]>('bt_promotions', []);
  });

  // Navigation & View States
  const [currentView, setCurrentView] = useState<MainAppView>('home');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [minimizedVideo, setMinimizedVideo] = useState<Video | null>(null);
  const [isMiniplayerPlaying, setIsMiniplayerPlaying] = useState<boolean>(true);
  const [activeShortIndex, setActiveShortIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Modals States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [pendingPlayVideo, setPendingPlayVideo] = useState<Video | null>(null);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState<boolean>(false);
  const [isChannelPendingModalOpen, setIsChannelPendingModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isCopyrightModalOpen, setIsCopyrightModalOpen] = useState<boolean>(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState<boolean>(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
  const [isHelpCenterModalOpen, setIsHelpCenterModalOpen] = useState<boolean>(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);
  const [policyActiveTab, setPolicyActiveTab] = useState<PolicyTab>('admob_adsense');
  const [copyrightTargetVideo, setCopyrightTargetVideo] = useState<Video | null>(null);

  const handleOpenPolicies = (tab?: string) => {
    if (tab) {
      setPolicyActiveTab(tab as PolicyTab);
    }
    setIsPolicyModalOpen(true);
  };

  // Persistence Effects
  useEffect(() => {
    safeStorage.setItem('bt_lang', language);
  }, [language]);

  useEffect(() => {
    safeStorage.setItem('bt_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    safeStorage.setJSON('bt_videos', videos);
  }, [videos]);

  useEffect(() => {
    safeStorage.setJSON('bt_channel', channel);
  }, [channel]);

  useEffect(() => {
    safeStorage.setJSON('bt_wallet', wallet);
  }, [wallet]);

  useEffect(() => {
    safeStorage.setJSON('bt_notifs', notifications);
  }, [notifications]);

  useEffect(() => {
    safeStorage.setJSON('bt_app_settings', appSettings);
  }, [appSettings]);

  useEffect(() => {
    safeStorage.setJSON('bt_banners', banners);
  }, [banners]);

  useEffect(() => {
    safeStorage.setJSON('bt_remote_config', remoteConfig);
  }, [remoteConfig]);

  useEffect(() => {
    safeStorage.setJSON('bt_copyright_reports', copyrightReports);
  }, [copyrightReports]);

  useEffect(() => {
    safeStorage.setJSON('bt_promotions', promotions);
  }, [promotions]);

  useEffect(() => {
    safeStorage.setJSON('bt_video_submissions', videoSubmissions);
  }, [videoSubmissions]);

  useEffect(() => {
    if (currentUser) {
      safeStorage.setJSON('bt_user', currentUser);
    } else {
      safeStorage.removeItem('bt_user');
    }
  }, [currentUser]);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input / textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === '?' && e.shiftKey) {
        setIsShortcutsModalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsShortcutsModalOpen(false);
        setIsVoiceSearchOpen(false);
        setIsNotificationsDrawerOpen(false);
        setIsSettingsModalOpen(false);
        setIsPremiumModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Back Button Navigation & History POPSTATE Handling (Exact Mobile YouTube UX)
  useEffect(() => {
    // Sync initial state if not already set
    if (!window.history.state) {
      window.history.replaceState({ view: currentView }, '');
    }

    const handlePopState = () => {
      // 0. Close sidebar if open
      if (sidebarOpen) {
        setSidebarOpen(false);
        return;
      }

      // 1. Close open full-screen modals first
      if (
        isCreateChannelModalOpen ||
        isUploadModalOpen ||
        isWalletModalOpen ||
        isCopyrightModalOpen ||
        isVoiceSearchOpen ||
        isNotificationsDrawerOpen ||
        isSettingsModalOpen ||
        isShortcutsModalOpen ||
        isPremiumModalOpen ||
        isHelpCenterModalOpen
      ) {
        setIsCreateChannelModalOpen(false);
        setIsUploadModalOpen(false);
        setIsWalletModalOpen(false);
        setIsCopyrightModalOpen(false);
        setIsVoiceSearchOpen(false);
        setIsNotificationsDrawerOpen(false);
        setIsSettingsModalOpen(false);
        setIsShortcutsModalOpen(false);
        setIsPremiumModalOpen(false);
        setIsHelpCenterModalOpen(false);
        return;
      }

      // 2. If video is currently playing full-screen, minimize to miniplayer and show feed
      if (selectedVideo) {
        setMinimizedVideo(selectedVideo);
        setIsMiniplayerPlaying(true);
        setSelectedVideo(null);
        return;
      }

      // 3. If in a secondary tab (Shorts, Subscriptions, Library, Studio), return to Home tab
      if (currentView !== 'home') {
        setCurrentView('home');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    sidebarOpen,
    selectedVideo,
    currentView,
    isCreateChannelModalOpen,
    isUploadModalOpen,
    isWalletModalOpen,
    isCopyrightModalOpen,
    isVoiceSearchOpen,
    isNotificationsDrawerOpen,
    isSettingsModalOpen,
    isShortcutsModalOpen,
    isPremiumModalOpen,
    isHelpCenterModalOpen
  ]);

  // Firebase Auth State Listener
  useEffect(() => {
    try {
      const auth = getAuthSafe();
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
        if (firebaseUser) {
          // If signed in via email/password, verify email is verified before logging in
          const isPasswordUser = firebaseUser.providerData?.some((p: any) => p.providerId === 'password');
          if (isPasswordUser && !firebaseUser.emailVerified) {
            return;
          }
          try {
            const db = getFirestoreSafe();
            const userDocSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
            const userData = userDocSnap.exists() ? userDocSnap.data() : null;

            const newUser: UserAccount = {
              id: firebaseUser.uid,
              name: userData?.name || firebaseUser.displayName || 'बुंदेली दर्शक',
              email: firebaseUser.email || '',
              avatar: userData?.avatar || firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              role: userData?.role || 'viewer',
              isLoggedIn: true,
              channelId: userData?.channelId,
              memberSince: userData?.memberSince || userData?.createdAt || new Date().toISOString()
            };
            setCurrentUser(newUser);
            safeStorage.setJSON('bt_user', newUser);

            // Fetch and restore user subscriptions from Firestore on login / session restore
            fetchUserSubscriptionsFromFirestore(firebaseUser.uid).catch((err) => {
              console.warn('Subscription sync note:', err);
            });

            // Fetch this user's specific channel from Firestore with deep fallback
            let foundChannel = false;

            // 0. Direct lookup in channels collection if userData has channelId
            if (userData?.channelId) {
              const directChanSnap = await getDoc(doc(db, 'channels', userData.channelId)).catch(() => null);
              if (directChanSnap && directChanSnap.exists()) {
                syncChannelFromSubmissionOrDoc(directChanSnap.data(), directChanSnap.id);
                foundChannel = true;
              }
            }

            // 1. Direct lookup in channels collection by chan-{uid}
            if (!foundChannel) {
              const chanNamedSnap = await getDoc(doc(db, 'channels', `chan-${firebaseUser.uid}`)).catch(() => null);
              if (chanNamedSnap && chanNamedSnap.exists()) {
                syncChannelFromSubmissionOrDoc(chanNamedSnap.data(), chanNamedSnap.id);
                foundChannel = true;
              }
            }

            // 1b. Direct lookup in channels collection by UID
            if (!foundChannel) {
              const chanDocSnap = await getDoc(doc(db, 'channels', firebaseUser.uid)).catch(() => null);
              if (chanDocSnap && chanDocSnap.exists()) {
                syncChannelFromSubmissionOrDoc(chanDocSnap.data(), chanDocSnap.id);
                foundChannel = true;
              }
            }

            // 2. Lookup in channel_submissions
            if (!foundChannel && userData?.channelId) {
              const subDocSnap = await getDoc(doc(db, 'channel_submissions', userData.channelId)).catch(() => null);
              if (subDocSnap && subDocSnap.exists()) {
                syncChannelFromSubmissionOrDoc(subDocSnap.data(), subDocSnap.id);
                foundChannel = true;
              }
            }
            if (!foundChannel) {
              const subDocSnap2 = await getDoc(doc(db, 'channel_submissions', `chan-${firebaseUser.uid}`)).catch(() => null);
              if (subDocSnap2 && subDocSnap2.exists()) {
                syncChannelFromSubmissionOrDoc(subDocSnap2.data(), subDocSnap2.id);
                foundChannel = true;
              }
            }
            if (!foundChannel) {
              const subDocSnap3 = await getDoc(doc(db, 'channel_submissions', firebaseUser.uid)).catch(() => null);
              if (subDocSnap3 && subDocSnap3.exists()) {
                syncChannelFromSubmissionOrDoc(subDocSnap3.data(), subDocSnap3.id);
                foundChannel = true;
              }
            }

            // 3. Query channels by ownerUid
            if (!foundChannel) {
              const chanQuery = query(collection(db, 'channels'), where('ownerUid', '==', firebaseUser.uid));
              const chanQuerySnap = await getDocs(chanQuery).catch(() => null);
              if (chanQuerySnap && !chanQuerySnap.empty) {
                const firstDoc = chanQuerySnap.docs[0];
                syncChannelFromSubmissionOrDoc(firstDoc.data(), firstDoc.id);
                foundChannel = true;
              }
            }

            // 4. Query channel_submissions by ownerUid
            if (!foundChannel) {
              const subQuery = query(collection(db, 'channel_submissions'), where('ownerUid', '==', firebaseUser.uid));
              const subQuerySnap = await getDocs(subQuery).catch(() => null);
              if (subQuerySnap && !subQuerySnap.empty) {
                const firstDoc = subQuerySnap.docs[0];
                syncChannelFromSubmissionOrDoc(firstDoc.data(), firstDoc.id);
                foundChannel = true;
              }
            }

            // 5. Query channel_submissions by email if available
            if (!foundChannel && firebaseUser.email) {
              const emailSubQuery = query(collection(db, 'channel_submissions'), where('verifiedEmail', '==', firebaseUser.email));
              const emailSubSnap = await getDocs(emailSubQuery).catch(() => null);
              if (emailSubSnap && !emailSubSnap.empty) {
                const firstDoc = emailSubSnap.docs[0];
                syncChannelFromSubmissionOrDoc(firstDoc.data(), firstDoc.id);
                foundChannel = true;
              }
            }

            // 6. Check user document channelStatus, channelName, or custom avatar
            if (!foundChannel && (userData?.channelStatus === 'pending' || userData?.channelStatus === 'approved' || userData?.channelName || userData?.channelId)) {
              const isPendingStatus = userData?.channelStatus === 'pending' || userData?.approvalStatus === 'pending';
              const isApp = !isPendingStatus && (userData?.channelStatus === 'approved' || userData?.approvalStatus === 'approved');
              const pendingChan: Channel = {
                id: userData.channelId || `chan-${firebaseUser.uid}`,
                name: userData.channelName || 'बुन्देली चैनल',
                handle: `@${(userData.channelName || 'channel').toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}`,
                avatar: userData.channelLogoUrl || userData.avatar || firebaseUser.photoURL || DEFAULT_VIEWER_CHANNEL.avatar,
                banner: userData.bannerUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
                subscribers: Number(userData.subscribers || 0),
                totalViews: Number(userData.totalViews || 0),
                videoCount: Number(userData.videoCount || 0),
                cpmRate: 35.0,
                bio: userData.bio || 'बुन्देली संगीत एवं लोक कला चैनल',
                joinedDate: '2026',
                isVerified: isApp,
                approvalStatus: isApp ? 'approved' : 'pending',
                kycStatus: isApp ? 'verified' : 'pending',
                ownerUid: firebaseUser.uid,
                mobileNumber: userData.mobileNumber || ''
              };
              setChannel(pendingChan);
              safeStorage.setJSON('bt_channel', pendingChan);
              foundChannel = true;
            }

            // 7. Check local storage channel state before reverting to viewer
            if (!foundChannel) {
              const localSavedChan = safeStorage.getItem('bt_channel');
              if (localSavedChan) {
                try {
                  const parsedChan = JSON.parse(localSavedChan);
                  if (parsedChan && (parsedChan.approvalStatus === 'pending' || parsedChan.approvalStatus === 'approved' || parsedChan.name)) {
                    setChannel(parsedChan);
                    foundChannel = true;
                  }
                } catch (e) { /* ignore */ }
              }
            }

            // 8. If absolutely no channel exists, initialize viewer channel
            if (!foundChannel) {
              const cleanViewerChan: Channel = {
                ...DEFAULT_VIEWER_CHANNEL,
                id: `chan-${firebaseUser.uid}`,
                ownerUid: firebaseUser.uid,
                name: firebaseUser.displayName || 'दर्शक',
                handle: `@${(firebaseUser.displayName || 'user').toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}`,
                avatar: firebaseUser.photoURL || DEFAULT_VIEWER_CHANNEL.avatar,
                subscribers: 0,
                totalViews: 0,
                videoCount: 0
              };
              setChannel(cleanViewerChan);
              safeStorage.setJSON('bt_channel', cleanViewerChan);
            }

            // Fetch this user's specific wallet from Firestore & reconcile with local earnings
            const localWallet = safeStorage.getJSON<CreatorWallet>('bt_wallet', DEFAULT_EMPTY_WALLET);
            const walletDocSnap = await getDoc(doc(db, 'wallets', firebaseUser.uid)).catch(() => null);
            let finalWallet: CreatorWallet;

            if (walletDocSnap && walletDocSnap.exists()) {
              const wData = walletDocSnap.data() as any;
              const firestoreBal = Number(wData.currentBalance ?? wData.walletBalance ?? 0);
              const firestoreLife = Number(wData.lifetimeEarnings ?? wData.totalEarned ?? firestoreBal);
              const firestoreWithdrawn = Number(wData.totalWithdrawn ?? 0);

              // Safeguard: Never lose locally credited ad impression revenue
              const bestBal = Math.max(firestoreBal, Number(localWallet?.currentBalance || 0));
              const bestLife = Math.max(firestoreLife, Number(localWallet?.lifetimeEarnings || 0), bestBal);
              const bestWithdrawn = Math.max(firestoreWithdrawn, Number(localWallet?.totalWithdrawn || 0));

              // Combine transactions without duplicate IDs
              const txMap = new Map<string, any>();
              if (Array.isArray(wData.transactions)) {
                wData.transactions.forEach((tx: any) => { if (tx?.id) txMap.set(tx.id, tx); });
              }
              if (Array.isArray(localWallet?.transactions)) {
                localWallet.transactions.forEach((tx: any) => { if (tx?.id) txMap.set(tx.id, tx); });
              }

              finalWallet = {
                currentBalance: Number(bestBal.toFixed(2)),
                totalWithdrawn: Number(bestWithdrawn.toFixed(2)),
                lifetimeEarnings: Number(bestLife.toFixed(2)),
                minWithdrawalLimit: Number(wData.minWithdrawalLimit || localWallet?.minWithdrawalLimit || 5000),
                pendingClearance: Number(wData.pendingClearance || localWallet?.pendingClearance || 0),
                transactions: Array.from(txMap.values())
              };
            } else if (localWallet && (localWallet.currentBalance > 0 || localWallet.lifetimeEarnings > 0 || (localWallet.transactions && localWallet.transactions.length > 0))) {
              finalWallet = localWallet;
            } else {
              finalWallet = DEFAULT_CREATOR_WALLET;
            }

            setWallet(finalWallet);
            safeStorage.setJSON('bt_wallet', finalWallet);

            // Persist harmonized wallet back to Firestore so it is permanently synchronized
            setDoc(doc(db, 'wallets', firebaseUser.uid), cleanFirestoreData({
              ...finalWallet,
              walletBalance: finalWallet.currentBalance,
              totalEarned: finalWallet.lifetimeEarnings,
              lastUpdated: new Date().toISOString(),
              serverTimestamp: serverTimestamp()
            }), { merge: true }).catch(() => {});
          } catch (e) {
            console.warn('Firestore user fetch note:', e);
          }
        } else {
          // Logged out - reset all states cleanly
          setCurrentUser(null);
          setChannel(DEFAULT_VIEWER_CHANNEL);
          setWallet(DEFAULT_CREATOR_WALLET);
          safeStorage.removeItem('bt_user');
          safeStorage.removeItem('bt_channel');
          safeStorage.removeItem('bt_wallet');
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase auth listener not available:', e);
    }
  }, []);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Helper to synchronize channel and creator states from Firestore documents
  const syncChannelFromSubmissionOrDoc = (data: any, docId: string) => {
    if (!data) return;
    const statusStr = String(data.status || data.approvalStatus || data.kycStatus || data.channelStatus || '').toLowerCase();
    const isRejected = statusStr === 'rejected' || data.isRejected === true;
    const isPending = !isRejected && (
      statusStr === 'pending' || 
      data.approvalStatus === 'pending' || 
      data.channelStatus === 'pending' || 
      data.status === 'pending'
    );
    const isExplicitlyApproved = !isPending && !isRejected && (
      statusStr === 'approved' ||
      statusStr === 'verified' ||
      data.isApproved === true ||
      data.approved === true ||
      data.channelStatus === 'approved' ||
      data.approvalStatus === 'approved'
    );

    setChannel(prev => {
      // Channel is approved ONLY if explicitly approved, and NEVER if pending or rejected
      const isApproved = isExplicitlyApproved && !isPending && !isRejected;
      const effectiveApprovalStatus = isApproved ? 'approved' : isRejected ? 'rejected' : 'pending';
      const effectiveKycStatus = isApproved ? 'verified' : isRejected ? 'not_submitted' : 'pending';

      const nextChan: Channel = {
        id: docId || data.id || prev.id || `chan-${data.ownerUid || data.uid || Date.now()}`,
        name: data.channelName || data.name || prev.name,
        handle: data.handle || prev.handle,
        avatar: data.channelLogoUrl || data.avatarUrl || data.avatar || prev.avatar,
        banner: data.bannerUrl || data.banner || prev.banner,
        subscribers: typeof data.subscribers === 'number' ? Number(data.subscribers) : prev.subscribers,
        totalViews: typeof data.totalViews === 'number' ? Number(data.totalViews) : prev.totalViews,
        videoCount: typeof data.videoCount === 'number' ? Number(data.videoCount) : prev.videoCount,
        cpmRate: typeof data.cpmRate === 'number' ? Number(data.cpmRate) : prev.cpmRate,
        bio: data.bio || prev.bio,
        joinedDate: data.joinedDate || prev.joinedDate,
        isVerified: isApproved,
        approvalStatus: effectiveApprovalStatus,
        kycStatus: effectiveKycStatus,
        rejectionReason: isRejected ? (data.rejectionReason || 'केवाईसी / पहचान विवरण का सत्यापन पूर्ण नहीं हो सका।') : undefined,
        ownerUid: data.ownerUid || data.uid || data.userId || data.userUid || prev.ownerUid,
        mobileNumber: data.mobileNumber || prev.mobileNumber,
        panNumber: data.panNumber || prev.panNumber,
        panCardHolderName: data.panCardHolderName || prev.panCardHolderName,
        panPhotoUrl: data.panPhotoUrl || prev.panPhotoUrl,
        bankDetails: data.bankDetails || prev.bankDetails
      };

      if (
        prev.id === nextChan.id &&
        prev.name === nextChan.name &&
        prev.subscribers === nextChan.subscribers &&
        prev.totalViews === nextChan.totalViews &&
        prev.videoCount === nextChan.videoCount &&
        prev.avatar === nextChan.avatar &&
        prev.banner === nextChan.banner &&
        prev.approvalStatus === nextChan.approvalStatus &&
        prev.kycStatus === nextChan.kycStatus
      ) {
        return prev;
      }
      safeStorage.setJSON('bt_channel', nextChan);
      return nextChan;
    });

    if (isExplicitlyApproved && !isPending && !isRejected) {
      setCurrentUser(prevUser => {
        if (!prevUser) return null;
        if (prevUser.role === 'creator' && prevUser.channelStatus === 'approved' && prevUser.channelId === (docId || data.id)) {
          return prevUser;
        }
        const nextUser: UserAccount = {
          ...prevUser,
          role: 'creator',
          channelStatus: 'approved',
          channelId: docId || data.id || prevUser.channelId,
          avatar: data.channelLogoUrl || data.avatarUrl || prevUser.avatar
        };
        safeStorage.setJSON('bt_user', nextUser);
        return nextUser;
      });
    } else if (isPending) {
      setCurrentUser(prevUser => {
        if (!prevUser) return null;
        if (prevUser.channelStatus === 'pending' && prevUser.channelId === (docId || data.id)) {
          return prevUser;
        }
        const nextUser: UserAccount = {
          ...prevUser,
          channelStatus: 'pending',
          channelId: docId || data.id || prevUser.channelId,
          avatar: data.channelLogoUrl || data.avatarUrl || prevUser.avatar
        };
        safeStorage.setJSON('bt_user', nextUser);
        return nextUser;
      });
    } else if (isRejected) {
      setCurrentUser(prevUser => {
        if (!prevUser) return null;
        if (prevUser.channelStatus === 'rejected' && prevUser.channelId === (docId || data.id)) {
          return prevUser;
        }
        const nextUser: UserAccount = {
          ...prevUser,
          channelStatus: 'rejected',
          channelId: docId || data.id || prevUser.channelId
        };
        safeStorage.setJSON('bt_user', nextUser);
        return nextUser;
      });
    }

    // Propagate updated channel avatar to all videos in state
    const effectiveLogo = data.channelLogoUrl || data.avatarUrl || data.avatar;
    if (effectiveLogo) {
      const incomingName = data.channelName || data.name;
      setVideos(prev => {
        const { harmonizedVideos, hasChanges } = harmonizeVideoAvatars(
          prev,
          { id: docId, name: incomingName, avatar: effectiveLogo, ownerUid: data.ownerUid } as any,
          channelSubmissions
        );
        if (hasChanges) {
          safeStorage.setJSON('bt_videos', harmonizedVideos);
          return harmonizedVideos;
        }
        return prev;
      });
    }
  };

  // Firestore Real-Time Videos, Channels, Banners, and Submissions Sync
  useEffect(() => {
    try {
      const db = getFirestoreSafe();
      const authUser = getAuthSafe()?.currentUser;
      const myUid = authUser?.uid || currentUser?.id;
      const myEmail = authUser?.email || currentUser?.email;
      
      // 1. Videos sync (strictly published and approved videos)
      const videosQuery = query(collection(db, 'videos'), orderBy('uploadDate', 'desc'));
      const vidUnsub = onSnapshot(videosQuery, (snapshot) => {
        if (!snapshot.empty) {
          const fetchedVideos: Video[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const vidStatus = (data.status as any) || 'published';
            
            // Exclude residual dummy/mock videos
            if (
              docSnap.id.startsWith('vid-90s-') ||
              docSnap.id.startsWith('vid-cid-') ||
              docSnap.id.startsWith('vid-spiritual-') ||
              docSnap.id.startsWith('vid-bundeli-0')
            ) {
              return;
            }

            // STRICT SECURITY: Pending and rejected videos must NEVER enter public video feed
            if (vidStatus === 'pending' || vidStatus === 'rejected') {
              return;
            }
            if ((docSnap.id.startsWith('sub-') || docSnap.id.startsWith('vid-custom-')) && vidStatus !== 'published' && vidStatus !== 'approved') {
              return;
            }

            fetchedVideos.push({
              id: docSnap.id,
              title: data.title || '',
              artist: data.artist || '',
              category: data.category || 'lokgeet',
              views: Number(data.views || 0),
              likes: Number(data.likes || 0),
              uploadDate: data.uploadDate || '2026',
              duration: data.duration || '4:15',
              thumbnail: data.thumbnail || data.thumbnailUrl || '',
              youtubeId: data.youtubeId || '',
              channelId: data.channelId || (data.creatorId ? `chan-${data.creatorId}` : ''),
              channelName: data.channelName || data.artist || (language === 'hi' ? 'बुन्देली चैनल' : 'Bundeli Channel'),
              channelAvatar: data.channelAvatar || data.uploaderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              description: data.description || '',
              isMonetized: data.isMonetized ?? true,
              estimatedEarnings: Number(data.estimatedEarnings || 0),
              lyrics: data.lyrics || '',
              verificationCode: data.verificationCode || '',
              tags: data.tags || [],
              sourceType: data.sourceType || 'youtube',
              streamUrl: data.streamUrl || data.directFileUrl || data.videoUrl || '',
              fileSizeMB: data.fileSizeMB,
              isShort: Boolean(data.isShort || data.videoType === 'short' || data.category === 'shorts'),
              videoType: data.videoType || (data.isShort ? 'short' : 'video'),
              audioOnlyAvailable: data.audioOnlyAvailable ?? true,
              status: vidStatus
            });
          });
          if (fetchedVideos.length > 0) {
            const { harmonizedVideos } = harmonizeVideoAvatars(fetchedVideos, channel, channelSubmissions);
            setVideos(harmonizedVideos);
            safeStorage.setJSON('bt_videos', harmonizedVideos);

            // Synchronize short videos into the shorts feed
            const fetchedShortItems: ShortItem[] = [];
            harmonizedVideos.forEach(v => {
              const shortItem = convertToShortItem(v);
              if (shortItem) fetchedShortItems.push(shortItem);
            });
            if (fetchedShortItems.length > 0) {
              setShorts(prev => {
                const map = new Map<string, ShortItem>();
                prev.forEach(s => map.set(s.id, s));
                fetchedShortItems.forEach(s => map.set(s.id, s));
                const merged = Array.from(map.values());
                safeStorage.setJSON('bt_shorts_custom', merged);
                return merged;
              });
            }
          } else {
            setVideos([]);
            safeStorage.setJSON('bt_videos', []);
          }
        } else {
          setVideos([]);
          safeStorage.setJSON('bt_videos', []);
        }
      }, (err) => {
        console.warn('Firestore live video sync notice:', err);
      });

      // 2. Creator's Own Channel Real-time Sync (Targeted listener strictly for this creator's channel)
      let chanUnsub = () => {};
      const creatorChannelId = currentUser?.channelId || (channel.id && channel.id !== 'chan-default' ? channel.id : null) || (myUid ? `chan-${myUid}` : null);
      
      if (creatorChannelId) {
        chanUnsub = onSnapshot(doc(db, 'channels', creatorChannelId), (docSnap) => {
          if (docSnap.exists()) {
            syncChannelFromSubmissionOrDoc(docSnap.data(), docSnap.id);
          }
        }, (err) => console.warn('Firestore channel doc sync note:', err));
      } else if (myUid) {
        const myChanQuery = query(collection(db, 'channels'), where('ownerUid', '==', myUid), limit(1));
        chanUnsub = onSnapshot(myChanQuery, (snapshot) => {
          if (!snapshot.empty) {
            const firstDoc = snapshot.docs[0];
            syncChannelFromSubmissionOrDoc(firstDoc.data(), firstDoc.id);
          }
        }, (err) => console.warn('Firestore user channel query note:', err));
      }

      // 3. Channel Submissions sync for Admin moderation and Creator's application status
      const subUnsub = onSnapshot(collection(db, 'channel_submissions'), (snapshot) => {
        if (!snapshot.empty) {
          const subs: ChannelSubmission[] = [];
          let mySubData: any = null;
          let mySubId = '';

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            subs.push({ id: docSnap.id, ...data } as ChannelSubmission);

            if (myUid && (data.ownerUid === myUid || data.uid === myUid || data.userId === myUid || docSnap.id === myUid || docSnap.id === `chan-${myUid}`)) {
              if (!mySubData) {
                mySubData = data;
                mySubId = docSnap.id;
              }
            } else if (!mySubData && myEmail && (data.verifiedEmail?.toLowerCase() === myEmail.toLowerCase() || data.ownerEmail?.toLowerCase() === myEmail.toLowerCase())) {
              mySubData = data;
              mySubId = docSnap.id;
            }
          });
          if (subs.length > 0) {
            setChannelSubmissions(subs);
            safeStorage.setJSON('bt_channel_submissions', subs);
          }
          if (mySubData) {
            syncChannelFromSubmissionOrDoc(mySubData, mySubId);
          }
        }
      }, (err) => console.warn('Firestore submissions sync note:', err));

      // 3b. Video Submissions sync (for both Long Videos and Shorts)
      const vidSubUnsub = onSnapshot(collection(db, 'video_submissions'), (snapshot) => {
        if (!snapshot.empty) {
          const vSubs: VideoSubmission[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            vSubs.push({ id: docSnap.id, ...data } as VideoSubmission);
          });
          if (vSubs.length > 0) {
            setVideoSubmissions(vSubs);
            safeStorage.setJSON('bt_video_submissions', vSubs);

            // Also extract any short video submissions into shorts state
            const subShorts: ShortItem[] = [];
            vSubs.forEach(sub => {
              const shortItem = convertToShortItem(sub);
              if (shortItem) subShorts.push(shortItem);
            });
            if (subShorts.length > 0) {
              setShorts(prev => {
                const map = new Map<string, ShortItem>();
                prev.forEach(s => map.set(s.id, s));
                subShorts.forEach(s => map.set(s.id, s));
                const merged = Array.from(map.values());
                safeStorage.setJSON('bt_shorts_custom', merged);
                return merged;
              });
            }
          }
        }
      }, (err) => console.warn('Firestore video submissions sync note:', err));

      // 4. User profile doc sync for role / approval status and live Wallet sync
      let userUnsub = () => {};
      let walletUnsub = () => {};
      if (myUid) {
        userUnsub = onSnapshot(doc(db, 'users', myUid), (userDoc) => {
          if (userDoc.exists()) {
            const uData = userDoc.data();
            const uChanStatus = String(uData.channelStatus || uData.approvalStatus || uData.status || '').toLowerCase();
            const isPending = uChanStatus === 'pending' || uData.approvalStatus === 'pending' || uData.channelStatus === 'pending';
            const isApproved = !isPending && (uChanStatus === 'approved' || uData.approvalStatus === 'approved' || uData.isApproved === true);

            if (isApproved) {
              setChannel(prev => ({
                ...prev,
                approvalStatus: 'approved',
                kycStatus: 'verified',
                isVerified: true
              }));
              setCurrentUser(prev => prev ? { ...prev, role: 'creator', channelStatus: 'approved' } : null);
            } else if (isPending) {
              setChannel(prev => ({
                ...prev,
                approvalStatus: 'pending',
                kycStatus: 'pending',
                isVerified: false
              }));
              setCurrentUser(prev => prev ? { ...prev, channelStatus: 'pending' } : null);
            }
          }
        }, (err) => console.warn('User doc sync note:', err));

        // Real-time live Firestore wallet sync for creator earnings & withdrawals
        walletUnsub = onSnapshot(doc(db, 'wallets', myUid), (walletDoc) => {
          if (walletDoc.exists()) {
            const wData = walletDoc.data() as any;
            setWallet(prev => {
              const updatedWallet: CreatorWallet = {
                currentBalance: Number(wData.currentBalance ?? wData.walletBalance ?? prev.currentBalance),
                totalWithdrawn: Number(wData.totalWithdrawn ?? prev.totalWithdrawn),
                lifetimeEarnings: Number(wData.lifetimeEarnings ?? wData.totalEarned ?? prev.lifetimeEarnings),
                minWithdrawalLimit: Number(wData.minWithdrawalLimit ?? prev.minWithdrawalLimit ?? 5000),
                pendingClearance: Number(wData.pendingClearance ?? prev.pendingClearance ?? 0),
                transactions: Array.isArray(wData.transactions) && wData.transactions.length > 0
                  ? wData.transactions
                  : prev.transactions
              };
              safeStorage.setJSON('bt_wallet', updatedWallet);
              return updatedWallet;
            });
          }
        }, (err) => console.warn('Wallet doc live sync note:', err));
      }

      // 5. Remote config & Ad data sync
      let configUnsub = () => {};
      try {
        configUnsub = onSnapshot(doc(db, 'config', 'app_config'), (configDoc) => {
          if (configDoc.exists()) {
            const cfg = configDoc.data() as Partial<RemoteAppConfig>;
            setRemoteConfig(prev => {
              const merged = { ...prev, ...cfg };
              safeStorage.setJSON('bt_remote_config', merged);
              return merged;
            });
          }
        }, () => {});
      } catch (e) { /* ignore */ }

      // 6. Banners sync
      const bannerUnsub = onSnapshot(collection(db, 'banners'), (snapshot) => {
        if (!snapshot.empty) {
          const fetchedBanners: AppBanner[] = [];
          snapshot.forEach((docSnap) => {
            if (docSnap.id === 'banner-1' || docSnap.id === 'banner-2') return;
            fetchedBanners.push({ id: docSnap.id, ...docSnap.data() } as AppBanner);
          });
          setBanners(fetchedBanners);
          safeStorage.setJSON('bt_banners', fetchedBanners);
        } else {
          setBanners([]);
          safeStorage.setJSON('bt_banners', []);
        }
      }, (err) => console.warn('Firestore banner sync note:', err));

      // 7. Notifications & Admin SMS Real-time Sync
      const liveNotifsMap = new Map<string, AppNotification>();

      const syncNotificationsState = () => {
        const liveItems = Array.from(liveNotifsMap.values());
        liveItems.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
        if (liveItems.length > 0) {
          setNotifications(prev => {
            const liveIds = new Set(liveItems.map(item => item.id));
            const existingNonOverlapping = prev.filter(item => !liveIds.has(item.id));
            const merged = [...liveItems, ...existingNonOverlapping];
            safeStorage.setJSON('bt_notifs', merged);
            return merged;
          });
        }
      };

      const handleIncomingNotifSnap = (snapshot: any, defaultType: AppNotification['type'] = 'system') => {
        if (!snapshot.empty) {
          snapshot.forEach((docSnap: any) => {
            const d = docSnap.data();
            const recId = d.recipientId || d.targetUid || d.userId || '';
            const recEmail = d.userEmail || d.recipientEmail || '';
            
            // Check if meant for this user, creator, or broadcast to all
            const isForMe = !recId || recId === 'all' || recId === myUid || 
              (myEmail && recEmail && recEmail.toLowerCase() === myEmail.toLowerCase());

            if (isForMe) {
              const textContent = d.description || d.text || d.message || d.sms || d.body || d.content || '';
              if (textContent.trim()) {
                liveNotifsMap.set(docSnap.id, {
                  id: docSnap.id,
                  title: d.title || (d.sms || d.type === 'sms' ? '📩 नया संदेश (SMS)' : '📢 बुंदेली अपडेट'),
                  description: textContent,
                  timestamp: d.timestamp || d.createdAt || 'अभी-अभी',
                  isRead: d.isRead === true,
                  type: d.type || defaultType,
                  targetVideoId: d.targetVideoId || d.videoId || undefined,
                  avatar: d.avatar || undefined,
                  thumbnail: d.thumbnail || undefined
                });
              }
            }
          });
          syncNotificationsState();
        }
      };

      const notifUnsub = onSnapshot(collection(db, 'notifications'), (snap) => handleIncomingNotifSnap(snap, 'system'), () => {});
      const smsUnsub = onSnapshot(collection(db, 'sms'), (snap) => handleIncomingNotifSnap(snap, 'system'), () => {});
      const userNotifUnsub = myUid 
        ? onSnapshot(collection(db, 'users', myUid, 'notifications'), (snap) => handleIncomingNotifSnap(snap, 'comment'), () => {}) 
        : () => {};

      return () => {
        vidUnsub();
        chanUnsub();
        subUnsub();
        vidSubUnsub();
        userUnsub();
        walletUnsub();
        configUnsub();
        bannerUnsub();
        notifUnsub();
        smsUnsub();
        userNotifUnsub();
      };
    } catch (e) {
      console.warn('Live Firestore content sync fallback:', e);
    }
  }, [currentUser?.id, currentUser?.email]);

  // Pull / Fetch All Fresh Data directly from Firestore on Demand
  const handlePullDataFromFirestore = async (): Promise<void> => {
    try {
      const db = getFirestoreSafe();
      const authUser = getAuthSafe()?.currentUser;
      const myUid = authUser?.uid || currentUser?.id;
      const myEmail = authUser?.email || currentUser?.email;

      // 1. Fetch channel_submissions for moderation
      const subsSnap = await getDocs(collection(db, 'channel_submissions')).catch(() => null);
      if (subsSnap && !subsSnap.empty) {
        const subs: ChannelSubmission[] = [];
        let mySubData: any = null;
        let mySubId = '';

        subsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          subs.push({ id: docSnap.id, ...data } as ChannelSubmission);

          if (myUid && (data.ownerUid === myUid || data.uid === myUid || data.userId === myUid || docSnap.id === myUid || docSnap.id === `chan-${myUid}`)) {
            if (!mySubData) {
              mySubData = data;
              mySubId = docSnap.id;
            }
          } else if (!mySubData && myEmail && (data.verifiedEmail?.toLowerCase() === myEmail.toLowerCase() || data.ownerEmail?.toLowerCase() === myEmail.toLowerCase())) {
            mySubData = data;
            mySubId = docSnap.id;
          }
        });
        if (subs.length > 0) {
          setChannelSubmissions(subs);
          safeStorage.setJSON('bt_channel_submissions', subs);
        }
        if (mySubData) {
          syncChannelFromSubmissionOrDoc(mySubData, mySubId);
        }
      }

      // 2. Fetch creator's specific channel document directly
      const creatorChannelId = currentUser?.channelId || (channel.id && channel.id !== 'chan-default' ? channel.id : null) || (myUid ? `chan-${myUid}` : null);
      if (creatorChannelId) {
        const chanDoc = await getDoc(doc(db, 'channels', creatorChannelId)).catch(() => null);
        if (chanDoc && chanDoc.exists()) {
          syncChannelFromSubmissionOrDoc(chanDoc.data(), chanDoc.id);
        }
      } else if (myUid) {
        const myChanQuery = query(collection(db, 'channels'), where('ownerUid', '==', myUid), limit(1));
        const myChanSnap = await getDocs(myChanQuery).catch(() => null);
        if (myChanSnap && !myChanSnap.empty) {
          const firstDoc = myChanSnap.docs[0];
          syncChannelFromSubmissionOrDoc(firstDoc.data(), firstDoc.id);
        }
      }

      // 3. Fetch user document and wallet if uid exists
      if (myUid) {
        const userDoc = await getDoc(doc(db, 'users', myUid)).catch(() => null);
        if (userDoc && userDoc.exists()) {
          const uData = userDoc.data();
          const uChanStatus = String(uData.channelStatus || uData.approvalStatus || uData.status || '').toLowerCase();
          const isPending = uChanStatus === 'pending' || uData.approvalStatus === 'pending' || uData.channelStatus === 'pending';
          const isApproved = !isPending && (uChanStatus === 'approved' || uData.approvalStatus === 'approved' || uData.isApproved === true);

          if (isApproved) {
            setChannel(prev => ({
              ...prev,
              approvalStatus: 'approved',
              kycStatus: 'verified',
              isVerified: true
            }));
            setCurrentUser(prev => prev ? { ...prev, role: 'creator', channelStatus: 'approved' } : null);
          } else if (isPending) {
            setChannel(prev => ({
              ...prev,
              approvalStatus: 'pending',
              kycStatus: 'pending',
              isVerified: false
            }));
            setCurrentUser(prev => prev ? { ...prev, channelStatus: 'pending' } : null);
          }
        }

        // Real-time wallet listener: updates creator balance instantly when admin distributes ad revenue
        const unsubWallet = onSnapshot(doc(db, 'wallets', myUid), (walletDoc) => {
          if (walletDoc && walletDoc.exists()) {
            const wData = walletDoc.data() as any;
            setWallet(prev => {
              const updatedWallet: CreatorWallet = {
                currentBalance: Number(wData.currentBalance ?? wData.walletBalance ?? prev.currentBalance),
                totalWithdrawn: Number(wData.totalWithdrawn ?? prev.totalWithdrawn),
                lifetimeEarnings: Number(wData.lifetimeEarnings ?? wData.totalEarned ?? prev.lifetimeEarnings),
                minWithdrawalLimit: Number(wData.minWithdrawalLimit ?? prev.minWithdrawalLimit ?? 5000),
                pendingClearance: Number(wData.pendingClearance ?? prev.pendingClearance ?? 0),
                transactions: Array.isArray(wData.transactions) && wData.transactions.length > 0
                  ? wData.transactions
                  : prev.transactions
              };
              safeStorage.setJSON('bt_wallet', updatedWallet);
              return updatedWallet;
            });
          }
        }, (err) => {
          console.warn('Real-time wallet listener note:', err);
        });
      }

      // 4. Fetch Remote Config / Ad settings
      try {
        const cfgDoc = await getDoc(doc(db, 'config', 'app_config')).catch(() => null);
        if (cfgDoc && cfgDoc.exists()) {
          const cfg = cfgDoc.data() as Partial<RemoteAppConfig>;
          setRemoteConfig(prev => {
            const merged = { ...prev, ...cfg };
            safeStorage.setJSON('bt_remote_config', merged);
            return merged;
          });
        }
      } catch (e) { /* ignore */ }

      // 5. Fetch videos (strictly published & approved)
      const vidSnap = await getDocs(query(collection(db, 'videos'), orderBy('uploadDate', 'desc'))).catch(() => null);
      if (vidSnap && !vidSnap.empty) {
        const vList: Video[] = [];
        vidSnap.forEach((d) => {
          const dt = d.data();
          const vidStatus = (dt.status as any) || 'published';
          if (vidStatus === 'pending' || vidStatus === 'rejected') {
            return;
          }
          if ((d.id.startsWith('sub-') || d.id.startsWith('vid-custom-')) && vidStatus !== 'published' && vidStatus !== 'approved') {
            return;
          }

          vList.push({
            id: d.id,
            title: dt.title || '',
            artist: dt.artist || '',
            category: dt.category || 'lokgeet',
            views: Number(dt.views || 0),
            likes: Number(dt.likes || 0),
            uploadDate: dt.uploadDate || '2026',
            duration: dt.duration || '4:15',
            thumbnail: dt.thumbnail || '',
            youtubeId: dt.youtubeId || '',
            channelId: dt.channelId || (dt.creatorId ? `chan-${dt.creatorId}` : ''),
            channelName: dt.channelName || dt.artist || (language === 'hi' ? 'बुन्देली चैनल' : 'Bundeli Channel'),
            channelAvatar: dt.channelAvatar || dt.uploaderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            description: dt.description || '',
            isMonetized: dt.isMonetized ?? true,
            estimatedEarnings: Number(dt.estimatedEarnings || 0),
            lyrics: dt.lyrics || '',
            verificationCode: dt.verificationCode || '',
            tags: dt.tags || [],
            status: vidStatus
          });
        });
        if (vList.length > 0) {
          const { harmonizedVideos } = harmonizeVideoAvatars(vList, channel, channelSubmissions);
          setVideos(harmonizedVideos);
          safeStorage.setJSON('bt_videos', harmonizedVideos);
        }
      }

      // 6. Fetch fresh notifications and SMS
      try {
        const notifSnap = await getDocs(collection(db, 'notifications')).catch(() => null);
        const smsSnap = await getDocs(collection(db, 'sms')).catch(() => null);
        const fetchedNotifs: AppNotification[] = [];

        const processDoc = (docSnap: any) => {
          const d = docSnap.data();
          const recId = d.recipientId || d.targetUid || d.userId || '';
          const recEmail = d.userEmail || d.recipientEmail || '';
          const isForMe = !recId || recId === 'all' || recId === myUid || 
            (myEmail && recEmail && recEmail.toLowerCase() === myEmail.toLowerCase());

          if (isForMe) {
            const textContent = d.description || d.text || d.message || d.sms || d.body || d.content || '';
            if (textContent.trim()) {
              fetchedNotifs.push({
                id: docSnap.id,
                title: d.title || (d.sms || d.type === 'sms' ? '📩 नया संदेश (SMS)' : '📢 बुंदेली अपडेट'),
                description: textContent,
                timestamp: d.timestamp || d.createdAt || 'अभी-अभी',
                isRead: d.isRead === true,
                type: d.type || 'system',
                targetVideoId: d.targetVideoId || d.videoId || undefined,
                avatar: d.avatar || undefined,
                thumbnail: d.thumbnail || undefined
              });
            }
          }
        };

        if (notifSnap && !notifSnap.empty) notifSnap.forEach(processDoc);
        if (smsSnap && !smsSnap.empty) smsSnap.forEach(processDoc);

        if (fetchedNotifs.length > 0) {
          fetchedNotifs.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
          setNotifications(prev => {
            const newIds = new Set(fetchedNotifs.map(n => n.id));
            const remaining = prev.filter(n => !newIds.has(n.id));
            const merged = [...fetchedNotifs, ...remaining];
            safeStorage.setJSON('bt_notifs', merged);
            return merged;
          });
        }
      } catch (e) { /* ignore */ }
    } catch (err) {
      console.warn('Manual Firestore pull error:', err);
    }
  };

  // Proactively synchronize channel logos across all videos so that every video under a channel
  // always displays the exact same, latest uploaded logo
  useEffect(() => {
    setVideos(prev => {
      const { harmonizedVideos, hasChanges } = harmonizeVideoAvatars(prev, channel, channelSubmissions);
      if (hasChanges) {
        safeStorage.setJSON('bt_videos', harmonizedVideos);
        return harmonizedVideos;
      }
      return prev;
    });
  }, [channel.avatar, channel.name, channel.id, channelSubmissions]);

  // Creator Monetization Ad Impression Creditor (Strictly only for approved creator who owns the video)
  const handleAdImpressionCredited = useCallback((arg: { impressionValue: number; creatorShare: number; videoId: string; creatorId?: string } | number) => {
    const creatorShare = typeof arg === 'number' ? Number(arg.toFixed(2)) : Number(arg.creatorShare.toFixed(2));
    const vidId = typeof arg === 'number' ? (selectedVideo?.id || 'vid-ad') : arg.videoId;

    // Strict validation: Only credit wallet if user is an approved creator
    if (!currentUser || currentUser.role !== 'creator' || channel.approvalStatus !== 'approved') {
      return; // Viewers do not receive creator ad revenue
    }

    // Determine if current logged-in creator owns this video
    const targetVideo = videos.find(v => v.id === vidId) || (selectedVideo?.id === vidId ? selectedVideo : null);
    const videoCreatorId = (typeof arg !== 'number' && arg.creatorId) || targetVideo?.creatorId || targetVideo?.channelId;
    const isOwner = Boolean(
      videoCreatorId && (
        videoCreatorId === currentUser.id ||
        videoCreatorId === channel.id ||
        videoCreatorId === `chan-${currentUser.id}` ||
        targetVideo?.channelId === channel.id
      )
    );

    if (!isOwner) {
      return; // Do not credit if creator is watching another creator's content
    }

    // Safely defer wallet update outside the active React render phase
    setTimeout(() => {
      setWallet(prev => {
        const nextWallet: CreatorWallet = {
          ...prev,
          currentBalance: Number((prev.currentBalance + creatorShare).toFixed(2)),
          lifetimeEarnings: Number((prev.lifetimeEarnings + creatorShare).toFixed(2)),
          transactions: [
            {
              id: `tx-ad-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              date: new Date().toLocaleDateString('hi-IN'),
              amount: creatorShare,
              type: 'earning',
              status: 'completed',
              payoutMethod: 'UPI',
              targetAccount: 'Creator 50% Ad Share',
              refId: `AD-${vidId.slice(-6).toUpperCase()}`,
              note: language === 'hi' ? `क्रिएटर विज्ञापन शेयर (+₹${creatorShare.toFixed(2)})` : `Creator Ad Share (+₹${creatorShare.toFixed(2)})`
            },
            ...prev.transactions
          ]
        };
        safeStorage.setJSON('bt_wallet', nextWallet);

        // Atomically persist updated wallet to Firestore so balance never resets to 0 on refresh
        if (currentUser?.id) {
          try {
            const db = getFirestoreSafe();
            setDoc(doc(db, 'wallets', currentUser.id), cleanFirestoreData({
              ...nextWallet,
              walletBalance: nextWallet.currentBalance,
              totalEarned: nextWallet.lifetimeEarnings,
              lastUpdated: new Date().toISOString(),
              serverTimestamp: serverTimestamp()
            }), { merge: true }).catch((err) => console.warn('Firestore wallet ad impression update note:', err));
          } catch (e) { /* ignore */ }
        }

        return nextWallet;
      });
    }, 0);
  }, [language, selectedVideo, videos, currentUser, channel.id, channel.approvalStatus]);

  const handleInstallPWA = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredInstallPrompt(null);
    } else {
      alert(language === 'hi' 
        ? '📱 BundeliTube App: अपने ब्राउज़र मेनू (⋮) से "Add to Home screen" या "Install App" चुनें!' 
        : '📱 BundeliTube App: Tap browser menu (⋮) and select "Add to Home screen" / "Install App"!');
    }
  };

  // Handlers
  const handleToggleLanguage = () => {
    setLanguage(prev => (prev === 'hi' ? 'en' : 'hi'));
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLoginSuccess = async (user: UserAccount) => {
    setCurrentUser(user);
    safeStorage.setJSON('bt_user', user);
    setIsLoginModalOpen(false);

    try {
      const db = getFirestoreSafe();
      let foundChannel = false;

      // 1. Check direct channel by user.channelId
      if (user.channelId) {
        const chanDoc = await getDoc(doc(db, 'channels', user.channelId)).catch(() => null);
        if (chanDoc && chanDoc.exists()) {
          syncChannelFromSubmissionOrDoc(chanDoc.data(), chanDoc.id);
          foundChannel = true;
        } else {
          const subDoc = await getDoc(doc(db, 'channel_submissions', user.channelId)).catch(() => null);
          if (subDoc && subDoc.exists()) {
            syncChannelFromSubmissionOrDoc(subDoc.data(), subDoc.id);
            foundChannel = true;
          }
        }
      }

      // 2. Check channel by chan-{user.id}
      if (!foundChannel) {
        const chanSnap = await getDoc(doc(db, 'channels', `chan-${user.id}`)).catch(() => null);
        if (chanSnap && chanSnap.exists()) {
          syncChannelFromSubmissionOrDoc(chanSnap.data(), chanSnap.id);
          foundChannel = true;
        }
      }

      // 3. Check channel by user.id
      if (!foundChannel) {
        const chanSnap = await getDoc(doc(db, 'channels', user.id)).catch(() => null);
        if (chanSnap && chanSnap.exists()) {
          syncChannelFromSubmissionOrDoc(chanSnap.data(), chanSnap.id);
          foundChannel = true;
        }
      }

      // 4. Query channels by ownerUid
      if (!foundChannel) {
        const chanQuery = query(collection(db, 'channels'), where('ownerUid', '==', user.id), limit(1));
        const chanSnap = await getDocs(chanQuery).catch(() => null);
        if (chanSnap && !chanSnap.empty) {
          syncChannelFromSubmissionOrDoc(chanSnap.docs[0].data(), chanSnap.docs[0].id);
          foundChannel = true;
        }
      }

      // 5. Query submissions by ownerUid
      if (!foundChannel) {
        const subQuery = query(collection(db, 'channel_submissions'), where('ownerUid', '==', user.id), limit(1));
        const subSnap = await getDocs(subQuery).catch(() => null);
        if (subSnap && !subSnap.empty) {
          syncChannelFromSubmissionOrDoc(subSnap.docs[0].data(), subSnap.docs[0].id);
          foundChannel = true;
        }
      }

      // 6. Check user document channel data
      if (!foundChannel) {
        const userDoc = await getDoc(doc(db, 'users', user.id)).catch(() => null);
        if (userDoc && userDoc.exists()) {
          const ud = userDoc.data();
          if (ud.channelName || ud.channelId || ud.channelStatus === 'pending' || ud.channelStatus === 'approved') {
            const isPending = ud.channelStatus === 'pending' || ud.approvalStatus === 'pending';
            const isApproved = !isPending && (ud.channelStatus === 'approved' || ud.approvalStatus === 'approved');
            const restoredChan: Channel = {
              id: ud.channelId || `chan-${user.id}`,
              name: ud.channelName || user.name,
              handle: ud.channelHandle || `@${(ud.channelName || user.name).toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}`,
              avatar: ud.channelLogoUrl || ud.avatar || user.avatar,
              banner: ud.bannerUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
              subscribers: Number(ud.subscribers || 0),
              totalViews: Number(ud.totalViews || 0),
              videoCount: Number(ud.videoCount || 0),
              cpmRate: 35.00,
              approvalStatus: isApproved ? 'approved' : 'pending',
              kycStatus: isApproved ? 'verified' : 'pending',
              isVerified: isApproved,
              bio: ud.bio || `${ud.channelName || user.name} का आधिकारिक बुन्देली ट्यूब चैनल`,
              joinedDate: '2026',
              ownerUid: user.id
            };
            setChannel(restoredChan);
            safeStorage.setJSON('bt_channel', restoredChan);
            foundChannel = true;
          }
        }
      }

      // 7. Load user's wallet from Firestore
      const walletSnap = await getDoc(doc(db, 'wallets', user.id)).catch(() => null);
      if (walletSnap && walletSnap.exists()) {
        const wData = walletSnap.data() as any;
        const curBal = Number(wData.currentBalance ?? wData.walletBalance ?? 0);
        const curLife = Number(wData.lifetimeEarnings ?? wData.totalEarned ?? curBal);
        const curWithdrawn = Number(wData.totalWithdrawn ?? 0);
        const loadedWallet: CreatorWallet = {
          currentBalance: curBal,
          totalWithdrawn: curWithdrawn,
          lifetimeEarnings: curLife,
          minWithdrawalLimit: Number(wData.minWithdrawalLimit ?? 5000),
          pendingClearance: Number(wData.pendingClearance ?? 0),
          transactions: Array.isArray(wData.transactions) ? wData.transactions : []
        };
        setWallet(loadedWallet);
        safeStorage.setJSON('bt_wallet', loadedWallet);
      }
    } catch (e) {
      console.warn('Channel & wallet fetch on login note:', e);
    }

    // If user clicked play on a video before logging in, start video playback immediately
    if (pendingPlayVideo) {
      setSelectedVideo(pendingPlayVideo);
      setPendingPlayVideo(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuthSafe();
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout notice:', e);
    }
    setCurrentUser(null);
    setChannel(DEFAULT_VIEWER_CHANNEL);
    setWallet(DEFAULT_CREATOR_WALLET);
    setSelectedVideo(null);
    setMinimizedVideo(null);
    setCurrentView('home');
    safeStorage.removeItem('bt_user');
    safeStorage.removeItem('bt_channel');
    safeStorage.removeItem('bt_wallet');
    safeStorage.removeItem('bt_subscribed_channels');
    setIsLoginModalOpen(false);
  };

  // Video playback & miniplayer handlers
  const handlePlayVideo = (v: Video) => {
    if (!currentUser) {
      setPendingPlayVideo(v);
      setIsLoginModalOpen(true);
      return;
    }
    setSelectedVideo(v);
    setMinimizedVideo(null);
    window.history.pushState({ view: 'watch', videoId: v.id }, '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMinimizeVideo = () => {
    if (selectedVideo) {
      setMinimizedVideo(selectedVideo);
      setIsMiniplayerPlaying(true);
      setSelectedVideo(null);
    }
  };

  const handleExpandMiniplayer = () => {
    if (minimizedVideo) {
      const v = minimizedVideo;
      setSelectedVideo(v);
      setMinimizedVideo(null);
      window.history.pushState({ view: 'watch', videoId: v.id }, '');
    }
  };

  const handleCloseMiniplayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMinimizedVideo(null);
  };

  const handleToggleMiniplayerPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMiniplayerPlaying(prev => !prev);
  };

  const handleChannelSubmitted = (submission: ChannelSubmission) => {
    const effectiveLogo = submission.channelAvatar || submission.channelLogoUrl || submission.avatarUrl || currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
    const newChan: Channel = {
      id: `chan-${submission.ownerUid || currentUser?.id || Date.now()}`,
      name: submission.channelName,
      handle: submission.channelHandle || `@${submission.channelName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}`,
      avatar: effectiveLogo,
      banner: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
      subscribers: 0,
      bio: 'बुन्देली संगीत एवं लोक कला चैनल',
      joinedDate: '2026',
      isVerified: false,
      approvalStatus: 'pending',
      kycStatus: 'pending',
      ownerUid: currentUser?.id || submission.ownerUid || '',
      mobileNumber: submission.mobileNumber,
      panNumber: submission.panNumber,
      panPhotoUrl: submission.panPhotoUrl,
      aadhaarNumber: submission.aadhaarNumber,
      aadhaarPhotoUrl: submission.aadhaarPhotoUrl,
      aadhaarFrontPhotoUrl: submission.aadhaarFrontPhotoUrl,
      aadhaarBackPhotoUrl: submission.aadhaarBackPhotoUrl,
      bankDetails: {
        bankName: submission.bankName,
        accountHolder: submission.accountHolder,
        accountNumber: submission.accountNumber,
        ifscCode: submission.ifscCode,
        branchName: submission.branchName,
        upiId: submission.upiId
      },
      totalViews: 0,
      videoCount: 0,
      cpmRate: 35.00
    };

    setChannel(newChan);
    safeStorage.setJSON('bt_channel', newChan);

    if (currentUser) {
      const updatedUser: UserAccount = {
        ...currentUser,
        channelStatus: 'pending',
        channelId: newChan.id,
        avatar: effectiveLogo
      };
      setCurrentUser(updatedUser);
      safeStorage.setJSON('bt_user', updatedUser);
    }

    const pendingSub: ChannelSubmission = {
      ...submission,
      channelAvatar: effectiveLogo,
      channelLogoUrl: effectiveLogo,
      avatarUrl: effectiveLogo,
      status: 'pending'
    };

    setChannelSubmissions(prev => {
      const updated = [pendingSub, ...prev.filter(s => s.id !== pendingSub.id)];
      safeStorage.setJSON('bt_channel_submissions', updated);
      return updated;
    });

    // Write all details directly to Firestore for the external admin panel
    try {
      const db = getFirestoreSafe();
      if (db) {
        // 1. Submit to channel_submissions for admin verification
        setDoc(doc(db, 'channel_submissions', pendingSub.id), cleanFirestoreData({
          ...pendingSub,
          submittedAt: serverTimestamp(),
          serverTimestamp: serverTimestamp()
        }), { merge: true }).catch(err => console.warn('Firestore channel_submissions write error:', err));

        // 2. Also register in channels collection with pending status
        setDoc(doc(db, 'channels', newChan.id), cleanFirestoreData({
          ...newChan,
          status: 'pending',
          approvalStatus: 'pending',
          kycStatus: 'pending',
          createdAt: serverTimestamp(),
          serverTimestamp: serverTimestamp()
        }), { merge: true }).catch(err => console.warn('Firestore channels write error:', err));

        // 3. Update user profile with pending creator role
        const targetUid = submission.ownerUid || currentUser?.id;
        if (targetUid && targetUid !== 'user') {
          setDoc(doc(db, 'users', targetUid), cleanFirestoreData({
            role: 'creator',
            channelStatus: 'pending',
            channelId: newChan.id,
            channelName: newChan.name,
            avatar: effectiveLogo,
            updatedAt: serverTimestamp()
          }), { merge: true }).catch(err => console.warn('Firestore user update error:', err));
        }
      }
    } catch (e) {
      console.warn('Channel submission Firestore error:', e);
    }

    propagateChannelLogoAcrossState({
      newLogoUrl: effectiveLogo,
      channelId: newChan.id,
      ownerUid: submission.ownerUid || currentUser?.id,
      channelName: submission.channelName,
      videos,
      setVideos,
      videoSubmissions,
      setVideoSubmissions,
      channelSubmissions,
      setChannelSubmissions,
      shorts,
      setShorts,
      saveJson: safeStorage.setJSON
    });

    const notif: AppNotification = {
      id: `notif-chan-created-${Date.now()}`,
      title: '⏳ चैनल सत्यापन विचाराधीन है (Pending Review)',
      description: `आपका चैनल "${submission.channelName}" एडमिन समीक्षा के लिए सबमिट हो गया है। एडमिन द्वारा मंज़ूरी (Approval) मिलने के बाद आप वीडियो अपलोड कर सकेंगे।`,
      timestamp: 'अभी-अभी',
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [notif, ...prev]);

    setSelectedVideo(null);
    setCurrentView('studio');
  };

  const handleApproveChannel = (submissionId: string) => {
    const targetSub = channelSubmissions.find(s => s.id === submissionId);
    if (!targetSub) return;

    const updatedSubs = channelSubmissions.map(s => s.id === submissionId ? {
      ...s,
      status: 'approved' as const,
      rejectionReason: undefined
    } : s);
    setChannelSubmissions(updatedSubs);
    safeStorage.setJSON('bt_channel_submissions', updatedSubs);

    // If current logged-in user is the owner, approve their channel & elevate role to creator
    if (currentUser && (targetSub.ownerUid === currentUser.id || targetSub.verifiedEmail === currentUser.email)) {
      setChannel(prev => {
        const approvedChan: Channel = {
          ...prev,
          id: prev.id || `chan-${targetSub.ownerUid}`,
          name: targetSub.channelName || prev.name,
          handle: `@${(targetSub.channelName || prev.name).toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}`,
          approvalStatus: 'approved',
          kycStatus: 'verified',
          ownerUid: targetSub.ownerUid,
          mobileNumber: targetSub.mobileNumber,
          aadhaarNumber: targetSub.aadhaarNumber,
          aadhaarPhotoUrl: targetSub.aadhaarPhotoUrl || prev.aadhaarPhotoUrl,
          bankDetails: {
            bankName: targetSub.bankName,
            accountHolder: targetSub.accountHolder,
            accountNumber: targetSub.accountNumber,
            ifscCode: targetSub.ifscCode,
            branchName: targetSub.branchName,
            upiId: targetSub.upiId
          }
        };
        safeStorage.setJSON('bt_channel', approvedChan);
        return approvedChan;
      });

      setCurrentUser(prev => {
        if (!prev) return null;
        const updatedUser: UserAccount = {
          ...prev,
          role: 'creator',
          channelStatus: 'approved'
        };
        safeStorage.setJSON('bt_user', updatedUser);
        return updatedUser;
      });
    }

    const newNotif: AppNotification = {
      id: `notif-appr-${Date.now()}`,
      title: '🎉 चैनल स्वीकृत (Channel Approved)!',
      description: `बधाई हो! चैनल "${targetSub.channelName}" को व्यवस्थापक द्वारा स्वीकृत कर दिया गया है। अब आप वीडियो अपलोड कर सकते हैं।`,
      timestamp: 'अभी-अभी',
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleRejectChannel = (submissionId: string, reason?: string) => {
    const targetSub = channelSubmissions.find(s => s.id === submissionId);
    if (!targetSub) return;

    const rejectionReason = reason || 'केवाईसी / आधार विवरण का सत्यापन पूर्ण नहीं हो सका। कृपया सही विवरण के साथ पुनः आवेदन करें।';

    const updatedSubs = channelSubmissions.map(s => s.id === submissionId ? {
      ...s,
      status: 'rejected' as const,
      rejectionReason
    } : s);
    setChannelSubmissions(updatedSubs);
    safeStorage.setJSON('bt_channel_submissions', updatedSubs);

    if (currentUser && (targetSub.ownerUid === currentUser.id || targetSub.verifiedEmail === currentUser.email)) {
      setChannel(prev => {
        const next: Channel = {
          ...prev,
          approvalStatus: 'rejected',
          kycStatus: 'not_submitted',
          rejectionReason
        };
        safeStorage.setJSON('bt_channel', next);
        return next;
      });

      setCurrentUser(prev => {
        if (!prev) return null;
        const nextUser: UserAccount = {
          ...prev,
          role: 'viewer',
          channelStatus: 'rejected'
        };
        safeStorage.setJSON('bt_user', nextUser);
        return nextUser;
      });
    }

    const newNotif: AppNotification = {
      id: `notif-rej-${Date.now()}`,
      title: '⚠️ चैनल आवेदन अस्वीकृत',
      description: `चैनल "${targetSub.channelName}": ${rejectionReason}`,
      timestamp: 'अभी-अभी',
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleDeleteChannelSubmission = (submissionId: string) => {
    const updatedSubs = channelSubmissions.filter(s => s.id !== submissionId);
    setChannelSubmissions(updatedSubs);
    safeStorage.setJSON('bt_channel_submissions', updatedSubs);
  };

  const handleUpdateChannel = async (updatedData: Partial<Channel>) => {
    setChannel(prev => {
      const next = { ...prev, ...updatedData };
      safeStorage.setJSON('bt_channel', next);

      // Sync updated channel details directly to Firestore for external admin website
      try {
        const db = getFirestoreSafe();
        if (db) {
          const chanId = next.id || channel.id || (currentUser?.id ? `chan-${currentUser.id}` : 'chan-default');
          setDoc(doc(db, 'channels', chanId), cleanFirestoreData({
            ...next,
            updatedAt: serverTimestamp()
          }), { merge: true }).catch(err => console.warn('Firestore channels update error:', err));
        }
      } catch (e) {
        console.warn('Channel update Firestore error:', e);
      }

      return next;
    });
    if (currentUser) {
      setCurrentUser(prev => {
        if (!prev) return null;
        const nextUser: UserAccount = {
          ...prev,
          avatar: updatedData.avatar || prev.avatar,
          name: updatedData.name || prev.name
        };
        safeStorage.setJSON('bt_user', nextUser);
        return nextUser;
      });
    }

    // Sync Logo globally to all state and Firestore if changed
    if (updatedData.avatar) {
      const uid = currentUser?.id || channel.ownerUid;
      const chanId = channel.id || (uid ? `chan-${uid}` : 'chan-default');
      const chanName = updatedData.name || channel.name;
      try {
        await propagateChannelLogoAcrossState({
          newLogoUrl: updatedData.avatar,
          channelId: chanId,
          ownerUid: uid,
          channelName: chanName,
          videos,
          setVideos,
          videoSubmissions,
          setVideoSubmissions,
          channelSubmissions,
          setChannelSubmissions,
          shorts,
          setShorts,
          saveJson: safeStorage.setJSON
        });
      } catch (err) {
        console.warn('Firestore logo sync note:', err);
      }
    }
  };

  const handleDeleteChannel = async () => {
    const chanId = channel.id || `chan-${currentUser?.id}`;
    const uid = currentUser?.id;
    try {
      await deleteChannelFromFirestore(chanId, uid);
    } catch (e) {
      console.warn('Error deleting channel from Firestore:', e);
    }

    // Reset local channel and user state
    const defaultChan: Channel = {
      id: '',
      name: '',
      handle: '',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      banner: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
      subscribers: 0,
      bio: '',
      joinedDate: '2026',
      isVerified: false,
      approvalStatus: 'none',
      kycStatus: 'not_submitted',
      totalViews: 0,
      videoCount: 0,
      cpmRate: 35.00,
      ownerUid: ''
    };
    setChannel(defaultChan);
    safeStorage.setJSON('bt_channel', defaultChan);

    if (currentUser) {
      const nextUser: UserAccount = {
        ...currentUser,
        role: 'viewer',
        channelStatus: 'none',
        channelId: undefined
      };
      setCurrentUser(nextUser);
      safeStorage.setJSON('bt_user', nextUser);
    }

    setChannelSubmissions(prev => {
      const updated = prev.filter(s => s.ownerUid !== uid && s.id !== chanId);
      safeStorage.setJSON('bt_channel_submissions', updated);
      return updated;
    });

    setCurrentView('home');

    const notif: AppNotification = {
      id: `notif-del-chan-${Date.now()}`,
      title: language === 'hi' ? '🗑️ चैनल हटा दिया गया' : '🗑️ Channel Deleted',
      description: language === 'hi'
        ? 'आपका चैनल और क्रिएटर स्टूडियो सेटिंग्स सफलतापूर्वक हटा दिए गए हैं।'
        : 'Your channel and creator settings were successfully removed.',
      timestamp: 'अभी-अभी',
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleUpdateUser = (updatedData: Partial<UserAccount>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updatedData };
      safeStorage.setJSON('bt_user', nextUser);
      return nextUser;
    });
  };

  const handleOpenUploadAction = () => {
    // 1. If not logged in -> ask to login with Google
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    // 2. If user does NOT have an approved channel
    if (channel.approvalStatus !== 'approved') {
      if (channel.approvalStatus === 'pending') {
        setIsChannelPendingModalOpen(true);
        return;
      }
      // If no channel created yet:
      setIsCreateChannelModalOpen(true);
      return;
    }

    // 3. User is an approved creator -> open video upload modal
    setIsUploadModalOpen(true);
  };

  const handleUploadSuccess = (newVideo: Video) => {
    const isShort = Boolean(newVideo.isShort || newVideo.videoType === 'short' || newVideo.category === 'shorts');
    
    // 1. Submit with pending status for Admin moderation workflow
    const pendingVideo: Video = {
      ...newVideo,
      status: 'pending',
      isMonetized: true,
      estimatedEarnings: 0,
      uploadDate: language === 'hi' ? 'समीक्षाधीन (Pending Review)' : 'Under Review'
    };

    // Note: Video is NOT added to public `videos` state until Admin approves it.
    // In Creator Studio, `creatorVideos` automatically reads from `videoSubmissions`
    // so the creator can see their pending video with verification status.

    // 2. Add to videoSubmissions state for Admin Portal review
    const submissionItem: VideoSubmission = {
      id: pendingVideo.id,
      creatorUid: currentUser?.id || 'user',
      channelId: channel.id || `chan-${currentUser?.id}`,
      channelName: channel.name,
      channelAvatar: channel.avatar,
      title: pendingVideo.title,
      youtubeUrl: pendingVideo.youtubeUrl || (pendingVideo.youtubeId ? `https://www.youtube.com/watch?v=${pendingVideo.youtubeId}` : ''),
      youtubeId: pendingVideo.youtubeId || pendingVideo.id,
      category: pendingVideo.category,
      artist: pendingVideo.artist,
      description: pendingVideo.description,
      thumbnailUrl: pendingVideo.thumbnail,
      duration: pendingVideo.duration,
      verificationCode: pendingVideo.verificationCode || `BT-${Math.floor(100000 + Math.random() * 900000)}`,
      visibility: pendingVideo.visibility || 'public',
      sourceType: pendingVideo.sourceType || 'youtube',
      streamUrl: pendingVideo.streamUrl,
      fileSizeMB: pendingVideo.fileSizeMB,
      isShort: isShort,
      videoType: isShort ? 'short' : 'video',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setVideoSubmissions(prev => {
      const updatedSubs = [submissionItem, ...prev.filter(s => s.id !== submissionItem.id)];
      safeStorage.setJSON('bt_video_submissions', updatedSubs);
      return updatedSubs;
    });

    // If it's a short, immediately make it available in the shorts feed
    if (isShort) {
      const newShort = convertToShortItem(newVideo) || convertToShortItem(submissionItem) || {
        id: pendingVideo.id,
        title: pendingVideo.title,
        videoUrl: pendingVideo.youtubeUrl || (pendingVideo.youtubeId ? `https://www.youtube.com/shorts/${pendingVideo.youtubeId}` : (pendingVideo.streamUrl || '')),
        youtubeId: pendingVideo.youtubeId || pendingVideo.id,
        thumbnail: pendingVideo.thumbnail,
        channelName: channel.name || pendingVideo.channelName,
        channelAvatar: channel.avatar || pendingVideo.channelAvatar,
        likes: 0,
        commentsCount: 0,
        soundTitle: `${pendingVideo.artist || channel.name} - Original Audio`,
        views: 0
      };
      setShorts(prev => {
        const filtered = prev.filter(s => s.id !== newShort.id && s.youtubeId !== newShort.youtubeId);
        const updated = [newShort, ...filtered];
        safeStorage.setJSON('bt_shorts_custom', updated);
        return updated;
      });
    }

    // Also persist submission in Firestore video_submissions and videos for external admin website
    try {
      const db = getFirestoreSafe();
      if (db) {
        // 1. Save in video_submissions collection
        setDoc(doc(db, 'video_submissions', pendingVideo.id), cleanFirestoreData({
          ...submissionItem,
          submittedAt: serverTimestamp(),
          serverTimestamp: serverTimestamp()
        }), { merge: true }).catch(err => console.warn('Firestore video submission write note:', err));

        // 2. Also save into videos collection with status: 'pending' so external admin website can query either collection
        setDoc(doc(db, 'videos', pendingVideo.id), cleanFirestoreData({
          ...pendingVideo,
          status: 'pending',
          isVerified: false,
          submittedAt: serverTimestamp(),
          serverTimestamp: serverTimestamp()
        }), { merge: true }).catch(err => console.warn('Firestore pending video write note:', err));
      }
    } catch (e) {
      console.warn('Video submission Firestore error:', e);
    }

    // 4. Update channel video count
    setChannel(prev => {
      const updatedChan = { ...prev, videoCount: (prev.videoCount || 0) + 1 };
      safeStorage.setJSON('bt_channel', updatedChan);
      return updatedChan;
    });

    // 5. Notify creator that video or short is submitted for admin review
    const notif: AppNotification = {
      id: `notif-upload-pending-${Date.now()}`,
      title: isShort
        ? (language === 'hi' ? '⏳ शॉर्ट्स समीक्षाधीन है (Under Review)' : '⏳ Short Under Review')
        : (language === 'hi' ? '⏳ वीडियो समीक्षाधीन है (Under Review)' : '⏳ Video Under Review'),
      description: isShort
        ? (language === 'hi'
            ? `आपकी शॉर्ट्स "${newVideo.title}" व्यवस्थापक (Admin) समीक्षा के लिए सबमिट हो गई है। एडमिन द्वारा स्वीकृति के बाद ही यह शॉर्ट्स फ़ीड में लाइव होगी।`
            : `Your Short "${newVideo.title}" is under Admin review and will appear in the Shorts Feed once approved.`)
        : (language === 'hi'
            ? `आपकी वीडियो "${newVideo.title}" व्यवस्थापक (Admin) सत्यापन के लिए सबमिट हो गई है। एडमिन द्वारा अप्रूवल के बाद यह लाइव फ़ीड में प्रदर्शित होगी।`
            : `Your video "${newVideo.title}" is under Admin review and will be published once approved.`),
      timestamp: 'अभी-अभी',
      isRead: false,
      type: 'upload',
      targetVideoId: pendingVideo.id
    };
    setNotifications(prev => [notif, ...prev]);

    // 6. Shorts and standard videos follow the strict admin review protocol:
    // They are NEVER automatically published to public videos or the public Shorts feed before admin approval.
    // The creator can track the pending review status in Creator Studio.
  };

  const handleApproveVideoSubmission = (submissionId: string) => {
    const targetSub = videoSubmissions.find(s => s.id === submissionId);
    if (!targetSub) return;

    const isShort = Boolean(targetSub.isShort || targetSub.videoType === 'short' || targetSub.category === 'shorts');

    // 1. Update submissions state
    const updatedSubs = videoSubmissions.map(s => s.id === submissionId ? {
      ...s,
      status: 'approved' as const,
      rejectionReason: undefined
    } : s);
    setVideoSubmissions(updatedSubs);
    safeStorage.setJSON('bt_video_submissions', updatedSubs);

    // 2. Construct published video
    const publishedVideo: Video = {
      id: targetSub.id,
      title: targetSub.title,
      artist: targetSub.artist || 'बुन्देली कलाकार',
      category: targetSub.category || (isShort ? 'shorts' : 'lokgeet'),
      views: 0,
      likes: 0,
      uploadDate: language === 'hi' ? 'अभी-अभी' : 'Just now',
      duration: targetSub.duration || (isShort ? '0:50' : '4:30'),
      thumbnail: targetSub.thumbnailUrl,
      youtubeId: targetSub.youtubeId || targetSub.id,
      youtubeUrl: targetSub.youtubeUrl || (targetSub.youtubeId ? `https://www.youtube.com/watch?v=${targetSub.youtubeId}` : undefined),
      sourceType: targetSub.sourceType || 'youtube',
      streamUrl: targetSub.streamUrl,
      fileSizeMB: targetSub.fileSizeMB,
      directFileUrl: targetSub.directFileUrl,
      channelId: targetSub.channelId,
      channelName: targetSub.channelName,
      channelAvatar: targetSub.channelAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      description: targetSub.description,
      isMonetized: true,
      estimatedEarnings: 0,
      verificationCode: targetSub.verificationCode || `BT-${Math.floor(100000 + Math.random() * 900000)}`,
      isShort: isShort,
      videoType: isShort ? 'short' : 'video',
      status: 'published',
      tags: ['bundeli', isShort ? 'shorts' : 'video', targetSub.category]
    };

    // 3. Add to videos list and sync Firestore
    setVideos(prev => {
      const updated = [publishedVideo, ...prev.filter(v => v.id !== publishedVideo.id)];
      safeStorage.setJSON('bt_videos', updated);
      return updated;
    });

    try {
      const db = getFirestoreSafe();
      if (db) {
        setDoc(doc(db, 'videos', publishedVideo.id), cleanFirestoreData({
          ...publishedVideo,
          status: 'published',
          approvedAt: serverTimestamp()
        }), { merge: true }).catch(err => console.warn('Firestore video publish note:', err));
        
        setDoc(doc(db, 'video_submissions', targetSub.id), cleanFirestoreData({
          status: 'approved',
          approvedAt: serverTimestamp()
        }), { merge: true }).catch(() => {});
      }
    } catch (e) {
      console.warn('Error saving approved video to Firestore:', e);
    }

    // 4. If it's a short, also add to shorts state so it plays in Shorts feed immediately
    if (isShort) {
      const newShortItem: ShortItem = convertToShortItem(publishedVideo) || {
        id: publishedVideo.id,
        title: publishedVideo.title,
        videoUrl: publishedVideo.youtubeUrl || (publishedVideo.youtubeId ? `https://www.youtube.com/shorts/${publishedVideo.youtubeId}` : (publishedVideo.streamUrl || '')),
        youtubeId: publishedVideo.youtubeId || publishedVideo.id,
        thumbnail: publishedVideo.thumbnail,
        channelName: publishedVideo.channelName,
        channelAvatar: publishedVideo.channelAvatar,
        likes: 0,
        commentsCount: 0,
        soundTitle: `${publishedVideo.artist} - Original Audio`,
        views: 0
      };
      setShorts(prev => {
        const filtered = prev.filter(s => s.id !== newShortItem.id && s.youtubeId !== newShortItem.youtubeId);
        const updated = [newShortItem, ...filtered];
        safeStorage.setJSON('bt_shorts_custom', updated);
        return updated;
      });
    }

    // 5. Trigger notification
    const newNotif: AppNotification = {
      id: `notif-vid-appr-${Date.now()}`,
      title: `🎉 ${isShort ? 'शॉर्ट्स' : 'वीडियो'} स्वीकृत एवं प्रकाशित!`,
      description: `${isShort ? 'शॉर्ट्स' : 'वीडियो'} "${targetSub.title}" को व्यवस्थापक द्वारा स्वीकृति मिल गई है तथा यह लाइव फ़ीड में प्रदर्शित हो गया है।`,
      timestamp: 'अभी-अभी',
      isRead: false,
      type: 'system',
      targetVideoId: publishedVideo.id
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleRejectVideoSubmission = (submissionId: string, reason?: string) => {
    const targetSub = videoSubmissions.find(s => s.id === submissionId);
    if (!targetSub) return;

    const rejectionReason = reason || 'कॉपीराइट सत्यापन कोड या वीडियो सामग्री मानकों के अनुरूप नहीं पाई गई।';

    const updatedSubs = videoSubmissions.map(s => s.id === submissionId ? {
      ...s,
      status: 'rejected' as const,
      rejectionReason
    } : s);
    setVideoSubmissions(updatedSubs);
    safeStorage.setJSON('bt_video_submissions', updatedSubs);

    try {
      const db = getFirestoreSafe();
      if (db) {
        setDoc(doc(db, 'video_submissions', targetSub.id), cleanFirestoreData({
          status: 'rejected',
          rejectionReason,
          rejectedAt: serverTimestamp()
        }), { merge: true }).catch(() => {});

        setDoc(doc(db, 'videos', targetSub.id), cleanFirestoreData({
          status: 'rejected',
          rejectionReason
        }), { merge: true }).catch(() => {});
      }
    } catch (e) {
      console.warn('Error updating rejected video in Firestore:', e);
    }

    const isShort = Boolean(targetSub.isShort || targetSub.videoType === 'short' || targetSub.category === 'shorts');
    const newNotif: AppNotification = {
      id: `notif-vid-rej-${Date.now()}`,
      title: `⚠️ ${isShort ? 'शॉर्ट्स' : 'वीडियो'} आवेदन अस्वीकृत`,
      description: `शीर्षक "${targetSub.title}": ${rejectionReason}`,
      timestamp: 'अभी-अभी',
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleDeleteVideoSubmission = (submissionId: string) => {
    const updatedSubs = videoSubmissions.filter(s => s.id !== submissionId);
    setVideoSubmissions(updatedSubs);
    safeStorage.setJSON('bt_video_submissions', updatedSubs);
    setShorts(prev => {
      const next = prev.filter(s => s.id !== submissionId);
      safeStorage.setJSON('bt_shorts_custom', next);
      return next;
    });
  };

  const handleApproveVideo = (video: Video) => {
    const cleanDate = (!video.uploadDate || video.uploadDate.includes('Review') || video.uploadDate.includes('समीक्षा'))
      ? (language === 'hi' ? 'अभी-अभी' : 'Just now')
      : video.uploadDate;
    const published: Video = { 
      ...video, 
      status: 'published' as const,
      uploadDate: cleanDate
    };
    setVideos(prev => [published, ...prev.filter(v => v.id !== video.id)]);
    safeStorage.setJSON('bt_videos', [published, ...videos.filter(v => v.id !== video.id)]);
    const newNotif: AppNotification = {
      id: `notif-vid-appr-${Date.now()}`,
      title: '🎉 वीडियो स्वीकृत एवं प्रकाशित!',
      description: `वीडियो "${video.title}" को एडमिन द्वारा स्वीकृति मिल गई है तथा यह लाइव फ़ीड में प्रदर्शित हो गया है।`,
      timestamp: 'अभी-अभी',
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleUpdateVideo = (updatedVideo: Video) => {
    setVideos(prev => {
      const next = prev.map(v => v.id === updatedVideo.id ? updatedVideo : v);
      safeStorage.setJSON('bt_videos', next);
      return next;
    });
    if (selectedVideo?.id === updatedVideo.id) {
      setSelectedVideo(updatedVideo);
    }
  };

  const handleAddVideo = (newVideo: Video) => {
    setVideos(prev => [newVideo, ...prev]);
    safeStorage.setJSON('bt_videos', [newVideo, ...videos]);
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await deleteVideoFromFirestore(videoId);
    } catch (e) {
      console.warn('Error deleting video from Firestore:', e);
    }
    setVideos(prev => {
      const next = prev.filter(v => v.id !== videoId);
      safeStorage.setJSON('bt_videos', next);
      return next;
    });
    setShorts(prev => {
      const next = prev.filter(s => s.id !== videoId);
      safeStorage.setJSON('bt_shorts_custom', next);
      return next;
    });
    setVideoSubmissions(prev => {
      const next = prev.filter(s => s.id !== videoId);
      safeStorage.setJSON('bt_video_submissions', next);
      return next;
    });
    if (selectedVideo?.id === videoId) {
      setSelectedVideo(null);
    }
    const notif: AppNotification = {
      id: `notif-del-vid-${Date.now()}`,
      title: language === 'hi' ? '🗑️ वीडियो हटा दिया गया' : '🗑️ Video Deleted',
      description: language === 'hi'
        ? 'वीडियो सफलतापूर्वक डेटाबेस और चैनल से हटा दिया गया है।'
        : 'Video was successfully deleted from database and channel.',
      timestamp: 'अभी-अभी',
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleUpdateWallet = (newWallet: CreatorWallet) => {
    setWallet(newWallet);
    safeStorage.setJSON('bt_wallet', newWallet);
  };

  const handlePromoteVideo = (campaign: VideoPromotionCampaign) => {
    // 1. Add promotion to promotions state
    setPromotions(prev => [campaign, ...prev]);

    // 2. Mark video as promoted
    setVideos(prev => {
      const next = prev.map(v => {
        if (v.id === campaign.videoId) {
          return {
            ...v,
            isPromoted: true,
            promotionStatus: 'pending_approval' as const,
            promotionTargetImpressions: campaign.targetImpressions,
            promotionPackageId: campaign.packageId
          };
        }
        return v;
      });
      safeStorage.setJSON('bt_videos', next);
      return next;
    });

    // 3. Trigger app notification
    const newNotif: AppNotification = {
      id: `notif-promo-${Date.now()}`,
      title: language === 'hi' ? '⚡ प्रमोशन अनुरोध जमा हुआ' : '⚡ Promotion Request Submitted',
      description: language === 'hi'
        ? `वीडियो "${campaign.videoTitle}" के लिए ₹${campaign.amountPaid} (${campaign.packageName}) का प्रमोशन आवेदन एडमिन को भेजा गया है। यूटीआर: ${campaign.paymentReferenceUtr}`
        : `Promotion for "${campaign.videoTitle}" (₹${campaign.amountPaid}) submitted for Admin verification. UTR: ${campaign.paymentReferenceUtr}`,
      timestamp: 'अभी-अभी',
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleWithdrawalRequested = (amount: number, method: 'UPI' | 'Bank Transfer', target: string) => {
    setWallet(prev => ({
      ...prev,
      currentBalance: prev.currentBalance - amount,
      totalWithdrawn: prev.totalWithdrawn + amount,
      transactions: [
        {
          id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          date: language === 'hi' ? 'आज (Today)' : 'Today',
          amount: amount,
          type: 'withdrawal',
          status: 'pending',
          payoutMethod: method,
          targetAccount: target,
          refId: `PAY-${Date.now().toString().slice(-8)}`,
          note: language === 'hi' ? `${method} द्वारा निकासी अनुरोध दर्ज` : `Withdrawal requested via ${method}`
        },
        ...prev.transactions
      ]
    }));
  };

  const handleOpenCopyrightModalForVideo = (vid: Video) => {
    setCopyrightTargetVideo(vid);
    setIsCopyrightModalOpen(true);
  };

  const handleBannerClick = (banner: AppBanner) => {
    if (banner.targetType === 'video' && banner.targetUrl) {
      const target = videos.find(v => v.id === banner.targetUrl);
      if (target) {
        handlePlayVideo(target);
        return;
      }
    } else if (banner.targetType === 'category' && banner.targetUrl) {
      setSelectedCategory(banner.targetUrl);
      setSelectedVideo(null);
      return;
    } else if (banner.targetType === 'external' && banner.targetUrl) {
      window.open(banner.targetUrl, '_blank');
      return;
    }
    // Fallback if video is available
    if (videos.length > 0) {
      setSelectedVideo(videos[0]);
    }
  };

  const handleUpdateBanners = (newBanners: AppBanner[]) => {
    setBanners(newBanners);
  };

  const handleUpdateRemoteConfig = (newConfig: RemoteAppConfig) => {
    setRemoteConfig(newConfig);
  };

  const handleUpdateCopyrightReports = (newReports: CopyrightReportData[]) => {
    setCopyrightReports(newReports);
  };

  const handleVoiceSearchResult = (text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      recordSearchQuery(text.trim(), currentUser);
    }
    setSelectedVideo(null);
    setCurrentView('home');
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    handleMarkNotificationRead(notif.id);
    if (notif.targetVideoId) {
      const target = videos.find(v => v.id === notif.targetVideoId);
      if (target) {
        setSelectedVideo(target);
        setIsNotificationsDrawerOpen(false);
      }
    } else if (notif.type === 'payout') {
      setCurrentView('wallet');
      setIsNotificationsDrawerOpen(false);
    }
  };

  // Public Videos (strictly published and approved LONG videos for home, explore, search feeds; shorts are excluded here and appear in the Shorts feed)
  const publicVideos = useMemo(() => {
    return videos
      .filter(v => {
        // 1. Exclude pending/rejected videos
        if (v.status === 'pending' || v.status === 'rejected') return false;
        if (v.status && v.status !== 'published' && v.status !== 'approved') return false;
        if (v.id.startsWith('sub-') || v.id.startsWith('vid-custom-')) {
          if (v.status !== 'published' && v.status !== 'approved') return false;
        }
        // 2. Strict separation: Shorts do not appear in the regular/long video list
        const isShort = Boolean(
          v.isShort === true ||
          v.videoType === 'short' ||
          v.category === 'shorts' ||
          (v.duration && (v.duration === '0:50' || v.duration === '0:30' || v.duration === '0:15'))
        );
        if (isShort) return false;

        return true;
      })
      .map(v => {
        // Sanitize any lingering "Review" or "समीक्षा" in uploadDate so live videos on home/main page never show review text
        if (v.uploadDate && (v.uploadDate.includes('Review') || v.uploadDate.includes('समीक्षा'))) {
          return {
            ...v,
            uploadDate: language === 'hi' ? 'हाल ही में' : 'Recently'
          };
        }
        return v;
      });
  }, [videos, language]);

  // Filtered Videos based on category & search query
  const filteredVideos = publicVideos.filter(v => {
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      v.title.toLowerCase().includes(q) ||
      v.artist.toLowerCase().includes(q) ||
      v.channelName.toLowerCase().includes(q) ||
      v.tags.some(t => t.toLowerCase().includes(q))
    );
    return matchesCategory && matchesSearch;
  });

  // Creator's uploaded videos - strictly matching this channel (including pending submissions)
  const creatorVideos = useMemo(() => {
    if (!currentUser && (!channel || !channel.ownerUid)) return [];
    const list: Video[] = [];
    const seenIds = new Set<string>();

    const myUid = currentUser?.id;
    const myChannelId = channel?.id;
    const myOwnerUid = channel?.ownerUid;

    videos.forEach(v => {
      const matches = Boolean(
        (myChannelId && (v.channelId === myChannelId || v.channelId === `chan-${myChannelId}`)) ||
        (myOwnerUid && (v.channelId === myOwnerUid || v.creatorId === myOwnerUid)) ||
        (myUid && (v.creatorId === myUid || v.channelId === myUid || v.channelId === `chan-${myUid}`))
      );

      if (matches && !seenIds.has(v.id)) {
        seenIds.add(v.id);
        list.push(v);
      }
    });

    // Also include any submissions for this channel / creator not yet present in videos array
    videoSubmissions.forEach(sub => {
      const matches = Boolean(
        (myChannelId && (sub.channelId === myChannelId || sub.channelId === `chan-${myChannelId}`)) ||
        (myOwnerUid && (sub.creatorUid === myOwnerUid || sub.channelId === myOwnerUid)) ||
        (myUid && (sub.creatorUid === myUid || sub.channelId === myUid || sub.channelId === `chan-${myUid}`))
      );

      if (matches && !seenIds.has(sub.id)) {
        seenIds.add(sub.id);
        list.push({
          id: sub.id,
          title: sub.title,
          description: sub.description,
          youtubeId: sub.youtubeId,
          thumbnail: sub.thumbnailUrl,
          category: sub.category,
          artist: sub.artist,
          channelId: sub.channelId,
          channelName: sub.channelName,
          channelAvatar: sub.channelAvatar || channel.avatar,
          creatorId: sub.creatorUid,
          status: sub.status,
          rejectionReason: sub.rejectionReason,
          isShort: sub.isShort,
          videoType: sub.videoType,
          views: 0,
          likes: 0,
          commentsCount: 0,
          duration: sub.duration || '4:30',
          uploadDate: sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('hi-IN') : 'समीक्षाधीन',
          isVerified: false,
          isMonetized: true,
          estimatedEarnings: 0,
          tags: [],
          verificationCode: sub.verificationCode,
          visibility: sub.visibility || 'public',
          sourceType: sub.sourceType,
          streamUrl: sub.streamUrl,
          fileSizeMB: sub.fileSizeMB
        });
      }
    });

    return list;
  }, [videos, videoSubmissions, channel.id, channel.ownerUid, channel.avatar, currentUser?.id]);

  // Featured Hero Video
  const featuredVideo = publicVideos[0] || videos[0];

  // Count of pending video submissions for Admin attention
  const pendingVideoSubmissionsCount = videoSubmissions.filter(s => s.status === 'pending').length;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors`}>
      
      {/* Top Main App Header (Full YouTube Feature Set - hidden in dedicated Creator Studio & on mobile watch view) */}
      <div className={selectedVideo ? 'hidden sm:block w-full sticky top-0 z-40' : currentView === 'studio' ? 'hidden' : 'w-full sticky top-0 z-40'}>
        <div className="relative z-50">
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={() => {
              if (searchQuery.trim()) {
                recordSearchQuery(searchQuery.trim(), currentUser);
              }
              setSelectedVideo(null);
              setCurrentView('home');
            }}
            currentUser={currentUser}
            channel={channel}
            walletBalance={wallet.currentBalance}
            notifications={notifications}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onOpenCreateChannelModal={() => {
              if (!currentUser) {
                setIsLoginModalOpen(true);
              } else {
                setIsCreateChannelModalOpen(true);
              }
            }}
            onOpenPendingStatusModal={() => setIsChannelPendingModalOpen(true)}
            onOpenUploadModal={() => {
              if (!currentUser) {
                setIsLoginModalOpen(true);
              } else if (channel.approvalStatus === 'pending') {
                setIsChannelPendingModalOpen(true);
              } else if (channel.approvalStatus !== 'approved') {
                setIsCreateChannelModalOpen(true);
              } else {
                setIsUploadModalOpen(true);
              }
            }}
            onOpenWalletModal={() => {
              if (!currentUser) {
                setIsLoginModalOpen(true);
              } else {
                setIsWalletModalOpen(true);
              }
            }}
            onOpenCopyrightModal={() => {
              setCopyrightTargetVideo(null);
              setIsCopyrightModalOpen(true);
            }}
            onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
            onToggleNotifications={() => setIsNotificationsDrawerOpen(prev => !prev)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
            onOpenHelpCenter={() => setIsHelpCenterModalOpen(true)}
            onOpenPolicies={handleOpenPolicies}
            onNavigateToStudio={() => setCurrentView('studio')}
            onNavigateToYou={() => setCurrentView('you')}
            onLogout={handleLogout}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            language={language}
            onToggleLanguage={handleToggleLanguage}
          />
        </div>

        {/* Category Pills Strip - Seamlessly connected directly under Header with lower z-index */}
        {!selectedVideo && currentView === 'home' && (
          <div className={`w-full relative z-10 ${
            theme === 'light' 
              ? 'bg-white/95 text-slate-900 border-slate-200/80 shadow-2xs' 
              : 'bg-slate-950/95 text-slate-100 border-slate-800/80 shadow-2xs'
          } backdrop-blur-md px-2 sm:px-4 lg:px-6 py-1 border-b transition-colors`}>
            <div className="max-w-[1700px] mx-auto">
              <CategoryPills
                selectedCategory={selectedCategory}
                onSelectCategory={(id) => setSelectedCategory(id)}
                language={language}
                onOpenExplore={() => setCurrentView('explore')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Container Layout */}
      <div className="flex flex-1 relative">
        
        {/* Mobile Backdrop Overlay when sidebar is open */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 top-14 bg-slate-950/70 backdrop-blur-xs z-25 lg:hidden animate-in fade-in duration-200"
            aria-hidden="true"
          />
        )}

        {/* Responsive Left Sidebar (Full YouTube Hierarchy) - Hidden in dedicated Creator Studio */}
        {currentView !== 'studio' && (
          <Sidebar
            currentView={currentView}
            onNavigate={(view) => {
              setSelectedVideo(null);
              setCurrentView(view);
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
              setSelectedVideo(null);
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
            isOpen={sidebarOpen}
            channel={channel}
            currentUser={currentUser}
            onOpenLogin={() => {
              setIsLoginModalOpen(true);
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
            onLogout={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
              handleLogout();
            }}
            onOpenCreateChannel={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
              if (!currentUser) {
                setIsLoginModalOpen(true);
              } else {
                setIsCreateChannelModalOpen(true);
              }
            }}
            onOpenPendingStatusModal={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
              setIsChannelPendingModalOpen(true);
            }}
            onOpenUpload={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
              if (!currentUser) {
                setIsLoginModalOpen(true);
              } else if (channel.approvalStatus === 'pending') {
                setIsChannelPendingModalOpen(true);
              } else if (channel.approvalStatus !== 'approved') {
                setIsCreateChannelModalOpen(true);
              } else {
                setIsUploadModalOpen(true);
              }
            }}
            onOpenSettings={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
              setIsSettingsModalOpen(true);
            }}
            onOpenCopyright={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
              setCopyrightTargetVideo(null);
              setIsCopyrightModalOpen(true);
            }}
            onOpenPremium={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
              setIsPremiumModalOpen(true);
            }}
            onOpenHelpCenter={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
              setIsHelpCenterModalOpen(true);
            }}
            onOpenPolicies={(tab) => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
              handleOpenPolicies(tab);
            }}
            language={language}
            onToggleLanguage={handleToggleLanguage}
            theme={theme}
          />
        )}

        {/* Center Content / Active View */}
        <main className={`flex-1 w-full min-w-0 transition-all ${
          selectedVideo || currentView === 'studio'
            ? 'p-0 overflow-visible'
            : 'px-2 sm:px-4 lg:px-6 pt-0 pb-20 lg:pb-6 overflow-x-hidden'
        }`}>
          
          {/* VIEW 1: Video Player Active */}
          {selectedVideo ? (
            <VideoPlayerView
              key={`player-view-${selectedVideo.id}`}
              video={selectedVideo}
              allVideos={publicVideos}
              onClose={() => {
                setSelectedVideo(null);
                setMinimizedVideo(null);
              }}
              onMinimize={handleMinimizeVideo}
              onSelectVideo={(v) => {
                setSelectedVideo(v);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              currentUser={currentUser}
              onOpenCopyrightModal={handleOpenCopyrightModalForVideo}
              onAdImpressionCredited={handleAdImpressionCredited}
              language={language}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          ) : currentView === 'shorts' ? (
            /* VIEW 2: YouTube Shorts View (बुंदेली रील्स) */
            <ShortsView
              shorts={shorts}
              initialIndex={activeShortIndex}
              onSelectVideo={(v) => handlePlayVideo(v)}
              currentUser={currentUser}
              onAdImpressionCredited={handleAdImpressionCredited}
              onClose={() => setCurrentView('home')}
              language={language}
              allVideos={publicVideos}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onOpenUploadModal={() => {
                if (!currentUser) setIsLoginModalOpen(true);
                else if (channel.approvalStatus !== 'approved') setIsCreateChannelModalOpen(true);
                else setIsUploadModalOpen(true);
              }}
            />
          ) : currentView === 'subscriptions' ? (
            /* VIEW 3: YouTube Subscriptions Feed */
            <SubscriptionsView
              videos={publicVideos}
              onSelectVideo={(v) => handlePlayVideo(v)}
              language={language}
            />
          ) : (currentView === 'you' || currentView === 'library' || currentView === 'history' || currentView === 'watch_later' || currentView === 'liked' || currentView === 'downloads' || currentView === 'playlists') ? (
            /* VIEW 4: YouTube You / Library View */
            <YouLibraryView
              videos={publicVideos}
              currentUser={currentUser}
              channel={channel}
              activeTab={
                currentView === 'history' ? 'history' :
                currentView === 'watch_later' ? 'watch_later' :
                currentView === 'liked' ? 'liked' :
                currentView === 'downloads' ? 'downloads' :
                currentView === 'playlists' ? 'playlists' : 'overview'
              }
              onSelectVideo={(v) => handlePlayVideo(v)}
              onNavigate={(v) => setCurrentView(v)}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onLogout={handleLogout}
              onOpenStudio={() => setCurrentView('studio')}
              onOpenCreateChannel={() => setIsCreateChannelModalOpen(true)}
              onOpenPendingStatusModal={() => setIsChannelPendingModalOpen(true)}
              onOpenWallet={() => {
                if (!currentUser) {
                  setIsLoginModalOpen(true);
                } else {
                  setIsWalletModalOpen(true);
                }
              }}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              onOpenHelpCenter={() => setIsHelpCenterModalOpen(true)}
              onOpenPolicies={handleOpenPolicies}
              onOpenPremium={() => setIsPremiumModalOpen(true)}
              onOpenCopyrightModal={() => {
                setCopyrightTargetVideo(null);
                setIsCopyrightModalOpen(true);
              }}
              onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
              language={language}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onToggleLanguage={handleToggleLanguage}
              walletBalance={wallet.currentBalance}
            />
          ) : (currentView === 'explore' || currentView === 'trending' || currentView === 'music' || currentView === 'live' || currentView === 'podcasts') ? (
            /* VIEW 5: YouTube Explore Feed (Trending, Music, Live, Podcasts) */
            <ExploreView
              videos={publicVideos}
              activeCategory={
                currentView === 'music' ? 'music' :
                currentView === 'live' ? 'live' :
                currentView === 'podcasts' ? 'podcasts' : 'trending'
              }
              onSelectVideo={(v) => handlePlayVideo(v)}
              language={language}
            />
          ) : currentView === 'studio' ? (
            /* VIEW 6: Creator Studio */
            currentUser ? (
              channel.approvalStatus === 'approved' ? (
                <CreatorStudioView
                  channel={channel}
                  creatorVideos={creatorVideos}
                  wallet={wallet}
                  currentUser={currentUser}
                  promotions={promotions}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                  onOpenWalletModal={() => setIsWalletModalOpen(true)}
                  onOpenCreateChannelModal={() => setIsCreateChannelModalOpen(true)}
                  language={language}
                  onToggleLanguage={handleToggleLanguage}
                  theme={theme}
                  onToggleTheme={handleToggleTheme}
                  onNavigateHome={() => {
                    setSelectedVideo(null);
                    setCurrentView('home');
                  }}
                  onNavigateToYou={() => {
                    setSelectedVideo(null);
                    setCurrentView('you');
                  }}
                  onOpenSettings={() => setIsSettingsModalOpen(true)}
                  onOpenHelpCenter={() => setIsHelpCenterModalOpen(true)}
                  onLogout={handleLogout}
                  onUpdateChannel={handleUpdateChannel}
                  onDeleteChannel={handleDeleteChannel}
                  onUpdateVideo={handleUpdateVideo}
                  onDeleteVideo={handleDeleteVideo}
                  onPromoteVideo={handlePromoteVideo}
                  onSyncFromFirestore={handlePullDataFromFirestore}
                />
              ) : channel.approvalStatus === 'pending' ? (
                /* Channel Pending Review Screen */
                <div className="max-w-xl mx-auto py-12 px-6 text-center bg-slate-900 border border-amber-500/30 rounded-3xl space-y-4 shadow-2xl">
                  <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-3xl mx-auto flex items-center justify-center border border-amber-500/30">
                    <Clock className="w-8 h-8 animate-pulse text-amber-500" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase">
                    <span>{language === 'hi' ? 'चैनल समीक्षाधीन है' : 'Under Review'}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-100 font-bundeli">
                    {language === 'hi' ? 'आपका चैनल अनुमोदन के लिए पेंडिंग है' : 'Your Channel is Pending Approval'}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                    {language === 'hi'
                      ? 'व्यवस्थापक (Admin) द्वारा आपके चैनल और KYC विवरण की समीक्षा की जा रही है। एडमिन पैनल से अप्रूव होते ही आपका क्रिएटर स्टूडियो सक्रिय हो जाएगा।'
                      : 'Your channel application is currently being reviewed by Admin. Creator Studio will unlock automatically once approved from the Admin Panel.'}
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setIsChannelPendingModalOpen(true)}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4 stroke-[2.5]" />
                      <span>{language === 'hi' ? 'आवेदन स्थिति देखें' : 'View Application Status'}</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('home')}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                    >
                      {language === 'hi' ? 'होम पेज (Home)' : 'Go Home'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Prompt user to create channel if logged in as viewer */
                <div className="max-w-xl mx-auto py-12 px-6 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                  <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-3xl mx-auto flex items-center justify-center border border-amber-500/30">
                    <Tv className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-100 font-bundeli">
                    {language === 'hi' ? 'अपना बुन्देली चैनल बनाएँ' : 'Create Your Bundeli Channel'}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                    {language === 'hi'
                      ? 'वीडियो अपलोड करने, क्रिएटर स्टूडियो प्रबंधित करने और विज्ञापन रेवेन्यू सीधे बैंक/UPI में पाने के लिए अपना चैनल बनाएं।'
                      : 'Create your channel to upload videos, access Creator Studio, and earn ad revenue directly in your bank/UPI.'}
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setIsCreateChannelModalOpen(true)}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>{language === 'hi' ? 'चैनल बनाएँ' : 'Create Channel'}</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('home')}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                    >
                      {language === 'hi' ? 'वीडियो देखें (Home)' : 'Watch Videos'}
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* Require Login Banner for Studio */
              <div className="max-w-xl mx-auto py-12 px-6 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-3xl mx-auto flex items-center justify-center border border-amber-500/30">
                  <Tv className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-100 font-bundeli">{t.creatorStudio}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'hi' 
                    ? 'क्रिएटर स्टूडियो, वीडियो अपलोड और विज्ञापन कमाई देखने के लिए कृपया अपने गूगल खाते से लॉगिन करें।' 
                    : 'Please login with your Google account to access Creator Studio, upload videos, and track revenue.'}
                </p>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  {t.login}
                </button>
              </div>
            )
          ) : currentView === 'wallet' ? (
            /* VIEW 7: Dedicated Wallet View */
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-slate-800 gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
                      <IndianRupee className="w-6 h-6 text-amber-400" />
                      <span>{t.walletTitle}</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {t.privacyNote}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setIsLoginModalOpen(true);
                      } else {
                        setIsWalletModalOpen(true);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
                  >
                    {t.withdrawFunds}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center my-6">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">{t.currentBalance}</span>
                    <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                      ₹{wallet.currentBalance.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">{t.totalWithdrawn}</span>
                    <div className="text-2xl font-bold text-slate-100 mt-1 font-mono">
                      ₹{wallet.totalWithdrawn.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">न्यूनतम निकासी सीमा</span>
                    <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
                      ₹{wallet.minWithdrawalLimit.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <span className="font-bold text-amber-400 uppercase text-[11px] block">
                    {language === 'hi' ? 'महत्वपूर्ण नियम:' : 'Key Monetization Rules:'}
                  </span>
                  <p>• {t.revenueShareNote}</p>
                  <p>• {t.bannerShareNote}</p>
                  <p>• {t.uploadRewardZeroNote}</p>
                  <button
                    type="button"
                    onClick={() => handleOpenPolicies('bundelitube')}
                    className="text-amber-400 hover:underline font-bold text-xs pt-2 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{language === 'hi' ? 'संपूर्ण नीतियां पढ़ें (AdSense / AdMob / 50-50 Policy) →' : 'Read Full Policies & Compliance →'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : currentView === 'policies' ? (
            /* VIEW: Dedicated Policies & Compliance Page */
            <div className="max-w-5xl mx-auto py-4 px-2 sm:px-6">
              <PolicyCenterModal
                isOpen={true}
                onClose={() => setCurrentView('home')}
                initialTab={policyActiveTab}
                language={language}
                theme={theme}
                isEmbeddedView={true}
              />
            </div>
          ) : (
            /* VIEW 8: YouTube Home Page Feed */
            <div className="max-w-[1700px] mx-auto pt-2">
              
              {/* Videos Feed (First Batch of Videos) with clean margin so top is never cut off */}
              {filteredVideos.length > 0 ? (
                <div className="space-y-6 px-1 sm:px-2">
                  
                  {/* Top Banner Ad (Google AdMob Large Masthead Long Video Format) */}
                  {remoteConfig.adsEnabled && !searchQuery && (
                    <TopBannerAd
                      admobBannerId={remoteConfig.admobBannerId}
                      language={language}
                      onPlayVideo={(v) => handlePlayVideo(v)}
                      onNavigateToUpload={() => {
                        if (!currentUser) setIsLoginModalOpen(true);
                        else setIsUploadModalOpen(true);
                      }}
                      onNavigateToChannel={() => {
                        if (!currentUser) setIsLoginModalOpen(true);
                        else setIsCreateChannelModalOpen(true);
                      }}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-8 pt-1">
                    {filteredVideos.slice(0, 6).map((video, idx) => (
                      <React.Fragment key={video.id}>
                        <VideoCard
                          video={video}
                          onPlay={(v) => handlePlayVideo(v)}
                          language={language}
                        />

                        {/* Native AdMob Card embedded according to remote frequency */}
                        {remoteConfig.adsEnabled && (idx + 1) % (remoteConfig.nativeAdInterval || 4) === 0 && (
                          <AdMobNativeCard
                            admobNativeId={remoteConfig.admobNativeId}
                            language={language}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* YouTube Shorts Shelf (matching screenshot inline placement) */}
                  {!searchQuery && selectedCategory === 'all' && shorts.length > 0 && (
                    <div className="my-8 pt-4 pb-2 border-y border-slate-200 dark:border-slate-800/80 space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <span>Shorts</span>
                          </h3>
                        </div>
                        <button
                          onClick={() => setCurrentView('shorts')}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>{language === 'hi' ? 'सभी देखें' : 'View All'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {shorts.slice(0, 6).map((short, sIdx) => (
                          <div
                            key={short.id}
                            onClick={() => {
                              setActiveShortIndex(sIdx);
                              setSelectedVideo(null);
                              setCurrentView('shorts');
                            }}
                            className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 cursor-pointer shadow-md hover:shadow-lg transition-transform duration-200 hover:scale-[1.02]"
                          >
                            <img
                              src={safeImageSrc(short.thumbnail)}
                              alt={short.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            <div className="absolute bottom-3 inset-x-3 space-y-1">
                              <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                                {short.title}
                              </p>
                              <p className="text-[11px] text-slate-300 font-normal truncate">
                                {short.channelName}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Remaining Videos below the Shorts shelf */}
                  {filteredVideos.length > 6 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-8 pt-2">
                      {filteredVideos.slice(6).map((video, idx) => (
                        <React.Fragment key={video.id}>
                          <VideoCard
                            video={video}
                            onPlay={(v) => handlePlayVideo(v)}
                            language={language}
                          />

                          {remoteConfig.adsEnabled && (idx + 7) % (remoteConfig.nativeAdInterval || 4) === 0 && (
                            <AdMobNativeCard
                              admobNativeId={remoteConfig.admobNativeId}
                              language={language}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              ) : videos.length === 0 ? (
                <div className="max-w-lg mx-auto py-16 px-6 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm my-6">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                    <Tv className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                    {language === 'hi' ? 'अभी कोई वीडियो उपलब्ध नहीं है' : 'No Videos Available Yet'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {language === 'hi'
                      ? 'मंच पूरी तरह तैयार और खाली है। अपना चैनल बनाएं अथवा लॉगिन करके पहला वीडियो या शॉर्ट्स अपलोड करें।'
                      : 'The platform is completely clean and ready. Create your channel or sign in to upload the first video or short.'}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        if (!currentUser) setIsLoginModalOpen(true);
                        else if (channel.approvalStatus !== 'approved') setIsCreateChannelModalOpen(true);
                        else setIsUploadModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>{language === 'hi' ? 'पहला वीडियो अपलोड करें' : 'Upload First Video'}</span>
                    </button>
                    {!currentUser && (
                      <button
                        onClick={() => setIsLoginModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                      >
                        {language === 'hi' ? 'साइन इन करें' : 'Sign In'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-100 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800/60 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {language === 'hi' ? 'कोई वीडियो नहीं मिला' : 'No videos found'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    {language === 'hi'
                      ? `"${searchQuery || selectedCategory}" के लिए कोई परिणाम नहीं मिला।`
                      : `No results found for "${searchQuery || selectedCategory}".`}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition cursor-pointer"
                  >
                    {language === 'hi' ? 'सभी वीडियो देखें' : 'View All Videos'}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsDrawerOpen}
        onClose={() => setIsNotificationsDrawerOpen(false)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearNotifications}
        language={language}
      />

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onSearchResult={handleVoiceSearchResult}
        language={language}
      />

      {/* App Settings Modal (Theme, Audio Mode, Quality, Notifications, Channel Logo) */}
      <AppSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={appSettings}
        channel={channel}
        currentUser={currentUser}
        onUpdateChannel={handleUpdateChannel}
        onUpdateUser={handleUpdateUser}
        onOpenPolicies={handleOpenPolicies}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onToggleLanguage={handleToggleLanguage}
        onSaveSettings={(newSettings) => {
          setAppSettings(newSettings);
          if (newSettings.language !== language) setLanguage(newSettings.language);
          if (newSettings.theme !== theme) setTheme(newSettings.theme);
        }}
        language={language}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        language={language}
      />

      {/* BundeliTube Premium Modal */}
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        language={language}
      />

      {/* Login & Account Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          if (currentUser) {
            setIsLoginModalOpen(false);
          }
        }}
        allowClose={!!currentUser}
        onLoginSuccess={handleLoginSuccess}
        language={language}
      />

      {/* Create Channel / KYC Modal */}
      <CreateChannelModal
        isOpen={isCreateChannelModalOpen}
        onClose={() => setIsCreateChannelModalOpen(false)}
        currentUser={currentUser}
        onChannelSubmitted={handleChannelSubmitted}
        onOpenUploadModal={() => {
          setIsCreateChannelModalOpen(false);
          setIsUploadModalOpen(true);
        }}
        onNavigateToStudio={() => {
          setIsCreateChannelModalOpen(false);
          setSelectedVideo(null);
          setCurrentView('studio');
        }}
        onOpenPolicies={handleOpenPolicies}
        language={language}
      />

      {/* Channel Application Under Review Modal */}
      <ChannelPendingModal
        isOpen={isChannelPendingModalOpen}
        onClose={() => setIsChannelPendingModalOpen(false)}
        channel={channel}
        language={language}
      />

      {/* Upload Video Modal with Verification Token */}
      <UploadVideoModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        channel={channel}
        currentUser={currentUser}
        remoteConfig={remoteConfig}
        onUploadSuccess={handleUploadSuccess}
        onNavigateToShorts={() => {
          setIsUploadModalOpen(false);
          setSelectedVideo(null);
          setActiveShortIndex(0);
          setCurrentView('shorts');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        onOpenCreateChannel={() => {
          setIsUploadModalOpen(false);
          setIsCreateChannelModalOpen(true);
        }}
        onOpenLogin={() => {
          setIsUploadModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* Wallet / Withdrawal Modal */}
      {currentUser && (
        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          wallet={wallet}
          channel={channel}
          currentUser={currentUser}
          onWithdrawalRequested={handleWithdrawalRequested}
          onOpenPolicies={handleOpenPolicies}
          language={language}
          remoteConfig={remoteConfig}
          onUpdateRemoteConfig={handleUpdateRemoteConfig}
        />
      )}

      {/* User Copyright Report Modal */}
      <CopyrightModal
        isOpen={isCopyrightModalOpen}
        onClose={() => {
          setIsCopyrightModalOpen(false);
          setCopyrightTargetVideo(null);
        }}
        selectedVideo={copyrightTargetVideo}
        currentUser={currentUser}
        language={language}
      />

      {/* Help Center & Support Modal */}
      <HelpCenterModal
        isOpen={isHelpCenterModalOpen}
        onClose={() => setIsHelpCenterModalOpen(false)}
        language={language}
        currentUser={currentUser}
      />

      {/* Google AdSense, AdMob & BundeliTube Policy Center Modal */}
      <PolicyCenterModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        initialTab={policyActiveTab}
        language={language}
        theme={theme}
      />

      {/* Floating MiniPlayer when docked */}
      {minimizedVideo && !selectedVideo && (
        <MiniPlayer
          video={minimizedVideo}
          isPlaying={isMiniplayerPlaying}
          onTogglePlay={handleToggleMiniplayerPlay}
          onExpand={handleExpandMiniplayer}
          onClose={handleCloseMiniplayer}
          language={language}
        />
      )}

      {/* Mobile Fixed Bottom Navigation Bar (YouTube UX) */}
      <BottomNav
        currentView={currentView}
        onNavigate={(v) => {
          setSelectedVideo(null);
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        channel={channel}
        onOpenUpload={handleOpenUploadAction}
        onOpenCreateChannel={() => setIsCreateChannelModalOpen(true)}
        onOpenPendingStatusModal={() => setIsChannelPendingModalOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        language={language}
      />
    </div>
  );
}
