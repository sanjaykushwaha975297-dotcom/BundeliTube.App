import React, { useState, useRef, useEffect } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Share2, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  CheckCircle2, 
  Plus,
  Send,
  X,
  Play,
  Pause,
  ArrowLeft,
  MoreVertical,
  ExternalLink,
  ShieldCheck,
  Heart,
  Volume2,
  VolumeX,
  Music
} from 'lucide-react';
import { ShortItem, Video, UserAccount } from '../types';
import { MOCK_SHORTS } from '../data/mockData';
import { Language, translations } from '../locales/i18n';
import { ShareModal } from './ShareModal';
import { SponsoredShortCard } from './SponsoredShortCard';
import { 
  shortsWatchedVideosTracker, 
  shortsCreatorTracker, 
  processShortsFeedAdRevenue, 
  recordShortAdPoolToFirebase,
  WatchedVideoInfo 
} from '../lib/revenueService';
import { resolvePlayableStreamUrl, FALLBACK_VIDEO_STREAMS } from '../services/videoCache';
import { 
  recordVideoLike, 
  recordSubscription, 
  checkUserLikedVideo, 
  checkUserSubscribedChannel,
  normalizeChannelId
} from '../lib/firebase';
import { ChannelProfileModal } from './ChannelProfileModal';

interface ShortsViewProps {
  shorts?: ShortItem[];
  initialIndex?: number;
  currentUser?: UserAccount | null;
  onSelectVideo?: (v: Video) => void;
  onAdImpressionCredited?: (data: { impressionValue: number; creatorShare: number; videoId: string }) => void;
  onClose?: () => void;
  language: Language;
  allVideos?: Video[];
  onOpenUploadModal?: () => void;
  onOpenLoginModal?: () => void;
}

