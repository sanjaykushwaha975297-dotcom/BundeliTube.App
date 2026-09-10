import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Play, 
  CheckCircle2, 
  SkipForward,
  Megaphone,
  Info
} from 'lucide-react';
import { Language } from '../locales/i18n';

export interface SponsorAd {
  id: string;
  brandName: string;
  brandNameHindi: string;
  tagline: string;
  taglineHindi: string;
  category: string;
  logo: string;
  videoBgUrl: string;
  ctaText: string;
  ctaTextHindi: string;
  targetUrl: string;
  cpmRate: number; // e.g., ₹35 CPM => ₹0.35 per ad impression (revenue share to creator)
  creatorRevenuePerView: number;
}

export const SPONSOR_ADS: SponsorAd[] = [
  {
    id: 'ad-bundeli-mustard-oil',
    brandName: 'Bundelkhand Shuddh Sarson Tel',
    brandNameHindi: 'बुंदेलखंड शुद्ध कच्ची घानी सरसों तेल',
    tagline: '100% Pure Desi Wood Pressed Mustard Oil - Taste of Bundelkhand Soil',
    taglineHindi: '100% शुद्ध लकड़ी कोल्हू का तेल — बुंदेलखंड की माटी का असली स्वाद व सुगंध',
    category: 'देसी कृषि उत्पाद (Agro Food)',
    logo: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&auto=format&fit=crop&q=80',
    videoBgUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80',
    ctaText: 'Buy Pure Oil',
    ctaTextHindi: 'शुद्ध तेल ऑर्डर करें (Shop Now)',
    targetUrl: 'https://bundelitube.com/sponsors/mustard-oil',
    cpmRate: 40.0,
    creatorRevenuePerView: 0.35
  },
  {
    id: 'ad-mahindra-tractor',
    brandName: 'Mahindra Tractor Bundelkhand Mela',
    brandNameHindi: 'महिन्द्रा ट्रैक्टर बुंदेलखंड किसान मेला 2026',
    tagline: 'Tough Power for Bundelkhand Farms - Zero Downpayment Offer',
    taglineHindi: 'बुंदेलखंड के पथरीले खेतों का बाहुबली ट्रैक्टर — 0% ब्याज व विशेष किसान छूट!',
    category: 'कृषि एवं वाहन (Agriculture & Auto)',
    logo: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=150&auto=format&fit=crop&q=80',
    videoBgUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=1200&auto=format&fit=crop&q=80',
    ctaText: 'Book Test Drive',
    ctaTextHindi: 'मुफ्त टेस्ट ड्राइव बुक करें',
    targetUrl: 'https://bundelitube.com/sponsors/tractor-mela',
    cpmRate: 45.0,
    creatorRevenuePerView: 0.40
  },
  {
    id: 'ad-maihar-yatra',
    brandName: 'Maa Sharda Maihar Dham Special Yatra',
    brandNameHindi: 'मां शारदा मैहर धाम विशेष दर्शन एवं यात्रा सेवा',
    tagline: 'Deluxe AC Bus & VIP Darshan Package from Jhansi/Sagar/Chhatarpur',
    taglineHindi: 'झांसी, सागर, छतरपुर से मैहर देवी के सुलभ दर्शन व वीआईपी यात्रा पैकेज',
    category: 'तीर्थ एवं पर्यटन (Devotional Tourism)',
    logo: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=150&auto=format&fit=crop&q=80',
    videoBgUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&auto=format&fit=crop&q=80',
    ctaText: 'Book Yatra Ticket',
    ctaTextHindi: 'यात्रा टिकट बुक करें',
    targetUrl: 'https://bundelitube.com/sponsors/maihar-yatra',
    cpmRate: 35.0,
    creatorRevenuePerView: 0.30
  },
  {
    id: 'ad-bundeli-jewellers',
    brandName: 'Bundeli Traditional Gold Jewellers',
    brandNameHindi: 'बुंदेली पारंपरिक आभूषण व करवा चौथ स्पेशल गहने',
    tagline: 'Certified 916 Hallmark Bundelkhandi Hasli, Payal & Karadhani',
    taglineHindi: 'हंसली, करधनी, बिछिया व पैंजनिया के प्रामाणिक हॉलमार्क बुंदेली डिजाइन्स',
    category: 'पारंपरिक आभूषण (Jewellery)',
    logo: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=150&auto=format&fit=crop&q=80',
    videoBgUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&auto=format&fit=crop&q=80',
    ctaText: 'View Catalogue',
    ctaTextHindi: 'कैटलॉग देखें (View Designs)',
    targetUrl: 'https://bundelitube.com/sponsors/jewellery',
    cpmRate: 50.0,
    creatorRevenuePerView: 0.50
  }
];

