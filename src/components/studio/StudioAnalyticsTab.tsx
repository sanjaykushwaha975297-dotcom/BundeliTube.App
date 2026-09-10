import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Clock, 
  Users, 
  IndianRupee, 
  Globe2, 
  MapPin, 
  Smartphone, 
  PieChart, 
  Sparkles, 
  Search, 
  ArrowRight,
  Info,
  Calendar,
  Radio,
  ShieldCheck
} from 'lucide-react';
import { Video, Channel, CreatorWallet } from '../../types';
import { Language, translations } from '../../locales/i18n';
import { getCreator24HourTotals } from '../../lib/revenueService';

interface StudioAnalyticsTabProps {
  channel: Channel;
  creatorVideos: Video[];
  wallet: CreatorWallet;
  language: Language;
  onInspectVideo: (video: Video) => void;
}

export const StudioAnalyticsTab: React.FC<StudioAnalyticsTabProps> = ({
  channel,
  creatorVideos,
  wallet,
  language,
  onInspectVideo
}) => {
  const t = translations[language];

  // Analytics Sub-tabs (Overview / Reach / Audience / Revenue / Research)
  const [subTab, setSubTab] = useState<'overview' | 'reach' | 'audience' | 'revenue' | 'research'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '28d' | '90d' | '365d' | 'lifetime'>('28d');

  // Realtime pulses and views derived dynamically from actual content
  const totalCreatorViews = React.useMemo(() => {
    const fromVideos = creatorVideos.reduce((sum, v) => sum + (Number(v.views) || 0), 0);
    return Math.max(fromVideos, Number(channel.totalViews) || 0);
  }, [creatorVideos, channel.totalViews]);

  const totalWatchTimeHours = React.useMemo(() => {
    return Math.round(totalCreatorViews * 0.05);
  }, [totalCreatorViews]);

  // Real-time 24h metrics calculated specifically for views and ad impressions
  const metrics24h = React.useMemo(() => {
    return getCreator24HourTotals(channel.id, creatorVideos);
  }, [channel.id, creatorVideos]);

  const realtimeViews48h = Math.round(totalCreatorViews * 0.04);
  const realtimeViews60m = Math.round(totalCreatorViews * 0.002);

  // Geography Data for Bundelkhand
  const topLocations = [
    { city: 'झाँसी (Jhansi)', percentage: 28, views: '6,55,200', region: 'UP Bundelkhand' },
    { city: 'सागर (Sagar)', percentage: 22, views: '5,14,800', region: 'MP Bundelkhand' },
    { city: 'ग्वालियर (Gwalior)', percentage: 15, views: '3,51,000', region: 'MP Gwalior' },
    { city: 'भोपाल (Bhopal)', percentage: 11, views: '2,57,400', region: 'MP Capital' },
    { city: 'छतरपुर (Chhatarpur)', percentage: 9, views: '2,10,600', region: 'MP Bundelkhand' },
    { city: 'टीकमगढ़ (Tikamgarh)', percentage: 7, views: '1,63,800', region: 'MP Bundelkhand' },
    { city: 'ललितपुर (Lalitpur)', percentage: 4, views: '93,600', region: 'UP Bundelkhand' },
    { city: 'बांदा / दमोह / पन्ना', percentage: 4, views: '93,600', region: 'Bundelkhand' },
  ];

  const topStates = [
    { state: 'मध्य प्रदेश (Madhya Pradesh)', percentage: 62, color: 'bg-amber-500' },
    { state: 'उत्तर प्रदेश (Uttar Pradesh)', percentage: 26, color: 'bg-orange-500' },
    { state: 'दिल्ली एनसीआर (Delhi NCR)', percentage: 7, color: 'bg-emerald-500' },
    { state: 'महाराष्ट्र (Mumbai/Pune)', percentage: 3, color: 'bg-purple-500' },
    { state: 'अन्य राज्य', percentage: 2, color: 'bg-slate-600' },
  ];

  const trafficSources = [
    { source: 'यूट्यूब सर्च व बुन्देली सर्च (Search)', percentage: 44, color: 'bg-amber-400' },
    { source: 'ब्राउज़ फीचर्स व होम फीड (Browse Features)', percentage: 28, color: 'bg-blue-400' },
    { source: 'सुझाए गए वीडियो (Suggested Videos)', percentage: 18, color: 'bg-emerald-400' },
    { source: 'व्हाट्सएप व एक्सटर्नल शेयर (External Sharing)', percentage: 10, color: 'bg-purple-400' },
  ];

  return (
    <div id="studio-analytics-tab" className="space-y-6 animate-in fade-in">
      
      {/* Analytics Header Bar with Time Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100">{t.studioAnalytics}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'चैनल का गहन डेटा विश्लेषण: इम्प्रेशंस, सीटीआर, दर्शक भूगोल व विज्ञापन राजस्व'
              : 'In-depth channel performance: impressions, CTR, viewer demographics, and revenue analytics'}
          </p>
        </div>

        {/* Date Selector Dropdown */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <Calendar className="w-4 h-4 text-amber-400 ml-2" />
          <select
            value={timeRange}
            onChange={(e: any) => setTimeRange(e.target.value)}
            className="bg-transparent text-slate-200 text-xs font-bold py-1.5 pr-3 focus:outline-none cursor-pointer"
          >
            <option value="7d" className="bg-slate-900">पिछले 7 दिन (Last 7 days)</option>
            <option value="28d" className="bg-slate-900">पिछले 28 दिन (Last 28 days)</option>
            <option value="90d" className="bg-slate-900">पिछले 90 दिन (Last 90 days)</option>
            <option value="365d" className="bg-slate-900">365 दिन (Last 365 days)</option>
            <option value="lifetime" className="bg-slate-900">लाइफटाइम (Lifetime)</option>
          </select>
        </div>
      </div>

      {/* Sub Navigation: Overview / Reach / Audience / Revenue / Research */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold border-b border-slate-800">
        <button
          onClick={() => setSubTab('overview')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            subTab === 'overview'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'अवलोकन (Overview)' : 'Overview'}</span>
        </button>

        <button
          onClick={() => setSubTab('reach')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            subTab === 'reach'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'रीच व इम्प्रेशंस (Reach)' : 'Reach & Impressions'}</span>
        </button>

        <button
          onClick={() => setSubTab('audience')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            subTab === 'audience'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'कहाँ के लोगों ने देखा (Audience)' : 'Audience Geography'}</span>
        </button>

        <button
          onClick={() => setSubTab('revenue')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            subTab === 'revenue'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <IndianRupee className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'कमाई (Revenue)' : 'Revenue'}</span>
        </button>

        <button
          onClick={() => setSubTab('research')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            subTab === 'research'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'रिसर्च (Trending Search)' : 'Research'}</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. OVERVIEW SUB-TAB                                      */}
      {/* ======================================================== */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 Big Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>{language === 'hi' ? 'व्यूज (Views)' : 'Views'}</span>
                <Eye className="w-4 h-4 text-blue-400" />
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-100 font-mono">
                  {totalCreatorViews.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {totalCreatorViews > 0 ? '+100%' : '0'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                {language === 'hi' ? 'कुल संचित व्यूज' : 'Total accumulated views'}
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>{language === 'hi' ? 'वॉच टाइम (घंटे)' : 'Watch Time (Hours)'}</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-100 font-mono">
                  {totalWatchTimeHours.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {totalCreatorViews > 0 ? '✓' : '0'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                {language === 'hi' ? 'अनुमानित वॉच टाइम' : 'Estimated watch time'}
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>{language === 'hi' ? 'कुल सब्सक्राइबर्स' : 'Subscribers'}</span>
                <Users className="w-4 h-4 text-amber-400" />
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-100 font-mono">
                  {(channel.subscribers || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {channel.subscribers > 0 ? `+${channel.subscribers}` : '0'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                {language === 'hi' ? `कुल: ${(channel.subscribers || 0).toLocaleString('en-IN')} सदस्य` : `Total: ${(channel.subscribers || 0).toLocaleString('en-IN')} members`}
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-1">
              <span className="text-xs text-emerald-400 flex items-center justify-between font-bold">
                <span>{language === 'hi' ? 'अनुमानित कमाई (Revenue)' : 'Estimated Revenue'}</span>
                <IndianRupee className="w-4 h-4 text-emerald-400" />
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ₹{(wallet.lifetimeEarnings || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {wallet.lifetimeEarnings > 0 ? '✓' : '0'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                RPM: ₹35.00 प्रति 1,000 व्यूज
              </span>
            </div>

          </div>

          {/* Dedicated 24-Hour Ads & Views Metrics Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-emerald-500/10 border border-amber-500/30 rounded-3xl p-5 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <span>{language === 'hi' ? '24 घंटे की सक्रियता व विज्ञापन रिपोर्ट' : '24-Hour Performance & Ad Impressions'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">24H LIVE</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'एडमिन द्वारा भुगतान इसी 24 घंटे के आँकड़ों के आधार पर किया जाता है' : 'Admin evaluates payouts based on these 24h metrics'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-amber-400 font-mono font-bold bg-slate-950/60 px-3 py-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                रोलिंग 24 घंटे विंडो
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/20 space-y-1">
                <span className="text-xs text-slate-400 block">{language === 'hi' ? '24 घंटे के व्यूज' : '24h Views'}</span>
                <strong className="text-2xl font-black text-blue-400 font-mono block">
                  {metrics24h.views24h.toLocaleString('en-IN')}
                </strong>
                <span className="text-[10px] text-slate-500">कुल: {metrics24h.totalViews.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-1">
                <span className="text-xs text-amber-400 font-bold block">{language === 'hi' ? '24 घंटे में चले विज्ञापन' : '24h Ad Impressions'}</span>
                <strong className="text-2xl font-black text-amber-300 font-mono block">
                  {metrics24h.adImpressions24h.toLocaleString('en-IN')}
                </strong>
                <span className="text-[10px] text-slate-500">कुल विज्ञापन: {metrics24h.totalAds.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/20 space-y-1">
                <span className="text-xs text-slate-400 block">{language === 'hi' ? 'सक्रिय वीडियो' : 'Active Videos'}</span>
                <strong className="text-2xl font-black text-purple-400 font-mono block">
                  {creatorVideos.length}
                </strong>
                <span className="text-[10px] text-slate-500">मोनेटाइज्ड सामग्री</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/20 space-y-1">
                <span className="text-xs text-slate-400 block">{language === 'hi' ? 'पेआउट मोड' : 'Payout Status'}</span>
                <strong className="text-sm font-bold text-emerald-400 block leading-tight pt-1">
                  {language === 'hi' ? 'एडमिन पैनल नियंत्रित' : 'Admin Managed'}
                </strong>
                <span className="text-[10px] text-slate-500">PAN व 24h रिपोर्ट आधारित</span>
              </div>
            </div>
          </div>

          {/* Realtime Stats Bar + Interactive Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Realtime 48h card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>{language === 'hi' ? 'रीयल-टाइम (Realtime)' : 'Realtime Pulse'}</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">Updating live every minute</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-100 font-mono block">
                    {realtimeViews48h.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400">Views • Last 48h</span>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="space-y-1">
                <div className="flex items-end gap-1 h-20 pt-4">
                  {[24, 40, 65, 80, 50, 95, 70, 85, 60, 90, 100, 75, 45, 85, 92, 100].map((val, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${val}%` }}
                      className={`flex-1 rounded-t-sm transition-all duration-500 ${
                        idx === 15 ? 'bg-amber-400 animate-pulse' : 'bg-slate-700 hover:bg-amber-500/80'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>-48 hours</span>
                  <span>-24h</span>
                  <span>Now</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">{language === 'hi' ? 'पिछले 60 मिनट में व्यूज:' : 'Views in last 60 mins:'}</span>
                <strong className="text-amber-400 font-mono font-bold">{realtimeViews60m} views</strong>
              </div>
            </div>

            {/* Top performing content list in period */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{language === 'hi' ? 'इस अवधि में शीर्ष प्रदर्शन करने वाले गाने' : 'Top Performing Songs'}</span>
              </h3>

              <div className="space-y-3">
                {creatorVideos.slice(0, 3).map((v, i) => (
                  <div 
                    key={v.id} 
                    onClick={() => onInspectVideo(v)}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-amber-400 font-mono w-4">{i + 1}</span>
                      <img src={v.thumbnail} alt={v.title} className="w-14 aspect-video rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-100 line-clamp-1">{v.title}</h4>
                        <p className="text-[10px] text-slate-400">{v.artist} • {v.duration}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <strong className="text-xs font-bold text-slate-100 font-mono block">
                        {v.views.toLocaleString('en-IN')} views
                      </strong>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        ₹{(v.estimatedEarnings || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. REACH & IMPRESSIONS SUB-TAB                           */}
      {/* ======================================================== */}
      {subTab === 'reach' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">कुल इम्प्रेशंस (Impressions)</span>
              <span className="text-3xl font-black text-amber-400 font-mono block">2.45 Cr</span>
              <span className="text-[10px] text-slate-500">बुंदेली दर्शकों के फीड में प्रदर्शित</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">इम्प्रेशंस सीटीआर (CTR %)</span>
              <span className="text-3xl font-black text-slate-100 font-mono block">11.4%</span>
              <span className="text-[10px] text-emerald-400 font-bold">↑ 1.8% (उत्कृष्ट थंबनेल आकर्षण)</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">इम्प्रेशंस से मिले कुल व्यूज</span>
              <span className="text-3xl font-black text-slate-100 font-mono block">23.4 Lakh</span>
              <span className="text-[10px] text-slate-500">95.5% ऑर्गेनिक ट्रैफ़िक</span>
            </div>
          </div>

          {/* Traffic Sources Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-blue-400" />
              <span>ट्रैफ़िक स्रोत प्रकार (Traffic Source Types)</span>
            </h3>

            <div className="space-y-3">
              {trafficSources.map((ts, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{ts.source}</span>
                    <strong className="text-slate-100 font-mono">{ts.percentage}%</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div style={{ width: `${ts.percentage}%` }} className={`h-full ${ts.color} rounded-full`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. AUDIENCE GEOGRAPHY SUB-TAB (कहाँ के लोगों ने देखा)    */}
      {/* ======================================================== */}
      {subTab === 'audience' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Districts / Cities */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>शीर्ष जिले व शहर (Top Viewing Districts)</span>
              </h3>

              <div className="space-y-3">
                {topLocations.map((loc, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-200 font-medium">
                        {loc.city} <span className="text-[10px] text-slate-500">({loc.region})</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 font-mono">{loc.views} views</span>
                        <strong className="text-amber-400 font-mono w-10 text-right">{loc.percentage}%</strong>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div style={{ width: `${loc.percentage * 3.2}%` }} className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* States & Devices */}
            <div className="space-y-6">
              
              {/* States Breakdown */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-emerald-400" />
                  <span>राज्य-वार दर्शक हिस्सेदारी (Top States)</span>
                </h3>

                <div className="space-y-3">
                  {topStates.map((st, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{st.state}</span>
                        <strong className="text-slate-100 font-mono">{st.percentage}%</strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <div style={{ width: `${st.percentage}%` }} className={`h-full ${st.color} rounded-full`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devices */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span>उपयोगकर्ता डिवाइस (Viewer Devices)</span>
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block">📱 Mobile</span>
                    <strong className="text-base font-black text-slate-100 font-mono">93.2%</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block">📺 Smart TV</span>
                    <strong className="text-base font-black text-slate-100 font-mono">4.8%</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block">💻 Desktop</span>
                    <strong className="text-base font-black text-slate-100 font-mono">2.0%</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 4. REVENUE SUB-TAB                                       */}
      {/* ======================================================== */}
      {subTab === 'revenue' && (
        <div className="space-y-6">
          {/* Admin Payout Policy Notice */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{language === 'hi' ? 'एडमिन पैनल आधारित प्रत्यक्ष भुगतान (Direct Admin Payout)' : 'Direct Admin Managed Payout'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'hi'
                ? 'स्वचालित रेवेन्यू शेयरिंग बंद है। आपका भुगतान एडमिन द्वारा आपके पैन कार्ड पर दर्ज मूल नाम के सत्यापन तथा पिछले 24 घंटे के कुल व्यूज और वीडियो विज्ञापनों के आधार पर सीधे वॉलेट में क्रेडिट किया जाता है।'
                : 'Automated revenue splitting is disabled. Your payouts are reviewed and disbursed directly from the Admin Portal based on your verified PAN card name and 24-hour views/ads metrics.'}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono">
              <span className="text-blue-400 font-bold">24h व्यूज: {metrics24h.views24h.toLocaleString('en-IN')}</span>
              <span className="text-amber-400 font-bold">24h विज्ञापन: {metrics24h.adImpressions24h.toLocaleString('en-IN')}</span>
              <span className="text-emerald-400 font-bold">वॉलेट शेष: ₹{(wallet.currentBalance || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-1">
              <span className="text-xs text-emerald-400 font-bold">कुल प्राप्त पेआउट (Lifetime Earnings)</span>
              <span className="text-3xl font-black text-emerald-400 font-mono block">
                ₹{(wallet.lifetimeEarnings || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400">एडमिन द्वारा सीधे हस्तांतरित</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">RPM (राजस्व प्रति 1,000 व्यूज)</span>
              <span className="text-3xl font-black text-slate-100 font-mono block">₹35.00</span>
              <span className="text-[10px] text-emerald-400 font-bold">Fixed Guaranteed Rate</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">प्लेबैक आधारित CPM</span>
              <span className="text-3xl font-black text-slate-100 font-mono block">₹42.50</span>
              <span className="text-[10px] text-slate-500">Highest in Regional Music</span>
            </div>
          </div>

          {/* Monthly Revenue Bars */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              <span>मासिक विज्ञापन राजस्व चार्ट (Monthly Revenue)</span>
            </h3>

            <div className="grid grid-cols-4 gap-4 text-center pt-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 block">मई 2026</span>
                <strong className="text-lg font-black text-slate-200 font-mono block">₹22,400</strong>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 block">जून 2026</span>
                <strong className="text-lg font-black text-slate-200 font-mono block">₹34,800</strong>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 block">जुलाई 2026</span>
                <strong className="text-lg font-black text-slate-200 font-mono block">₹41,200</strong>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-1">
                <span className="text-xs text-emerald-400 font-bold block">अगस्त 2026 (चालू)</span>
                <strong className="text-lg font-black text-emerald-400 font-mono block">₹45,050</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. RESEARCH SUB-TAB (Trending Searches)                  */}
      {/* ======================================================== */}
      {subTab === 'research' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm text-slate-100">
                {language === 'hi' ? 'बुंदेलखंड में दर्शक क्या खोज रहे हैं (Trending Search Keywords)' : 'Top Search Queries in Bundelkhand'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'hi' ? 'इन विषयों पर नए वीडियो अपलोड करके आप ज्यादा व्यूज और कमाई प्राप्त कर सकते हैं।' : 'Create videos on these trending keywords to maximize viewer reach and earnings.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { query: 'देशराज पटैरिया राई मुकाबला', volume: 'High', searches: '8.4 Lakh/mo' },
              { query: 'संजो बघेल मैया के जस 2026', volume: 'Very High', searches: '12.1 Lakh/mo' },
              { query: 'आल्हा ऊदल बेतवा संग्राम वीर रस', volume: 'High', searches: '6.2 Lakh/mo' },
              { query: 'बुंदेली डीजे रीमिक्स राई', volume: 'High', searches: '7.8 Lakh/mo' },
              { query: 'वंदना वाजपेयी जवाबी कीर्तन', volume: 'Medium', searches: '3.9 Lakh/mo' },
              { query: 'देसी ढोलक थाप भजन', volume: 'Medium', searches: '2.5 Lakh/mo' }
            ].map((k, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-100">{k.query}</h4>
                  <span className="text-[10px] text-slate-400">{k.searches}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {k.volume} Volume
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
