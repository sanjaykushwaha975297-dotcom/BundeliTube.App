import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  Scale, 
  Mail, 
  ExternalLink, 
  Search, 
  Languages, 
  Printer, 
  Copy, 
  Check, 
  X, 
  ChevronRight, 
  Sparkles,
  Lock,
  Eye,
  CreditCard,
  Building2,
  Globe2,
  CheckCircle2,
  HelpCircle,
  Smartphone,
  Info
} from 'lucide-react';
import { Language } from '../locales/i18n';

export type PolicyTab = 
  | 'admob_adsense' 
  | 'bundelitube' 
  | 'invalid_traffic' 
  | 'terms' 
  | 'copyright' 
  | 'grievance';

interface PolicyCenterProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialTab?: PolicyTab;
  language: Language;
  theme?: 'dark' | 'light';
  isEmbeddedView?: boolean;
}

export const PolicyCenterModal: React.FC<PolicyCenterProps> = ({
  isOpen = true,
  onClose,
  initialTab = 'admob_adsense',
  language: initialLanguage,
  theme = 'dark',
  isEmbeddedView = false
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);
  const [docLanguage, setDocLanguage] = useState<Language>(initialLanguage || 'hi');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [consentPreference, setConsentPreference] = useState<'personalized' | 'non_personalized'>('personalized');

  const isLight = theme === 'light';

  // Quick section copy handler
  const handleCopySection = (title: string, text: string) => {
    navigator.clipboard.writeText(`${title}\n\n${text}`);
    setCopiedSection(title);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const tabsConfig = useMemo(() => [
    {
      id: 'admob_adsense' as PolicyTab,
      labelHi: 'Google AdMob व AdSense गोपनीयता नीति',
      labelEn: 'AdMob & AdSense Privacy Policy',
      shortLabelHi: 'AdSense व AdMob',
      shortLabelEn: 'AdSense & AdMob',
      icon: ShieldCheck,
      badgeHi: 'Google अनुमोदित',
      badgeEn: 'Google Compliant',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'bundelitube' as PolicyTab,
      labelHi: 'बुन्देली ट्यूब क्रिएटर व अर्निंग नीति',
      labelEn: 'BundeliTube Creator & Monetization Policy',
      shortLabelHi: 'बुन्देली ट्यूब नीति',
      shortLabelEn: 'BundeliTube Policy',
      icon: DollarSign,
      badgeHi: '50-50 राजस्व विभाजन',
      badgeEn: '50/50 Revenue Split',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
    },
    {
      id: 'invalid_traffic' as PolicyTab,
      labelHi: 'अमान्य ट्रैफ़िक व प्रकाशक नीति (Anti-Fraud)',
      labelEn: 'Invalid Traffic & Publisher Policy',
      shortLabelHi: 'अमान्य ट्रैफ़िक नीति',
      shortLabelEn: 'Anti-Fraud Policy',
      icon: AlertTriangle,
      badgeHi: 'सख्त नियम',
      badgeEn: 'Strict Zero Tolerance',
      badgeColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
    },
    {
      id: 'terms' as PolicyTab,
      labelHi: 'उपयोग की शर्तें (Terms of Service)',
      labelEn: 'Terms of Service',
      shortLabelHi: 'सेवा शर्तें',
      shortLabelEn: 'Terms of Service',
      icon: Scale,
      badgeHi: 'कानूनी समझौता',
      badgeEn: 'User Agreement',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
    },
    {
      id: 'copyright' as PolicyTab,
      labelHi: 'कॉपीराइट व बौद्धिक संपदा नीति (DMCA)',
      labelEn: 'Copyright & IP Policy (DMCA)',
      shortLabelHi: 'कॉपीराइट नीति',
      shortLabelEn: 'Copyright Policy',
      icon: FileText,
      badgeHi: '3-स्ट्राइक नीति',
      badgeEn: '3-Strike Safe Harbor',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
    },
    {
      id: 'grievance' as PolicyTab,
      labelHi: 'शिकायत निवारण अधिकारी व संपर्क (Grievance)',
      labelEn: 'Grievance Officer & Legal Contact',
      shortLabelHi: 'शिकायत अधिकारी',
      shortLabelEn: 'Grievance Officer',
      icon: Mail,
      badgeHi: 'IT नियम 2021',
      badgeEn: 'IT Rules 2021 (India)',
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30'
    }
  ], []);

  if (!isOpen && !isEmbeddedView) return null;

  return (
    <div className={isEmbeddedView ? 'w-full' : 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn'}>
      <div 
        className={`${
          isEmbeddedView 
            ? 'w-full rounded-3xl border shadow-xl' 
            : 'w-full max-w-6xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col my-auto'
        } ${
          isLight 
            ? 'bg-white text-slate-800 border-slate-200' 
            : 'bg-slate-900 text-slate-100 border-slate-800'
        } overflow-hidden transition-colors`}
      >
        {/* Header Bar */}
        <div className={`p-4 sm:p-6 border-b ${isLight ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800 bg-slate-950/70'} flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  {docLanguage === 'hi' ? 'बुन्देली ट्यूब नीति एवं कानूनी केंद्र' : 'BundeliTube Legal & Policy Center'}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  AdMob & AdSense Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {docLanguage === 'hi' 
                  ? 'Google AdSense, AdMob दिशानिर्देश, क्रिएटर 50-50 अर्निंग नीति, नियम व शिकायत निवारण'
                  : 'Fully compliant with Google Publisher Policies, AdMob, AdSense, Indian IT Rules 2021 & Creator Terms'}
              </p>
            </div>
          </div>

          {/* Quick Actions: Language Toggle, Print, Close */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Language Switcher */}
            <button
              onClick={() => setDocLanguage(prev => prev === 'hi' ? 'en' : 'hi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title="Toggle Hindi/English Language"
            >
              <Languages className="w-3.5 h-3.5 text-amber-500" />
              <span>{docLanguage === 'hi' ? 'English में पढ़ें' : 'हिन्दी में पढ़ें'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className={`p-2 rounded-xl border text-xs cursor-pointer transition ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>

            {!isEmbeddedView && onClose && (
              <button
                onClick={onClose}
                className={`p-2 rounded-xl border text-xs cursor-pointer transition ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Pill Strip */}
        <div className={`p-2 sm:px-6 sm:py-3 border-b ${isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'} overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0`}>
          {tabsConfig.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : isLight
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-500'}`} />
                <span>{docLanguage === 'hi' ? tab.shortLabelHi : tab.shortLabelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Search within policy banner */}
        <div className={`px-4 sm:px-6 py-2.5 border-b ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-850 bg-slate-950/40'} flex items-center justify-between gap-3 shrink-0`}>
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={docLanguage === 'hi' ? 'नीतियों में खोजें (जैसे: AdMob, PAN, पेआउट, कुकीज़, ₹5,000)...' : 'Search in policies (e.g., AdMob, PAN, payout, cookies, ₹5,000)...'}
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                isLight 
                  ? 'bg-white border-slate-200 text-slate-800' 
                  : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                ×
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-2">
            <span>अंतिम अद्यतन (Last Updated): <strong>08 सितम्बर 2026</strong></span>
            <span>•</span>
            <span className="text-emerald-500 font-semibold">संस्करण v2.6.4</span>
          </div>
        </div>

        {/* Body Content: Scrollable */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-sm leading-relaxed">

          {/* ========================================================= */}
          {/* TAB 1: GOOGLE ADMOB & ADSENSE COMPLIANT PRIVACY POLICY    */}
          {/* ========================================================= */}
          {activeTab === 'admob_adsense' && (
            <div className="space-y-6">
              {/* Official AdSense & AdMob Compliance Notice Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                    <span>{docLanguage === 'hi' ? 'Google AdSense एवं AdMob अनुपालन प्रकटीकरण' : 'Google AdSense & AdMob Compliance Disclosure'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black">Official</span>
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {docLanguage === 'hi'
                      ? 'यह गोपनीयता नीति Google AdSense (वेबसाइट प्रकाशक) और Google AdMob (मोबाइल एप्लिकेशन नेटवर्क) की सभी औपचारिक नीतियों, कुकी दिशानिर्देशों, COPPA, GDPR और CCPA का शत-प्रतिशत पालन करती है। हमारी वेबसाइट व ऐप दोनों के माध्यम से उपयोगकर्ताओं के अधिकारों और विज्ञापन पारदर्शिता की पूर्ण सुरक्षा सुनिश्चित की जाती है।'
                      : 'This Privacy Policy strictly adheres to Google AdSense (Website Publisher Policies) and Google AdMob (Mobile App Network Guidelines), covering third-party advertising cookies, COPPA, GDPR, and CCPA disclosures. We ensure complete transparency and user privacy for both mobile apps and web platforms.'}
                  </p>
                </div>
              </div>

              {/* Section 1: Third-Party Advertising & Cookies */}
              <div className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'} space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-amber-500 flex items-center gap-2">
                    <Globe2 className="w-4 h-4" />
                    <span>1. {docLanguage === 'hi' ? 'तृतीय-पक्ष विक्रेता और Google कुकी नीति (Third-Party Vendors & Cookies)' : 'Third-Party Vendors & Google Cookies'}</span>
                  </h3>
                  <button 
                    onClick={() => handleCopySection('Third-Party Advertising & Cookies', 'Google uses cookies to serve ads based on prior visits...')}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'Third-Party Advertising & Cookies' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'Third-Party Advertising & Cookies' ? 'कॉपी हुआ' : 'कॉपी करें'}</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300">
                  <p>
                    {docLanguage === 'hi'
                      ? '• तृतीय-पक्ष विक्रेता, जिसमें Google भी शामिल है, उपयोगकर्ता द्वारा हमारी वेबसाइट (BundeliTube) या इंटरनेट पर अन्य वेबसाइटों पर पहले की गई विज़िट के आधार पर विज्ञापन परोसने के लिए कुकीज़ (Cookies) और विज्ञापन पहचानकर्ताओं (Google Advertising ID / AAID) का उपयोग करते हैं।'
                      : '• Third-party vendors, including Google, use cookies and mobile advertising identifiers (such as Google Advertising ID / AAID on Android or IDFA on iOS) to serve ads based on a user\'s prior visits to BundeliTube or other websites across the Internet.'}
                  </p>
                  <p>
                    {docLanguage === 'hi'
                      ? '• Google द्वारा विज्ञापन कुकीज़ (DoubleClick DART Cookie) का उपयोग उसे और उसके सहयोगियों को हमारी वेबसाइट या इंटरनेट पर अन्य साइटों पर आपकी विज़िट के आधार पर व्यक्तिगत विज्ञापन (Personalized Ads) दिखाने में सक्षम बनाता है।'
                      : '• Google\'s use of advertising cookies (including the DoubleClick DART cookie) enables it and its partners to serve personalized advertisements to you based on your visits to our site and/or other sites across the Internet.'}
                  </p>
                  <p>
                    {docLanguage === 'hi'
                      ? '• उपयोगकर्ता Google विज्ञापन सेटिंग्स में जाकर व्यक्तिगत विज्ञापन (Personalized Advertising) को किसी भी समय बंद (Opt-Out) कर सकते हैं:'
                      : '• Users may opt out of personalized advertising at any time by visiting Google Ad Settings:'}
                  </p>

                  <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-amber-500 block">Google Ads Settings Link:</span>
                      <a 
                        href="https://www.google.com/settings/ads" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        https://www.google.com/settings/ads
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 block text-[11px]">Network Advertising Initiative:</span>
                      <a 
                        href="https://www.aboutads.info/choices" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        www.aboutads.info
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Mobile App AdMob Specific Identifiers */}
              <div className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'} space-y-4`}>
                <h3 className="text-base font-bold text-amber-500 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>2. {docLanguage === 'hi' ? 'Google AdMob व मोबाइल विज्ञापन पहचानकर्ता' : 'Google AdMob & Mobile Advertising Identifiers'}</span>
                </h3>

                <div className="space-y-3 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300">
                  <p>
                    {docLanguage === 'hi'
                      ? 'हमारी मोबाइल एप्लिकेशन Google Mobile Ads SDK (AdMob) का उपयोग करती है। AdMob द्वारा बैनर, इंटरस्टीशियल, या वीडियो विज्ञापनों को लोड करने के लिए Google Play Services Advertising ID (AAID) का उपयोग केवल प्रासंगिक और सुरक्षित विज्ञापन प्रदान करने तथा धोखाधड़ी का पता लगाने के लिए किया जाता है।'
                      : 'Our mobile application utilizes the Google Mobile Ads SDK (AdMob). AdMob may access the Google Play Services Advertising ID (AAID) or IDFA to serve contextual or personalized banners, interstitial, and rewarded video ads, measure ad performance, and prevent fraudulent click activity.'}
                  </p>
                  <p>
                    {docLanguage === 'hi'
                      ? 'आप अपने मोबाइल डिवाइस की सेटिंग्स (Settings > Google > Ads) में जाकर कभी भी अपनी विज्ञापन आईडी को रीसेट (Reset Advertising ID) या डिलीट कर सकते हैं।'
                      : 'You can reset or delete your Advertising ID anytime by navigating to your Android device Settings > Google > Ads > Reset or Delete Advertising ID.'}
                  </p>
                </div>
              </div>

              {/* Section 3: Information We Collect */}
              <div className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'} space-y-4`}>
                <h3 className="text-base font-bold text-amber-500 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>3. {docLanguage === 'hi' ? 'हम कौन-सी जानकारी एकत्र करते हैं? (Information Collected)' : 'Information We Collect'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-amber-500 block mb-1">अकाउंट व प्रोफाइल जानकारी (Account Data)</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      उपयोगकर्ता का नाम, Google ईमेल, प्रोफ़ाइल फ़ोटो और चैनल मेटाडेटा जब आप Google Sign-in के ज़रिए खाता बनाते हैं।
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-amber-500 block mb-1">क्रिएटर सत्यापन व पैन (Creator KYC)</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      क्रिएटर चैनल और अर्निंग वॉलेट के लिए केवल पैन कार्ड नंबर, पैन धारक का नाम, पैन फोटो और मोबाइल नंबर लिया जाता है जो एन्क्रिप्टेड सुरक्षित रहता है।
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-amber-500 block mb-1">लॉग डेटा व डिवाइस जानकारी (Log Data)</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      IP पता, ब्राउज़र प्रकार, डिवाइस का प्रकार, ऑपरेटिंग सिस्टम, पृष्ठ देखने का समय, और वीडियो देखने का इतिहास।
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-amber-500 block mb-1">सुरक्षित क्लाउड स्टोरेज (Cloud Storage)</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      सभी डेटा Firebase Firestore एवं Google Cloud पर उच्च सुरक्षा प्रोटोकॉल (TLS 1.3 / SSL) के तहत सुरक्षित रखा जाता है।
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: GDPR, CCPA & COPPA Disclosures */}
              <div className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'} space-y-4`}>
                <h3 className="text-base font-bold text-amber-500 flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  <span>4. {docLanguage === 'hi' ? 'अंतर्राष्ट्रीय गोपनीयता अधिकार (GDPR, CCPA व COPPA)' : 'International Privacy Rights (GDPR, CCPA & COPPA)'}</span>
                </h3>

                <div className="space-y-3 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                      🇪🇺 GDPR (General Data Protection Regulation - यूरोपियन संघ):
                    </span>
                    <p className="text-slate-600 dark:text-slate-400">
                      यूरोपियन आर्थिक क्षेत्र (EEA) के उपयोगकर्ताओं को अपना डेटा देखने, सुधारने, मिटाने (Right to be Forgotten), और सहमति वापस लेने का पूर्ण कानूनी अधिकार है। हम EU User Consent Policy का पूरी तरह पालन करते हैं।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                      🇺🇸 CCPA / CPRA (California Consumer Privacy Act - कैलिफ़ोर्निया):
                    </span>
                    <p className="text-slate-600 dark:text-slate-400">
                      हम कभी भी किसी भी उपयोगकर्ता का व्यक्तिगत डेटा किसी तीसरे पक्ष को बेचते नहीं हैं ("We Do Not Sell or Share Personal Information")। कैलिफ़ोर्निया निवासी अपने डेटा विवरण के बारे में कभी भी संपर्क कर सकते हैं।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                      👶 COPPA (Children\'s Online Privacy Protection Act - बच्चों की सुरक्षा):
                    </span>
                    <p className="text-slate-600 dark:text-slate-400">
                      बुन्देली ट्यूब 13 वर्ष से कम आयु के बच्चों से जानबूझकर कोई भी व्यक्तिगत डेटा एकत्र नहीं करता है। यदि कोई अभिभावक पाते हैं कि उनके बच्चे ने बिना सहमति डेटा दिया है, तो वे तुरंत हमारे शिकायत अधिकारी से संपर्क कर डेटा हटवा सकते हैं।
                    </p>
                  </div>
                </div>
              </div>

              {/* User Consent Toggle Demo */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {docLanguage === 'hi' ? 'आपकी विज्ञापन सहमति प्राथमिकता (Your Ad Consent Preference):' : 'Your Advertising Consent Preference:'}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {consentPreference === 'personalized'
                      ? (docLanguage === 'hi' ? 'व्यक्तिगत विज्ञापन सक्रिय हैं (Google Cookies enabled)' : 'Personalized Ads are active (Standard Experience)')
                      : (docLanguage === 'hi' ? 'केवल सामान्य/गैर-व्यक्तिगत विज्ञापन सक्रिय हैं (Non-personalized only)' : 'Non-personalized Ads only')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConsentPreference('personalized')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      consentPreference === 'personalized'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Personalized
                  </button>
                  <button
                    onClick={() => setConsentPreference('non_personalized')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      consentPreference === 'non_personalized'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Non-Personalized
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: BUNDELITUBE SPECIFIC CREATOR & MONETIZATION POLICY */}
          {/* ========================================================= */}
          {activeTab === 'bundelitube' && (
            <div className="space-y-6">
              {/* Special Header Box for BundeliTube */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xl shrink-0 shadow-lg shadow-amber-500/20">
                  ₹
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-amber-500">
                      {docLanguage === 'hi' ? 'बुन्देली ट्यूब विशेष क्रिएटर व अर्निंग नीति (Creator Monetization Policy)' : 'BundeliTube Official Creator Monetization Policy'}
                    </h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black uppercase tracking-wider">
                      50% - 50% Split
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {docLanguage === 'hi'
                      ? 'बुन्देली ट्यूब बुंदेलखंड के लोक कलाकारों, गायकों, राई नर्तकों और वीडियो निर्माताओं को सीधे डिजिटल कमाई प्रदान करता है। यह नीति हमारे 50-50 राजस्व विभाजन, ₹5,000 न्यूनतम निकासी, पैन व मोबाइल सत्यापन तथा 1 से 5 तारीख की एडमिन-नियंत्रित पेआउट खिड़की को पारदर्शी रूप से परिभाषित करती है।'
                      : 'BundeliTube empowers folk artists, singers, and video creators across Bundelkhand with direct digital earnings. This policy formally defines our 50/50 ad revenue split, ₹5,000 minimum payout threshold, PAN/Mobile KYC requirements, and 1st to 5th monthly payout schedules.'}
                  </p>
                </div>
              </div>

              {/* 1. Revenue Share Model */}
              <div className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'} space-y-4`}>
                <h4 className="text-base font-bold text-amber-500 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>1. {docLanguage === 'hi' ? '50% - 50% राजस्व विभाजन मॉडल (Fair Revenue Share)' : '50% - 50% Revenue Share Model'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-500 text-sm">50% क्रिएटर का हिस्सा (Creator Share)</span>
                      <span className="font-black text-amber-400 text-lg">50%</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      आपके वीडियो पर आने वाले सभी वास्तविक व्यूज, इन-स्ट्रीम विज्ञापनों और नीचे लगे AdMob/AdSense बैनर विज्ञापनों से होने वाली शुद्ध कमाई का 50% सीधा आपके क्रिएटर वॉलेट में जुड़ता है।
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">50% प्लेटफ़ॉर्म प्रबंधन (Platform Infrastructure)</span>
                      <span className="font-black text-slate-500 text-lg">50%</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      शेष 50% हिस्सा हाई-स्पीड वीडियो स्ट्रीमिंग सर्वर, क्लाउड स्टोरेज, कॉपीराइट निगरानी, पेमेंट गेटवे शुल्क और ऐप के तकनीकी रखरखाव में उपयोग होता है।
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-500" />
                    {docLanguage === 'hi' ? 'व्यूज व CPM गणना का आधार:' : 'Basis for Views and CPM Calculation:'}
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    कमाई की गणना वैध CPM (Cost Per Mille) और RPM मॉडल पर होती है। केवल वास्तविक दर्शकों द्वारा कम से कम 30 सेकंड देखे गए वीडियो या पूर्ण देखे गए शॉर्ट्स पर ही राजस्व जनरेट होता है।
                  </p>
                </div>
              </div>

              {/* 2. Mandatory KYC: PAN Card & Mobile Number */}
              <div className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'} space-y-4`}>
                <h4 className="text-base font-bold text-amber-500 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>2. {docLanguage === 'hi' ? 'अनिवार्य क्रिएटर पहचान व पैन सत्यापन (Mandatory KYC)' : 'Mandatory Creator KYC & Verification'}</span>
                </h4>

                <div className="space-y-3 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300">
                  <p>
                    {docLanguage === 'hi'
                      ? 'भारत सरकार के आयकर नियमों और वित्तीय पारदर्शिता को बनाए रखने के लिए प्रत्येक बुन्देली ट्यूब क्रिएटर के लिए चैनल बनाते समय निम्नलिखित विवरण प्रस्तुत करना अनिवार्य है:'
                      : 'In accordance with Indian tax guidelines and financial integrity, every creator must furnish verifiable KYC details before their channel is approved:'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">पैन कार्ड धारक का नाम (Legal Name)</span>
                        <span className="text-[11px] text-slate-500">पैन कार्ड और बैंक खाते के अनुसार समान नाम</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">पैन नंबर (10-Digit Valid PAN)</span>
                        <span className="text-[11px] text-slate-500">मान्य अल्फ़ान्यूमेरिक 10 अंकों का पैन</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">पैन कार्ड की साफ़ फ़ोटो (PAN Card Photo)</span>
                        <span className="text-[11px] text-slate-500">सत्यापन हेतु भौतिक पैन की स्पष्ट छवि</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">सक्रिय मोबाइल नंबर (10-Digit Mobile)</span>
                        <span className="text-[11px] text-slate-500">एसएमएस, ओटीपी व पेआउट सूचना के लिए</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                    ⚠️ <strong>सख्त एडमिन समीक्षा:</strong> चैनल सबमिट करने के बाद आपका आवेदन 'Under Review' रहता है। एडमिन द्वारा पैन और विवरण सत्यापित होने के बाद ही स्टूडियो में अपलोड की अनुमति मिलती है।
                  </div>
                </div>
              </div>

              {/* 3. Payout Threshold & Calendar */}
              <div className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'} space-y-4`}>
                <h4 className="text-base font-bold text-amber-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>3. {docLanguage === 'hi' ? 'पेआउट सीमा व मासिक निकासी विंडो (Payout Window)' : 'Payout Threshold & Monthly Schedule'}</span>
                </h4>

                <div className="space-y-3 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 text-[11px] uppercase tracking-wider block">न्यूनतम निकासी सीमा (MINIMUM THRESHOLD)</span>
                      <span className="text-xl font-black text-emerald-500 font-mono mt-0.5 block">₹5,000</span>
                      <p className="text-slate-500 text-[11px] mt-1">
                        {docLanguage === 'hi' 
                          ? 'जब आपके वॉलेट का स्वीकृत बैलेंस कम से कम ₹5,000 होगा, तभी निकासी का अनुरोध किया जा सकता है।'
                          : 'Withdrawal can only be requested once your approved wallet balance reaches at least ₹5,000.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 text-[11px] uppercase tracking-wider block">मासिक पेआउट विंडो (MONTHLY PAYOUT DATES)</span>
                      <span className="text-xl font-black text-amber-500 font-mono mt-0.5 block">1 से 5 तारीख</span>
                      <p className="text-slate-500 text-[11px] mt-1">
                        {docLanguage === 'hi'
                          ? 'हर महीने की 1 से 5 तारीख के बीच पेआउट विंडो उपलब्ध होती है और सत्यापित क्रिएटर पेआउट सीधे बैंक ट्रांसफर (NEFT/IMPS) या UPI द्वारा भेजे जाते हैं।'
                          : 'Payout requests are available strictly between 1st and 5th of every month, directly deposited to verified Bank or UPI.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                      <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{docLanguage === 'hi' ? 'एडमिन मैन्युअल कंट्रोल नियम (Admin Manual Control)' : 'Admin Manual Control Policy'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {docLanguage === 'hi'
                        ? 'निकासी विंडो पूर्णतः एडमिन के नियंत्रण में है। एडमिन प्रत्येक माह की 1 तारीख को Firebase / एडमिन सिस्टम से इसे मैन्युअल रूप से अनलॉक (Open) करता है, तथा 6 तारीख को इसे लॉक (Band) कर देता है। विंडो 1 से 5 तारीख के मध्य ही केवल एडमिन की अनुमति से सक्रिय होगी।'
                        : 'The withdrawal window is under manual admin control via Firebase. The admin manually unlocks it on the 1st of the month and locks it on the 6th. Payout requests are valid only between 1st and 5th when unlocked by Admin.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Cultural Guidelines of Bundelkhand */}
              <div className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'} space-y-4`}>
                <h4 className="text-base font-bold text-amber-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>4. {docLanguage === 'hi' ? 'बुंदेलखंडी लोक संस्कृति संरक्षण दिशानिर्देश' : 'Bundelkhand Cultural Heritage Guidelines'}</span>
                </h4>

                <div className="space-y-2 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300">
                  <p>
                    बुन्देली ट्यूब का मुख्य उद्देश्य बुंदेलखंड की ऐतिहासिक धरोहर, संगीत, राई, आल्हा, फाग, लमटेरा, दीवारी, नौटंकी और क्षेत्रीय लोककला को वैश्विक पटल पर प्रस्तुत करना है:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                    <li>कलाकारों व लोक गायकों का सम्मान सर्वोपरि है।</li>
                    <li>अश्लीलता, अभद्र भाषा या बुन्देली संस्कृति का अपमान करने वाले वीडियो पूर्णतः प्रतिबंधित हैं।</li>
                    <li>धार्मिक या सामाजिक वैमनस्य फैलाने वाले वीडियो पर तुरंत चैनल निष्कासन (Permanent Ban) किया जाएगा।</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: INVALID TRAFFIC & GOOGLE PUBLISHER POLICY (FRAUD) */}
          {/* ========================================================= */}
          {activeTab === 'invalid_traffic' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                    <span>{docLanguage === 'hi' ? 'अमान्य ट्रैफ़िक और क्लिक धोखाधड़ी पर शून्य सहनशीलता (Zero Tolerance)' : 'Zero Tolerance for Invalid Traffic & Click Fraud'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white font-bold">Strict</span>
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Google AdSense और AdMob दोनों ही विज्ञापनदाताओं के हितों की रक्षा के लिए अमान्य ट्रैफ़िक (Invalid Activity) पर कड़े प्रतिबंध लगाते हैं। बुन्देली ट्यूब पर किसी भी प्रकार के कृत्रिम व्यूज या क्लिक की अनुमति नहीं है।
                  </p>
                </div>
              </div>

              <div className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'} space-y-4`}>
                <h3 className="text-base font-bold text-red-500 flex items-center gap-2">
                  <X className="w-4 h-4" />
                  <span>{docLanguage === 'hi' ? 'क्या पूर्णतः प्रतिबंधित है? (Strictly Prohibited Activities)' : 'Strictly Prohibited Activities'}</span>
                </h3>

                <div className="space-y-3 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-red-500 block">1. स्वयं के विज्ञापनों पर क्लिक करना (Self-Clicking):</span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      क्रिएटर या उनके प्रतिनिधि द्वारा अपने स्वयं के वीडियो पर दिखने वाले विज्ञापनों पर क्लिक करना पूर्णतः गैरकानूनी है।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-red-500 block">2. क्लिक करने के लिए प्रेरित करना (Incentivized Clicking):</span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      मित्रों, परिवार या सोशल मीडिया फ़ॉलोअर्स से "विज्ञापन पर क्लिक करें ताकि मुझे कमाई हो" कहना Google AdSense/AdMob नीति का सीधा उल्लंघन है।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-red-500 block">3. बॉट, स्वचालित स्क्रिप्ट व ट्रैफ़िक एक्सचेंज (Bots & Auto-Traffic):</span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      स्वचालित बॉट्स, क्लिक फ़ार्म, VPN/प्रॉक्सी, ऑटो-रिफ्रेशिंग स्क्रिप्ट या थर्ड पार्टी पेड व्यूज सेवाओं का उपयोग प्रतिबंधित है।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-red-500 block">4. विज्ञापन प्लेसमेंट नीति (Ad Placement Guidelines):</span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      विज्ञापन कभी भी वीडियो प्लेयर के कंट्रोल्स को नहीं छिपाते, न ही आकस्मिक क्लिक (Accidental Clicks) के लिए रखे जाते हैं। प्रत्येक विज्ञापन पर 'Sponsored' या 'विज्ञापन' का स्पष्ट लेबल होता है।
                    </p>
                  </div>
                </div>
              </div>

              {/* Consequence of Violation */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                <span className="font-bold text-amber-400 text-sm block">उल्लंघन की स्थिति में दंडात्मक कार्रवाई:</span>
                <p>
                  यदि कोई क्रिएटर या उपयोगकर्ता अमान्य गतिविधि में लिप्त पाया जाता है, तो:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
                  <li>क्रिएटर की सभी लंबित कमाई तत्काल प्रभाव से निरस्त (Forfeited) कर दी जाएगी।</li>
                  <li>क्रिएटर का चैनल और खाता हमेशा के लिए स्थायी रूप से निलंबित (Permanently Banned) कर दिया जाएगा।</li>
                  <li>उक्त खाते के विरुद्ध Google AdSense/AdMob को अमान्य ट्रैफ़िक रिपोर्ट प्रस्तुत की जाएगी।</li>
                </ul>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: TERMS OF SERVICE (सेवा की शर्तें)                   */}
          {/* ========================================================= */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'} space-y-4`}>
                <h3 className="text-base font-bold text-amber-500 flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  <span>{docLanguage === 'hi' ? 'बुन्देली ट्यूब सेवा की शर्तें (Terms of Service)' : 'BundeliTube Terms of Service'}</span>
                </h3>

                <div className="space-y-3 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300">
                  <p>
                    <strong>1. सेवा की स्वीकृति (Acceptance):</strong> बुन्देली ट्यूब (वेबसाइट अथवा मोबाइल एप्लिकेशन) का उपयोग करके आप इन कानूनी शर्तों, गोपनीयता नीति और कम्युनिटी दिशानिर्देशों से बाध्य होने के लिए सहमति प्रदान करते हैं।
                  </p>
                  <p>
                    <strong>2. उपयोगकर्ता आचरण (User Conduct):</strong> उपयोगकर्ता किसी भी अवैध, अश्लील, मानहानिकारक, कॉपीराइट उल्लंघन करने वाले अथवा दुर्भावनापूर्ण सॉफ़्टवेयर प्रसारित करने वाली सामग्री को अपलोड नहीं करेंगे।
                  </p>
                  <p>
                    <strong>3. बौद्धिक संपदा लाइसेंस (License Grant):</strong> क्रिएटर अपने मूल वीडियो का कॉपीराइट स्वयं रखते हैं, परंतु बुन्देली ट्यूब पर अपलोड करके वे प्लेटफ़ॉर्म को वीडियो को स्ट्रीम, इंडेक्स और विश्वभर में प्रदर्शित करने का गैर-विशिष्ट, रॉयल्टी-मुक्त लाइसेंस प्रदान करते हैं।
                  </p>
                  <p>
                    <strong>4. खाता समाप्ति (Termination):</strong> बुन्देली ट्यूब प्रशासन को किसी भी समय, बिना पूर्व सूचना के, किसी भी ऐसे खाते या चैनल को निलंबित या समाप्त करने का अधिकार है जो नियमों का उल्लंघन करता हो।
                  </p>
                  <p>
                    <strong>5. क्षेत्राधिकार व कानून (Governing Law):</strong> यह अनुबंध भारत गणराज्य के कानूनों के अधीन रहेगा। किसी भी विवाद का निपटारा मध्य प्रदेश / उत्तर प्रदेश (बुंदेलखंड परिक्षेत्र) स्थित न्यायालयों के अनन्य क्षेत्राधिकार में होगा।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: COPYRIGHT & DMCA POLICY                            */}
          {/* ========================================================= */}
          {activeTab === 'copyright' && (
            <div className="space-y-6">
              <div className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'} space-y-4`}>
                <h3 className="text-base font-bold text-amber-500 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{docLanguage === 'hi' ? 'कॉपीराइट नीति व 3-स्ट्राइक नियम (Copyright & DMCA)' : 'Copyright & Intellectual Property Policy'}</span>
                </h3>

                <div className="space-y-3 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300">
                  <p>
                    बुन्देली ट्यूब भारतीय कॉपीराइट अधिनियम, 1957 और सूचना प्रौद्योगिकी अधिनियम, 2000 की धारा 79 (मध्यवर्ती संरक्षण / Safe Harbor) का पूर्णतः पालन करता है।
                  </p>

                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                    <span className="font-bold text-purple-600 dark:text-purple-400 text-xs block">
                      3-स्ट्राइक चैनल निष्कासन नीति (Three-Strike Rule):
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      यदि किसी चैनल पर तीन (3) प्रमाणित कॉपीराइट स्ट्राइक प्राप्त होती हैं, तो उस चैनल को बिना किसी चेतावनी के तत्काल स्थायी रूप से हटा दिया जाएगा तथा उसका क्रिएटर वॉलेट फ्रीज कर दिया जाएगा।
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                      कॉपीराइट शिकायत कैसे दर्ज करें? (How to Report):
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      यदि आप कॉपीराइट धारक हैं और पाते हैं कि आपका संगीत या वीडियो बिना अनुमति के अपलोड किया गया है, तो आप वीडियो प्लेयर के 'कॉपीराइट रिपोर्ट' बटन से या सीधे हमारे ईमेल पर कानूनी सूचना भेज सकते हैं:
                    </p>
                    <div className="font-mono text-xs text-amber-500 bg-slate-950 p-2.5 rounded-lg border border-slate-800 inline-block">
                      Email: sanjaykushwaha975297@gmail.com
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: GRIEVANCE REDRESSAL OFFICER & LEGAL CONTACT        */}
          {/* ========================================================= */}
          {activeTab === 'grievance' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2">
                    <span>{docLanguage === 'hi' ? 'वैधानिक शिकायत निवारण अधिकारी (Grievance Officer)' : 'Statutory Grievance Redressal Officer'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500 text-slate-950 font-bold">Rule 3(2) IT Rules 2021</span>
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    भारत के सूचना प्रौद्योगिकी (मध्यवर्ती दिशानिर्देश एवं डिजिटल मीडिया आचार संहिता) नियम, 2021 के अनुपालन में हमारे नामित शिकायत अधिकारी का विवरण निम्नानुसार है:
                  </p>
                </div>
              </div>

              <div className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'} space-y-4`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[11px] block">अधिकारी का नाम (Officer Name):</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">संजय कुशवाहा (Sanjay Kushwaha)</span>
                    <span className="text-amber-500 text-[11px] block">मुख्य शिकायत निवारण व सामग्री अधिकारी</span>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[11px] block">आधिकारिक संपर्क ईमेल (Official Contact Email):</span>
                    <a href="mailto:sanjaykushwaha975297@gmail.com" className="font-bold text-blue-400 hover:underline text-sm block font-mono">
                      sanjaykushwaha975297@gmail.com
                    </a>
                    <span className="text-slate-500 text-[11px] block">२४ घंटे में पावती • १५ दिनों में समाधान</span>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 sm:col-span-2">
                    <span className="text-slate-400 text-[11px] block">कार्यालय व पत्राचार पता (Headquarters / Address):</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-xs block">
                      बुन्देली ट्यूब (BundeliTube LLC), बुंदेलखंड संभाग, मध्य प्रदेश / उत्तर प्रदेश, भारत (PIN: 472001)
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">शिकायत प्रक्रिया (Grievance Procedure):</span>
                  <p className="text-[11px]">
                    1. किसी भी आपत्तिजनक वीडियो, कॉपीराइट विवाद या भुगतान समस्या के लिए उपरोक्त ईमेल पर वीडियो लिंक व संक्षिप्त विवरण भेजें।
                  </p>
                  <p className="text-[11px]">
                    2. आपकी शिकायत प्राप्त होने के २४ घंटे के भीतर आधिकारिक पावती संख्या जारी की जाएगी।
                  </p>
                  <p className="text-[11px]">
                    3. आईटी नियम 2021 के अनुसार अधिकतम १५ कार्यदिवसों के भीतर उचित जांच कर पूर्ण समाधान किया जाएगा।
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Summary Bar */}
        <div className={`p-4 sm:px-6 border-t ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0`}>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {docLanguage === 'hi' 
                ? 'यह नीति Google AdSense, AdMob और भारतीय डिजिटल मीडिया आचार संहिता 2021 के अनुरूप प्रमाणित है।' 
                : 'Fully compliant with Google AdSense, AdMob Publisher Policies, and IT Rules 2021.'}
            </span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={() => handleCopySection('BundeliTube Legal Policy', 'All policies available at BundeliTube Legal Center.')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                isLight 
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' 
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{docLanguage === 'hi' ? 'नीति लिंक साझा करें' : 'Share Policy'}</span>
            </button>

            {!isEmbeddedView && onClose && (
              <button
                onClick={onClose}
                className="px-5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-amber-500/20 transition"
              >
                {docLanguage === 'hi' ? 'समझ गया / ठीक है' : 'I Understand'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
