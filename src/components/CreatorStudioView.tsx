import React, { useState, useRef, useEffect } from 'react';
import { 
  Tv, 
  Upload, 
  IndianRupee, 
  TrendingUp, 
  Eye, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Sparkles,
  Lock,
  ArrowRight,
  BarChart3,
  Globe2,
  MapPin,
  Smartphone,
  Sliders,
  Settings,
  Search,
  Share2,
  Bell,
  Menu,
  X,
  HelpCircle,
  MessageSquarePlus,
  ArrowLeft,
  RefreshCw,
  Sun,
  Moon,
  Languages,
  LogOut,
  User,
  Video as VideoIcon
} from 'lucide-react';
import { Channel, Video, CreatorWallet, UserAccount, AppUserSettings, VideoPromotionCampaign } from '../types';
import { Language, translations } from '../locales/i18n';

// Studio Subcomponents
import { StudioSidebar, StudioTabType } from './studio/StudioSidebar';
import { StudioDashboardTab } from './studio/StudioDashboardTab';
import { StudioContentTab } from './studio/StudioContentTab';
import { StudioPromotionsTab } from './studio/StudioPromotionsTab';
import { StudioAnalyticsTab } from './studio/StudioAnalyticsTab';
import { StudioCommentsTab } from './studio/StudioCommentsTab';
import { StudioSubtitlesTab } from './studio/StudioSubtitlesTab';
import { StudioCopyrightTab } from './studio/StudioCopyrightTab';
import { StudioEarnTab } from './studio/StudioEarnTab';
import { StudioCustomizationTab } from './studio/StudioCustomizationTab';
import { StudioAudioLibraryTab } from './studio/StudioAudioLibraryTab';
import { StudioSettingsModal } from './studio/StudioSettingsModal';
import { StudioFeedbackModal } from './studio/StudioFeedbackModal';
import { PromoteVideoModal } from './PromoteVideoModal';

interface CreatorStudioViewProps {
  channel: Channel;
  creatorVideos: Video[];
  wallet: CreatorWallet;
  currentUser: UserAccount;
  promotions?: VideoPromotionCampaign[];
  onOpenUploadModal: () => void;
  onOpenWalletModal: () => void;
  onOpenCreateChannelModal: () => void;
  language: Language;
  onToggleLanguage?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onNavigateHome?: () => void;
  onNavigateToYou?: () => void;
  onOpenSettings?: () => void;
  onOpenHelpCenter?: () => void;
  onLogout?: () => void;
  onUpdateChannel?: (updatedData: Partial<Channel>) => void;
  onDeleteChannel?: () => void;
  onUpdateVideo?: (updatedVideo: Video) => void;
  onDeleteVideo?: (videoId: string) => void;
  onPromoteVideo?: (campaign: VideoPromotionCampaign) => void;
  onSyncFromFirestore?: () => Promise<void>;
}

