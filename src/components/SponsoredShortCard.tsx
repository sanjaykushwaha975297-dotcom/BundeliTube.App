import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  ChevronDown, 
  Clock, 
  CheckCircle2, 
  Award, 
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Language } from '../locales/i18n';

interface SponsorCampaign {
  id: string;
  brandNameHindi: string;
  brandNameEng: string;
  categoryHindi: string;
  headlineHindi: string;
  headlineEng: string;
  descriptionHindi: string;
  descriptionEng: string;
  ctaTextHindi: string;
  ctaTextEng: string;
  targetUrl: string;
  imageUrl: string;
  rating: number;
  reviewsCount: string;
}

const SPONSOR_CAMPAIGNS: SponsorCampaign[] = [
  {
    id: 'kusum-solar-01',
    brandNameHindi: 'पीएम-कुसुम योजना (सोलर पंप)',
    brandNameEng: 'PM-KUSUM Solar Irrigation',
    categoryHindi: 'सरकारी कृषि सब्सिडी',
    headlineHindi: 'खेत में लगाएं 90% सब्सिडी पर सोलर पंप',
    headlineEng: 'Get 90% Subsidy on Farm Solar Pumps',
    descriptionHindi: 'बुंदेलखंड के सभी किसान भाइयों के लिए निःशुल्क सिंचाई व बिजली बिल से पूरी मुक्ति। सीमित स्लॉट उपलब्ध।',
    descriptionEng: 'Free irrigation and zero electricity bills for Bundelkhand farmers. Apply before deadline.',
    ctaTextHindi: 'सब्सिडी हेतु आवेदन करें',
    ctaTextEng: 'Apply for Subsidy',
    targetUrl: 'https://pmkusum.mnre.gov.in',
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: '12.4k'
  },
  {
    id: 'bundeli-oil-02',
    brandNameHindi: 'बुंदेली शुद्ध कच्ची घानी सरसों तेल',
    brandNameEng: 'Bundeli Mustard Oil Co.',
    categoryHindi: 'देसी जैविक उत्पाद',
    headlineHindi: '100% शुद्ध देशी कोल्हू का तेल - सेहत का असली स्वाद',
    headlineEng: '100% Pure Cold-Pressed Mustard Oil',
    descriptionHindi: 'झांसी, बाँदा व चित्रकूट के किसानों के खेतों से सीधे आपके घर तक। बिना किसी मिलावट के ताजा तेल।',
    descriptionEng: 'Cold-pressed traditional mustard oil straight from Bundelkhand farmlands to your home.',
    ctaTextHindi: 'घर बैठे 20% छूट पर मंगाएं',
    ctaTextEng: 'Order at 20% Off',
    targetUrl: 'https://bundelimaati.in',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: '8.9k'
  },
  {
    id: 'krishi-tractor-03',
    brandNameHindi: 'बुंदेलखंड कृषि यंत्र व ट्रैक्टर मेला',
    brandNameEng: 'Bundelkhand Farm Tech Fair',
    categoryHindi: 'कृषि मेला 2025',
    headlineHindi: 'आधुनिक रोटावेटर, कल्टीवेटर व रीपर पर भारी छूट',
    headlineEng: 'Mega Discount on Modern Farm Machinery',
    descriptionHindi: 'सरल किस्तों और ब्याज मुक्त लोन पर ट्रैक्टर व आधुनिक कृषि यंत्र आज ही बुक करें।',
    descriptionEng: 'Get modern farm machinery with zero-interest financing and government subsidy pass.',
    ctaTextHindi: 'ऑफर व डीलरशिप देखें',
    ctaTextEng: 'View Offers & Dealers',
    targetUrl: 'https://agricoop.nic.in',
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: '15.1k'
  }
];

interface SponsoredShortCardProps {
  onAdCompleted: (revenue: number) => void;
  onSkip?: () => void;
  language: Language;
  activeShortTitle?: string;
  creatorName?: string;
  recent5Watched?: { videoId: string; creatorId?: string; creatorName?: string; channelName?: string }[];
}

