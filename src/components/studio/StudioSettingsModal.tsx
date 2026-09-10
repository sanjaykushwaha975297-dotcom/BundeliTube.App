import React, { useState, useRef } from 'react';
import { 
  Settings, 
  IndianRupee, 
  Tv, 
  Upload, 
  Users, 
  ShieldCheck, 
  Sliders, 
  Check, 
  CheckCircle2,
  X,
  Camera,
  Link as LinkIcon,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Channel, AppUserSettings } from '../../types';
import { Language, translations } from '../../locales/i18n';
import { compressImageFile, AVATAR_COMPRESS_OPTIONS } from '../../lib/imageCompressor';

interface StudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
  language: Language;
  onToggleTheme?: () => void;
  onToggleLanguage?: () => void;
  onUpdateChannel?: (updatedData: Partial<Channel>) => void;
  onDeleteChannel?: () => void;
}

const PRESET_LOGOS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', title: 'पगड़ी कलाकार' },
  { id: '2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', title: 'राई गायिका' },
  { id: '3', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', title: 'म्यूजिक स्टूडियो' },
  { id: '4', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=80', title: 'डीजे साउंड' },
];

export const StudioSettingsModal: React.FC<StudioSettingsModalProps> = ({
  isOpen,
  onClose,
  channel,
  language,
  onToggleTheme,
  onToggleLanguage,
  onUpdateChannel,
  onDeleteChannel
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'general' | 'channel' | 'upload_defaults' | 'permissions' | 'community' | 'danger'>('channel');
  const [currency, setCurrency] = useState('INR');
  const [channelKeywords, setChannelKeywords] = useState('बुंदेली राई, देशराज पटैरिया, आल्हा ऊदल, लोकगीत, संजो बघेल, बुंदेलखंड');
  const [defaultTitlePrefix, setDefaultTitlePrefix] = useState('बुंदेली लोकसंगीत - ');
  const [defaultCategory, setDefaultCategory] = useState('rai');
  
  // Channel Logo State
  const [avatar, setAvatar] = useState(channel.avatar);
  const [channelName, setChannelName] = useState(channel.name);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, AVATAR_COMPRESS_OPTIONS);
        setAvatar(compressed);
      } catch (err) {
        console.warn('Avatar compression error:', err);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setAvatar(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    channel.avatar = avatar;
    channel.name = channelName;

    if (onUpdateChannel) {
      onUpdateChannel({
        avatar,
        name: channelName
      });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 my-8 overflow-hidden flex flex-col md:flex-row h-[580px]">
        
        {/* Left Settings Sidebar (YouTube Studio Style) */}
        <div className="w-full md:w-56 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 p-4 space-y-1 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 text-slate-100 font-bold text-sm mb-2">
            <Settings className="w-4 h-4 text-amber-400" />
            <span>{t.studioSettings}</span>
          </div>

          <button
            onClick={() => setActiveTab('channel')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'channel' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'चैनल व लोगो (Logo)' : 'Channel & Logo'}</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'general' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'सामान्य मुद्रा (General)' : 'General'}</span>
          </button>

          <button
            onClick={() => setActiveTab('upload_defaults')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'upload_defaults' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'अपलोड डिफॉल्ट्स' : 'Upload defaults'}</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'permissions' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'अनुमतियाँ (Permissions)' : 'Permissions'}</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'community' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'कम्युनिटी मॉडरेटर' : 'Community'}</span>
          </button>

          <button
            onClick={() => setActiveTab('danger')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'danger' ? 'bg-rose-600 text-white font-bold' : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'चैनल हटाएं (Delete)' : 'Delete Channel'}</span>
          </button>
        </div>

        {/* Right Settings Content */}
        <div className="flex-1 flex flex-col justify-between p-6 bg-slate-900 overflow-y-auto">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100">
                {activeTab === 'channel' && (language === 'hi' ? 'चैनल लोगो व मूल सेटिंग्स' : 'Channel Logo & Basic Info')}
                {activeTab === 'general' && (language === 'hi' ? 'डिफ़ॉल्ट मुद्रा सेटिंग्स' : 'Default Currency')}
                {activeTab === 'upload_defaults' && (language === 'hi' ? 'डिफ़ॉल्ट अपलोड शीर्षक व विवरण' : 'Upload Defaults')}
                {activeTab === 'permissions' && (language === 'hi' ? 'चैनल परमिशन व रोल्स' : 'Channel Permissions')}
                {activeTab === 'community' && (language === 'hi' ? 'कम्युनिटी फ़िल्टर व ब्लॉक शब्द' : 'Community Moderation')}
                {activeTab === 'danger' && (language === 'hi' ? 'खतरनाक क्षेत्र - चैनल स्थायी रूप से हटाएं' : 'Danger Zone - Delete Channel')}
              </h3>
              <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'hi' ? 'चैनल लोगो व सेटिंग्स सफलतापूर्वक सहेजी गईं!' : 'Settings & Logo saved successfully!'}</span>
              </div>
            )}

            {/* TAB: CHANNEL (WITH LOGO CHANGER) */}
            {activeTab === 'channel' && (
              <div className="space-y-4 text-xs">
                
                {/* Channel Logo Selector Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="font-bold text-slate-200 block">
                    {language === 'hi' ? 'चैनल प्रोफ़ाइल लोगो (Profile Picture & Logo)' : 'Channel Logo'}
                  </span>

                  <div className="flex items-center gap-4">
                    <div className="relative group shrink-0">
                      <img
                        src={avatar}
                        alt={channelName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-amber-400" />
                      </button>
                    </div>

                    <div className="space-y-2 flex-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? 'गैलरी / PC से फोटो चुनें' : 'Upload Image'}</span>
                      </button>

                      {/* Presets */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {PRESET_LOGOS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setAvatar(p.url)}
                            className={`w-7 h-7 rounded-full overflow-hidden border transition cursor-pointer ${
                              avatar === p.url ? 'ring-2 ring-amber-500 border-amber-500' : 'border-slate-700 opacity-70 hover:opacity-100'
                            }`}
                            title={p.title}
                          >
                            <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    {language === 'hi' ? 'चैनल का नाम (Channel Name)' : 'Channel Name'}
                  </label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    {language === 'hi' ? 'चैनल कीवर्ड्स (Keywords)' : 'Channel Keywords'}
                  </label>
                  <textarea
                    rows={2}
                    value={channelKeywords}
                    onChange={(e) => setChannelKeywords(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB: GENERAL */}
            {activeTab === 'general' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    {language === 'hi' ? 'डिफ़ॉल्ट मुद्रा (Default Currency)' : 'Default Currency'}
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="INR">INR - भारतीय रुपया (₹)</option>
                    <option value="USD">USD - US Dollar ($)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === 'hi' ? 'आपकी सभी एनालिटिक्स और वीडियो कमाई INR (₹) में प्रदर्शित होगी।' : 'All analytics and earnings will be calculated in INR.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB: UPLOAD DEFAULTS */}
            {activeTab === 'upload_defaults' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    {language === 'hi' ? 'डिफ़ॉल्ट शीर्षक प्रीफ़िक्स' : 'Default Title Prefix'}
                  </label>
                  <input
                    type="text"
                    value={defaultTitlePrefix}
                    onChange={(e) => setDefaultTitlePrefix(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    {language === 'hi' ? 'डिफ़ॉल्ट श्रेणी' : 'Default Category'}
                  </label>
                  <select
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="rai">💃 बुंदेली राई</option>
                    <option value="alha">⚔️ आल्हा ऊदल</option>
                    <option value="lokgeet">🪕 लोकगीत</option>
                    <option value="faag">🌸 फाग व रसिया</option>
                    <option value="bhajan">🪘 देसी भजन</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB: PERMISSIONS */}
            {activeTab === 'permissions' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-400">
                  {language === 'hi' ? 'आपके चैनल के वर्तमान रोल्स और अनुमतियाँ:' : 'Active channel permissions and roles:'}
                </p>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={avatar} alt={channel.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <strong className="text-slate-200 block">{channelName}</strong>
                      <span className="text-[10px] text-slate-500">{channel.handle}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] border border-amber-500/30">
                    Owner (मालिक)
                  </span>
                </div>
              </div>
            )}

            {/* TAB: COMMUNITY */}
            {activeTab === 'community' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    {language === 'hi' ? 'ब्लॉक किए गए शब्द (Blocked Words)' : 'Blocked Words'}
                  </label>
                  <input
                    type="text"
                    value="गाली, अपशब्द, स्पैम"
                    readOnly
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === 'hi' ? 'ये शब्द टिप्पणियों में स्वतः हाइड कर दिए जाएंगे।' : 'Comments containing these words will be automatically filtered.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB: DANGER ZONE (Delete Channel) */}
            {activeTab === 'danger' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm">{language === 'hi' ? 'चैनल स्थायी रूप से हटाएं' : 'Delete Channel Permanently'}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {language === 'hi'
                      ? `"${channel.name}" चैनल को हटाने से आपके सभी चैनल कस्टमाइज़ेशन, स्टूडियो सेटिंग्स और क्रिएटर भूमिका Firestore डेटाबेस से तुरंत हटा दी जाएगी।`
                      : `Deleting "${channel.name}" will permanently wipe your creator profile, channel customizations, and studio permissions from Firestore.`}
                  </p>

                  {!showConfirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(true)}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{language === 'hi' ? 'चैनल हटाने की प्रक्रिया शुरू करें' : 'Proceed to Delete Channel'}</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-slate-950 rounded-xl border border-rose-500/50 space-y-3">
                      <p className="text-rose-300 font-bold">
                        {language === 'hi' ? '⚠️ क्या आप 100% निश्चित हैं? यह क्रिया पूर्ववत नहीं की जा सकती।' : '⚠️ Are you 100% sure? This action cannot be undone.'}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => setShowConfirmDelete(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                        >
                          {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={async () => {
                            setIsDeleting(true);
                            if (onDeleteChannel) {
                              await onDeleteChannel();
                            }
                            setIsDeleting(false);
                            onClose();
                          }}
                          className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isDeleting ? (language === 'hi' ? 'हटाया जा रहा है...' : 'Deleting...') : (language === 'hi' ? 'हाँ, चैनल हटाएं' : 'Yes, Delete Channel')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              {language === 'hi' ? 'सेटिंग्स सुरक्षित करें' : 'Save'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
