import React, { useState, useRef } from 'react';
import { 
  Wand2, 
  Image as ImageIcon, 
  User, 
  Link as LinkIcon, 
  Check, 
  Upload, 
  Tv, 
  Sparkles,
  CheckCircle2,
  Camera,
  RefreshCw,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Channel } from '../../types';
import { Language, translations } from '../../locales/i18n';
import { compressImageFile, AVATAR_COMPRESS_OPTIONS, BANNER_COMPRESS_OPTIONS } from '../../lib/imageCompressor';

interface StudioCustomizationTabProps {
  channel: Channel;
  language: Language;
  onUpdateChannel?: (updatedData: Partial<Channel>) => void;
  onDeleteChannel?: () => void;
}

const PRESET_AVATARS = [
  { id: '1', title: 'पारंपरिक पगड़ी कलाकार', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', tag: 'Folk Artist' },
  { id: '2', title: 'राई लोकगायिका', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', tag: 'Rai Singer' },
  { id: '3', title: 'म्यूजिक कैसेट स्टूडियो', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80', tag: 'Studio' },
  { id: '4', title: 'देहाती कॉमेडी स्टार', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80', tag: 'Comedy' },
  { id: '5', title: 'डीजे रीमिक्स साउंड', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80', tag: 'DJ Sound' },
  { id: '6', title: 'बुंदेलखंड एक्सप्लोरर', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', tag: 'Vlog' },
];

const PRESET_BANNERS = [
  { id: 'b1', title: 'ओरछा राजमहल व बेतवा घाट', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80' },
  { id: 'b2', title: 'खजुराहो मंदिर व सांस्कृतिक कला', url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=80' },
  { id: 'b3', title: 'बुंदेली लोकसंगीत मंच व लाइटिंग', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80' }
];

export const StudioCustomizationTab: React.FC<StudioCustomizationTabProps> = ({
  channel,
  language,
  onUpdateChannel,
  onDeleteChannel
}) => {
  const t = translations[language];
  const [subTab, setSubTab] = useState<'branding' | 'basic_info' | 'layout'>('branding');
  
  // Customization Form State
  const [channelName, setChannelName] = useState(channel.name);
  const [handle, setHandle] = useState(channel.handle);
  const [bio, setBio] = useState(channel.bio);
  const [avatar, setAvatar] = useState(channel.avatar);
  const [banner, setBanner] = useState(channel.banner);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteChannelModal, setShowDeleteChannelModal] = useState(false);
  const [isDeletingChannel, setIsDeletingChannel] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, AVATAR_COMPRESS_OPTIONS);
        setAvatar(compressed);
        if (onUpdateChannel) {
          onUpdateChannel({
            avatar: compressed,
            name: channelName,
            handle,
            bio,
            banner
          });
        }
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } catch (err) {
        console.warn('Avatar compression error:', err);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            const res = reader.result;
            setAvatar(res);
            if (onUpdateChannel) {
              onUpdateChannel({
                avatar: res,
                name: channelName,
                handle,
                bio,
                banner
              });
            }
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, BANNER_COMPRESS_OPTIONS);
        setBanner(compressed);
      } catch (err) {
        console.warn('Banner compression error:', err);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setBanner(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    channel.name = channelName;
    channel.handle = handle;
    channel.bio = bio;
    channel.avatar = avatar;
    channel.banner = banner;

    if (onUpdateChannel) {
      onUpdateChannel({
        name: channelName,
        handle,
        bio,
        avatar,
        banner
      });
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div id="studio-customization-tab" className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100">{t.studioCustomization}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'चैनल का लेआउट, प्रोफाइल लोगो, बैनर कला, वीडियो वाटरमार्क और बुनियादी जानकारी अनुकूलित करें'
              : 'Customize channel layout, branding assets, video watermark, and channel information'}
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{language === 'hi' ? 'प्रकाशित करें (Publish)' : 'Publish Changes'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{language === 'hi' ? '✅ नया लोगो सफलतापूर्वक अपडेट हो गया और चैनल के सभी वीडियो पर लागू कर दिया गया!' : '✅ Channel logo updated and applied across all channel videos!'}</span>
        </div>
      )}

      {/* Sub Tabs: Layout / Branding / Basic Info */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold border-b border-slate-800">
        <button
          onClick={() => setSubTab('branding')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            subTab === 'branding' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'ब्रांडिंग व लोगो (Branding)' : 'Branding & Logo'}</span>
        </button>

        <button
          onClick={() => setSubTab('basic_info')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            subTab === 'basic_info' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'बुनियादी जानकारी (Basic info)' : 'Basic info'}</span>
        </button>

        <button
          onClick={() => setSubTab('layout')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            subTab === 'layout' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'लेआउट (Layout)' : 'Layout'}</span>
        </button>
      </div>

      {/* 1. BRANDING TAB */}
      {subTab === 'branding' && (
        <div className="space-y-6">
          
          {/* Profile Picture Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative group shrink-0">
                  <img
                    src={avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
                    alt={channel.name}
                    className="w-24 h-24 rounded-full object-cover border-3 border-amber-500 shadow-xl shadow-amber-500/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition cursor-pointer text-[10px] font-bold gap-1"
                  >
                    <Camera className="w-5 h-5 text-amber-400" />
                    <span>{language === 'hi' ? 'बदलें' : 'Change'}</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                    <span>{language === 'hi' ? 'चैनल प्रोफ़ाइल फोटो व लोगो' : 'Channel Profile Picture & Logo'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                      Live
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    {language === 'hi' ? 'अनुशंसित 800 x 800 पिक्सल। यह आपके चैनल, वीडियो और कमेंट्स पर दिखेगी।' : '800 x 800 px recommended. Visible on your channel, video player, and comments.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  <span>{language === 'hi' ? '📁 फोटो अपलोड करें' : 'Upload Image'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LinkIcon className="w-4 h-4 text-amber-400" />
                  <span>{language === 'hi' ? 'इमेज URL' : 'Image URL'}</span>
                </button>
              </div>
            </div>

            {/* Custom URL Input if toggled */}
            {showCustomUrlInput && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/my-channel-logo.jpg"
                  value={customLogoUrl}
                  onChange={(e) => setCustomLogoUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customLogoUrl.trim()) {
                      setAvatar(customLogoUrl.trim());
                      setShowCustomUrlInput(false);
                      setCustomLogoUrl('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  {language === 'hi' ? 'लागू करें' : 'Apply'}
                </button>
              </div>
            )}

            {/* Presets Grid */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-300">
                {language === 'hi' ? 'या लोकप्रिय बुंदेली अवतारों में से चुनें:' : 'Or choose from popular creator avatars:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = avatar === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAvatar(preset.url)}
                      className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/50'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-12 h-12 rounded-full object-cover border border-slate-700 shadow-md"
                      />
                      <span className="font-bold text-[10px] text-slate-200 truncate w-full">
                        {preset.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Banner Image Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-100">{language === 'hi' ? 'चैनल बैनर इमेज (Banner Image)' : 'Banner Image'}</h3>
                <p className="text-xs text-slate-400">
                  {language === 'hi' ? 'अनुशंसित 2048 x 1152 पिक्सल। सभी डिवाइस (मोबाइल, टीवी, लैपटॉप) पर दिखेगी।' : '2048 x 1152 px recommended for TV, desktop, and mobile.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={bannerInputRef}
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{language === 'hi' ? 'बैनर अपलोड करें' : 'Upload Banner'}</span>
                </button>
              </div>
            </div>

            <div className="h-32 sm:h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative shadow-inner">
              <img src={banner || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80'} alt="Channel Banner" className="w-full h-full object-cover" />
            </div>

            {/* Banner Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_BANNERS.map((pb) => (
                <button
                  key={pb.id}
                  type="button"
                  onClick={() => setBanner(pb.url)}
                  className={`p-2 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                    banner === pb.url ? 'bg-amber-500/20 border-amber-500' : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <img src={pb.url} alt={pb.title} className="w-10 h-7 rounded object-cover" />
                  <span className="text-[11px] font-bold text-slate-200 truncate">{pb.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Video Watermark */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-100">{language === 'hi' ? 'वीडियो वाटरमार्क (Video Watermark)' : 'Video Watermark'}</h3>
              <p className="text-xs text-slate-400 max-w-md">
                {language === 'hi' ? 'वीडियो के निचले दाएं कोने में चैनल का लोगो प्रदर्शित करें।' : 'Display channel logo watermark in bottom right corner of player.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300">{showWatermark ? 'सक्रिय' : 'बंद'}</span>
              <input
                type="checkbox"
                checked={showWatermark}
                onChange={(e) => setShowWatermark(e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

        </div>
      )}

      {/* 2. BASIC INFO TAB */}
      {subTab === 'basic_info' && (
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {language === 'hi' ? 'चैनल का नाम (Channel Name)' : 'Channel Name'}
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {language === 'hi' ? 'हैंडल (Handle)' : 'Handle'}
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {language === 'hi' ? 'विवरण व बायो (Bio / Description)' : 'Bio / Description'}
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <div>
              <p className="text-[11px] text-slate-500">
                {language === 'hi' ? 'सभी परिवर्तन पूरे बुंदेली ट्यूब पर तुरंत लागू होंगे।' : 'Changes reflect globally across BundeliTube.'}
              </p>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              {language === 'hi' ? 'सुरक्षित करें' : 'Save Details'}
            </button>
          </div>

          {/* Danger Zone: Delete Channel */}
          <div className="mt-8 p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>{language === 'hi' ? 'खतरनाक क्षेत्र (Danger Zone) - चैनल हटाएं' : 'Danger Zone - Delete Channel'}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'hi'
                ? 'अपने बुंदेली चैनल को स्थायी रूप से हटाएं। आपका चैनल डेटा, क्रिएटर भूमिका और सभी सेटिंग्स Firestore डेटाबेस से हटा दी जाएंगी।'
                : 'Permanently delete your BundeliTube channel. This removes your creator profile and resets your account role.'}
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteChannelModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'चैनल हमेशा के लिए हटाएं (Delete Channel)' : 'Delete Channel Permanently'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. LAYOUT TAB */}
      {subTab === 'layout' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-slate-100">{language === 'hi' ? 'वीडियो स्पॉटलाइट (Video Spotlight)' : 'Video Spotlight'}</h3>
          
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <strong className="text-xs text-slate-200 block">{language === 'hi' ? 'नए दर्शकों के लिए चैनल ट्रेलर' : 'Channel trailer for non-subscribers'}</strong>
              <p className="text-[11px] text-slate-400">{language === 'hi' ? 'बुंदेली राई - गोरी तोरे नैना कजरारे' : 'Selected: Bundeli Rai Gori Tore Naina'}</p>
            </div>
            <button className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold">
              {language === 'hi' ? 'बदलें' : 'Change'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Channel Confirmation Modal */}
      {showDeleteChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-100">
                {language === 'hi' ? 'क्या आप वाकई अपना चैनल हटाना चाहते हैं?' : 'Delete Channel Permanently?'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? `"${channel.name}" चैनल को हटाने पर क्रिएटर स्टूडियो और चैनल प्रोफाइल डेटाबेस से हटा दिया जाएगा। आपका खाता एक सामान्य दर्शक (Viewer) खाते में बदल जाएगा।`
                  : `Deleting "${channel.name}" will remove your channel from Firestore and revert your account to a standard viewer.`}
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center gap-3">
              <img
                src={channel.avatar}
                alt={channel.name}
                className="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-amber-400"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{channel.name}</p>
                <p className="text-[10px] text-amber-400 font-mono">{channel.handle}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingChannel}
                onClick={() => setShowDeleteChannelModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                {language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeletingChannel}
                onClick={async () => {
                  setIsDeletingChannel(true);
                  if (onDeleteChannel) {
                    await onDeleteChannel();
                  }
                  setIsDeletingChannel(false);
                  setShowDeleteChannelModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingChannel ? (language === 'hi' ? 'हटाया जा रहा है...' : 'Deleting...') : (language === 'hi' ? 'हाँ, चैनल हटाएं' : 'Yes, Delete Channel')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
