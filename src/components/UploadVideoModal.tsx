import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Clock, 
  Tag, 
  Mic2, 
  Megaphone, 
  DollarSign, 
  Globe, 
  Film, 
  Zap, 
  Link as LinkIcon, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  Play,
  ExternalLink,
  Info
} from 'lucide-react';
import { Video, VideoSubmission, Channel, UserAccount, RemoteAppConfig } from '../types';
import { CATEGORIES } from '../data/mockData';
import { Language, translations } from '../locales/i18n';
import { getAuthSafe, getFirestoreSafe, doc, setDoc, serverTimestamp, cleanFirestoreData } from '../lib/firebase';
import { compressImageFile, THUMBNAIL_COMPRESS_OPTIONS } from '../lib/imageCompressor';

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (video: Video) => void;
  onNavigateToShorts?: () => void;
  channel?: Channel;
  currentUser?: UserAccount | null;
  channelName?: string;
  channelAvatar?: string;
  channelId?: string;
  creatorUid?: string;
  remoteConfig?: RemoteAppConfig;
  language: Language;
  onOpenCreateChannel?: () => void;
  onOpenLogin?: () => void;
}

/**
 * Extracts 11-character YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  // Direct 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  // Standard, shorts, embed, or youtu.be link
  const match = trimmed.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|(?:shorts)\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export const UploadVideoModal: React.FC<UploadVideoModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  onNavigateToShorts,
  channel,
  currentUser,
  creatorUid,
  language,
  onOpenCreateChannel,
  onOpenLogin
}) => {
  const t = translations[language];

  const effectiveChanName = channel?.name || (currentUser as any)?.channelName || currentUser?.name || '';
  const effectiveChanAvatar = channel?.avatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  const effectiveChanId = channel?.id || (currentUser as any)?.channelId || (currentUser ? `chan-${currentUser.id}` : '');
  const resolvedCreatorUid = creatorUid || currentUser?.uid || currentUser?.id || 'user-1';

  // Form State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [extractedId, setExtractedId] = useState<string | null>(null);
  const [videoFormat, setVideoFormat] = useState<'video' | 'short'>('video');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState('rai');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('4:30');
  const [tags, setTags] = useState('बुंदेली राई, लोकगीत, Bundeli Video');
  const [customThumbnail, setCustomThumbnail] = useState('');
  const [hasPaidPromotion, setHasPaidPromotion] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [isMonetized, setIsMonetized] = useState(true);
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');

  // YouTube Ownership Verification Code (Generated ONLY after a valid YouTube link is entered)
  const [verificationCode, setVerificationCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle URL change & auto-extract
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setYoutubeUrl(val);
    setErrorMessage('');

    const yId = extractYouTubeId(val);
    setExtractedId(yId);

    if (val.includes('/shorts/')) {
      setVideoFormat('short');
      setCategory('shorts');
      setDuration('0:50');
    }

    if (yId) {
      // Generate ownership code ONLY when YouTube link is entered!
      if (!verificationCode) {
        setVerificationCode(`BT-${Math.floor(100000 + Math.random() * 900000)}`);
      }
      if (!customThumbnail) {
        setCustomThumbnail(`https://img.youtube.com/vi/${yId}/hqdefault.jpg`);
      }
    } else {
      // Clear code if URL is cleared or invalid
      setVerificationCode('');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2500);
  };

  const handleRegenerateCode = () => {
    const newCode = `BT-${Math.floor(100000 + Math.random() * 900000)}`;
    setVerificationCode(newCode);
    setCodeCopied(false);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, THUMBNAIL_COMPRESS_OPTIONS);
        setCustomThumbnail(compressed);
      } catch (err) {
        console.warn('Thumbnail compression fallback:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setCustomThumbnail(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const yId = extractYouTubeId(youtubeUrl);
    if (!yId) {
      setErrorMessage(
        language === 'hi' 
          ? 'कृपया वैध यूट्यूब वीडियो लिंक दर्ज करें (उदा. https://www.youtube.com/watch?v=... या https://youtu.be/...)' 
          : 'Please enter a valid YouTube video URL.'
      );
      return;
    }

    if (!title.trim() || !artist.trim()) {
      setErrorMessage(
        language === 'hi' 
          ? 'कृपया वीडियो का शीर्षक और गायक/कलाकार का नाम अवश्य भरें।' 
          : 'Please enter both video title and artist name.'
      );
      return;
    }

    setIsSubmitting(true);
    const authInstance = getAuthSafe();
    const effectiveCreatorUid = authInstance?.currentUser?.uid || resolvedCreatorUid || 'user';
    const effectiveChannelId = effectiveChanId || `chan-${effectiveCreatorUid}`;
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    const isShortFormat = Boolean(videoFormat === 'short' || category === 'shorts' || youtubeUrl.includes('/shorts/'));

    const finalChannelName = (effectiveChanName.trim() || artist.trim() || 'कलाकार').trim();
    const finalThumbnail = customThumbnail || `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;
    const finalDuration = duration.trim() || (isShortFormat ? '0:50' : '4:30');
    const submissionId = `vid-${Date.now()}`;

    const submissionData: VideoSubmission = {
      id: submissionId,
      creatorUid: effectiveCreatorUid,
      channelId: effectiveChannelId,
      channelName: finalChannelName,
      channelAvatar: effectiveChanAvatar,
      title: title.trim(),
      youtubeUrl: isShortFormat ? `https://www.youtube.com/shorts/${yId}` : `https://www.youtube.com/watch?v=${yId}`,
      youtubeId: yId,
      category: isShortFormat ? 'shorts' : category,
      artist: artist.trim(),
      description: description.trim() || `${title.trim()} - बुंदेलखंड का सुपरहिट ${isShortFormat ? 'शॉर्ट्स' : 'वीडियो'}। गायक: ${artist.trim()}। ओनरशिप सत्यापन कोड: ${verificationCode}`,
      thumbnailUrl: finalThumbnail,
      duration: finalDuration,
      verificationCode: verificationCode,
      visibility,
      hasPaidPromotion,
      sponsorName: hasPaidPromotion ? sponsorName.trim() : '',
      sourceType: 'youtube',
      isShort: isShortFormat,
      videoType: isShortFormat ? 'short' : 'video',
      status: isShortFormat ? 'approved' : 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      const db = getFirestoreSafe();
      // 1. Save entry in Firestore 'videos' collection (with status 'pending' until verified or live)
      const videoEntry = {
        id: submissionData.id,
        title: submissionData.title,
        description: submissionData.description,
        youtubeId: yId,
        youtubeUrl: submissionData.youtubeUrl,
        thumbnail: submissionData.thumbnailUrl,
        category: submissionData.category,
        artist: submissionData.artist,
        channelId: effectiveChannelId,
        channelName: finalChannelName,
        channelAvatar: effectiveChanAvatar,
        creatorId: effectiveCreatorUid,
        status: 'pending' as const,
        isShort: isShortFormat,
        videoType: isShortFormat ? ('short' as const) : ('video' as const),
        views: 0,
        likes: 0,
        duration: finalDuration,
        uploadDate: new Date().toISOString().split('T')[0],
        isVerified: false,
        isMonetized: isMonetized,
        estimatedEarnings: 0,
        tags: tagArray,
        verificationCode: verificationCode,
        visibility: visibility,
        hasPaidPromotion,
        sponsorName: hasPaidPromotion ? sponsorName.trim() : undefined,
        sourceType: 'youtube',
        audioOnlyAvailable: true,
        createdAt: new Date().toISOString()
      };

      if (db) {
        // 1. Save into video_submissions for Admin Review & Verification
        await setDoc(doc(db, 'video_submissions', submissionData.id), cleanFirestoreData({
          ...submissionData,
          serverTimestamp: serverTimestamp()
        }), { merge: true });

        // 2. Also save into videos collection with status: 'pending' for external admin panel access
        await setDoc(doc(db, 'videos', submissionData.id), cleanFirestoreData({
          ...videoEntry,
          status: 'pending',
          serverTimestamp: serverTimestamp()
        }), { merge: true });
      }
    } catch (err: any) {
      console.warn('Video Firestore write note:', err);
    } finally {
      // Create a pending video item for user's UI
      const newVideo: Video = {
        id: submissionData.id,
        title: submissionData.title,
        description: submissionData.description,
        youtubeId: yId,
        youtubeUrl: submissionData.youtubeUrl,
        thumbnail: submissionData.thumbnailUrl,
        category: submissionData.category,
        artist: submissionData.artist,
        channelId: effectiveChannelId,
        channelName: finalChannelName,
        channelAvatar: effectiveChanAvatar,
        creatorId: effectiveCreatorUid,
        status: 'pending' as const,
        isShort: isShortFormat,
        videoType: isShortFormat ? 'short' : 'video',
        views: 0,
        likes: 0,
        commentsCount: 0,
        duration: finalDuration,
        uploadDate: language === 'hi' ? 'अभी-अभी' : 'Just now',
        isVerified: false,
        isMonetized: isMonetized,
        estimatedEarnings: 0,
        tags: tagArray,
        verificationCode: verificationCode,
        visibility: visibility,
        hasPaidPromotion,
        sponsorName: hasPaidPromotion ? sponsorName.trim() : undefined,
        sourceType: 'youtube',
        audioOnlyAvailable: true
      };

      onUploadSuccess(newVideo);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }
  };

  const resetAndClose = () => {
    setIsSubmitting(false);
    setSubmittedSuccess(false);
    setYoutubeUrl('');
    setExtractedId(null);
    setTitle('');
    setArtist('');
    setDescription('');
    setCustomThumbnail('');
    setHasPaidPromotion(false);
    setSponsorName('');
    setVisibility('public');
    setErrorMessage('');
    setVerificationCode('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-slate-950/85 backdrop-blur-xs p-3 sm:p-6 py-6 sm:py-10 flex items-start justify-center animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-900 dark:text-slate-100 my-auto max-h-[92vh] overflow-y-auto transition-colors">
        <button
          type="button"
          onClick={resetAndClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!currentUser ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-3xl mx-auto flex items-center justify-center border border-amber-500/30">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-bundeli">
              {language === 'hi' ? 'लॉगिन आवश्यक है' : 'Sign In Required'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {language === 'hi'
                ? 'वीडियो अपलोड करने के लिए कृपया अपने गूगल खाते (Gmail) से लॉगिन करें।'
                : 'Please login with your Google account (Gmail) to submit videos.'}
            </p>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  resetAndClose();
                  onOpenLogin?.();
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                {language === 'hi' ? 'गूगल से लॉगिन करें' : 'Sign in with Google'}
              </button>
            </div>
          </div>
        ) : channel?.approvalStatus === 'pending' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-3xl mx-auto flex items-center justify-center border border-amber-500/30 animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-bundeli">
              {language === 'hi' ? 'चैनल समीक्षाधीन है (Pending Review)' : 'Channel Under Review'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              {language === 'hi'
                ? '🔒 आपके चैनल का आवेदन व्यवस्थापक (Admin) की समीक्षा में है। एडमिन द्वारा अनुमोदन (Approval) मिलते ही वीडियो अपलोड सक्रिय हो जाएगा।'
                : '🔒 Your channel application is under Admin verification. Video upload will be unlocked once approved.'}
            </p>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                {language === 'hi' ? 'ठीक है' : 'Okay'}
              </button>
            </div>
          </div>
        ) : channel?.approvalStatus !== 'approved' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-3xl mx-auto flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-bundeli">
              {language === 'hi' ? 'पहले चैनल बनाएं (Channel Required)' : 'Channel Required for Video Upload'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              {language === 'hi'
                ? 'सामान्य दर्शक खाते से वीडियो अपलोड नहीं किया जा सकता। वीडियो अपलोड करने, क्रिएटर स्टूडियो प्रबंधित करने और विज्ञापन कमाई प्राप्त करने के लिए कृपया पहले अपना बुन्देली चैनल बनाएं।'
                : 'Normal viewer accounts cannot upload videos. Please create your Bundeli Channel first to enable video uploads and earn creator ad revenue.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  resetAndClose();
                  onOpenCreateChannel?.();
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === 'hi' ? 'चैनल बनाएँ (Create Channel)' : 'Create Channel'}</span>
              </button>
              <button
                type="button"
                onClick={resetAndClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
            </div>
          </div>
        ) : submittedSuccess ? (
          /* ======================================================== */
          /* SUCCESS SCREEN WITH YOUTUBE OWNERSHIP CODE                */
          /* ======================================================== */
          <div className="py-6 text-center space-y-5">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-bundeli">
                {videoFormat === 'short' 
                  ? (language === 'hi' ? '⚡ शॉर्ट्स सबमिट हुआ (समीक्षाधीन)!' : '⚡ YouTube Short Submitted (Pending Review)!')
                  : (language === 'hi' ? '🎬 वीडियो सबमिट हुआ (समीक्षाधीन)!' : '🎬 Video Submitted (Pending Review)!')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                {videoFormat === 'short'
                  ? (language === 'hi'
                      ? 'आपका शॉर्ट्स वीडियो सफलतापूर्वक सबमिट हो गया है। एडमिन द्वारा सत्यापन और अप्रूवल (स्वीकृति) के बाद ही यह शॉर्ट्स फ़ीड और पब्लिक वीडियो में लाइव प्रदर्शित होगा।'
                      : 'Your YouTube Short has been submitted for review. It will become publicly visible in the Shorts Feed and Video lists once approved by the Admin.')
                  : (language === 'hi'
                      ? 'आपका वीडियो फायरबेस में पेंडिंग स्थिति में सुरक्षित हो गया है। एडमिन द्वारा सत्यापन और अप्रूवल के बाद ही वीडियो लाइव होगा।'
                      : 'Your video is saved under pending status. It will go live after admin verification and approval.')}
              </p>
            </div>

            {/* Ownership Code Highlight Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-300 dark:border-amber-500/40 max-w-lg mx-auto text-left space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>{t.verificationCodeLabel}</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{codeCopied ? (language === 'hi' ? 'कॉपी हो गया!' : 'Copied!') : (language === 'hi' ? 'कोड कॉपी करें' : 'Copy Code')}</span>
                </button>
              </div>

              <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-amber-200 dark:border-amber-500/30 flex items-center justify-between font-mono">
                <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 tracking-wider">
                  {verificationCode}
                </span>
                <span className="text-[11px] text-slate-500">YouTube Ownership</span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-amber-100/50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
                {t.verificationCodeNotice}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                {language === 'hi' ? 'पूर्ण (Done)' : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* YOUTUBE LINK SUBMISSION FORM                             */
          /* ======================================================== */
          <div>
            {/* Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-red-600 to-amber-500 text-white flex items-center justify-center font-black shadow-lg shadow-red-500/20 shrink-0">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {t.youtubeSubmission || (language === 'hi' ? 'यूट्यूब लिंक द्वारा वीडियो अपलोड' : 'Upload Video via YouTube Link')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'hi' 
                    ? 'यूट्यूब वीडियो लिंक पेस्ट करें, ओनरशिप कोड जनरेट करें और विज्ञापन कमाई शुरू करें'
                    : 'Paste YouTube video URL, generate ownership verification code, and start earning'}
                </p>
              </div>
            </div>

            {/* Video Format Selector: Long Video vs Shorts */}
            <div className="mt-4 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVideoFormat('video');
                    if (category === 'shorts') setCategory('rai');
                    if (duration === '0:50') setDuration('4:30');
                  }}
                  className={`py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    videoFormat === 'video'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <div className="text-left">
                    <div>{language === 'hi' ? '🎥 लंबा वीडियो (Long Video)' : '🎥 Long Video'}</div>
                    <div className="text-[10px] font-normal opacity-80">{language === 'hi' ? 'यूट्यूब प्लेयर में चलेगा' : 'Plays in YouTube Player'}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVideoFormat('short');
                    setCategory('shorts');
                    setDuration('0:50');
                  }}
                  className={`py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    videoFormat === 'short'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span>{language === 'hi' ? '⚡ शॉर्ट्स (Shorts)' : '⚡ Shorts'}</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded font-bold">
                        &lt;60s
                      </span>
                    </div>
                    <div className="text-[10px] font-normal opacity-80">{language === 'hi' ? 'सीधे शॉर्ट्स फीड में चलेगा' : 'Direct to Shorts Feed'}</div>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. YOUTUBE URL INPUT */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-red-500" />
                    <span>{language === 'hi' ? 'यूट्यूब वीडियो लिंक (YouTube URL)' : 'YouTube Video Link'} *</span>
                  </span>
                  {extractedId && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ID: {extractedId}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={handleUrlChange}
                    placeholder="https://www.youtube.com/watch?v=... या https://youtu.be/..."
                    required
                    className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'hi'
                    ? 'यूट्यूब से कोई भी राई, लोकगीत, आल्हा या शॉर्ट्स वीडियो लिंक यहाँ पेस्ट करें।'
                    : 'Paste any YouTube video or shorts link here.'}
                </p>
              </div>

              {/* 2. YOUTUBE OWNERSHIP VERIFICATION CODE CARD (Only visible after YouTube link is entered) */}
              {extractedId && verificationCode ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-slate-950 border border-amber-300 dark:border-amber-500/30 space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                        {t.verificationCodeLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleRegenerateCode}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                        title={language === 'hi' ? 'नया कोड जनरेट करें' : 'Generate new code'}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                      >
                        {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{codeCopied ? (language === 'hi' ? 'कॉपी हो गया!' : 'Copied!') : (language === 'hi' ? 'कॉपी करें' : 'Copy')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-500/30">
                    <span className="font-mono font-extrabold text-base sm:text-lg text-amber-600 dark:text-amber-400 tracking-wider">
                      {verificationCode}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">
                      OWNERSHIP CODE
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-[11px] text-amber-900 dark:text-amber-200/90 leading-relaxed bg-amber-100/60 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-500/20">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{t.verificationCodeNotice}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-dashed border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300/80 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    {language === 'hi'
                      ? '💡 ऊपर वैध यूट्यूब वीडियो लिंक दर्ज करते ही आपके वीडियो के लिए ओनरशिप सत्यापन कोड (Ownership Code) यहाँ जनरेट होगा।'
                      : '💡 Enter a valid YouTube link above to generate your unique ownership verification code here.'}
                  </span>
                </div>
              )}

              {/* 3. THUMBNAIL PREVIEW & CUSTOM THUMBNAIL */}
              {extractedId && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                  <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                    <img
                      src={customThumbnail || `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white/90 fill-current" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {customThumbnail ? (language === 'hi' ? 'कस्टम थंबनेल सेट है' : 'Custom Thumbnail Set') : (language === 'hi' ? 'यूट्यूब थंबनेल डिटेक्टेड' : 'YouTube Thumbnail Detected')}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'hi' ? 'चाहे तो अलग फोटो/थंबनेल लगा सकते हैं:' : 'Optionally upload custom image:'}
                    </p>
                    <label className="inline-block cursor-pointer px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition">
                      <span>{language === 'hi' ? 'थंबनेल बदलें' : 'Change Thumbnail'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* 4. TITLE & SINGER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'hi' ? 'वीडियो का शीर्षक (Title)' : 'Video Title'} *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="उदा. बुंदेलखंडी राई नाच 2026"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Mic2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'hi' ? 'गायक / कलाकार (Artist/Singer)' : 'Singer / Artist'} *</span>
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="उदा. देशराज पटेरिया / रामकृपाल राय"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 5. CATEGORY & DURATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'hi' ? 'श्रेणी (Category)' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'hi' ? 'वीडियो की अवधि (Duration mm:ss)' : 'Duration (mm:ss)'}</span>
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder={videoFormat === 'short' ? '0:50' : '4:30'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* 6. TAGS & DESCRIPTION */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'hi' ? 'टैग्स (कॉमा से अलग करें)' : 'Tags (comma-separated)'}</span>
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="बुंदेली, राई, लोकगीत"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'hi' ? 'वीडियो विवरण (Description)' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'hi' ? 'वीडियो की जानकारी लिखें...' : 'Video details...'}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:border-amber-500 resize-none"
                />
              </div>

              {/* 7. MONETIZATION & ADS TOGGLE */}
              <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {language === 'hi' ? 'विज्ञापन मुद्रीकरण (Monetize with Ads)' : 'Ad Monetization'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'hi' ? 'यूट्यूब प्लेयर पर इन-स्ट्रीम व बैनर विज्ञापनों से कमाई प्राप्त करें' : 'Earn creator ad revenue on plays'}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMonetized}
                    onChange={(e) => setIsMonetized(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-red-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'hi' ? 'सबमिट हो रहा है...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>{language === 'hi' ? 'यूट्यूब वीडियो सबमिट करें' : 'Submit YouTube Video'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
