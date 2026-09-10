import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Play, 
  Flame, 
  Film, 
  Sparkles, 
  Share2, 
  Info, 
  Calendar, 
  Eye, 
  Tv, 
  Bell, 
  ThumbsUp, 
  ArrowLeft 
} from 'lucide-react';
import { Video, ShortItem, UserAccount } from '../types';
import { Language } from '../locales/i18n';
import { recordSubscription, normalizeChannelId, checkUserSubscribedChannel } from '../lib/firebase';

interface ChannelProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
  channelId?: string;
  channelAvatar?: string;
  allVideos: Video[];
  allShorts?: ShortItem[];
  onSelectVideo: (video: Video) => void;
  onSelectShort?: (short: ShortItem) => void;
  currentUser?: UserAccount | null;
  language: Language;
  onOpenLoginModal?: () => void;
}

export const ChannelProfileModal: React.FC<ChannelProfileModalProps> = ({
  isOpen,
  onClose,
  channelName,
  channelId,
  channelAvatar,
  allVideos,
  allShorts = [],
  onSelectVideo,
  onSelectShort,
  currentUser,
  language,
  onOpenLoginModal
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'top' | 'videos' | 'shorts' | 'about'>('top');
  const [copySuccess, setCopySuccess] = useState(false);

  // Derive unique normalized channel key
  const effectiveChannelId = normalizeChannelId(channelId, channelName);

  // Check subscription state from localStorage and currentUser
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    try {
      const savedSubs = JSON.parse(localStorage.getItem('bt_subscribed_channels') || '{}');
      return Boolean(
        savedSubs[effectiveChannelId] || 
        (channelId && savedSubs[channelId]) || 
        savedSubs[channelName.trim()]
      );
    } catch {
      return false;
    }
  });

  // Real-time subscriber count
  const [subscriberCount, setSubscriberCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bt_channels_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        const matched = parsed.find((c: any) => c.id === effectiveChannelId || c.id === channelId || c.name === channelName);
        if (matched && typeof matched.subscribers === 'number') return Math.max(0, matched.subscribers);
      }
    } catch {}

    // Check if any matching video has subscribers count
    const matchingVid = allVideos.find(v => (v.channelId === channelId || v.channelName === channelName) && ((v as any).subscribers || (v as any).channelSubscribers));
    if (matchingVid) {
      return (matchingVid as any).subscribers || (matchingVid as any).channelSubscribers || 0;
    }

    return 0;
  });

  // Keep subscription status in sync with global broadcast events
  useEffect(() => {
    const handleSubChange = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      const isTarget = 
        detail.channelId === effectiveChannelId || 
        detail.channelName === channelName.trim() ||
        (channelId && detail.legacyChannelId === channelId);

      if (isTarget) {
        setIsSubscribed(Boolean(detail.isSubscribed));
        if (typeof detail.subscribersCount === 'number') {
          setSubscriberCount(detail.subscribersCount);
        }
      }
    };

    window.addEventListener('bt_subscription_changed', handleSubChange);
    return () => window.removeEventListener('bt_subscription_changed', handleSubChange);
  }, [effectiveChannelId, channelName, channelId]);

  // Handle Subscribe / Unsubscribe toggle
  const handleToggleSubscribe = () => {
    // 1. REQUIRE LOGIN: Must be logged in with Google/Gmail account
    if (!currentUser || !currentUser.isLoggedIn || !currentUser.email) {
      if (onOpenLoginModal) {
        onOpenLoginModal();
      }
      return;
    }

    const nextSub = !isSubscribed;
    setIsSubscribed(nextSub);
    setSubscriberCount(prev => (nextSub ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const savedSubs = JSON.parse(localStorage.getItem('bt_subscribed_channels') || '{}');
      if (nextSub) {
        savedSubs[effectiveChannelId] = true;
        if (channelId) savedSubs[channelId] = true;
        savedSubs[channelName.trim()] = true;
      } else {
        delete savedSubs[effectiveChannelId];
        if (channelId) delete savedSubs[channelId];
        delete savedSubs[channelName.trim()];
      }
      localStorage.setItem('bt_subscribed_channels', JSON.stringify(savedSubs));

      // Also update bt_channels_v2
      const savedChannelsStr = localStorage.getItem('bt_channels_v2');
      if (savedChannelsStr) {
        const channels = JSON.parse(savedChannelsStr);
        const ch = channels.find((c: any) => c.id === effectiveChannelId || c.id === channelId || c.name === channelName);
        if (ch) {
          ch.subscribers = nextSub ? (ch.subscribers || 0) + 1 : Math.max(0, (ch.subscribers || 1) - 1);
          localStorage.setItem('bt_channels_v2', JSON.stringify(channels));
        }
      }
    } catch {}

    recordSubscription(effectiveChannelId, channelName, nextSub, currentUser);
  };

  // Find channel videos
  const channelVideos = useMemo(() => {
    const matched = allVideos.filter(v => {
      if (v.isShort || v.videoType === 'short' || v.category === 'shorts') return false;
      if (v.channelName && v.channelName.toLowerCase() === channelName.toLowerCase()) return true;
      if (channelId && v.channelId === channelId) return true;
      if (v.artist && v.artist.toLowerCase().includes(channelName.toLowerCase())) return true;
      return false;
    });

    // If channel has only 1 or 2 specific videos, supplement with matching category so channel looks authentic
    if (matched.length === 0) {
      return allVideos.filter(v => !v.isShort).slice(0, 6).map(v => ({
        ...v,
        channelName: channelName,
        channelAvatar: channelAvatar || v.channelAvatar
      }));
    }
    return matched;
  }, [allVideos, channelName, channelId, channelAvatar]);

  // Find channel shorts
  const channelShorts = useMemo(() => {
    return allShorts.filter(s => {
      if (s.channelName && s.channelName.toLowerCase() === channelName.toLowerCase()) return true;
      if (channelId && (s as any).channelId === channelId) return true;
      return false;
    });
  }, [allShorts, channelName, channelId]);

  // Top Videos sorted by view count descending
  const topVideos = useMemo(() => {
    return [...channelVideos].sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [channelVideos]);

  // Total views calculation
  const totalViews = useMemo(() => {
    const vidViews = channelVideos.reduce((acc, v) => acc + (v.views || 0), 0);
    const shortViews = channelShorts.reduce((acc, s) => acc + (s.views || 0), 0);
    return Math.max(vidViews + shortViews, 45200);
  }, [channelVideos, channelShorts]);

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)} ${language === 'hi' ? 'करोड़' : 'Cr'}`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)} ${language === 'hi' ? 'लाख' : 'Lakh'}`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('en-IN');
  };

  // Share Channel Link
  const handleShareChannel = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  // Channel avatar image
  const effectiveAvatar = channelAvatar || 
    channelVideos[0]?.channelAvatar || 
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

  // High quality default banner
  const bannerUrl = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full h-full sm:max-w-4xl sm:h-[92vh] sm:rounded-3xl bg-slate-950 text-slate-100 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Sticky Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onClose}
              className="p-2 -ml-1 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate flex items-center gap-1.5">
                {channelName}
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {channelVideos.length + channelShorts.length} {language === 'hi' ? 'वीडियो' : 'videos'} • {formatNumber(subscriberCount)} {language === 'hi' ? 'सब्सक्राइबर्स' : 'subscribers'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareChannel}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Share Channel"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Channel Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
          
          {/* Channel Banner */}
          <div className="relative aspect-[3.5/1] sm:aspect-[4.5/1] w-full overflow-hidden bg-slate-900">
            <img
              src={bannerUrl}
              alt="Channel Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
          </div>

          {/* Channel Header Profile Card */}
          <div className="px-4 sm:px-6 -mt-10 sm:-mt-14 relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-3.5 sm:gap-4">
                <img
                  src={effectiveAvatar}
                  alt={channelName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-slate-950 shadow-2xl bg-slate-900 shrink-0"
                />
                <div className="pb-1 min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 truncate">
                    {channelName}
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                  </h1>
                  <p className="text-xs text-slate-400 truncate">
                    @{channelName.toLowerCase().replace(/[^a-z0-9]/g, '')}
                  </p>
                  <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                    {formatNumber(subscriberCount)} {language === 'hi' ? 'सब्सक्राइबर्स' : 'subscribers'} • {channelVideos.length + channelShorts.length} {language === 'hi' ? 'वीडियो' : 'videos'}
                  </p>
                </div>
              </div>

              {/* Subscribe Button - Red Initially, Grey when Subscribed */}
              <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
                <button
                  type="button"
                  onClick={handleToggleSubscribe}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition shadow-lg cursor-pointer flex items-center gap-1.5 ${
                    isSubscribed
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>{language === 'hi' ? 'सब्सक्राइब्ड' : 'Subscribed'}</span>
                    </>
                  ) : (
                    <span>{language === 'hi' ? 'सब्सक्राइब' : 'Subscribe'}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Stats Pill Strip */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 whitespace-nowrap">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span><strong>{channelVideos.length}</strong> {language === 'hi' ? 'लॉन्ग वीडियो' : 'Long Videos'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span><strong>{channelShorts.length}</strong> {language === 'hi' ? 'शॉर्ट्स/रील्स' : 'Shorts'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 whitespace-nowrap">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span><strong>{formatNumber(totalViews)}</strong> {language === 'hi' ? 'कुल व्यूज' : 'Total Views'}</span>
              </span>
            </div>

            {/* Channel Bio Snippet */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
              {language === 'hi' 
                ? `जय बुंदेलखंड! ${channelName} का आधिकारिक चैनल। यहाँ बुंदेलखंड के प्रसिद्ध लोकगीत, राई नृत्य, आल्हा ऊदल और सांस्कृतिक प्रस्तुतियों का भरपूर आनंद लें। चैनल को सब्सक्राइब जरूर करें!`
                : `Welcome to ${channelName} official channel on BundeliTube. Enjoy traditional Bundeli folk songs, Rai dance, and cultural performances.`}
            </p>

            {copySuccess && (
              <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium animate-in fade-in">
                {language === 'hi' ? 'चैनल लिंक कॉपी हो गया!' : 'Channel link copied to clipboard!'}
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="sticky top-[57px] z-20 px-4 sm:px-6 bg-slate-950 border-b border-slate-800/80">
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('top')}
                className={`py-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'top'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-4 h-4 text-orange-400" />
                <span>{language === 'hi' ? 'टॉप वीडियो' : 'Top Videos'}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">{topVideos.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('videos')}
                className={`py-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'videos'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Film className="w-4 h-4 text-amber-400" />
                <span>{language === 'hi' ? 'सभी वीडियो' : 'All Videos'}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">{channelVideos.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('shorts')}
                className={`py-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'shorts'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>{language === 'hi' ? 'रील्स / शॉर्ट्स' : 'Shorts'}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">{channelShorts.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`py-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'about'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Info className="w-4 h-4 text-blue-400" />
                <span>{language === 'hi' ? 'जानकारी (About)' : 'About'}</span>
              </button>
            </div>
          </div>

          {/* TAB 1: TOP VIDEOS */}
          {activeTab === 'top' && (
            <div className="px-4 sm:px-6 pb-8 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>{language === 'hi' ? 'चैनल के सबसे लोकप्रिय गीत व वीडियो (Top Rated)' : 'Most Viewed Top Videos'}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {topVideos.map((video, idx) => (
                  <div
                    key={`top-${video.id}`}
                    onClick={() => {
                      onSelectVideo(video);
                      onClose();
                    }}
                    className="group rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-2.5 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-2">
                        <img
                          src={video.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Rank Badge */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[11px] shadow-md flex items-center gap-1">
                          <span>#{idx + 1}</span>
                          <Flame className="w-3 h-3 fill-current" />
                        </div>
                        {/* Duration */}
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                          {video.duration || '04:30'}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-amber-400 line-clamp-2 leading-snug">
                        {video.title}
                      </h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-amber-400/90">{formatNumber(video.views)} {language === 'hi' ? 'व्यूज' : 'views'}</span>
                      <span>{video.uploadDate || '2 दिन पहले'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ALL VIDEOS */}
          {activeTab === 'videos' && (
            <div className="px-4 sm:px-6 pb-8 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-200">
                  {language === 'hi' ? `सभी अपलोड किए गए वीडियो (${channelVideos.length})` : `All Uploaded Videos (${channelVideos.length})`}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {channelVideos.map((video) => (
                  <div
                    key={`all-${video.id}`}
                    onClick={() => {
                      onSelectVideo(video);
                      onClose();
                    }}
                    className="group rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-2.5 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-2">
                        <img
                          src={video.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                          {video.duration || '04:30'}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-amber-400 line-clamp-2 leading-snug">
                        {video.title}
                      </h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{formatNumber(video.views)} {language === 'hi' ? 'व्यूज' : 'views'}</span>
                      <span>{video.uploadDate || '1 हफ्ता पहले'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SHORTS */}
          {activeTab === 'shorts' && (
            <div className="px-4 sm:px-6 pb-8 space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-200">
                {language === 'hi' ? `चैनल की रील्स व शॉर्ट्स (${channelShorts.length})` : `Channel Shorts (${channelShorts.length})`}
              </h3>

              {channelShorts.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm">{language === 'hi' ? 'इस चैनल पर अभी कोई शॉर्ट्स नहीं है' : 'No shorts on this channel yet'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {channelShorts.map((short) => (
                    <div
                      key={`short-${short.id}`}
                      onClick={() => {
                        if (onSelectShort) {
                          onSelectShort(short);
                          onClose();
                        }
                      }}
                      className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer shadow-md"
                    >
                      <img
                        src={short.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'}
                        alt={short.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-2.5 flex flex-col justify-end">
                        <p className="text-xs font-semibold text-white line-clamp-2 leading-snug drop-shadow">
                          {short.title}
                        </p>
                        <span className="text-[10px] text-amber-300 font-bold mt-1">
                          {formatNumber(short.views || 1850)} {language === 'hi' ? 'व्यूज' : 'views'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ABOUT */}
          {activeTab === 'about' && (
            <div className="px-4 sm:px-6 pb-8 space-y-4 max-w-2xl">
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-3">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>{language === 'hi' ? 'चैनल विवरण' : 'Description'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {language === 'hi'
                    ? `बुन्देलीट्यूब पर ${channelName} का आधिकारिक पेज। यह चैनल बुंदेली संस्कृति, पारंपरिक जवाबी राई, देहाती लोकगीत, आल्हा ऊदल और ढिमरयाई संगीत को समर्पित है।`
                    : `Official channel page of ${channelName} on BundeliTube.`}
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-3">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Tv className="w-4 h-4 text-blue-400" />
                  <span>{language === 'hi' ? 'चैनल आँकड़े (Channel Stats)' : 'Channel Stats'}</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block">{language === 'hi' ? 'शामिल होने की तिथि' : 'Joined'}</span>
                    <strong className="text-slate-200 mt-1 block">15 जनवरी 2024</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block">{language === 'hi' ? 'कुल वीडियो' : 'Total Videos'}</span>
                    <strong className="text-amber-400 mt-1 block">{channelVideos.length + channelShorts.length}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block">{language === 'hi' ? 'कुल दर्शक व्यूज' : 'Total Views'}</span>
                    <strong className="text-emerald-400 mt-1 block">{formatNumber(totalViews)}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block">{language === 'hi' ? 'स्थान' : 'Location'}</span>
                    <strong className="text-slate-200 mt-1 block">बुंदेलखंड, भारत 🇮🇳</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
