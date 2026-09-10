import React from 'react';
import { Play, Pause, X, Maximize2 } from 'lucide-react';
import { Video } from '../types';
import { Language, translations } from '../locales/i18n';

interface MiniPlayerProps {
  video: Video;
  isPlaying: boolean;
  onTogglePlay: (e: React.MouseEvent) => void;
  onExpand: () => void;
  onClose: (e: React.MouseEvent) => void;
  language: Language;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  video,
  isPlaying,
  onTogglePlay,
  onExpand,
  onClose,
  language
}) => {
  const t = translations[language];

  return (
    <div
      id="youtube-miniplayer"
      onClick={onExpand}
      className="fixed bottom-[58px] lg:bottom-4 right-0 lg:right-6 left-0 lg:left-auto lg:w-96 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t lg:border border-slate-200 dark:border-slate-800 lg:rounded-2xl shadow-2xl p-2 flex items-center gap-3 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-900 transition-all select-none animate-in slide-in-from-bottom-5 duration-200"
      title={language === 'hi' ? 'पूरा वीडियो देखने के लिए टैप करें' : 'Tap to expand watch view'}
    >
      {/* 16:9 Mini Thumbnail / Video Area */}
      <div className="relative aspect-video w-24 sm:w-28 rounded-lg overflow-hidden bg-black shrink-0 border border-slate-200 dark:border-slate-800">
        <img
          src={video.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
          {isPlaying ? (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          ) : (
            <Play className="w-4 h-4 text-white fill-current opacity-80" />
          )}
        </div>
      </div>

      {/* Video Details */}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {video.title}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {video.channelName}
        </p>
      </div>

      {/* Controls: Play/Pause, Maximize (Bada karne ka icon), Close */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onTogglePlay}
          className="p-1.5 sm:p-2 rounded-full text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          ) : (
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Maximize / Expand Player Button */}
        <button
          type="button"
          onClick={onExpand}
          className="p-1.5 sm:p-2 rounded-full text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
          title={language === 'hi' ? 'प्लेयर बड़ा करें (Expand Player)' : 'Expand Player'}
        >
          <Maximize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
          title={language === 'hi' ? 'बंद करें' : 'Close'}
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};
