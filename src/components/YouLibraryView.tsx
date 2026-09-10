import React, { useState, useEffect } from 'react';
import { 
  User, 
  History, 
  Clock, 
  ThumbsUp, 
  Download, 
  FolderHeart, 
  Tv, 
  Trash2, 
  Plus, 
  CheckCircle2,
  FolderPlus,
  LogOut,
  LogIn,
  WifiOff,
  Film,
  IndianRupee,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Languages,
  UserCheck,
  ShieldCheck,
  EyeOff,
  ChevronRight,
  ExternalLink,
  Share2,
  Crown,
  ShieldAlert,
  Keyboard,
  PlusCircle
} from 'lucide-react';
import { Video, UserAccount, Channel, UserPlaylist } from '../types';
import { VideoCard } from './VideoCard';
import { Language, translations } from '../locales/i18n';
import { getDownloadedVideosList, removeDownloadedVideoFromStorage } from '../services/videoCache';

interface YouLibraryViewProps {
  videos: Video[];
  currentUser: UserAccount | null;
  channel: Channel;
  onSelectVideo: (video: Video) => void;
  onOpenCreateChannel?: () => void;
  onOpenPendingStatusModal?: () => void;
  onOpenStudio?: () => void;
  onOpenWallet?: () => void;
  onOpenSettings?: () => void;
  onOpenHelpCenter?: () => void;
  onOpenPolicies?: (tab?: string) => void;
  onOpenPremium?: () => void;
  onOpenCopyrightModal?: () => void;
  onOpenShortcuts?: () => void;
  onNavigate?: (view: any) => void;
  onOpenLogin: () => void;
  onLogout?: () => void;
  activeTab?: string;
  language: Language;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onToggleLanguage?: () => void;
  walletBalance?: number;
}

