import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Info, 
  Megaphone, 
  Coins, 
  TrendingUp, 
  ArrowLeft,
  ChevronDown,
  Maximize2,
  Rewind,
  FastForward,
  RotateCw,
  Clock,
  Heart,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';
import { Video, UserAccount, Channel, CreatorWallet } from '../types';
import { Language, translations } from '../locales/i18n';
import { 
  processInStreamVideoAdRevenue, 
  recordLongVideoAdImpression,
  RevenueTransactionRecord 
} from '../lib/revenueService';
import { isSelfViewFraud } from '../lib/monetizationSecurity';

export interface AdPoolItem {
  id: string;
  brandName: string;
  brandNameHindi: string;
  tagline: string;
  taglineHindi: string;
  category: string;
  logo: string;
  videoUrl: string;
  fallbackThumbnail: string;
  ctaText: string;
  ctaTextHindi: string;
  targetUrl: string;
  cpmRate: number; // e.g., ₹40 CPM => ₹0.40 total ad value
  totalAdValue: number; // Total ₹ generated per impression (e.g. ₹0.50 -> ₹0.25 Admin / ₹0.25 Creator)
  durationSeconds: number;
  format: 'skippable' | 'non_skippable';
}

export const AD_POOL: AdPoolItem[] = [
  {
    id: 'ad-sarson-tel',
    brandName: 'Bundelkhand Pure Mustard Oil',
    brandNameHindi: 'बुंदेलखंड शुद्ध कच्ची घानी सरसों तेल',
    tagline: '100% Cold-Pressed Desi Kacchi Ghani Oil — Rich Aroma & Purity',
    taglineHindi: '100% शुद्ध लकड़ी कोल्हू का तेल — बुंदेलखंड की माटी का असली स्वाद व सुगंध',
    category: 'देसी कृषि उत्पाद (Agro Food)',
    logo: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    fallbackThumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80',
    ctaText: 'Order Pure Oil (Shop Now)',
    ctaTextHindi: 'शुद्ध तेल ऑर्डर करें (Shop Now)',
    targetUrl: 'https://bundelitube.com/sponsors/mustard-oil',
    cpmRate: 40.0,
    totalAdValue: 0.40,
    durationSeconds: 15,
    format: 'skippable'
  },
  {
    id: 'ad-mahindra-tractor',
    brandName: 'Mahindra FarmTech Bundelkhand Mela',
    brandNameHindi: 'महिन्द्रा ट्रैक्टर बुंदेलखंड किसान मेला',
    tagline: 'Tough Power for Rocky Bundelkhand Soils — Zero Down Payment',
    taglineHindi: 'बुंदेलखंड के पथरीले खेतों का बाहुबली ट्रैक्टर — 0% डाउनपेमेंट व किसान छूट!',
    category: 'कृषि एवं वाहन (Agriculture & Auto)',
    logo: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=150&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    fallbackThumbnail: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=1200&auto=format&fit=crop&q=80',
    ctaText: 'Book Test Drive',
    ctaTextHindi: 'मुफ्त टेस्ट ड्राइव बुक करें',
    targetUrl: 'https://bundelitube.com/sponsors/tractor-mela',
    cpmRate: 50.0,
    totalAdValue: 0.50,
    durationSeconds: 8,
    format: 'non_skippable'
  },
  {
    id: 'ad-bundeli-jewellery',
    brandName: 'Bundeli Traditional Gold Jewellers',
    brandNameHindi: 'बुंदेली पारंपरिक आभूषण व विवाह गहने',
    tagline: 'Hallmarked Authentic Bundelkhandi Hasli, Payal & Karadhani',
    taglineHindi: 'हंसली, करधनी, बिछिया व पैंजनिया के प्रामाणिक हॉलमार्क बुंदेली डिजाइन्स',
    category: 'पारंपरिक आभूषण (Jewellery)',
    logo: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=150&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    fallbackThumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&auto=format&fit=crop&q=80',
    ctaText: 'View Catalogue',
    ctaTextHindi: 'कैटलॉग देखें (View Designs)',
    targetUrl: 'https://bundelitube.com/sponsors/jewellery',
    cpmRate: 60.0,
    totalAdValue: 0.60,
    durationSeconds: 15,
    format: 'skippable'
  },
  {
    id: 'ad-solar-pump',
    brandName: 'Kisan Urja PM-KUSUM Solar Pump',
    brandNameHindi: 'किसान ऊर्जा सौर पंप योजना',
    tagline: '90% Subsidy Solar Water Pumps for Bundelkhand Farmers',
    taglineHindi: '90% सरकारी सब्सिडी पर सौर सिंचाई पंप — 25 साल वारंटी!',
    category: 'सौर ऊर्जा (Green Energy)',
    logo: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=150&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    fallbackThumbnail: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80',
    ctaText: 'Apply For Subsidy',
    ctaTextHindi: 'सब्सिडी हेतु आवेदन करें',
    targetUrl: 'https://bundelitube.com/sponsors/solar-pump',
    cpmRate: 45.0,
    totalAdValue: 0.45,
    durationSeconds: 7,
    format: 'non_skippable'
  }
];

