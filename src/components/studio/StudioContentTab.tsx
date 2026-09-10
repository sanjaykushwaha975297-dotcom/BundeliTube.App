import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  IndianRupee, 
  Eye, 
  Radio, 
  Play, 
  Edit3, 
  BarChart3, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  Plus, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Globe2, 
  MoreVertical,
  ThumbsUp,
  SlidersHorizontal,
  ChevronDown,
  Trash2,
  ExternalLink,
  Check,
  Image as ImageIcon,
  Megaphone,
  UploadCloud,
  Layers,
  Zap,
  DollarSign,
  Link as LinkIcon,
  AlertCircle,
  Heart,
  Pin,
  Send,
  X
} from 'lucide-react';
import { Video, Channel, CreatorWallet, VideoPromotionCampaign, StudioComment } from '../../types';
import { Language, translations } from '../../locales/i18n';
import { STUDIO_PLAYLISTS, STUDIO_POSTS, CATEGORIES } from '../../data/mockData';
import { VideoAnalyticsModal } from './VideoAnalyticsModal';
import { PromoteVideoModal } from '../PromoteVideoModal';
import { compressImageFile, compressImageDataUrl, THUMBNAIL_COMPRESS_OPTIONS } from '../../lib/imageCompressor';
import {
  getFirestoreSafe,
  collection,
  onSnapshot,
  toggleCommentHeartInFirestore,
  toggleCommentPinInFirestore,
  deleteCommentFromFirestore,
  replyToCommentInFirestore
} from '../../lib/firebase';
import { get24HourMetrics } from '../../lib/revenueService';

