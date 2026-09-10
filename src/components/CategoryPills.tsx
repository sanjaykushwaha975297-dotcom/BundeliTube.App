import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { Language } from '../locales/i18n';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  language?: Language;
  onOpenExplore?: () => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  language = 'hi',
  onOpenExplore
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative flex items-center w-full group/pills py-0.5 px-0 sm:px-1">
      {/* Left Chevron Button (Desktop) */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute left-0 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-md hidden sm:flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-transform active:scale-95 cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Pills Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none no-scrollbar select-none w-full scroll-smooth"
      >
        {/* Explore / Compass Pill Button (as seen in YouTube app) */}
        <button
          type="button"
          onClick={() => {
            if (onOpenExplore) onOpenExplore();
            else onSelectCategory('trending');
          }}
          className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer border border-transparent"
          title="Explore / Trending"
        >
          <Compass className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 shrink-0" />

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const displayName = language === 'hi' ? cat.hindiName : cat.name;
          return (
            <button
              key={cat.id}
              id={`pill-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 flex items-center shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent'
              }`}
            >
              <span>{displayName}</span>
            </button>
          );
        })}
      </div>

      {/* Right Chevron Button */}
      {showRightArrow && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="absolute right-0 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-md hidden sm:flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-transform active:scale-95 cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
