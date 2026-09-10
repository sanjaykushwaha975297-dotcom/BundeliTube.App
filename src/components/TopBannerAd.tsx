import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  ArrowUpRight, 
  MoreVertical, 
  X, 
  Info, 
  ShieldCheck, 
  Play, 
  ExternalLink,
  Flag,
  Sparkles
} from 'lucide-react';
import { Language } from '../locales/i18n';
import { Video } from '../types';
import { processBannerAdRevenue } from '../lib/revenueService';

interface TopBannerAdProps {
  admobBannerId?: string;
  language?: Language;
  onPlayVideo?: (video: Video) => void;
  onNavigateToUpload?: () => void;
  onNavigateToChannel?: () => void;
}

interface YouTubeMastheadAd {
  id: string;
  brandName: string;
  brandLogo: string;
  title: string;
  subtitle: string;
  sponsorText: string;
  bannerImage: string;
  watchActionText: string;
  primaryActionText: string;
  primaryActionUrl: string;
  videoData?: Partial<Video>;
}

const YOUTUBE_MASTHEAD_ADS: YouTubeMastheadAd[] = [
  {
    id: 'firebase-genai',
    brandName: 'Firebase',
    brandLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    title: 'Integrate GenAI Seamlessly into your Apps with Firebase.',
    subtitle: "Improve your app's quality and experience with GenAI.",
    sponsorText: 'Sponsored • Firebase',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    watchActionText: 'Watch',
    primaryActionText: 'Sign up',
    primaryActionUrl: 'https://firebase.google.com',
    videoData: {
      title: 'Integrate GenAI Seamlessly into your Apps with Firebase',
      description: "Improve your app's quality and experience with GenAI using Google Cloud & Firebase.",
      youtubeId: 'dQw4w9WgXcQ',
      category: 'creator',
      artist: 'Firebase Team',
      channelName: 'Firebase Official',
      channelAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      views: 1450000,
      likes: 68000,
      duration: '03:45'
    }
  },
  {
    id: 'bundeli-studio-pro',
    brandName: 'Bundeli Studio',
    brandLogo: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100&auto=format&fit=crop&q=80',
    title: 'रिकॉर्ड करें 4K बुंदेली राई, लोकगीत व हारमोनियम वोकल्स स्टूडियो प्रो में',
    subtitle: 'देसी ढोलक बीट्स और वोकल रिकॉर्डिंग के लिए 100% फ्री स्टूडियो ऐप।',
    sponsorText: 'Sponsored • Bundeli Studio Pro',
    bannerImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
    watchActionText: 'Watch Demo',
    primaryActionText: 'Install App',
    primaryActionUrl: 'https://play.google.com',
    videoData: {
      title: 'बुंदेली स्टूडियो प्रो (Bundeli Studio Pro) - 4K ऑडियो व वोकल रिकॉर्डिंग ट्यूटोरियल',
      description: 'देसी ढोलक, हारमोनियम और बुंदेली राई बीट्स के साथ हाई क्वालिटी स्टूडियो साउंड रिकॉर्ड करें।',
      youtubeId: 'dQw4w9WgXcQ',
      category: 'lokgeet',
      artist: 'बुंदेली स्टूडियो टीम',
      channelName: 'Bundeli Studio Apps',
      channelAvatar: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100&auto=format&fit=crop&q=80',
      views: 920000,
      likes: 42000,
      duration: '08:15'
    }
  },
  {
    id: 'priyansh-music',
    brandName: 'Priyansh Audio',
    brandLogo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80',
    title: 'प्रियांश म्यूजिक स्टूडियो - बुंदेली लोक-कलाकारों के लिए स्पेशल 45% डिस्काउंट',
    subtitle: 'लाइव कीर्तन, राई व स्टेज रिकॉर्डिंग माइक और साउंडकार्ड इक्विपमेंट।',
    sponsorText: 'Sponsored • Priyansh Music Works',
    bannerImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
    watchActionText: 'Watch',
    primaryActionText: 'Shop Now',
    primaryActionUrl: 'https://amazon.in',
    videoData: {
      title: 'प्रियांश म्यूजिक स्टूडियो - न्यू बुंदेली राई व लोकगीत रिकॉर्डिंग सेशन 2026',
      description: 'प्रियांश म्यूजिक स्टूडियो द्वारा प्रस्तुत लेटेस्ट जवाबी राई और ढिमरयाई गीत।',
      youtubeId: 'dQw4w9WgXcQ',
      category: 'rai',
      artist: 'प्रियांश म्यूजिक टीम',
      channelName: 'Priyansh Music Studio',
      channelAvatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80',
      views: 650000,
      likes: 31000,
      duration: '12:40'
    }
  }
];

