import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  Plus,
  ExternalLink
} from 'lucide-react';
import { Language, translations } from '../../locales/i18n';
import { STUDIO_COPYRIGHT_CLAIMS } from '../../data/mockData';

interface StudioCopyrightTabProps {
  language: Language;
}

export const StudioCopyrightTab: React.FC<StudioCopyrightTabProps> = ({ language }) => {
  const t = translations[language];
  const [claims] = useState(STUDIO_COPYRIGHT_CLAIMS);

  return (
    <div id="studio-copyright-tab" className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <span>{t.studioCopyright}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              Channel Status: Clean (0 Strikes)
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'चैनल कॉपीराइट स्वास्थ्य, कंटेंट मैच और निष्पक्ष उपयोग स्थिति का प्रबंधन करें'
              : 'Channel copyright health, Content ID matches, and removal requests'}
          </p>
        </div>
      </div>

      {/* Channel Copyright Health Badge */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100">
              {language === 'hi' ? 'कोई कॉपीराइट स्ट्राइक नहीं (0 of 3)' : 'No active copyright strikes (0 of 3)'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'hi' ? 'आपका चैनल 100% अच्छी स्थिति में है। सभी वीडियो कमाई के योग्य हैं।' : 'Your channel is in good standing with full monetization rights.'}
            </p>
          </div>
        </div>
      </div>

      {/* Copyright Matches Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200">
            {language === 'hi' ? 'कंटेंट आईडी और कॉपीराइट स्थिति (Content Status)' : 'Content ID & Copyright Status'}
          </h3>
          <span className="text-xs text-emerald-400 font-bold">
            {claims.length} {language === 'hi' ? 'मामले' : 'Issues'}
          </span>
        </div>

        {claims.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200">
              {language === 'hi' ? 'कोई कॉपीराइट दावा या स्ट्राइक नहीं है' : 'No copyright claims or strikes found'}
            </p>
            <p className="text-xs text-slate-400">
              {language === 'hi' ? 'आपके सभी वीडियो सुरक्षित व 100% मुद्रीकरण के योग्य हैं।' : 'All your uploaded content is genuine, safe and eligible for monetization.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 min-w-[260px]">वीडियो (Video)</th>
                  <th className="py-3.5 px-4">क्लेमेंट / अधिकार धारक</th>
                  <th className="py-3.5 px-4">प्रकार (Type)</th>
                  <th className="py-3.5 px-4 text-center">स्थिति</th>
                  <th className="py-3.5 px-4 text-right">कार्रवाई प्रभाव</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      {claim.videoTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {claim.claimant}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {claim.claimType}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        {claim.status === 'none' ? '✓ Clean' : '✓ Resolved'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-400">
                      {claim.actionTaken}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