export const YouLibraryView: React.FC<YouLibraryViewProps> = ({
  videos,
  currentUser,
  channel,
  onSelectVideo,
  onOpenCreateChannel,
  onOpenPendingStatusModal,
  onOpenStudio,
  onOpenWallet,
  onOpenSettings,
  onOpenHelpCenter,
  onOpenPolicies,
  onOpenPremium,
  onOpenCopyrightModal,
  onOpenShortcuts,
  onNavigate,
  onOpenLogin,
  onLogout,
  language,
  theme = 'dark',
  onToggleTheme,
  onToggleLanguage,
  walletBalance = 0
}) => {
  const t = translations[language];
  const isLight = theme === 'light';
  const isApprovedCreator = channel.approvalStatus === 'approved';
  const isPendingCreator = channel.approvalStatus === 'pending';
  const hasNoChannel = !isApprovedCreator && !isPendingCreator;
  const [activeSection, setActiveSection] = useState<'all' | 'history' | 'playlists' | 'watch_later' | 'liked' | 'downloads'>('all');
  
  const isShortItem = (v: Video) => Boolean(v.isShort || v.videoType === 'short' || v.category === 'shorts');
  const longVideos = videos.filter(v => !isShortItem(v));

  const [downloadedVideos, setDownloadedVideos] = useState<(Video & { downloadedAt?: string; offlineSizeMB?: number })[]>(() => getDownloadedVideosList());

  useEffect(() => {
    const updateList = () => {
      setDownloadedVideos(getDownloadedVideosList());
    };
    updateList();
    window.addEventListener('bundelitube_downloads_updated', updateList);
    return () => {
      window.removeEventListener('bundelitube_downloads_updated', updateList);
    };
  }, []);

  const historyVideos = longVideos.slice(0, 6);
  const likedVideos = longVideos.filter(v => v.likes > 50000);
  const watchLaterVideos = longVideos.slice(2, 6);

  const playlists: UserPlaylist[] = [
    {
      id: 'p-1',
      title: '👑 देशराज पटैरिया अमर राई संग्रह',
      videoCount: 18,
      visibility: 'public',
      updatedAt: '2 दिन पहले',
      thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80',
      videoIds: ['vid-1']
    },
    {
      id: 'p-2',
      title: '🪕 संजो बघेल मैया के जस व भक्ति',
      videoCount: 24,
      visibility: 'public',
      updatedAt: '1 हफ्ता पहले',
      thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80',
      videoIds: ['vid-3']
    },
    {
      id: 'p-3',
      title: '🥁 बुंदेली डीजे लोकधुन 2026',
      videoCount: 12,
      visibility: 'private',
      updatedAt: '3 दिन पहले',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
      videoIds: ['vid-2']
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 pb-16 transition-colors px-1 sm:px-2">
      
      {/* 1. YouTube Mobile Style "You" Profile Card */}
      <div className={`p-4 sm:p-6 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
      } border rounded-3xl transition-colors relative overflow-hidden`}>
        
        {/* Top Right Quick Settings Icon */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className={`p-2 rounded-full ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              } transition cursor-pointer`}
              title={language === 'hi' ? 'सेटिंग्स' : 'Settings'}
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Identity Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 pr-12">
          <div className="relative">
            <img
              src={currentUser?.avatar || channel.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt="Profile"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-3 ring-amber-500/50 shadow-md"
            />
            {channel.isVerified && (
              <span className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 p-1 rounded-full shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-bundeli truncate">
                {currentUser?.name || channel.name || (language === 'hi' ? 'बुन्देली दर्शक' : 'Bundeli Viewer')}
              </h1>
            </div>
            
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5 truncate`}>
              {currentUser?.email || currentUser?.channelHandle || channel.handle || '@bundelitube'} • {channel.subscribers > 0 ? `${channel.subscribers} सदस्य` : (language === 'hi' ? 'दर्शक खाता' : 'Viewer Account')}
            </p>

            {/* View Channel / Create Channel / Pending Link */}
            {currentUser && isApprovedCreator && onOpenStudio && (
              <button
                type="button"
                onClick={onOpenStudio}
                className="text-xs text-amber-500 hover:text-amber-400 font-bold mt-1.5 flex items-center gap-1 group cursor-pointer"
              >
                <span>{language === 'hi' ? 'अपना चैनल देखें व प्रबंधित करें' : 'View & manage your channel'}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {currentUser && isPendingCreator && (
              <button
                type="button"
                onClick={onOpenPendingStatusModal ? onOpenPendingStatusModal : onOpenCreateChannel}
                className="text-xs text-amber-500 hover:text-amber-400 font-bold mt-1.5 flex items-center gap-1.5 group cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>{language === 'hi' ? 'चैनल समीक्षाधीन है (स्थिति देखें)' : 'Channel under review (Check status)'}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {currentUser && hasNoChannel && onOpenCreateChannel && (
              <button
                type="button"
                onClick={onOpenCreateChannel}
                className="text-xs text-amber-500 hover:text-amber-400 font-bold mt-1.5 flex items-center gap-1.5 group cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'चैनल बनाएं (Create Channel)' : 'Create your channel'}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Action Chips (YouTube Style: Switch account, Google Account, Incognito) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80">
          <button
            type="button"
            onClick={currentUser ? onOpenLogin : onOpenLogin}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            } transition`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>{currentUser ? (language === 'hi' ? 'खाता बदलें' : 'Switch account') : (language === 'hi' ? 'साइन इन करें' : 'Sign in')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenLogin}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            } transition`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>{language === 'hi' ? 'गूगल खाता' : 'Google Account'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate('explore');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            } transition`}
          >
            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'hi' ? 'गुप्त मोड (Incognito)' : 'Turn on Incognito'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top-Right "You" Menu Options - Fully Integrated into You Tab */}
      <div className={`p-4 sm:p-5 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
      } border rounded-3xl space-y-2 transition-colors`}>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-2">
          {language === 'hi' ? 'आपके विकल्प व सुविधाएँ' : 'Your Options & Features'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          
          {/* A. BundeliTube Studio / Channel Creation / Channel Pending Card */}
          {isApprovedCreator && (
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  onOpenLogin();
                } else if (onOpenStudio) {
                  onOpenStudio();
                }
              }}
              className={`flex items-center justify-between p-3 rounded-2xl ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-800' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-100'
              } transition cursor-pointer text-left group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm group-hover:text-amber-500 transition-colors">
                    {language === 'hi' ? '🎬 बुन्देली क्रिएटर स्टूडियो' : '🎬 Bundeli Creator Studio'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'वीडियो अपलोड व चैनल एनालिटिक्स' : 'Upload videos & channel analytics'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition" />
            </button>
          )}

          {isPendingCreator && (
            <button
              type="button"
              onClick={() => {
                if (onOpenPendingStatusModal) {
                  onOpenPendingStatusModal();
                } else if (onOpenCreateChannel) {
                  onOpenCreateChannel();
                }
              }}
              className={`flex items-center justify-between p-3 rounded-2xl ${
                isLight ? 'bg-amber-50/90 hover:bg-amber-100/90 text-amber-900 border border-amber-200' : 'bg-amber-950/40 hover:bg-amber-950/70 text-amber-100 border border-amber-800/50'
              } transition cursor-pointer text-left group border`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                    {language === 'hi' ? '⏳ चैनल समीक्षाधीन है' : '⏳ Channel Under Review'}
                  </h3>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                    {language === 'hi' ? 'व्यवस्थापक द्वारा समीक्षा जारी है' : 'Pending Admin approval'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase shrink-0">
                {language === 'hi' ? 'समीक्षा' : 'Review'}
              </span>
            </button>
          )}

          {hasNoChannel && (
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  onOpenLogin();
                } else if (onOpenCreateChannel) {
                  onOpenCreateChannel();
                }
              }}
              className={`flex items-center justify-between p-3 rounded-2xl ${
                isLight ? 'bg-amber-50/70 hover:bg-amber-100/80 text-slate-900 border border-amber-200/80' : 'bg-amber-950/30 hover:bg-amber-900/40 text-slate-100 border border-amber-800/40'
              } transition cursor-pointer text-left group border`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm group-hover:text-amber-500 transition-colors">
                    {language === 'hi' ? '➕ चैनल बनाएं' : '➕ Create Channel'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'नया चैनल शुरू करें और वीडियो अपलोड करें' : 'Start your channel & upload videos'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase shrink-0">
                {language === 'hi' ? 'शुरू करें' : 'Start'}
              </span>
            </button>
          )}

          {/* B. Earnings & Wallet - ONLY for approved creators */}
          {isApprovedCreator && (
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  onOpenLogin();
                } else if (onOpenWallet) {
                  onOpenWallet();
                } else if (onNavigate) {
                  onNavigate('wallet');
                }
              }}
              className={`flex items-center justify-between p-3 rounded-2xl ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-800' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-100'
              } transition cursor-pointer text-left group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm group-hover:text-emerald-500 transition-colors">
                    {language === 'hi' ? 'कमाई व वॉलेट (₹)' : 'Earnings & Wallet (₹)'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'विज्ञापन व सुपरथैंक्स रेवेन्यू' : 'Ad revenue & Bank/UPI payouts'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-500 px-2 py-0.5 rounded-lg bg-emerald-500/10">
                ₹{walletBalance.toLocaleString('en-IN')}
              </span>
            </button>
          )}

          {/* C. Downloads (Offline) */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('offline-downloads-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex items-center justify-between p-3 rounded-2xl ${
              isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-800' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-100'
            } transition cursor-pointer text-left group`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm group-hover:text-blue-500 transition-colors">
                  {language === 'hi' ? 'ऑफलाइन डाउनलोड्स' : 'Offline Downloads'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {downloadedVideos.length} {language === 'hi' ? 'वीडियो उपलब्ध बिना इंटरनेट' : 'saved offline'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition" />
          </button>

          {/* D. Theme (Dark / Light Mode Toggle) */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className={`flex items-center justify-between p-3 rounded-2xl ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-800' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-100'
              } transition cursor-pointer text-left group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  {isLight ? <Moon className="w-5 h-5 text-indigo-600" /> : <Sun className="w-5 h-5 text-amber-400" />}
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm group-hover:text-indigo-500 transition-colors">
                    {language === 'hi' ? 'थीम (Appearance)' : 'Appearance Theme'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {theme === 'dark' ? (language === 'hi' ? 'डार्क मोड सक्रिय' : 'Dark Mode Active') : (language === 'hi' ? 'लाइट मोड सक्रिय' : 'Light Mode Active')}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-700 text-slate-200'
              }`}>
                {theme === 'dark' ? 'Dark 🌙' : 'Light ☀️'}
              </span>
            </button>
          )}

          {/* E. Language (भाषा Switcher) */}
          {onToggleLanguage && (
            <button
              type="button"
              onClick={onToggleLanguage}
              className={`flex items-center justify-between p-3 rounded-2xl ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-800' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-100'
              } transition cursor-pointer text-left group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm group-hover:text-teal-500 transition-colors">
                    {language === 'hi' ? 'भाषा (Language)' : 'App Language'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'बुन्देली / हिन्दी' : 'English'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-teal-500/10 text-teal-500">
                {language === 'hi' ? 'हिन्दी 🇮🇳' : 'English 🌐'}
              </span>
            </button>
          )}

          {/* F. Settings */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className={`flex items-center justify-between p-3 rounded-2xl ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-800' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-100'
              } transition cursor-pointer text-left group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-400 flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {language === 'hi' ? 'ऐप सेटिंग्स' : 'App Settings'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'क्वालिटी, नोटिफिकेशन व खाते' : 'Video quality, notifications & privacy'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
            </button>
          )}

          {/* G. Help & Support */}
          {onOpenHelpCenter && (
            <button
              type="button"
              onClick={onOpenHelpCenter}
              className={`flex items-center justify-between p-3 rounded-2xl ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-800' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-100'
              } transition cursor-pointer text-left group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm group-hover:text-purple-500 transition-colors">
                    {language === 'hi' ? 'मदद व सहायता' : 'Help & Support'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'कॉपीराइट, भुगतान व नियम' : 'FAQ, monetization & copyright'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition" />
            </button>
          )}

          {/* Policy & Legal Center (AdSense, AdMob & BundeliTube Rules) */}
          {onOpenPolicies && (
            <button
              type="button"
              onClick={() => onOpenPolicies('admob_adsense')}
              className={`flex items-center justify-between p-3 rounded-2xl ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-800' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-100'
              } transition cursor-pointer text-left group border border-emerald-500/20`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs sm:text-sm group-hover:text-emerald-500 transition-colors">
                      {language === 'hi' ? 'नीतियां व कानूनी केंद्र' : 'Policies & Legal Center'}
                    </h3>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      AdSense/AdMob
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'Google AdSense, AdMob, 50-50 अर्निंग नीति व IT नियम' : 'AdSense, AdMob, 50/50 creator split & terms'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition" />
            </button>
          )}

          {/* H. BundeliTube Premium */}
          {onOpenPremium && (
            <button
              type="button"
              onClick={onOpenPremium}
              className={`flex items-center justify-between p-3 rounded-2xl ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-800' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-100'
              } transition cursor-pointer text-left group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm group-hover:text-amber-500 transition-colors">
                    {language === 'hi' ? 'बुन्देलीट्यूब प्रीमियम' : 'BundeliTube Premium'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'विज्ञापन-मुक्त, बैकग्राउंड प्ले' : 'Ad-free, offline & background'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition" />
            </button>
          )}

          {/* I. Copyright Protection & Support */}
          {onOpenCopyrightModal && (
            <button
              type="button"
              onClick={onOpenCopyrightModal}
              className={`flex items-center justify-between p-3 rounded-2xl ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-800' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-100'
              } transition cursor-pointer text-left group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm group-hover:text-rose-500 transition-colors">
                    {language === 'hi' ? 'कॉपीराइट व ओनरशिप' : 'Copyright & Ownership'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'शिकायत व कॉपीराइट क्लेम' : 'DMCA & artist protection'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition" />
            </button>
          )}

          {/* J. Keyboard Shortcuts */}
          {onOpenShortcuts && (
            <button
              type="button"
              onClick={onOpenShortcuts}
              className={`flex items-center justify-between p-3 rounded-2xl ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-800' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-100'
              } transition cursor-pointer text-left group`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm group-hover:text-cyan-500 transition-colors">
                    {language === 'hi' ? 'कीबोर्ड शॉर्टकट' : 'Keyboard Shortcuts'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'शॉर्टकट कुंजियाँ' : 'Quick control keys'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition" />
            </button>
          )}

          {/* K. Sign Out or Sign In */}
          {currentUser ? (
            onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/20 transition cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-rose-500">
                      {language === 'hi' ? 'लॉग आउट' : 'Sign Out'}
                    </h3>
                    <p className="text-[11px] text-rose-400/80">
                      {language === 'hi' ? 'खाते से सुरक्षित बाहर निकलें' : 'Sign out from this device'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition" />
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex items-center justify-between p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950/20 text-slate-950 flex items-center justify-center shrink-0">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm">
                    {language === 'hi' ? 'गूगल से साइन इन करें' : 'Sign in with Google'}
                  </h3>
                  <p className="text-[11px] text-slate-900/80">
                    {language === 'hi' ? 'अपनी प्लेलिस्ट व कमाई प्रबंधित करें' : 'Access your playlists & studio'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 transition" />
            </button>
          )}

        </div>
      </div>

      {/* 3. History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{t.history}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {historyVideos.map((video) => (
            <VideoCard key={video.id} video={video} onPlay={onSelectVideo} language={language} />
          ))}
        </div>
      </div>

      {/* 4. Playlists Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{t.playlists}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 transition cursor-pointer group shadow-xs"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950">
                <img src={pl.thumbnail} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-y-0 right-0 w-24 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-1">
                  <Film className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold font-mono">{pl.videoCount}</span>
                  <span className="text-[10px] text-slate-300">वीडियो</span>
                </div>
              </div>
              <div className="pt-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                  {pl.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {pl.visibility === 'public' ? 'सार्वजनिक' : 'निजी'} • अपडेट: {pl.updatedAt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Liked Videos Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{t.likedVideos}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {likedVideos.map((video) => (
            <VideoCard key={video.id} video={video} onPlay={onSelectVideo} language={language} />
          ))}
        </div>
      </div>

      {/* 6. Offline Downloads Section */}
      <div id="offline-downloads-section" className="space-y-4 scroll-mt-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{t.downloads}</h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {downloadedVideos.length} {language === 'hi' ? 'ऑफलाइन वीडियो' : 'offline videos'}
          </span>
        </div>

        {downloadedVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {downloadedVideos.map((video) => (
              <div key={video.id} className="relative group">
                <VideoCard video={video} onPlay={onSelectVideo} language={language} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDownloadedVideoFromStorage(video.id);
                    setDownloadedVideos(getDownloadedVideosList());
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/90 text-red-400 hover:bg-red-600 hover:text-white transition shadow-md z-20 opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Remove from downloads"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
            <WifiOff className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'कोई वीडियो ऑफलाइन डाउनलोड नहीं किया गया है।' : 'No offline downloaded videos yet.'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
