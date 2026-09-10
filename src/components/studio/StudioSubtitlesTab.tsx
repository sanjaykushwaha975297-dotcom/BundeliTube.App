import React, { useState } from 'react';
import { 
  Subtitles, 
  Search, 
  Edit3, 
  Check, 
  Globe2, 
  FileText, 
  Sparkles,
  Plus
} from 'lucide-react';
import { Video } from '../../types';
import { Language, translations } from '../../locales/i18n';

interface StudioSubtitlesTabProps {
  creatorVideos: Video[];
  language: Language;
}

export const StudioSubtitlesTab: React.FC<StudioSubtitlesTabProps> = ({
  creatorVideos,
  language
}) => {
  const t = translations[language];

  const [activeVideoLyrics, setActiveVideoLyrics] = useState<Video | null>(null);
  const [lyricsText, setLyricsText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleOpenLyricsEditor = (video: Video) => {
    setActiveVideoLyrics(video);
    setLyricsText(video.lyrics || 'नैना तोरे कजरारे गोरी, चमके जइसे बिजुरिया...\nबुंदेलखंड की माटी में बाजे झन झन पैंजनिया!');
    setSaveSuccess(false);
  };

  const handleSaveLyrics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVideoLyrics) return;
    activeVideoLyrics.lyrics = lyricsText;
    setSaveSuccess(true);
    setTimeout(() => {
      setActiveVideoLyrics(null);
      setSaveSuccess(false);
    }, 1200);
  };

  return (
    <div id="studio-subtitles-tab" className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100">{t.studioSubtitles}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'बुंदेली गानों के बोल (Lyrics) और सबटाइटल्स जोड़ें ताकि दर्शक गाने का आनंद ले सकें'
              : 'Manage Bundeli lyrics and subtitle tracks for your uploaded songs'}
          </p>
        </div>
      </div>

      {/* Videos List for Subtitles */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 min-w-[280px]">वीडियो (Video)</th>
                <th className="py-3.5 px-4 text-center">भाषा (Language)</th>
                <th className="py-3.5 px-4 text-center">बोल / सबटाइटल स्थिति</th>
                <th className="py-3.5 px-4 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {creatorVideos.map((video) => (
                <tr key={video.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={video.thumbnail} alt={video.title} className="w-16 aspect-video rounded-xl object-cover shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-100 line-clamp-1">{video.title}</h4>
                        <span className="text-[10px] text-slate-400">{video.artist}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-amber-400 font-bold">
                      बुंदेली (Bundeli)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {video.lyrics ? '✓ प्रकाशित (Published)' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenLyricsEditor(video)}
                      className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold text-xs transition"
                    >
                      {language === 'hi' ? 'बोल संपादित करें' : 'Edit Lyrics'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lyrics Editor Modal */}
      {activeVideoLyrics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{language === 'hi' ? 'बुंदेली गीत के बोल (Lyrics Editor)' : 'Bundeli Lyrics Editor'}</span>
              </h3>
              <button onClick={() => setActiveVideoLyrics(null)} className="text-slate-400 hover:text-slate-100">✕</button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{language === 'hi' ? 'गीत के बोल सुरक्षित हो गए!' : 'Lyrics saved successfully!'}</span>
              </div>
            )}

            <form onSubmit={handleSaveLyrics} className="space-y-3">
              <p className="text-xs text-slate-400">
                गाने के मूल बुंदेली शब्दों को यहाँ लिखें या पेस्ट करें:
              </p>
              <textarea
                rows={8}
                value={lyricsText}
                onChange={(e) => setLyricsText(e.target.value)}
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-amber-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveVideoLyrics(null)}
                  className="px-4 py-2 bg-slate-800 rounded-xl text-xs text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  {language === 'hi' ? 'सुरक्षित करें' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
