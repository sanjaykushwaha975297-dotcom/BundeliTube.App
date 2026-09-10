import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2, Search } from 'lucide-react';
import { Language, translations } from '../locales/i18n';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
  onSearchResult?: (text: string) => void;
  language: Language;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  onSearchResult,
  language
}) => {
  const t = translations[language];
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);

  const handleApplySearch = (query: string) => {
    if (onSearchResult) onSearchResult(query);
    if (onSearch) onSearch(query);
    onClose();
  };

  const quickPrompts = [
    'देशराज पटैरिया राई',
    'संजो बघेल मैया के जस',
    'आल्हा ऊदल बेतवा संग्राम',
    'बुंदेली डीजे रीमिक्स',
    'फाग होली गीत'
  ];

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      return;
    }

    // Check Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
        if (event.results[current].isFinal) {
          setTimeout(() => {
            handleApplySearch(text);
          }, 800);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();

      return () => {
        try {
          recognition.stop();
        } catch (e) { /* ignore */ }
      };
    } catch (err) {
      setSpeechSupported(false);
    }
  }, [isOpen, language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 font-bundeli">
          {isListening
            ? (language === 'hi' ? 'बोलिए... हम सुन रहे हैं' : 'Listening...')
            : (language === 'hi' ? 'आवाज़ से खोजें' : 'Voice Search')}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          {language === 'hi' 
            ? 'किसी भी बुंदेली गीत, राई, भजन या गायक का नाम बोलें' 
            : 'Speak song, singer, or genre name'}
        </p>

        {/* Animated Mic Indicator */}
        <div className="relative my-6 flex items-center justify-center">
          {isListening && (
            <>
              <div className="absolute w-24 h-24 rounded-full bg-amber-500/20 animate-ping" />
              <div className="absolute w-32 h-32 rounded-full bg-amber-500/10 animate-pulse" />
            </>
          )}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isListening 
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40 scale-110' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            <Mic className="w-8 h-8 animate-bounce" />
          </div>
        </div>

        {/* Transcript Output */}
        {transcript ? (
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-amber-500/40 text-amber-600 dark:text-amber-400 font-medium text-sm my-4">
            "{transcript}"
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic my-4">
            {language === 'hi' ? 'जैसे: "देशराज पटैरिया की राई बजाओ"' : 'Say: "Deshraj Patairiya Rai"'}
          </p>
        )}

        {/* Quick Suggestion Chips */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-left">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            {language === 'hi' ? 'लोकप्रिय खोज सुझाव:' : 'Popular Voice Queries:'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  handleApplySearch(prompt);
                }}
                className="px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700/50 text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3 h-3 text-amber-500" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
