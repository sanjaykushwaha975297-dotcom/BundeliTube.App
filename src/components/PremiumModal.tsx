import React from 'react';
import { Sparkles, Check, X, Download, Headphones, ShieldCheck, Zap } from 'lucide-react';
import { Language, translations } from '../locales/i18n';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  const perks = [
    { title: language === 'hi' ? '100% विज्ञापन-मुक्त अनुभव' : 'Ad-Free Playback', desc: language === 'hi' ? 'बिना किसी रुकावट के लगातार बुंदेली राई व लोकगीत सुनें' : 'Listen to unlimited Bundeli music without any ads', icon: Zap },
    { title: language === 'hi' ? 'बैकग्राउंड ऑडियो प्ले' : 'Background Audio Play', desc: language === 'hi' ? 'स्क्रीन लॉक होने या दूसरी ऐप चलाने पर भी गाना बजेगा' : 'Keep playing while screen is locked or using other apps', icon: Headphones },
    { title: language === 'hi' ? 'असीमित ऑफ़लाइन डाउनलोड' : 'Unlimited Offline Downloads', desc: language === 'hi' ? 'बिना इंटरनेट के गांव-खेत कहीं भी 1080p क्वालिटी में सुनें' : 'Download in Full HD 1080p and listen anywhere without data', icon: Download },
    { title: language === 'hi' ? 'विशेष बुंदेली स्टूडियो मास्टर ट्रैक्स' : 'Exclusive Studio Master Audio', desc: language === 'hi' ? '320kbps लॉसलेस हाई-फाई बुंदेली ढोलक व हारमोनियम रिकॉर्डिंग' : 'Lossless studio master quality with rich bass & clarity', icon: Sparkles },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="relative w-full max-w-lg bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-400 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BundeliTube Premium</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-bundeli">
            {language === 'hi' ? 'माटी का संगीत, बिना किसी रुकावट के' : 'All Bundeli Music, Pure & Ad-Free'}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            {language === 'hi' 
              ? 'बुंदेलखंड के लोक कलाकारों को सीधे समर्थन दें और प्रीमियम सुविधाओं का आनंद लें।' 
              : 'Support Bundeli folk creators directly while enjoying premium perks.'}
          </p>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {perks.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{p.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Pricing Plan Card */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-gradient-to-r dark:from-amber-500/10 dark:via-orange-500/10 dark:to-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{language === 'hi' ? 'मासिक परिवार प्लान' : 'Monthly Premium'}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase">
                {language === 'hi' ? '1 माह फ्री' : '1 Month Free'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
              {language === 'hi' ? 'पहले महीने के बाद केवल ₹49/माह' : '₹49/month after 1-month trial'}
            </p>
          </div>

          <button
            onClick={() => {
              alert(language === 'hi' ? '🎉 बुंदेलीट्यूब प्रीमियम का 1 माह का निःशुल्क ट्रायल सक्रिय हो गया!' : '🎉 BundeliTube Premium 1-Month Free Trial Activated!');
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/30 transition cursor-pointer"
          >
            {language === 'hi' ? 'फ्री ट्रायल शुरू करें' : 'Try Free'}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{language === 'hi' ? 'कभी भी रद्द करें • सुरक्षित UPI एवं बैंक भुगतान' : 'Cancel anytime • Secure UPI & Card Checkout'}</span>
        </div>
      </div>
    </div>
  );
};
