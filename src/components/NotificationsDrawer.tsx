import React, { useState } from 'react';
import { Bell, CheckCheck, X, Sparkles, Tv, MessageSquare, Coins, Radio, ChevronRight } from 'lucide-react';
import { AppNotification } from '../types';
import { Language, translations } from '../locales/i18n';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onSelectVideo?: (videoId: string) => void;
  onNotificationClick?: (notif: AppNotification) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  language: Language;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectVideo,
  onNotificationClick,
  onMarkAllAsRead,
  onClearAll,
  language
}) => {
  const t = translations[language];
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all');
  const [localNotifs, setLocalNotifs] = useState<AppNotification[]>(notifications);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setLocalNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    onMarkAllAsRead?.();
  };

  const filtered = localNotifs.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'mentions') return n.type === 'comment';
    return true;
  });

  return (
    <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 max-h-[calc(100vh-85px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-[100] flex flex-col overflow-hidden animate-fade-in text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t.notifications}</h3>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 font-bold text-[10px]">
            {localNotifs.filter(n => !n.isRead).length} नया
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={markAllAsRead}
            title={language === 'hi' ? 'सभी को पढ़ा हुआ चिह्नित करें' : 'Mark all as read'}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800/80 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
            filter === 'all' 
              ? 'bg-amber-500 text-slate-950 font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          {language === 'hi' ? 'सभी (All)' : 'All'}
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
            filter === 'unread' 
              ? 'bg-amber-500 text-slate-950 font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          {language === 'hi' ? 'अनपढ़ी (Unread)' : 'Unread'}
        </button>
        <button
          onClick={() => setFilter('mentions')}
          className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
            filter === 'mentions' 
              ? 'bg-amber-500 text-slate-950 font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          {language === 'hi' ? 'टिप्पणियाँ (Mentions)' : 'Mentions'}
        </button>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto max-h-96 divide-y divide-slate-100 dark:divide-slate-800/60">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.targetVideoId && onSelectVideo) {
                  onSelectVideo(item.targetVideoId);
                  onClose();
                }
                onNotificationClick?.(item);
              }}
              className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer ${
                !item.isRead ? 'bg-amber-500/10 dark:bg-amber-500/5' : ''
              }`}
            >
              {item.avatar && item.avatar.trim() ? (
                <img src={item.avatar.trim()} alt="Sender" className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-300 dark:ring-slate-700" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-amber-500 flex items-center justify-center shrink-0">
                  {item.type === 'payout' ? <Coins className="w-4 h-4 text-emerald-500" /> : <Bell className="w-4 h-4" />}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{item.title}</h4>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 ml-1" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">{item.description}</p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">{item.timestamp}</span>
              </div>

              {item.thumbnail && item.thumbnail.trim() && (
                <img src={item.thumbnail.trim()} alt="Video" className="w-12 h-8 rounded-lg object-cover shrink-0 ml-1 border border-slate-200 dark:border-slate-800" />
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            {language === 'hi' ? 'कोई नई सूचना नहीं है।' : 'No notifications right now.'}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-center">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {language === 'hi' ? 'बुंदेलीट्यूब सूचना केंद्र' : 'BundeliTube Notification Center'}
        </span>
      </div>
    </div>
  );
};