export const SponsoredShortCard: React.FC<SponsoredShortCardProps> = ({
  onAdCompleted,
  onSkip,
  language,
  activeShortTitle,
  creatorName,
  recent5Watched = []
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [campaignIndex, setCampaignIndex] = useState(() => Math.floor(Math.random() * SPONSOR_CAMPAIGNS.length));
  const campaign = SPONSOR_CAMPAIGNS[campaignIndex] || SPONSOR_CAMPAIGNS[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // When timer hits 0, auto-transition after 1 extra second unless user clicked CTA
  useEffect(() => {
    if (secondsRemaining === 0) {
      const autoTimeout = setTimeout(() => {
        handleFinishAd();
      }, 1500);
      return () => clearTimeout(autoTimeout);
    }
  }, [secondsRemaining]);

  const handleFinishAd = () => {
    onAdCompleted(0.20); // 50% split of ₹0.40 CPM
  };

  const handleCtaClick = () => {
    try {
      window.open(campaign.targetUrl, '_blank', 'noopener,noreferrer');
    } catch (_) {}
    handleFinishAd();
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-300">
      {/* Background Creative with Atmospheric Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={campaign.imageUrl}
          alt={campaign.brandNameHindi}
          className="w-full h-full object-cover scale-105 filter blur-[1px] brightness-75 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />
      </div>

      {/* Top Bar: Policy Verified Ad Badge & Skip Countdown */}
      <div className="relative z-10 p-4 pt-safe flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-black shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{language === 'hi' ? 'प्रायोजित विज्ञापन' : 'Sponsored Reel'}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-300/80 hidden sm:inline-block">
            AdMob Partner
          </span>
        </div>

        {/* Skip Button / Timer */}
        <div className="flex items-center gap-2">
          {canSkip || secondsRemaining === 0 ? (
            <button
              onClick={handleFinishAd}
              className="px-4 py-1.5 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition-all shadow-lg shadow-black/50 cursor-pointer flex items-center gap-1.5 animate-in zoom-in-95"
            >
              <span>{language === 'hi' ? 'छोड़ें (Skip)' : 'Skip Ad'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{secondsRemaining}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Center Showcase: Brand Card & Offer Highlight */}
      <div className="relative z-10 px-6 py-4 flex flex-col items-center text-center space-y-4 my-auto">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-2xl ring-4 ring-amber-400/20">
          <div className="w-full h-full rounded-2xl bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-2 text-center">
            <Zap className="w-8 h-8 text-amber-400 fill-amber-400" />
          </div>
        </div>

        <div className="space-y-1.5 max-w-sm">
          <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? campaign.categoryHindi : campaign.brandNameEng}</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-bundeli leading-tight drop-shadow-md">
            {language === 'hi' ? campaign.headlineHindi : campaign.headlineEng}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed drop-shadow line-clamp-3">
            {language === 'hi' ? campaign.descriptionHindi : campaign.descriptionEng}
          </p>
        </div>

        {/* Verified Credibility Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'सत्यापित व्यावसायिक भागीदार • 4.9 ★ रेटिंग' : 'Verified Partner • 4.9 ★'}</span>
        </div>
      </div>

      {/* Bottom Area: High-Visibility CTA */}
      <div className="relative z-10 p-5 space-y-3 bg-gradient-to-t from-black via-black/95 to-transparent pb-safe">
        {/* Primary Action Button (Call-to-Action) */}
        <button
          onClick={handleCtaClick}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>{language === 'hi' ? campaign.ctaTextHindi : campaign.ctaTextEng}</span>
          <ExternalLink className="w-4 h-4" />
        </button>

        {/* Next Short Swipe Hint */}
        <button
          onClick={handleFinishAd}
          className="w-full text-center text-xs text-slate-400 hover:text-white transition py-1 flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>{language === 'hi' ? 'अगला शॉर्ट्स वीडियो देखें' : 'Continue to Next Short'}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