interface AdOverlayProps {
  onAdCompleted: (revenue: number) => void;
  language: Language;
  videoTitle: string;
  creatorName: string;
  adType?: 'pre-roll' | 'mid-roll';
  pauseTimestamp?: string;
}

export const AdOverlay: React.FC<AdOverlayProps> = ({
  onAdCompleted,
  language,
  videoTitle,
  creatorName,
  adType = 'pre-roll',
  pauseTimestamp
}) => {
  // Determine if this ad pod has 1 or 2 ads (like YouTube dual ads)
  const [totalAds] = useState<number>(() => {
    // 45% chance of 2 back-to-back ads
    return Math.random() < 0.45 ? 2 : 1;
  });

  const [currentAdIndex, setCurrentAdIndex] = useState<number>(1); // 1 or 2
  const [totalEarnedRevenue, setTotalEarnedRevenue] = useState<number>(0);

  // Pick random sponsor ad for slot 1 and slot 2
  const [ad1] = useState<SponsorAd>(() => {
    const idx = Math.floor(Math.random() * SPONSOR_ADS.length);
    return SPONSOR_ADS[idx] || SPONSOR_ADS[0];
  });
  const [ad2] = useState<SponsorAd>(() => {
    const remaining = SPONSOR_ADS.filter(a => a.id !== ad1.id);
    const idx = Math.floor(Math.random() * remaining.length);
    return remaining[idx] || SPONSOR_ADS[0];
  });

  // Current active ad in sequence
  const currentAd = currentAdIndex === 1 ? ad1 : ad2;

  // Determine if the current ad is Non-Skippable (35% probability for 6s bumper non-skippable ad)
  const [isNonSkippable, setIsNonSkippable] = useState<boolean>(() => {
    return Math.random() < 0.35;
  });

  const adDuration = isNonSkippable ? 6 : 5;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(adDuration);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Countdown timer for current ad
  useEffect(() => {
    setSecondsRemaining(adDuration);
    setCanSkip(false);

    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (isNonSkippable) {
            // Auto-finish non-skippable ad immediately when countdown reaches 0
            setTimeout(() => {
              advanceOrCompleteAd();
            }, 300);
            return 0;
          } else {
            setCanSkip(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentAdIndex, isNonSkippable]);

  const advanceOrCompleteAd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const addedRevenue = currentAd.creatorRevenuePerView;
    const newTotal = totalEarnedRevenue + addedRevenue;
    setTotalEarnedRevenue(newTotal);

    if (totalAds === 2 && currentAdIndex === 1) {
      // Transition seamlessly to Ad 2 of 2!
      setCurrentAdIndex(2);
      // Ad 2 might be skippable or non-skippable
      setIsNonSkippable(Math.random() < 0.3);
    } else {
      // Finished all ads in the sequence
      if (!hasCompleted) {
        setHasCompleted(true);
        onAdCompleted(newTotal);
      }
    }
  };

  const handleSkipOrFinish = () => {
    advanceOrCompleteAd();
  };

  const handleVisitSponsor = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(currentAd.targetUrl, '_blank');
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950 flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-300">
      {/* Background Simulated High-Def Video Ad Layer with ambient animation */}
      <div className="absolute inset-0 z-0">
        <img
          key={currentAd.id}
          src={currentAd.videoBgUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'}
          alt={currentAd.brandName}
          className="w-full h-full object-cover filter brightness-[0.7] scale-105 animate-pulse transition-all duration-700"
          style={{ animationDuration: '6s' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80" />
      </div>

      {/* Top Ad Info Bar: Ad Badge (Ad 1 of 2), Playing Duration & Mute */}
      {/* Top Ad Info Header */}
      <div className="relative z-10 p-2 sm:p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Ad badge & Countdown */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-black/80 text-white text-[10px] sm:text-xs font-bold border border-white/20 backdrop-blur-md">
            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[9px] sm:text-[10px] uppercase">
              {language === 'hi' ? 'विज्ञापन' : 'Ad'}
            </span>
            <span className="font-mono text-amber-300">
              {secondsRemaining > 0 ? `${secondsRemaining}s` : '0s'}
            </span>
          </div>
        </div>

        {/* Audio Mute / Unmute Button */}
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className="p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 transition cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />}
        </button>
      </div>

      {/* Center Sponsor Showcase & Branding */}
      <div className="relative z-10 px-3 sm:px-8 py-1 max-w-2xl mx-auto text-center flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 my-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{currentAd.category}</span>
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-3 max-w-full">
          <img
            src={currentAd.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={currentAd.brandName}
            className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover ring-2 ring-amber-400/50 shadow-xl shrink-0"
          />
          <div className="text-left min-w-0">
            <h3 className="text-sm sm:text-2xl font-black text-white font-bundeli leading-tight drop-shadow-md truncate">
              {language === 'hi' ? currentAd.brandNameHindi : currentAd.brandName}
            </h3>
            <p className="text-[10px] sm:text-sm text-slate-200 line-clamp-1">
              {language === 'hi' ? currentAd.taglineHindi : currentAd.tagline}
            </p>
          </div>
        </div>

        <div className="pt-0.5 sm:pt-2">
          <button
            type="button"
            onClick={handleVisitSponsor}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] sm:text-sm shadow-xl shadow-amber-500/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>{language === 'hi' ? currentAd.ctaTextHindi : currentAd.ctaText}</span>
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Ad Action Bar with YouTube-Style Skip Ad Button or Non-Skippable Progress */}
      <div className="relative z-10 p-2 sm:p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between gap-2 sm:gap-3">
        {/* Next Up Video Cue */}
        <div className="text-left max-w-[55%] sm:max-w-md truncate">
          <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">
            {totalAds === 2 && currentAdIndex === 1
              ? (language === 'hi' ? 'अगला विज्ञापन (Ad 2/2)' : 'Next Ad (2 of 2)')
              : (adType === 'mid-roll'
                  ? (language === 'hi' ? `रुका: ${pauseTimestamp || ''}` : `Paused: ${pauseTimestamp || ''}`)
                  : (language === 'hi' ? 'विज्ञापन के बाद:' : 'Up next:'))}
          </p>
          <p className="text-[11px] sm:text-xs font-bold text-white truncate drop-shadow-sm">
            {videoTitle}
          </p>
        </div>

        {/* Dynamic Skip Ad Button OR Non-Skippable Countdown Indicator */}
        <div className="shrink-0">
          {isNonSkippable ? (
            /* Non-Skippable Countdown indicator bar */
            <div className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-black/80 border border-white/20 text-white text-[10px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2.5 backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>
                {language === 'hi' 
                  ? `${secondsRemaining}s बाद शुरू` 
                  : `${secondsRemaining}s`}
              </span>
            </div>
          ) : canSkip ? (
            /* Skippable button unlocked */
            <button
              type="button"
              id="btn-skip-ad"
              onClick={handleSkipOrFinish}
              className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] sm:text-sm flex items-center gap-1.5 shadow-2xl shadow-amber-500/40 transition transform active:scale-95 cursor-pointer animate-pulse"
            >
              <span>
                {totalAds === 2 && currentAdIndex === 1
                  ? (language === 'hi' ? 'Next Ad' : 'Next Ad')
                  : (language === 'hi' ? 'स्किप करें' : 'Skip Ad')}
              </span>
              <SkipForward className="w-3.5 h-3.5 fill-current stroke-[2]" />
            </button>
          ) : (
            /* Skippable countdown timer */
            <div className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 text-[10px] sm:text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              <span>
                {language === 'hi'
                  ? `स्किप (${secondsRemaining}s)`
                  : `Skip in ${secondsRemaining}s`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
