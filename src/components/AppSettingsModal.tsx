import React, { useState, useRef } from 'react';
import { 
  Settings, 
  X, 
  Moon, 
  Sun, 
  Globe, 
  PlaySquare, 
  Download, 
  ShieldCheck, 
  Bell, 
  Info, 
  Trash2, 
  Check, 
  Image as ImageIcon,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  Tv,
  Link as LinkIcon,
  RefreshCw,
  Coins,
  Copy
} from 'lucide-react';
import { Language, translations } from '../locales/i18n';
import { Channel, UserAccount, AppUserSettings } from '../types';
import { compressImageFile, AVATAR_COMPRESS_OPTIONS, BANNER_COMPRESS_OPTIONS } from '../lib/imageCompressor';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onToggleLanguage?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  settings?: AppUserSettings;
  onSaveSettings?: (newSettings: AppUserSettings) => void;
  channel?: Channel;
  currentUser?: UserAccount | null;
  onUpdateChannel?: (updatedData: Partial<Channel>) => void;
  onUpdateUser?: (updatedData: Partial<UserAccount>) => void;
  onOpenPolicies?: (tab?: string) => void;
}

// Curated Bundeli & Creator Avatars / Logos
const PRESET_LOGOS = [
  {
    id: 'folk-turban',
    title: 'पारंपरिक बुंदेली पगड़ी कलाकार',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    tag: 'Folk Artist'
  },
  {
    id: 'female-rai',
    title: 'राई व लोकसंगीत गायिका',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    tag: 'Rai Singer'
  },
  {
    id: 'studio-gold',
    title: 'गोल्डन कैसेट म्यूजिक स्टूडियो',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    tag: 'Music Studio'
  },
  {
    id: 'comedy-creator',
    title: 'देहाती कॉमेडी व हास्य क्रिएटर',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    tag: 'Comedy Hub'
  },
  {
    id: 'dj-remix',
    title: 'डीजे रीमिक्स व साउंड मास्टर',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80',
    tag: 'DJ Remix'
  },
  {
    id: 'vlogger-pro',
    title: 'बुंदेलखंड एक्सप्लोरर व्लॉगर',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    tag: 'Vlogger'
  },
  {
    id: 'harmonium-sangeet',
    title: 'शास्त्रीय संगीत व हारमोनियम',
    url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80',
    tag: 'Classical'
  },
  {
    id: 'bhakti-darshan',
    title: 'भक्ति सत्संग व मैहर लाइव',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80',
    tag: 'Bhakti Live'
  }
];

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onToggleLanguage,
  theme = 'dark',
  onToggleTheme,
  settings,
  onSaveSettings,
  channel,
  currentUser,
  onUpdateChannel,
  onUpdateUser,
  onOpenPolicies
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'channel_logo' | 'general' | 'playback' | 'downloads' | 'privacy' | 'notifications' | 'about'>('channel_logo');
  const [autoPlay, setAutoPlay] = useState(true);
  const [ambientMode, setAmbientMode] = useState(true);
  const [downloadWifiOnly, setDownloadWifiOnly] = useState(false);
  const [downloadQuality, setDownloadQuality] = useState('720p (High Quality)');
  const [historyCleared, setHistoryCleared] = useState(false);

  // Channel Logo & Branding Form State
  const initialAvatar = channel?.avatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
  const initialBanner = channel?.banner || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80';
  const initialName = channel?.name || (currentUser as any)?.channelName || currentUser?.name || (language === 'hi' ? 'मेरा चैनल' : 'My Channel');
  const initialHandle = channel?.handle || (currentUser?.name ? `@${currentUser.name.toLowerCase().replace(/\s+/g, '')}` : '@mychannel');

  const [selectedAvatar, setSelectedAvatar] = useState<string>(initialAvatar);
  const [selectedBanner, setSelectedBanner] = useState<string>(initialBanner);
  const [editChannelName, setEditChannelName] = useState<string>(initialName);
  const [editHandle, setEditHandle] = useState<string>(initialHandle);
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [logoSaveSuccess, setLogoSaveSuccess] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    setHistoryCleared(true);
    setTimeout(() => setHistoryCleared(false), 2500);
  };

  // Handle local file selection for logo
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, AVATAR_COMPRESS_OPTIONS);
        setSelectedAvatar(compressed);
      } catch (err) {
        console.warn('Avatar compression error:', err);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setSelectedAvatar(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle local file selection for banner
  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, BANNER_COMPRESS_OPTIONS);
        setSelectedBanner(compressed);
      } catch (err) {
        console.warn('Banner compression error:', err);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setSelectedBanner(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Apply custom URL
  const handleApplyCustomUrl = () => {
    if (customLogoUrl.trim()) {
      setSelectedAvatar(customLogoUrl.trim());
      setShowUrlInput(false);
      setCustomLogoUrl('');
    }
  };

  // Save Channel Logo & Profile Changes
  const handleSaveChannelProfile = () => {
    if (onUpdateChannel) {
      onUpdateChannel({
        avatar: selectedAvatar,
        banner: selectedBanner,
        name: editChannelName,
        handle: editHandle
      });
    }

    if (onUpdateUser && currentUser) {
      onUpdateUser({
        avatar: selectedAvatar,
        name: editChannelName
      });
    }

    setLogoSaveSuccess(true);
    setTimeout(() => {
      setLogoSaveSuccess(false);
    }, 2800);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const navItems = [
    { id: 'channel_logo', label: language === 'hi' ? '✨ चैनल लोगो बदलें' : 'Channel Logo & Branding', icon: Camera, highlight: true },
    { id: 'general', label: language === 'hi' ? 'सामान्य (General)' : 'General', icon: Settings },
    { id: 'playback', label: language === 'hi' ? 'प्लेबैक व ऑडियो' : 'Playback & Audio', icon: PlaySquare },
    { id: 'downloads', label: language === 'hi' ? 'डाउनलोड्स (Offline)' : 'Downloads', icon: Download },
    { id: 'privacy', label: language === 'hi' ? 'गोपनीयता व इतिहास' : 'Privacy & History', icon: ShieldCheck },
    { id: 'notifications', label: language === 'hi' ? 'सूचनाएं' : 'Notifications', icon: Bell },
    { id: 'about', label: language === 'hi' ? 'ऐप के बारे में' : 'About', icon: Info },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: Settings Categories Nav */}
        <div className="w-full md:w-60 bg-slate-50 dark:bg-slate-950 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 space-y-1 shrink-0">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500" />
              <span>{language === 'hi' ? 'यूट्यूब सेटिंग्स' : 'Settings'}</span>
            </h3>
            <button onClick={onClose} className="md:hidden p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition shrink-0 md:w-full cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : item.highlight
                      ? 'text-amber-600 dark:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Tab Panel Details */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {activeTab === 'channel_logo' && <Camera className="w-5 h-5 text-amber-500" />}
              <span>{navItems.find(n => n.id === activeTab)?.label}</span>
            </h4>
            <button
              onClick={onClose}
              className="hidden md:block p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 0: CHANNEL LOGO & BRANDING CHANGER (FEATURE REQUEST)                  */}
          {/* ========================================================================= */}
          {activeTab === 'channel_logo' && (
            <div className="space-y-6 text-xs animate-in fade-in">
              
              {/* Success Notification */}
              {logoSaveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-3 shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <span className="block font-black">
                      {language === 'hi' ? '✅ चैनल का नया लोगो व प्रोफाइल सफलतापूर्वक बदल दिया गया!' : 'Channel Logo & Branding Saved!'}
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-200/80 font-normal">
                      {language === 'hi' ? 'यह नया लोगो आपके चैनल, वीडियो प्लेयर, कमेंट्स और स्टूडियो में तुरंत सक्रिय हो गया है।' : 'Your updated logo is now live across your videos, comments, and creator studio.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Live Preview Card */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
                    {language === 'hi' ? 'लाइव लोगो पूर्वावलोकन (Live Logo Preview)' : 'Live Logo Preview'}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 font-bold border border-amber-300 dark:border-amber-500/30">
                    HD Logo
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                  <div className="relative group shrink-0">
                    <img
                      src={selectedAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
                      alt="Channel Logo Preview"
                      className="w-24 h-24 rounded-full object-cover border-3 border-amber-500 shadow-xl shadow-amber-500/20"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
                      }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition cursor-pointer text-[10px] font-bold gap-1"
                      title="फोटो बदलें"
                    >
                      <Camera className="w-5 h-5 text-amber-400" />
                      <span>{language === 'hi' ? 'फोटो बदलें' : 'Change'}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h4 className="font-black text-slate-900 dark:text-slate-100 text-base truncate">
                        {editChannelName || 'बुन्देली म्यूजिक स्टूडियो'}
                      </h4>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                    </div>
                    <p className="text-amber-600 dark:text-amber-400 font-mono text-xs truncate font-semibold">
                      {editHandle || '@bundelistudio'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                      {language === 'hi'
                        ? 'यह लोगो आपके चैनल के सभी वीडियो, लाइव चैट व कम्युनिटी पोस्ट पर दिखेगा।'
                        : 'This logo will appear on your channel, video player watermark, and comments.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Controls & Actions */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>{language === 'hi' ? '1. लोगो बदलने के तरीके (3 Options):' : '1. Choose Logo Option:'}</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option A: Device File Upload */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{language === 'hi' ? '📁 मोबाइल / PC से फोटो चुनें' : 'Upload from Device'}</span>
                  </button>

                  {/* Option B: Direct URL Input */}
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <LinkIcon className="w-4 h-4 text-amber-500" />
                    <span>{language === 'hi' ? '🔗 इमेज लिंक (URL) डालें' : 'Paste Image URL'}</span>
                  </button>
                </div>

                {/* Custom URL Input Box */}
                {showUrlInput && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2 animate-in fade-in">
                    <input
                      type="url"
                      placeholder="https://example.com/channel-logo.jpg"
                      value={customLogoUrl}
                      onChange={(e) => setCustomLogoUrl(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
                    >
                      {language === 'hi' ? 'लागू करें' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Option C: Preset Curated Bundeli Creator Logos */}
              <div className="space-y-2.5">
                <h5 className="font-bold text-slate-800 dark:text-slate-200">
                  {language === 'hi' ? '2. या इनमें से पसंदीदा बुंदेली लोगो चुनें:' : '2. Or Pick a Curated Creator Avatar:'}
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESET_LOGOS.map((preset) => {
                    const isSelected = selectedAvatar === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedAvatar(preset.url)}
                        className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer relative group ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 shadow-md ring-2 ring-amber-500/50'
                            : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="w-14 h-14 rounded-full object-cover border border-slate-300 dark:border-slate-700 shadow-md group-hover:scale-105 transition"
                          />
                          {isSelected && (
                            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-[10px] text-slate-700 dark:text-slate-200 line-clamp-1">
                          {preset.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Channel Basic Details (Name & Handle) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <h5 className="font-bold text-slate-800 dark:text-slate-200">
                  {language === 'hi' ? '3. चैनल का नाम और हैंडल' : '3. Channel Name & Handle'}
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-medium">
                      {language === 'hi' ? 'चैनल का नाम (Channel Name)' : 'Channel Name'}
                    </label>
                    <input
                      type="text"
                      value={editChannelName}
                      onChange={(e) => setEditChannelName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-medium">
                      {language === 'hi' ? 'हैंडल (Handle)' : 'Handle'}
                    </label>
                    <input
                      type="text"
                      value={editHandle}
                      onChange={(e) => setEditHandle(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-amber-600 dark:text-amber-400 font-mono font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveChannelProfile}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>{language === 'hi' ? 'नया लोगो व सेटिंग्स सहेजें (Save Changes)' : 'Save Changes'}</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 1: General */}
          {activeTab === 'general' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">{language === 'hi' ? 'थीम (Appearance)' : 'Appearance'}</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                    {theme === 'dark' ? (language === 'hi' ? 'डार्क मोड सक्रिय' : 'Dark theme active') : (language === 'hi' ? 'लाइट मोड सक्रिय' : 'Light theme active')}
                  </p>
                </div>
                <button
                  onClick={onToggleTheme}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-sm"
                >
                  {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200">{language === 'hi' ? 'ऐप की भाषा (Language)' : 'App Language'}</h5>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      {language === 'hi' ? 'अपनी पसंदीदा भाषा चुनें' : 'Choose your preferred language'}
                    </p>
                  </div>
                  <Globe className="w-4 h-4 text-amber-500" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (language !== 'hi' && onToggleLanguage) onToggleLanguage();
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      language === 'hi'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>🇮🇳 हिन्दी (Hindi)</span>
                    {language === 'hi' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (language !== 'en' && onToggleLanguage) onToggleLanguage();
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      language === 'en'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>🌐 English (EN)</span>
                    {language === 'en' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Playback */}
          {activeTab === 'playback' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">{language === 'hi' ? 'ऑटो-प्ले अगला वीडियो' : 'Autoplay Next Video'}</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                    {language === 'hi' ? 'वीडियो समाप्त होने पर स्वचालित रूप से अगला गीत चलाएं' : 'Play next song when current finishes'}
                  </p>
                </div>
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${autoPlay ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white dark:bg-slate-950 shadow-md transform transition-transform ${autoPlay ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">{language === 'hi' ? 'एंबिएंट लाइटिंग मोड (Ambient Mode)' : 'Ambient Mode'}</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                    {language === 'hi' ? 'प्लेयर के चारों ओर गीत के रंगों का कोमल प्रकाश' : 'Subtle glow around player adapting to video colors'}
                  </p>
                </div>
                <button
                  onClick={() => setAmbientMode(!ambientMode)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${ambientMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white dark:bg-slate-950 shadow-md transform transition-transform ${ambientMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Downloads */}
          {activeTab === 'downloads' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">{language === 'hi' ? 'डाउनलोड क्वालिटी (Offline Quality)' : 'Download Quality'}</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                    {language === 'hi' ? 'ऑफ़लाइन सुनने के लिए डिफ़ॉल्ट रिज़ॉल्यूशन' : 'Default resolution for offline playback'}
                  </p>
                </div>
                <select
                  value={downloadQuality}
                  onChange={(e) => setDownloadQuality(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-bold text-xs cursor-pointer"
                >
                  <option value="1080p">1080p (Full HD)</option>
                  <option value="720p">720p (High Quality)</option>
                  <option value="480p">480p (Medium)</option>
                  <option value="audio">Audio Only (128kbps)</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">{language === 'hi' ? 'केवल वाई-फाई पर डाउनलोड' : 'Download over Wi-Fi only'}</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                    {language === 'hi' ? 'मोबाइल डेटा की बचत करें' : 'Save mobile data'}
                  </p>
                </div>
                <button
                  onClick={() => setDownloadWifiOnly(!downloadWifiOnly)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${downloadWifiOnly ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white dark:bg-slate-950 shadow-md transform transition-transform ${downloadWifiOnly ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">{language === 'hi' ? 'देखने का इतिहास मिटाएं' : 'Clear Watch History'}</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                    {language === 'hi' ? 'आपके देखे गए सभी बुंदेली वीडियो का इतिहास साफ करें' : 'Clear list of watched videos from this device'}
                  </p>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold border border-red-500/30 flex items-center gap-1.5 transition cursor-pointer"
                >
                  {historyCleared ? <Check className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{historyCleared ? (language === 'hi' ? 'मिटा दिया गया!' : 'Cleared!') : (language === 'hi' ? 'इतिहास मिटाएं' : 'Clear')}</span>
                </button>
              </div>

              {/* AdSense & AdMob Compliant Policy Center Link */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{language === 'hi' ? 'Google AdSense, AdMob व कानूनी नीतियां' : 'Google AdSense & AdMob Legal Policies'}</span>
                  </h5>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold">Approved</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {language === 'hi'
                    ? 'कुकी प्रकटीकरण, व्यक्तिगत विज्ञापन विकल्प (Opt-out), 50-50 क्रिएटर अर्निंग नीति, अमान्य क्लिक नियम और आईटी नियम 2021 शिकायत अधिकारी का पूर्ण विवरण।'
                    : 'Full disclosures on cookies, advertising IDs, 50/50 creator split, anti-fraud rules, and statutory grievance officer.'}
                </p>
                {onOpenPolicies && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPolicies('admob_adsense');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <span>{language === 'hi' ? 'संपूर्ण नीतियां व कानूनी केंद्र खोलें' : 'Open Legal & Policy Center'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">{language === 'hi' ? 'सदस्यता अलर्ट (Subscriptions)' : 'Subscription Alerts'}</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    {language === 'hi' ? 'पसंदीदा चैनल के नए वीडियो की सूचना' : 'Get notified when subscribed channels upload'}
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-amber-500 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">{language === 'hi' ? 'कमाई व पेआउट अलर्ट' : 'Earning & Payout Alerts'}</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    {language === 'hi' ? 'वॉलेट निकासी और विज्ञापन कमाई अपडेट' : 'Wallet withdrawal and CPM updates'}
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-amber-500 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
              </label>
            </div>
          )}

          {/* TAB 6: About */}
          {activeTab === 'about' && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <span className="font-black text-xl bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                BundeliTube v2.6.0
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                {language === 'hi' 
                  ? 'बुंदेलखंड की माटी, संगीत, लोककला, राई और आल्हा को समर्पित भारत का पहला डिजिटल वीडियो एवं क्रिएटर मंच।'
                  : 'India\'s premier digital platform celebrating Bundelkhand folk heritage, Rai, Alha, Faag, and creator economy.'}
              </p>
              <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Made with ❤️ in Bundelkhand • All Rights Reserved 2026
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
