import React, { useState } from 'react';
import { Tv, CheckCircle2, Radio, Bell, Grid, List, Sparkles, Flame, Play } from 'lucide-react';
import { Video, SubscribedChannel } from '../types';
import { VideoCard } from './VideoCard';
import { Language, translations } from '../locales/i18n';

interface SubscriptionsViewProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  language: Language;
  subscribedChannels?: SubscribedChannel[];
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  videos,
  onSelectVideo,
  language,
  subscribedChannels
}) => {
  const t = translations[language];

  // Derive genuine channels dynamically from live videos if not explicitly provided
  const liveChannels: SubscribedChannel[] = React.useMemo(() => {
    if (subscribedChannels && subscribedChannels.length > 0) {
      return subscribedChannels;
    }
    const map = new Map<string, SubscribedChannel>();
    let savedChannelsMap: Record<string, number> = {};
    try {
      const saved = localStorage.getItem('bt_channels_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.forEach((c: any) => {
          if (c.id) savedChannelsMap[c.id] = c.subscribers || 0;
          if (c.name) savedChannelsMap[c.name] = c.subscribers || 0;
        });
      }
    } catch (_) {}

    videos.forEach((v) => {
      if (v.channelName && !map.has(v.channelName)) {
        const chId = v.channelId || `chan-${v.channelName.toLowerCase().replace(/\s+/g, '-')}`;
        const realSubCount = savedChannelsMap[chId] || savedChannelsMap[v.channelName] || (v as any).subscribers || 0;
        const subStr = realSubCount >= 100000 ? `${(realSubCount / 100000).toFixed(1)}L` : realSubCount >= 1000 ? `${(realSubCount / 1000).toFixed(1)}K` : `${realSubCount}`;

        map.set(v.channelName, {
          id: chId,
          name: v.channelName,
          handle: `@${v.channelName.toLowerCase().replace(/\s+/g, '')}`,
          avatar: v.channelAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          subscribers: subStr,
          hasUnseen: false,
          isLive: false,
          description: v.description || 'बुन्देलीट्यूब सत्यापित चैनल'
        });
      }
    });
    return Array.from(map.values());
  }, [subscribedChannels, videos]);

  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'today' | 'live' | 'unwatched'>('all');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  const isShortItem = (v: Video) => Boolean(v.isShort || v.videoType === 'short' || v.category === 'shorts');

  const filteredVideos = videos.filter(v => {
    if (isShortItem(v)) return false;
    if (selectedChannelId !== 'all') {
      const ch = liveChannels.find(c => c.id === selectedChannelId || c.name === selectedChannelId);
      if (ch && !v.channelName.toLowerCase().includes(ch.name.toLowerCase().slice(0, 4))) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Channels Avatar Strip / Subscriptions Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Tv className="w-4 h-4 text-amber-500" />
            <span>{language === 'hi' ? 'सदस्यता लिए गए चैनल (Subscriptions)' : 'Subscribed Channels'}</span>
          </h2>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
            {liveChannels.length} {language === 'hi' ? 'चैनल' : 'Channels'}
          </span>
        </div>

        {/* Channels Horizontal Scroll */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedChannelId('all')}
            className={`flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer ${selectedChannelId === 'all' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition ${
              selectedChannelId === 'all' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'
            }`}>
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-[11px] truncate max-w-[70px]">{language === 'hi' ? 'सभी चैनल' : 'All'}</span>
          </button>

          {liveChannels.map((ch) => {
            const isSelected = selectedChannelId === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannelId(ch.id)}
                className={`flex flex-col items-center gap-1.5 shrink-0 group relative cursor-pointer ${isSelected ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <div className="relative">
                  <img
                    src={ch.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={ch.name}
                    className={`w-14 h-14 rounded-full object-cover ring-2 transition ${
                      isSelected ? 'ring-amber-500 scale-105' : 'ring-slate-200 dark:ring-slate-700 hover:ring-slate-400'
                    }`}
                  />
                  {ch.hasUnseen && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                  {ch.isLive && (
                    <span className="absolute -top-1 right-0 px-1.5 py-0.2 bg-red-600 text-white font-extrabold text-[9px] rounded-full ring-1 ring-white dark:ring-slate-900 uppercase animate-pulse">
                      Live
                    </span>
                  )}
                </div>
                <span className="text-[11px] truncate max-w-[75px]">{ch.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and View Layout Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              filterType === 'all' ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {language === 'hi' ? 'सभी वीडियो (All)' : 'All Videos'}
          </button>
          <button
            onClick={() => setFilterType('today')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              filterType === 'today' ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {language === 'hi' ? 'आज अपलोड किए गए' : 'Uploaded Today'}
          </button>
          <button
            onClick={() => setFilterType('live')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              filterType === 'live' ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🔴 {language === 'hi' ? 'लाइव स्ट्रीम्स' : 'Live Streams'}
          </button>
          <button
            onClick={() => setFilterType('unwatched')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              filterType === 'unwatched' ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {language === 'hi' ? 'अनदेखे वीडियो' : 'Unwatched'}
          </button>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => setViewLayout('grid')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${viewLayout === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewLayout('list')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${viewLayout === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Videos List / Feed */}
      {viewLayout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={onSelectVideo}
              language={language}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 cursor-pointer transition group shadow-xs"
            >
              <div className="relative aspect-video sm:w-64 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0">
                <img src={video.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
                  {video.duration}
                </span>
              </div>
              <div className="flex-1 space-y-1.5">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                  {video.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {video.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
                  <img src={video.channelAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={video.channelName} className="w-5 h-5 rounded-full" />
                  <span className="text-slate-800 dark:text-slate-300 font-medium">{video.channelName}</span>
                  <span>•</span>
                  <span>{(video.views / 100000).toFixed(1)} {language === 'hi' ? 'लाख व्यूज' : 'Lakh views'}</span>
                  <span>•</span>
                  <span>{video.uploadDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
