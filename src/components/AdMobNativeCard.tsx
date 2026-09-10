import React, { useEffect, useRef } from 'react';
import { ExternalLink, Info, Sparkles, ShieldCheck } from 'lucide-react';
import { Language } from '../locales/i18n';
import { processBannerAdRevenue } from '../lib/revenueService';

interface AdMobNativeCardProps {
  admobNativeId?: string;
  language: Language;
}

export const AdMobNativeCard: React.FC<AdMobNativeCardProps> = ({
  admobNativeId = 'ca-app-pub-5666532653138550/1582894537',
  language
}) => {
  const hasLoggedRevenueRef = useRef(false);

  useEffect(() => {
    if (!hasLoggedRevenueRef.current) {
      hasLoggedRevenueRef.current = true;
      // 100% Banner / Native Ad revenue credited directly to Admin Wallet in Firestore
      processBannerAdRevenue({
        totalAmount: 0.75,
        sponsorBrand: 'AdMob Native Unit',
        bannerPlacement: 'video_feed_scroll_banner',
        bannerId: admobNativeId
      }).catch((e) => console.warn('Banner revenue note:', e));
    }
  }, [admobNativeId]);

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all hover:border-amber-500">
      {/* Header with Sponsored Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-xs">
            Ad • प्रायोजित
          </span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Google AdMob Native Unit
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Verified Ad</span>
        </div>
      </div>

      {/* Ad Creative Artwork & Copy */}
      <div className="space-y-2.5 my-1">
        <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 relative border border-slate-200 dark:border-slate-800">
          <img
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80"
            alt="Sponsored Music Promotion"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-bold text-white">
            <span>बुंदेली स्टूडियो प्रो रिकॉर्डिंग ऐप</span>
            <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-amber-400">4.9 ★</span>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
            {language === 'hi' ? 'घर बैठे रिकॉर्ड करें बुंदेली गीत और रिंगटोन' : 'Record Bundeli Folk & Ringtones with High Quality'}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
            {language === 'hi'
              ? 'स्टूडियो क्वालिटी वोकल रिकॉर्डर और ढोलक-मृदंग ट्रैक फ्री में इस्तेमाल करें। अभी इंस्टॉल करें।'
              : 'Studio vocal recording with folk beats. Free download from Google Play.'}
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {language === 'hi' ? 'प्रायोजित ऐप' : 'Sponsored App'}
        </span>

        <a
          href="https://play.google.com"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-amber-500/20 shrink-0"
        >
          <span>{language === 'hi' ? 'अभी इंस्टॉल करें' : 'Install Now'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
