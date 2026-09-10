import React, { useState } from 'react';
import { 
  Flame, 
  Music, 
  Radio, 
  Tv, 
  Sparkles, 
  TrendingUp, 
  Headphones, 
  Mic2, 
  Play, 
  Eye, 
  CheckCircle2 
} from 'lucide-react';
import { Video } from '../types';
import { VideoCard } from './VideoCard';
import { Language, translations } from '../locales/i18n';

interface ExploreViewProps {
  initialTab?: 'trending' | 'music' | 'live' | 'podcasts';
  activeCategory?: string;
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  language: Language;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  initialTab = 'trending',
  activeCategory,
  videos,
  onSelectVideo,
  language
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'trending' | 'music' | 'live' | 'podcasts'>(initialTab);

  const tabs = [
    { id: 'trending', label: t.trending, icon: Flame },
    { id: 'music', label: t.musicTab, icon: Music },
    { id: 'live', label: t.liveTab, icon: Radio },
    { id: 'podcasts', label: t.podcastsTab, icon: Mic2 },
  ];

  const isShortItem = (v: Video) => Boolean(v.isShort || v.videoType === 'short' || v.category === 'shorts');
  const longVideos = videos.filter(v => !isShortItem(v));

  // Sorting & Filtering by genre
  const trendingSorted = [...longVideos].sort((a, b) => b.views - a.views);
  const musicVideos = longVideos.filter(v => ['music', 'rai', 'lokgeet', 'faag', 'bhajan', 'dj_remix', 'deshraj_special'].includes(v.category));
  const liveVideos = longVideos.filter(v => v.category === 'live').length > 0 ? longVideos.filter(v => v.category === 'live') : longVideos.slice(0, 3);
  const podcastVideos = longVideos.filter(v => v.category === 'podcasts' || v.category === 'alha' || v.category === 'education');

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Explore Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-100 via-amber-50 to-orange-50 dark:from-orange-950/80 dark:via-slate-900 dark:to-amber-950/60 border border-orange-200 dark:border-orange-500/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>{language === 'hi' ? 'बुंदेलखंड एक्सप्लोर हब' : 'Bundelkhand Explore Hub'}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-bundeli">
            {activeTab === 'trending' ? (t.trending || 'ट्रेंडिंग') : activeTab === 'music' ? t.musicTab : activeTab === 'live' ? t.liveTab : t.podcastsTab}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            {language === 'hi'
              ? 'बुंदेलखंड के सबसे लोकप्रिय गीत, लाइव कीर्तन, राई मुकाबला और लोक वार्ताएं'
              : 'Discover trending folk songs, live performances, and traditional talks.'}
          </p>
        </div>

        {/* Live Badge if on Live tab */}
        {activeTab === 'live' && (
          <div className="px-4 py-2 rounded-2xl bg-red-100 dark:bg-red-600/20 border border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-400 font-black text-xs uppercase flex items-center gap-2 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>3 {language === 'hi' ? 'लाइव स्ट्रीम्स सक्रिय' : 'Streams Active'}</span>
          </div>
        )}
      </div>

      {/* Explore Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-gradient-to-r dark:from-amber-500 dark:to-orange-500 dark:text-slate-950 shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid Content */}
      {activeTab === 'trending' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {trendingSorted.map((video, idx) => (
            <div key={video.id} className="relative">
              <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center shadow-md z-20">
                #{idx + 1}
              </div>
              <VideoCard video={video} onPlay={onSelectVideo} language={language} />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'music' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {musicVideos.map((video) => (
            <VideoCard key={video.id} video={video} onPlay={onSelectVideo} language={language} />
          ))}
        </div>
      )}

      {activeTab === 'live' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {liveVideos.map((video, idx) => (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-3xl border border-red-200 dark:border-red-500/30 transition cursor-pointer group space-y-3 shadow-xs"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950">
                <img src={video.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-red-600 text-white font-extrabold text-[10px] uppercase flex items-center gap-1.5 shadow-lg animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>LIVE</span>
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-md bg-black/80 text-white text-xs font-medium flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-red-400" />
                  <span>{((idx + 1) * 3420).toLocaleString()} watching</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition line-clamp-2">
                  🔴 {video.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {video.channelName} • {video.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'podcasts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {podcastVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-800 transition cursor-pointer group space-y-3 shadow-xs"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950">
                <img src={video.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-purple-600 text-white font-bold text-[10px] uppercase flex items-center gap-1 shadow-lg">
                  <Mic2 className="w-3 h-3" />
                  <span>Podcast / Talk</span>
                </div>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
                  {video.duration}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition line-clamp-2">
                  🎙️ {video.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {video.channelName} • {language === 'hi' ? 'लोकवार्ता व इतिहास' : 'Folk Talk & History'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