export interface ActiveAdQueueItem {
  ad: AdPoolItem;
  queueIndex: number; // 1 or 2
  totalInQueue: number; // 1 or 2
  triggerType: 'pre-roll' | 'mid-roll' | 'post-roll';
  timestamp?: number;
}

interface MonetizedVideoScreenProps {
  video: Video;
  currentUser?: UserAccount | null;
  channel?: Channel;
  language: Language;
  onClose?: () => void;
  onMinimize?: () => void;
  onAdImpressionCredited?: (data: { impressionValue: number; creatorShare: number; videoId: string }) => void;
  onVideoEnd?: () => void;
}

export const MonetizedVideoScreen: React.FC<MonetizedVideoScreenProps> = ({
  video,
  currentUser,
  channel,
  language,
  onClose,
  onMinimize,
  onAdImpressionCredited,
  onVideoEnd
}) => {
  const t = translations[language];

  // Duration parser
  const parseDuration = (dur: string): number => {
    if (!dur) return 600;
    const parts = dur.split(':').map(Number);
    if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
    if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    return 600;
  };

  const formatTime = (sec: number): string => {
    if (isNaN(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const durationSeconds = parseDuration(video.duration);

  // Main YouTube Player States
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Mid-Roll Cue Points: Start after 2 minutes with comfortable intervals
  const midRollCues = useMemo(() => {
    const cues: number[] = [];
    if (durationSeconds < 140) {
      // Under 2.5 mins: No mid-roll ads
      return [];
    } else if (durationSeconds <= 300) {
      // 2.5 to 5 mins: 1 mid-roll ad at 2:00 (120s)
      cues.push(120);
    } else if (durationSeconds <= 600) {
      // 5 to 10 mins: Mid-rolls at 2:00 (120s) and 5:00 (300s)
      cues.push(120, 300);
    } else if (durationSeconds <= 1200) {
      // 10 to 20 mins: Mid-rolls at 2:00 (120s), 7:00 (420s), 12:00 (720s)
      cues.push(120, 420, 720);
    } else {
      // 20+ mins: Mid-rolls at 2:00 (120s), 7:00 (420s), 13:00 (780s), 19:00 (1140s)
      cues.push(120, 420, 780, 1140);
    }
    return cues.filter(c => c < durationSeconds - 10);
  }, [durationSeconds]);

  // Set of already triggered cue points to ensure no loop re-triggering
  const triggeredCuesRef = useRef<Set<number>>(new Set());
  const postRollTriggeredRef = useRef<boolean>(false);

  // ==========================================
  // AD ENGINE QUEUE & BELOW-PLAYER AD STATES
  // ==========================================
  const [adQueue, setAdQueue] = useState<ActiveAdQueueItem[]>([]);
  const [currentAdItem, setCurrentAdItem] = useState<ActiveAdQueueItem | null>(null);
  const [isAdContainerOpen, setIsAdContainerOpen] = useState(false);
  const [isUILocked, setIsUILocked] = useState(false);

  // Ad playback & timer states
  const adVideoRef = useRef<HTMLVideoElement>(null);
  const [isAdVideoPlaying, setIsAdVideoPlaying] = useState(false);
  const [adCurrentTime, setAdCurrentTime] = useState(0);
  const [adDuration, setAdDuration] = useState(15);
  const [isAdMuted, setIsAdMuted] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [nonSkipRemaining, setNonSkipRemaining] = useState(8);
  const [lastSplitRecord, setLastSplitRecord] = useState<RevenueTransactionRecord | null>(null);

  // Send Command to YouTube Iframe
  const sendYouTubeCommand = useCallback((func: string, args: any[] = []) => {
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
  }, []);

  // Controls Visibility Helper
  const triggerControls = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isUILocked) {
        setShowControls(false);
      }
    }, 3500);
  };

  /**
   * Helper: Build an ad queue (Single Skippable, Single Non-Skippable, or Double Back-to-Back)
   */
  const createAdQueue = (triggerType: 'pre-roll' | 'mid-roll' | 'post-roll', cueTime?: number): ActiveAdQueueItem[] => {
    // 40% chance of double ad for high monetization testing, 60% single ad
    const isDoubleAd = Math.random() < 0.40;
    
    // Pick randomly from ad pool
    const shuffled = [...AD_POOL].sort(() => 0.5 - Math.random());
    const ad1 = shuffled[0] || AD_POOL[0];
    const ad2 = shuffled[1] || AD_POOL[1];

    if (isDoubleAd) {
      return [
        {
          ad: ad1,
          queueIndex: 1,
          totalInQueue: 2,
          triggerType,
          timestamp: cueTime
        },
        {
          ad: ad2,
          queueIndex: 2,
          totalInQueue: 2,
          triggerType,
          timestamp: cueTime
        }
      ];
    } else {
      return [
        {
          ad: ad1,
          queueIndex: 1,
          totalInQueue: 1,
          triggerType,
          timestamp: cueTime
        }
      ];
    }
  };

  /**
   * Trigger Ad Break: Interlocking YouTube Pause & UI Lock
   */
  const triggerAdBreak = (triggerType: 'pre-roll' | 'mid-roll' | 'post-roll', cueTime?: number) => {
    console.log(`[AdEngine] Triggering ${triggerType} ad break (Cue: ${cueTime ?? 'start'})`);
    
    // 1. Pause YouTube Player
    sendYouTubeCommand('pauseVideo');
    setIsPlaying(false);

    // 2. Lock UI Completely
    setIsUILocked(true);

    // 3. Populate Ad Queue & Open Container
    const queue = createAdQueue(triggerType, cueTime);
    setAdQueue(queue);
    setCurrentAdItem(queue[0]);
    setIsAdContainerOpen(true);
  };

  /**
   * Initialize and play the current ad in the queue
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

    // Play Ad Video with Sound
    if (adVideoRef.current) {
      adVideoRef.current.currentTime = 0;
      adVideoRef.current.muted = isAdMuted;
      adVideoRef.current.play().catch(e => {
        console.warn('Ad video autoplay notice:', e);
        // Fallback try muted if browser blocked unmuted autoplay
        if (adVideoRef.current) {
          adVideoRef.current.muted = true;
          setIsAdMuted(true);
          adVideoRef.current.play().catch(() => {});
        }
      });
    }

    // 🛡️ ANTI-FRAUD & SELF-VIEW CHECK:
    // If viewer is the creator or channel owner of this video,
    // do NOT count ad impression or trigger monetization revenue.
    const isSelf = isSelfViewFraud(currentUser?.id, video, channel?.id || (currentUser as any)?.channelId);
    if (isSelf) {
      console.warn(`[AntiFraud] Self-view detected on video ${video.id} in MonetizedVideoScreen. Monetization skipped.`);
      return;
    }

    // Process 50:50 Revenue Split for this Ad Impression
    const formatType = currentAdItem.totalInQueue === 2 
      ? (currentAdItem.queueIndex === 1 ? 'double_ad_first' : 'double_ad_second')
      : (ad.format === 'skippable' ? 'skippable' : 'non_skippable');

    // 1. Requirement: LONG VIDEO ADS:
    // When a user watches a long video and a video-watch ad successfully loads and shows (Ad Impression),
    // update Firebase for that specific video's creator by incrementing total_long_impressions by +1.
    const targetCreatorId = video.creatorId || video.channelId || 'bundeli-creator-1';
    recordLongVideoAdImpression({
      videoId: video.id,
      creatorId: targetCreatorId,
      channelId: video.channelId || targetCreatorId,
      channelName: video.channelName || video.artist || 'चैनल',
      sponsorBrand: ad.brandName,
      adFormat: formatType,
      viewerUserId: currentUser?.id,
      viewerChannelId: channel?.id || (currentUser as any)?.channelId,
      isSelfView: false
    }).catch(e => console.warn('recordLongVideoAdImpression call warning:', e));

    processInStreamVideoAdRevenue({
      totalAmount: ad.totalAdValue,
      creatorId: targetCreatorId,
      creatorName: video.artist || video.channelName || 'कलाकार',
      channelName: video.channelName || video.artist || 'चैनल',
      videoId: video.id,
      videoTitle: video.title,
      sponsorBrand: ad.brandName,
      adFormat: formatType,
      viewerUserId: currentUser?.id,
      viewerChannelId: channel?.id || (currentUser as any)?.channelId,
      isSelfView: false
    }).then(splitRecord => {
      setLastSplitRecord(splitRecord);
      if (onAdImpressionCredited) {
        onAdImpressionCredited({
          impressionValue: ad.totalAdValue,
          creatorShare: Number((ad.totalAdValue * 0.50).toFixed(2)),
          videoId: video.id
        });
      }
    });

  }, [currentAdItem, isAdContainerOpen, video, currentUser, channel, onAdImpressionCredited]);

  /**
   * Ad countdown and progress interval
   */
  useEffect(() => {
    if (!isAdContainerOpen || !currentAdItem) return;

    const timer = setInterval(() => {
      setAdCurrentTime(prev => {
        const next = prev + 1;
        
        // Skippable timer countdown
        if (currentAdItem.ad.format === 'skippable') {
          const remainingSkip = Math.max(0, 5 - next);
          setSkipCountdown(remainingSkip);
          if (remainingSkip === 0) {
            setCanSkip(true);
          }
        } else {
          // Non-skippable countdown
          const remaining = Math.max(0, adDuration - next);
          setNonSkipRemaining(remaining);
        }

        // Check if current ad video reached its end
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
   * Handle transitioning to next ad in queue or unlocking main video
   */
  const handleNextAdOrFinish = () => {
    if (!currentAdItem) return;

    if (currentAdItem.queueIndex === 1 && currentAdItem.totalInQueue === 2 && adQueue[1]) {
      // Transition to Ad 2 of 2 in the same Below-Player Container
      console.log('[AdEngine] Transitioning to Ad 2 of 2');
      setCurrentAdItem(adQueue[1]);
    } else {
      // All ads finished/skipped -> Close container, unlock UI, and resume YouTube
      finishAdBreak();
    }
  };

  /**
   * Skip Ad action handler
   */
  const handleSkipAd = () => {
    if (!canSkip) return;
    console.log('[AdEngine] Ad Skipped by user');
    handleNextAdOrFinish();
  };

  /**
   * Completely Unmount/Hide Ad Container, Unlock UI, and Auto-Resume YouTube Player
   */
  const finishAdBreak = () => {
    console.log('[AdEngine] Ad break completed. Unmounting Ad container and resuming main video.');
    
    // Pause and reset ad video
    if (adVideoRef.current) {
      adVideoRef.current.pause();
    }
    
    setIsAdContainerOpen(false);
    setCurrentAdItem(null);
    setAdQueue([]);
    setIsUILocked(false);

    // Automatically call youtubePlayer.playVideo() to resume playback
    sendYouTubeCommand('playVideo');
    setIsPlaying(true);

    // If this was post-roll, trigger video end
    if (currentAdItem?.triggerType === 'post-roll') {
      if (onVideoEnd) onVideoEnd();
    }
  };

  /**
   * Main Video Timeline Monitor: Mid-Rolls & Post-Roll triggers
   */
  useEffect(() => {
    let ticker: any = null;
    if (isPlaying && !isUILocked && !isAdContainerOpen) {
      ticker = setInterval(() => {
        setCurrentTime(prev => {
          const nextSec = prev + 1;

          // 1. Check for Mid-Roll Cues
          const hitCue = midRollCues.find(cue => {
            return nextSec >= cue && prev < cue && !triggeredCuesRef.current.has(cue);
          });

          if (hitCue !== undefined) {
            triggeredCuesRef.current.add(hitCue);
            triggerAdBreak('mid-roll', hitCue);
            return hitCue;
          }

          // 2. Check for Post-Roll on duration completion
          if (nextSec >= durationSeconds && !postRollTriggeredRef.current) {
            postRollTriggeredRef.current = true;
            triggerAdBreak('post-roll', durationSeconds);
            return durationSeconds;
          }

          return nextSec;
        });
      }, 1000);
    }
    return () => {
      if (ticker) clearInterval(ticker);
    };
  }, [isPlaying, isUILocked, isAdContainerOpen, durationSeconds, midRollCues]);

  /**
   * Pre-Roll Ad on Video Load
   */
  useEffect(() => {
    setCurrentTime(0);
    triggeredCuesRef.current.clear();
    postRollTriggeredRef.current = false;
    
    // Start with Pre-Roll Ad immediately
    triggerAdBreak('pre-roll', 0);
  }, [video.id]);

  // Main YouTube play/pause toggle (locked during ad break)
  const togglePlay = () => {
    if (isUILocked) return; // Strict interlocking
    if (isPlaying) {
      sendYouTubeCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      sendYouTubeCommand('playVideo');
      setIsPlaying(true);
    }
    triggerControls();
  };

  // Main YouTube Mute toggle
  const toggleMute = () => {
    if (isMuted) {
      sendYouTubeCommand('unMute');
      setIsMuted(false);
    } else {
      sendYouTubeCommand('mute');
      setIsMuted(true);
    }
  };

  const handleSeek = (sec: number) => {
    if (isUILocked) return;
    const clamped = Math.max(0, Math.min(sec, durationSeconds));
    const prevTime = currentTime;
    setCurrentTime(clamped);
    sendYouTubeCommand('seekTo', [clamped, true]);

    // Check if scrubbed/seeked past an untriggered mid-roll cue
    const hitCue = midRollCues.find(cue => cue <= clamped && cue >= prevTime && !triggeredCuesRef.current.has(cue));
    if (hitCue !== undefined) {
      triggeredCuesRef.current.add(hitCue);
      triggerAdBreak('mid-roll', hitCue);
    }

    triggerControls();
  };

  return (
    <div id="monetized-video-screen" className="w-full bg-slate-950 text-slate-100 min-h-screen pb-20 select-none">
      <div className="max-w-[1700px] mx-auto px-0 sm:px-4 lg:px-8 py-0 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-6">
          
          {/* Main Left Column */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* ======================================================== */}
            {/* 1. TOP SECTION: MAIN YOUTUBE PLAYER WITH LOCKING LAYER    */}
            {/* ======================================================== */}
            <div 
              id="main-youtube-player-container"
              className="relative w-full aspect-video bg-black rounded-none sm:rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 group"
              onMouseMove={triggerControls}
            >
              {/* YouTube IFrame Embed */}
              <iframe
                ref={iframeRef}
                src={`https://www.youtube-nocookie.com/embed/${video.youtubeId || 'dQw4w9WgXcQ'}?autoplay=0&controls=0&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&disablekb=1&playsinline=1&fs=0&enablejsapi=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0 pointer-events-auto"
              />

              {/* STRICT PLAYBACK LOCKING OVERLAY WHEN AD IS RUNNING */}
              {isUILocked && (
                <div 
                  id="youtube-player-lock-layer"
                  className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-[4px] flex flex-col items-center justify-center p-4 text-center select-none pointer-events-auto cursor-not-allowed"
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs sm:text-sm font-bold shadow-2xl animate-pulse">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>{language === 'hi' ? 'विज्ञापन चल रहा है — मुख्य वीडियो रुका हुआ है' : 'AD IN PROGRESS — Main Video Paused'}</span>
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-md font-medium drop-shadow">
                    {language === 'hi'
                      ? 'नीचे दिए गए विज्ञापन कंटेनर में प्रायोजक विज्ञापन समाप्त होने पर आपका वीडियो स्वतः यहीं से शुरू होगा।'
                      : 'Your main video is securely paused and will automatically resume once the below ad finishes or is skipped.'}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-black/60 px-3 py-1 rounded-lg border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>{language === 'hi' ? 'नीचे विज्ञापन देखें ⬇' : 'Playing Below ⬇'}</span>
                  </div>
                </div>
              )}

              {/* Custom YouTube Controller Overlay (Active only when NOT locked) */}
              {!isUILocked && (
                <div 
                  className={`absolute inset-0 z-20 flex flex-col justify-between transition-opacity duration-300 ${
                    showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="w-full p-3 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {onClose && (
                        <button
                          onClick={onClose}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-amber-500 hover:text-slate-950 text-white backdrop-blur-md border border-white/20 text-xs font-bold transition-all shadow-lg cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
                        </button>
                      )}
                      <span className="text-xs font-semibold text-white/90 truncate max-w-xs drop-shadow hidden sm:inline">
                        {video.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 border border-white/10 text-[11px] text-amber-400 font-mono">
                        <Sparkles className="w-3 h-3" />
                        <span>50:50 Revenue Enabled</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Play/Pause Button */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 rounded-full bg-black/60 hover:bg-amber-500 hover:text-slate-950 text-white flex items-center justify-center border border-white/20 shadow-2xl transition hover:scale-110 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                    </button>
                  </div>

                  {/* Bottom Seeker & Time Controls */}
                  <div className="w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 flex flex-col gap-2">
                    {/* YouTube Red Scrubber Line */}
                    <div 
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pos = (e.clientX - rect.left) / rect.width;
                        handleSeek(pos * durationSeconds);
                      }}
                      className="relative w-full h-1.5 hover:h-2.5 rounded-full bg-white/20 cursor-pointer group/seeker transition-all"
                    >
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-red-600 rounded-full"
                        style={{ width: `${Math.max(0, Math.min(100, (currentTime / Math.max(1, durationSeconds)) * 100))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                      <div className="flex items-center gap-3">
                        <button onClick={togglePlay} className="p-1 hover:text-amber-400">
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button onClick={toggleMute} className="p-1 hover:text-amber-400">
                          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <span>{formatTime(currentTime)} / {formatTime(durationSeconds)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">1080p HD</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* 2. MIDDLE SECTION: DEDICATED BELOW-PLAYER AD CONTAINER   */}
            {/* (Zero IFrame Overlay Policy — strictly isolated container)*/}
            {/* ======================================================== */}
            {isAdContainerOpen && currentAdItem && (
              <div 
                id="below-player-dedicated-ad-container"
                className="w-full bg-slate-900 border-2 border-amber-500/80 rounded-2xl p-3 sm:p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
              >
                {/* Header Strip with Ad Badge, Queue Badge, and Revenue Split indicator */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-black text-xs tracking-wider uppercase shadow-sm">
                      {language === 'hi' ? 'प्रायोजक विज्ञापन' : 'SPONSORED AD'}
                    </span>
                    {currentAdItem.totalInQueue === 2 && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 text-xs font-bold">
                        {language === 'hi' ? `विज्ञापन ${currentAdItem.queueIndex} / 2` : `Ad ${currentAdItem.queueIndex} of 2`}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      • {currentAdItem.ad.category}
                    </span>
                  </div>

                  {/* 50:50 Revenue Split Live Tag */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {language === 'hi' ? '50:50 राजस्व साझा' : '50:50 Revenue Split'}: 
                      <span className="text-white font-bold ml-1">₹{(currentAdItem.ad.totalAdValue * 0.5).toFixed(2)} {language === 'hi' ? 'क्रिएटर' : 'Creator'}</span>
                    </span>
                  </div>
                </div>

                {/* Ad Content Grid: Video on Left, Brand info & Skip Controls on Right */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 pt-3 items-center">
                  
                  {/* Dedicated HTML5 Ad <video> player */}
                  <div className="md:col-span-7 relative aspect-video bg-black rounded-xl overflow-hidden shadow-inner border border-slate-800">
                    <video
                      ref={adVideoRef}
                      src={currentAdItem.ad.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                      poster={currentAdItem.ad.fallbackThumbnail || undefined}
                      playsInline
                      autoPlay
                      muted={isAdMuted}
                      onEnded={handleNextAdOrFinish}
                      className="w-full h-full object-cover"
                    />

                    {/* Ad Sound Control on Video */}
                    <button
                      onClick={() => {
                        const next = !isAdMuted;
                        setIsAdMuted(next);
                        if (adVideoRef.current) adVideoRef.current.muted = next;
                      }}
                      className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 text-xs transition cursor-pointer"
                      title={isAdMuted ? 'Unmute Ad' : 'Mute Ad'}
                    >
                      {isAdMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    </button>

                    {/* Bottom Yellow Progress Track for Ad */}
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                      <div 
                        className="h-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${Math.min(100, (adCurrentTime / Math.max(1, adDuration)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Right Side: Sponsor Information & Interactive CTA / Skip Buttons */}
                  <div className="md:col-span-5 flex flex-col justify-between h-full space-y-3">
                    <div className="flex items-start gap-3">
                      <img 
                        src={currentAdItem.ad.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                        alt={currentAdItem.ad.brandName}
                        className="w-12 h-12 rounded-xl object-cover border border-amber-500/30 shadow"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-white truncate">
                          {language === 'hi' ? currentAdItem.ad.brandNameHindi : currentAdItem.ad.brandName}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">
                          {language === 'hi' ? currentAdItem.ad.taglineHindi : currentAdItem.ad.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Sponsor CTA Link */}
                    <a
                      href={currentAdItem.ad.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
                    >
                      <span>{language === 'hi' ? currentAdItem.ad.ctaTextHindi : currentAdItem.ad.ctaText}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Dynamic Countdown & Skip Ad Button */}
                    <div className="w-full pt-1 flex items-center justify-end">
                      {currentAdItem.ad.format === 'skippable' ? (
                        canSkip ? (
                          <button
                            onClick={handleSkipAd}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold transition shadow active:scale-95 cursor-pointer"
                          >
                            <span>{language === 'hi' ? 'विज्ञापन छोड़ें (Skip Ad)' : 'Skip Ad'}</span>
                            <SkipForward className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-mono">
                            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                            <span>{language === 'hi' ? `विज्ञापन छोड़ें (${skipCountdown}s में)` : `Skip Ad in ${skipCountdown}s`}</span>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-mono">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            {language === 'hi' 
                              ? `वीडियो विज्ञापन के बाद शुरू होगा (${nonSkipRemaining}s)` 
                              : `Video will play after ad in ${nonSkipRemaining}s`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Audit Confirmation Toast */}
                {lastSplitRecord && (
                  <div className="mt-3 p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Tx: #{lastSplitRecord.transactionId.slice(-8)} (Total ₹{lastSplitRecord.totalAmount.toFixed(2)})</span>
                    </div>
                    <div className="text-emerald-400 font-bold shrink-0 ml-2">
                      Admin: ₹{lastSplitRecord.adminShare.toFixed(2)} | Creator: ₹{(lastSplitRecord.creatorShares[0]?.shareAmount || 0).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* 3. VIDEO METADATA & ACTIONS (LIKE, SHARE, CREATOR INFO) */}
            {/* ======================================================== */}
            <div className="space-y-3 px-2 sm:px-0">
              <h1 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {video.title}
              </h1>

              {/* Creator & Action Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={video.channelAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                    alt={video.channelName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">{video.channelName}</h3>
                    <p className="text-xs text-slate-400">{video.artist || 'बुंदेली लोकगायक'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition">
                    <ThumbsUp className="w-4 h-4 text-amber-400" />
                    <span>{video.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition">
                    <Share2 className="w-4 h-4 text-sky-400" />
                    <span>{language === 'hi' ? 'शेयर करें' : 'Share'}</span>
                  </button>
                </div>
              </div>

              {/* Description Box */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <span>{video.views} {t.views}</span>
                  <span>•</span>
                  <span>{video.uploadDate}</span>
                </div>
                <p className="leading-relaxed">{video.description}</p>
              </div>
            </div>

          </div>

          {/* Right Column: Monetization Audit Live Stream */}
          <div className="lg:col-span-4 space-y-4 px-2 sm:px-0">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'hi' ? 'लाइव विज्ञापन व 50:50 राजस्व' : 'Multi-Ad Engine & Revenue'}</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-semibold text-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'आइसोलेटेड विज्ञापन कंटेनर' : 'Isolated Below-Player Container'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {language === 'hi'
                      ? 'जीरो आईफ्रेम ओवरले पॉलिसी के तहत मुख्य प्लेयर के ठीक नीचे अलग समर्पित <video> कंटेनर में विज्ञापन चलता है।'
                      : 'Dual-player architecture: YouTube IFrame strictly pauses and locks while below container plays the ad.'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-semibold text-emerald-300 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'स्वचालित 50:50 / 100% स्प्लिट' : 'Atomic Firestore Wallet Split'}</span>
                  </div>
                  <ul className="text-[11px] text-slate-400 space-y-1 pl-3 list-disc">
                    <li>50% Admin + 50% Video Creator</li>
                    <li>Shorts Feed: 50% Admin + 50% split across last 5 creators</li>
                    <li>Banner Ads: 100% Admin Wallet</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
