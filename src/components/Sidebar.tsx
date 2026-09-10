import React, { useState } from 'react';
import { 
  Home, 
  Flame, 
  Tv, 
  LayoutDashboard, 
  Wallet, 
  Sparkles, 
  CheckCircle2, 
  Radio, 
  Music,
  History,
  Clock,
  ThumbsUp,
  Download,
  FolderPlus,
  PlaySquare,
  Scissors,
  Mic2,
  Film,
  Newspaper,
  Settings,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  User,
  HelpCircle,
  Upload,
  BarChart2,
  Gamepad2,
  Trophy,
  Lightbulb,
  MessageSquareWarning,
  Languages,
  LogOut,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import { MOCK_SUBSCRIBED_CHANNELS, CATEGORIES } from '../data/mockData';
import { Channel, UserAccount, MainAppView } from '../types';
import { Language, translations } from '../locales/i18n';
import { BundeliLogo } from './BundeliLogo';

interface SidebarProps {
  currentView: MainAppView;
  onNavigate: (view: MainAppView) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  isOpen: boolean;
  channel: Channel;
  currentUser: UserAccount | null;
  onOpenLogin: () => void;
  onLogout?: () => void;
  onOpenCreateChannel: () => void;
  onOpenUpload?: () => void;
  onOpenSettings: () => void;
  onOpenCopyright: () => void;
  onOpenPolicies?: (tab?: string) => void;
  onOpenPremium: () => void;
  onOpenHelpCenter?: () => void;
  onOpenPendingStatusModal?: () => void;
  language: Language;
  onToggleLanguage?: () => void;
  theme?: 'dark' | 'light';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  selectedCategory,
  setSelectedCategory,
  isOpen,
  channel,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenCreateChannel,
  onOpenUpload,
  onOpenSettings,
  onOpenCopyright,
  onOpenPolicies,
  onOpenPremium,
  onOpenHelpCenter,
  onOpenPendingStatusModal,
  language,
  onToggleLanguage,
  theme = 'light'
}) => {
  const [showAllSubs, setShowAllSubs] = useState(false);
  const [showAllYou, setShowAllYou] = useState(false);
  const t = translations[language];
  const isLight = theme === 'light';

  const primaryNavItems = [
    { id: 'home', label: t.home, icon: Home, view: 'home' as const },
    { id: 'shorts', label: t.shorts, icon: PlaySquare, view: 'shorts' as const },
    { id: 'subscriptions', label: t.subscriptions, icon: Tv, view: 'subscriptions' as const },
  ];

  const youNavItems = [
    { id: 'your_channel', label: language === 'hi' ? 'आपका चैनल' : 'Your channel', icon: User, view: 'you' as const },
    { id: 'history', label: t.history, icon: History, view: 'history' as const },
    { id: 'playlists', label: t.playlists, icon: FolderPlus, view: 'playlists' as const },
    { id: 'your_videos', label: language === 'hi' ? 'आपके वीडियो' : 'Your videos', icon: PlaySquare, view: 'you' as const },
    { id: 'watch_later', label: t.watchLater, icon: Clock, view: 'watch_later' as const },
    { id: 'liked', label: t.likedVideos, icon: ThumbsUp, view: 'liked' as const },
    { id: 'clips', label: language === 'hi' ? 'आपकी क्लिप्स' : 'Your clips', icon: Scissors, view: 'you' as const },
    { id: 'downloads', label: t.downloads, icon: Download, view: 'downloads' as const },
  ];

  const exploreNavItems = [
    { id: 'trending', label: t.trending, icon: Flame, view: 'trending' as const },
    { id: 'music', label: t.musicTab, icon: Music, view: 'music' as const },
    { id: 'gaming', label: language === 'hi' ? 'गेमिंग' : 'Gaming', icon: Gamepad2, view: 'home' as const },
    { id: 'news', label: language === 'hi' ? 'समाचार' : 'News', icon: Newspaper, view: 'home' as const },
    { id: 'sports', label: language === 'hi' ? 'स्पोर्ट्स' : 'Sports', icon: Trophy, view: 'home' as const },
    { id: 'podcasts', label: t.podcastsTab, icon: Mic2, view: 'podcasts' as const },
    { id: 'live', label: t.liveTab, icon: Radio, view: 'live' as const },
  ];

  const isCreatorApproved = Boolean(
    currentUser && 
    (currentUser.channelStatus === 'approved' || channel?.approvalStatus === 'approved') && 
    channel?.id && 
    channel.id !== ''
  );

  const displayedSubs = showAllSubs ? MOCK_SUBSCRIBED_CHANNELS : MOCK_SUBSCRIBED_CHANNELS.slice(0, 7);
  const displayedYou = showAllYou ? youNavItems : youNavItems.slice(0, 5);

  return (
    <aside
      className={`fixed lg:sticky top-14 left-0 h-[calc(100vh-56px)] ${
        isLight ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-900 dark:bg-slate-950 text-slate-100 border-slate-800'
      } border-r z-30 transition-all duration-200 ease-in-out overflow-y-auto flex flex-col ${
        isOpen ? 'w-60 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-18'
      }`}
    >
      {/* 1. Primary Navigation (Home, Shorts, Subscriptions) */}
      <div className="p-3 space-y-0.5">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group cursor-pointer ${
                isActive
                  ? isLight
                    ? 'bg-slate-100 text-slate-950 font-bold'
                    : 'bg-slate-800 text-white font-bold'
                  : isLight
                    ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              } ${!isOpen && 'lg:flex-col lg:gap-1.5 lg:py-3 lg:px-1 lg:text-center'}`}
              title={item.label}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? (isLight ? 'text-slate-900 fill-slate-900' : 'text-white fill-white') : ''}`} />
              <span className={`truncate text-sm ${!isOpen && 'lg:text-[10px] lg:leading-tight lg:font-normal'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className={`border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} my-1.5 mx-3`} />

      {/* 2. Subscriptions Section (matching screenshot with blue unseen dot) */}
      {isOpen && (
        <div className="p-3 space-y-0.5">
          <div 
            onClick={() => onNavigate('subscriptions')}
            className={`px-3 py-1.5 text-sm font-bold flex items-center justify-between cursor-pointer hover:text-amber-500 transition ${
              isLight ? 'text-slate-900' : 'text-slate-100'
            }`}
          >
            <span>{t.subscriptions}</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {displayedSubs.map((ch) => (
            <button
              key={ch.id}
              onClick={() => onNavigate('subscriptions')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm cursor-pointer ${
                isLight ? 'text-slate-800 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'
              } transition group`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src={ch.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                  alt={ch.name} 
                  className="w-6 h-6 rounded-full object-cover shrink-0" 
                />
                <span className="truncate text-xs sm:text-[13px] font-normal">{ch.name}</span>
              </div>
              {ch.isLive ? (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              ) : ch.hasUnseen ? (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              ) : null}
            </button>
          ))}

          {MOCK_SUBSCRIBED_CHANNELS.length > 7 && (
            <button
              onClick={() => setShowAllSubs(!showAllSubs)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              } transition`}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showAllSubs ? 'rotate-180' : ''}`} />
              <span>{showAllSubs ? (language === 'hi' ? 'कम दिखाएं' : 'Show fewer') : (language === 'hi' ? 'और दिखाएं' : 'Show more')}</span>
            </button>
          )}
        </div>
      )}

      {isOpen && <div className={`border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} my-1.5 mx-3`} />}

      {/* 3. You / Library Section */}
      <div className="p-3 space-y-0.5">
        <div
          onClick={() => onNavigate('you')}
          className={`px-3 py-1.5 text-sm font-bold cursor-pointer flex items-center justify-between transition ${
            isLight ? 'text-slate-900 hover:text-amber-600' : 'text-slate-100 hover:text-amber-400'
          } ${!isOpen && 'lg:hidden'}`}
        >
          <span>{language === 'hi' ? 'आप (You) >' : 'You >'}</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {displayedYou.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view && (item.id === 'your_channel' || item.id === 'your_videos');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-normal transition-all group cursor-pointer ${
                isActive
                  ? isLight
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'bg-slate-800 text-white font-semibold'
                  : isLight
                    ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
              } ${!isOpen && 'lg:justify-center lg:px-2'}`}
              title={item.label}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isLight ? 'text-slate-600' : 'text-slate-300'}`} />
              <span className={`truncate ${!isOpen && 'lg:hidden'}`}>{item.label}</span>
            </button>
          );
        })}

        {/* Dynamic Studio / Create Channel / Pending button */}
        {channel?.approvalStatus === 'approved' ? (
          <button
            onClick={() => onNavigate('studio')}
            className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all group cursor-pointer ${
              currentView === 'studio'
                ? isLight ? 'bg-amber-100 text-amber-950 font-bold' : 'bg-amber-950/60 text-amber-200 font-bold'
                : isLight ? 'text-slate-700 hover:text-amber-600 hover:bg-slate-100' : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800'
            } ${!isOpen && 'lg:justify-center lg:px-2'}`}
            title={language === 'hi' ? '🎬 क्रिएटर स्टूडियो' : '🎬 Creator Studio'}
          >
            <Tv className="w-4 h-4 shrink-0 text-amber-500" />
            <span className={`truncate ${!isOpen && 'lg:hidden'}`}>{language === 'hi' ? '🎬 क्रिएटर स्टूडियो' : '🎬 Creator Studio'}</span>
          </button>
        ) : channel?.approvalStatus === 'pending' ? (
          <button
            onClick={() => onOpenPendingStatusModal ? onOpenPendingStatusModal() : onOpenCreateChannel()}
            className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all group cursor-pointer ${
              isLight ? 'bg-amber-50/80 text-amber-800 hover:bg-amber-100' : 'bg-amber-950/40 text-amber-300 hover:bg-amber-950/70'
            } ${!isOpen && 'lg:justify-center lg:px-2'}`}
            title={language === 'hi' ? '⏳ चैनल समीक्षाधीन है' : '⏳ Channel Under Review'}
          >
            <Clock className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
            <span className={`truncate font-semibold ${!isOpen && 'lg:hidden'}`}>{language === 'hi' ? '⏳ चैनल पेंडिंग (समीक्षा)' : '⏳ Channel Review'}</span>
          </button>
        ) : (
          <button
            onClick={onOpenCreateChannel}
            className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all group cursor-pointer ${
              isLight ? 'bg-amber-50/70 text-amber-800 hover:bg-amber-100' : 'bg-amber-950/30 text-amber-300 hover:bg-amber-900/40'
            } ${!isOpen && 'lg:justify-center lg:px-2'}`}
            title={language === 'hi' ? '➕ चैनल बनाएं' : '➕ Create Channel'}
          >
            <PlusCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span className={`truncate font-bold ${!isOpen && 'lg:hidden'}`}>{language === 'hi' ? '➕ चैनल बनाएं' : '➕ Create Channel'}</span>
          </button>
        )}

        {isOpen && (
          <button
            onClick={() => setShowAllYou(!showAllYou)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${
              isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
            } transition`}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showAllYou ? 'rotate-180' : ''}`} />
            <span>{showAllYou ? (language === 'hi' ? 'कम दिखाएं' : 'Show fewer') : (language === 'hi' ? 'और दिखाएं' : 'Show more')}</span>
          </button>
        )}
      </div>



      <div className={`border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} my-1.5 mx-3`} />

      {/* 5. Explore Section */}
      <div className="p-3 space-y-0.5">
        <div className={`px-3 py-1 text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider ${!isOpen && 'lg:hidden'}`}>
          {language === 'hi' ? 'एक्सप्लोर' : 'Explore'}
        </div>
        {exploreNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-normal transition-all group cursor-pointer ${
                isActive
                  ? isLight ? 'bg-slate-100 text-slate-950 font-semibold' : 'bg-slate-800 text-white font-semibold'
                  : isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
              } ${!isOpen && 'lg:justify-center lg:px-2'}`}
              title={item.label}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className={`truncate ${!isOpen && 'lg:hidden'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className={`border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} my-1.5 mx-3`} />

      {/* 6. Settings, Language, Help & Copyright */}
      <div className="p-3 space-y-0.5">
        <button
          onClick={() => onOpenPolicies ? onOpenPolicies('admob_adsense') : onNavigate('policies')}
          className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-normal cursor-pointer ${
            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
          } transition ${!isOpen && 'lg:justify-center lg:px-2'}`}
          title={language === 'hi' ? 'नीतियां व कानूनी केंद्र (AdMob & AdSense Policy)' : 'Policies & Legal Center'}
        >
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
          <span className={`truncate ${!isOpen && 'lg:hidden'}`}>
            {language === 'hi' ? 'नीतियां व शर्तें' : 'Policies & Terms'}
          </span>
        </button>

        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-normal cursor-pointer ${
            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
          } transition ${!isOpen && 'lg:justify-center lg:px-2'}`}
          title={language === 'hi' ? 'सेटिंग्स' : 'Settings'}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className={`truncate ${!isOpen && 'lg:hidden'}`}>{language === 'hi' ? 'सेटिंग्स' : 'Settings'}</span>
        </button>

        <button
          onClick={onOpenCopyright}
          className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-normal cursor-pointer ${
            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
          } transition ${!isOpen && 'lg:justify-center lg:px-2'}`}
          title={language === 'hi' ? 'कॉपीराइट शिकायत दर्ज करें' : 'Report Copyright'}
        >
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
          <span className={`truncate ${!isOpen && 'lg:hidden'}`}>{language === 'hi' ? 'कॉपीराइट' : 'Copyright'}</span>
        </button>

        <button
          onClick={onToggleLanguage || onOpenSettings}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-normal cursor-pointer ${
            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
          } transition ${!isOpen && 'lg:justify-center lg:px-2'}`}
          title={language === 'hi' ? 'अंग्रेजी / English में बदलें' : 'Switch to Hindi / हिन्दी'}
        >
          <div className="flex items-center gap-4 min-w-0">
            <Languages className="w-4 h-4 shrink-0 text-amber-500" />
            <span className={`truncate ${!isOpen && 'lg:hidden'}`}>
              {language === 'hi' ? 'भाषा: हिन्दी' : 'Language: English'}
            </span>
          </div>
        </button>

        {currentUser && onLogout && (
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-normal text-rose-500 hover:bg-rose-500/10 transition cursor-pointer ${
              !isOpen && 'lg:justify-center lg:px-2'
            }`}
            title="Sign out"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
            <span className={`truncate ${!isOpen && 'lg:hidden'}`}>{language === 'hi' ? 'लॉग आउट' : 'Sign out'}</span>
          </button>
        )}
      </div>

      {/* Footer copyright info */}
      {isOpen && (
        <div className={`p-4 text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-500'} space-y-2 mt-auto border-t ${isLight ? 'border-slate-100' : 'border-slate-800/80'}`}>
          <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[11px]">
            <button 
              type="button"
              onClick={() => onOpenPolicies ? onOpenPolicies('admob_adsense') : onNavigate('policies')} 
              className="hover:underline hover:text-emerald-500 cursor-pointer text-left"
            >
              {language === 'hi' ? 'AdSense/AdMob गोपनीयता' : 'Privacy & AdSense'}
            </button>
            <button 
              type="button"
              onClick={() => onOpenPolicies ? onOpenPolicies('bundelitube') : onNavigate('policies')} 
              className="hover:underline text-amber-500 font-semibold cursor-pointer text-left"
            >
              {language === 'hi' ? 'बुन्देली अर्निंग नीति' : 'BundeliTube Policy'}
            </button>
            <button 
              type="button"
              onClick={() => onOpenPolicies ? onOpenPolicies('terms') : onNavigate('policies')} 
              className="hover:underline cursor-pointer text-left"
            >
              {language === 'hi' ? 'शर्तें' : 'Terms'}
            </button>
            <button 
              type="button"
              onClick={() => onOpenPolicies ? onOpenPolicies('copyright') : onNavigate('policies')} 
              className="hover:underline cursor-pointer text-left"
            >
              {language === 'hi' ? 'कॉपीराइट' : 'Copyright'}
            </button>
            <button 
              type="button"
              onClick={() => onOpenPolicies ? onOpenPolicies('invalid_traffic') : onNavigate('policies')} 
              className="hover:underline cursor-pointer text-left text-red-400"
            >
              {language === 'hi' ? 'अमान्य क्लिक नीति' : 'Anti-Fraud'}
            </button>
            <button 
              type="button"
              onClick={() => onOpenPolicies ? onOpenPolicies('grievance') : onNavigate('policies')} 
              className="hover:underline cursor-pointer text-left text-teal-400"
            >
              {language === 'hi' ? 'शिकायत अधिकारी (IT Rules)' : 'Grievance Officer'}
            </button>
          </div>
          <p className="text-[10px]">© 2026 BundeliTube LLC</p>
        </div>
      )}
    </aside>
  );
};
