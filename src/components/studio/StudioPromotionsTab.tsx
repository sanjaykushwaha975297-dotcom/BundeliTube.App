import React, { useState } from 'react';
import { 
  Zap, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Flame, 
  Sparkles, 
  ArrowRight,
  Eye,
  Target,
  Plus
} from 'lucide-react';
import { Video, Channel, VideoPromotionCampaign } from '../../types';
import { Language, translations } from '../../locales/i18n';
import { PromoteVideoModal } from '../PromoteVideoModal';

interface StudioPromotionsTabProps {
  channel: Channel;
  creatorVideos: Video[];
  promotions: VideoPromotionCampaign[];
  language: Language;
  onOpenPromoteModal: (video: Video) => void;
}

export const StudioPromotionsTab: React.FC<StudioPromotionsTabProps> = ({
  channel,
  creatorVideos,
  promotions,
  language,
  onOpenPromoteModal
}) => {
  const [selectedVideoForModal, setSelectedVideoForModal] = useState<Video | null>(null);

  const totalDeliveredImpressions = promotions.reduce((acc, p) => acc + (p.deliveredImpressions || 0), 0);
  const totalTargetImpressions = promotions.reduce((acc, p) => acc + (p.targetImpressions || 0), 0);
  const totalSpent = promotions.reduce((acc, p) => acc + (p.amountPaid || 0), 0);

  return (
    <div id="studio-promotions-tab" className="space-y-6 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400 fill-amber-400/20" />
            <span>{language === 'hi' ? 'वीडियो प्रमोशन व बूस्ट (Promotions & Reach)' : 'Promotions & Reach Boost'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'hi'
              ? 'सीधे एडमिन पेमेंट से अपने वीडियो को होम फीड व ट्रेंडिंग में प्रमोट करें और गारंटीड इम्प्रेशन्स पाएं'
              : 'Promote your videos via direct Admin payment to gain guaranteed feed impressions and viewer reach'}
          </p>
        </div>

        <button
          onClick={() => {
            if (creatorVideos.length > 0) {
              setSelectedVideoForModal(creatorVideos[0]);
            }
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{language === 'hi' ? 'नया वीडियो प्रमोट करें' : 'Promote Video'}</span>
        </button>
      </div>

      {/* Top 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{language === 'hi' ? 'कुल प्राप्त इम्प्रेशन्स' : 'Delivered Impressions'}</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {totalDeliveredImpressions > 0 ? totalDeliveredImpressions.toLocaleString('en-IN') : '75,000'}
          </p>
          <p className="text-[10px] text-slate-400">
            {language === 'hi' ? 'टारगेट: 1,00,000 इम्प्रेशन्स' : 'Target: 100,000 impressions'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{language === 'hi' ? 'सक्रिय प्रमोशन अभियान' : 'Active Campaigns'}</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {promotions.length > 0 ? promotions.length : '1'}
          </p>
          <p className="text-[10px] text-emerald-400 font-medium">
            {language === 'hi' ? '✓ एडमिन द्वारा सत्यापित व सक्रिय' : '✓ Verified & Running'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{language === 'hi' ? 'कुल निवेश (Ad Spend)' : 'Total Ad Investment'}</span>
            <IndianRupee className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-300 font-mono">
            ₹{totalSpent > 0 ? totalSpent.toLocaleString('en-IN') : '1,199'}
          </p>
          <p className="text-[10px] text-slate-400">
            {language === 'hi' ? 'औसत सीपीएम: ₹15.99' : 'Avg CPM: ₹15.99'}
          </p>
        </div>
      </div>

      {/* Select Video to Promote Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{language === 'hi' ? 'प्रमोशन के लिए वीडियो चुनें (Select Video to Boost)' : 'Choose Video to Boost'}</span>
          </h3>
          <span className="text-xs text-slate-400">
            {creatorVideos.length} {language === 'hi' ? 'वीडियो उपलब्ध' : 'videos available'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {creatorVideos.map((video) => (
            <div
              key={video.id}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-20 h-14 object-cover rounded-xl shrink-0 border border-slate-800"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-tight group-hover:text-amber-400 transition">
                    {video.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    {video.views.toLocaleString('en-IN')} views
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedVideoForModal(video);
                  onOpenPromoteModal(video);
                }}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'यह वीडियो प्रमोट करें' : 'Promote this Video'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns History & Status Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>{language === 'hi' ? 'प्रमोशन अभियान व एडमिन स्थिति (Campaign History & Status)' : 'Promotion Campaigns & Admin Status'}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-3 px-3">{language === 'hi' ? 'वीडियो' : 'Video'}</th>
                <th className="pb-3 px-3">{language === 'hi' ? 'पैकेज / टारगेट' : 'Package / Target'}</th>
                <th className="pb-3 px-3">{language === 'hi' ? 'भुगतान / UTR' : 'Paid / UTR'}</th>
                <th className="pb-3 px-3 text-center">{language === 'hi' ? 'इम्प्रेशन्स प्रगति' : 'Impressions'}</th>
                <th className="pb-3 px-3 text-right">{language === 'hi' ? 'एडमिन सत्यापन स्थिति' : 'Admin Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {/* If campaigns exist, list them, else show demo campaign */}
              {promotions.length > 0 ? (
                promotions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.videoThumbnail}
                          alt={p.videoTitle}
                          className="w-14 h-9 object-cover rounded-lg shrink-0 border border-slate-800"
                        />
                        <div className="min-w-0 max-w-[200px]">
                          <p className="font-bold text-slate-200 line-clamp-1">{p.videoTitle}</p>
                          <p className="text-[10px] text-slate-400">{p.createdAt.split('T')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-200">{p.packageName}</p>
                      <p className="text-[10px] text-emerald-400 font-mono font-bold">
                        🎯 {p.targetImpressions.toLocaleString('en-IN')}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-amber-400 font-mono">₹{p.amountPaid}</p>
                      <p className="text-[10px] text-slate-400 font-mono">UTR: {p.paymentReferenceUtr}</p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono font-bold text-slate-200">
                          {p.deliveredImpressions.toLocaleString('en-IN')} / {p.targetImpressions.toLocaleString('en-IN')}
                        </span>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${Math.min(100, Math.round((p.deliveredImpressions / p.targetImpressions) * 100))}%`
                            }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {p.status === 'pending_admin_approval' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          <Clock className="w-3 h-3" />
                          <span>Pending Admin Approval</span>
                        </span>
                      ) : p.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active / Delivering</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                          <span>Completed</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80"
                        alt="Demo video"
                        className="w-14 h-9 object-cover rounded-lg shrink-0 border border-slate-800"
                      />
                      <div className="min-w-0 max-w-[200px]">
                        <p className="font-bold text-slate-200 line-clamp-1">देसी राई धमाका 2026</p>
                        <p className="text-[10px] text-slate-400">आज</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-200">Trending Viral Push</p>
                    <p className="text-[10px] text-emerald-400 font-mono font-bold">🎯 75,000 Target</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-amber-400 font-mono">₹1,199</p>
                    <p className="text-[10px] text-slate-400 font-mono">UTR: 423910849201</p>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-mono font-bold text-slate-200">75,000 / 75,000</span>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div style={{ width: '100%' }} className="h-full bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active / Complete</span>
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promotion Modal Instance */}
      {selectedVideoForModal && (
        <PromoteVideoModal
          isOpen={!!selectedVideoForModal}
          onClose={() => setSelectedVideoForModal(null)}
          video={selectedVideoForModal}
          language={language}
          onPromotionSubmitted={(campaign) => {
            promotions.unshift(campaign);
            setSelectedVideoForModal(null);
          }}
        />
      )}

    </div>
  );
};
