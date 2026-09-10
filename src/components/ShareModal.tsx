import React, { useState } from 'react';
import { Share2, Copy, Check, X, MessageCircle, Send, Globe, Code, CheckCircle2 } from 'lucide-react';
import { Video } from '../types';
import { Language, translations } from '../locales/i18n';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video | null;
  language: Language;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  video,
  language
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);
  const [startAt, setStartAt] = useState(false);
  const [timestamp, setTimestamp] = useState('0:00');

  if (!isOpen || !video) return null;

  const currentUrl = window.location.origin + `?v=${video.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`🎵 बुंदेली गीत सुनें: ${video.title} - ${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTelegram = () => {
    const text = encodeURIComponent(`🎵 ${video.title}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${text}`, '_blank');
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-100">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            <span>{language === 'hi' ? 'शेयर करें (Share Video)' : 'Share Video'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Social Share Buttons Grid */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400">WhatsApp</span>
          </button>

          <button
            onClick={handleTelegram}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition group"
          >
            <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-sky-400">Telegram</span>
          </button>

          <button
            onClick={handleFacebook}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-blue-400">Facebook</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              {copied ? <Check className="w-5 h-5 stroke-[3]" /> : <Copy className="w-5 h-5" />}
            </div>
            <span className="text-[11px] font-semibold text-amber-400">{copied ? 'कॉपी हुआ!' : 'Embed/Copy'}</span>
          </button>
        </div>

        {/* Copy Link Input Bar */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="flex-1 bg-transparent text-xs text-slate-300 focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (language === 'hi' ? 'कॉपी हो गया' : 'Copied!') : (language === 'hi' ? 'कॉपी करें' : 'Copy Link')}</span>
          </button>
        </div>

        {/* Start at Timestamp Option */}
        <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
          <input
            type="checkbox"
            id="startAtCheck"
            checked={startAt}
            onChange={(e) => setStartAt(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
          />
          <label htmlFor="startAtCheck" className="cursor-pointer select-none">
            {language === 'hi' ? 'इस समय से शुरू करें:' : 'Start at:'}
          </label>
          <input
            type="text"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            disabled={!startAt}
            className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-center font-mono text-slate-200 disabled:opacity-40"
          />
        </div>
      </div>
    </div>
  );
};
