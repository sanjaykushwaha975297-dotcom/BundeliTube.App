import React from 'react';
import { Clock, ShieldAlert, CheckCircle2, ChevronRight, X, AlertCircle } from 'lucide-react';
import { Channel } from '../types';
import { Language, translations } from '../locales/i18n';

interface ChannelPendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
  language: Language;
  theme?: 'dark' | 'light';
  onOpenAdminPortal?: () => void;
}

export const ChannelPendingModal: React.FC<ChannelPendingModalProps> = ({
  isOpen,
  onClose,
  channel,
  language,
  theme = 'dark',
  onOpenAdminPortal
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light';
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-slate-950/80 backdrop-blur-xs p-3 sm:p-6 py-6 sm:py-10 flex items-center justify-center animate-in fade-in">
      <div className={`relative w-full max-w-lg ${
        isLight ? 'bg-white text-slate-900 border-slate-200 shadow-2xl' : 'bg-slate-900 text-slate-100 border-slate-800 shadow-2xl'
      } border rounded-3xl p-5 sm:p-7 transition-all my-auto`}>
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full ${
            isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          } transition-colors cursor-pointer`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              {language === 'hi' ? 'समीक्षाधीन (Under Review)' : 'Pending Admin Approval'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-bundeli tracking-tight">
              {language === 'hi' ? 'चैनल अभी पेंडिंग में है' : 'Channel is Under Review'}
            </h2>
          </div>

          <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'} max-w-sm mx-auto leading-relaxed`}>
            {language === 'hi'
              ? 'आपका चैनल आवेदन सफलतापूर्वक सबमिट हो चुका है। व्यवस्थापक (Admin Panel) द्वारा मंज़ूरी मिलने के बाद यहाँ "क्रिएटर स्टूडियो" दिखाई देने लगेगा और आप वीडियो अपलोड कर सकेंगे।'
              : 'Your channel application has been submitted and is waiting for Admin approval. Once approved from the Admin Panel, Creator Studio and video uploads will be unlocked.'}
          </p>
        </div>

        {/* Channel Details Card */}
        <div className={`mt-5 p-4 rounded-2xl ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
        } border space-y-3`}>
          <div className="flex items-center gap-3">
            <img
              src={channel.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={channel.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm truncate">{channel.name || (language === 'hi' ? 'आपका चैनल' : 'Your Channel')}</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate`}>{channel.handle || '@channel'}</p>
              {channel.id && (
                <p className="text-[10px] text-amber-500/90 font-mono mt-0.5">ID: {channel.id}</p>
              )}
            </div>
          </div>

          {/* Workflow Stepper */}
          <div className="space-y-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/60 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-500 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{language === 'hi' ? '1. चैनल आवेदन सबमिट (पूर्ण)' : '1. Application Submitted (Done)'}</span>
            </div>

            <div className="flex items-center gap-2.5 text-amber-500 font-semibold">
              <Clock className="w-4 h-4 shrink-0 animate-spin" />
              <span>{language === 'hi' ? '2. एडमिन समीक्षा व अनुमोदन (जारी है...)' : '2. Admin Review & Verification (In Progress...)'}</span>
            </div>

            <div className={`flex items-center gap-2.5 ${isLight ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
              <div className="w-4 h-4 rounded-full border-2 border-slate-400/40 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400/50" />
              </div>
              <span>{language === 'hi' ? '3. क्रिएटर स्टूडियो व वीडियो अपलोड (अनलॉक होगा)' : '3. Creator Studio & Video Upload (Will Unlock)'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            } transition`}
          >
            {language === 'hi' ? 'ठीक है, समझ गया' : 'Got it, thanks'}
          </button>

          {onOpenAdminPortal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdminPortal();
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{language === 'hi' ? 'एडमिन पोर्टल खोलें' : 'Open Admin Portal'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