const THUMBNAIL_PRESETS = [
  { name: 'बुंदेली राई नृत्य', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80' },
  { name: 'आल्हा ऊदल वीरगाथा', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' },
  { name: 'देसी लोकगीत अखाड़ा', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80' },
  { name: 'बुंदेलखंडी फाग उत्सव', url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80' }
];

interface StudioContentTabProps {
  channel: Channel;
  creatorVideos: Video[];
  wallet: CreatorWallet;
  language: Language;
  onOpenUploadModal: () => void;
  onInspectVideo: (video: Video) => void;
  onGoToComments: () => void;
  onUpdateVideo?: (updatedVideo: Video) => void;
  onDeleteVideo?: (videoId: string) => void;
  onPromoteVideo?: (campaign: VideoPromotionCampaign) => void;
}

export const StudioContentTab: React.FC<StudioContentTabProps> = ({
  channel,
  creatorVideos,
  wallet,
  language,
  onOpenUploadModal,
  onInspectVideo,
  onGoToComments,
  onUpdateVideo,
  onDeleteVideo,
  onPromoteVideo
}) => {
  const t = translations[language];

  // Content Sub-tabs: Videos, Shorts, Live, Playlists, Posts
  const [contentSubTab, setContentSubTab] = useState<'videos' | 'shorts' | 'live' | 'playlists' | 'posts'>('videos');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'earnings' | 'views' | 'impressions' | 'ctr' | 'likes' | 'comments' | 'recent'>('recent');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'unlisted' | 'private'>('all');

  // Real-time Firestore Comment and Like counts per video
  const [videoCommentsCount, setVideoCommentsCount] = useState<Record<string, number>>({});
  const [videoLikesCount, setVideoLikesCount] = useState<Record<string, number>>({});
  const [allVideoComments, setAllVideoComments] = useState<StudioComment[]>([]);

  // Video Comments Quick Viewer Modal
  const [viewingCommentsVideo, setViewingCommentsVideo] = useState<Video | null>(null);
  const [quickReplyText, setQuickReplyText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);

  // Video Metadata Edit State (YouTube Studio Metadata Editor)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editThumbnail, setEditThumbnail] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editVisibility, setEditVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [editHasPaidPromotion, setEditHasPaidPromotion] = useState(false);
  const [editSponsorName, setEditSponsorName] = useState('');
  const [editIsMonetized, setEditIsMonetized] = useState(true);
  const [editSavedSuccess, setEditSavedSuccess] = useState(false);

  // Per-Video Analytics Modal State
  const [analyticsVideo, setAnalyticsVideo] = useState<Video | null>(null);
  const [promotingVideo, setPromotingVideo] = useState<Video | null>(null);

  // Playlists and Posts State
  const [playlists, setPlaylists] = useState(STUDIO_PLAYLISTS);
  const [posts, setPosts] = useState(STUDIO_POSTS);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Real-time Firebase synchronization for comment and like counts
  useEffect(() => {
    try {
      const db = getFirestoreSafe();
      if (!db) return;

      // 1. Comments collection listener
      const commentsRef = collection(db, 'comments');
      const unsubComments = onSnapshot(commentsRef, (snapshot) => {
        const counts: Record<string, number> = {};
        const commentsList: StudioComment[] = [];

        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const vId = d.videoId;
          if (vId) {
            counts[vId] = (counts[vId] || 0) + 1;
          }
          commentsList.push({
            id: docSnap.id,
            author: d.author || d.userName || 'बुंदेली दर्शक',
            avatar: d.avatar || d.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            text: d.text || '',
            timestamp: d.createdAt ? new Date(d.createdAt).toLocaleDateString('hi-IN') : 'हाल ही में',
            videoTitle: d.videoTitle || 'बुंदेली वीडियो',
            videoId: d.videoId || '',
            likes: d.likes || 0,
            isHearted: !!d.isHearted,
            isPinned: !!d.isPinned,
            isQuestion: !!d.isQuestion || (d.text?.includes('?') || d.text?.includes('क्या')),
            replies: d.replies || []
          });
        });

        setVideoCommentsCount(counts);
        setAllVideoComments(commentsList);
      }, (err) => console.warn('StudioContentTab comments listener note:', err));

      // 2. Video Likes listener
      const likesRef = collection(db, 'video_likes');
      const unsubLikes = onSnapshot(likesRef, (snapshot) => {
        const counts: Record<string, number> = {};
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const vId = d.videoId;
          if (vId) {
            counts[vId] = (counts[vId] || 0) + 1;
          }
        });
        setVideoLikesCount(counts);
      }, (err) => console.warn('StudioContentTab likes listener note:', err));

      return () => {
        unsubComments();
        unsubLikes();
      };
    } catch (e) {
      console.warn('Firebase comments setup note:', e);
    }
  }, []);

  const getVideoCommentsCount = (v: Video) => {
    if (videoCommentsCount[v.id] !== undefined) return videoCommentsCount[v.id];
    if (v.commentsCount !== undefined) return v.commentsCount;
    return 0;
  };

  const getVideoLikesCount = (v: Video) => {
    if (videoLikesCount[v.id] !== undefined) return videoLikesCount[v.id];
    return v.likes || 0;
  };

  const isShortVideo = (v: Video) => Boolean(v.isShort || v.videoType === 'short' || v.category === 'shorts');
  const creatorLongVideos = creatorVideos.filter(v => !isShortVideo(v));
  const creatorShortVideos = creatorVideos.filter(v => isShortVideo(v));

  // Status counts for Long Videos
  const totalPending = creatorLongVideos.filter(v => v.status === 'pending').length;
  const totalPublished = creatorLongVideos.filter(v => v.status === 'published' || v.status === 'approved' || !v.status).length;
  const totalRejected = creatorLongVideos.filter(v => v.status === 'rejected').length;

  // Filtered & Sorted Long Videos
  const filteredVideos = creatorLongVideos.filter((video) => {
    const matchesSearch = 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.verificationCode && video.verificationCode.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'pending' && video.status === 'pending') ||
      (statusFilter === 'published' && (video.status === 'published' || video.status === 'approved' || !video.status)) ||
      (statusFilter === 'rejected' && video.status === 'rejected');

    const matchesVisibility = 
      visibilityFilter === 'all' ||
      video.visibility === visibilityFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesVisibility;
  }).sort((a, b) => {
    if (sortBy === 'earnings') {
      return (b.estimatedEarnings || 0) - (a.estimatedEarnings || 0);
    }
    if (sortBy === 'views') {
      return b.views - a.views;
    }
    if (sortBy === 'likes') {
      return getVideoLikesCount(b) - getVideoLikesCount(a);
    }
    if (sortBy === 'comments') {
      return getVideoCommentsCount(b) - getVideoCommentsCount(a);
    }
    if (sortBy === 'impressions') {
      const impA = a.impressions || (a.views * 8.6);
      const impB = b.impressions || (b.views * 8.6);
      return impB - impA;
    }
    if (sortBy === 'ctr') {
      return (b.ctr || 10) - (a.ctr || 10);
    }
    return 0;
  });

  // Filtered & Sorted Shorts
  const filteredShorts = creatorShortVideos.filter((short) => {
    const matchesSearch = 
      short.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      short.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (short.verificationCode && short.verificationCode.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || short.category === selectedCategory;

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'pending' && short.status === 'pending') ||
      (statusFilter === 'published' && (short.status === 'published' || short.status === 'approved' || !short.status)) ||
      (statusFilter === 'rejected' && short.status === 'rejected');

    const matchesVisibility = 
      visibilityFilter === 'all' ||
      short.visibility === visibilityFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesVisibility;
  }).sort((a, b) => {
    if (sortBy === 'earnings') {
      return (b.estimatedEarnings || 0) - (a.estimatedEarnings || 0);
    }
    if (sortBy === 'views') {
      return b.views - a.views;
    }
    if (sortBy === 'likes') {
      return getVideoLikesCount(b) - getVideoLikesCount(a);
    }
    return 0;
  });

  // Quick Comment Actions for selected video modal
  const handleQuickSendReply = async (commentId: string) => {
    if (!quickReplyText.trim() || !viewingCommentsVideo) return;
    const targetComment = allVideoComments.find(c => c.id === commentId);
    const replyObj = {
      id: `rep-${Date.now()}`,
      author: channel?.name || 'बुंदेली क्रिएटर',
      avatar: channel?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      text: quickReplyText.trim(),
      timestamp: language === 'hi' ? 'अभी-अभी' : 'Just now'
    };

    setAllVideoComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), replyObj]
        };
      }
      return c;
    }));

    if (targetComment) {
      await replyToCommentInFirestore({
        id: targetComment.id,
        videoId: targetComment.videoId || viewingCommentsVideo.id,
        videoTitle: targetComment.videoTitle || viewingCommentsVideo.title,
        author: targetComment.author
      }, {
        author: replyObj.author,
        avatar: replyObj.avatar,
        text: replyObj.text,
        userId: channel.ownerUid,
        creatorId: channel.id
      });
    }

    setQuickReplyText('');
    setReplyingToCommentId(null);
  };

  const handleQuickToggleHeart = (commentId: string) => {
    const current = allVideoComments.find(c => c.id === commentId);
    const nextVal = !current?.isHearted;
    setAllVideoComments(prev => prev.map(c => c.id === commentId ? { ...c, isHearted: nextVal } : c));
    toggleCommentHeartInFirestore(commentId, nextVal);
  };

  const handleQuickTogglePin = (commentId: string) => {
    const current = allVideoComments.find(c => c.id === commentId);
    const nextVal = !current?.isPinned;
    setAllVideoComments(prev => prev.map(c => c.id === commentId ? { ...c, isPinned: nextVal } : c));
    toggleCommentPinInFirestore(commentId, nextVal);
  };

  const handleQuickDeleteComment = (commentId: string) => {
    setAllVideoComments(prev => prev.filter(c => c.id !== commentId));
    deleteCommentFromFirestore(commentId);
  };

  const handleToggleMonetization = (video: Video) => {
    const updatedStatus = !(video.isMonetized ?? true);
    const updated: Video = {
      ...video,
      isMonetized: updatedStatus
    };
    video.isMonetized = updatedStatus;
    if (onUpdateVideo) {
      onUpdateVideo(updated);
    }
  };

  const handleOpenEditModal = (video: Video) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDescription(video.description);
    setEditThumbnail(video.thumbnail);
    setEditTags(video.tags.join(', '));
    setEditCategory(video.category);
    setEditVisibility(video.visibility || 'public');
    setEditHasPaidPromotion(!!video.hasPaidPromotion);
    setEditSponsorName(video.sponsorName || '');
    setEditIsMonetized(video.isMonetized ?? true);
    setEditSavedSuccess(false);
  };

  const handleThumbnailFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, THUMBNAIL_COMPRESS_OPTIONS);
        setEditThumbnail(compressed);
      } catch (err) {
        console.warn('Thumbnail compression error:', err);
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          if (loadEvt.target?.result) {
            setEditThumbnail(loadEvt.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveVideoMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    let finalThumb = editThumbnail || editingVideo.thumbnail;
    if (finalThumb && finalThumb.startsWith('data:image/')) {
      try {
        finalThumb = await compressImageDataUrl(finalThumb, THUMBNAIL_COMPRESS_OPTIONS);
      } catch (_) {}
    }
    
    const updated: Video = {
      ...editingVideo,
      title: editTitle,
      description: editDescription,
      thumbnail: finalThumb,
      category: editCategory,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      visibility: editVisibility,
      hasPaidPromotion: editHasPaidPromotion,
      sponsorName: editHasPaidPromotion ? editSponsorName.trim() : undefined,
      isMonetized: editIsMonetized
    };

    // Update in-place reference
    editingVideo.title = updated.title;
    editingVideo.description = updated.description;
    editingVideo.thumbnail = updated.thumbnail;
    editingVideo.category = updated.category;
    editingVideo.tags = updated.tags;
    editingVideo.visibility = updated.visibility;
    editingVideo.hasPaidPromotion = updated.hasPaidPromotion;
    editingVideo.sponsorName = updated.sponsorName;
    editingVideo.isMonetized = updated.isMonetized;
    editingVideo.isMonetized = updated.isMonetized;

    if (onUpdateVideo) {
      onUpdateVideo(updated);
    }

    setEditSavedSuccess(true);
    setTimeout(() => {
      setEditingVideo(null);
      setEditSavedSuccess(false);
    }, 1000);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    setTimeout(() => {
      const newPostItem = {
        id: `post-${Date.now()}`,
        content: newPostContent,
        timestamp: language === 'hi' ? 'अभी-अभी' : 'Just now',
        likes: 0,
        commentsCount: 0
      };
      setPosts([newPostItem, ...posts]);
      setNewPostContent('');
      setIsPosting(false);
    }, 400);
  };

  return (
    <div id="studio-content-tab" className="space-y-5 animate-in fade-in">
      
      {/* Top Header & Sub-Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100">{t.studioContent}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'आपके चैनल के सभी अपलोड, रील्स, प्लेलिस्ट और कम्युनिटी पोस्ट्स का प्रबंधन करें'
              : 'Manage and monitor all your uploads, clips, live streams, playlists, and community posts'}
          </p>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>{t.uploadVideo}</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs (Videos / Shorts / Live / Playlists / Posts) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold border-b border-slate-800">
        <button
          onClick={() => setContentSubTab('videos')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            contentSubTab === 'videos'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'लंबे वीडियो (Videos)' : 'Videos'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40">{creatorLongVideos.length}</span>
        </button>

        <button
          onClick={() => setContentSubTab('shorts')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            contentSubTab === 'shorts'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'बुंदेली शॉर्ट्स (Shorts)' : 'Shorts / Clips'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40">{creatorShortVideos.length}</span>
        </button>

        <button
          onClick={() => setContentSubTab('live')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            contentSubTab === 'live'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'लाइव स्ट्रीम्स' : 'Live Streams'}</span>
        </button>

        <button
          onClick={() => setContentSubTab('playlists')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            contentSubTab === 'playlists'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>{language === 'hi' ? 'प्लेलिस्ट्स (Playlists)' : 'Playlists'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40">{playlists.length}</span>
        </button>

        <button
          onClick={() => setContentSubTab('posts')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            contentSubTab === 'posts'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'कम्युनिटी पोस्ट्स' : 'Community Posts'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40">{posts.length}</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. VIDEOS SUB-TAB (YouTube Studio Table)                 */}
      {/* ======================================================== */}
      {contentSubTab === 'videos' && (
        <div className="space-y-4">
          {/* Filter & Search Bar + Status Filter Tabs */}
          <div className="space-y-3">
            {/* Status Filter Tabs (All / Pending / Live / Rejected) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{language === 'hi' ? 'सभी वीडियो' : 'All Videos'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40 text-slate-300 font-mono">
                  {creatorLongVideos.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'pending'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                    : 'bg-slate-900 text-amber-400/90 hover:text-amber-300 border border-amber-500/30'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'hi' ? '⏳ समीक्षाधीन (Pending)' : '⏳ Pending Review'}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${totalPending > 0 ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-950/40 text-slate-400'}`}>
                  {totalPending}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('published')}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'published'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 text-emerald-400/90 hover:text-emerald-300 border border-emerald-500/30'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'hi' ? '✅ लाइव व स्वीकृत' : '✅ Live & Approved'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40 text-emerald-300 font-mono">
                  {totalPublished}
                </span>
              </button>

              {totalRejected > 0 && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('rejected')}
                  className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'rejected'
                      ? 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/20'
                      : 'bg-slate-900 text-rose-400/90 hover:text-rose-300 border border-rose-500/30'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'hi' ? '❌ अस्वीकृत' : '❌ Rejected'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                    {totalRejected}
                  </span>
                </button>
              )}
            </div>

            {/* Search and Dropdowns Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'वीडियो शीर्षक, कलाकार या सत्यापन कोड खोजें...' : 'Filter videos by title, singer, or verification code...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">{language === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}</option>
                  <option value="rai">💃 बुंदेली राई</option>
                  <option value="alha">⚔️ आल्हा ऊदल</option>
                  <option value="lokgeet">🪕 लोकगीत</option>
                  <option value="faag">🌸 फाग व रसिया</option>
                  <option value="bhajan">🪘 देसी भजन</option>
                </select>

                {/* Visibility Filter */}
                <select
                  value={visibilityFilter}
                  onChange={(e: any) => setVisibilityFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">{language === 'hi' ? 'सभी विजिबिलिटी' : 'All Visibility'}</option>
                  <option value="public">🌐 {language === 'hi' ? 'पब्लिक (Public)' : 'Public'}</option>
                  <option value="unlisted">🔗 {language === 'hi' ? 'अनलिस्टेड (Unlisted)' : 'Unlisted'}</option>
                  <option value="private">🔒 {language === 'hi' ? 'प्राइवेट (Private)' : 'Private'}</option>
                </select>

                {/* Sort By Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-amber-400 font-medium text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="recent">⏱️ {language === 'hi' ? 'दिनांक: नवीनतम' : 'Date: Newest First'}</option>
                  <option value="likes">👍 {language === 'hi' ? 'लाइक्स: सर्वाधिक' : 'Likes: Most Liked'}</option>
                  <option value="comments">💬 {language === 'hi' ? 'कमेंट्स: सर्वाधिक' : 'Comments: Most Active'}</option>
                  <option value="views">👁️ {language === 'hi' ? 'व्यूज: सर्वाधिक' : 'Views: Most Viewed'}</option>
                  <option value="earnings">💰 {language === 'hi' ? 'कमाई: सर्वाधिक' : 'Earnings: High to Low'}</option>
                  <option value="impressions">📊 {language === 'hi' ? 'इम्प्रेशंस: सर्वाधिक' : 'Impressions: Highest'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* YouTube Studio Styled Video Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input type="checkbox" className="w-4 h-4 accent-amber-500 rounded" />
                    </th>
                    <th className="py-3 px-4 min-w-[280px]">वीडियो (Video Details)</th>
                    <th className="py-3 px-4 text-center">स्थिति (Status)</th>
                    <th className="py-3 px-4 text-center">विजिबिलिटी</th>
                    <th className="py-3 px-4 text-center">मोनेटाइजेशन</th>
                    <th className="py-3 px-4 text-right">दिनांक</th>
                    <th className="py-3 px-4 text-right">व्यूज (Views)</th>
                    <th className="py-3 px-4 text-center">लाइक्स (👍)</th>
                    <th className="py-3 px-4 text-center">कमेंट्स (💬)</th>
                    <th className="py-3 px-4 text-center text-amber-600 dark:text-amber-400 font-bold">24h व्यूज व विज्ञापन</th>
                    <th className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">आपकी कमाई (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {filteredVideos.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-16 px-4 text-center">
                        <div className="max-w-md mx-auto space-y-3">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                            <UploadCloud className="w-7 h-7" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {statusFilter === 'pending' 
                              ? (language === 'hi' ? 'कोई समीक्षाधीन वीडियो नहीं है' : 'No pending review videos')
                              : (language === 'hi' ? 'कोई वीडियो नहीं मिला' : 'No videos found')}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {statusFilter === 'pending'
                              ? (language === 'hi' ? 'जब आप नया वीडियो अपलोड करेंगे, वह अप्रूवल के लिए यहाँ दिखाई देगा।' : 'Newly uploaded videos appear here until approved.')
                              : (language === 'hi' ? 'अपने चैनल पर वीडियो अपलोड करें और दर्शकों से जुड़ें।' : 'Upload videos to start engaging with viewers.')}
                          </p>
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={onOpenUploadModal}
                              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs shadow-md transition cursor-pointer inline-flex items-center gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              <span>{language === 'hi' ? 'नया वीडियो अपलोड करें' : 'Upload New Video'}</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredVideos.map((video) => {
                    const videoImpressions = video.impressions || (video.views * 8.6);
                    const earnings = video.estimatedEarnings || Math.round((video.views / 1000) * 35);
                    const isPending = video.status === 'pending';
                    const isRejected = video.status === 'rejected';
                    const videoLikes = getVideoLikesCount(video);
                    const videoComments = getVideoCommentsCount(video);

                    return (
                      <tr 
                        key={video.id} 
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group ${isPending ? 'bg-amber-500/5' : ''}`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-4">
                          <input type="checkbox" className="w-4 h-4 accent-amber-500 rounded" />
                        </td>

                        {/* Video Thumbnail + Title + Hover Action Bar */}
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-3">
                            <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                              <img
                                src={video.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                              <span className="absolute bottom-1 right-1 bg-slate-950/90 text-amber-300 text-[9px] font-mono px-1 rounded">
                                {video.duration}
                              </span>
                              {isPending && (
                                <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow-md flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>PENDING</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-1 min-w-0">
                              <h3 className="font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-amber-400 transition">
                                {video.title}
                              </h3>
                              <p className="text-[11px] text-slate-400 font-medium truncate">
                                {video.artist} • <span className="text-amber-500 font-mono">{video.verificationCode || 'BT-VERIFIED'}</span>
                              </p>

                              {/* Hover Action Bar (YouTube Studio Action Icons) */}
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(video)}
                                  title={language === 'hi' ? 'थंबनेल व विवरण बदलें' : 'Edit thumbnail & details'}
                                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3 text-amber-400" />
                                  <span>{language === 'hi' ? 'एडिट' : 'Edit'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setViewingCommentsVideo(video)}
                                  title={language === 'hi' ? `इस वीडियो के ${videoComments} कमेंट्स देखें` : `View ${videoComments} comments`}
                                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <MessageSquare className="w-3 h-3 text-amber-400" />
                                  <span>{language === 'hi' ? `कमेंट्स (${videoComments})` : `Comments (${videoComments})`}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPromotingVideo(video)}
                                  title={language === 'hi' ? 'वीडियो प्रमोट करें और इम्प्रेशन्स बढ़ाएं' : 'Promote video & boost reach'}
                                  className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
                                >
                                  <Zap className="w-3 h-3 text-amber-400" />
                                  <span>{language === 'hi' ? 'प्रमोट' : 'Promote'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAnalyticsVideo(video)}
                                  title={language === 'hi' ? 'इस वीडियो का एनालिटिक्स देखें' : 'View video analytics'}
                                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <BarChart3 className="w-3 h-3 text-blue-400" />
                                  <span>{language === 'hi' ? 'एनालिटिक्स' : 'Analytics'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onInspectVideo(video)}
                                  title={language === 'hi' ? 'प्लेयर में देखें' : 'View on player'}
                                  className="p-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition cursor-pointer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setVideoToDelete(video)}
                                  title={language === 'hi' ? 'वीडियो हटाएं (Delete Video)' : 'Delete video'}
                                  className="p-1 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-400 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status (Pending / Live / Rejected) */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold shadow-xs">
                                <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                                <span>{language === 'hi' ? 'समीक्षाधीन (Pending)' : 'Under Review'}</span>
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold" title={video.rejectionReason || 'समीक्षा में अस्वीकृत'}>
                                <AlertCircle className="w-3 h-3 text-rose-400" />
                                <span>{language === 'hi' ? 'अस्वीकृत (Rejected)' : 'Rejected'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>{language === 'hi' ? 'स्वीकृत व लाइव' : 'Live / Approved'}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Visibility */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {video.visibility === 'private' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                                <Lock className="w-3 h-3" />
                                <span>Private</span>
                              </span>
                            ) : video.visibility === 'unlisted' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold">
                                <LinkIcon className="w-3 h-3" />
                                <span>Unlisted</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                <Globe2 className="w-3 h-3" />
                                <span>Public</span>
                              </span>
                            )}
                            {video.hasPaidPromotion && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold">
                                <Megaphone className="w-2.5 h-2.5" />
                                <span>Paid Promo</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Monetization */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleMonetization(video)}
                            title={video.isMonetized !== false ? 'मोनेटाइजेशन चालू है (क्लिक करके बंद करें)' : 'मोनेटाइजेशन बंद है (क्लिक करके चालू करें)'}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                              video.isMonetized !== false
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>{video.isMonetized !== false ? (language === 'hi' ? 'चालू (ON)' : 'ON') : (language === 'hi' ? 'बंद (OFF)' : 'OFF')}</span>
                          </button>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                          {video.uploadDate}
                        </td>

                        {/* Views */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                          {video.views.toLocaleString('en-IN')}
                        </td>

                        {/* Individual Likes Count */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono font-bold text-amber-400">
                            <ThumbsUp className="w-3.5 h-3.5 fill-amber-400/20 text-amber-400" />
                            <span>{videoLikes.toLocaleString('en-IN')}</span>
                          </div>
                        </td>

                        {/* Individual Comments Count */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setViewingCommentsVideo(video)}
                            title={language === 'hi' ? `इस वीडियो के ${videoComments} कमेंट्स देखें व रिप्लाई करें` : `View and reply to ${videoComments} comments`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 text-xs font-mono font-bold text-slate-200 hover:text-amber-300 transition cursor-pointer group/cmt"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-amber-400 group-hover/cmt:scale-110 transition" />
                            <span>{videoComments.toLocaleString('en-IN')}</span>
                          </button>
                        </td>

                        {/* 24-Hour Views & Ads Count */}
                        <td className="py-3 px-4 text-center">
                          {(() => {
                            const stats = get24HourMetrics(video);
                            return (
                              <div className="inline-flex flex-col items-center justify-center px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-amber-500/20 text-[11px] font-mono leading-tight">
                                <span className="text-blue-600 dark:text-blue-400 font-bold">{stats.views24h.toLocaleString('en-IN')} views</span>
                                <span className="text-amber-600 dark:text-amber-400 font-black">{stats.adImpressions24h.toLocaleString('en-IN')} ads</span>
                              </div>
                            );
                          })()}
                        </td>

                        {/* Estimated Ad Revenue */}
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                          ₹{earnings.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SHORTS / CLIPS SUB-TAB                                */}
      {/* ======================================================== */}
      {contentSubTab === 'shorts' && (
        <div className="space-y-4">
          {filteredShorts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-100">
                {language === 'hi' ? 'कोई बुंदेली रील्स / शॉर्ट्स नहीं है' : 'No Shorts Found'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {language === 'hi'
                  ? 'क्रिएट (+) बटन या अपलोड से "शॉर्ट्स / रील्स" विकल्प चुनकर नया शॉर्ट अपलोड करें।'
                  : 'Upload vertical short videos up to 60 seconds from the Upload modal.'}
              </p>
              <button
                onClick={onOpenUploadModal}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'hi' ? 'शॉर्ट अपलोड करें' : 'Upload Short'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredShorts.map((short) => {
                const viewsCount = short.views || 0;
                const likesCount = getVideoLikesCount(short);
                const earnings = short.estimatedEarnings || Math.round(viewsCount * 0.045);
                const isMonetized = short.isMonetized ?? true;

                return (
                  <div key={short.id} className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden p-3 flex flex-col justify-between group transition duration-200">
                    <div className="space-y-2">
                      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-950">
                        <img 
                          src={short.thumbnail || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80'} 
                          alt={short.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                        />
                        <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3 h-3" />
                          Shorts
                        </span>
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          {short.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-slate-950 shadow-md">
                              ⏳ समीक्षा
                            </span>
                          ) : short.status === 'rejected' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/90 text-white shadow-md">
                              ❌ अस्वीकृत
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-slate-950 shadow-md">
                              ✅ लाइव
                            </span>
                          )}
                        </div>

                        {/* Quick View trigger */}
                        <button
                          onClick={() => onInspectVideo(short)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                          </div>
                        </button>
                      </div>

                      <h4 className="font-bold text-xs text-slate-100 line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                        {short.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">{short.artist}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Eye className="w-3 h-3 text-slate-400" />
                          {viewsCount.toLocaleString('en-IN')}
                        </span>
                        <span className="flex items-center gap-1 text-rose-400 font-bold">
                          <Heart className="w-3 h-3 fill-rose-400" />
                          {likesCount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 text-[10px]">कमाई:</span>
                        <span className="text-emerald-400 font-mono font-bold">₹{earnings}</span>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => handleToggleMonetization(short)}
                          title={isMonetized ? 'Monetization On' : 'Monetization Off'}
                          className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
                            isMonetized ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                          }`}
                        >
                          <IndianRupee className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(short)}
                          title="Edit Details"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 transition cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => onDeleteVideo && onDeleteVideo(short.id)}
                          title="Delete Short"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. LIVE STREAMS SUB-TAB                                  */}
      {/* ======================================================== */}
      {contentSubTab === 'live' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
            <Radio className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            {language === 'hi' ? 'बुंदेली लाइव अखाड़ा व राई मंच' : 'Go Live on BundeliTube'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {language === 'hi' 
              ? 'सीधे अपने फोन या ओबीएस स्टूडियो (OBS) से लाइव राई मुकाबला, लोकगीत या भजन का लाइव प्रसारण करें और सुपर चैट कमाएं।' 
              : 'Broadcast live Bundeli folk events and receive real-time tips from viewers across the country.'}
          </p>
          <button className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-slate-100 font-bold text-xs shadow-lg shadow-rose-600/20 cursor-pointer">
            {language === 'hi' ? 'लाइव स्ट्रीम शेड्यूल करें' : 'Schedule Live Stream'}
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. PLAYLISTS SUB-TAB                                     */}
      {/* ======================================================== */}
      {contentSubTab === 'playlists' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              {language === 'hi' ? 'आपके चैनल की प्लेलिस्ट्स' : 'Channel Playlists'}
            </h3>
            <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'नई प्लेलिस्ट बनाएं' : 'New Playlist'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {playlists.map((pl) => (
              <div key={pl.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-amber-500/40 transition">
                <div className="relative aspect-video bg-slate-950">
                  <img src={pl.thumbnail} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  <div className="absolute inset-y-0 right-0 w-2/5 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-slate-200 p-2 text-center">
                    <span className="text-base font-black font-mono">{pl.videoCount}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">Videos</span>
                  </div>
                </div>
                <div className="p-3.5 space-y-1">
                  <h4 className="font-bold text-xs text-slate-100 line-clamp-1">{pl.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-semibold">{pl.visibility.toUpperCase()}</span>
                    <span>{pl.updatedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. POSTS / COMMUNITY SUB-TAB                             */}
      {/* ======================================================== */}
      {contentSubTab === 'posts' && (
        <div className="space-y-6">
          {/* Create Post Box */}
          <form onSubmit={handleCreatePost} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'कम्युनिटी पोस्ट बनाएं' : 'Create Community Post'}</span>
            </h3>
            <textarea
              rows={3}
              placeholder={language === 'hi' ? 'अपने दर्शकों के साथ बुंदेली विचार, आगामी कार्यक्रमों की सूचना या प्रश्न साझा करें...' : 'Share an update, poll, or message with your viewers...'}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                {language === 'hi' ? 'सभी सब्सक्राइबर्स को होम फीड में दिखाई देगा।' : 'Will be visible to all subscribers.'}
              </span>
              <button
                type="submit"
                disabled={isPosting || !newPostContent.trim()}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition cursor-pointer"
              >
                {isPosting ? 'पोस्ट हो रहा है...' : (language === 'hi' ? 'पब्लिश करें' : 'Post')}
              </button>
            </div>
          </form>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={channel.avatar} alt={channel.name} className="w-8 h-8 rounded-full object-cover border border-amber-500/40" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-100">{channel.name}</h4>
                      <span className="text-[10px] text-slate-400">{post.timestamp}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{post.content}</p>

                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-64 bg-slate-950">
                    <img src={post.imageUrl} alt="post visual" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <button className="flex items-center gap-1.5 hover:text-amber-400 transition">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-amber-400 transition">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.commentsCount} comments</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIDEO METADATA EDIT MODAL (YouTube Studio Full Editor)    */}
      {/* ======================================================== */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-100 my-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-slate-100">
                  {language === 'hi' ? 'वीडियो विवरण व मेटाडेटा संपादित करें' : 'Edit Video Details'}
                </h3>
              </div>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {editSavedSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{language === 'hi' ? 'वीडियो मेटाडेटा सफलतापूर्वक अपडेट हो गया!' : 'Video metadata updated successfully!'}</span>
              </div>
            )}

            <form onSubmit={handleSaveVideoMetadata} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {language === 'hi' ? 'वीडियो शीर्षक (Title)' : 'Video Title'}
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                  required
                />
              </div>

              {/* Thumbnail Customization Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>{language === 'hi' ? 'वीडियो थंबनेल बदलें (Change Thumbnail)' : 'Custom Video Thumbnail'}</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold">HD 1280x720</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Current Thumbnail Preview */}
                  <div className="relative w-36 aspect-video rounded-xl overflow-hidden bg-slate-900 border-2 border-amber-500/50 shrink-0 shadow-lg group">
                    <img 
                      src={editThumbnail || editingVideo.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'} 
                      alt="Thumbnail Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <span className="text-[10px] text-white font-bold bg-black/80 px-2 py-0.5 rounded">
                        लाइव प्रिव्यू
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail Upload & URL Input */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <UploadCloud className="w-4 h-4 text-amber-400" />
                        <span>{language === 'hi' ? 'डिवाइस से नई फोटो चुनें' : 'Upload from Device'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="url"
                        placeholder={language === 'hi' ? 'या थंबनेल इमेज URL पेस्ट करें (https://...)' : 'Or paste thumbnail image URL...'}
                        value={editThumbnail}
                        onChange={(e) => setEditThumbnail(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      {editThumbnail && (
                        <button
                          type="button"
                          onClick={() => setEditThumbnail('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preset Bundeli Thumbnails */}
                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[11px] text-slate-400 block mb-2 font-medium">
                    {language === 'hi' ? '⚡ त्वरित प्रीसेट थंबनेल चुनें:' : '⚡ Or choose a high-quality preset:'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {THUMBNAIL_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditThumbnail(preset.url)}
                        className={`p-1 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                          editThumbnail === preset.url
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        <span className="text-[10px] font-bold truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {language === 'hi' ? 'विवरण (Description)' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {language === 'hi' ? 'श्रेणी (YouTube Category)' : 'Category'}
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon || '🎬'} {language === 'hi' ? cat.hindiName : cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {language === 'hi' ? 'टैग्स (Tags - अल्पविराम द्वारा)' : 'Tags'}
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Visibility / Privacy Selector in Edit Modal */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <label className="text-xs font-bold text-slate-300 block">
                  {language === 'hi' ? 'गोपनीयता / दृश्यता (Privacy & Visibility)' : 'Privacy & Visibility'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditVisibility('public')}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5 ${
                      editVisibility === 'public'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>Public</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditVisibility('unlisted')}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5 ${
                      editVisibility === 'unlisted'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Unlisted</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditVisibility('private')}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5 ${
                      editVisibility === 'private'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private</span>
                  </button>
                </div>
              </div>

              {/* Monetization ON / OFF Switch */}
              <div className={`p-4 rounded-2xl border transition-all ${
                editIsMonetized 
                  ? 'bg-emerald-950/20 border-emerald-500/30' 
                  : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base ${
                      editIsMonetized 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">
                          {language === 'hi' ? 'वीडियो मोनेटाइजेशन (विज्ञापन व कमाई)' : 'Video Monetization & Ad Revenue'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          editIsMonetized 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {editIsMonetized ? (language === 'hi' ? 'चालू (ON)' : 'ON') : (language === 'hi' ? 'बंद (OFF)' : 'OFF')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {editIsMonetized 
                          ? (language === 'hi' ? 'इस वीडियो पर विज्ञापन दिखाए जाएंगे और विज्ञापन रेवेन्यू आपके क्रिएटर वॉलेट में जुड़ेगा।' : 'Monetization enabled: ads will run and generate revenue.')
                          : (language === 'hi' ? 'मोनेटाइजेशन बंद है। कोई विज्ञापन नहीं दिखाया जाएगा।' : 'Monetization disabled: ads are turned off.')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditIsMonetized(!editIsMonetized)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      editIsMonetized ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                    role="switch"
                    aria-checked={editIsMonetized}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        editIsMonetized ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Paid Promotion Option (Sponsorship Declaration) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="paid-promo-edit-toggle"
                    checked={editHasPaidPromotion}
                    onChange={(e) => setEditHasPaidPromotion(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="paid-promo-edit-toggle" className="text-xs font-bold text-slate-200 cursor-pointer flex-1">
                    <span className="flex items-center gap-1.5 text-purple-300">
                      <Megaphone className="w-3.5 h-3.5" />
                      {language === 'hi' ? 'सशुल्क प्रचार शामिल है (Includes Paid Promotion / Sponsorship)' : 'Paid Promotion Declaration'}
                    </span>
                    <span className="block text-[11px] text-slate-400 font-normal mt-0.5">
                      {language === 'hi'
                        ? 'यदि इस वीडियो में किसी प्रायोजक, ब्रांड, विज्ञापन या पेड पार्टनरशिप का प्रचार शामिल है तो इसे चुनें।'
                        : 'Check this if you received compensation, products, or sponsorship to create this video.'}
                    </span>
                  </label>
                </div>

                {editHasPaidPromotion && (
                  <div className="pt-2 pl-7 animate-in fade-in">
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      {language === 'hi' ? 'प्रायोजक / ब्रांड का नाम (वैकल्पिक)' : 'Sponsor / Brand Name (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'hi' ? 'उदा: श्री राम मिष्ठान भंडार झांसी / देसी हर्बल्स' : 'e.g. Bundelkhand Heritage Co.'}
                      value={editSponsorName}
                      onChange={(e) => setEditSponsorName(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-purple-500/40 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const toDel = editingVideo;
                    setEditingVideo(null);
                    setVideoToDelete(toDel);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white font-bold text-xs transition border border-rose-500/30 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'वीडियो हटाएं (Delete Video)' : 'Delete Video'}</span>
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingVideo(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                  >
                    {t.close}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    {language === 'hi' ? 'सुरक्षित करें (Save Changes)' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Video Confirmation Modal */}
      {videoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-100">
                {language === 'hi' ? 'क्या आप इस वीडियो को हटाना चाहते हैं?' : 'Delete Video Permanently?'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? `"${videoToDelete.title}" वीडियो को हटाने पर यह Firestore डेटाबेस और आपके चैनल से हमेशा के लिए हट जाएगी। यह क्रिया पूर्ववत (Undo) नहीं की जा सकती।`
                  : `Are you sure you want to delete "${videoToDelete.title}"? This will permanently remove the video from Firestore and your channel.`}
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center gap-3">
              <img
                src={videoToDelete.thumbnail}
                alt={videoToDelete.title}
                className="w-14 h-10 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{videoToDelete.title}</p>
                <p className="text-[10px] text-slate-400">{videoToDelete.views.toLocaleString('en-IN')} views • {videoToDelete.duration}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setVideoToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                {language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!videoToDelete) return;
                  setIsDeleting(true);
                  if (onDeleteVideo) {
                    await onDeleteVideo(videoToDelete.id);
                  }
                  setIsDeleting(false);
                  setVideoToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? (language === 'hi' ? 'हटाया जा रहा है...' : 'Deleting...') : (language === 'hi' ? 'हाँ, वीडियो हटाएं' : 'Yes, Delete Video')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Per-Video Detailed Analytics Modal */}
      {analyticsVideo && (
        <VideoAnalyticsModal
          isOpen={!!analyticsVideo}
          onClose={() => setAnalyticsVideo(null)}
          video={analyticsVideo}
          language={language}
          onEditVideo={(v) => handleOpenEditModal(v)}
          onOpenPlayer={(v) => onInspectVideo(v)}
        />
      )}

      {/* Promote Video Modal */}
      {promotingVideo && (
        <PromoteVideoModal
          isOpen={!!promotingVideo}
          onClose={() => setPromotingVideo(null)}
          video={promotingVideo}
          language={language}
          onPromotionSubmitted={(campaign) => {
            if (onPromoteVideo) {
              onPromoteVideo(campaign);
            }
          }}
        />
      )}

      {/* Video Comments & Engagement Modal */}
      {viewingCommentsVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-950/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-16 aspect-video rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                  <img
                    src={viewingCommentsVideo.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'}
                    alt={viewingCommentsVideo.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-0.5 bg-slate-950/90 text-amber-300 text-[8px] font-mono px-1 rounded">
                    {viewingCommentsVideo.duration}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {viewingCommentsVideo.status === 'pending' ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>समीक्षाधीन (Pending)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>लाइव (Live)</span>
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {viewingCommentsVideo.id}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 line-clamp-1">
                    {viewingCommentsVideo.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <ThumbsUp className="w-3.5 h-3.5 fill-amber-400/20" />
                      {getVideoLikesCount(viewingCommentsVideo).toLocaleString('en-IN')} लाइक्स
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300 font-bold">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      {getVideoCommentsCount(viewingCommentsVideo).toLocaleString('en-IN')} कमेंट्स
                    </span>
                    <span>•</span>
                    <span>{viewingCommentsVideo.views.toLocaleString('en-IN')} व्यूज</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewingCommentsVideo(null);
                  setReplyingToCommentId(null);
                  setQuickReplyText('');
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Comments List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {(() => {
                const videoSpecificComments = allVideoComments.filter(
                  (c) => c.videoId === viewingCommentsVideo.id
                );

                if (videoSpecificComments.length === 0) {
                  return (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-200">
                        {language === 'hi' ? 'इस वीडियो पर अभी कोई टिप्पणी नहीं है' : 'No comments on this video yet'}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {language === 'hi'
                          ? 'दर्शक जब इस वीडियो पर कमेंट करेंगे, वह तुरंत यहाँ दिखाई देंगे और आप उन्हें क्रिएटर दिल व उत्तर दे सकेंगे।'
                          : 'When viewers comment on this video, they will appear here in real-time.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {videoSpecificComments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          comment.isPinned
                            ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                            : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {comment.isPinned && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 mb-2 font-mono">
                            <Pin className="w-3 h-3 fill-amber-400" />
                            <span>{language === 'hi' ? 'पिन की गई टिप्पणी' : 'Pinned by Creator'}</span>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-2.5">
                            <img
                              src={comment.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={comment.author}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700"
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-slate-200">{comment.author}</span>
                                <span className="text-[10px] text-slate-500">{comment.timestamp}</span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">{comment.text}</p>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleQuickToggleHeart(comment.id)}
                              title={comment.isHearted ? 'हार्ट हटाएं' : 'क्रिएटर हार्ट दें'}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                comment.isHearted
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'hover:bg-slate-800 text-slate-400 hover:text-rose-400'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${comment.isHearted ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickTogglePin(comment.id)}
                              title={comment.isPinned ? 'अनपिन करें' : 'पिन करें'}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                comment.isPinned
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'hover:bg-slate-800 text-slate-400 hover:text-amber-400'
                              }`}
                            >
                              <Pin className={`w-3.5 h-3.5 ${comment.isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)}
                              title="उत्तर दें"
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                replyingToCommentId === comment.id
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickDeleteComment(comment.id)}
                              title="डिलीट करें"
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Existing Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-2.5 pl-8 space-y-2 border-l-2 border-slate-800">
                            {comment.replies.map((rep) => (
                              <div key={rep.id} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl">
                                <img
                                  src={rep.avatar}
                                  alt={rep.author}
                                  className="w-5 h-5 rounded-full object-cover border border-amber-500/40"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[11px] text-amber-400">{rep.author}</span>
                                    <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded font-bold">क्रिएटर</span>
                                    <span className="text-[9px] text-slate-500">{rep.timestamp}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-300 mt-0.5">{rep.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inline Reply Form */}
                        {replyingToCommentId === comment.id && (
                          <div className="mt-3 pl-8 flex items-center gap-2 animate-in fade-in">
                            <input
                              type="text"
                              autoFocus
                              placeholder={`${comment.author} को उत्तर लिखें...`}
                              value={quickReplyText}
                              onChange={(e) => setQuickReplyText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleQuickSendReply(comment.id);
                                }
                              }}
                              className="flex-1 px-3 py-1.5 bg-slate-900 border border-amber-500/50 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleQuickSendReply(comment.id)}
                              disabled={!quickReplyText.trim()}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                            >
                              भेजें
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToCommentId(null);
                                setQuickReplyText('');
                              }}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
                            >
                              रद्द
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setViewingCommentsVideo(null);
                  onGoToComments();
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>स्टूडियो कमैंट्स टैब में सभी देखें (Open Studio Comments)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingCommentsVideo(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
