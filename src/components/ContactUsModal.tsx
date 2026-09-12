import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Copy, 
  Check, 
  Send, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Language } from '../locales/i18n';
import { UserAccount } from '../types';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser: UserAccount | null;
  theme?: 'dark' | 'light';
  onOpenPolicies?: (tab?: string) => void;
}

export const ContactUsModal: React.FC<ContactUsModalProps> = ({
  isOpen,
  onClose,
  language,
  theme = 'dark',
  onOpenPolicies
}) => {
  const isLight = theme === 'light';
  // Official valid Gmail address without trailing period before @
  const OFFICIAL_EMAIL = 'bundelitubeapp@gmail.com';

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(OFFICIAL_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const subject = language === 'hi' 
    ? 'बुन्देलीट्यूब सहायता व पूछताछ (BundeliTube Support Enquiry)'
    : 'BundeliTube Support & Helpdesk Enquiry';

  const bodyText = language === 'hi'
    ? 'नमस्ते बुन्देलीट्यूब टीम,\n\nमेरी समस्या / पूछताछ का विवरण:\n- विषय:\n- चैनल नाम (यदि है):\n- विवरण:\n'
    : 'Hello BundeliTube Support Team,\n\nMy enquiry / issue details:\n- Topic:\n- Channel Name (if any):\n- Details:\n';

  // Mailto link formatted strictly to pre-fill To, Subject, and Body in Gmail / Mail apps
  const mailtoUrl = `mailto:${OFFICIAL_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

  // Direct web Gmail compose URL (for Chrome / Desktop / Web users)
  const webGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${OFFICIAL_EMAIL}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

  const handleDirectMailClick = () => {
    // Directly navigate window location to mailto without popup blockers
    window.location.href = mailtoUrl;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-md rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight 
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50' 
            : 'bg-slate-900 border-slate-800 text-white shadow-black/80'
        }`}
      >
        {/* Modal Header */}
        <div className="relative px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'hi' ? 'संपर्क करें (Contact Us)' : 'Contact Us'}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  Official Support
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi' ? 'बुन्देलीट्यूब आधिकारिक हेल्पडेस्क' : 'BundeliTube Official Helpdesk'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Purely Email Centric (No unnecessary form inputs) */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Main Official Email Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${
            isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-950/30 border-blue-800/60'
          } space-y-4`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'hi' ? 'आधिकारिक सपोर्ट ईमेल' : 'Official Support Email'}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {language === 'hi' ? '२४-४८ घंटे में उत्तर' : '24-48 hrs response'}
              </span>
            </div>

            {/* Email Address Display Box */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-blue-300/60 dark:border-blue-700/60 shadow-inner flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white select-all truncate">
                  {OFFICIAL_EMAIL}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  copied 
                    ? 'bg-emerald-600 text-white' 
                    : isLight 
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title="Copy email to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>{language === 'hi' ? 'कॉपी हो गया' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'कॉपी करें' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Open Mailbox / Send Mail Action Button */}
            <div className="space-y-2 pt-1">
              <a
                href={mailtoUrl}
                onClick={handleDirectMailClick}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {language === 'hi' ? 'मेल बॉक्स खोलें व संदेश भेजें (Send Mail)' : 'Open Mailbox & Send Mail'}
                </span>
              </a>

              {/* Alternative direct web Gmail composer button */}
              <a
                href={webGmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  isLight 
                    ? 'border-slate-200 hover:bg-slate-100 text-slate-700' 
                    : 'border-slate-800 hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5 text-red-500" />
                <span>
                  {language === 'hi' ? 'Google Gmail में सीधे खोलें (Open in Gmail Web)' : 'Open directly in Gmail Web'}
                </span>
              </a>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              {language === 'hi' 
                ? 'बटन पर क्लिक करते ही आपके फोन का Gmail ऐप खुल जाएगा और "To" में हमारा ईमेल व विषय पहले से भरा रहेगा।' 
                : 'Clicking will automatically launch your mail app with our address and subject pre-filled.'}
            </p>
          </div>

          {/* Policy / Legal Link */}
          {onOpenPolicies && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center text-[11px] text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPolicies('grievance');
                }}
                className="hover:text-blue-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'hi' ? 'शिकायत निवारण अधिकारी व नीति (IT Rules)' : 'Grievance Officer & Policy'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
