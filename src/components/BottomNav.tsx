import React from 'react';
import { Home, PlaySquare, Plus, Tv, User } from 'lucide-react';
import { MainAppView, UserAccount, Channel } from '../types';
import { Language, translations } from '../locales/i18n';

interface BottomNavProps {
  currentView: MainAppView;
  onNavigate: (view: MainAppView) => void;
  currentUser: UserAccount | null;
  channel?: Channel;
  onOpenUpload: () => void;
  onOpenCreateChannel?: () => void;
  onOpenPendingStatusModal?: () => void;
  onOpenLogin: () => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  currentUser,
  channel,
  onOpenUpload,
  onOpenCreateChannel,
  onOpenPendingStatusModal,
  onOpenLogin,
  language
}) => {
  const t = translations[language];
  const isApproved = Boolean(
    currentUser &&
    (currentUser.channelStatus === 'approved' || channel?.approvalStatus === 'approved') &&
    channel?.approvalStatus !== 'pending' &&
    currentUser.channelStatus !== 'pending' &&
    channel?.id
  );

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 px-2 py-1 flex items-center justify-around select-none safe-area-bottom shadow-2xl transition-colors"
    >
      {/* 1. Home */}
      <button
        id="bottom-nav-home"
        type="button"
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors cursor-pointer active:scale-95 ${
          currentView === 'home' ? 'text-amber-500 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Home className={`w-5 h-5 mb-0.5 ${currentView === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="truncate">{t.home}</span>
      </button>

      {/* 2. Shorts */}
      <button
        id="bottom-nav-shorts"
        type="button"
        onClick={() => onNavigate('shorts')}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors cursor-pointer active:scale-95 ${
          currentView === 'shorts' ? 'text-red-500 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <PlaySquare className={`w-5 h-5 mb-0.5 ${currentView === 'shorts' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="truncate">{t.shorts}</span>
      </button>

      {/* 3. Create / Upload (+) Button */}
      <div className="flex items-center justify-center flex-1 py-0.5">
        <button
          id="bottom-nav-create"
          type="button"
          onClick={() => {
            if (!currentUser) {
              onOpenLogin();
            } else if (channel?.approvalStatus === 'pending') {
              if (onOpenPendingStatusModal) {
                onOpenPendingStatusModal();
              } else if (onOpenCreateChannel) {
                onOpenCreateChannel();
              }
            } else if (!isApproved && onOpenCreateChannel) {
              onOpenCreateChannel();
            } else {
              onOpenUpload();
            }
          }}
          className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-90 transition-transform cursor-pointer"
          title={
            channel?.approvalStatus === 'pending'
              ? (language === 'hi' ? 'चैनल समीक्षाधीन है' : 'Channel Under Review')
              : isApproved
              ? (language === 'hi' ? 'वीडियो बनाएँ / अपलोड करें' : 'Upload Video')
              : (language === 'hi' ? 'चैनल बनाएँ (Create Channel)' : 'Create Channel')
          }
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* 4. Subscriptions */}
      <button
        id="bottom-nav-subscriptions"
        type="button"
        onClick={() => onNavigate('subscriptions')}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors cursor-pointer active:scale-95 ${
          currentView === 'subscriptions' ? 'text-amber-500 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Tv className={`w-5 h-5 mb-0.5 ${currentView === 'subscriptions' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="truncate">{t.subscriptions}</span>
      </button>

      {/* 5. You / Library / Profile */}
      <button
        id="bottom-nav-you"
        type="button"
        onClick={() => onNavigate('you')}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors cursor-pointer active:scale-95 ${
          currentView === 'you' || currentView === 'library' || currentView === 'history' || currentView === 'liked'
            ? 'text-amber-500 dark:text-amber-400 font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        {currentUser ? (
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={currentUser.name}
            className={`w-5 h-5 mb-0.5 rounded-full object-cover ring-1 ${
              currentView === 'you' ? 'ring-amber-500 dark:ring-amber-400 ring-offset-1 ring-offset-white dark:ring-offset-slate-950' : 'ring-slate-400 dark:ring-slate-600'
            }`}
          />
        ) : (
          <User className={`w-5 h-5 mb-0.5 ${currentView === 'you' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        )}
        <span className="truncate">{t.you}</span>
      </button>
    </nav>
  );
};