export const TopBannerAd: React.FC<TopBannerAdProps> = ({
  admobBannerId = 'ca-app-pub-5666532653138550/9305658265',
  language = 'hi',
  onPlayVideo,
  onNavigateToUpload,
  onNavigateToChannel
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isCcActive, setIsCcActive] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasLoggedRevenueRef = useRef<Record<string, boolean>>({});

  const ad = YOUTUBE_MASTHEAD_ADS[currentIdx] || YOUTUBE_MASTHEAD_ADS[0];

  // Auto-switch between masthead ads periodically
  useEffect(() => {
    if (isDismissed) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % YOUTUBE_MASTHEAD_ADS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [isDismissed]);

  // Click outside to close 3-dots menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Revenue logging for AdMob / Masthead Impression
  useEffect(() => {
    if (!hasLoggedRevenueRef.current[ad.id]) {
      hasLoggedRevenueRef.current[ad.id] = true;
      processBannerAdRevenue({
        totalAmount: 2.50,
        sponsorBrand: ad.brandName,
        bannerPlacement: 'home_sticky_banner',
        bannerId: admobBannerId
      }).catch((e) => console.warn('Masthead Ad revenue note:', e));
    }
  }, [ad.id, ad.brandName, admobBannerId]);

  if (isDismissed) return null;

  const handleWatch = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onPlayVideo && ad.videoData) {
      const videoObj: Video = {
        id: `ad-${ad.id}`,
        title: ad.videoData.title || ad.title,
        description: ad.videoData.description || ad.subtitle,
        youtubeId: ad.videoData.youtubeId || 'dQw4w9WgXcQ',
        thumbnail: ad.bannerImage,
        category: ad.videoData.category || 'lokgeet',
        artist: ad.videoData.artist || ad.brandName,
        channelId: `chan-${ad.id}`,
        channelName: ad.videoData.channelName || ad.brandName,
        channelAvatar: ad.brandLogo,
        status: 'published',
        views: ad.videoData.views || 890000,
        likes: ad.videoData.likes || 45000,
        duration: ad.videoData.duration || '05:30',
        uploadDate: 'Sponsored Ad',
        isVerified: true,
        isMonetized: true,
        hasPaidPromotion: true,
        sponsorName: ad.brandName,
        tags: ['Sponsored', 'AdMob', 'Masthead', 'YouTube Ad']
      };
      onPlayVideo(videoObj);
    } else if (ad.primaryActionUrl) {
      window.open(ad.primaryActionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePrimaryAction = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (ad.primaryActionUrl) {
      window.open(ad.primaryActionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full pb-4 mb-2 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 select-none">
      
      {/* 1. Large 16:9 Masthead Media Canvas */}
      <div 
        onClick={() => handleWatch()}
        className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[16/7] lg:aspect-[16/6] max-h-[420px] bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-none sm:rounded-xl overflow-hidden cursor-pointer group shadow-sm"
      >
        {/* Ad Graphic Background with perspective rays/mockup */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center overflow-hidden">
          
          {/* Radial / Conic background beams matching screenshot */}
          <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-200 via-orange-400 to-amber-700" />
          
          {/* Decorative perspective light lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

          {/* Center Graphic Laptop/Mockup Frame matching screenshot */}
          <div className="relative z-10 w-[75%] sm:w-[55%] md:w-[45%] max-w-[460px] aspect-[16/10] bg-slate-950/90 rounded-lg p-2.5 sm:p-3 border border-slate-700/80 shadow-2xl flex flex-col justify-between transform group-hover:scale-[1.02] transition-transform duration-300">
            {/* Mockup Header bar */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[9px] font-mono text-slate-400 font-bold">
                {ad.brandName} • GenAI Engine
              </span>
            </div>

            {/* Mockup Body with Charts & Data Waves */}
            <div className="flex-1 py-2 flex gap-2 items-center">
              <div className="flex-1 h-full bg-slate-900/90 rounded border border-slate-800 p-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="h-1.5 w-16 bg-amber-400/80 rounded" />
                  <div className="h-1 w-24 bg-slate-700 rounded" />
                </div>
                {/* SVG Graph wave */}
                <svg className="w-full h-8 text-amber-400" viewBox="0 0 100 30" fill="none">
                  <path d="M0 25 Q 25 5, 50 18 T 100 8" stroke="currentColor" strokeWidth="2.5" fill="none" />
                </svg>
              </div>

              <div className="w-1/3 h-full bg-slate-900/90 rounded border border-slate-800 p-1.5 hidden sm:flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="h-1 w-full bg-slate-700 rounded" />
                  <div className="h-1 w-3/4 bg-slate-700 rounded" />
                </div>
                <div className="h-3 w-full bg-amber-500/20 border border-amber-500/40 rounded flex items-center justify-center">
                  <span className="text-[7px] text-amber-300 font-bold">LIVE API</span>
                </div>
              </div>
            </div>

            {/* Mockup Footer */}
            <div className="pt-1 flex items-center justify-between text-[8px] text-slate-400 font-mono">
              <span>● Online Active</span>
              <span className="text-amber-400">4K 60FPS</span>
            </div>
          </div>
        </div>

        {/* Top-Right Floating Actions (Mute + CC) matching screenshot */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
          {/* Mute Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md shadow-md transition-transform active:scale-90 cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* CC (Closed Captions) Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCcActive(!isCcActive);
            }}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${
              isCcActive ? 'bg-white text-black font-black' : 'bg-black/70 hover:bg-black/90 text-white font-bold'
            } flex items-center justify-center text-xs tracking-tighter backdrop-blur-md shadow-md transition-transform active:scale-90 cursor-pointer`}
            title="Captions"
          >
            CC
          </button>
        </div>

        {/* Bottom-Right Floating External Link (↗) Button matching screenshot */}
        <div className="absolute bottom-3 right-3 z-20">
          <button
            type="button"
            onClick={(e) => handlePrimaryAction(e)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md shadow-md transition-transform active:scale-90 cursor-pointer group-hover:scale-105"
            title="Open Link"
          >
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2. Metadata Section below Media (Brand Icon + Title/Subtitle/Sponsored + 3 Dots) */}
      <div className="pt-3 px-3 sm:px-1 flex items-start gap-3 justify-between">
        
        {/* Brand Circular Avatar/Logo matching screenshot */}
        <div 
          onClick={() => handleWatch()}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm shrink-0 flex items-center justify-center overflow-hidden cursor-pointer mt-0.5"
        >
          <img
            src={ad.brandLogo}
            alt={ad.brandName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-1">
          <h3 
            onClick={() => handleWatch()}
            className="text-sm sm:text-base font-semibold sm:font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            {ad.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-normal line-clamp-2 mt-0.5 font-normal">
            {ad.subtitle}
          </p>

          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {ad.sponsorText}
            </span>
          </div>
        </div>

        {/* 3-Dots Vertical Action Menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Ad options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Menu Dropdown */}
          {showMenu && (
            <div className="absolute right-0 top-8 z-30 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setShowMenu(false);
                  handlePrimaryAction();
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
              >
                <ExternalLink className="w-4 h-4 text-slate-500" />
                <span>Visit advertiser website</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  setIsDismissed(true);
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-red-600 dark:text-red-400"
              >
                <X className="w-4 h-4" />
                <span>Hide this ad</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Two Large YouTube Pill CTA Buttons: [Watch] & [Sign up / Action] matching screenshot */}
      <div className="pt-3 px-3 sm:px-1 flex items-center gap-3 w-full">
        {/* Left Pill: Watch */}
        <button
          type="button"
          onClick={() => handleWatch()}
          className="flex-1 py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium sm:font-semibold text-xs sm:text-sm text-center transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          {ad.watchActionText}
        </button>

        {/* Right Pill: Sign up / Action */}
        <button
          type="button"
          onClick={() => handlePrimaryAction()}
          className="flex-1 py-2.5 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-semibold sm:font-bold text-xs sm:text-sm text-center transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          {ad.primaryActionText}
        </button>
      </div>

    </div>
  );
};
