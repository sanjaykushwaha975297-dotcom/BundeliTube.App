import React from 'react';
import { 
  LayoutDashboard, 
  PlaySquare, 
  BarChart3, 
  MessageSquare, 
  Subtitles, 
  ShieldAlert, 
  IndianRupee, 
  Wand2, 
  Music, 
  Settings, 
  HelpCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Channel } from '../../types';
import { Language, translations } from '../../locales/i18n';

export type StudioTabId = 
  | 'dashboard' 
  | 'content' 
  | 'promotions'
  | 'analytics' 
  | 'comments' 
  | 'subtitles' 
  | 'copyright' 
  | 'earn' 
  | 'customization' 
  | 'audio_library' 
  | 'settings';

export type StudioTabType = StudioTabId;

interface StudioSidebarProps {
  activeTab: StudioTabId;
  onSelectTab: (tab: StudioTabId) => void;
  channel: Channel;
  language: Language;
  onOpenSettings?: () => void;
  onOpenFeedback?: () => void;
  onOpenSettingsModal?: () => void;
  onOpenFeedbackModal?: () => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  activeTab,
  onSelectTab,
  channel,
  language,
  onOpenSettings,
  onOpenFeedback,
  onOpenSettingsModal,
  onOpenFeedbackModal
}) => {
  const handleSettingsClick = onOpenSettings || onOpenSettingsModal || (() => {});
  const handleFeedbackClick = onOpenFeedback || onOpenFeedbackModal || (() => {});
  const t = translations[language];

  const primaryMenuItems = [
    { id: 'dashboard' as StudioTabId, label: t.studioDashboard, icon: LayoutDashboard, badge: null },
    { id: 'content' as StudioTabId, label: t.studioContent, icon: PlaySquare, badge: `${channel.videoCount || 6}` },
    { 
      id: 'promotions' as StudioTabId, 
      label: language === 'hi' ? 'प्रमोशन (Promotions)' : 'Promotions', 
      icon: Zap, 
      badge: 'Boost' 
    },
    { id: 'analytics' as StudioTabId, label: t.studioAnalytics, icon: BarChart3, badge: null },
    { id: 'comments' as StudioTabId, label: t.studioComments, icon: MessageSquare, badge: '4' },
    { id: 'subtitles' as StudioTabId, label: t.studioSubtitles, icon: Subtitles, badge: null },
    { id: 'copyright' as StudioTabId, label: t.studioCopyright, icon: ShieldAlert, badge: null },
    { id: 'earn' as StudioTabId, label: t.studioEarn, icon: IndianRupee, badge: '₹' },
    { id: 'customization' as StudioTabId, label: t.studioCustomization, icon: Wand2, badge: null },
    { id: 'audio_library' as StudioTabId, label: t.studioAudioLibrary, icon: Music, badge: 'Free' },
  ];

  return (
    <aside id="youtube-studio-sidebar" className="w-64 bg-slate-50 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] transition-colors">
      {/* Channel Profile Snapshot in Sidebar */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center text-center bg-slate-100/70 dark:bg-slate-950/40">
        <div className="relative group">
          <img
            src={channel.avatar}
            alt={channel.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-amber-500/80 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition"
          />
          {channel.isVerified && (
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-bold text-xs shadow">
              ✓
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            {language === 'hi' ? 'आपका चैनल' : 'Your Channel'}
          </p>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 mt-0.5">{channel.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{channel.handle}</p>
        </div>
      </div>

      {/* Main Studio Navigation Menu */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {primaryMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              id={`studio-menu-item-${item.id}`}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.badge === '₹' 
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                    : item.badge === 'Free'
                    ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Utility Menu: Settings & Feedback */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1 bg-slate-100/50 dark:bg-slate-950/30">
        <button
          onClick={handleSettingsClick}
          id="studio-menu-settings-btn"
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{t.studioSettings}</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        </button>

        <button
          onClick={handleFeedbackClick}
          id="studio-menu-feedback-btn"
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{t.studioFeedback}</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        </button>
      </div>
    </aside>
  );
};