export const ShortsView: React.FC<ShortsViewProps> = ({ 
  shorts = [], 
  initialIndex = 0,
  currentUser, 
  onSelectVideo, 
  onAdImpressionCredited, 
  onClose,
  language,
  allVideos = [],
  onOpenUploadModal,
  onOpenLoginModal
}) => {
  const t = translations[language];
  const getEnrichedShorts = (items: ShortItem[]) => {
    if (!Array.isArray(items)) return [];
    try {
      const savedLikes = JSON.parse(localStorage.getItem('bt_liked_videos') || '{}');
      const savedSubs = JSON.parse(localStorage.getItem('bt_subscribed_channels') || '{}');
      return items
        .filter(s => Boolean(s && (s.id || s.videoUrl || s.youtubeId)))
        .map(s => {
          const normKey = normalizeChannelId((s as any).channelId, s.channelName);
          return {
            ...s,
            videoUrl: s.videoUrl || '',
            isLiked: Boolean(savedLikes[s.id] || s.isLiked),
            isSubscribed: Boolean(
              savedSubs[normKey] || 
              ((s as any).channelId && savedSubs[(s as any).channelId]) || 
              (s.channelName && savedSubs[s.channelName.trim()]) || 
              s.isSubscribed
            )
          };
        });
    } catch (_) {
      return items.filter(s => Boolean(s && (s.id || s.videoUrl || s.youtubeId)));
    }
  };

  const [currentIndex, setCurrentIndex] = useState(
    initialIndex >= 0 && initialIndex < (shorts?.length || 0) ? initialIndex : 0
  );
  const [shortsList, setShortsList] = useState<ShortItem[]>(() => {
    return getEnrichedShorts(shorts || []);
  });

  useEffect(() => {
    setShortsList(getEnrichedShorts(shorts || []));
  }, [shorts]);

  // Sync subscription updates across app views in real-time
  useEffect(() => {
    const handleSubChange = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      setShortsList(prev => prev.map(s => {
        const normKey = normalizeChannelId((s as any).channelId, s.channelName);
        const legacyId = (s as any).channelId;
        if (
          normKey === detail.channelId || 
          normKey === detail.legacyChannelId ||
          (legacyId && (legacyId === detail.legacyChannelId || legacyId === detail.channelId)) ||
          s.channelName?.trim() === detail.channelName
        ) {
          return { ...s, isSubscribed: Boolean(detail.isSubscribed) };
        }
        return s;
      }));
      if (typeof detail.subscribersCount === 'number') {
        setChannelSubscribersMap(prev => ({
          ...prev,
          [detail.channelId]: detail.subscribersCount,
          ...(detail.legacyChannelId ? { [detail.legacyChannelId]: detail.subscribersCount } : {}),
          ...(detail.channelName ? { [detail.channelName]: detail.subscribersCount } : {})
        }));
      }
    };
    window.addEventListener('bt_subscription_changed', handleSubChange);
    return () => window.removeEventListener('bt_subscription_changed', handleSubChange);
  }, []);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentsText, setCommentsText] = useState('');
  const [shortComments, setShortComments] = useState<{ id: string; author: string; text: string; time: string; likes: number }[]>([
    { id: '1', author: 'रामसेवक बुंदेला', text: 'वाह! माटी की खुशबू आ गई, शानदार राई नाच! 🔥', time: '2 घंटे पहले', likes: 124 },
    { id: '2', author: 'सुनीता पटेल झाँसी', text: 'देशराज जी का यह गाना हमेशा दिल जीत लेता है ❤️', time: '5 घंटे पहले', likes: 89 }
  ]);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [channelModal, setChannelModal] = useState<{ channelName: string; channelId?: string; channelAvatar?: string } | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsMuted(prev => {
      const next = !prev;
      if (isDirectVideo && nativeVideoRef.current) {
        nativeVideoRef.current.muted = next;
      } else {
        sendIframeCommand(next ? 'mute' : 'unMute');
      }
      return next;
    });
  };

  const handleRemix = () => {
    if (onOpenUploadModal) {
      onOpenUploadModal();
    } else {
      triggerToast(language === 'hi' ? 'इस ऑडियो से अपनी रील बनाएं 🎵' : 'Create short with this sound 🎵');
    }
  };

  // Touch Swipe Gesture Tracking for seamless vertical swipe like YouTube Shorts
  const touchStartYRef = useRef<number | null>(null);
  const touchEndYRef = useRef<number | null>(null);
  const lastWheelTimeRef = useRef<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Double-tap like heart animation
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);
  const lastTapTimeRef = useRef<number>(0);

  // YouTube Shorts Player Red Scrubber & Progress State
  const durationSeconds = 58; // Standard Shorts duration
  const [currentTime, setCurrentTime] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState<{ time: number; x: number } | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const nativeVideoRef = useRef<HTMLVideoElement>(null);

  // YouTube-Style Shorts Ad Overlay State (5-Shorts Rule Counter)
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [shortVideoCount, setShortVideoCount] = useState(0);
  const recent5WatchedRef = useRef<WatchedVideoInfo[]>([]);

  // Dynamic real channel subscribers map
  const [channelSubscribersMap, setChannelSubscribersMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    try {
      const subCounts = JSON.parse(localStorage.getItem('bt_channel_sub_counts') || '{}');
      Object.assign(map, subCounts);

      const savedChannels = localStorage.getItem('bt_channels_v2');
      if (savedChannels) {
        const parsed = JSON.parse(savedChannels);
        parsed.forEach((c: any) => {
          if (c.id && typeof map[c.id] !== 'number') map[c.id] = c.subscribers || 0;
          if (c.name && typeof map[c.name] !== 'number') map[c.name] = c.subscribers || 0;
        });
      }
    } catch (_) {}
    return map;
  });

  const getSubscribersText = (channelId?: string, channelName?: string) => {
    const count = (channelId && channelSubscribersMap[channelId]) || 
                  (channelName && channelSubscribersMap[channelName]) || 
                  0;
    if (count <= 0) return language === 'hi' ? '0 सब्सक्राइबर्स' : '0 subscribers';
    if (count >= 10000000) return `${(count / 10000000).toFixed(1)} ${language === 'hi' ? 'करोड़' : 'Cr'} ${language === 'hi' ? 'सब्सक्राइबर्स' : 'subscribers'}`;
    if (count >= 100000) return `${(count / 100000).toFixed(1)} ${language === 'hi' ? 'लाख' : 'Lakh'} ${language === 'hi' ? 'सब्सक्राइबर्स' : 'subscribers'}`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K ${language === 'hi' ? 'सब्सक्राइबर्स' : 'subscribers'}`;
    return `${count} ${language === 'hi' ? 'सब्सक्राइबर्स' : 'subscribers'}`;
  };

  const currentShort: ShortItem | undefined = shortsList && shortsList.length > 0 ? (shortsList[currentIndex] || shortsList[0]) : undefined;
  
  // Extract robust 11-char YouTube ID from url, youtubeId or id
  const extractShortYouTubeId = (short?: ShortItem): string | null => {
    if (!short) return null;
    if (short.youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(short.youtubeId)) {
      return short.youtubeId;
    }
    if (short.id && /^[a-zA-Z0-9_-]{11}$/.test(short.id) && !short.id.startsWith('short-')) {
      return short.id;
    }
    const url = short.videoUrl || '';
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }
    const match = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|(?:shorts)\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
    return null;
  };

  const resolvedYouTubeId = currentShort ? extractShortYouTubeId(currentShort) : null;
  const isDirectVideo = !resolvedYouTubeId;

  const [resolvedShortStream, setResolvedShortStream] = useState<string>(currentShort?.videoUrl || (currentShort as any)?.streamUrl || '');
  const [shortVideoError, setShortVideoError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (isDirectVideo && currentShort) {
      resolvePlayableStreamUrl({
        id: currentShort?.id,
        streamUrl: (currentShort as any)?.streamUrl || currentShort?.videoUrl,
        videoUrl: currentShort?.videoUrl,
        youtubeId: currentShort?.youtubeId
      }).then((res) => {
        if (!cancelled && res.url) {
          setResolvedShortStream(res.url);
          setShortVideoError(false);
        }
      }).catch(() => {
        if (!cancelled) {
          setResolvedShortStream(currentShort?.videoUrl || (currentShort as any)?.streamUrl || '');
        }
      });
    } else {
      setResolvedShortStream(currentShort?.videoUrl || (currentShort as any)?.streamUrl || '');
    }
    return () => {
      cancelled = true;
    };
  }, [currentShort?.id, currentShort?.videoUrl, currentShort?.youtubeId, isDirectVideo]);

  useEffect(() => {
    if (initialIndex >= 0 && initialIndex < shortsList.length) {
      setCurrentIndex(initialIndex);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  }, [initialIndex, shortsList.length]);

  // Keyboard navigation for fast scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showComments) return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm') {
        e.preventDefault();
        setIsMuted(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, showComments, isPlaying, isAdPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const sendIframeCommand = (func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  };

  const handleNext = () => {
    if (isTransitioning || !currentShort || shortsList.length === 0) return;
    setIsTransitioning(true);
    setCurrentTime(0);

    // 2. SHORT VIDEO ADS (5-Shorts Rule):
    // Every time a user watches 1 short video, increment the counter by +1.
    const nextCount = shortVideoCount + 1;

    // When shortVideoCount reaches 5, the ad shown on the next (6th) short video is triggered.
    if (nextCount >= 5) {
      setShortVideoCount(5);
      setIsAdPlaying(true);
      setIsPlaying(false);
      sendIframeCommand('pauseVideo');
    } else {
      setShortVideoCount(nextCount);
      const nextIdx = currentIndex < shortsList.length - 1 ? currentIndex + 1 : 0;
      setCurrentIndex(nextIdx);
      setIsPlaying(true);
    }
    setTimeout(() => setIsTransitioning(false), 200);
  };

  const handlePrev = () => {
    if (isTransitioning || currentIndex === 0 || !currentShort || shortsList.length === 0) return;
    setIsTransitioning(true);
    setCurrentTime(0);
    setCurrentIndex(prev => prev - 1);
    setIsPlaying(true);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  // Screen Lock & Display Off Auto-Pause (YouTube iframe + HTML5 video)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        if (isDirectVideo && nativeVideoRef.current) {
          nativeVideoRef.current.pause();
        } else {
          sendIframeCommand('pauseVideo');
        }
        setIsPlaying(false);
      }
    };

    const handlePageHide = () => {
      if (isDirectVideo && nativeVideoRef.current) {
        nativeVideoRef.current.pause();
      } else {
        sendIframeCommand('pauseVideo');
      }
      setIsPlaying(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isDirectVideo]);

  useEffect(() => {
    if (currentShort) {
      const cid = currentShort.channelId || (currentShort as any).creatorId || 'creator-1';
      const cname = currentShort.channelName || 'क्रिएटर';
      const videoInfo: WatchedVideoInfo = {
        videoId: currentShort.id,
        videoTitle: currentShort.title,
        creatorId: cid,
        creatorName: cname,
        channelName: cname
      };

      shortsWatchedVideosTracker.recordVideoView(videoInfo);
      shortsCreatorTracker.trackCreator(cid);

      // Track in current 5-video interval
      recent5WatchedRef.current.push(videoInfo);
      if (recent5WatchedRef.current.length > 5) {
        recent5WatchedRef.current = recent5WatchedRef.current.slice(-5);
      }
    }
  }, [currentIndex, currentShort]);

  const adPoolRecordedRef = useRef(false);

  // 5-Shorts Rule: When ad is successfully shown, record and push last 5 Creator IDs into 'short_ad_pools'
  useEffect(() => {
    if (isAdPlaying && !adPoolRecordedRef.current) {
      adPoolRecordedRef.current = true;

      const last5 = recent5WatchedRef.current.length >= 5
        ? [...recent5WatchedRef.current.slice(-5)]
        : shortsWatchedVideosTracker.getLast5WatchedVideos();

      const last5CreatorIds = last5.map(v => v.creatorId).filter(Boolean);

      recordShortAdPoolToFirebase({
        creatorIds: last5CreatorIds.length > 0 ? last5CreatorIds : ['creator-1', 'creator-2', 'creator-3', 'creator-4', 'creator-5'],
        watchedVideos: last5,
        activeShortId: currentShort?.id,
        activeShortTitle: currentShort?.title,
        sponsorBrand: 'AdMob Partner Sponsored Reel'
      }).then((poolId) => {
        console.log(`[ShortsView] Ad Impression Shown: Pushed last 5 creators to short_ad_pools (${poolId}). Resetting shortVideoCount to 0.`);
        setShortVideoCount(0);
      }).catch(err => {
        console.warn('[ShortsView] Failed to record short_ad_pools:', err);
        setShortVideoCount(0);
      });
    } else if (!isAdPlaying) {
      adPoolRecordedRef.current = false;
    }
  }, [isAdPlaying, currentShort?.id, currentShort?.title]);

  const handleAdCompleted = (revenue: number = 0.20) => {
    if (!currentShort) {
      setIsAdPlaying(false);
      return;
    }
    setIsAdPlaying(false);
    setIsPlaying(true);
    sendIframeCommand('playVideo');

    // Retrieve the exact 5 videos watched before this ad break
    const watched5 = recent5WatchedRef.current.length >= 5
      ? [...recent5WatchedRef.current]
      : shortsWatchedVideosTracker.getLast5WatchedVideos();

    // Short videos do not generate creator earnings (0% Creator Share, 100% Platform)
    processShortsFeedAdRevenue({
      totalAmount: 0.40,
      sponsorBrand: 'AdMob Partner Sponsored Reel',
      watchedVideos: watched5,
      activeShortId: currentShort.id,
      activeShortTitle: currentShort.title,
      viewerUserId: currentUser?.id,
      viewerChannelId: (currentUser as any)?.channelId
    }).catch(e => console.warn('Shorts ad revenue error:', e));

    // Reset local 5-video interval buffer and reset counter
    recent5WatchedRef.current = [];
    setShortVideoCount(0);

    if (onAdImpressionCredited) {
      setTimeout(() => {
        onAdImpressionCredited({
          impressionValue: 0.40,
          creatorShare: 0, // 🛡️ Zero creator earning for short videos
          videoId: currentShort.id
        });
      }, 0);
    }

    // Move smoothly to next short
    const nextIdx = currentIndex < shortsList.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(nextIdx);
  };

  const togglePlayPause = () => {
    if (isAdPlaying) return;
    if (isPlaying) {
      if (isDirectVideo && nativeVideoRef.current) {
        nativeVideoRef.current.pause();
      } else {
        sendIframeCommand('pauseVideo');
      }
      setIsPlaying(false);
    } else {
      if (isDirectVideo && nativeVideoRef.current) {
        nativeVideoRef.current.play().catch(() => {});
      } else {
        sendIframeCommand('playVideo');
      }
      setIsPlaying(true);
    }
  };

  const handleScreenTap = () => {
    if (!currentShort) return;
    const now = Date.now();
    if (now - lastTapTimeRef.current < 300) {
      // Double tap recognized -> Like video with heart animation!
      if (!currentShort.isLiked) {
        handleLike();
      }
      setDoubleTapHeart(true);
      setTimeout(() => setDoubleTapHeart(false), 800);
      lastTapTimeRef.current = 0;
    } else {
      lastTapTimeRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastTapTimeRef.current >= 280 && lastTapTimeRef.current !== 0) {
          togglePlayPause();
        }
      }, 290);
    }
  };

  // Shorts Progress Interval
  useEffect(() => {
    let interval: any;
    if (isPlaying && !isAdPlaying && !isScrubbing) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= durationSeconds) {
            return 0; // loop short
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isAdPlaying, isScrubbing, durationSeconds]);

  // Seeker / Scrubber Calculations
  const calculateSeekTime = (clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.floor(pos * durationSeconds);
  };

  const handleSeekPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsScrubbing(true);
    const targetTime = calculateSeekTime(e.clientX);
    setCurrentTime(targetTime);
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handleSeekPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const targetTime = Math.floor((relX / rect.width) * durationSeconds);
    setHoverTime({ time: targetTime, x: relX });

    if (isScrubbing) {
      setCurrentTime(targetTime);
    }
  };

  const handleSeekPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      setIsScrubbing(false);
      const targetTime = calculateSeekTime(e.clientX);
      setCurrentTime(targetTime);
      sendIframeCommand('seekTo', [targetTime, true]);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch (_) {}
    }
  };

  // Sync like and subscription status for currently active short
  useEffect(() => {
    if (!currentShort) return;
    const shortId = currentShort.id;
    const channelKey = (currentShort as any).channelId || currentShort.channelName || 'chan-default';

    checkUserLikedVideo(shortId, currentUser?.id).then(liked => {
      setShortsList(prev => prev.map((s, idx) => idx === currentIndex ? { ...s, isLiked: liked } : s));
    }).catch(() => {});

    const effectiveViewerUid = currentUser?.id && currentUser.id !== 'guest' 
      ? currentUser.id 
      : (typeof window !== 'undefined' ? localStorage.getItem('bt_guest_viewer_id') || '' : '');

    checkUserSubscribedChannel(channelKey, currentShort.channelName, effectiveViewerUid).then(subbed => {
      setShortsList(prev => prev.map((s, idx) => idx === currentIndex ? { ...s, isSubscribed: subbed } : s));
    }).catch(() => {});
  }, [currentIndex, currentShort?.id, currentUser?.id]);

  const handleLike = () => {
    if (!currentShort) return;
    if (!currentUser || !currentUser.isLoggedIn) {
      if (onOpenLoginModal) {
        onOpenLoginModal();
      }
      return;
    }

    // 🛡️ 1 LIKE PER USER / CREATOR: If already liked, keep it liked
    if (currentShort.isLiked) {
      return;
    }

    setShortsList(prev => prev.map((s, idx) => {
      if (idx === currentIndex) {
        return {
          ...s,
          isLiked: true,
          likes: s.likes + 1,
          isDisliked: false
        };
      }
      return s;
    }));
    const channelKey = (currentShort as any).channelId || currentShort.channelName || 'chan-default';
    recordVideoLike(currentShort.id, currentShort.title, true, currentUser, channelKey);
  };

  const handleDislike = () => {
    if (!currentShort) return;
    if (!currentUser || !currentUser.isLoggedIn) {
      if (onOpenLoginModal) {
        onOpenLoginModal();
      }
      return;
    }
    const nextDisliked = !currentShort.isDisliked;
    setShortsList(prev => prev.map((s, idx) => {
      if (idx === currentIndex) {
        return {
          ...s,
          isDisliked: nextDisliked
        };
      }
      return s;
    }));
  };

  const handleToggleSubscribe = () => {
    if (!currentShort) return;

    // Resolve effective user (support logged in user, or persistent viewer fallback)
    let effectiveUser = currentUser;
    if (!effectiveUser || !effectiveUser.id || effectiveUser.id === 'guest') {
      let guestUid = '';
      try {
        guestUid = localStorage.getItem('bt_guest_viewer_id') || '';
        if (!guestUid) {
          guestUid = `viewer_${Math.random().toString(36).substring(2, 10)}`;
          localStorage.setItem('bt_guest_viewer_id', guestUid);
        }
      } catch (_) {
        guestUid = 'viewer_default';
      }
      effectiveUser = {
        id: guestUid,
        name: language === 'hi' ? 'बुंदेली दर्शक' : 'Bundeli Viewer',
        email: 'viewer@bundelitube.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        role: 'viewer',
        isLoggedIn: true,
        memberSince: '2026'
      };
    }

    const isNowSubbed = !currentShort.isSubscribed;
    const rawChanId = (currentShort as any).channelId;
    const normKey = normalizeChannelId(rawChanId, currentShort.channelName);

    setShortsList(prev => prev.map((s, idx) => {
      if (idx === currentIndex) {
        return { ...s, isSubscribed: isNowSubbed };
      }
      return s;
    }));

    const currentCount = channelSubscribersMap[normKey] || 
                         (rawChanId && channelSubscribersMap[rawChanId]) || 
                         (currentShort.channelName && channelSubscribersMap[currentShort.channelName]) || 
                         0;
    const nextCount = Math.max(0, isNowSubbed ? currentCount + 1 : currentCount - 1);

    setChannelSubscribersMap(prev => {
      return { 
        ...prev, 
        [normKey]: nextCount, 
        ...(rawChanId ? { [rawChanId]: nextCount } : {}),
        [currentShort.channelName]: nextCount 
      };
    });

    try {
      const counts = JSON.parse(localStorage.getItem('bt_channel_sub_counts') || '{}');
      counts[normKey] = nextCount;
      if (rawChanId) counts[rawChanId] = nextCount;
      if (currentShort.channelName) counts[currentShort.channelName.trim()] = nextCount;
      localStorage.setItem('bt_channel_sub_counts', JSON.stringify(counts));

      const savedSubs = JSON.parse(localStorage.getItem('bt_subscribed_channels') || '{}');
      if (isNowSubbed) {
        savedSubs[normKey] = true;
        if (rawChanId) savedSubs[rawChanId] = true;
        if (currentShort.channelName) savedSubs[currentShort.channelName.trim()] = true;
      } else {
        delete savedSubs[normKey];
        if (rawChanId) delete savedSubs[rawChanId];
        if (currentShort.channelName) delete savedSubs[currentShort.channelName.trim()];
      }
      localStorage.setItem('bt_subscribed_channels', JSON.stringify(savedSubs));
      localStorage.setItem(`bt_subs_${effectiveUser.id}`, JSON.stringify(savedSubs));
    } catch (_) {}

    // Dispatch broadcast event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bt_subscription_changed', {
        detail: {
          channelId: normKey,
          legacyChannelId: rawChanId,
          channelName: currentShort.channelName?.trim(),
          isSubscribed: isNowSubbed,
          subscribersCount: nextCount,
          userId: effectiveUser.id
        }
      }));
    }

    recordSubscription(normKey, currentShort.channelName, isNowSubbed, effectiveUser, rawChanId, nextCount);
  };

  // Helper to format short title strictly into a clean single line without hashtags (#trending, #viral, etc.) or trending words
  const formatShortTitle = (rawTitle: string) => {
    if (!rawTitle) return '';
    // Strip hashtags like #viral, #trending, #shorts, #dance, #desi, etc.
    let cleaned = rawTitle.replace(/#[\w\u0900-\u097F]+/gi, '').trim();
    // Strip standalone words like trending, viral, trend, ट्रेंडिंग, वायरल (case-insensitive)
    cleaned = cleaned.replace(/\b(trending|viral|trend)\b/gi, '').replace(/(ट्रेडिंग|वायरल)/gi, '').trim();
    // Strip "New:" prefix if present
    cleaned = cleaned.replace(/^new\s*:\s*/i, '').trim();
    // Clean up redundant spaces and trailing punctuation
    cleaned = cleaned.replace(/\s{2,}/g, ' ').replace(/[-–—|:]\s*$/, '').trim();
    return cleaned || rawTitle;
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentsText.trim()) return;

    setShortComments([
      {
        id: `c-${Date.now()}`,
        author: language === 'hi' ? 'आप (You)' : 'You',
        text: commentsText.trim(),
        time: language === 'hi' ? 'अभी' : 'Just now',
        likes: 1
      },
      ...shortComments
    ]);
    setCommentsText('');
  };

  // Ultra-responsive touch swipe handler
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchEndYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartYRef.current === null || touchEndYRef.current === null) return;
    const deltaY = touchStartYRef.current - touchEndYRef.current;
    const swipeThreshold = 25; // Lower responsive threshold for instant fast swipe

    if (deltaY > swipeThreshold) {
      // Swiped UP -> Next Short
      handleNext();
    } else if (deltaY < -swipeThreshold) {
      // Swiped DOWN -> Previous Short
      handlePrev();
    }
    touchStartYRef.current = null;
    touchEndYRef.current = null;
  };

  // Wheel scroll with quick 220ms debounce
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 220) return;
    if (e.deltaY > 20) {
      lastWheelTimeRef.current = now;
      handleNext();
    } else if (e.deltaY < -20) {
      lastWheelTimeRef.current = now;
      handlePrev();
    }
  };

  // Empty State: When no shorts have been uploaded yet
  if (!currentShort || shortsList.length === 0) {
    return (
      <div className="fixed md:static inset-0 z-50 md:z-auto bg-slate-950 flex flex-col items-center justify-center min-h-[100dvh] md:min-h-[calc(100vh-100px)] select-none overflow-hidden p-6 text-white">
        <div className="relative w-full max-w-sm p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 shadow-2xl">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title={language === 'hi' ? 'वापस जाएं' : 'Go back'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-16 h-16 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
            <Play className="w-8 h-8 fill-red-500" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100">
              {language === 'hi' ? 'कोई शॉर्ट्स उपलब्ध नहीं है' : 'No Shorts Available Yet'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              {language === 'hi'
                ? 'मंच पर अभी तक कोई शॉर्ट्स वीडियो नहीं है। अपना पहला शॉर्ट्स रील अपलोड करें।'
                : 'No short reels have been uploaded yet. Upload your first short reel!'}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            {onOpenUploadModal && (
              <button
                onClick={onOpenUploadModal}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{language === 'hi' ? 'शॉर्ट्स अपलोड करें' : 'Upload Short'}</span>
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'hi' ? 'होम पेज पर वापस जाएं' : 'Back to Home'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed md:static inset-0 z-50 md:z-auto bg-[#0f0f0f] md:bg-transparent flex flex-col md:flex-row items-center justify-center min-h-[100dvh] md:min-h-[calc(100vh-100px)] select-none overflow-hidden touch-none md:gap-5"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-2xl border border-white/15 backdrop-blur-md animate-in fade-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      {/* Container: Vertical Shorts Reel Frame (Exact YouTube Shorts Aspect & Styling) */}
      <div className="relative w-full h-full md:w-[390px] md:h-[690px] lg:w-[410px] lg:h-[730px] md:rounded-2xl overflow-hidden bg-black md:border md:border-neutral-800 flex flex-col justify-between group/short md:shadow-2xl">
        
        {/* Shorts Feed Screen: When Ad is Active -> Show Dedicated Sponsored Short Card */}
        {isAdPlaying ? (
          <SponsoredShortCard
            onAdCompleted={handleAdCompleted}
            onSkip={() => handleAdCompleted(0.20)}
            language={language}
            activeShortTitle={currentShort.title}
            creatorName={currentShort.channelName}
            recent5Watched={recent5WatchedRef.current}
          />
        ) : (
          <>
            {/* Native / YouTube Shorts Video Player (Full Screen Coverage) */}
            <div 
              onClick={handleScreenTap}
              className="absolute inset-0 w-full h-full z-0 bg-black flex items-center justify-center overflow-hidden cursor-pointer"
            >
              {resolvedYouTubeId ? (
                <iframe
                  key={resolvedYouTubeId}
                  ref={iframeRef}
                  src={`https://www.youtube.com/embed/${resolvedYouTubeId}?autoplay=1&loop=1&playlist=${resolvedYouTubeId}&playsinline=1&controls=0&enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3`}
                  title={currentShort.title}
                  className="w-full h-full border-0 pointer-events-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={nativeVideoRef}
                  key={currentShort.id}
                  src={resolvedShortStream || currentShort?.videoUrl || (currentShort as any)?.streamUrl || FALLBACK_VIDEO_STREAMS[0]}
                  autoPlay
                  loop
                  playsInline
                  muted={isMuted}
                  onError={() => {
                    if (!shortVideoError) {
                      setShortVideoError(true);
                      setResolvedShortStream(FALLBACK_VIDEO_STREAMS[0]);
                    }
                  }}
                  className="w-full h-full object-cover"
                  onTimeUpdate={(e) => {
                    const vid = e.currentTarget;
                    if (!isScrubbing && vid.duration) {
                      setCurrentTime(Math.floor(vid.currentTime));
                    }
                  }}
                />
              )}
            </div>

            {/* Double-Tap Heart Animation Overlay (YouTube Shorts Feature) */}
            {doubleTapHeart && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-300">
                <div className="p-4 rounded-full bg-black/40 backdrop-blur-sm animate-ping">
                  <Heart className="w-20 h-20 text-rose-500 fill-rose-500 drop-shadow-2xl" />
                </div>
              </div>
            )}

            {/* Center Play Indicator on Pause (Exact YouTube Shorts Overlay) */}
            {!isPlaying && !isAdPlaying && (
              <div 
                onClick={handleScreenTap}
                className="absolute inset-0 z-15 flex items-center justify-center bg-black/35 backdrop-blur-[1px] cursor-pointer"
              >
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-black/60 text-white flex items-center justify-center border border-white/20 shadow-2xl transition-transform hover:scale-105 active:scale-95">
                  <Play className="w-9 h-9 sm:w-10 sm:h-10 fill-white text-white ml-1" />
                </div>
              </div>
            )}

            {/* Top Header Controls (Exact YouTube Shorts App Style) */}
            <div className="relative z-20 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/30 to-transparent pt-safe pointer-events-none">
              <div className="flex items-center gap-2.5 pointer-events-auto">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 -ml-1 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition border border-white/10 cursor-pointer"
                    title={language === 'hi' ? 'वापस जाएँ' : 'Back'}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}

                {/* YouTube Shorts Logo Badge */}
                <div className="flex items-center gap-1.5 select-none">
                  <div className="w-6 h-6 rounded-md bg-red-600 flex items-center justify-center shadow-md">
                    <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                  </div>
                  <span className="text-white font-black text-base sm:text-lg tracking-tight drop-shadow-md">
                    Shorts
                  </span>
                </div>
              </div>

              {/* Top-Right Controls: Mute Toggle & More Options */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={toggleMute}
                  className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/10 transition cursor-pointer shadow-md"
                  title={isMuted ? (language === 'hi' ? 'आवाज़ खोलें' : 'Unmute') : (language === 'hi' ? 'म्यूट करें' : 'Mute')}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-white" />}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowMoreMenu(prev => !prev)}
                    className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/10 transition cursor-pointer shadow-md"
                    title="More options"
                  >
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>

                  {/* More Options Dropdown */}
                  {showMoreMenu && (
                    <div className="absolute right-0 top-11 w-48 bg-neutral-900/95 border border-neutral-700/80 backdrop-blur-xl rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-neutral-200 animate-in fade-in zoom-in-95">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          setShowMoreMenu(false);
                          triggerToast(language === 'hi' ? 'लिंक कॉपी हो गया!' : 'Link copied!');
                        }}
                        className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-white/10 transition text-left cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-neutral-400" />
                        <span>{language === 'hi' ? 'लिंक कॉपी करें' : 'Copy link'}</span>
                      </button>
                      <button
                        onClick={() => {
                          toggleMute();
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-white/10 transition text-left cursor-pointer"
                      >
                        {isMuted ? <Volume2 className="w-4 h-4 text-neutral-400" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
                        <span>{isMuted ? (language === 'hi' ? 'आवाज़ चालू करें' : 'Unmute') : (language === 'hi' ? 'म्यूट करें' : 'Mute')}</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowComments(true);
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-white/10 transition text-left cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-neutral-400" />
                        <span>{language === 'hi' ? 'टिप्पणियाँ देखें' : 'View comments'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Floating Action Bar (Exact YouTube Shorts Column) */}
            <div className="absolute right-2 sm:right-3 bottom-14 sm:bottom-16 z-20 flex flex-col items-center gap-3 sm:gap-4 text-white pointer-events-none">
              
              {/* Like */}
              <button
                onClick={handleLike}
                className="flex flex-col items-center gap-1 group cursor-pointer pointer-events-auto"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-lg active:scale-90 ${
                  currentShort.isLiked
                    ? 'bg-white text-black'
                    : 'bg-black/40 hover:bg-black/60 text-white'
                }`}>
                  <ThumbsUp className={`w-5 h-5 sm:w-6 sm:h-6 ${currentShort.isLiked ? 'fill-black' : ''}`} />
                </div>
                <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {currentShort.likes ? `${(currentShort.likes / 1000).toFixed(1)}K` : (language === 'hi' ? 'लाइक' : 'Like')}
                </span>
              </button>

              {/* Dislike */}
              <button
                onClick={handleDislike}
                className="flex flex-col items-center gap-1 group cursor-pointer pointer-events-auto"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-lg active:scale-90 ${
                  currentShort.isDisliked
                    ? 'bg-white text-black'
                    : 'bg-black/40 hover:bg-black/60 text-white'
                }`}>
                  <ThumbsDown className={`w-5 h-5 sm:w-6 sm:h-6 ${currentShort.isDisliked ? 'fill-black' : ''}`} />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {language === 'hi' ? 'नापसंद' : 'Dislike'}
                </span>
              </button>

              {/* Comments */}
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex flex-col items-center gap-1 group cursor-pointer pointer-events-auto"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition shadow-lg active:scale-90">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {currentShort.commentsCount || 0}
                </span>
              </button>

              {/* Share */}
              <button
                onClick={() => setIsShareOpen(true)}
                className="flex flex-col items-center gap-1 group cursor-pointer pointer-events-auto"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition shadow-lg active:scale-90">
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {language === 'hi' ? 'शेयर' : 'Share'}
                </span>
              </button>

              {/* Remix */}
              <button
                onClick={handleRemix}
                className="flex flex-col items-center gap-1 group cursor-pointer pointer-events-auto"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition shadow-lg active:scale-90">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {language === 'hi' ? 'रीमिक्स' : 'Remix'}
                </span>
              </button>

              {/* Sound Track Disc (Signature YouTube Shorts Spinning Album Cover) */}
              <div
                onClick={handleRemix}
                className="relative cursor-pointer pointer-events-auto group/disc pt-1"
                title={language === 'hi' ? 'मूल ऑडियो' : 'Original Sound'}
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border-2 border-white/60 shadow-xl bg-neutral-800 flex items-center justify-center transition-transform group-hover/disc:scale-105 ${isPlaying && !isAdPlaying ? 'animate-spin [animation-duration:5s]' : ''}`}>
                  <img
                    src={currentShort.channelAvatar || currentShort.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=100'}
                    alt="audio"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center shadow">
                  <Music className="w-2 h-2" />
                </div>
              </div>
            </div>

            {/* Bottom Overlay: Metadata, Channel, Subscribe, Audio Track (Pure YouTube Shorts Layout) */}
            <div className="relative z-20 px-3.5 sm:px-4 pt-10 pb-3 sm:pb-3.5 bg-gradient-to-t from-black/95 via-black/60 to-transparent space-y-2 max-w-[calc(100%-65px)] pointer-events-none select-none">
              
              {/* Channel Info & Subscribe */}
              <div className="flex items-center gap-2.5 flex-wrap pointer-events-auto">
                <div
                  onClick={() => setChannelModal({
                    channelName: currentShort.channelName,
                    channelId: (currentShort as any).channelId,
                    channelAvatar: currentShort.channelAvatar
                  })}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition group/chan select-none"
                  title={language === 'hi' ? `${currentShort.channelName} चैनल देखें` : `View ${currentShort.channelName}`}
                >
                  <img
                    src={currentShort.channelAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={currentShort.channelName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30 shadow-md group-hover/chan:ring-white transition shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-white text-xs sm:text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate block max-w-[130px] sm:max-w-[170px]">
                      @{currentShort.channelName}
                    </span>
                    <span className="text-[10px] text-white/80 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] block">
                      {getSubscribersText((currentShort as any).channelId, currentShort.channelName)}
                    </span>
                  </div>
                </div>

                {/* YouTube Subscribe Pill */}
                <button
                  onClick={handleToggleSubscribe}
                  className={`text-xs transition-all shadow-md shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                    currentShort.isSubscribed
                      ? 'bg-white/20 hover:bg-white/30 text-white font-medium px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10'
                      : 'bg-white hover:bg-white/90 text-black font-bold px-3.5 py-1.5 rounded-full'
                  }`}
                >
                  {currentShort.isSubscribed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>{language === 'hi' ? 'सब्सक्राइब किया' : 'Subscribed'}</span>
                    </>
                  ) : (
                    <span>{language === 'hi' ? 'सब्सक्राइब' : 'Subscribe'}</span>
                  )}
                </button>
              </div>

              {/* Title / Description */}
              <p 
                className="text-xs sm:text-sm font-normal text-white line-clamp-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] leading-snug"
                title={formatShortTitle(currentShort.title)}
              >
                {formatShortTitle(currentShort.title)}
              </p>

              {/* Sound / Music Track Bar */}
              <div 
                onClick={handleRemix}
                className="flex items-center gap-1.5 text-white/90 text-[11px] font-medium drop-shadow-md cursor-pointer pointer-events-auto hover:text-white transition group/sound"
              >
                <Music className="w-3.5 h-3.5 text-white shrink-0 group-hover/sound:scale-110 transition" />
                <span className="truncate max-w-[200px] sm:max-w-[240px]">
                  {language === 'hi' ? `मूल ऑडियो - ${currentShort.channelName}` : `Original sound - ${currentShort.channelName}`}
                </span>
              </div>
            </div>

            {/* YouTube Shorts Pure Red Progress Line & Interactive Scrubber */}
            <div 
              ref={progressBarRef}
              onPointerDown={handleSeekPointerDown}
              onPointerMove={handleSeekPointerMove}
              onPointerUp={handleSeekPointerUp}
              onMouseLeave={() => setHoverTime(null)}
              className="absolute bottom-0 inset-x-0 h-2 group/seeker cursor-pointer z-30 flex items-end touch-none"
            >
              {/* Scrubber Hover Floating Timestamp Tooltip */}
              {hoverTime && (
                <div 
                  className="absolute -top-7 transform -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-white text-[10px] font-mono font-bold shadow-lg pointer-events-none z-40 border border-white/20 backdrop-blur-sm"
                  style={{ left: `${hoverTime.x}px` }}
                >
                  {formatTime(hoverTime.time)}
                </div>
              )}

              {/* Red Background Track */}
              <div className="relative w-full h-[2.5px] group-hover/short:h-[4px] bg-white/20 transition-all">
                {/* Pure YouTube Red Active Track */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-[#ff0000] shadow-sm transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, (currentTime / durationSeconds) * 100))}%` }}
                />

                {/* Red Round Knob */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#ff0000] border border-white shadow-lg opacity-0 group-hover/short:opacity-100 group-hover/seeker:scale-125 transition-all pointer-events-none z-40"
                  style={{ left: `${Math.max(0, Math.min(100, (currentTime / durationSeconds) * 100))}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop Chevrons Navigation (YouTube Web Style Beside Reel) */}
      <div className="hidden md:flex flex-col gap-3 z-20">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-neutral-900/90 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-xl border border-neutral-700/80 transition cursor-pointer active:scale-95"
          title={language === 'hi' ? 'पिछला शॉर्ट (↑)' : 'Previous Short (↑)'}
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-white flex items-center justify-center shadow-xl border border-neutral-700/80 transition cursor-pointer active:scale-95"
          title={language === 'hi' ? 'अगला शॉर्ट (↓)' : 'Next Short (↓)'}
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Slide-out Comments Drawer (Mobile and Desktop Friendly) */}
      {showComments && (
        <div className="fixed sm:absolute bottom-0 inset-x-0 sm:inset-x-auto sm:right-6 sm:bottom-12 sm:w-96 max-h-[75vh] sm:max-h-[500px] bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl z-50 space-y-3 animate-in slide-in-from-bottom text-slate-100 pb-safe">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-xs flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'टिप्पणियाँ (Comments)' : 'Comments'}</span>
            </h4>
            <button onClick={() => setShowComments(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-slate-800/60 pr-1">
            {shortComments.map((c) => (
              <div key={c.id} className="pt-2 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="font-bold text-slate-200">{c.author}</span>
                  <span>{c.time}</span>
                </div>
                <p className="text-slate-300 text-[11px] mt-0.5">{c.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder={language === 'hi' ? 'टिप्पणी जोड़ें...' : 'Add a comment...'}
              value={commentsText}
              onChange={(e) => setCommentsText(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!commentsText.trim()}
              className="p-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        video={{
          id: currentShort.id,
          title: currentShort.title,
          description: currentShort.soundTitle,
          youtubeId: currentShort.youtubeId,
          thumbnail: currentShort.thumbnail,
          category: 'shorts',
          artist: currentShort.channelName,
          channelId: 'short-ch',
          channelName: currentShort.channelName,
          channelAvatar: currentShort.channelAvatar,
          views: currentShort.likes * 12,
          likes: currentShort.likes,
          duration: '0:58',
          uploadDate: 'आज',
          tags: ['shorts', 'bundeli']
        }}
        language={language}
      />

      {/* Full Channel Profile Modal */}
      {channelModal && (
        <ChannelProfileModal
          isOpen={Boolean(channelModal)}
          onClose={() => setChannelModal(null)}
          channelName={channelModal.channelName}
          channelId={channelModal.channelId}
          channelAvatar={channelModal.channelAvatar}
          allVideos={allVideos || []}
          allShorts={shortsList}
          onSelectVideo={(v) => {
            setChannelModal(null);
            if (onSelectVideo) {
              onSelectVideo(v);
            }
          }}
          onSelectShort={(s) => {
            const idx = shortsList.findIndex(item => item.id === s.id);
            if (idx >= 0) {
              setCurrentIndex(idx);
            }
            setChannelModal(null);
          }}
          currentUser={currentUser}
          language={language}
          onOpenLoginModal={onOpenLoginModal}
        />
      )}
    </div>
  );
};


