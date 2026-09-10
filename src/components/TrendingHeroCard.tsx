import React from 'react';
import { Flame, ChevronRight, Sparkles } from 'lucide-react';
import { Language } from '../locales/i18n';

interface TrendingHeroCardProps {
  onExploreTrending?: () => void;
  language?: Language;
}

export const TrendingHeroCard: React.FC<TrendingHeroCardProps> = ({
  onExploreTrending,
  language = 'hi'
}) => {
  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-red-50/80 via-orange-50/50 to-amber-50/30 dark:from-red-950/25 dark:via-orange-950/15 dark:to-amber-950/10 border border-red-200/60 dark:border-red-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs transition-colors">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-red-500/15 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-300/40 dark:border-red-500/30">
          <Flame className="w-5 h-5 fill-red-500/30" />
        </div>
        
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
              {language === 'hi' ? 'ट्रेंडिंग नाउ (Trending Now)' : 'TRENDING NOW'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-semibold border border-red-200 dark:border-red-500/20">
              Live Updates
            </span>
          </div>
          
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {language === 'hi'
              ? 'गेमिंग, संगीत, तकनीक व बुंदेली मनोरंजन में सबसे लोकप्रिय वीडियो देखें'
              : 'Explore the most popular videos across Gaming, Music, Tech & Entertainment worldwide'}
          </h2>
        </div>
      </div>

      {onExploreTrending && (
        <button
          onClick={onExploreTrending}
          className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 shrink-0 self-end sm:self-center cursor-pointer transition-colors"
        >
          <span>{language === 'hi' ? 'चार्ट्स देखें' : 'View charts'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
