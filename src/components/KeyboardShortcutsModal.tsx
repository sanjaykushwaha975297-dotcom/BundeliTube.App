import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { Language, translations } from '../locales/i18n';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space / K', desc: language === 'hi' ? 'चलाएं / रोकें (Play/Pause)' : 'Play / Pause' },
    { key: 'J', desc: language === 'hi' ? '10 सेकंड पीछे जाएं (Rewind 10s)' : 'Rewind 10 seconds' },
    { key: 'L', desc: language === 'hi' ? '10 सेकंड आगे जाएं (Fast Forward 10s)' : 'Fast Forward 10 seconds' },
    { key: 'M', desc: language === 'hi' ? 'आवाज़ म्यूट / अनम्यूट करें (Mute/Unmute)' : 'Mute / Unmute' },
    { key: 'F', desc: language === 'hi' ? 'फुलस्क्रीन मोड (Toggle Fullscreen)' : 'Toggle Fullscreen' },
    { key: 'T', desc: language === 'hi' ? 'थिएटर मोड (Toggle Theater Mode)' : 'Toggle Theater Mode' },
    { key: 'C', desc: language === 'hi' ? 'सबटाइटल्स चालू/बंद (Subtitles CC)' : 'Toggle Captions/Subtitles' },
    { key: '/', desc: language === 'hi' ? 'सर्च बार पर जाएं (Focus Search)' : 'Focus Search Box' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-500" />
            <span>{language === 'hi' ? 'कीबोर्ड शॉर्टकट्स (Shortcuts)' : 'Keyboard Shortcuts'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-amber-700 dark:text-amber-400 font-mono font-bold text-[11px] shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