export const CreatorStudioView: React.FC<CreatorStudioViewProps> = ({
  channel,
  creatorVideos,
  wallet,
  currentUser,
  promotions = [],
  onOpenUploadModal,
  onOpenWalletModal,
  onOpenCreateChannelModal,
  language,
  onToggleLanguage,
  theme = 'dark',
  onToggleTheme,
  onNavigateHome,
  onNavigateToYou,
  onOpenSettings,
  onOpenHelpCenter,
  onLogout,
  onUpdateChannel,
  onDeleteChannel,
  onUpdateVideo,
  onDeleteVideo,
  onPromoteVideo,
  onSyncFromFirestore
}) => {
  const t = translations[language];
  const isLight = theme === 'light';
  const isApproved = channel.approvalStatus === 'approved';
  const isPending = channel.approvalStatus === 'pending';
  const isRejected = channel.approvalStatus === 'rejected';

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');

  // Profile Dropdown Menu in Top Right
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleManualSync = async () => {
    if (!onSyncFromFirestore) return;
    setIsSyncing(true);
    setSyncNotice('');
    try {
      await onSyncFromFirestore();
      setSyncNotice(language === 'hi' ? '✅ स्थिति सफलतापूर्वक सिंक की गई!' : '✅ Status synced from Firebase!');
      setTimeout(() => setSyncNotice(''), 4000);
    } catch (e: any) {
      setSyncNotice(language === 'hi' ? '⚠️ सिंक में त्रुटि, कृपया पुनः प्रयास करें' : '⚠️ Sync error, try again');
    } finally {
      setIsSyncing(false);
    }
  };

  // Active Studio Tab (All YouTube Studio options)
  const [activeTab, setActiveTab] = useState<StudioTabType>('dashboard');
  
  // Mobile Sidebar Drawer State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Studio Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [inspectedVideo, setInspectedVideo] = useState<Video | null>(null);
  const [selectedPromoteVideo, setSelectedPromoteVideo] = useState<Video | null>(null);

  // Top Search in Studio
  const [studioGlobalSearch, setStudioGlobalSearch] = useState('');

  // If Channel is Not Approved yet, show Status / Onboarding Screen
  if (!isApproved) {
    return (
      <div id="creator-studio-unapproved-view" className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
          
          {isPending ? (
            <>
              <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-lg animate-pulse">
                <Clock className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider">
                  समीक्षाधीन (Under Verification)
                </span>
                <h2 className="text-2xl font-black text-slate-100">
                  {language === 'hi' ? 'आपका बुंदेली क्रिएटर चैनल समीक्षाधीन है' : 'Channel Verification in Progress'}
                </h2>
                <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  {language === 'hi'
                    ? `नमस्ते ${currentUser?.name || 'कलाकार'}! आपके चैनल "${channel?.name || 'बुन्देली चैनल'}" की सुरक्षा व कॉपीराइट सत्यापन प्रक्रिया प्रगति पर है। हमारी टीम 24 घंटे में आपके चैनल को स्वीकृति दे देगी।`
                    : `Hello ${currentUser?.name || 'Creator'}! Your channel "${channel?.name || 'Bundeli Channel'}" is being reviewed by our moderation team. You will receive an approval notification within 24 hours.`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">चैनल आईडी:</span>
                  <span className="text-amber-400 font-mono font-bold">{channel?.id || 'chan-pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">कलाकार / स्टूडियो:</span>
                  <span className="text-slate-200 font-medium">{channel?.name || 'बुन्देली चैनल'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">सत्यापन स्थिति:</span>
                  <span className="text-amber-400 font-bold">24 घंटे के भीतर सक्रिय</span>
                </div>
              </div>

              {/* Real-time Automatic Status Live Indicator */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 max-w-md mx-auto space-y-2 text-left">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>{language === 'hi' ? 'स्वचालित रीयल-टाइम सिंक सक्रिय' : 'Automatic Live Sync Active'}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {language === 'hi'
                    ? 'जैसे ही व्यवस्थापक (Admin) द्वारा आपका चैनल स्वीकृत होगा, यह स्टूडियो पेज स्वतः अनलॉक हो जाएगा। किसी भी मैन्युअल बटन को दबाने की आवश्यकता नहीं है।'
                    : 'Your Studio dashboard will automatically unlock as soon as the Admin approves your channel KYC. No manual refresh needed.'}
                </p>
              </div>
            </>
          ) : isRejected ? (
            <>
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20 shadow-lg">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-rose-400">
                  {language === 'hi' ? 'चैनल आवेदन अस्वीकृत' : 'Application Needs Attention'}
                </h2>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  {language === 'hi'
                    ? 'कृपया अपने बैंक व आधार विवरण की पुनः पुष्टि करें और दोबारा आवेदन जमा करें।'
                    : 'Please review your artist credentials and resubmit your channel application.'}
                </p>
              </div>
              <button
                onClick={onOpenCreateChannelModal}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-sm shadow-xl hover:scale-105 transition cursor-pointer"
              >
                {language === 'hi' ? 'दोबारा आवेदन करें' : 'Re-apply for Channel'}
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-lg">
                <Sparkles className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-100">
                  {language === 'hi' ? 'अपना बुंदेली क्रिएटर चैनल बनाएं' : 'Launch Your Bundeli Creator Studio'}
                </h2>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  {language === 'hi'
                    ? 'बुंदेली राई, लोकगीत, आल्हा व भजन अपलोड करें और 100% विज्ञापन कमाई सीधे अपने बैंक खाते में पाएं।'
                    : 'Upload Bundeli folk content, reach millions of regional viewers, and earn 100% ad revenue.'}
                </p>
              </div>
              <button
                onClick={onOpenCreateChannelModal}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm shadow-xl hover:scale-105 transition cursor-pointer"
              >
                {language === 'hi' ? 'निःशुल्क चैनल पंजीकृत करें' : 'Register Free Channel'}
              </button>
            </>
          )}

        </div>
      </div>
    );
  }

  // Approved Creator: YouTube Studio Full Workspace
  return (
    <div id="youtube-creator-studio-view" className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 animate-in fade-in transition-colors">
      
      {/* ========================================================================= */}
      {/* 1. YOUTUBE STUDIO TOP NAVIGATION BAR                                      */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs transition-colors">
        
        {/* Left: Mobile Menu Toggle + Back Button + Studio Logo */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition"
            title="Toggle Studio Menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
              title={language === 'hi' ? 'बुन्देलीट्यूब पर वापस जाएँ' : 'Back to BundeliTube'}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'hi' ? 'ऐप पर वापस' : 'Back'}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-slate-950 shadow-md">
              <Tv className="w-4 h-4 font-black stroke-[2.5]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                Bundeli<span className="text-amber-500 dark:text-amber-400">Studio</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold border border-amber-500/30">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search across channel */}
        <div className="hidden sm:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'अपने चैनल में खोजें (वीडियो, कमेंट्स, एनालिटिक्स)...' : 'Search across your channel...'}
              value={studioGlobalSearch}
              onChange={(e) => setStudioGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* Right: Quick Action Buttons (Upload, Wallet, Theme, Language, Settings, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Create / Upload Button */}
          <button
            onClick={onOpenUploadModal}
            id="studio-topbar-create-btn"
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">{language === 'hi' ? 'नया अपलोड (Create)' : 'Create'}</span>
          </button>

          {/* Wallet Quick Button */}
          <button
            onClick={onOpenWalletModal}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-slate-800 hover:bg-emerald-500/20 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs flex items-center gap-1 border border-emerald-500/30 transition cursor-pointer"
            title="Creator Wallet"
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>₹{(wallet.currentBalance || 0).toLocaleString('en-IN')}</span>
          </button>

          {/* Settings Quick Icon */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition"
            title={t.studioSettings}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Feedback Quick Icon */}
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition"
            title={t.studioFeedback}
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>

          {/* User Profile Dropdown (YouTube Standard Clean Avatar Menu) */}
          <div className="relative shrink-0 pl-1" ref={profileRef}>
            <button
              type="button"
              id="studio-topbar-profile-btn"
              onClick={() => setShowProfileMenu(prev => !prev)}
              className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-amber-400/50 transition cursor-pointer"
              title={currentUser?.name || channel.name || 'User Profile'}
            >
              <img
                src={currentUser?.avatar || channel.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={currentUser?.name || channel.name}
                className="w-8 h-8 rounded-full object-cover border border-amber-500/50 shadow-md"
              />
            </button>

            {/* Clean YouTube Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className={`absolute right-0 top-full mt-2.5 w-72 max-h-[calc(100vh-85px)] overflow-y-auto ${
                isLight ? 'bg-white/98 text-slate-900 border-slate-200 shadow-slate-900/15' : 'bg-slate-900/98 text-slate-100 border-slate-800 shadow-black/60'
              } backdrop-blur-xl border rounded-2xl p-2 shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-150`}>
                {/* User Info Header */}
                <div className={`p-3 border-b ${isLight ? 'border-slate-100 bg-slate-50/70' : 'border-slate-800/80'} rounded-t-xl flex items-center gap-3`}>
                  <img
                    src={currentUser?.avatar || channel.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={currentUser?.name || channel.name}
                    className="w-10 h-10 rounded-full object-cover border border-amber-500/50 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'} truncate`}>
                      {currentUser?.name || channel.name}
                    </h4>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate`}>
                      {currentUser?.email || (channel.handle ? `@${channel.handle}` : '@creator')}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onNavigateToYou) onNavigateToYou();
                        else if (onNavigateHome) onNavigateHome();
                      }}
                      className="text-[11px] text-amber-500 hover:underline font-semibold mt-0.5 block cursor-pointer"
                    >
                      {language === 'hi' ? 'अपना चैनल देखें' : 'View your channel'}
                    </button>
                  </div>
                </div>

                {/* Menu Options */}
                <div className="py-1.5 space-y-0.5 text-xs">
                  {/* Switch back to Main App / Watch Videos */}
                  {onNavigateHome && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigateHome();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${
                        isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-amber-600' : 'text-slate-200 hover:bg-slate-800 hover:text-amber-400'
                      } transition text-left cursor-pointer`}
                    >
                      <Tv className="w-4 h-4 text-amber-500" />
                      <span>{language === 'hi' ? 'बुन्देलीट्यूब ऐप पर वापस जाएँ' : 'Back to BundeliTube'}</span>
                    </button>
                  )}

                  {/* Earnings & Wallet */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenWalletModal();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${
                      isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-emerald-600' : 'text-slate-200 hover:bg-slate-800 hover:text-emerald-400'
                    } transition text-left cursor-pointer`}
                  >
                    <IndianRupee className="w-4 h-4 text-emerald-500" />
                    <span>{language === 'hi' ? 'कमाई व वॉलेट (₹)' : 'Earnings & Wallet (₹)'}</span>
                  </button>

                  {/* Downloads / You Library */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onNavigateToYou) onNavigateToYou();
                      else if (onNavigateHome) onNavigateHome();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${
                      isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-amber-600' : 'text-slate-200 hover:bg-slate-800 hover:text-amber-400'
                    } transition text-left cursor-pointer`}
                  >
                    <VideoIcon className="w-4 h-4 text-slate-400" />
                    <span>{language === 'hi' ? 'डाउनलोड्स (ऑफ़लाइन)' : 'Downloads (Offline)'}</span>
                  </button>

                  <div className={`border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'} my-1`} />

                  {/* Theme Toggle in Menu */}
                  {onToggleTheme && (
                    <button
                      type="button"
                      onClick={onToggleTheme}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl ${
                        isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'
                      } transition text-left cursor-pointer`}
                    >
                      <div className="flex items-center gap-3">
                        {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                        <span>{language === 'hi' ? 'थीम (Appearance)' : 'Appearance'}</span>
                      </div>
                      <span className={`text-[10px] ${isLight ? 'text-slate-600 bg-slate-100' : 'text-slate-400 bg-slate-800'} px-2 py-0.5 rounded-full uppercase font-bold`}>
                        {theme === 'dark' ? 'Dark 🌙' : 'Light ☀️'}
                      </span>
                    </button>
                  )}

                  {/* Language Toggle */}
                  {onToggleLanguage && (
                    <button
                      type="button"
                      onClick={onToggleLanguage}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl ${
                        isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'
                      } transition text-left cursor-pointer`}
                    >
                      <div className="flex items-center gap-3">
                        <Languages className="w-4 h-4 text-teal-500" />
                        <span>{language === 'hi' ? 'भाषा' : 'Language'}</span>
                      </div>
                      <span className={`text-[10px] ${isLight ? 'text-slate-600 bg-slate-100' : 'text-slate-400 bg-slate-800'} px-2 py-0.5 rounded-full font-semibold`}>
                        {language === 'hi' ? 'हिंदी' : 'English'}
                      </span>
                    </button>
                  )}

                  {/* Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenSettings) onOpenSettings();
                      else setIsSettingsOpen(true);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${
                      isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'
                    } transition text-left cursor-pointer`}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>{language === 'hi' ? 'सेटिंग्स' : 'Settings'}</span>
                  </button>

                  {/* Help & Support */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenHelpCenter) onOpenHelpCenter();
                      else setIsFeedbackOpen(true);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${
                      isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'
                    } transition text-left cursor-pointer`}
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>{language === 'hi' ? 'मदद व सहायता' : 'Help & Support'}</span>
                  </button>

                  {/* Send Feedback */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsFeedbackOpen(true);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${
                      isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'
                    } transition text-left cursor-pointer`}
                  >
                    <MessageSquarePlus className="w-4 h-4 text-slate-400" />
                    <span>{language === 'hi' ? 'फ़ीडबैक भेजें' : 'Send Feedback'}</span>
                  </button>

                  {/* Sign Out */}
                  {onLogout && (
                    <>
                      <div className={`border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'} my-1`} />
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition text-left font-semibold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{language === 'hi' ? 'लॉग आउट' : 'Sign Out'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN STUDIO WORKSPACE (Sidebar + Active Dynamic Tab)                  */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Fixed YouTube Studio Sidebar */}
        <div className="hidden md:block w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 overflow-y-auto">
          <StudioSidebar
            channel={channel}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
            }}
            language={language}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenFeedback={() => setIsFeedbackOpen(true)}
          />
        </div>

        {/* Mobile Slide-out Drawer Sidebar */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full shadow-2xl z-10 flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-300">YouTube Studio Menu</span>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <StudioSidebar
                channel={channel}
                activeTab={activeTab}
                onSelectTab={(tab) => {
                  setActiveTab(tab);
                  setIsMobileSidebarOpen(false);
                }}
                language={language}
                onOpenSettings={() => {
                  setIsMobileSidebarOpen(false);
                  setIsSettingsOpen(true);
                }}
                onOpenFeedback={() => {
                  setIsMobileSidebarOpen(false);
                  setIsFeedbackOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/70 dark:bg-slate-950 transition-colors">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <StudioDashboardTab
              channel={channel}
              creatorVideos={creatorVideos}
              wallet={wallet}
              language={language}
              onOpenUploadModal={onOpenUploadModal}
              onOpenWalletModal={onOpenWalletModal}
              onGoToContent={() => setActiveTab('content')}
              onGoToAnalytics={() => setActiveTab('analytics')}
              onGoToComments={() => setActiveTab('comments')}
              onInspectVideo={(video) => setInspectedVideo(video)}
            />
          )}

          {/* TAB 2: CONTENT (Videos, Shorts, Live, Playlists, Posts) */}
          {activeTab === 'content' && (
            <StudioContentTab
              channel={channel}
              creatorVideos={creatorVideos}
              wallet={wallet}
              language={language}
              onOpenUploadModal={onOpenUploadModal}
              onInspectVideo={(video) => setInspectedVideo(video)}
              onGoToComments={() => setActiveTab('comments')}
              onUpdateVideo={onUpdateVideo}
              onDeleteVideo={onDeleteVideo}
              onPromoteVideo={onPromoteVideo}
            />
          )}

          {/* TAB 2.5: PROMOTIONS & REACH BOOST */}
          {activeTab === 'promotions' && (
            <StudioPromotionsTab
              channel={channel}
              creatorVideos={creatorVideos}
              promotions={promotions}
              language={language}
              onOpenPromoteModal={(video) => setSelectedPromoteVideo(video)}
            />
          )}

          {/* TAB 3: ANALYTICS (Overview, Reach, Audience Geography, Revenue, Research) */}
          {activeTab === 'analytics' && (
            <StudioAnalyticsTab
              channel={channel}
              creatorVideos={creatorVideos}
              wallet={wallet}
              language={language}
              onInspectVideo={(video) => setInspectedVideo(video)}
            />
          )}

          {/* TAB 4: COMMENTS (Published, Questions, Creator Hearts, Reply) */}
          {activeTab === 'comments' && (
            <StudioCommentsTab
              channel={channel}
              currentUser={currentUser}
              creatorVideos={creatorVideos}
              language={language}
            />
          )}

          {/* TAB 5: SUBTITLES & LYRICS */}
          {activeTab === 'subtitles' && (
            <StudioSubtitlesTab
              creatorVideos={creatorVideos}
              language={language}
            />
          )}

          {/* TAB 6: COPYRIGHT & RIGHTS */}
          {activeTab === 'copyright' && (
            <StudioCopyrightTab
              language={language}
            />
          )}

          {/* TAB 7: EARN & MONETIZATION */}
          {activeTab === 'earn' && (
            <StudioEarnTab
              channel={channel}
              wallet={wallet}
              language={language}
              onOpenWalletModal={onOpenWalletModal}
            />
          )}

          {/* TAB 8: CUSTOMIZATION (Branding, Basic Info, Layout) */}
          {activeTab === 'customization' && (
            <StudioCustomizationTab
              channel={channel}
              language={language}
              onUpdateChannel={onUpdateChannel}
              onDeleteChannel={onDeleteChannel}
            />
          )}

          {/* TAB 9: AUDIO LIBRARY (Free Bundeli Folk Loops & Tracks) */}
          {activeTab === 'audio_library' && (
            <StudioAudioLibraryTab
              language={language}
            />
          )}

        </main>

      </div>

      {/* ========================================================================= */}
      {/* 3. MODALS & POPUPS                                                        */}
      {/* ========================================================================= */}
      
      {/* Settings Modal */}
      <StudioSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        channel={channel}
        language={language}
        onToggleTheme={onToggleTheme}
        onToggleLanguage={onToggleLanguage}
        onUpdateChannel={onUpdateChannel}
        onDeleteChannel={onDeleteChannel}
      />

      {/* Feedback Modal */}
      <StudioFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        language={language}
        currentUser={currentUser}
        channel={channel}
      />

      {/* Global Promotion Modal */}
      {selectedPromoteVideo && (
        <PromoteVideoModal
          isOpen={!!selectedPromoteVideo}
          onClose={() => setSelectedPromoteVideo(null)}
          video={selectedPromoteVideo}
          language={language}
          onPromotionSubmitted={(campaign) => {
            if (onPromoteVideo) {
              onPromoteVideo(campaign);
            }
            setSelectedPromoteVideo(null);
          }}
        />
      )}

      {/* Inspect Individual Video Analytics Modal */}
      {inspectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-100 my-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-slate-100">
                  {language === 'hi' ? 'वीडियो एनालिटिक्स (Video Performance)' : 'Video Performance'}
                </h3>
              </div>
              <button
                onClick={() => setInspectedVideo(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Snapshot */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <img
                src={inspectedVideo.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'}
                alt={inspectedVideo.title}
                className="w-28 aspect-video rounded-xl object-cover shrink-0"
              />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-100">{inspectedVideo.title}</h4>
                <p className="text-xs text-slate-400">{inspectedVideo.artist} • {inspectedVideo.duration}</p>
                <span className="inline-block text-[10px] text-amber-400 font-mono">
                  सत्यापन कोड: {inspectedVideo.verificationCode || 'BT-VERIFIED-2026'}
                </span>
              </div>
            </div>

            {/* 4 Metric Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">{language === 'hi' ? 'कुल व्यूज' : 'Views'}</span>
                <strong className="text-lg font-black text-slate-100 font-mono">
                  {inspectedVideo.views.toLocaleString('en-IN')}
                </strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">{language === 'hi' ? 'इम्प्रेशंस' : 'Impressions'}</span>
                <strong className="text-lg font-black text-amber-400 font-mono">
                  {((inspectedVideo.impressions || inspectedVideo.views * 8.6) / 100000).toFixed(1)}L
                </strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">CTR %</span>
                <strong className="text-lg font-black text-emerald-400 font-mono">
                  {inspectedVideo.ctr || '11.8'}%
                </strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center">
                <span className="text-[11px] text-emerald-400 block font-bold">{language === 'hi' ? 'क्रिएटर कमाई' : 'Earnings'}</span>
                <strong className="text-lg font-black text-emerald-400 font-mono">
                  ₹{(inspectedVideo.estimatedEarnings || Math.round(inspectedVideo.views * 0.035)).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedVideo(null)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
