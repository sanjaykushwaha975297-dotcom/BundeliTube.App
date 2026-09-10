import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Menu, 
  Upload, 
  IndianRupee, 
  Moon, 
  Sun, 
  Languages, 
  MoreVertical, 
  User, 
  Tv, 
  ShieldAlert, 
  LogOut, 
  LogIn, 
  Sparkles, 
  Check, 
  X,
  FileText,
  Lock,
  Mic,
  Bell,
  Plus,
  Radio,
  MessageSquare,
  Settings,
  Keyboard,
  Shield,
  ShieldCheck,
  HelpCircle,
  ArrowLeft,
  Share2,
  Copy,
  LayoutGrid,
  Video as VideoIcon,
  Clock,
  PlusCircle
} from 'lucide-react';
import { UserAccount, Channel, AppNotification } from '../types';
import { BundeliLogo } from './BundeliLogo';
import { Language, translations } from '../locales/i18n';
import { NotificationsDrawer } from './NotificationsDrawer';

interface HeaderProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  currentUser: UserAccount | null;
  channel: Channel;
  walletBalance: number;
  notifications: AppNotification[];
  onOpenLoginModal: () => void;
  onOpenCreateChannelModal: () => void;
  onOpenUploadModal: () => void;
  onOpenWalletModal: () => void;
  onOpenCopyrightModal: () => void;
  onOpenVoiceSearch: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onOpenPremium: () => void;
  onOpenHelpCenter?: () => void;
  onOpenPolicies?: (tab?: string) => void;
  onOpenAdminPortal?: () => void;
  pendingSubmissionsCount?: number;
  onNavigateToStudio?: () => void;
  onOpenPendingStatusModal?: () => void;
  onNavigateToYou?: () => void;
  onSelectVideoById?: (videoId: string) => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
  onToggleNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  currentUser,
  channel,
  walletBalance,
  notifications,
  onOpenLoginModal,
  onOpenCreateChannelModal,
  onOpenUploadModal,
  onOpenWalletModal,
  onOpenCopyrightModal,
  onOpenVoiceSearch,
  onOpenSettings,
  onOpenShortcuts,
  onOpenPremium,
  onOpenHelpCenter,
  onOpenPolicies,
  onOpenAdminPortal,
  pendingSubmissionsCount = 0,
  onNavigateToStudio,
  onOpenPendingStatusModal,
  onNavigateToYou,
  onSelectVideoById,
  onLogout,
  theme,
  onToggleTheme,
  language,
  onToggleLanguage,
  onToggleNotifications
}) => {
  const t = translations[language];
  const [showThreeDotMenu, setShowThreeDotMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showNotifsDrawer, setShowNotifsDrawer] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowThreeDotMenu(false);
      }
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShowShareModal(false);
      }
      if (createRef.current && !createRef.current.contains(event.target as Node)) {
        setShowCreateDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifsDrawer(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShareChannel = () => {
    const shareUrl = window.location.origin;
    const shareText = `बुन्देलीट्यूब पर ${channel.name} चैनल और बेहतरीन बुन्देली वीडियो देखें! 🔥`;
    if (navigator.share) {
      navigator.share({
        title: channel.name,
        text: shareText,
        url: shareUrl,
      }).catch(() => {});
    } else {
      setShowShareModal(prev => !prev);
    }
  };

  const handleCopyChannelLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isApprovedCreator = channel.approvalStatus === 'approved';
  const isPendingCreator = channel.approvalStatus === 'pending';
  const hasNoChannel = !isApprovedCreator && !isPendingCreator;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const isAdmin = currentUser?.email === 'sanjaykushwaha975297@gmail.com' || currentUser?.role === 'admin' || currentUser?.id === 'user-bundeli-maati-01';

  const isLight = theme === 'light';

  return (
    <header className={`w-full relative z-50 ${
      isLight ? 'bg-white/95 text-slate-900 border-slate-200' : 'bg-slate-950/95 text-slate-100 border-slate-800/60'
    } backdrop-blur-md transition-colors overflow-visible border-b`}>
      <div className="flex items-center justify-between px-2 sm:px-4 lg:px-6 h-14 gap-1.5 sm:gap-4 max-w-full">
        
        {/* Full-width Mobile Search Bar when activated */}
        {isMobileSearchOpen ? (
          <div className="flex items-center w-full gap-2 animate-in fade-in duration-200">
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className={`p-2 rounded-xl ${isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800'} shrink-0`}
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsMobileSearchOpen(false);
                onSearchSubmit();
              }}
              className="relative flex items-center flex-1 min-w-0"
            >
              <input
                type="text"
                autoFocus
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full pl-4 pr-11 py-2 rounded-full ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-500' : 'bg-slate-950 border-amber-500/80 text-slate-100 placeholder:text-slate-500'
                } border text-xs focus:outline-none shadow-inner`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className={`absolute right-10 p-1 ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1 p-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            <button
              type="button"
              onClick={onOpenVoiceSearch}
              className={`p-2 rounded-full ${isLight ? 'bg-slate-100 text-slate-700 hover:text-amber-600' : 'bg-slate-800 text-slate-300 hover:text-amber-400'} shrink-0`}
              title={t.voiceSearch}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Left: Hamburger & Brand */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
              <button
                onClick={onToggleSidebar}
                className={`p-2 rounded-xl ${isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800'} transition-colors shrink-0 cursor-pointer`}
                title="Toggle Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center select-none shrink-0">
                <BundeliLogo size="sm" showText={true} />
              </div>
            </div>

            {/* Center-Right: Desktop/Tablet Search Bar + Mic Voice Search Button */}
            <div className="hidden md:flex flex-1 max-w-2xl ml-auto mr-4 lg:mr-8 items-center justify-end gap-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSearchSubmit();
                }}
                className="flex items-center flex-1 max-w-md lg:max-w-lg shadow-xs"
              >
                <div className="relative flex items-center flex-1">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={`w-full pl-4 pr-9 py-2 rounded-l-full ${
                      isLight 
                        ? 'bg-white border-slate-300 focus:border-blue-500 text-slate-900 placeholder:text-slate-500' 
                        : 'bg-slate-950 border-slate-700/80 focus:border-blue-500 text-slate-100 placeholder:text-slate-500'
                    } border text-sm focus:outline-none transition-colors`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onSearchChange('')}
                      className={`absolute right-3 p-1 ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className={`px-5 py-2 rounded-r-full ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  } border border-l-0 transition-colors cursor-pointer flex items-center justify-center`}
                  title={t.searchBtn}
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Voice Search (Mic) Button */}
              <button
                type="button"
                onClick={onOpenVoiceSearch}
                className={`p-2.5 rounded-full ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                } transition shadow-xs shrink-0 cursor-pointer`}
                title={t.voiceSearch}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Actions (Notifications 9+, Mobile Search, Create, Profile on PC) */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 ml-auto pr-1">

              {/* Notifications Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifsDrawer(!showNotifsDrawer)}
                  className={`p-2 rounded-full ${isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'} transition relative shrink-0 cursor-pointer`}
                  title={t.notifications}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-0.5 min-w-[18px] h-4.5 px-1 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : '9+'}
                  </span>
                </button>

                <NotificationsDrawer
                  isOpen={showNotifsDrawer}
                  onClose={() => setShowNotifsDrawer(false)}
                  notifications={notifications}
                  onSelectVideo={onSelectVideoById}
                  language={language}
                />
              </div>

              {/* Mobile Search Toggle Icon Button */}
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className={`md:hidden p-2 rounded-full ${isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'} transition cursor-pointer`}
                title={t.searchBtn}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Create / Upload (+) Button - PC */}
              <button
                type="button"
                onClick={onOpenUploadModal}
                className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold'
                } text-sm transition cursor-pointer shrink-0`}
                title={
                  isApprovedCreator
                    ? (language === 'hi' ? 'वीडियो बनाएँ / अपलोड करें' : 'Create / Upload Video')
                    : isPendingCreator
                      ? (language === 'hi' ? 'चैनल समीक्षाधीन है' : 'Channel Under Review')
                      : (language === 'hi' ? 'चैनल बनाएं' : 'Create Channel')
                }
              >
                <Plus className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                <span>
                  {isApprovedCreator
                    ? 'Create'
                    : isPendingCreator
                      ? (language === 'hi' ? 'पेंडिंग ⏳' : 'Pending ⏳')
                      : (language === 'hi' ? 'चैनल बनाएं' : 'Create Channel')}
                </span>
              </button>

              {/* User Profile Dropdown (YouTube Standard Clean Avatar Menu) - Hidden on Mobile, Visible on PC */}
              {currentUser ? (
                <div className="hidden md:block relative shrink-0" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(prev => !prev)}
                    className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-amber-400/50 transition cursor-pointer"
                    title={currentUser.name || 'User Profile'}
                  >
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-amber-500/40"
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
                          src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full object-cover border border-amber-500/50 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'} truncate`}>{currentUser.name}</h4>
                          <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate`}>{currentUser.email || '@user'}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              if (onNavigateToYou) onNavigateToYou();
                            }}
                            className="text-[11px] text-amber-500 hover:underline font-semibold mt-0.5 block"
                          >
                            {language === 'hi' ? 'अपना चैनल देखें' : 'View your channel'}
                          </button>
                        </div>
                      </div>

                      {/* Menu Options */}
                      <div className="py-1.5 space-y-0.5 text-xs">
                        {/* 1. Approved Creator: Show Creator Studio */}
                        {isApprovedCreator && onNavigateToStudio && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              onNavigateToStudio();
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${
                              isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-amber-600' : 'text-slate-200 hover:bg-slate-800 hover:text-amber-400'
                            } transition text-left`}
                          >
                            <Tv className="w-4 h-4 text-amber-500" />
                            <span className="font-semibold">{language === 'hi' ? '🎬 बुन्देली क्रिएटर स्टूडियो' : '🎬 Creator Studio'}</span>
                          </button>
                        )}

                        {/* 2. Pending Creator: Show Under Review Button */}
                        {isPendingCreator && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              if (onOpenPendingStatusModal) {
                                onOpenPendingStatusModal();
                              } else {
                                onOpenCreateChannelModal();
                              }
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl ${
                              isLight ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200' : 'text-amber-300 bg-amber-950/40 hover:bg-amber-950/70 border-amber-800/60'
                            } border transition text-left`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Clock className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                              <span className="font-semibold truncate">{language === 'hi' ? '⏳ चैनल पेंडिंग में है' : '⏳ Channel Under Review'}</span>
                            </div>
                            <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0">
                              {language === 'hi' ? 'समीक्षा' : 'Review'}
                            </span>
                          </button>
                        )}

                        {/* 3. Has No Channel: Show Create Channel Button */}
                        {hasNoChannel && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              onOpenCreateChannelModal();
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl ${
                              isLight ? 'text-slate-800 bg-amber-50/70 hover:bg-amber-100/90 border-amber-200/80' : 'text-slate-100 bg-amber-950/40 hover:bg-amber-900/50 border-amber-800/50'
                            } border transition text-left`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <PlusCircle className="w-4 h-4 text-amber-500 shrink-0" />
                              <span className="font-bold truncate">{language === 'hi' ? '➕ चैनल बनाएं' : '➕ Create Channel'}</span>
                            </div>
                            <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                              {language === 'hi' ? 'शुरू करें' : 'Start'}
                            </span>
                          </button>
                        )}

                        {/* Wallet option: Strictly only shown when channel is approved */}
                        {isApprovedCreator && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              onOpenWalletModal();
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${
                              isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-emerald-600' : 'text-slate-200 hover:bg-slate-800 hover:text-emerald-400'
                            } transition text-left`}
                          >
                            <IndianRupee className="w-4 h-4 text-emerald-500" />
                            <span>{language === 'hi' ? 'कमाई व वॉलेट (₹)' : 'Earnings & Wallet (₹)'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            if (onNavigateToYou) onNavigateToYou();
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${
                            isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-amber-600' : 'text-slate-200 hover:bg-slate-800 hover:text-amber-400'
                          } transition text-left`}
                        >
                          <VideoIcon className="w-4 h-4 text-slate-400" />
                          <span>{language === 'hi' ? 'डाउनलोड्स (ऑफ़लाइन)' : 'Downloads (Offline)'}</span>
                        </button>

                        <div className={`border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'} my-1`} />

                        {/* Theme Toggle in Menu */}
                        <button
                          type="button"
                          onClick={onToggleTheme}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl ${
                            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'
                          } transition text-left`}
                        >
                          <div className="flex items-center gap-3">
                            {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                            <span>{language === 'hi' ? 'थीम (Appearance)' : 'Appearance'}</span>
                          </div>
                          <span className={`text-[10px] ${isLight ? 'text-slate-600 bg-slate-100' : 'text-slate-400 bg-slate-800'} px-2 py-0.5 rounded-full uppercase font-bold`}>
                            {theme === 'dark' ? 'Dark 🌙' : 'Light ☀️'}
                          </span>
                        </button>

                        {/* Language Toggle */}
                        <button
                          type="button"
                          onClick={onToggleLanguage}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl ${
                            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'
                          } transition text-left`}
                        >
                          <div className="flex items-center gap-3">
                            <Languages className="w-4 h-4 text-teal-500" />
                            <span>{language === 'hi' ? 'भाषा' : 'Language'}</span>
                          </div>
                          <span className={`text-[10px] ${isLight ? 'text-slate-600 bg-slate-100' : 'text-slate-400 bg-slate-800'} px-2 py-0.5 rounded-full font-semibold`}>
                            {language === 'hi' ? 'हिंदी' : 'English'}
                          </span>
                        </button>

                        {/* Settings */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenSettings();
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${
                            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'
                          } transition text-left`}
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>{language === 'hi' ? 'सेटिंग्स' : 'Settings'}</span>
                        </button>

                        {/* Help */}
                        {onOpenHelpCenter && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              onOpenHelpCenter();
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${
                              isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'
                            } transition text-left`}
                          >
                            <HelpCircle className="w-4 h-4 text-slate-400" />
                            <span>{language === 'hi' ? 'मदद व सहायता' : 'Help & Support'}</span>
                          </button>
                        )}

                        {/* Policies & Legal */}
                        {onOpenPolicies && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              onOpenPolicies('admob_adsense');
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${
                              isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'
                            } transition text-left`}
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span>{language === 'hi' ? 'नीतियां व कानूनी केंद्र' : 'Policies & Legal'}</span>
                          </button>
                        )}

                        <div className={`border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'} my-1`} />

                        {/* Sign Out */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition text-left font-semibold"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{language === 'hi' ? 'लॉग आउट' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Sign In Button for Guests - Hidden on Mobile, Visible on PC */
                <button
                  type="button"
                  onClick={onOpenLoginModal}
                  className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'साइन इन' : 'Sign In'}</span>
                </button>
              )}
            </div>
          </>
        )}

      </div>
    </header>
  );
};
