import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, ShieldCheck, Info, Sparkles, X, ChevronRight, CheckCircle2, SkipForward, Clock } from 'lucide-react';
import { Language } from '../locales/i18n';
import { processCompliantAdMobRevenue, processBannerAdRevenue } from '../lib/revenueService';
import { Video, UserAccount } from '../types';
import { isSelfViewFraud } from '../lib/monetizationSecurity';

export interface VideoPlayerAdMobUnitProps {
  video: Video;
  language: Language;
  variant?: 'below_player' | 'in_feed' | 'compact_companion';
  admobUnitId?: string;
  currentUser?: UserAccount | null;
  onAdImpression?: (earning: { creatorShare: number; adminShare: number }) => void;
}

interface SponsorCreative {
  id: string;
  brandName: string;
  brandNameHindi: string;
  tagline: string;
  taglineHindi: string;
  category: string;
  image: string;
  ctaText: string;
  ctaTextHindi: string;
  targetUrl: string;
  rating: string;
  cpmValue: number; // in INR (High earning rates for max creator & admin payout)
}

// High-Earning Sponsor Campaigns (Higher CPM rates = Maximum income for Creator & Admin)
export const SPONSOR_CREATIVES: SponsorCreative[] = [
  {
    id: 'ad-solar-kusum',
    brandName: 'PM-KUSUM Kisan Solar Pump',
    brandNameHindi: 'पीएम-कुसुम सोलर पंप योजना',
    tagline: '90% Subsidy on 3HP to 7.5HP Solar Agriculture Pumps',
    taglineHindi: '90% सरकारी सब्सिडी पर सौर सिंचाई पंप — 25 साल सोलर प्लेट वारंटी!',
    category: 'कृषि एवं सौर ऊर्जा (Agriculture)',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
    ctaText: 'Apply Online',
    ctaTextHindi: 'सब्सिडी हेतु आवेदन करें',
    targetUrl: 'https://pmkusum.mnre.gov.in',
    rating: '4.9 ★',
    cpmValue: 2.60 // ₹2.60 per impression -> ₹1.30 Creator, ₹1.30 Admin
  },
  {
    id: 'ad-swaraj-tractor',
    brandName: 'Bundelkhand Krishi Yantra & Tractors',
    brandNameHindi: 'बुंदेलखंड आधुनिक कृषि यंत्र व ट्रैक्टर',
    tagline: 'Zero Down Payment & Easy Low EMI Tractor Loans',
    taglineHindi: 'जीरो डाउनपेमेंट व आसान किस्तों पर आधुनिक हार्वेस्टर व ट्रैक्टर!',
    category: 'कृषि उपकरण (Farm Machinery)',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
    ctaText: 'Check EMI Offer',
    ctaTextHindi: 'किस्त व ऑफर देखें',
    targetUrl: 'https://bundelkhand.gov.in',
    rating: '4.9 ★',
    cpmValue: 2.40 // ₹2.40 -> ₹1.20 Creator, ₹1.20 Admin
  },
  {
    id: 'ad-tourism-khajuraho',
    brandName: 'MP Tourism Orchha & Khajuraho',
    brandNameHindi: 'मध्य प्रदेश बुंदेलखंड पर्यटन',
    tagline: 'Explore Orchha, Kalinjar Fort & Khajuraho Dance Festival',
    taglineHindi: 'ओरछा धाम, कालिंजर किला व खजुराहो दर्शन पैकेज — 30% विशेष छूट!',
    category: 'पर्यटन एवं संस्कृति (Tourism)',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=80',
    ctaText: 'Book Package',
    ctaTextHindi: 'यात्रा पैकेज देखें',
    targetUrl: 'https://www.mptourism.com',
    rating: '4.9 ★',
    cpmValue: 2.20 // ₹2.20 -> ₹1.10 Creator, ₹1.10 Admin
  },
  {
    id: 'ad-bundeli-beej',
    brandName: 'Bundeli Unnat Beej & Organic Agro',
    brandNameHindi: 'बुंदेली उन्नत बीज व जैविक खाद',
    tagline: 'Certified Drought-Resistant High Yield Seeds for Bundelkhand',
    taglineHindi: 'बुंदेलखंड की मिट्टी के अनुकूल प्रमाणित बीज व खाद — अधिक पैदावार!',
    category: 'कृषि व बीज (Seeds & Fertilizer)',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    ctaText: 'Order Seeds',
    ctaTextHindi: 'बीज ऑर्डर करें',
    targetUrl: 'https://seednet.gov.in',
    rating: '4.9 ★',
    cpmValue: 2.10 // ₹2.10 -> ₹1.05 Creator, ₹1.05 Admin
  },
  {
    id: 'ad-bundeli-studio',
    brandName: 'Bundeli Studio Mobile Audio & Video Pro',
    brandNameHindi: 'बुंदेली स्टूडियो प्रो रिकॉर्डर ऐप',
    tagline: 'Record High Quality Bundeli Folk, Rai & Alha Songs',
    taglineHindi: 'घर बैठे ढोलक-मृदंग के साथ रिकॉर्ड करें बुंदेली लोकगीत व राई!',
    category: 'संगीत व ऑडियो (Music & Audio)',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    ctaText: 'Install App',
    ctaTextHindi: 'फ्री इंस्टॉल करें',
    targetUrl: 'https://play.google.com',
    rating: '4.8 ★',
    cpmValue: 1.95 // ₹1.95 -> ₹0.98 Creator, ₹0.97 Admin
  },
  {
    id: 'ad-skill-academy',
    brandName: 'Bundelkhand Rozgar & Technical Academy',
    brandNameHindi: 'बुंदेलखंड तकनीकी कौशल व रोजगार अकादमी',
    tagline: 'Solar Technician, Mobile Repair & Computer Diploma Courses',
    taglineHindi: '100% रोजगार सहायता के साथ 3 माह के तकनीकी डिप्लोमा कोर्स!',
    category: 'शिक्षा व करियर (Education & Jobs)',
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&auto=format&fit=crop&q=80',
    ctaText: 'Enroll Free',
    ctaTextHindi: 'मुफ्त दाखिला लें',
    targetUrl: 'https://pmkvyofficial.org',
    rating: '4.8 ★',
    cpmValue: 1.80 // ₹1.80 -> ₹0.90 Creator, ₹0.90 Admin
  }
];

