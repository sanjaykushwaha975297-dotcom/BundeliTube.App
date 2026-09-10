import React, { useState } from 'react';
import { Plus, Check, Clock, FolderPlus, Lock, Globe, X, Sparkles } from 'lucide-react';
import { Video, UserPlaylist } from '../types';
import { Language, translations } from '../locales/i18n';
import { recordSaveToPlaylist } from '../lib/firebase';

interface SaveToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video | null;
  language: Language;
  currentUserId?: string;
  currentUserName?: string;
}

export const SaveToPlaylistModal: React.FC<SaveToPlaylistModalProps> = ({
  isOpen,
  onClose,
  video,
  language,
  currentUserId,
  currentUserName
}) => {
  const t = translations[language];
  const [playlists, setPlaylists] = useState<{ id: string; name: string; checked: boolean; isWatchLater?: boolean }[]>([
    { id: 'wl', name: language === 'hi' ? 'बाद में देखें (Watch Later)' : 'Watch Later', checked: true, isWatchLater: true },
    { id: 'fav', name: language === 'hi' ? 'पसंदीदा बुंदेली राई' : 'Favorite Rai Songs', checked: false },
    { id: 'bhak', name: language === 'hi' ? 'माता के जस व भजन' : 'Navratri Bhakti Jas', checked: true },
    { id: 'dj', name: language === 'hi' ? 'धमाकेदार डीजे रीमिक्स' : 'DJ Remix Dhamaka', checked: false }
  ]);

  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');

  if (!isOpen || !video) return null;

  const togglePlaylist = (id: string) => {
    const target = playlists.find(p => p.id === id);
    if (target && !target.checked) {
      recordSaveToPlaylist({
        videoId: video.id,
        videoTitle: video.title,
        playlistName: target.name,
        userId: currentUserId,
        userName: currentUserName
      });
    }
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p));
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    recordSaveToPlaylist({
      videoId: video.id,
      videoTitle: video.title,
      playlistName: newTitle.trim(),
      userId: currentUserId,
      userName: currentUserName
    });

    setPlaylists(prev => [
      ...prev,
      { id: `pl-${Date.now()}`, name: newTitle.trim(), checked: true }
    ]);
    setNewTitle('');
    setShowCreateNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-100">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>{language === 'hi' ? 'प्लेलिस्ट में सहेजें' : 'Save video to...'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Mini Summary */}
        <div className="flex items-center gap-3 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <img src={video.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'} alt={video.title} className="w-12 h-8 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-200 truncate">{video.title}</h4>
            <span className="text-[10px] text-slate-400">{video.artist}</span>
          </div>
        </div>

        {/* Playlists Checkbox List */}
        <div className="space-y-1.5 max-h-52 overflow-y-auto">
          {playlists.map((pl) => (
            <label
              key={pl.id}
              onClick={() => togglePlaylist(pl.id)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition text-xs font-medium text-slate-200"
            >
              <span className="flex items-center gap-2 truncate">
                {pl.isWatchLater ? <Clock className="w-4 h-4 text-amber-400" /> : <FolderPlus className="w-4 h-4 text-slate-400" />}
                <span>{pl.name}</span>
              </span>
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                pl.checked ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 bg-slate-950'
              }`}>
                {pl.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </label>
          ))}
        </div>

        {/* Create New Playlist Accordion */}
        {!showCreateNew ? (
          <button
            onClick={() => setShowCreateNew(true)}
            className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-amber-400 hover:bg-amber-500/10 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? '+ नई प्लेलिस्ट बनाएँ' : '+ Create new playlist'}</span>
          </button>
        ) : (
          <form onSubmit={handleCreatePlaylist} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <input
              type="text"
              placeholder={language === 'hi' ? 'प्लेलिस्ट का नाम लिखें...' : 'Enter playlist title...'}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              autoFocus
            />

            <div className="flex items-center gap-2">
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] text-slate-300 focus:outline-none"
              >
                <option value="public">{language === 'hi' ? '🌐 सार्वजनिक (Public)' : '🌐 Public'}</option>
                <option value="unlisted">{language === 'hi' ? '🔗 केवल लिंक (Unlisted)' : '🔗 Unlisted'}</option>
                <option value="private">{language === 'hi' ? '🔒 निजी (Private)' : '🔒 Private'}</option>
              </select>

              <div className="flex-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateNew(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-[11px] font-medium hover:bg-slate-700"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-[11px] font-bold hover:bg-amber-400 disabled:opacity-50"
                >
                  {language === 'hi' ? 'बनाएँ' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
        >
          {language === 'hi' ? 'सहेजा गया (Done)' : 'Done'}
        </button>
      </div>
    </div>
  );
};
