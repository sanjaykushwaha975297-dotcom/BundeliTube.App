import React from 'react';
import { Play, CheckCircle2, IndianRupee, Zap, MoreVertical } from 'lucide-react';
import { Video } from '../types';
import { Language, translations } from '../locales/i18n';

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  language?: Language;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay, language = 'hi' }) => {
  const t = translations[language];

  // Format views into clean YouTube format
  const formatViews = (count: number) => {
    if (count >= 10000000) {
      return `${(count / 10000000).toFixed(1)} ${language === 'hi' ? 'करोड़' : 'Cr'} ${t.views}`;
    }
    if (count >= 100000) {
      return `${(count / 100000).toFixed(1)} ${language === 'hi' ? 'लाख' : 'Lakh'} ${t.views}`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K ${t.views}`;
    }
    return `${count} ${t.views}`;
  };

  return (
    <div
      id={`video-card-${video.id}`}
      onClick={() => onPlay(video)}
      className="group flex flex-col w-full bg-transparent cursor-pointer select-none transition-all duration-200"
    >
      {/* 16:9 Thumbnail Container */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 shadow-xs">
        <img
          src={video.thumbnail || (video as any).thumbnailUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'}
          alt={video.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Play Icon Button Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/25">
          <div className="w-11 h-11 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/40 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* YouTube style Duration Badge on Bottom-Right */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/85 backdrop-blur-xs text-white text-[11px] font-semibold flex items-center tracking-wide">
          <span>{video.duration}</span>
        </div>

        {/* Badges Top-Left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {video.isPromoted && (
            <div className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
              <Zap className="w-2.5 h-2.5 fill-slate-950 stroke-[2.5]" />
              <span>{language === 'hi' ? 'प्रमोटेड' : 'Promoted'}</span>
            </div>
          )}

          {video.isMonetized && !video.isPromoted && (
            <div className="px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1 shadow-xs backdrop-blur-xs">
              <IndianRupee className="w-2.5 h-2.5 text-emerald-400" />
              <span>{t.monetizedBadge}</span>
            </div>
          )}
        </div>
      </div>

      {/* Video Info Row below thumbnail (YouTube layout: Avatar on Left, Title & Meta on Right) */}
      <div className="pt-3 flex gap-3 items-start">
        {/* Channel Avatar */}
        <img
          src={video.channelAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
          alt={video.channelName}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
          }}
          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800 shrink-0 mt-0.5"
        />

        {/* Details Column */}
        <div className="flex-1 min-w-0">
          <h3 
            className="text-sm sm:text-[15px] font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
            title={video.title}
          >
            {video.title}
          </h3>

          {/* Channel Name & Verification */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span className="truncate hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium">
              {video.channelName}
            </span>
            {video.isVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            )}
          </div>

          {/* Views / Upload Date */}
          <div className="mt-0.5 flex items-center flex-wrap gap-x-1.5 text-xs text-slate-600 dark:text-slate-400">
            {video.artist && (
              <>
                <span className="text-amber-600 dark:text-amber-400 font-medium truncate max-w-[130px]">{video.artist}</span>
                <span>•</span>
              </>
            )}
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>
              {(!video.uploadDate || video.uploadDate.includes('Review') || video.uploadDate.includes('समीक्षा'))
                ? (video.status === 'pending' ? 'समीक्षाधीन' : 'हाल ही में')
                : video.uploadDate}
            </span>
          </div>
        </div>

        {/* 3-dot Menu Action */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(video);
          }}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 opacity-60 group-hover:opacity-100 transition-all shrink-0"
          title="More options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
