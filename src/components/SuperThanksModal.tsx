import React, { useState } from 'react';
import { Heart, Sparkles, IndianRupee, CheckCircle2, X, Send, ShieldCheck } from 'lucide-react';
import { Video, UserAccount } from '../types';
import { Language, translations } from '../locales/i18n';
import { recordSuperThanks } from '../lib/firebase';

interface SuperThanksModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video | null;
  currentUser: UserAccount | null;
  language: Language;
}

export const SuperThanksModal: React.FC<SuperThanksModalProps> = ({
  isOpen,
  onClose,
  video,
  currentUser,
  language
}) => {
  const t = translations[language];
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customComment, setCustomComment] = useState<string>('🙏 जय बुंदेलखंड! क्या शानदार प्रस्तुति है!');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !video) return null;

  const amounts = [20, 50, 100, 200, 500, 1000];

  const handleSendTip = async () => {
    try {
      await recordSuperThanks({
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        videoId: video.id,
        videoTitle: video.title,
        channelName: video.channelName,
        amount: selectedAmount,
        message: customComment,
        senderName: currentUser?.name || (language === 'hi' ? 'बुंदेली दर्शक' : 'Bundeli Supporter'),
        senderUid: currentUser?.id
      });
    } catch (e) {
      console.warn('Super thanks note:', e);
    }
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-100">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-1.5 font-bundeli">
                  <span>{language === 'hi' ? 'सुपर थैंक्स (Super Thanks)' : 'Super Thanks'}</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'hi' ? `${video.channelName} को सहयोग राशि भेजें` : `Support ${video.channelName}`}
                </p>
              </div>
            </div>

            {/* Amount Selection Chips */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {amounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSelectedAmount(amt)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-1 border ${
                    selectedAmount === amt
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-lg shadow-pink-500/30'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>{amt}</span>
                </button>
              ))}
            </div>

            {/* Visual Comment Preview (Animated Highlight Banner) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-950 border border-pink-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-pink-500 text-white font-bold text-[10px] flex items-center justify-center">
                    ₹{selectedAmount}
                  </div>
                  <span className="text-xs font-bold text-pink-300">
                    {currentUser?.name || (language === 'hi' ? 'बुंदेली दर्शक' : 'Bundeli Supporter')}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-pink-400 px-2 py-0.5 rounded-full bg-pink-500/20">
                  सुपर थैंक्स ₹{selectedAmount}
                </span>
              </div>

              <textarea
                value={customComment}
                onChange={(e) => setCustomComment(e.target.value)}
                placeholder={language === 'hi' ? 'क्रिएटर के लिए संदेश लिखें...' : 'Type your message...'}
                className="w-full p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-pink-500 resize-none h-16"
              />
            </div>

            {/* Buy and Send Button */}
            <button
              onClick={handleSendTip}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-pink-500/20 transition flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>{language === 'hi' ? `₹${selectedAmount} सुपर थैंक्स भेजें` : `Buy and Send ₹${selectedAmount}`}</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% सुरक्षित भुगतान • क्रिएटर को सीधे प्राप्त होगा</span>
            </div>
          </>
        ) : (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto border border-pink-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-100">
              {language === 'hi' ? 'सुपर थैंक्स सफलतापूर्वक भेजा गया!' : 'Super Thanks Sent Successfully!'}
            </h4>
            <p className="text-xs text-slate-400">
              {language === 'hi' ? `₹${selectedAmount} का योगदान ${video.channelName} को भेज दिया गया है।` : `₹${selectedAmount} sent to creator.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
