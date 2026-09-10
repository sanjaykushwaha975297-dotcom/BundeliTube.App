import React, { useState } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Download, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Volume2, 
  Heart,
  Check
} from 'lucide-react';
import { StudioAudioTrack } from '../../types';
import { Language, translations } from '../../locales/i18n';
import { STUDIO_AUDIO_TRACKS } from '../../data/mockData';

interface StudioAudioLibraryTabProps {
  language: Language;
}

export const StudioAudioLibraryTab: React.FC<StudioAudioLibraryTabProps> = ({ language }) => {
  const t = translations[language];

  const [tracks, setTracks] = useState<StudioAudioTrack[]>(STUDIO_AUDIO_TRACKS);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const [downloadedNotice, setDownloadedNotice] = useState<string | null>(null);

  const togglePlayTrack = (trackId: string) => {
    if (playingTrackId === trackId) {
      setPlayingTrackId(null);
    } else {
      setPlayingTrackId(trackId);
    }
  };

  const toggleStar = (id: string) => {
    if (starredIds.includes(id)) {
      setStarredIds(starredIds.filter(item => item !== id));
    } else {
      setStarredIds([...starredIds, id]);
    }
  };

  const handleDownload = (track: StudioAudioTrack) => {
    setDownloadedNotice(track.title);
    setTimeout(() => setDownloadedNotice(null), 2500);
  };

  const filteredTracks = tracks.filter((tr) => {
    if (!searchQuery) return true;
    return (
      tr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tr.hindiTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tr.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tr.mood.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div id="studio-audio-library-tab" className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <span>{t.studioAudioLibrary}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
              100% Royalty Free
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'बुंदेली लोकसंगीत, ढोलक थाप, नगाड़ा, शहनाई व फाग ताल—बिना किसी कॉपीराइट के अपने वीडियो में स्वतंत्र रूप से उपयोग करें'
              : 'Royalty-free Bundeli folk instrumentals, dholak loops, and sound effects for creators without copyright claims'}
          </p>
        </div>
      </div>

      {downloadedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>"{downloadedNotice}" {language === 'hi' ? 'ट्रैक डाउनलोड हो गया! आप इसे अपने बुंदेली वीडियो में प्रयोग कर सकते हैं।' : 'downloaded successfully! Free for your videos.'}</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'ढोलक, नगाड़ा, शहनाई, हारमोनियम, फाग धुन खोजें...' : 'Search dholak beat, shehnai, harmonium loop, genre...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Audio Track Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {filteredTracks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Music className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="font-semibold text-sm text-slate-300">
              {language === 'hi' ? 'कोई ऑडियो ट्रैक उपलब्ध नहीं है' : 'No audio tracks available'}
            </p>
            <p className="text-xs text-slate-500">
              {language === 'hi' ? 'नए कॉपीराइट-मुक्त संगीत ट्रैक जल्द उपलब्ध होंगे।' : 'Royalty-free audio tracks will be available soon.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">प्ले</th>
                  <th className="py-3.5 px-4 min-w-[220px]">ट्रैक शीर्षक (Track Title)</th>
                  <th className="py-3.5 px-4">शैली (Genre)</th>
                  <th className="py-3.5 px-4">मूड (Mood)</th>
                  <th className="py-3.5 px-4">कलाकार / स्टूडियो</th>
                  <th className="py-3.5 px-4 text-right">अवधि</th>
                  <th className="py-3.5 px-4 text-center">लाइसेंस</th>
                  <th className="py-3.5 px-4 text-right">डाउनलोड</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
              {filteredTracks.map((tr) => {
                const isPlaying = playingTrackId === tr.id;
                const isStarred = starredIds.includes(tr.id);

                return (
                  <tr key={tr.id} className={`hover:bg-slate-800/40 transition ${isPlaying ? 'bg-amber-500/10' : ''}`}>
                    {/* Play/Pause Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => togglePlayTrack(tr.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                          isPlaying
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-amber-400'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-200 ml-0.5" />}
                      </button>
                    </td>

                    {/* Track Title */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <h4 className={`font-bold ${isPlaying ? 'text-amber-400' : 'text-slate-100'}`}>
                          {tr.hindiTitle}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono">{tr.title}</p>
                      </div>
                    </td>

                    {/* Genre */}
                    <td className="py-3.5 px-4 text-slate-300">
                      {tr.genre}
                    </td>

                    {/* Mood */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-medium">
                        {tr.mood}
                      </span>
                    </td>

                    {/* Artist */}
                    <td className="py-3.5 px-4 text-slate-400">
                      {tr.artist}
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {tr.duration}
                    </td>

                    {/* License Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Free</span>
                      </span>
                    </td>

                    {/* Download Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDownload(tr)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition"
                        title="Download MP3"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

    </div>
  );
};
