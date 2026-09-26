import React from 'react';
import { 
  ShieldCheck, 
  Info, 
  FileText, 
  Mail, 
  Scale, 
  DollarSign 
} from 'lucide-react';
import { Language } from '../locales/i18n';

interface SimpleFooterProps {
  language: Language;
  onNavigateView: (view: 'about' | 'creator_program' | 'policies') => void;
  onOpenPolicies: (tab: string) => void;
  onOpenContactUs: () => void;
  theme?: 'dark' | 'light';
}

export const SimpleFooter: React.FC<SimpleFooterProps> = ({
  language,
  onNavigateView,
  onOpenPolicies,
  onOpenContactUs,
  theme = 'dark'
}) => {
  const isHi = language === 'hi';
  const isLight = theme === 'light';

  return (
    <footer 
      className={`w-full mt-12 mb-4 py-6 px-4 border-t ${
        isLight ? 'border-slate-200 bg-slate-50/80 text-slate-700' : 'border-slate-800 bg-slate-950/70 text-slate-300'
      } rounded-2xl transition-colors`}
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-4">
        
        {/* Top Partner Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Google AdSense & AdMob Verified Partner Platform</span>
        </div>

        {/* 6 Essential AdSense Compliance Links with Crawlable href for bot indexing */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm font-medium">
          
          {/* 1. About Us */}
          <a
            href="/about"
            onClick={(e) => {
              e.preventDefault();
              onNavigateView('about');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 hover:text-amber-500 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{isHi ? 'हमारे बारे में (About Us)' : 'About Us'}</span>
          </a>

          <span className="text-slate-400 dark:text-slate-600 select-none">•</span>

          {/* 2. Privacy Policy */}
          <a
            href="/privacy-policy"
            onClick={(e) => {
              e.preventDefault();
              onOpenPolicies('admob_adsense');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{isHi ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}</span>
          </a>

          <span className="text-slate-400 dark:text-slate-600 select-none">•</span>

          {/* 3. Terms of Service */}
          <a
            href="/terms"
            onClick={(e) => {
              e.preventDefault();
              onOpenPolicies('terms');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>{isHi ? 'उपयोग की शर्तें (Terms of Service)' : 'Terms of Service'}</span>
          </a>

          <span className="text-slate-400 dark:text-slate-600 select-none">•</span>

          {/* 4. Contact Us */}
          <button
            type="button"
            onClick={onOpenContactUs}
            className="flex items-center gap-1.5 hover:text-cyan-500 transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span>{isHi ? 'संपर्क करें (Contact Us)' : 'Contact Us'}</span>
          </button>

          <span className="text-slate-400 dark:text-slate-600 select-none">•</span>

          {/* 5. Disclaimer */}
          <a
            href="/disclaimer"
            onClick={(e) => {
              e.preventDefault();
              onOpenPolicies('disclaimer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 hover:text-amber-500 transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{isHi ? 'अस्वीकरण (Disclaimer)' : 'Disclaimer'}</span>
          </a>

          <span className="text-slate-400 dark:text-slate-600 select-none">•</span>

          {/* 6. 50/50 Creator Revenue Policy */}
          <a
            href="/creator-program"
            onClick={(e) => {
              e.preventDefault();
              onNavigateView('creator_program');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {isHi ? '50-50 कमाई नीति (Creator Policy)' : '50/50 Creator Policy'}
            </span>
          </a>

        </div>

        {/* Bottom Publisher & Copyright Details for Google Crawlers */}
        <div className="pt-2 text-xs text-slate-500 space-y-1">
          <p>
            © {new Date().getFullYear()} BundeliTube (बुन्देली ट्यूब) • {isHi ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'} Registered Digital Intermediary under Indian IT Act 2000.
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
            <span>Support: sanjaykushwaha975297@gmail.com</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
