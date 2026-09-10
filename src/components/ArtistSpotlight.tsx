import React from 'react';
import { TOP_ARTISTS } from '../data/mockData';
import { Crown } from 'lucide-react';
import { Language, translations } from '../locales/i18n';

interface ArtistSpotlightProps {
  onSelectArtist: (artistName: string) => void;
  language?: Language;
}

export const ArtistSpotlight: React.FC<ArtistSpotlightProps> = ({ onSelectArtist, language = 'hi' }) => {
  const t = translations[language];

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-100/70 via-orange-50/50 to-amber-50/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-orange-950/30 border border-amber-200 dark:border-amber-500/20 my-2 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 font-bundeli">
              {t.topArtists}
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {t.artistSpotlightDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Artists Scroll */}
      <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {TOP_ARTISTS.map((artist, idx) => (
          <div
            key={idx}
            onClick={() => onSelectArtist(artist.name.replace('स्व. ', ''))}
            className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-white dark:bg-slate-950/60 hover:bg-amber-50 dark:hover:bg-amber-500/10 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/40 transition-all cursor-pointer shrink-0 w-28 sm:w-32 group shadow-xs"
          >
            <div className="relative mb-2">
              <img
                src={artist.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={artist.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-amber-500/30 group-hover:ring-amber-400 group-hover:scale-105 transition-all"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-[9px] font-extrabold text-slate-950">
                {artist.followers}
              </span>
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate w-full">
              {artist.name}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full mt-0.5">
              {artist.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
