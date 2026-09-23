import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  DollarSign, 
  Lock, 
  Mail, 
  Tv, 
  Award, 
  FileText, 
  Scale, 
  HelpCircle, 
  CheckCircle2, 
  ArrowLeft, 
  ExternalLink 
} from 'lucide-react';
import { Language } from '../locales/i18n';

interface AboutViewProps {
  language: Language;
  onNavigateHome: () => void;
  onOpenPolicies?: (tab: string) => void;
  onOpenContactUs?: () => void;
  theme?: 'dark' | 'light';
}

export const AboutView: React.FC<AboutViewProps> = ({
  language,
  onNavigateHome,
  onOpenPolicies,
  onOpenContactUs,
  theme = 'dark'
}) => {
  const isHi = language === 'hi';
  const isLight = theme === 'light';

  return (
    <div className="max-w-5xl mx-auto py-6 px-3 sm:px-6 space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-500 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isHi ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Back to Home'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Google AdSense & AdMob Partner
          </span>
        </div>
      </div>

      {/* Hero Showcase */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border border-amber-500/20 shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHi ? 'बुंदेलखंड की धरोहर व 50/50 क्रिएटर मंच' : 'Bundelkhand Cultural & Creator Platform'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight leading-tight">
            {isHi 
              ? 'बुन्देलीट्यूब: लोक-संस्कृति, राई, आल्हा एवं 50% रेवेन्यू शेयरिंग का नंबर-1 डिजिटल मंच' 
              : 'BundeliTube: Folk Heritage, Rai, Alha & 50/50 Revenue Sharing Video Platform'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {isHi
              ? 'बुन्देलीट्यूब (bundelitube.fun) भारत का प्रथम समर्पित क्षेत्रीय वीडियो व ऑडियो स्ट्रीमिंग मंच है। इसका मुख्य उद्देश्य बुंदेलखंड के ग्रामीण लोक कलाकारों, गायकों, नर्तकों और वीडियो क्रिएटर्स को एक सशक्त डिजिटल पहचान और उनकी मेहनत का 50% सीधा पारदर्शी विज्ञापन राजस्व दिलाना है।'
              : 'BundeliTube is India’s premier regional video sharing platform celebrating Bundelkhand folk culture and empowering rural artists with an authentic 50/50 creator monetization model.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="/creator-program"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              {isHi ? '50-50 क्रिएटर नीति पढ़ें' : 'View 50/50 Creator Policy'}
            </a>
            <a
              href="/privacy-policy"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              {isHi ? 'AdSense गोपनीयता नीति' : 'Privacy & AdSense Policy'}
            </a>
          </div>
        </div>
      </div>

      {/* 4 Pillars Grid for AdSense Compliance & Creator Transparency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: The Mission & Culture */}
        <div className={`p-6 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'} space-y-3`}>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <Tv className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            {isHi ? '1. हमारा मिशन व लोक संस्कृति संरक्षण' : '1. Mission & Folk Cultural Preservation'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isHi
              ? 'ईसुरी की अमर चौकड़ियां, जगनिक का 52 गढ़ों वाला वीर रस आल्हा, होली व वसंत के फाग, दिवारी, कछियाई और पारंपरिक राई नृत्य को संरक्षित करना हमारा परम लक्ष्य है। बड़ी स्ट्रीमिंग साइटों पर उपेक्षित ग्रामीण कलाकारों को बुन्देलीट्यूब पर वैश्विक मंच मिलता है।'
              : 'Our mission is to archive and promote timeless Bundeli oral traditions—Isuri chaukadiya, Jagnik Alha-Udal heroic ballads, Faag, Diwari, and Rai folk dance while providing rural artists world-class digital reach.'}
          </p>
        </div>

        {/* Card 2: 50/50 Fair Monetization */}
        <div className={`p-6 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'} space-y-3`}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-emerald-600 dark:text-emerald-400">
            {isHi ? '2. 50/50 पारदर्शी रेवेन्यू शेयरिंग मॉडल' : '2. Transparent 50/50 Revenue Split'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isHi
              ? 'क्रिएटर के वीडियो पर प्रदर्शित होने वाले सभी Google AdSense व AdMob विज्ञापनों से होने वाली आय का 50% हिस्सा सीधे क्रिएटर के वॉलेट में जमा होता है। न्यूनतम थ्रेशोल्ड पूरा होने पर हर महीने 1 से 6 तारीख के बीच सीधे बैंक खाते या UPI में भुगतान किया जाता है।'
              : '50% of verified ad revenue generated from Google AdSense & AdMob display ads is credited directly to the creator’s wallet. Payouts are made directly via NEFT/IMPS or UPI during the 1st-6th of each month.'}
          </p>
        </div>

        {/* Card 3: Pre-Moderation & Quality Control */}
        <div className={`p-6 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'} space-y-3`}>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-blue-600 dark:text-blue-400">
            {isHi ? '3. सख्त प्री-मॉडरेशन व कॉपीराइट सुरक्षा' : '3. Strict Pre-Moderation & Safe Harbor'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isHi
              ? 'कोई भी वीडियो सीधे सार्वजनिक नहीं होता। हर वीडियो पहले Firebase के पेंडिंग डेटाबेस में जाता है, जहाँ एडमिन टीम वीडियो की मौलिकता, कॉपीराइट और विज्ञापन अनुकूलता की समीक्षा करके ही उसे मुख्य पेज पर अप्रूव करती है।'
              : 'Every video submission enters an isolated pending queue in Firebase. The editorial team verifies copyright clearance, community standards, and advertiser suitability before making it live.'}
          </p>
        </div>

        {/* Card 4: Anti-Fraud & Brand Safety */}
        <div className={`p-6 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'} space-y-3`}>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-purple-600 dark:text-purple-400">
            {isHi ? '4. अमान्य ट्रैफ़िक शून्य सहनशीलता (Anti-Fraud)' : '4. Anti-Fraud & AdSense Brand Safety'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isHi
              ? 'हम कृत्रिम बॉट्स, ऑटो-क्लिकर, क्लिक-एक्सचेंज अथवा स्वयं के विज्ञापनों पर क्लिक करने के प्रति शून्य-सहनशीलता (Zero Tolerance) रखते हैं। केवल वास्तविक दर्शकों द्वारा 30+ सेकंड देखे गए वीडियो पर ही विज्ञापन इंप्रेशन मान्य होते हैं।'
              : 'Strict protection for Google advertisers against bot clicks, auto-refreshers, and invalid traffic. Ad views are recorded only when genuine human users engage with content.'}
          </p>
        </div>
      </div>

      {/* Official Platform Details Table */}
      <div className={`p-6 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'} space-y-4`}>
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-500" />
          <span>{isHi ? 'प्लेटफ़ॉर्म विवरण व आधिकारिक संपर्क' : 'Official Platform Disclosures'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">प्लेटफ़ॉर्म नाम:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">BundeliTube (बुन्देली ट्यूब)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">वेबसाइट डोमेन:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">bundelitube.fun</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Google AdSense प्रकाशक आईडी:</span>
            <span className="font-bold text-emerald-500 text-sm font-mono">pub-5666532653138550</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">आधिकारिक संपर्क ईमेल:</span>
            <a href="mailto:sanjaykushwaha975297@gmail.com" className="font-bold text-blue-400 text-sm font-mono hover:underline">
              sanjaykushwaha975297@gmail.com
            </a>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">शिकायत अधिकारी (Grievance):</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">भारतीय आईटी नियम 2021 अनुपालित</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">कार्यक्षेत्र / मुख्यालय:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">बुंदेलखंड संभाग (मध्य प्रदेश / उत्तर प्रदेश), भारत</span>
          </div>
        </div>
      </div>

      {/* 5 Mandatory Legal Pages Bar */}
      <div className={`p-6 rounded-2xl border ${isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-950 border-slate-800'} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-500" />
            <span>{isHi ? 'Google AdSense अनिवार्य 5 कानूनी दस्तावेज़' : 'Google AdSense 5 Mandatory Legal Documents'}</span>
          </h4>
          <span className="text-[11px] text-slate-500">सभी पेज क्रॉलर-फ्रेंडली और सार्वजनिक हैं</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <a
            href="/privacy-policy"
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition text-center block space-y-1"
          >
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Privacy Policy</span>
            <span className="text-[10px] text-slate-500 block">गोपनीयता व कुकीज</span>
          </a>

          <a
            href="/terms"
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition text-center block space-y-1"
          >
            <span className="font-bold text-amber-500 block">Terms of Service</span>
            <span className="text-[10px] text-slate-500 block">सेवा व नियम</span>
          </a>

          <a
            href="/about"
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/50 transition text-center block space-y-1 shadow-sm"
          >
            <span className="font-bold text-amber-400 block">About Us</span>
            <span className="text-[10px] text-slate-500 block">हमारे बारे में</span>
          </a>

          <a
            href="/contact"
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition text-center block space-y-1"
          >
            <span className="font-bold text-blue-400 block">Contact Us</span>
            <span className="text-[10px] text-slate-500 block">संपर्क व शिकायत</span>
          </a>

          <a
            href="/disclaimer"
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 transition text-center block space-y-1"
          >
            <span className="font-bold text-purple-400 block">Disclaimer</span>
            <span className="text-[10px] text-slate-500 block">अस्वीकरण व दायित्व</span>
          </a>
        </div>
      </div>
    </div>
  );
};