function getRandomCreatives(count: number): SponsorCreative[] {
  const shuffled = [...SPONSOR_CREATIVES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Tracks long video play index across navigation to enforce:
// 4 videos have starting ads, 5th video has NO starting ad, 6th video resumes starting ads (repeats: 1-4 ad, 5 no-ad, 6-9 ad, 10 no-ad...)
let lastTrackedLongVideoId = '';
let memoryLongVideoPlayCount = 0;

export function checkLongVideoStartingAdRule(videoId: string): { showAd: boolean; playIndex: number } {
  try {
    const rawCount = sessionStorage.getItem('bundelitube_long_video_play_counter');
    let currentCount = rawCount ? parseInt(rawCount, 10) : memoryLongVideoPlayCount;
    const storedLastId = sessionStorage.getItem('bundelitube_last_video_id') || lastTrackedLongVideoId;

    // Only increment when a new video is played (prevents double-counting during same video renders/React 18 StrictMode)
    if (videoId && videoId !== storedLastId) {
      currentCount += 1;
      lastTrackedLongVideoId = videoId;
      memoryLongVideoPlayCount = currentCount;
      sessionStorage.setItem('bundelitube_last_video_id', videoId);
      sessionStorage.setItem('bundelitube_long_video_play_counter', currentCount.toString());
    } else if (currentCount === 0) {
      // First video opened in app session
      currentCount = 1;
      lastTrackedLongVideoId = videoId;
      memoryLongVideoPlayCount = 1;
      sessionStorage.setItem('bundelitube_last_video_id', videoId);
      sessionStorage.setItem('bundelitube_long_video_play_counter', '1');
    }

    // User requirement:
    // "char vedio ke baad pachbi vedio pe satarting bala ads na aaye or chhatmi vedio se fir satarting bala ads aaye"
    // Video 1, 2, 3, 4 -> starting ad shows (showAd = true)
    // Video 5 -> starting ad DOES NOT show (showAd = false)
    // Video 6, 7, 8, 9 -> starting ad shows again (showAd = true)
    // Video 10 -> starting ad DOES NOT show (showAd = false)
    // Formula: (currentCount % 5 !== 0)
    const showAd = (currentCount % 5 !== 0);

    console.log(`[VideoPlayerAdMob] Long Video #${currentCount} ("${videoId}"). Starting Ad: ${showAd ? '✅ ACTIVE (4-of-5 rule)' : '🚫 SKIPPED (5th Video Ad-Free Rule)'}`);

    return { showAd, playIndex: currentCount };
  } catch (e) {
    return { showAd: true, playIndex: 1 };
  }
}

if (typeof window !== 'undefined') {
  (window as any).resetLongVideoAdCounter = () => {
    sessionStorage.removeItem('bundelitube_long_video_play_counter');
    sessionStorage.removeItem('bundelitube_last_video_id');
    lastTrackedLongVideoId = '';
    memoryLongVideoPlayCount = 0;
    console.log('[VideoPlayerAdMob] Long video play counter reset to 0.');
  };
}

export const VideoPlayerAdMobUnit: React.FC<VideoPlayerAdMobUnitProps> = ({
  video,
  language,
  variant = 'below_player',
  admobUnitId = variant === 'in_feed' ? 'ca-app-pub-5666532653138550/1582894537' : 'ca-app-pub-5666532653138550/9305658265',
  currentUser,
  onAdImpression
}) => {
  // -------------------------------------------------------------
  // In-Feed Variant (Appears inside Related Videos / Scroll List)
  // Strict 100% Admin Share as per User Requirement
  // -------------------------------------------------------------
  const [inFeedCreative] = useState<SponsorCreative>(() => {
    return SPONSOR_CREATIVES[Math.floor(Math.random() * SPONSOR_CREATIVES.length)] || SPONSOR_CREATIVES[0];
  });
  const hasLoggedInFeedRef = useRef(false);

  useEffect(() => {
    if (variant === 'in_feed' && !hasLoggedInFeedRef.current) {
      hasLoggedInFeedRef.current = true;
      // 100% Admin Share for feed / video list ads
      processBannerAdRevenue({
        totalAmount: 0.90,
        sponsorBrand: inFeedCreative.brandName,
        bannerPlacement: 'video_feed_scroll_banner',
        bannerId: admobUnitId || 'ca-app-pub-5666532653138550/1582894537'
      }).catch((e) => console.warn('Feed Ad revenue note:', e));
    }
  }, [variant, inFeedCreative, admobUnitId]);

  // -------------------------------------------------------------
  // Below-Player State Machine:
  // 1. 4 out of 5 videos have starting ad, 1 video plays without starting ad.
  // 2. Starting ad runs for 5s then auto-dismisses ("atomic chala jaye").
  // 3. Mid-roll ads arrive every 1 minute (60 seconds) during playback.
  // 4. Sometimes 1 ad, sometimes 2 ads batch.
  // 5. Sometimes non-skippable, sometimes skippable.
  // 6. 50% Creator / 50% Admin Revenue Split on every ad impression.
  // 7. When hidden, completely invisible (NO text or countdown shown to user).
  // -------------------------------------------------------------
  const [hasStartingAd, setHasStartingAd] = useState<boolean>(() => {
    if (variant !== 'below_player') return false;
    return checkLongVideoStartingAdRule(video.id).showAd;
  });

  const [isAdVisible, setIsAdVisible] = useState<boolean>(() => {
    return variant === 'below_player' ? hasStartingAd : true;
  });

  const [adBatch, setAdBatch] = useState<SponsorCreative[]>(() => {
    // 35% chance of 2 consecutive ads on launch, 65% single ad
    const isDouble = Math.random() < 0.35;
    return getRandomCreatives(isDouble ? 2 : 1);
  });
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isNonSkippable, setIsNonSkippable] = useState(() => Math.random() < 0.40);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [showPolicyInfo, setShowPolicyInfo] = useState(false);
  const [earnedSplit, setEarnedSplit] = useState<{ creatorShare: number; adminShare: number } | null>(null);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextAdBreakTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loggedAdImpressionsRef = useRef<Set<string>>(new Set());

  // Listen for video changes to reset or trigger starting ad based on the 4-in-5 rule
  useEffect(() => {
    if (variant !== 'below_player') return;

    const { showAd } = checkLongVideoStartingAdRule(video.id);
    setHasStartingAd(showAd);

    if (showAd) {
      const isDouble = Math.random() < 0.35;
      const newBatch = getRandomCreatives(isDouble ? 2 : 1);
      setAdBatch(newBatch);
      setCurrentAdIndex(0);
      setIsNonSkippable(Math.random() < 0.40);
      setSecondsRemaining(5);
      setIsAdVisible(true);
    } else {
      // 5th video: strictly NO starting ad!
      setIsAdVisible(false);
      // First mid-roll ad will arrive after 1 minute (60 seconds)
      scheduleNextAdBreak();
    }
  }, [video.id, variant]);

  const currentCreative = adBatch[currentAdIndex] || adBatch[0] || SPONSOR_CREATIVES[0];
  const totalInBatch = adBatch.length;

  // Process 50:50 Revenue Split for Below-Player Ad Impression
  const triggerImpressionSplit = (creativeItem: SponsorCreative, adNum: number) => {
    // 🛡️ ANTI-FRAUD CHECK: Prevent creator from earning revenue from watching their own video
    if (isSelfViewFraud(currentUser?.id, video, (currentUser as any)?.channelId)) {
      console.warn(`[AntiFraud] Self-view detected on video ${video.id} by creator ${currentUser?.id}. AdMob impression revenue split skipped.`);
      return;
    }

    const impressionKey = `${video.id}-${creativeItem.id}-${adNum}-${Date.now()}`;
    if (loggedAdImpressionsRef.current.has(impressionKey)) return;
    loggedAdImpressionsRef.current.add(impressionKey);

    const creatorId = video.creatorId || video.channelId || 'bundeli-creator';
    const amount = creativeItem.cpmValue || 2.20;

    processCompliantAdMobRevenue({
      totalAmount: amount,
      creatorId,
      creatorName: video.artist || video.channelName || 'बुंदेली क्रिएटर',
      channelName: video.channelName || 'बुन्देली चैनल',
      videoId: video.id,
      videoTitle: video.title,
      sponsorBrand: creativeItem.brandName,
      placement: 'below_player_banner',
      admobUnitId,
      viewerUserId: currentUser?.id,
      viewerChannelId: (currentUser as any)?.channelId,
      isSelfView: false
    }).then((record) => {
      const cShare = record.creatorShares[0]?.shareAmount || Number((amount * 0.50).toFixed(2));
      const aShare = record.adminShare || Number((amount * 0.50).toFixed(2));
      setEarnedSplit({ creatorShare: cShare, adminShare: aShare });
      if (onAdImpression) {
        onAdImpression({ creatorShare: cShare, adminShare: aShare });
      }
    }).catch((err) => {
      console.warn('AdMob 50:50 revenue split note:', err);
    });
  };

  // Schedule Next Mid-Roll Ad Break in EXACTLY 1 Minute (60 seconds)
  const scheduleNextAdBreak = () => {
    if (nextAdBreakTimerRef.current) {
      clearTimeout(nextAdBreakTimerRef.current);
    }

    // Exact 1 minute interval (60 seconds = 60000ms) as requested: "har 1 minat me ads aaye"
    const intervalMs = 60000;
    console.log(`[VideoPlayerAdMob] Next recurring ad break scheduled in 60 seconds (1 minute)`);

    nextAdBreakTimerRef.current = setTimeout(() => {
      // Pick 1 or 2 ads for this mid-roll break
      const isDouble = Math.random() < 0.40;
      const newBatch = getRandomCreatives(isDouble ? 2 : 1);
      const nonSkip = Math.random() < 0.40;

      setAdBatch(newBatch);
      setCurrentAdIndex(0);
      setIsNonSkippable(nonSkip);
      setSecondsRemaining(5);
      setIsAdVisible(true);

      // Trigger 50:50 split for the first ad of this break
      triggerImpressionSplit(newBatch[0], 1);
    }, intervalMs);
  };

  // Handle when current 5s ad finishes or is skipped
  const handleCurrentAdEnd = () => {
    if (currentAdIndex < totalInBatch - 1) {
      // Advance to Ad 2 of 2 in sequence
      const nextIndex = currentAdIndex + 1;
      setCurrentAdIndex(nextIndex);
      setSecondsRemaining(5);
      // Next ad in sequence might be skippable or non-skippable
      setIsNonSkippable(Math.random() < 0.35);
      triggerImpressionSplit(adBatch[nextIndex], nextIndex + 1);
    } else {
      // Entire batch finished! Auto-dismiss smoothly ("atomic chala jaye")
      setIsAdVisible(false);
      // Schedule the next recurring ad break in exactly 1 minute (60 seconds)
      scheduleNextAdBreak();
    }
  };

  // On mount: if video started without ad (1 out of 5 video), schedule first mid-roll ad in 1 minute!
  useEffect(() => {
    if (variant !== 'below_player') return;

    if (!hasStartingAd) {
      console.log('[VideoPlayerAdMob] Video started ad-free. First mid-roll ad will appear in 60s (1 min).');
      scheduleNextAdBreak();
    }
  }, [variant, hasStartingAd]);

  // Active 5-second countdown timer whenever ad is visible
  useEffect(() => {
    if (variant !== 'below_player' || !isAdVisible) return;

    // Trigger 50:50 impression when ad becomes visible
    triggerImpressionSplit(currentCreative, currentAdIndex + 1);

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    countdownTimerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Timer reached 0! Trigger advance or auto-dismiss
          clearInterval(countdownTimerRef.current as NodeJS.Timeout);
          setTimeout(() => {
            handleCurrentAdEnd();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [variant, isAdVisible, currentAdIndex, adBatch]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (nextAdBreakTimerRef.current) clearTimeout(nextAdBreakTimerRef.current);
    };
  }, []);

  // -------------------------------------------------------------
  // Render Variant 1: In-Feed Native Card (Between Related Videos)
  // 100% Platform Admin Share
  // -------------------------------------------------------------
  if (variant === 'in_feed') {
    return (
      <div 
        id={`admob-infeed-${video.id}`}
        className="group relative p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-slate-900 border border-amber-400/40 hover:border-amber-400 transition-all duration-200 shadow-md"
      >
        <div className="flex items-center justify-between gap-2 mb-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
              {language === 'hi' ? 'विज्ञापन' : 'Ad'}
            </span>
            <span className="text-[10px] text-amber-300/90 font-medium truncate">
              Google AdMob Native (100% Admin)
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{inFeedCreative.rating}</span>
          </div>
        </div>

        <div className="flex gap-2.5">
          <div className="relative aspect-video w-28 sm:w-32 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-amber-400/20">
            <img
              src={inFeedCreative.image}
              alt={inFeedCreative.brandName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-amber-500/90 text-slate-950 text-[9px] font-black">
              PROMO
            </span>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <h4 className="text-xs font-bold text-slate-100 line-clamp-1 group-hover:text-amber-400">
                {language === 'hi' ? inFeedCreative.brandNameHindi : inFeedCreative.brandName}
              </h4>
              <p className="text-[10px] text-slate-300 line-clamp-2 mt-0.5 leading-tight">
                {language === 'hi' ? inFeedCreative.taglineHindi : inFeedCreative.tagline}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-slate-800">
              <span className="text-[9px] text-emerald-400 font-medium">
                {language === 'hi' ? 'सत्यापित स्पॉन्सर' : 'Verified Partner'}
              </span>
              <a
                href={inFeedCreative.targetUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-sm active:scale-95 transition cursor-pointer"
              >
                <span>{language === 'hi' ? inFeedCreative.ctaTextHindi : inFeedCreative.ctaText}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render Variant 2: Below Video Player Ad Unit
  // When hidden: Completely invisible! No text or interval shown.
  // When visible: shows with 5-second countdown & progress bar, then auto-closes.
  // -------------------------------------------------------------
  if (!isAdVisible) {
    // User Requirement: "sponsor ads next interval likha he bo hatao kisi ko pata nahi hona chahiye ki kab ads ayega"
    // Return null so it is 100% hidden and silent when not active!
    return null;
  }

  return (
    <div 
      id="admob-below-player-banner"
      className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-400/60 p-3 sm:p-4 shadow-2xl my-2 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      {/* 5-Second Animated Shrinking Progress Bar (Visual indicator of automatic dismissal) */}
      <div className="absolute top-0 inset-x-0 h-1 bg-slate-800">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000 ease-linear"
          style={{ width: `${Math.max(0, (secondsRemaining / 5) * 100)}%` }}
        />
      </div>

      {/* Header: Ad Badge + 1/2 Indicator + Non-skip Status + 50:50 Revenue Badge + Timer */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pt-1 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Ad Badge with sequence indicator */}
          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span>{language === 'hi' ? 'Ad • विज्ञापन' : 'Ad • Sponsored'}</span>
            {totalInBatch > 1 && (
              <span className="ml-1 px-1.5 py-0.2 rounded bg-black/80 text-amber-300 text-[9px] font-mono font-bold">
                {currentAdIndex + 1} / {totalInBatch}
              </span>
            )}
          </span>

          {/* Non-skippable vs Skippable badge */}
          {isNonSkippable ? (
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{language === 'hi' ? 'अनिवार्य विज्ञापन (5s)' : 'Non-Skip (5s)'}</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-medium hidden sm:inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Google AdMob Partner</span>
            </span>
          )}
        </div>

        {/* Right Controls: Auto-Close Countdown & Skip Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Automatic Close Countdown */}
          <div className="px-2.5 py-1 rounded-lg bg-black/80 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              {language === 'hi'
                ? `स्वतः बंद: ${secondsRemaining}s`
                : `Auto-close: ${secondsRemaining}s`}
            </span>
          </div>

          {/* Skip Ad Button (if not non-skippable) */}
          {!isNonSkippable && (
            <button
              type="button"
              onClick={handleCurrentAdEnd}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700 transition active:scale-95 cursor-pointer"
              title="Skip to next or dismiss"
            >
              <span>{language === 'hi' ? 'छोड़ें' : 'Skip'}</span>
              <SkipForward className="w-3 h-3" />
            </button>
          )}

          {/* Info toggle */}
          <button
            type="button"
            onClick={() => setShowPolicyInfo(!showPolicyInfo)}
            className="p-1 rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
            title="AdMob & Revenue Info"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Policy Explanation Tooltip (when info clicked) */}
      {showPolicyInfo && (
        <div className="mb-3 p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-[11px] text-slate-300 leading-relaxed animate-in fade-in duration-150">
          <p className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'hi' ? '50:50 रेवेन्यू शेयर व 100% AdMob कम्प्लायंट' : '50:50 Revenue Split & 100% AdMob Compliant'}</span>
          </p>
          <p>
            {language === 'hi'
              ? 'यह विज्ञापन वीडियो प्लेयर के नीचे स्थित है। 5 सेकंड बाद यह स्वतः बंद हो जाता है और हर 1 मिनट में नया ब्रेक आता है। इस विज्ञापन का 50% रेवेन्यू सीधे क्रिएटर के वॉलेट में और 50% एडमिन को मिलता है।'
              : 'This ad is placed cleanly below the player. It shows for 5 seconds and auto-dismisses, recurring every 1 minute. 50% of revenue goes directly to the creator and 50% to the admin wallet.'}
          </p>
        </div>
      )}

      {/* Creative Body: Artwork + Text + CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-700">
            <img
              src={currentCreative.image}
              alt={currentCreative.brandName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/80 text-amber-400 font-mono text-[9px] font-bold">
              {currentCreative.rating}
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-slate-100 hover:text-amber-400 transition-colors line-clamp-1">
              {language === 'hi' ? currentCreative.brandNameHindi : currentCreative.brandName}
            </h3>
            <p className="text-xs text-slate-300 line-clamp-2 mt-0.5 leading-snug">
              {language === 'hi' ? currentCreative.taglineHindi : currentCreative.tagline}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-amber-400/90 font-medium">
              <span>{currentCreative.category}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400">{language === 'hi' ? 'सत्यापित ऑफर' : 'Verified Offer'}</span>
            </div>
          </div>
        </div>

        {/* Action CTA Button */}
        <div className="w-full sm:w-auto flex items-center justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 shrink-0">
          <a
            href={currentCreative.targetUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>{language === 'hi' ? currentCreative.ctaTextHindi : currentCreative.ctaText}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
