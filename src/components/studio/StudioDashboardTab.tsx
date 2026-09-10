import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Play, 
  Eye, 
  TrendingUp, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  Radio, 
  Plus, 
  Clock, 
  Award, 
  Heart, 
  IndianRupee,
  BarChart3,
  ThumbsUp,
  Share2,
  Users,
  Bell,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { Channel, Video, CreatorWallet, StudioComment } from '../../types';
import { Language, translations } from '../../locales/i18n';
import { STUDIO_COMMENTS } from '../../data/mockData';
import {
  getFirestoreSafe,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from '../../lib/firebase';

interface StudioDashboardTabProps {
  channel: Channel;
  creatorVideos: Video[];
  wallet: CreatorWallet;
  language: Language;
  onOpenUploadModal: () => void;
  onOpenWalletModal?: () => void;
  onGoToAnalytics: () => void;
  onGoToContent: () => void;
  onGoToComments: () => void;
  onInspectVideo: (video: Video) => void;
}

interface RecentSubscriber {
  id: string;
  name: string;
  avatar: string;
  date: string;
}

interface RecentActivity {
  id: string;
  type: 'like' | 'view' | 'subscribe' | 'comment';
  title: string;
  userName: string;
  time: string;
}

export const StudioDashboardTab: React.FC<StudioDashboardTabProps> = ({
  channel,
  creatorVideos,
  wallet,
  language,
  onOpenUploadModal,
  onOpenWalletModal,
  onGoToAnalytics,
  onGoToContent,
  onGoToComments,
  onInspectVideo
}) => {
  const t = translations[language];
  const latestVideo = creatorVideos[0];

  const totalCreatorViews = React.useMemo(() => {
    const fromVideos = creatorVideos.reduce((sum, v) => sum + (Number(v.views) || 0), 0);
    return Math.max(fromVideos, Number(channel.totalViews) || 0);
  }, [creatorVideos, channel.totalViews]);

  const totalWatchTimeHours = React.useMemo(() => {
    return Math.round(totalCreatorViews * 0.05);
  }, [totalCreatorViews]);

  const [recentSubscribers, setRecentSubscribers] = useState<RecentSubscriber[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [liveComments, setLiveComments] = useState<StudioComment[]>([]);

  // Subscribe to real-time subscribers for this creator channel
  useEffect(() => {
    try {
      const db = getFirestoreSafe();
      const subQuery = query(
        collection(db, 'channel_subscribers'),
        where('creatorChannelId', '==', channel.id),
        limit(5)
      );

      const unsubSub = onSnapshot(subQuery, (snapshot) => {
        if (!snapshot.empty) {
          const subs: RecentSubscriber[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            subs.push({
              id: docSnap.id,
              name: d.subscriberName || 'बुंदेली दर्शक',
              avatar: d.subscriberAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('hi-IN') : 'हाल ही में'
            });
          });
          if (subs.length > 0) {
            setRecentSubscribers(subs);
          }
        }
      }, () => {});

      // Subscribe to real-time likes
      const likesQuery = query(
        collection(db, 'video_likes'),
        where('channelId', '==', channel.id),
        limit(5)
      );
      const unsubLikes = onSnapshot(likesQuery, (snapshot) => {
        if (!snapshot.empty) {
          const acts: RecentActivity[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            acts.push({
              id: docSnap.id,
              type: 'like',
              title: d.videoTitle || 'बुंदेली वीडियो',
              userName: d.userName || 'बुंदेली दर्शक',
              time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : 'अभी'
            });
          });
          if (acts.length > 0) {
            setRecentActivities(prev => {
              const ids = new Set(acts.map(a => a.id));
              return [...acts, ...prev.filter(a => !ids.has(a.id))].slice(0, 6);
            });
          }
        }
      }, () => {});

      // Subscribe to real-time comments
      const commentsQuery = query(
        collection(db, 'comments'),
        where('creatorId', '==', channel.id),
        limit(5)
      );
      const unsubComments = onSnapshot(commentsQuery, (snapshot) => {
        if (!snapshot.empty) {
          const cmts: StudioComment[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            cmts.push({
              id: docSnap.id,
              author: d.author || d.userName || 'बुंदेली दर्शक',
              avatar: d.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              text: d.text || '',
              timestamp: d.createdAt ? new Date(d.createdAt).toLocaleDateString('hi-IN') : 'हाल ही में',
              videoTitle: d.videoTitle || 'बुंदेली गीत',
              videoId: d.videoId || '',
              likes: d.likes || 0,
              isHearted: !!d.isHearted,
              isPinned: !!d.isPinned,
              isQuestion: !!d.isQuestion
            });
          });
          if (cmts.length > 0) {
            setLiveComments(cmts);
          }
        }
      }, () => {});

      return () => {
        unsubSub();
        unsubLikes();
        unsubComments();
      };
    } catch (e) {
      console.warn('Dashboard real-time sync note:', e);
    }
  }, [channel.id]);

  return (
    <div id="studio-dashboard-tab" className="space-y-6 animate-in fade-in">
      {/* Studio Header Bar inside Dashboard */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{t.studioDashboard}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-mono">
              BundeliTube Studio
            </span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {language === 'hi'
              ? 'आपके बुंदेली चैनल का संपूर्ण प्रदर्शन, नवीनतम वीडियो आंकड़े और दर्शक समीक्षा'
              : 'Complete performance overview, latest uploads, and audience insights for your channel'}
          </p>
        </div>
      </div>

      {/* Grid of Studio Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ======================================================== */}
        {/* CARD 1: LATEST VIDEO PERFORMANCE (YouTube Studio Classic) */}
        {/* ======================================================== */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Play className="w-4 h-4 text-amber-400" />
              <span>{t.studioLatestVideo}</span>
            </h2>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              #1 of 10
            </span>
          </div>

          {latestVideo ? (
            <div className="space-y-4">
              {/* Thumbnail + Title */}
              <div 
                onClick={() => onInspectVideo(latestVideo)}
                className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer"
              >
                <img
                  src={latestVideo.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'}
                  alt={latestVideo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-3">
                  <p className="text-xs font-bold text-slate-100 line-clamp-2 leading-tight drop-shadow">
                    {latestVideo.title}
                  </p>
                </div>
                <span className="absolute bottom-2 right-2 bg-slate-950/90 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-md">
                  {latestVideo.duration}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>{language === 'hi' ? 'पहले 3 दिनों का प्रदर्शन:' : 'First 3 days performance:'}</span>
                <span className="text-slate-300 font-semibold">{latestVideo.uploadDate}</span>
              </p>

              {/* Metrics Ranking List */}
              <div className="space-y-2.5 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{language === 'hi' ? 'व्यूज (Views)' : 'Views'}:</span>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-100 font-mono font-bold">
                      {latestVideo.views.toLocaleString('en-IN')}
                    </strong>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{language === 'hi' ? 'इम्प्रेशंस सीटीआर (CTR)' : 'Impressions CTR'}:</span>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-100 font-mono font-bold">
                      {latestVideo.ctr || 11.6}%
                    </strong>
                    <span className="text-[10px] text-emerald-400">↑ 2.1%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{language === 'hi' ? 'औसत देखने की अवधि' : 'Average View Duration'}:</span>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-100 font-mono font-bold">06:42 (46%)</strong>
                    <span className="text-[10px] text-emerald-400">✓ Typical</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-emerald-400 font-medium">{language === 'hi' ? 'अनुमानित विज्ञापन कमाई' : 'Estimated Ad Revenue'}:</span>
                  <strong className="text-emerald-400 font-mono font-bold">
                    ₹{(latestVideo.estimatedEarnings || 0).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => onInspectVideo(latestVideo)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition cursor-pointer"
                >
                  {language === 'hi' ? 'वीडियो एनालिटिक्स' : 'Video Analytics'}
                </button>
                <button
                  onClick={onGoToComments}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'hi' ? 'कमेंट्स देखें' : 'Comments'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              {language === 'hi' ? 'कोई वीडियो उपलब्ध नहीं है।' : 'No uploaded videos yet.'}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* CARD 2: CHANNEL ANALYTICS (28 Days Summary)               */}
        {/* ======================================================== */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>{t.studioChannelAnalytics}</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              {t.studioSummary28Days}
            </span>
          </div>

          {/* Current Subscribers */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">{t.studioSubscribersCount}</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-black text-slate-100 font-mono tracking-tight">
                {(channel.subscribers || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <TrendingUp className="w-3 h-3" />
                {channel.subscribers > 0 ? `+${channel.subscribers}` : '0'}
              </span>
            </div>
          </div>

          {/* Summary Metric Rows */}
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">{language === 'hi' ? 'कुल व्यूज' : 'Total Views'}</span>
                  <strong className="text-sm font-bold text-slate-100 font-mono">
                    {totalCreatorViews.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {totalCreatorViews > 0 ? '+100%' : '0'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">{language === 'hi' ? 'वॉच टाइम (घंटे)' : 'Watch time (hours)'}</span>
                  <strong className="text-sm font-bold text-slate-100 font-mono">
                    {totalWatchTimeHours.toLocaleString('en-IN')} hrs
                  </strong>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {totalWatchTimeHours > 0 ? '✓' : '0'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-emerald-400 block">{language === 'hi' ? 'अनुमानित राजस्व' : 'Estimated Revenue'}</span>
                  <strong className="text-sm font-black text-emerald-400 font-mono">
                    ₹{(wallet.lifetimeEarnings || 0).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {wallet.lifetimeEarnings > 0 ? '✓' : '0'}
              </span>
            </div>
          </div>

          {/* Go to channel analytics button */}
          <button
            onClick={onGoToAnalytics}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>{language === 'hi' ? 'चैनल एनालिटिक्स देखें' : 'Go to Channel Analytics'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* CARD 3: LATEST COMMENTS & REAL-TIME CREATOR INTERACTIONS */}
        {/* ======================================================== */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Real-time Recent Subscribers Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{language === 'hi' ? 'नवीनतम सदस्य (Recent Subscribers)' : 'Recent Subscribers'}</span>
              </h2>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>

            <div className="space-y-2.5">
              {recentSubscribers.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition">
                  <div className="flex items-center gap-2.5">
                    <img src={sub.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={sub.name} className="w-7 h-7 rounded-full object-cover border border-slate-700" />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block line-clamp-1">{sub.name}</span>
                      <span className="text-[10px] text-slate-500">{sub.date}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    +1 Sub
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Likes & Views Activity Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>{language === 'hi' ? 'रीयल-टाइम गतिविधि (Live Feed)' : 'Live Activity Feed'}</span>
              </h2>
            </div>

            <div className="space-y-2">
              {recentActivities.map((act) => (
                <div key={act.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {act.type === 'like' && <ThumbsUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    {act.type === 'view' && <Eye className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    {act.type === 'subscribe' && <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    <div>
                      <span className="font-bold text-slate-200 block text-[11px]">
                        {act.userName} {act.type === 'like' ? 'ने पसंद किया' : act.type === 'subscribe' ? 'ने सब्सक्राइब किया' : 'ने देखा'}
                      </span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{act.title}</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 shrink-0 font-mono">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Comments Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>{t.studioRecentComments}</span>
              </h2>
              <button 
                onClick={onGoToComments}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                {language === 'hi' ? 'सभी देखें' : 'View All'}
              </button>
            </div>

            <div className="space-y-3">
              {liveComments.slice(0, 2).map((comment) => (
                <div key={comment.id} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={comment.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} alt={comment.author} className="w-5 h-5 rounded-full object-cover" />
                      <span className="font-bold text-slate-200">{comment.author}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{comment.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    "{comment.text}"
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-slate-500" />
                      {comment.likes}
                    </span>
                    {comment.isHearted && (
                      <span className="flex items-center gap-1 text-rose-400">
                        <Heart className="w-3 h-3 fill-rose-500" />
                        {language === 'hi' ? 'क्रिएटर दिल' : 'Hearted'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Creator Milestones & Bundeli News Widget */}
          <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h2 className="font-bold text-sm text-slate-100">{t.studioNews}</h2>
            </div>
            
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block">
                🎉 {language === 'hi' ? 'उपलब्धि (Milestone)' : 'Milestone'}
              </span>
              <h4 className="text-xs font-bold text-slate-100">
                {language === 'hi' ? '10 लाख कुल व्यूज का आंकड़ा पार!' : 'Passed 1 Million Total Views!'}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {language === 'hi' 
                  ? 'आपके बुंदेली राई और आल्हा वीडियो को पूरे बुंदेलखंड में अपार स्नेह मिल रहा है।' 
                  : 'Your Bundeli folk uploads are trending across Madhya Pradesh & Uttar Pradesh.'}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
