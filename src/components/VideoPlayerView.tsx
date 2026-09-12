import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  ArrowLeft,
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Download, 
  Headphones, 
  Sparkles, 
  CheckCircle2, 
  IndianRupee, 
  MessageSquare, 
  Send, 
  Flame, 
  Clock, 
  Eye, 
  Check, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  RotateCcw, 
  RotateCw,
  FastForward, 
  Rewind, 
  Settings,
  Settings2, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  SkipForward, 
  SkipBack,
  FolderPlus,
  Heart,
  Scissors,
  FileText,
  Megaphone,
  SlidersHorizontal,
  Sliders,
  Moon,
  Subtitles,
  Repeat,
  Timer,
  ChevronRight,
  Gauge,
  Tv,
  Lock,
  Coins,
  TrendingUp,
  ExternalLink,
  WifiOff,
  Trash2,
  Loader2
} from 'lucide-react';
import { Video, Comment, UserAccount } from '../types';
import { SAMPLE_COMMENTS } from '../data/mockData';
import { BundeliLogo } from './BundeliLogo';
import { Language, translations } from '../locales/i18n';
import { ShareModal } from './ShareModal';
import { SaveToPlaylistModal } from './SaveToPlaylistModal';
import { SuperThanksModal } from './SuperThanksModal';
import { 
  resolvePlayableStreamUrl, 
  isDeviceOnline, 
  isOfflineVideoDownloaded, 
  downloadVideoFile, 
  removeDownloadedVideoFromStorage, 
  FALLBACK_VIDEO_STREAMS 
} from '../services/videoCache';
import { AdOverlay, SPONSOR_ADS } from './AdOverlay';
import { AD_POOL, AdPoolItem, ActiveAdQueueItem } from './MonetizedVideoScreen';
import { processInStreamVideoAdRevenue, recordLongVideoAdImpression, RevenueTransactionRecord } from '../lib/revenueService';
import { VideoPlayerAdMobUnit } from './VideoPlayerAdMobUnit';
import { isSelfViewFraud } from '../lib/monetizationSecurity';
import { 
  recordVideoView, 
  recordVideoLike, 
  recordSubscription, 
  saveCommentToFirestore,
  checkUserLikedVideo,
  checkUserSubscribedChannel,
  normalizeChannelId,
  getFirestoreSafe,
  doc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from '../lib/firebase';
import { ChannelProfileModal } from './ChannelProfileModal';

interface VideoPlayerViewProps {
  video: Video;
  allVideos: Video[];
  onClose: () => void;
  onMinimize?: () => void;
  onSelectVideo: (video: Video) => void;
  currentUser: UserAccount | null;
  onOpenCopyrightModal: (video: Video) => void;
  language: Language;
  onAdImpressionCredited?: (info: { impressionValue: number; creatorShare: number; videoId: string }) => void;
  initialExpandComments?: boolean;
  onOpenLoginModal?: () => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  video,
  allVideos,
  onClose,
  onMinimize,
  onSelectVideo,
  currentUser,
  onOpenCopyrightModal,
  language,
  onAdImpressionCredited,
  initialExpandComments = false,
  onOpenLoginModal
}) => {
  const t = translations[language];

  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [likes, setLikes] = useState(video.likes);
  const [hasLiked, setHasLiked] = useState<boolean>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bt_liked_videos') || '{}');
      return Boolean(saved[video.id]);
    } catch (_) {
      return false;
    }
  });
  const [hasDisliked, setHasDisliked] = useState(false);

  const effectiveChannelId = normalizeChannelId(video.channelId, video.channelName);

  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bt_subscribed_channels') || '{}');
      return Boolean(
        saved[effectiveChannelId] || 
        (video.channelId && saved[video.channelId]) || 
        (video.channelName && saved[video.channelName.trim()])
      );
    } catch (_) {
      return false;
    }
  });
  const [subscribersCount, setSubscribersCount] = useState<number>(() => {
    try {
      const savedChannels = localStorage.getItem('bt_channels_v2');
      if (savedChannels) {
        const parsed = JSON.parse(savedChannels);
        const matched = parsed.find((c: any) => c.id === effectiveChannelId || c.id === video.channelId || c.name === video.channelName);
        if (matched && typeof matched.subscribers === 'number') return Math.max(0, matched.subscribers);
      }
    } catch (_) {}
    return (video as any).subscribers || (video as any).channelSubscribers || 0;
  });

  // Sync subscription updates across app views in real-time
  useEffect(() => {
    const handleSubChanged = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      const matches = 
        detail.channelId === effectiveChannelId ||
        detail.channelName === video.channelName?.trim() ||
        (video.channelId && detail.legacyChannelId === video.channelId);

      if (matches) {
        setIsSubscribed(Boolean(detail.isSubscribed));
        if (typeof detail.subscribersCount === 'number') {
          setSubscribersCount(detail.subscribersCount);
        }
      }
    };

    window.addEventListener('bt_subscription_changed', handleSubChanged);
    return () => window.removeEventListener('bt_subscription_changed', handleSubChanged);
  }, [effectiveChannelId, video.channelName, video.channelId]);
  const [isOnline, setIsOnline] = useState<boolean>(isDeviceOnline());
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isOfflineBlocked, setIsOfflineBlocked] = useState(false);
  const [channelModal, setChannelModal] = useState<{ channelName: string; channelId?: string; channelAvatar?: string } | null>(null);
  
  // Player Source Identification
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const nativeVideoRef = useRef<HTMLVideoElement>(null);
  const isYouTubeVideo = Boolean(
    (video.youtubeId && video.youtubeId.match(/^[a-zA-Z0-9_-]{11}$/)) ||
    video.sourceType === 'youtube'
  );
  const isDirectVideo = !isYouTubeVideo && Boolean(
    video.sourceType === 'direct_upload' ||
    Boolean(video.streamUrl) ||
    Boolean(video.directFileUrl)
  );
  const isDirectTelegramVideo = isDirectVideo;

  // Video Ad Monetization State (Disabled for YouTube videos so full YouTube player is unhindered)
  const [isAdPlaying, setIsAdPlaying] = useState(false);

  const [resolvedStream, setResolvedStream] = useState<string>(video.streamUrl || '');
  const [videoLoadError, setVideoLoadError] = useState(false);

  const [selectedPartIndex, setSelectedPartIndex] = useState<number>(0);

  // Online / Offline network status listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsOfflineBlocked(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if video is downloaded
  useEffect(() => {
    isOfflineVideoDownloaded(video.id).then(res => {
      setIsDownloaded(res);
    });

    const handleDownloadsUpdated = () => {
      isOfflineVideoDownloaded(video.id).then(res => {
        setIsDownloaded(res);
      });
    };
    window.addEventListener('bundelitube_downloads_updated', handleDownloadsUpdated);
    return () => {
      window.removeEventListener('bundelitube_downloads_updated', handleDownloadsUpdated);
    };
  }, [video.id]);

  useEffect(() => {
    setSelectedPartIndex(0);
  }, [video.id]);

  useEffect(() => {
    let isCancelled = false;
    resolvePlayableStreamUrl({
      id: video.id,
      streamUrl: video.streamUrl,
      videoUrl: (video as any).videoUrl || video.directFileUrl,
      youtubeId: video.youtubeId,
      directFileUrl: video.directFileUrl
    }).then((res) => {
      if (!isCancelled) {
        if (res.isOfflineNotDownloaded) {
          setIsOfflineBlocked(true);
          setResolvedStream('');
        } else if (res.url) {
          setIsOfflineBlocked(false);
          setResolvedStream(res.url);
          setVideoLoadError(false);
        }
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [video.id, video.streamUrl, (video as any).videoUrl, video.directFileUrl, video.youtubeId, isOnline]);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isSuperThanksModalOpen, setIsSuperThanksModalOpen] = useState(false);
  
  // Bottom Sheet Settings Popup State
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [settingsSheetTab, setSettingsSheetTab] = useState<'main' | 'quality' | 'captions' | 'speed' | 'timer' | 'rotate'>('main');
  const [captionsLang, setCaptionsLang] = useState<'off' | 'bundeli' | 'hindi' | 'english'>('off');
  const [isLooping, setIsLooping] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  // Video Rotation State (0, 90, 180, 270 degrees)
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [rotationToast, setRotationToast] = useState<string | null>(null);

  const [quality, setQuality] = useState<string>('Auto (1080p)');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(initialExpandComments);
  const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');
  
  // Swipe / Drag Down to Minimize Gesture State
  const touchStartYRef = useRef<number | null>(null);
  const touchDeltaYRef = useRef<number>(0);
  const [dragOffsetY, setDragOffsetY] = useState<number>(0);

  const handlePlayerTouchStart = (e: React.TouchEvent) => {
    // If target is inside interactive buttons, do not start drag
    if ((e.target as HTMLElement).closest('button, input, a, [role="button"]')) {
      return;
    }
    touchStartYRef.current = e.touches[0].clientY;
    touchDeltaYRef.current = 0;
  };

  const handlePlayerTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - touchStartYRef.current;
    if (delta > 0) {
      touchDeltaYRef.current = delta;
      setDragOffsetY(Math.min(delta, 140));
    }
  };

  const handlePlayerTouchEnd = () => {
    if (touchDeltaYRef.current > 70 && onMinimize) {
      onMinimize();
    }
    touchStartYRef.current = null;
    touchDeltaYRef.current = 0;
    setDragOffsetY(0);
  };

  // Double-tap seek state
  const [seekRipple, setSeekRipple] = useState<{ side: 'left' | 'right'; seconds: number } | null>(null);
  const lastTapRef = useRef<{ time: number; side: 'left' | 'right' } | null>(null);
  const rippleTimerRef = useRef<any>(null);

  // Duration & Progress State (YouTube style red scrubber line)
  const parseDuration = (dur: any): number => {
    if (!dur) return 300; // default 5 minutes
    if (typeof dur === 'number' && !isNaN(dur) && dur > 0) return Math.floor(dur);
    const str = String(dur).trim();
    if (!str) return 300;

    // Direct pure numbers check (e.g. "300" seconds)
    if (/^\d+$/.test(str)) {
      const num = parseInt(str, 10);
      return num > 0 ? num : 300;
    }

    // Standard timestamp check MM:SS or HH:MM:SS
    if (str.includes(':')) {
      const parts = str.split(':').map(p => parseInt(p.trim(), 10) || 0);
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      }
      if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }

    // Handles textual duration like "5 min", "5 mins", "5m", "5m 30s", "5:00 min"
    let total = 0;
    const hourMatch = str.match(/(\d+)\s*(?:h|hr|hour|hours)/i);
    const minMatch = str.match(/(\d+)\s*(?:m|min|mins|minute|minutes)/i);
    const secMatch = str.match(/(\d+)\s*(?:s|sec|secs|second|seconds)/i);

    if (hourMatch) total += parseInt(hourMatch[1], 10) * 3600;
    if (minMatch) total += parseInt(minMatch[1], 10) * 60;
    if (secMatch) total += parseInt(secMatch[1], 10);

    if (total > 0) return total;

    // Fallback: extract leading number as minutes if present
    const leadingNum = parseInt(str, 10);
    if (!isNaN(leadingNum) && leadingNum > 0) {
      return leadingNum * 60;
    }

    return 300;
  };

  const formatTime = (sec: number): string => {
    if (isNaN(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const durationSeconds = parseDuration(video.duration);
  const [nativeDuration, setNativeDuration] = useState<number | null>(null);
  const effectiveDurationSeconds = nativeDuration || durationSeconds;
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [hoverTime, setHoverTime] = useState<{ time: number; x: number } | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Dynamic Mid-Roll Ad Cue Points (Every 2 minutes: 120s, 240s, 360s, 480s, etc.)
  const adCuePoints = useMemo(() => {
    const cues: number[] = [];
    const intervalSeconds = 120; // Exact 2 minutes
    
    // Add ad breaks every 2 minutes (120s) as long as it's not within the last 15 seconds of the video
    for (let time = intervalSeconds; time < durationSeconds - 15; time += intervalSeconds) {
      cues.push(time);
    }
    return cues;
  }, [durationSeconds]);

  const [triggeredAdBreaks, setTriggeredAdBreaks] = useState<Set<number>>(new Set());
  const [currentAdContext, setCurrentAdContext] = useState<{ type: 'pre-roll' | 'mid-roll' | 'post-roll'; pauseTimestamp?: string }>({
    type: 'pre-roll'
  });
  const postRollTriggeredRef = useRef<boolean>(false);

  // ==========================================
  // MULTI-AD ENGINE & IN-STREAM AD STATES
  // ==========================================
  const [isUILocked, setIsUILocked] = useState<boolean>(false);
  const [adQueue, setAdQueue] = useState<ActiveAdQueueItem[]>([]);
  const [currentAdItem, setCurrentAdItem] = useState<ActiveAdQueueItem | null>(null);
  const [isAdContainerOpen, setIsAdContainerOpen] = useState<boolean>(false);

  const adVideoRef = useRef<HTMLVideoElement>(null);
  const [isAdVideoPlaying, setIsAdVideoPlaying] = useState(false);
  const [adCurrentTime, setAdCurrentTime] = useState(0);
  const [adDuration, setAdDuration] = useState(15);
  const [isAdMuted, setIsAdMuted] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [nonSkipRemaining, setNonSkipRemaining] = useState(8);
  const [lastSplitRecord, setLastSplitRecord] = useState<RevenueTransactionRecord | null>(null);

  // Helper to build Ad Queue (supports dynamic 1 or 2 ads, skippable or non-skippable YouTube-like formats)
  const createAdQueue = (triggerType: 'pre-roll' | 'mid-roll' | 'post-roll', cueTime?: number): ActiveAdQueueItem[] => {
    let pool: AdPoolItem[] = [...AD_POOL];

    // Load admin custom ads if configured
    try {
      const savedConfigStr = localStorage.getItem('bt_remote_config');
      if (savedConfigStr) {
        const parsed = JSON.parse(savedConfigStr);
        if (parsed.customVideoAds && Array.isArray(parsed.customVideoAds)) {
          const activeCustomAds: AdPoolItem[] = parsed.customVideoAds
            .filter((c: any) => c.isActive && c.videoUrl)
            .map((c: any) => ({
              id: c.id || `ad-custom-${Math.random()}`,
              brandName: c.sponsorName || 'प्रायोजक',
              title: c.title,
              description: 'बुन्देलीट्यूब सत्यापित विज्ञापनदाता',
              videoUrl: c.videoUrl,
              ctaText: c.ctaText || 'अभी देखें',
              ctaLink: c.ctaUrl || 'https://bundelkhand.gov.in',
              durationSeconds: c.durationSeconds || 15,
              format: Math.random() < 0.65 ? ('skippable' as const) : ('non_skippable' as const),
              totalAdValue: 1.50,
              badgeText: 'प्रायोजित विज्ञापन',
              sponsorAvatar: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=100&auto=format&fit=crop&q=60'
            }));

          if (activeCustomAds.length > 0) {
            pool = [...activeCustomAds, ...pool];
          }
        }
      }
    } catch {
      // ignore
    }

    // Dynamic 1 or 2 Ads: 50% probability of double ad (Ad 1 of 2), 50% probability of single ad
    const isDoubleAd = Math.random() < 0.50;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    
    // Randomize skippable vs non-skippable format per ad slot dynamically (YouTube style)
    const format1 = Math.random() < 0.70 ? 'skippable' : 'non_skippable';
    const rawAd1 = shuffled[0] || pool[0] || AD_POOL[0];
    const ad1: AdPoolItem = {
      ...rawAd1,
      format: format1 as 'skippable' | 'non_skippable',
      durationSeconds: format1 === 'non_skippable' ? (Math.random() < 0.5 ? 6 : 10) : (rawAd1.durationSeconds || 15)
    };

    if (isDoubleAd) {
      const format2 = Math.random() < 0.60 ? 'skippable' : 'non_skippable';
      const rawAd2 = shuffled[1] || pool[1] || AD_POOL[1] || ad1;
      const ad2: AdPoolItem = {
        ...rawAd2,
        format: format2 as 'skippable' | 'non_skippable',
        durationSeconds: format2 === 'non_skippable' ? (Math.random() < 0.5 ? 6 : 8) : (rawAd2.durationSeconds || 15)
      };

      return [
        { ad: ad1, queueIndex: 1, totalInQueue: 2, triggerType, timestamp: cueTime },
        { ad: ad2, queueIndex: 2, totalInQueue: 2, triggerType, timestamp: cueTime }
      ];
    } else {
      return [
        { ad: ad1, queueIndex: 1, totalInQueue: 1, triggerType, timestamp: cueTime }
      ];
    }
  };

  /**
   * Google AdMob Policy Compliance: Do not interrupt or lock video player.
   * Ads are served in compliant, designated placements below the player and in recommended feeds.
   */
  const triggerAdBreak = (triggerType: 'pre-roll' | 'mid-roll' | 'post-roll', cueTime?: number) => {
    return;
  };

  /**
   * Ad playback and revenue crediting when current ad changes
   */
  useEffect(() => {
    if (!currentAdItem || !isAdContainerOpen) return;

    const ad = currentAdItem.ad;
    const dur = ad.durationSeconds || 15;
    setAdDuration(dur);
    setAdCurrentTime(0);
    setSkipCountdown(5);
    setCanSkip(false);
    setNonSkipRemaining(dur);
    setIsAdVideoPlaying(true);

    // Auto-play Ad Video with sound
    if (adVideoRef.current) {
      adVideoRef.current.currentTime = 0;
      adVideoRef.current.muted = isAdMuted;
      adVideoRef.current.play().catch(e => {
        console.warn('Ad video autoplay policy note:', e);
        if (adVideoRef.current) {
          adVideoRef.current.muted = true;
          setIsAdMuted(true);
          adVideoRef.current.play().catch(() => {});
        }
      });
    }

    // Process 50:50 Revenue Split for this In-Stream Ad Impression
    const formatType = currentAdItem.totalInQueue === 2
      ? (currentAdItem.queueIndex === 1 ? 'double_ad_first' : 'double_ad_second')
      : (ad.format === 'skippable' ? 'skippable' : 'non_skippable');

    // 🛡️ ANTI-FRAUD & SELF-VIEW CHECK:
    // If the viewer is the creator or channel owner of this video,
    // do NOT count ad impression or trigger monetization revenue.
    const isSelf = isSelfViewFraud(currentUser?.id, video, (currentUser as any)?.channelId);
    if (isSelf) {
      console.warn(`[AntiFraud] Self-view detected on video ${video.id} by creator ${currentUser?.id}. Ad impression and monetization skipped.`);
      return;
    }

    // 1. Requirement: LONG VIDEO ADS:
    // When a user watches a long video and a video-watch ad successfully loads and shows (Ad Impression),
    // update Firebase for that specific video's creator by incrementing total_long_impressions by +1.
    const targetCreatorId = video.creatorId || video.channelId || 'creator-1';
    recordLongVideoAdImpression({
      videoId: video.id,
      creatorId: targetCreatorId,
      channelId: video.channelId || targetCreatorId,
      channelName: video.channelName || video.artist || 'चैनल',
      sponsorBrand: ad.brandName,
      adFormat: formatType,
      viewerUserId: currentUser?.id,
      viewerChannelId: (currentUser as any)?.channelId,
      isSelfView: false
    }).catch(e => console.warn('recordLongVideoAdImpression call warning:', e));

    processInStreamVideoAdRevenue({
      totalAmount: ad.totalAdValue,
      creatorId: targetCreatorId,
      creatorName: video.artist || video.channelName || 'कलाकार',
      channelName: video.channelName || video.artist || 'चैनल',
      videoId: video.id,
      sponsorBrand: ad.brandName,
      adFormat: formatType,
      viewerUserId: currentUser?.id,
      viewerChannelId: (currentUser as any)?.channelId,
      isSelfView: false
    }).then(splitRecord => {
      setLastSplitRecord(splitRecord);
      if (onAdImpressionCredited) {
        setTimeout(() => {
          onAdImpressionCredited({
            impressionValue: ad.totalAdValue,
            creatorShare: Number((ad.totalAdValue * 0.50).toFixed(2)),
            videoId: video.id
          });
        }, 0);
      }
    }).catch(err => {
      console.warn('InStream ad revenue split warning:', err);
    });
  }, [currentAdItem, isAdContainerOpen, video.id, video.creatorId, video.channelId, video.artist, video.channelName, video.title, currentUser, onAdImpressionCredited]);

  /**
   * Ad countdown and timer tick
   */
  useEffect(() => {
    if (!isAdContainerOpen || !currentAdItem) return;

    const timer = setInterval(() => {
      setAdCurrentTime(prev => {
        const next = prev + 1;

        if (currentAdItem.ad.format === 'skippable') {
          const remainingSkip = Math.max(0, 5 - next);
          setSkipCountdown(remainingSkip);
          if (remainingSkip === 0) {
            setCanSkip(true);
          }
        } else {
          const remaining = Math.max(0, adDuration - next);
          setNonSkipRemaining(remaining);
        }

        if (next >= adDuration) {
          handleNextAdOrFinish();
          return adDuration;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAdContainerOpen, currentAdItem, adDuration]);

  /**
   * Handle Next Ad in Queue or Finish Ad Break
   */
  const handleNextAdOrFinish = () => {
    if (!currentAdItem) return;

    if (currentAdItem.queueIndex === 1 && currentAdItem.totalInQueue === 2 && adQueue[1]) {
      console.log('[VideoPlayerAdEngine] Advancing to Ad 2 of 2');
      setCurrentAdItem(adQueue[1]);
    } else {
      finishAdBreak();
    }
  };

  /**
   * Skip Ad action handler
   */
  const handleSkipAd = () => {
    if (!canSkip) return;
    console.log('[VideoPlayerAdEngine] User skipped ad');
    handleNextAdOrFinish();
  };

  /**
   * Unmount/hide Ad Container, unlock UI, and resume YouTube Player
   */
  const finishAdBreak = () => {
    console.log('[VideoPlayerAdEngine] Ad break finished. Unmounting Ad container and resuming YouTube playback.');

    if (adVideoRef.current) {
      adVideoRef.current.pause();
    }

    setIsAdContainerOpen(false);
    setIsAdPlaying(false);
    setCurrentAdItem(null);
    setAdQueue([]);
    setIsUILocked(false);

    // Resume YouTube / Video playback from exact paused second
    if (isDirectTelegramVideo && nativeVideoRef.current) {
      nativeVideoRef.current.play().catch(() => {});
    } else {
      sendIframeCommand('playVideo');
    }
    setIsPlaying(true);
  };

  const sendIframeCommand = (func: string, args: any[] = []) => {
    if (isDirectTelegramVideo && nativeVideoRef.current) {
      if (func === 'playVideo') nativeVideoRef.current.play().catch(() => {});
      else if (func === 'pauseVideo') nativeVideoRef.current.pause();
      else if (func === 'mute') nativeVideoRef.current.muted = true;
      else if (func === 'unMute') nativeVideoRef.current.muted = false;
      else if (func === 'seekTo' && typeof args[0] === 'number') nativeVideoRef.current.currentTime = args[0];
      return;
    }

    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: func,
          args: args
        }),
        '*'
      );
    }
  };

  const togglePlay = () => {
    if (isDirectTelegramVideo && nativeVideoRef.current) {
      if (isPlaying) {
        nativeVideoRef.current.pause();
        setIsPlaying(false);
      } else {
        nativeVideoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      triggerControls();
      return;
    }

    if (isPlaying) {
      sendIframeCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      sendIframeCommand('playVideo');
      setIsPlaying(true);
    }
    triggerControls();
  };

  const toggleMute = () => {
    if (isDirectTelegramVideo && nativeVideoRef.current) {
      nativeVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      return;
    }

    if (isMuted) {
      sendIframeCommand('unMute');
      setIsMuted(false);
    } else {
      sendIframeCommand('mute');
      setIsMuted(true);
    }
  };

  const handleSeek = (seconds: number) => {
    const clamped = Math.max(0, Math.min(seconds, durationSeconds));
    const prevTime = currentTime;
    setCurrentTime(clamped);
    if (isDirectTelegramVideo && nativeVideoRef.current) {
      nativeVideoRef.current.currentTime = clamped;
    } else {
      sendIframeCommand('seekTo', [clamped, true]);
    }

    // Check if skipped/jumped across an untriggered mid-roll cue
    const hitCue = adCuePoints.find(cue => cue <= clamped && cue >= prevTime && !triggeredAdBreaks.has(cue));
    if (hitCue !== undefined) {
      setTriggeredAdBreaks(old => new Set(old).add(hitCue));
      triggerAdBreak('mid-roll', hitCue);
    }

    triggerControls();
  };

  const handleSeekRelative = (deltaSeconds: number) => {
    setCurrentTime(prev => {
      const target = Math.max(0, Math.min(prev + deltaSeconds, durationSeconds));
      if (isDirectTelegramVideo && nativeVideoRef.current) {
        nativeVideoRef.current.currentTime = target;
      } else {
        sendIframeCommand('seekTo', [target, true]);
      }

      if (deltaSeconds > 0) {
        const hitCue = adCuePoints.find(cue => cue <= target && cue >= prev && !triggeredAdBreaks.has(cue));
        if (hitCue !== undefined) {
          setTriggeredAdBreaks(old => new Set(old).add(hitCue));
          triggerAdBreak('mid-roll', hitCue);
        }
      }

      return target;
    });
    triggerControls();
  };

  const isShortItem = (v: Video) => Boolean(v.isShort || v.videoType === 'short' || v.category === 'shorts');
  const longVideosOnly = allVideos.filter(v => !isShortItem(v));
  const relatedVideos = longVideosOnly.filter(v => v.id !== video.id).slice(0, 10);
  const currentIndex = longVideosOnly.findIndex(v => v.id === video.id);
  const hasNext = currentIndex !== -1 && currentIndex < longVideosOnly.length - 1;
  const hasPrev = currentIndex > 0;

  const playNext = () => {
    if (hasNext && currentIndex !== -1) {
      onSelectVideo(longVideosOnly[currentIndex + 1]);
    }
  };

  const playPrev = () => {
    if (hasPrev && currentIndex !== -1) {
      onSelectVideo(longVideosOnly[currentIndex - 1]);
    }
  };

  useEffect(() => {
    setCurrentTime(0);
    setTriggeredAdBreaks(new Set());
    postRollTriggeredRef.current = false;
    setCurrentAdContext({ type: 'pre-roll' });
    setIsDescriptionExpanded(false);
    setIsCommentsExpanded(initialExpandComments);

    // Trigger starting Pre-Roll Ad immediately on video load
    triggerAdBreak('pre-roll', 0);

    // Record video view to Firebase & update watch history (with anti-fraud self-view block)
    recordVideoView(
      { 
        id: video.id, 
        title: video.title, 
        channelName: video.channelName, 
        channelId: video.channelId,
        creatorId: video.creatorId,
        creatorUid: (video as any).creatorUid,
        ownerUid: (video as any).ownerUid
      },
      currentUser
    );

    // Check if user has already liked this video or subscribed to channel (Firestore + local cache)
    checkUserLikedVideo(video.id, currentUser?.id).then(liked => {
      setHasLiked(liked);
    }).catch(() => {});

    checkUserSubscribedChannel(video.channelId || 'chan-main', currentUser?.id).then(sub => {
      setIsSubscribed(sub);
    }).catch(() => {});

    // Real-time channel subscribers listener from Firestore
    let unsubscribeChannel: (() => void) | undefined;
    let unsubscribeComments: (() => void) | undefined;
    if (video.channelId) {
      try {
        const db = getFirestoreSafe();
        unsubscribeChannel = onSnapshot(doc(db, 'channels', video.channelId), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (typeof data.subscribers === 'number') {
              setSubscribersCount(data.subscribers);
            }
          }
        }, () => {});
      } catch (_) {}
    }

    // Real-time Firestore comments listener for this video
    try {
      const db = getFirestoreSafe();
      // Query comments by videoId without compound orderBy to avoid Firestore index errors
      const commentsQuery = query(
        collection(db, 'comments'),
        where('videoId', '==', video.id)
      );
      unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
        if (!snapshot.empty) {
          const liveComments: Comment[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            liveComments.push({
              id: docSnap.id,
              videoId: d.videoId || video.id,
              author: d.author || d.userName || 'बुंदेली दर्शक',
              avatar: d.avatar || d.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              text: d.text || d.message || d.sms || '',
              timestamp: d.timestamp || (d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'अभी-अभी'),
              likes: d.likes || 0,
              userLiked: d.userLiked ?? false
            });
          });
          // Client-side sort by newest first
          liveComments.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime() || 0;
            const timeB = new Date(b.timestamp).getTime() || 0;
            return timeB - timeA;
          });
          setComments(liveComments);
        }
      }, (err) => {
        console.warn('Comments listener note:', err);
      });
    } catch (e) {
      console.warn('Firestore comments fallback:', e);
    }

    return () => {
      if (unsubscribeChannel) unsubscribeChannel();
      if (unsubscribeComments) unsubscribeComments();
    };
  }, [video.id, currentUser?.id]);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying && !isAdPlaying && !isScrubbing && !isUILocked) {
      interval = setInterval(() => {
        let midRollCueToTrigger: number | null = null;
        let postRollToTrigger = false;
        let nextVideoToPlay = false;

        setCurrentTime(prev => {
          const nextTime = prev + 1;

          // Check for Mid-Roll Cues without duplicate loop re-triggering
          const hitCue = adCuePoints.find(cue => {
            return nextTime >= cue && prev < cue && !triggeredAdBreaks.has(cue);
          });

          if (hitCue !== undefined) {
            midRollCueToTrigger = hitCue;
            return hitCue;
          }

          // Check for Post-Roll on duration end
          if (nextTime >= durationSeconds && !postRollTriggeredRef.current) {
            postRollTriggeredRef.current = true;
            postRollToTrigger = true;
            return durationSeconds;
          }

          if (nextTime >= durationSeconds) {
            if (autoPlayNext && hasNext) {
              nextVideoToPlay = true;
            }
            return durationSeconds;
          }
          return nextTime;
        });

        // Safely execute state updates and parent notifications outside of setCurrentTime updater
        if (midRollCueToTrigger !== null) {
          const cue = midRollCueToTrigger;
          setTimeout(() => {
            setTriggeredAdBreaks(old => new Set(old).add(cue));
            triggerAdBreak('mid-roll', cue);
          }, 0);
        } else if (postRollToTrigger) {
          setTimeout(() => {
            triggerAdBreak('post-roll', durationSeconds);
          }, 0);
        } else if (nextVideoToPlay) {
          setTimeout(() => {
            playNext();
          }, 0);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isAdPlaying, isScrubbing, isUILocked, durationSeconds, autoPlayNext, hasNext, adCuePoints, triggeredAdBreaks]);

  const calculateSeekTime = (clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return pos * durationSeconds;
  };

  const handleProgressPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsScrubbing(true);
    triggerControls();
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch (_) {}
    const targetTime = calculateSeekTime(e.clientX);
    setCurrentTime(targetTime);
  };

  const handleProgressPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const tTime = pos * durationSeconds;
      setHoverTime({ time: tTime, x: e.clientX - rect.left });
    }
    if (isScrubbing) {
      const targetTime = calculateSeekTime(e.clientX);
      setCurrentTime(targetTime);
    }
  };

  const handleProgressPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      setIsScrubbing(false);
      const targetTime = calculateSeekTime(e.clientX);
      handleSeek(targetTime);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch (_) {}
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const triggerControls = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isAdPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  const handlePlayerSurfaceClick = (e: React.MouseEvent) => {
    // If clicked on an interactive button, scrubber or link, don't toggle
    if ((e.target as HTMLElement).closest('button, input, a, [role="button"], .group\\/seeker')) {
      return;
    }
    if (showControls) {
      setShowControls(false);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      setShowControls(true);
      triggerControls();
    }
  };

  const handleRotateVideo = () => {
    setRotationDeg(prev => {
      // Toggle between 0 (normal portrait) and 90 (full rotated landscape)
      const next = prev === 0 ? 90 : (prev === 90 ? 270 : 0);
      const toastText = next === 0 
        ? (language === 'hi' ? 'सीधा प्लेयर ओरिएंटेशन (Normal)' : 'Standard Orientation (0°)') 
        : (next === 90 
            ? (language === 'hi' ? 'पूरा प्लेयर लैंडस्केप रोटेट (90°)' : 'Full Player Rotated Landscape (90°)')
            : (language === 'hi' ? 'पूरा प्लेयर उल्टा रोटेट (270°)' : 'Full Player Rotated (270°)'));
      setRotationToast(toastText);
      setTimeout(() => setRotationToast(null), 2500);
      return next;
    });
  };

  const handleSetRotation = (deg: number) => {
    setRotationDeg(deg);
    const toastText = deg === 0 
      ? (language === 'hi' ? 'सीधा प्लेयर ओरिएंटेशन (Normal)' : 'Standard Orientation (0°)') 
      : `${language === 'hi' ? 'पूरा प्लेयर रोटेट किया' : 'Full Player Rotated'} ${deg}°`;
    setRotationToast(toastText);
    setTimeout(() => setRotationToast(null), 2500);
    setSettingsSheetTab('main');
  };

  // Lock scroll and handle Escape when full player is rotated
  useEffect(() => {
    if (rotationDeg !== 0) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setRotationDeg(0);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [rotationDeg]);

  const handleSetSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    sendIframeCommand('setPlaybackRate', [speed]);
    setSettingsSheetTab('main');
  };

  // Sleep Timer auto-pause hook
  useEffect(() => {
    if (!sleepTimerMinutes) return;
    const timer = setTimeout(() => {
      sendIframeCommand('pauseVideo');
      setIsPlaying(false);
      setSleepTimerMinutes(null);
    }, sleepTimerMinutes * 60 * 1000);
    return () => clearTimeout(timer);
  }, [sleepTimerMinutes]);

  // Mobile Screen Lock, Display Off, and Background Tab Auto-Pause Hook
  useEffect(() => {
    const handleVisibilityOrScreenOff = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        console.log('[VideoPlayerView] Mobile screen locked / display turned off / tab hidden -> Pausing video');
        if (isDirectTelegramVideo && nativeVideoRef.current) {
          nativeVideoRef.current.pause();
        } else {
          sendIframeCommand('pauseVideo');
        }
        setIsPlaying(false);
      }
    };

    const handlePageHide = () => {
      if (isDirectTelegramVideo && nativeVideoRef.current) {
        nativeVideoRef.current.pause();
      } else {
        sendIframeCommand('pauseVideo');
      }
      setIsPlaying(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityOrScreenOff);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrScreenOff);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isDirectTelegramVideo]);

  const handleLike = () => {
    const nextLiked = !hasLiked;
    if (hasLiked) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      if (hasDisliked) setHasDisliked(false);
    }
    recordVideoLike(video.id, video.title, nextLiked, currentUser, video.channelId);
  };

  const handleDislike = () => {
    const nextDisliked = !hasDisliked;
    setHasDisliked(nextDisliked);
    if (hasLiked) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
      recordVideoLike(video.id, video.title, false, currentUser, video.channelId);
    }
  };

  const handleToggleSubscribe = () => {
    // 1. REQUIRE LOGIN: Must be logged in with Google/Gmail
    if (!currentUser || !currentUser.isLoggedIn || !currentUser.email) {
      if (onOpenLoginModal) {
        onOpenLoginModal();
      }
      return;
    }

    const nextSub = !isSubscribed;
    setIsSubscribed(nextSub);
    setSubscribersCount(prev => nextSub ? prev + 1 : Math.max(0, prev - 1));

    try {
      const saved = JSON.parse(localStorage.getItem('bt_subscribed_channels') || '{}');
      if (nextSub) {
        saved[effectiveChannelId] = true;
        if (video.channelId) saved[video.channelId] = true;
        if (video.channelName) saved[video.channelName.trim()] = true;
      } else {
        delete saved[effectiveChannelId];
        if (video.channelId) delete saved[video.channelId];
        if (video.channelName) delete saved[video.channelName.trim()];
      }
      localStorage.setItem('bt_subscribed_channels', JSON.stringify(saved));
    } catch (_) {}

    recordSubscription(effectiveChannelId, video.channelName, nextSub, currentUser);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const comment: Comment = {
      id: commentId,
      videoId: video.id,
      author: currentUser?.name || (language === 'hi' ? 'बुंदेली दर्शक' : 'Bundeli Viewer'),
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: newCommentText.trim(),
      timestamp: language === 'hi' ? 'अभी-अभी' : 'Just now',
      likes: 1,
      userLiked: true
    };

    setComments(prev => [comment, ...prev]);
    saveCommentToFirestore({
      id: commentId,
      videoId: video.id,
      videoTitle: video.title,
      author: comment.author,
      avatar: comment.avatar,
      text: comment.text,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      creatorId: video.creatorId || video.channelId
    });
    setNewCommentText('');
  };

  const handleTouchTap = (side: 'left' | 'right') => {
    const now = Date.now();
    if (lastTapRef.current && lastTapRef.current.side === side && now - lastTapRef.current.time < 350) {
      if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
      setSeekRipple({ side, seconds: 10 });
      rippleTimerRef.current = setTimeout(() => {
        setSeekRipple(null);
      }, 800);
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { time: now, side };
    }
  };

  const formatSubscribers = (count: number) => {
    if (!count || count <= 0) return `0 ${language === 'hi' ? 'सब्सक्राइबर्स' : 'subscribers'}`;
    if (count >= 10000000) return `${(count / 10000000).toFixed(1)} ${language === 'hi' ? 'करोड़' : 'Cr'} ${language === 'hi' ? 'सब्सक्राइबर्स' : 'subscribers'}`;
    if (count >= 100000) return `${(count / 100000).toFixed(1)} ${language === 'hi' ? 'लाख' : 'Lakh'} ${language === 'hi' ? 'सब्सक्राइबर्स' : 'subscribers'}`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K ${language === 'hi' ? 'सब्सक्राइबर्स' : 'subscribers'}`;
    return `${count} ${language === 'hi' ? 'सब्सक्राइबर्स' : 'subscribers'}`;
  };

  const formatViews = (count: number) => {
    if (count >= 10000000) return `${(count / 10000000).toFixed(1)} ${language === 'hi' ? 'करोड़' : 'Cr'} ${t.views}`;
    if (count >= 100000) return `${(count / 100000).toFixed(1)} ${language === 'hi' ? 'लाख' : 'Lakh'} ${t.views}`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K ${t.views}`;
    return `${count} ${t.views}`;
  };

  return (
    <div id="video-watch-page" className="w-full bg-slate-950 text-slate-100 min-h-screen pb-20">
      
      <div className="max-w-[1700px] mx-auto px-0 sm:px-4 lg:px-8 py-0 sm:py-4">
        
        {/* Main Content & Side List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-6">
          
          {/* Left Column: 16:9 Edge-to-Edge Player, Video Details, Action Pills, Comments */}
          <div className="lg:col-span-8 space-y-0 sm:space-y-4">
            
            {/* 16:9 Responsive Video Player - Sticky on Top / Full Rotated Screen with Drag-to-Minimize support */}
            <div 
              ref={playerContainerRef}
              id="sticky-video-player-container"
              onMouseMove={triggerControls}
              onTouchStart={rotationDeg === 0 ? handlePlayerTouchStart : undefined}
              onTouchMove={rotationDeg === 0 ? handlePlayerTouchMove : undefined}
              onTouchEnd={rotationDeg === 0 ? handlePlayerTouchEnd : undefined}
              style={
                rotationDeg === 90
                  ? {
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      width: '100dvh',
                      height: '100dvw',
                      transform: 'translate(-50%, -50%) rotate(90deg)',
                      zIndex: 99999,
                      borderRadius: 0,
                      margin: 0,
                      maxWidth: 'none',
                      maxHeight: 'none',
                    }
                  : rotationDeg === 270
                  ? {
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      width: '100dvh',
                      height: '100dvw',
                      transform: 'translate(-50%, -50%) rotate(270deg)',
                      zIndex: 99999,
                      borderRadius: 0,
                      margin: 0,
                      maxWidth: 'none',
                      maxHeight: 'none',
                    }
                  : rotationDeg === 180
                  ? {
                      position: 'fixed',
                      inset: 0,
                      width: '100vw',
                      height: '100vh',
                      transform: 'rotate(180deg)',
                      zIndex: 99999,
                      borderRadius: 0,
                      margin: 0,
                      maxWidth: 'none',
                      maxHeight: 'none',
                    }
                  : {
                      transform: dragOffsetY > 0 ? `translateY(${dragOffsetY * 0.4}px) scale(${1 - (dragOffsetY / 1200)})` : undefined,
                      transition: dragOffsetY === 0 ? 'transform 0.2s ease-out' : 'none'
                    }
              }
              className={
                rotationDeg !== 0
                  ? "fixed overflow-hidden bg-black select-none shadow-2xl transition-all duration-300"
                  : "sticky top-0 sm:top-16 z-30 w-full aspect-video rounded-none sm:rounded-2xl overflow-hidden bg-black shadow-2xl border-b sm:border border-slate-800/80 group select-none transition-shadow"
              }
            >
              {/* Drag to Minimize indicator pull pill on mobile */}
              {dragOffsetY > 15 && rotationDeg === 0 && (
                <div className="absolute top-2 inset-x-0 z-40 flex justify-center pointer-events-none">
                  <div className="px-3 py-1 rounded-full bg-black/90 text-amber-300 text-[11px] font-bold shadow-2xl border border-amber-500/40 backdrop-blur-md animate-bounce flex items-center gap-1.5">
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'नीचे खींचकर छोटा करें' : 'Release to minimize'}</span>
                  </div>
                </div>
              )}

              {isOfflineBlocked || (!isOnline && !isDownloaded) ? (
                /* OFFLINE NOT DOWNLOADED BLOCKER SCREEN */
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4 z-30">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-2xl">
                    <WifiOff className="w-8 h-8" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-100 font-bundeli">
                      {language === 'hi' ? 'ऑफलाइन वीडियो उपलब्ध नहीं है' : 'Video Not Available Offline'}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {language === 'hi'
                        ? 'यह वीडियो डाउनलोड नहीं है। बिना डाउनलोड किए कोई भी वीडियो ऑफलाइन नहीं चल सकता। ऑफलाइन देखने के लिए पहले वीडियो को डाउनलोड करें।'
                        : 'This video has not been downloaded. Videos can only be played offline after being saved to your Downloads section.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                    >
                      {language === 'hi' ? 'वापस जाएँ (Back)' : 'Go Back'}
                    </button>
                  </div>
                </div>
              ) : isAudioOnly ? (
                /* Audio Only Mode (90% data saver) */
                <div className="absolute inset-0 bg-gradient-to-br from-amber-950/80 via-slate-900 to-black flex flex-col items-center justify-between p-4 sm:p-6 text-center">
                  <div className="w-full flex justify-between items-center">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-amber-500 hover:text-slate-950 text-white backdrop-blur-md border border-white/20 text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
                      title={language === 'hi' ? 'वापस जाएँ (Back)' : 'Back'}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
                    </button>

                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                      {t.audioModeActive}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="relative mb-3 sm:mb-4">
                      <img
                        src={video.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'}
                        alt={video.title}
                        className="w-28 h-28 sm:w-44 sm:h-44 rounded-full object-cover shadow-2xl ring-4 ring-amber-500/40 animate-spin"
                        style={{ animationDuration: '24s' }}
                      />
                      <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                        <Headphones className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                      </div>
                    </div>
                    <h2 className="text-sm sm:text-lg font-bold text-slate-100 max-w-lg line-clamp-1">{video.title}</h2>
                    <p className="text-xs text-amber-400 font-medium mt-0.5">{video.artist}</p>
                  </div>

                  {/* Audio Mode Red Progress Bar & Controls */}
                  <div className="w-full max-w-xl space-y-2">
                    <div 
                      ref={progressBarRef}
                      onPointerDown={handleProgressPointerDown}
                      onPointerMove={handleProgressPointerMove}
                      onPointerUp={handleProgressPointerUp}
                      onPointerLeave={() => setHoverTime(null)}
                      className="relative w-full py-2 cursor-pointer group/seeker select-none touch-none"
                    >
                      <div className="relative w-full h-1.5 rounded-full bg-white/20">
                        <div 
                          className="absolute left-0 top-0 bottom-0 rounded-full bg-red-600 shadow-sm"
                          style={{ width: `${Math.max(0, Math.min(100, (currentTime / Math.max(1, durationSeconds)) * 100))}%` }}
                        />
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-lg scale-100 group-hover/seeker:scale-125 transition-transform z-20"
                          style={{ left: `${Math.max(0, Math.min(100, (currentTime / Math.max(1, durationSeconds)) * 100))}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="text-white font-bold">{formatTime(currentTime)}</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleSeekRelative(-10)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer">
                          <Rewind className="w-4 h-4" />
                        </button>
                        <button onClick={togglePlay} className="p-2 rounded-full bg-amber-500 text-slate-950 hover:scale-105 transition-all cursor-pointer">
                          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>
                        <button onClick={() => handleSeekRelative(10)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer">
                          <FastForward className="w-4 h-4" />
                        </button>
                      </div>
                      <span>{formatTime(durationSeconds)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Native Bundeli & YouTube Hybrid Player */
                <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
                  {!isDirectTelegramVideo && video.youtubeId && video.youtubeId.match(/^[a-zA-Z0-9_-]{11}$/) ? (
                    <iframe
                      ref={iframeRef}
                      key={video.id}
                      src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&controls=1&rel=0&playsinline=1`}
                      title={video.title}
                      className="w-full h-full border-0 pointer-events-auto"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      ref={nativeVideoRef}
                      key={video.id}
                      src={resolvedStream || video.streamUrl || FALLBACK_VIDEO_STREAMS[0]}
                      poster={video.thumbnail || undefined}
                      playsInline
                      autoPlay={!isAdPlaying}
                      muted={isMuted}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onLoadedMetadata={(e) => {
                        const dur = Math.floor(e.currentTarget.duration);
                        if (dur > 0) setNativeDuration(dur);
                      }}
                      onError={() => {
                        console.warn('Video stream error, switching to fallback stream');
                        if (!videoLoadError) {
                          setVideoLoadError(true);
                          setResolvedStream(FALLBACK_VIDEO_STREAMS[0]);
                        }
                      }}
                      onTimeUpdate={(e) => {
                        if (!isScrubbing) {
                          const curr = Math.floor(e.currentTarget.currentTime);
                          setCurrentTime(curr);
                        }
                      }}
                      onEnded={() => {
                        if (autoPlayNext && hasNext) {
                          playNext();
                        }
                      }}
                      className="w-full h-full object-contain pointer-events-auto"
                    />
                  )}

                  {/* Rotation Feedback Toast */}
                  {rotationToast && (
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-black/90 text-amber-300 border border-amber-500/50 text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in zoom-in-90 duration-150 pointer-events-none">
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{rotationToast}</span>
                    </div>
                  )}



                  {/* Transparent Click Interceptor to Toggle Controls when controls are hidden (Non-YouTube only) */}
                  {!isYouTubeVideo && !showControls && !isAdPlaying && (
                    <div 
                      onClick={handlePlayerSurfaceClick}
                      className="absolute inset-0 z-10 cursor-pointer"
                    />
                  )}

                  {/* Bundeli Custom Controller Overlay - Tap anywhere to toggle controls (Non-YouTube only) */}
                  {!isYouTubeVideo && (
                    <div 
                      onClick={handlePlayerSurfaceClick}
                      className={`absolute inset-0 z-20 flex flex-col justify-between transition-opacity duration-300 ${
                        showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                    {/* Top Bar with Back, Minimize, Quality & Settings Gear Icon */}
                    <div className="w-full p-2.5 sm:p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
                      <div className="flex items-center gap-2">
                        {onMinimize && rotationDeg === 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMinimize();
                            }}
                            className="flex items-center justify-center p-2 rounded-full bg-black/70 hover:bg-amber-500 hover:text-slate-950 text-white backdrop-blur-md border border-white/20 text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
                            title={language === 'hi' ? 'मिनीप्लेयर (Minimize)' : 'Minimize'}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (rotationDeg !== 0) {
                              setRotationDeg(0);
                            } else {
                              onClose();
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-amber-500 hover:text-slate-950 text-white backdrop-blur-md border border-white/20 text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
                          title={language === 'hi' ? (rotationDeg !== 0 ? 'सीधा करें (Normal)' : 'वापस जाएँ (Back)') : (rotationDeg !== 0 ? 'Normal Screen' : 'Back')}
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>{language === 'hi' ? (rotationDeg !== 0 ? 'सीधा करें' : 'वापस') : (rotationDeg !== 0 ? 'Normal' : 'Back')}</span>
                        </button>
                      </div>

                      {/* Right Top Controls: Quality Pill + CC Captions + Setting Icon */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSettingsSheetTab('captions');
                            setIsSettingsSheetOpen(true);
                          }}
                          className={`px-2 py-1 rounded-lg backdrop-blur-md border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            captionsLang !== 'off' 
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md' 
                              : 'bg-black/70 hover:bg-black/90 text-white/90 border-white/20'
                          }`}
                          title={language === 'hi' ? 'कैप्शन (CC)' : 'Captions'}
                        >
                          <Subtitles className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-mono uppercase">{captionsLang === 'off' ? 'CC' : captionsLang}</span>
                        </button>

                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-slate-300 text-[10px] font-mono shadow-md pointer-events-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          <span>{quality}</span>
                        </div>

                        {/* Settings Button on Top */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSettingsSheetTab('main');
                            setIsSettingsSheetOpen(true);
                          }}
                          className="p-2 rounded-full bg-black/70 hover:bg-amber-500 hover:text-slate-950 text-white backdrop-blur-md border border-white/20 transition-all shadow-lg active:scale-95 cursor-pointer"
                          title={language === 'hi' ? 'वीडियो सेटिंग्स (क्वालिटी, स्पीड, कैप्शन)' : 'Video Settings (Quality, Speed, CC)'}
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Center Big Play/Pause Button */}
                    <div className="flex items-center justify-center pointer-events-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay();
                        }}
                        className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-black/60 hover:bg-amber-500 hover:text-slate-950 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-2xl hover:scale-110 cursor-pointer"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <Pause className="w-7 h-7 sm:w-10 sm:h-10 fill-current" />
                        ) : (
                          <Play className="w-7 h-7 sm:w-10 sm:h-10 fill-current ml-1" />
                        )}
                      </button>
                    </div>

                    {/* Bottom Custom Control Bar with Red YouTube Seeker Line */}
                    <div className="w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent pointer-events-auto flex flex-col pt-2 pb-2 sm:pb-3 px-3 sm:px-4">
                      {/* YouTube-Style Red Progress Scrubber Bar */}
                      <div 
                        ref={progressBarRef}
                        onPointerDown={handleProgressPointerDown}
                        onPointerMove={handleProgressPointerMove}
                        onPointerUp={handleProgressPointerUp}
                        onPointerLeave={() => setHoverTime(null)}
                        className="relative w-full py-2.5 cursor-pointer group/seeker select-none touch-none"
                        title="लाल लाइन को खींच कर वीडियो आगे-पीछे करें (Drag to seek)"
                      >
                        {/* Hover Timestamp Floating Bubble */}
                        {hoverTime && (
                          <div 
                            className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-black/95 text-white text-[11px] font-mono border border-white/20 shadow-xl pointer-events-none z-30"
                            style={{ 
                              left: `${Math.max(24, Math.min(hoverTime.x, (progressBarRef.current?.clientWidth || 300) - 24))}px` 
                            }}
                          >
                            {formatTime(hoverTime.time)}
                          </div>
                        )}

                        {/* Background & Buffer Track */}
                        <div className="relative w-full h-1 sm:h-1.5 group-hover/seeker:h-2 rounded-full bg-white/25 transition-all overflow-visible">
                          {/* Buffered Track */}
                          <div 
                            className="absolute left-0 top-0 bottom-0 rounded-full bg-white/35 pointer-events-none transition-all"
                            style={{ width: `${Math.min(100, ((currentTime + 30) / Math.max(1, durationSeconds)) * 100)}%` }}
                          />

                          {/* Played Red Progress Line */}
                          <div 
                            className="absolute left-0 top-0 bottom-0 rounded-full bg-red-600 shadow-sm pointer-events-none transition-all"
                            style={{ width: `${Math.max(0, Math.min(100, (currentTime / Math.max(1, durationSeconds)) * 100))}%` }}
                          />

                          {/* Red Scrubber Thumb */}
                          <div 
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-600 border-2 border-white shadow-lg scale-100 group-hover/seeker:scale-125 transition-transform pointer-events-none ring-2 ring-red-900/40 z-20"
                            style={{ left: `${Math.max(0, Math.min(100, (currentTime / Math.max(1, durationSeconds)) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Controls Buttons Row & Time Display */}
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlay();
                            }}
                            className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white transition-colors cursor-pointer"
                            title={isPlaying ? 'Pause' : 'Play'}
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeekRelative(-10);
                              handleTouchTap('left');
                            }}
                            className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                            title="Rewind 10s"
                          >
                            <Rewind className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeekRelative(10);
                              handleTouchTap('right');
                            }}
                            className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                            title="Forward 10s"
                          >
                            <FastForward className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMute();
                            }}
                            className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                            title={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                          </button>

                          <div className="flex items-center gap-1 text-xs sm:text-sm font-mono text-white/95 font-medium select-none ml-1">
                            <span className="text-white font-bold">{formatTime(currentTime)}</span>
                            <span className="text-white/50">/</span>
                            <span className="text-white/70">{formatTime(durationSeconds)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* Video Rotate Icon in Bottom Bar */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRotateVideo();
                            }}
                            className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                              rotationDeg > 0 
                                ? 'bg-amber-500 text-slate-950 font-bold ring-1 ring-amber-400' 
                                : 'bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white'
                            }`}
                            title={language === 'hi' ? `पूरा प्लेयर रोटेट करें (${rotationDeg === 0 ? 'लैंडस्केप 90°' : 'सीधा 0°'})` : `Rotate Full Player (${rotationDeg === 0 ? 'Landscape 90°' : 'Portrait 0°'})`}
                          >
                            <RotateCw className={`w-4 h-4 ${rotationDeg > 0 ? 'rotate-90' : ''}`} />
                          </button>

                          {/* Setting Icon in Bottom Bar as well */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSettingsSheetTab('main');
                              setIsSettingsSheetOpen(true);
                            }}
                            className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white transition-colors cursor-pointer"
                            title={language === 'hi' ? 'सेटिंग्स' : 'Settings'}
                          >
                            <Settings className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFullscreen();
                            }}
                            className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white transition-colors cursor-pointer"
                            title="Fullscreen"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                  {/* Subtitle / Caption Text Overlay (Non-YouTube only) */}
                  {!isYouTubeVideo && captionsLang !== 'off' && isPlaying && (
                    <div className="absolute bottom-14 inset-x-4 flex justify-center pointer-events-none z-20">
                      <div className="px-3.5 py-1.5 rounded-xl bg-black/85 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-semibold text-center shadow-2xl backdrop-blur-md animate-in fade-in duration-150 max-w-lg">
                        {captionsLang === 'bundeli' 
                          ? `[बुन्देली CC] ${video.title} - ${video.artist}`
                          : captionsLang === 'hindi'
                          ? `[हिन्दी सबटाइटल] ${video.title}`
                          : `[English Subtitles] Now playing: ${video.title}`}
                      </div>
                    </div>
                  )}

                  {/* Persistent Bottom Red Line (Non-YouTube only) */}
                  {!isYouTubeVideo && (
                    <div className={`absolute bottom-0 inset-x-0 h-[3px] bg-white/20 z-10 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-0' : 'opacity-100'}`}>
                      <div 
                        className="h-full bg-red-600 transition-all duration-300"
                        style={{ width: `${Math.max(0, Math.min(100, (currentTime / Math.max(1, durationSeconds)) * 100))}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Double Tap Seek Touch Zones (Non-YouTube only) */}
              {!isYouTubeVideo && (
                <>
                  <div 
                    className="absolute inset-y-16 left-0 w-1/3 cursor-pointer z-10 select-none sm:hidden"
                    onClick={() => handleTouchTap('left')}
                  />
                  <div 
                    className="absolute inset-y-16 right-0 w-1/3 cursor-pointer z-10 select-none sm:hidden"
                    onClick={() => handleTouchTap('right')}
                  />
                </>
              )}

              {/* Double Tap Seek Animation Ripple Overlay */}
              {seekRipple && (
                <div 
                  className={`absolute inset-y-0 ${seekRipple.side === 'left' ? 'left-0 rounded-r-full' : 'right-0 rounded-l-full'} w-1/3 bg-white/20 backdrop-blur-sm z-30 flex flex-col items-center justify-center pointer-events-none transition-all duration-300 animate-in fade-in zoom-in`}
                >
                  {seekRipple.side === 'left' ? (
                    <div className="flex flex-col items-center text-white">
                      <Rewind className="w-10 h-10 drop-shadow-md animate-pulse" />
                      <span className="text-sm font-bold mt-1 font-mono">-10s</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-white">
                      <FastForward className="w-10 h-10 drop-shadow-md animate-pulse" />
                      <span className="text-sm font-bold mt-1 font-mono">+10s</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Video Details & Actions Container */}
            <div className="px-3 sm:px-0 space-y-3 sm:space-y-4 pt-2 sm:pt-0">
              
              {/* Quick Prev / Next & Audio Mode Strip (Quality moved to Settings on player) */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                    title={language === 'hi' ? 'वापस जाएँ (Back)' : 'Back'}
                  >
                    <ArrowLeft className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-bold">{language === 'hi' ? 'वापस' : 'Back'}</span>
                  </button>

                  {onMinimize && (
                    <button
                      type="button"
                      onClick={onMinimize}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                      title={language === 'hi' ? 'मिनीप्लेयर (Minimize)' : 'Minimize'}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={playPrev}
                    disabled={!hasPrev}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                    title={t.prevVideo}
                  >
                    <SkipBack className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px]">{t.prevVideo}</span>
                  </button>

                  <button
                    onClick={playNext}
                    disabled={!hasNext}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                    title={t.nextVideo}
                  >
                    <SkipForward className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px]">{t.nextVideo}</span>
                  </button>

                  <button
                    onClick={() => setIsAudioOnly(prev => !prev)}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isAudioOnly 
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-400'
                    }`}
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>{isAudioOnly ? (language === 'hi' ? 'वीडियो देखें' : 'Watch Video') : t.audioMode}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPlayNext}
                      onChange={(e) => setAutoPlayNext(e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <span>{t.autoPlay}</span>
                  </label>

                  {/* Quick Settings Button that opens the settings popup */}
                  <button
                    onClick={() => {
                      setSettingsSheetTab('main');
                      setIsSettingsSheetOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
                    title={language === 'hi' ? 'वीडियो क्वालिटी और स्पीड बदलें' : 'Settings'}
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px]">{quality}</span>
                  </button>
                </div>
              </div>

              {/* 🌟 Google AdMob Policy Compliant Below-Player Banner (50% Creator / 50% Admin Split) */}
              <VideoPlayerAdMobUnit
                key={`below-player-${video.id}`}
                video={video}
                language={language}
                variant="below_player"
                currentUser={currentUser}
                onAdImpression={onAdImpressionCredited ? ({ creatorShare, adminShare }) => {
                  onAdImpressionCredited({
                    impressionValue: Number((creatorShare + adminShare).toFixed(2)),
                    creatorShare,
                    videoId: video.id
                  });
                } : undefined}
              />

              {/* Video Title & Metadata */}
              <div className="space-y-2">
                {video.hasPaidPromotion && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-sm">
                    <Megaphone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>
                      {language === 'hi' ? 'सशुल्क प्रचार शामिल है' : 'Includes paid promotion'}
                    </span>
                    {video.sponsorName && (
                      <>
                        <span className="text-purple-400/50">•</span>
                        <span className="font-bold text-amber-300">{video.sponsorName}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Video Title */}
                <h1 className="text-base sm:text-xl font-bold text-slate-100 leading-snug">
                  {video.title}
                </h1>

                {/* Views & Timestamp Subtitle */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{formatViews(video.views)}</span>
                  <span>•</span>
                  <span>
                    {(!video.uploadDate || video.uploadDate.includes('Review') || video.uploadDate.includes('समीक्षा'))
                      ? (video.status === 'pending' ? 'समीक्षाधीन' : 'हाल ही में')
                      : video.uploadDate}
                  </span>
                </div>

                {/* Channel Details & Subscribe Row */}
                <div className="flex items-center justify-between gap-3 py-2 border-y border-slate-800/80">
                  <div 
                    onClick={() => setChannelModal({
                      channelName: video.channelName,
                      channelId: video.channelId,
                      channelAvatar: video.channelAvatar
                    })}
                    className="flex items-center gap-2.5 sm:gap-3 min-w-0 cursor-pointer group/chan select-none"
                    title={language === 'hi' ? `${video.channelName} चैनल देखें (वीडियो व टॉप वीडियो)` : `View ${video.channelName} channel`}
                  >
                    <img
                      src={video.channelAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={video.channelName}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-slate-800 group-hover/chan:ring-amber-400 transition shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-100 group-hover/chan:text-amber-400 transition-colors truncate">
                          {video.channelName}
                        </span>
                        {video.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                        <span className="text-amber-400/90 font-medium">{formatSubscribers(subscribersCount)}</span>
                        <span>•</span>
                        <span>{video.artist || video.channelName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Subscribe Button: Red initially, removes red when subscribed */}
                  <button
                    type="button"
                    onClick={handleToggleSubscribe}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isSubscribed
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                    }`}
                  >
                    {isSubscribed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{language === 'hi' ? 'सब्सक्राइब्ड' : 'Subscribed'}</span>
                      </>
                    ) : (
                      <span>{language === 'hi' ? 'सब्सक्राइब' : 'Subscribe'}</span>
                    )}
                  </button>
                </div>

                {/* Horizontal Action Pills Row (YouTube style: Like, Dislike, Share, Remix, Thanks, Download, Save, Report) */}
                <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar py-2 flex-nowrap shrink-0">
                  {/* Like / Dislike Pill */}
                  <div className="flex items-center rounded-full bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                    <button
                      type="button"
                      onClick={handleLike}
                      className={`px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        hasLiked ? 'text-amber-400 bg-amber-500/10' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                      <span>{likes}</span>
                    </button>
                    <div className="w-[1px] h-4 bg-slate-800" />
                    <button
                      type="button"
                      onClick={handleDislike}
                      className={`px-3 py-2 text-xs transition-colors cursor-pointer ${
                        hasDisliked ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <ThumbsDown className={`w-3.5 h-3.5 ${hasDisliked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-3.5 py-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.share}</span>
                  </button>

                  {/* Remix / Clip Button */}
                  <button
                    type="button"
                    onClick={() => alert(language === 'hi' ? '✂️ क्लिप टूल: 5 से 60 सेकंड का टुकड़ा काटें और शेयर करें!' : '✂️ Create 5-60s short clip to share!')}
                    className="px-3.5 py-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Remix</span>
                  </button>

                  {/* Super Thanks Button */}
                  <button
                    type="button"
                    onClick={() => setIsSuperThanksModalOpen(true)}
                    className="px-3.5 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/40 hover:from-pink-500/30 hover:to-rose-500/30 text-pink-300 text-xs font-bold flex items-center gap-1.5 transition shadow-sm shrink-0 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 text-pink-400 fill-current" />
                    <span>{language === 'hi' ? 'थैंक्स' : 'Thanks'}</span>
                  </button>

                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (downloading) return;
                      if (isDownloaded) {
                        const shouldRemove = window.confirm(
                          language === 'hi' 
                            ? 'क्या आप इस वीडियो को डाउनलोड्स (ऑफ़लाइन) से हटाना चाहते हैं?' 
                            : 'Do you want to remove this video from offline downloads?'
                        );
                        if (shouldRemove) {
                          await removeDownloadedVideoFromStorage(video.id);
                          setIsDownloaded(false);
                        }
                        return;
                      }

                      setDownloading(true);
                      setDownloadProgress(15);
                      const res = await downloadVideoFile(video, (pct) => {
                        setDownloadProgress(pct);
                      });
                      setDownloading(false);
                      if (res.success) {
                        setIsDownloaded(true);
                        setDownloadProgress(100);
                      } else {
                        alert(
                          language === 'hi'
                            ? 'डाउनलोड विफल रहा। कृपया इंटरनेट कनेक्शन जांचें।'
                            : 'Download failed. Please check your connection.'
                        );
                      }
                    }}
                    className={`px-3.5 py-2 rounded-full border text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                      downloading
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : isDownloaded
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                    title={
                      isDownloaded 
                        ? (language === 'hi' ? 'ऑफलाइन उपलब्ध (हटाने के लिए क्लिक करें)' : 'Available offline (Click to remove)') 
                        : (language === 'hi' ? 'ऑफलाइन देखने के लिए डाउनलोड करें' : 'Download for offline playback')
                    }
                  >
                    {downloading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    ) : isDownloaded ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {downloading
                        ? `${language === 'hi' ? 'डाउनलोड' : 'Downloading'} ${downloadProgress}%`
                        : isDownloaded
                        ? (language === 'hi' ? 'डाउनलोडेड' : 'Downloaded')
                        : t.download}
                    </span>
                  </button>

                  {/* Save to Playlist Button */}
                  <button
                    type="button"
                    onClick={() => setIsPlaylistModalOpen(true)}
                    className="px-3.5 py-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'सहेजें' : 'Save'}</span>
                  </button>

                  {/* Copyright Report Button */}
                  <button
                    type="button"
                    onClick={() => onOpenCopyrightModal(video)}
                    className="px-3 py-2 rounded-full bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                    title={t.reportCopyright}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'रिपोर्ट' : 'Report'}</span>
                  </button>
                </div>
              </div>

              {/* Expandable Description Box */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                  <span>{formatViews(video.views)}</span>
                  <span>•</span>
                  <span>
                    {(!video.uploadDate || video.uploadDate.includes('Review') || video.uploadDate.includes('समीक्षा'))
                      ? (video.status === 'pending' ? 'समीक्षाधीन' : 'हाल ही में')
                      : video.uploadDate}
                  </span>
                  <span className="text-amber-400">#{video.category}</span>
                </div>

                <div className={`text-xs text-slate-300 leading-relaxed whitespace-pre-line ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
                  {video.description}

                  {video.lyrics && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <p className="font-bold text-amber-400 mb-1">
                        {language === 'hi' ? 'गीत के बोल (Lyrics):' : 'Lyrics:'}
                      </p>
                      <p className="font-serif text-slate-300">{video.lyrics}</p>
                    </div>
                  )}

                  {video.verificationCode && (
                    <div className="mt-2 p-2 rounded-lg bg-slate-950 border border-amber-500/30 text-[11px] font-mono text-amber-300">
                      {t.verificationCodeLabel}: {video.verificationCode}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <span>{isDescriptionExpanded ? t.showLess : t.showMore}</span>
                  {isDescriptionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* YouTube Style Comments Preview Card (Tappable to expand full discussion) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-3">
                <div 
                  onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-slate-100">{t.comments}</span>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                      {comments.length}
                    </span>
                  </div>
                  <button type="button" className="text-slate-400 hover:text-white p-1">
                    {isCommentsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Top Comment Preview when collapsed */}
                {!isCommentsExpanded && comments.length > 0 && (
                  <div 
                    onClick={() => setIsCommentsExpanded(true)}
                    className="flex items-center gap-2.5 pt-1 cursor-pointer text-xs"
                  >
                    <img
                      src={comments[0].avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={comments[0].author}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-800 shrink-0"
                    />
                    <p className="text-slate-300 line-clamp-1 flex-1 text-xs">
                      {comments[0].text}
                    </p>
                  </div>
                )}

                {/* Full Expanded Comments List and Form */}
                {isCommentsExpanded && (
                  <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in duration-200">
                    {/* Add Comment Input */}
                    <form onSubmit={handleAddComment} className="flex gap-2.5 items-start">
                      <img
                        src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt="User"
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0 mt-0.5"
                      />
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          placeholder={t.addComment}
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="submit"
                          disabled={!newCommentText.trim()}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors disabled:opacity-40 shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>

                    {/* Comments Items */}
                    <div className="space-y-2.5 pt-1 max-h-96 overflow-y-auto pr-1">
                      {comments.map((cmt) => (
                        <div key={cmt.id} className="flex gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/50">
                          <img
                            src={cmt.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={cmt.author}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-200">{cmt.author}</span>
                              <span className="text-[10px] text-slate-500">{cmt.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{cmt.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Suggested Videos list inside same scroll flow underneath sticky player */}
              <div className="block lg:hidden pt-4 space-y-3">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{language === 'hi' ? 'अगले लोकप्रिय बुंदेली गीत' : 'Up Next & Recommended'}</span>
                </h2>

                <div className="space-y-3">
                  {relatedVideos.map((item, idx) => (
                    <React.Fragment key={`mob-${item.id}`}>
                      <div
                        onClick={() => {
                          onSelectVideo(item);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="group flex gap-3 p-2 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 hover:border-amber-500/40 cursor-pointer transition-all duration-200"
                      >
                        {/* 16:9 Thumbnail */}
                        <div className="relative aspect-video w-36 sm:w-40 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                          <img
                            src={item.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                            {item.duration}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <h3 className="text-xs font-semibold text-slate-200 line-clamp-2 group-hover:text-amber-400 leading-snug">
                              {item.title}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-1 truncate">{item.channelName}</p>
                            <p className="text-[10px] text-amber-400/90 font-medium truncate">{item.artist}</p>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1">{formatViews(item.views)}</span>
                        </div>
                      </div>

                      {/* Google AdMob In-Feed Native Sponsored Card (After 2nd video) */}
                      {idx === 1 && (
                        <VideoPlayerAdMobUnit
                          video={item}
                          language={language}
                          variant="in_feed"
                          currentUser={currentUser}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Up Next & Recommended Feed (Desktop layout) */}
          <div className="hidden lg:block lg:col-span-4 space-y-3 px-3 sm:px-0 pt-4 sm:pt-0">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'अगले लोकप्रिय बुंदेली गीत' : 'Up Next & Recommended'}</span>
            </h2>

            <div className="space-y-3">
              {relatedVideos.map((item, idx) => (
                <React.Fragment key={`desk-${item.id}`}>
                  <div
                    onClick={() => {
                      onSelectVideo(item);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group flex gap-3 p-2 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 hover:border-amber-500/40 cursor-pointer transition-all duration-200"
                  >
                    {/* 16:9 Thumbnail */}
                    <div className="relative aspect-video w-36 sm:w-40 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                      <img
                        src={item.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                        {item.duration}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h3 className="text-xs font-semibold text-slate-200 line-clamp-2 group-hover:text-amber-400 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1 truncate">{item.channelName}</p>
                        <p className="text-[10px] text-amber-400/90 font-medium truncate">{item.artist}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1">{formatViews(item.views)}</span>
                    </div>
                  </div>

                  {/* Google AdMob In-Feed Native Sponsored Card (After 2nd video) */}
                  {idx === 1 && (
                    <VideoPlayerAdMobUnit
                      video={item}
                      language={language}
                      variant="in_feed"
                      currentUser={currentUser}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* YouTube-style Settings Bottom Sheet / Popup Modal */}
      {isSettingsSheetOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSettingsSheetOpen(false)}
        >
          <div 
            className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Pull bar */}
            <div className="flex flex-col items-center justify-center pb-2 border-b border-slate-800 relative">
              <div className="w-12 h-1 rounded-full bg-slate-700 sm:hidden mb-2" />
              
              <div className="w-full flex items-center justify-between">
                {settingsSheetTab !== 'main' ? (
                  <button
                    onClick={() => setSettingsSheetTab('main')}
                    className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 p-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{language === 'hi' ? 'पीछे जाएँ' : 'Back'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-slate-100">
                      {language === 'hi' ? 'प्लेयर सेटिंग्स' : 'Player Settings'}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setIsSettingsSheetOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TAB: MAIN SETTINGS MENU */}
            {settingsSheetTab === 'main' && (
              <div className="space-y-1 text-sm">
                {/* 1. Quality */}
                <button
                  onClick={() => setSettingsSheetTab('quality')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-amber-500/20 text-amber-400">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold block">{language === 'hi' ? 'वीडियो क्वालिटी' : 'Quality'}</span>
                      <span className="text-xs text-slate-400">{quality}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </button>

                {/* 2. Captions / Subtitles */}
                <button
                  onClick={() => setSettingsSheetTab('captions')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-amber-500/20 text-amber-400">
                      <Subtitles className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold block">{language === 'hi' ? 'कैप्शन / सबटाइटल' : 'Captions'}</span>
                      <span className="text-xs text-slate-400">
                        {captionsLang === 'off' ? (language === 'hi' ? 'बंद' : 'Off') : captionsLang.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </button>

                {/* 3. Playback Speed */}
                <button
                  onClick={() => setSettingsSheetTab('speed')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-amber-500/20 text-amber-400">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold block">{language === 'hi' ? 'प्लेबैक स्पीड' : 'Playback Speed'}</span>
                      <span className="text-xs text-slate-400">{playbackSpeed === 1 ? (language === 'hi' ? 'सामान्य (1x)' : 'Normal (1x)') : `${playbackSpeed}x`}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </button>

                {/* 4. Sleep Timer */}
                <button
                  onClick={() => setSettingsSheetTab('timer')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-amber-500/20 text-amber-400">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold block">{language === 'hi' ? 'स्लीप टाइमर (सोने का टाइमर)' : 'Sleep Timer'}</span>
                      <span className="text-xs text-slate-400">
                        {sleepTimerMinutes ? `${sleepTimerMinutes} ${language === 'hi' ? 'मिनट' : 'mins'}` : (language === 'hi' ? 'बंद' : 'Off')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </button>

                {/* 5. Rotate Video */}
                <button
                  onClick={() => setSettingsSheetTab('rotate')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-amber-500/20 text-amber-400">
                      <RotateCw className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold block">{language === 'hi' ? 'वीडियो घुमाएँ (रोटेशन)' : 'Rotate Video'}</span>
                      <span className="text-xs text-slate-400">
                        {rotationDeg === 0 
                          ? (language === 'hi' ? 'सीधा (0° Standard)' : 'Standard (0°)') 
                          : `${rotationDeg}° ${language === 'hi' ? 'घुमा हुआ' : 'Rotated'}`}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </button>

                {/* 6. Loop Video Switch */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 text-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-amber-400">
                      <Repeat className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold block">{language === 'hi' ? 'वीडियो रिपीट करें' : 'Loop Video'}</span>
                      <span className="text-xs text-slate-400">{language === 'hi' ? 'बार-बार यही गीत बजेगा' : 'Auto replay when finished'}</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isLooping}
                    onChange={(e) => setIsLooping(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                  />
                </div>
              </div>
            )}

            {/* TAB: QUALITY SELECTION */}
            {settingsSheetTab === 'quality' && (
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400 px-2 pb-1">
                  {language === 'hi' ? 'वीडियो क्वालिटी का चयन करें:' : 'Select video resolution:'}
                </p>
                {[
                  { label: 'Auto (Recommended - 1080p)', val: 'Auto' },
                  { label: '1080p Ultra HD', val: '1080p HD' },
                  { label: '720p HD', val: '720p' },
                  { label: '480p SD (Data Saver)', val: '480p' },
                  { label: '360p Low (Slow Internet)', val: '360p' },
                  { label: '240p Ultra Saver', val: '240p' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => {
                      setQuality(item.val);
                      setIsSettingsSheetOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                      quality.includes(item.val) || quality === item.val
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-lg'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>{item.label}</span>
                    {(quality.includes(item.val) || quality === item.val) && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* TAB: CAPTIONS / SUBTITLES */}
            {settingsSheetTab === 'captions' && (
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400 px-2 pb-1">
                  {language === 'hi' ? 'कैप्शन या सबटाइटल भाषा चुनें:' : 'Select subtitle language:'}
                </p>
                {[
                  { id: 'off', name: language === 'hi' ? 'बंद रखें (Turn Off)' : 'Turn Off Subtitles' },
                  { id: 'bundeli', name: 'बुन्देली लिरिक्स (Bundeli AI CC)' },
                  { id: 'hindi', name: 'हिन्दी अनुवाद (Hindi Subtitles)' },
                  { id: 'english', name: 'English Translation' }
                ].map((cap) => (
                  <button
                    key={cap.id}
                    onClick={() => {
                      setCaptionsLang(cap.id as any);
                      setIsSettingsSheetOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                      captionsLang === cap.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-lg'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>{cap.name}</span>
                    {captionsLang === cap.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}

            {/* TAB: SPEED SELECTION */}
            {settingsSheetTab === 'speed' && (
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400 px-2 pb-1">
                  {language === 'hi' ? 'प्लेबैक गति का चयन करें:' : 'Select playback speed:'}
                </p>
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      handleSetSpeed(s);
                      setIsSettingsSheetOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                      playbackSpeed === s
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-lg'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>{s === 1 ? (language === 'hi' ? 'सामान्य (1.0x Normal)' : '1.0x (Normal)') : `${s}x`}</span>
                    {playbackSpeed === s && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}

            {/* TAB: SLEEP TIMER */}
            {settingsSheetTab === 'timer' && (
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400 px-2 pb-1">
                  {language === 'hi' ? 'तय समय के बाद वीडियो अपने आप रुक जाएगा:' : 'Audio/Video will pause automatically after:'}
                </p>
                {[
                  { label: language === 'hi' ? 'टाइमर बंद करें (Off)' : 'Off', mins: null },
                  { label: '10 mins', mins: 10 },
                  { label: '15 mins', mins: 15 },
                  { label: '30 mins', mins: 30 },
                  { label: '45 mins', mins: 45 },
                  { label: '60 mins (1 Hour)', mins: 60 },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSleepTimerMinutes(item.mins);
                      setIsSettingsSheetOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                      sleepTimerMinutes === item.mins
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-lg'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>{item.label}</span>
                    {sleepTimerMinutes === item.mins && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}

            {/* TAB: ROTATE SELECTION */}
            {settingsSheetTab === 'rotate' && (
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400 px-2 pb-1">
                  {language === 'hi' ? 'वीडियो ओरिएंटेशन / एंगल चुनें:' : 'Select video rotation angle:'}
                </p>
                {[
                  { deg: 0, label: language === 'hi' ? '0° सामान्य सीधा (Standard)' : '0° Standard (Normal)' },
                  { deg: 90, label: language === 'hi' ? '90° दाएँ घुमाएँ (Clockwise)' : '90° Clockwise' },
                  { deg: 180, label: language === 'hi' ? '180° उल्टा (Inverted)' : '180° Inverted' },
                  { deg: 270, label: language === 'hi' ? '270° बाएँ घुमाएँ (Counter-Clockwise)' : '270° Counter-Clockwise' },
                ].map((item) => (
                  <button
                    key={item.deg}
                    onClick={() => {
                      handleSetRotation(item.deg);
                      setIsSettingsSheetOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                      rotationDeg === item.deg
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-lg'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <RotateCw className="w-4 h-4 text-amber-400" style={{ transform: `rotate(${item.deg}deg)` }} />
                      <span>{item.label}</span>
                    </div>
                    {rotationDeg === item.deg && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        video={video}
        language={language}
      />

      <SaveToPlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        video={video}
        language={language}
        currentUserId={currentUser?.id}
        currentUserName={currentUser?.name}
      />

      <SuperThanksModal
        isOpen={isSuperThanksModalOpen}
        onClose={() => setIsSuperThanksModalOpen(false)}
        video={video}
        currentUser={currentUser}
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
          allVideos={allVideos}
          onSelectVideo={(v) => {
            setChannelModal(null);
            onSelectVideo(v);
          }}
          currentUser={currentUser}
          language={language}
          onOpenLoginModal={onOpenLoginModal}
        />
      )}
    </div>
  );
};
