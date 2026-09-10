import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Heart, 
  ThumbsUp, 
  Pin, 
  Trash2, 
  Reply, 
  Check, 
  HelpCircle,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { StudioComment, Channel, UserAccount, Video } from '../../types';
import { Language, translations } from '../../locales/i18n';
import { STUDIO_COMMENTS } from '../../data/mockData';
import {
  getFirestoreSafe,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  toggleCommentHeartInFirestore,
  toggleCommentPinInFirestore,
  deleteCommentFromFirestore,
  replyToCommentInFirestore
} from '../../lib/firebase';

interface StudioCommentsTabProps {
  channel?: Channel;
  currentUser?: UserAccount | null;
  language: Language;
  creatorVideos?: Video[];
}

export const StudioCommentsTab: React.FC<StudioCommentsTabProps> = ({ channel, currentUser, language, creatorVideos = [] }) => {
  const t = translations[language];

  const [comments, setComments] = useState<StudioComment[]>([]);
  const [subFilter, setSubFilter] = useState<'all' | 'questions' | 'hearted' | 'review'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Real-time Firestore sync for channel comments
  useEffect(() => {
    try {
      const db = getFirestoreSafe();
      const commentsRef = collection(db, 'comments');
      const creatorVideoIds = new Set(creatorVideos.map(v => v.id));
      const myChannelId = channel?.id;
      const myOwnerUid = channel?.ownerUid;
      const myUserId = currentUser?.id;

      // Listen to comments and strictly filter for this creator's channel and videos
      const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
        if (!snapshot.empty) {
          const liveList: StudioComment[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            
            // Strict ownership verification:
            const isMatch = Boolean(
              (myChannelId && (d.creatorId === myChannelId || d.channelId === myChannelId || d.creatorChannelId === myChannelId)) ||
              (myOwnerUid && (d.creatorId === myOwnerUid || d.channelId === myOwnerUid || d.creatorUid === myOwnerUid)) ||
              (myUserId && (d.creatorId === myUserId || d.creatorUid === myUserId || d.channelId === myUserId)) ||
              (d.videoId && creatorVideoIds.has(d.videoId))
            );

            if (isMatch) {
              liveList.push({
                id: docSnap.id,
                author: d.author || d.userName || 'बुंदेली दर्शक',
                avatar: d.avatar || d.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                text: d.text || '',
                timestamp: d.createdAt ? new Date(d.createdAt).toLocaleDateString('hi-IN') : 'हाल ही में',
                videoTitle: d.videoTitle || 'बुंदेली गीत',
                videoId: d.videoId || '',
                likes: d.likes || 0,
                isHearted: !!d.isHearted,
                isPinned: !!d.isPinned,
                isQuestion: !!d.isQuestion || (d.text?.includes('?') || d.text?.includes('क्या')),
                replies: d.replies || []
              });
            }
          });

          setComments(liveList);
        } else {
          setComments([]);
        }
      }, (err) => {
        console.warn('Studio comments listener note:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Studio comments setup note:', e);
    }
  }, [channel?.id, channel?.ownerUid, currentUser?.id, creatorVideos]);

  const toggleHeart = (id: string) => {
    const current = comments.find(c => c.id === id);
    const nextVal = !current?.isHearted;
    setComments(comments.map(c => c.id === id ? { ...c, isHearted: nextVal } : c));
    toggleCommentHeartInFirestore(id, nextVal);
  };

  const togglePin = (id: string) => {
    const current = comments.find(c => c.id === id);
    const nextVal = !current?.isPinned;
    setComments(comments.map(c => c.id === id ? { ...c, isPinned: nextVal } : c));
    toggleCommentPinInFirestore(id, nextVal);
  };

  const deleteComment = (id: string) => {
    setComments(comments.filter(c => c.id !== id));
    deleteCommentFromFirestore(id);
  };

  const handleSendReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    const targetComment = comments.find(c => c.id === commentId);
    const replyObj = {
      id: `rep-${Date.now()}`,
      author: channel?.name || currentUser?.name || 'बुंदेली रंगमंच (Creator)',
      avatar: channel?.avatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      text: replyText.trim(),
      timestamp: language === 'hi' ? 'अभी' : 'Just now'
    };

    setComments(comments.map(c => {
      if (c.id === commentId) {
        const existingReplies = c.replies || [];
        return {
          ...c,
          replies: [...existingReplies, replyObj]
        };
      }
      return c;
    }));

    if (targetComment) {
      await replyToCommentInFirestore({
        id: targetComment.id,
        videoId: targetComment.videoId || '',
        videoTitle: targetComment.videoTitle,
        author: targetComment.author,
      }, {
        author: replyObj.author,
        avatar: replyObj.avatar,
        text: replyObj.text,
        userId: currentUser?.id,
        creatorId: channel?.id || currentUser?.id
      });
    }

    setReplyText('');
    setReplyingToId(null);
  };

  const filteredComments = comments.filter((c) => {
    if (subFilter === 'questions' && !c.isQuestion) return false;
    if (subFilter === 'hearted' && !c.isHearted) return false;
    if (searchQuery) {
      return (
        c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.videoTitle && c.videoTitle.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return true;
  });

  return (
    <div id="studio-comments-tab" className="space-y-5 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100">{t.studioComments}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'दर्शकों की टिप्पणियों का उत्तर दें, दिल दें, पिन करें और कम्युनिटी मॉडरेट करें'
              : 'Respond to viewer comments, give creator hearts, pin top comments, and moderate community discussions'}
          </p>
        </div>
      </div>

      {/* Sub Tabs & Search Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setSubFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              subFilter === 'all' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'hi' ? 'प्रकाशित (Published)' : 'Published'}
          </button>
          <button
            onClick={() => setSubFilter('questions')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
              subFilter === 'questions' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'प्रश्न वाले (Contains Questions)' : 'Questions'}</span>
          </button>
          <button
            onClick={() => setSubFilter('hearted')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
              subFilter === 'hearted' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{language === 'hi' ? 'क्रिएटर दिल दिए गए' : 'Hearted'}</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'टिप्पणी या दर्शक खोजें...' : 'Search comments...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {filteredComments.map((comment) => (
          <div 
            key={comment.id} 
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-md hover:border-slate-700 transition"
          >
            {/* Top Video Context Tag */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800/80">
              <span className="line-clamp-1 font-medium text-slate-300">
                {language === 'hi' ? 'गाना:' : 'Video:'} <strong className="text-amber-400">{comment.videoTitle}</strong>
              </span>
              {comment.isPinned && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  <Pin className="w-3 h-3 fill-amber-400" />
                  {language === 'hi' ? 'पिन किया गया' : 'Pinned'}
                </span>
              )}
            </div>

            {/* Comment Body */}
            <div className="flex items-start gap-3">
              <img
                src={comment.avatar}
                alt={comment.author}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-800"
              />
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-200">{comment.author}</h4>
                  <span className="text-[10px] text-slate-500">{comment.timestamp}</span>
                </div>
                <p className="text-xs text-slate-100 leading-relaxed whitespace-pre-line">
                  {comment.text}
                </p>

                {/* Interactive Action Icons (YouTube Studio Style) */}
                <div className="flex items-center gap-4 pt-2 text-xs text-slate-400">
                  <button className="flex items-center gap-1 hover:text-slate-200 transition">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{comment.likes}</span>
                  </button>

                  <button
                    onClick={() => toggleHeart(comment.id)}
                    className={`flex items-center gap-1 transition ${
                      comment.isHearted ? 'text-rose-500 font-bold' : 'hover:text-rose-400'
                    }`}
                    title={language === 'hi' ? 'क्रिएटर दिल दें' : 'Give Creator Heart'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${comment.isHearted ? 'fill-rose-500' : ''}`} />
                    <span>{comment.isHearted ? (language === 'hi' ? 'दिल दिया' : 'Hearted') : (language === 'hi' ? 'दिल दें' : 'Heart')}</span>
                  </button>

                  <button
                    onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                    className="flex items-center gap-1 hover:text-amber-400 transition"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'उत्तर दें (Reply)' : 'Reply'}</span>
                  </button>

                  <button
                    onClick={() => togglePin(comment.id)}
                    className="flex items-center gap-1 hover:text-amber-400 transition ml-auto"
                    title="Pin Comment"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="flex items-center gap-1 hover:text-rose-400 transition"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Inline Reply Input */}
                {replyingToId === comment.id && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <input
                      type="text"
                      placeholder={language === 'hi' ? 'चैनल की तरफ से उत्तर लिखें...' : 'Reply as channel...'}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setReplyingToId(null)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                      >
                        {t.cancel}
                      </button>
                      <button
                        onClick={() => handleSendReply(comment.id)}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                      >
                        {language === 'hi' ? 'उत्तर भेजें' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-amber-500/40 space-y-2">
                    {comment.replies.map((rep) => (
                      <div key={rep.id} className="p-2.5 rounded-xl bg-slate-950/80 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <img src={rep.avatar} alt={rep.author} className="w-4 h-4 rounded-full object-cover" />
                          <span className="font-bold text-amber-400 text-[11px]">{rep.author}</span>
                          <span className="text-[10px] text-slate-500">{rep.timestamp}</span>
                        </div>
                        <p className="text-slate-200 text-xs">{rep.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
