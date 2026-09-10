import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, ExternalLink, Sparkles } from 'lucide-react';
import { AppBanner, Video } from '../types';
import { Language } from '../locales/i18n';

interface DynamicBannerSliderProps {
  banners: AppBanner[];
  autoScrollSeconds?: number;
  onBannerClick: (banner: AppBanner) => void;
  language: Language;
}

export const DynamicBannerSlider: React.FC<DynamicBannerSliderProps> = ({
  banners,
  autoScrollSeconds = 5,
  onBannerClick,
  language
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeBanners = banners.filter(b => b.isActive).sort((a, b) => a.order - b.order);

  // Auto-scroll timer
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, autoScrollSeconds * 1000);

    return () => clearInterval(interval);
  }, [activeBanners.length, autoScrollSeconds]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-amber-500/30 shadow-2xl group select-none">
      {/* Banner Background & Artwork */}
      <div 
        onClick={() => onBannerClick(currentBanner)}
        className="relative aspect-[21/9] sm:aspect-[24/8] lg:aspect-[28/8] w-full overflow-hidden bg-slate-950 cursor-pointer"
      >
        <img
          key={currentBanner.id}
          src={currentBanner.imageUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&auto=format&fit=crop&q=80'}
          alt={currentBanner.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-65 animate-fadeIn"
        />
        
        {/* Subtle Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
      </div>

      {/* Banner Foreground Content */}
      <div 
        onClick={() => onBannerClick(currentBanner)}
        className="absolute bottom-0 inset-x-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-end space-y-2 pointer-events-none"
      >
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-[10px] sm:text-xs flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" />
            {language === 'hi' ? 'विशेष लाइव बैनर (Live Featured)' : 'Live Featured'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-900/90 text-amber-300 font-mono text-[10px] sm:text-xs border border-amber-500/30">
            {currentIndex + 1} / {activeBanners.length}
          </span>
        </div>

        <h2 className="font-bundeli text-lg sm:text-2xl lg:text-3xl font-black text-slate-100 line-clamp-2 max-w-3xl drop-shadow-md">
          {currentBanner.title}
        </h2>

        {currentBanner.subtitle && (
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-1 sm:line-clamp-2 max-w-2xl font-medium">
            {currentBanner.subtitle}
          </p>
        )}

        <div className="pt-2 flex items-center gap-3 pointer-events-auto">
          <button 
            onClick={() => onBannerClick(currentBanner)}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/30 flex items-center gap-2 transition active:scale-95"
          >
            {currentBanner.targetType === 'external' ? (
              <>
                <ExternalLink className="w-4 h-4" />
                <span>{language === 'hi' ? 'वेबसाइट खोलें' : 'Open Link'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{language === 'hi' ? 'अभी देखें (Explore Now)' : 'Explore Now'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-700 transition opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            aria-label="Previous Banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-700 transition opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            aria-label="Next Banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-6 bg-amber-400' : 'w-2 bg-slate-600 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
