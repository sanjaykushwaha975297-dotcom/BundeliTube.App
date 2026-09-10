import React, { useState } from 'react';
import { 
  X, 
  BarChart3, 
  Eye, 
  Clock, 
  IndianRupee, 
  TrendingUp, 
  Users, 
  Globe2, 
  Smartphone, 
  Tv, 
  Share2, 
  Sparkles, 
  Calendar, 
  Percent, 
  CheckCircle2,
  ExternalLink,
  Edit3,
  Image as ImageIcon,
  Flame,
  Search,
  ThumbsUp,
  Megaphone
} from 'lucide-react';
import { Video } from '../../types';
import { Language, translations } from '../../locales/i18n';

interface VideoAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video;
  language: Language;
  onEditVideo?: (video: Video) => void;
  onOpenPlayer?: (video: Video) => void;
}

export const VideoAnalyticsModal: React.FC<VideoAnalyticsModalProps> = ({
  isOpen,
  onClose,
  video,
  language,
  onEditVideo,
  onOpenPlayer
}) => {
  const t = translations[language];
  const [timeRange, setTimeRange] = useState<'7d' | '28d' | '90d' | 'lifetime'>('28d');
  const [activeMetricTab, setActiveMetricTab] = useState<'views' | 'watch_time' | 'revenue' | 'ctr'>('views');

  if (!isOpen || !video) return null;

  const views = video.views || 145000;
  const impressions = video.impressions || Math.round(views * 8.6);
  const ctr = video.ctr || 11.4;
  const earnings = video.estimatedEarnings || Math.round((views / 1000) * (video.rpm || 35));
  const watchTimeHours = video.watchTimeHours || Math.round((views * 4.5) / 60);
  const rpm = video.rpm || 35;
  const likes = video.likes || Math.round(views * 0.045);

  // Dynamic multipliers based on selected time range
  const rangeMultiplier = timeRange === '7d' ? 0.35 : (timeRange === '28d' ? 1.0 : (timeRange === '90d' ? 2.4 : 3.8));
  const currentViews = Math.round(views * rangeMultiplier);
  const currentEarnings = Math.round(earnings * rangeMultiplier);
  const currentWatchHours = Math.round(watchTimeHours * rangeMultiplier);

  // Mock Sparkline / Area Chart Data for selected metric
  const chartPoints = [
    { day: 'Day 1', val: 30 },
    { day: 'Day 4', val: 45 },
    { day: 'Day 8', val: 78 },
    { day: 'Day 12', val: 62 },
    { day: 'Day 16', val: 95 },
    { day: 'Day 20', val: 84 },
    { day: 'Day 24', val: 110 },
    { day: 'Day 28', val: 135 },
  ];

  return (
    <div id="video-analytics-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 my-6 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                <span>{language === 'hi' ? 'वीडियो एनालिटिक्स व आंकड़े' : 'Video Analytics'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  {video.isMonetized ? '₹35 CPM Active' : 'Live'}
                </span>
                {video.hasPaidPromotion && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
                    <Megaphone className="w-3 h-3" />
                    <span>पेड प्रमोशन</span>
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {video.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Video Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-24 sm:w-32 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[9px] font-mono text-slate-200">
                  {video.duration || '12:40'}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xs sm:text-sm text-slate-100 line-clamp-1">{video.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  <span>📅 {video.uploadDate || '3 दिन पहले'}</span>
                  <span>🎨 {video.category.toUpperCase()}</span>
                  <span>🎤 {video.artist}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onEditVideo && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditVideo(video);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'hi' ? 'थंबनेल व शीर्षक बदलें' : 'Edit Video'}</span>
                </button>
              )}

              {onOpenPlayer && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPlayer(video);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'प्लेयर में देखें' : 'Watch'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Time Filter Bar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-300">
              {language === 'hi' ? 'समय अवधि चुनें:' : 'Select Range:'}
            </span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  timeRange === '7d' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                7 दिन
              </button>
              <button
                onClick={() => setTimeRange('28d')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  timeRange === '28d' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                28 दिन
              </button>
              <button
                onClick={() => setTimeRange('90d')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  timeRange === '90d' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                90 दिन
              </button>
              <button
                onClick={() => setTimeRange('lifetime')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  timeRange === 'lifetime' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                लाइफटाइम
              </button>
            </div>
          </div>

          {/* 4 Interactive KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Views */}
            <button
              type="button"
              onClick={() => setActiveMetricTab('views')}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                activeMetricTab === 'views'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold">{language === 'hi' ? 'कुल व्यूज' : 'Views'}</span>
                <Eye className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
                  {currentViews.toLocaleString('en-IN')}
                </span>
                <span className="block text-[10px] text-emerald-400 font-bold mt-0.5">
                  ↑ 32.4% सामान्य से अधिक
                </span>
              </div>
            </button>

            {/* 2. Watch Hours */}
            <button
              type="button"
              onClick={() => setActiveMetricTab('watch_time')}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                activeMetricTab === 'watch_time'
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/30'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold">{language === 'hi' ? 'वॉच टाइम (घंटे)' : 'Watch Hours'}</span>
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
                  {currentWatchHours.toLocaleString('en-IN')}
                </span>
                <span className="block text-[10px] text-blue-400 font-bold mt-0.5">
                  औसत: 4:38 मिनट / व्यू
                </span>
              </div>
            </button>

            {/* 3. CTR & Impressions */}
            <button
              type="button"
              onClick={() => setActiveMetricTab('ctr')}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                activeMetricTab === 'ctr'
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/30'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold">{language === 'hi' ? 'सीटीआर (CTR %)' : 'CTR'}</span>
                <Percent className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
                  {ctr}%
                </span>
                <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                  इम्प्रेशन्स: {(impressions / 1000000).toFixed(1)}M
                </span>
              </div>
            </button>

            {/* 4. Estimated Revenue */}
            <button
              type="button"
              onClick={() => setActiveMetricTab('revenue')}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                activeMetricTab === 'revenue'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold">{language === 'hi' ? 'अनुमानित कमाई' : 'Revenue'}</span>
                <IndianRupee className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  ₹{currentEarnings.toLocaleString('en-IN')}
                </span>
                <span className="block text-[10px] text-emerald-400 font-bold mt-0.5">
                  RPM: ₹{rpm}.00 / 1K
                </span>
              </div>
            </button>
          </div>

          {/* Performance Trend Visual Graph (Custom SVG Vector Line Chart) */}
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-200">
                  {activeMetricTab === 'views' && (language === 'hi' ? 'दैनिक व्यूज प्रगति ग्राफ' : 'Daily Views Performance')}
                  {activeMetricTab === 'watch_time' && (language === 'hi' ? 'वॉच टाइम संचय ग्राफ' : 'Watch Hours Accumulation')}
                  {activeMetricTab === 'revenue' && (language === 'hi' ? 'कमाई (₹) वृद्धि ट्रेंड' : 'Daily Revenue Earnings')}
                  {activeMetricTab === 'ctr' && (language === 'hi' ? 'क्लिक थ्रू रेट व इम्प्रेशन्स' : 'Click-Through Rate CTR')}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {language === 'hi' ? 'समय के साथ इस वीडियो का वास्तविक प्रदर्शन' : 'Real-time performance metrics for this video'}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-400">
                {timeRange.toUpperCase()}
              </span>
            </div>

            {/* SVG Visual Area Chart */}
            <div className="h-44 w-full relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area Fill */}
                <path
                  d="M 0 150 L 0 110 Q 100 85 200 60 T 400 40 T 600 20 L 700 10 L 700 150 Z"
                  fill="url(#chartGradient)"
                />
                {/* Line Path */}
                <path
                  d="M 0 110 Q 100 85 200 60 T 400 40 T 600 20 L 700 10"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                />
              </svg>
            </div>

            {/* Bottom Timeline Axis */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900">
              <span>Day 1</span>
              <span>Day 7</span>
              <span>Day 14</span>
              <span>Day 21</span>
              <span>Day 28 (Now)</span>
            </div>
          </div>

          {/* Audience Retention & Traffic Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Audience Retention Curve */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'hi' ? 'दर्शक प्रतिधारण (Audience Retention)' : 'Audience Retention'}</span>
                </h4>
                <span className="text-[11px] font-bold text-emerald-400">64% औसत</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'hi' ? 'दर्शक वीडियो में कितना समय टिके रहे (Intro Hook & Drop-off)' : 'Relative retention curve compared to typical videos.'}
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">0:30 (शुरुआती 30 सेकंड)</span>
                  <span className="font-bold font-mono text-emerald-400">88%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">3:00 (मध्य भाग / राई जवाबी)</span>
                  <span className="font-bold font-mono text-amber-400">72%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">10:00+ (समापन तक)</span>
                  <span className="font-bold font-mono text-blue-400">54%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '54%' }}></div>
                </div>
              </div>
            </div>

            {/* 2. Traffic Sources Breakdown */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-amber-400" />
                <span>{language === 'hi' ? 'ट्रैफ़िक स्रोत (Traffic Sources)' : 'Traffic Sources'}</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {language === 'hi' ? 'दर्शक इस वीडियो तक कैसे पहुंचे:' : 'How viewers discovered this video:'}
              </p>

              <div className="space-y-2.5 pt-1 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>🔍 बुन्देली सर्च (Search Queries)</span>
                    <span className="font-bold font-mono text-amber-400">44%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '44%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>📺 होम फ़ीड व सजेस्टेड वीडियो</span>
                    <span className="font-bold font-mono text-blue-400">32%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>🔗 व्हाट्सएप व सोशल शेयर (External)</span>
                    <span className="font-bold font-mono text-emerald-400">14%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '14%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>🏠 चैनल पेज व अन्य</span>
                    <span className="font-bold font-mono text-purple-400">10%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Regional & Device Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <strong className="text-xs text-slate-200 block">
                {language === 'hi' ? '📍 प्रमुख दर्शक क्षेत्र (Geographic Regions)' : 'Top Audience Regions'}
              </strong>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-slate-400 block">मध्य प्रदेश</span>
                  <span className="font-bold text-amber-400">सागर, छतरपुर, दमोह (56%)</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-slate-400 block">उत्तर प्रदेश</span>
                  <span className="font-bold text-amber-400">झांसी, बांदा, ललितपुर (36%)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <strong className="text-xs text-slate-200 block">
                {language === 'hi' ? '📱 दर्शक डिवाइस (Device Types)' : 'Device Types'}
              </strong>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-center pt-1">
                <div className="bg-slate-900 p-2 rounded-xl">
                  <Smartphone className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-slate-400 block text-[10px]">मोबाइल</span>
                  <strong className="text-slate-200 font-mono">88%</strong>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl">
                  <Tv className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <span className="text-slate-400 block text-[10px]">स्मार्ट टीवी</span>
                  <strong className="text-slate-200 font-mono">9%</strong>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl">
                  <Globe2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <span className="text-slate-400 block text-[10px]">कंप्यूटर</span>
                  <strong className="text-slate-200 font-mono">3%</strong>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{language === 'hi' ? 'डेटा हर 10 मिनट में स्वतः अपडेट होता है' : 'Data refreshes every 10 minutes'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};
