import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  IndianRupee, 
  TrendingUp, 
  QrCode, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight,
  Flame,
  Zap,
  Target,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Video, PromotionPackage, VideoPromotionCampaign } from '../types';
import { Language, translations } from '../locales/i18n';

interface PromoteVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video | null;
  language: Language;
  onPromotionSubmitted: (campaign: VideoPromotionCampaign) => void;
}

export const PROMOTION_PACKAGES: PromotionPackage[] = [
  {
    id: 'starter_boost',
    name: 'Starter Regional Boost',
    hindiName: 'शुरुआती बुंदेली बूस्ट',
    targetImpressions: 25000,
    estimatedViews: '3,000 - 5,000+',
    price: 499,
    durationDays: 3,
    badge: 'लोकप्रिय (Popular)',
    placementType: 'top_feed'
  },
  {
    id: 'trending_ignite',
    name: 'Trending Viral Push',
    hindiName: 'ट्रेंडिंग वायरल पुश',
    targetImpressions: 75000,
    estimatedViews: '10,000 - 15,000+',
    price: 1199,
    durationDays: 7,
    badge: 'सर्वश्रेष्ठ परिणाम (Best Value)',
    placementType: 'all_round'
  },
  {
    id: 'super_hit_mega',
    name: 'Bundelkhand Mega Hit',
    hindiName: 'बुंदेलखंड मेगा स्टार',
    targetImpressions: 200000,
    estimatedViews: '30,000 - 50,000+',
    price: 2799,
    durationDays: 14,
    badge: 'मेगा स्टार (Super Hit)',
    placementType: 'all_round'
  }
];

export const PromoteVideoModal: React.FC<PromoteVideoModalProps> = ({
  isOpen,
  onClose,
  video,
  language,
  onPromotionSubmitted
}) => {
  const [selectedPackage, setSelectedPackage] = useState<PromotionPackage>(PROMOTION_PACKAGES[0]);
  const [step, setStep] = useState<'select' | 'payment' | 'confirmation'>('select');
  const [utrNumber, setUtrNumber] = useState('');
  const [senderName, setSenderName] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Admin Direct Payout Receiving Details
  const ADMIN_UPI_ID = 'bundeliadmin@sbi';
  const ADMIN_ACCOUNT_NAME = 'BundeliTube Official Admin';

  if (!isOpen || !video) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(ADMIN_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProceedToPayment = () => {
    setStep('payment');
    setErrorMsg('');
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || utrNumber.trim().length < 8) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया वैध 12-अंकों का UPI Transaction ID / UTR नंबर दर्ज करें।'
          : 'Please enter a valid 12-digit UPI Transaction ID / UTR number.'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newCampaign: VideoPromotionCampaign = {
        id: `promo-${Date.now()}`,
        videoId: video.id,
        videoTitle: video.title,
        videoThumbnail: video.thumbnail,
        channelId: video.channelId,
        channelName: video.channelName,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        targetImpressions: selectedPackage.targetImpressions,
        deliveredImpressions: 0,
        amountPaid: selectedPackage.price,
        paymentMethod: 'UPI',
        paymentReferenceUtr: utrNumber.trim(),
        adminUpiId: ADMIN_UPI_ID,
        status: 'pending_admin_approval',
        createdAt: new Date().toISOString()
      };

      onPromotionSubmitted(newCampaign);
      setIsSubmitting(false);
      setStep('confirmation');
    }, 800);
  };

  const handleCloseAndReset = () => {
    setStep('select');
    setUtrNumber('');
    setSenderName('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                <span>{language === 'hi' ? 'वीडियो प्रमोट करें (Promote Video)' : 'Promote Video Campaign'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 font-mono">
                  Guaranteed Reach
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'अपने वीडियो पर दर्शक और इम्प्रेशन्स बढ़ाएं'
                  : 'Boost impressions and views across Bundelkhand feed'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseAndReset}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Video Snapshot Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <img
              src={video.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80'}
              alt={video.title}
              className="w-20 h-12 object-cover rounded-xl shrink-0 border border-slate-800"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{video.title}</h4>
              <p className="text-[11px] text-slate-400 font-medium">
                {video.channelName} • <span className="text-amber-400">{video.views.toLocaleString('en-IN')} Views</span>
              </p>
            </div>
          </div>

          {/* STEP 1: SELECT PROMOTION PACKAGE */}
          {step === 'select' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {language === 'hi' ? '1. प्रमोशन पैकेज चुनें' : '1. Select Promotion Package'}
                </span>
                <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>100% Verified Reach</span>
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {PROMOTION_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackage.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50 shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-100">
                              {language === 'hi' ? pkg.hindiName : pkg.name}
                            </h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                              {pkg.badge}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="text-emerald-400 font-bold font-mono">
                              🎯 {pkg.targetImpressions.toLocaleString('en-IN')} Guaranteed Impressions
                            </span>
                            <span>•</span>
                            <span className="text-slate-300">
                              🔥 {pkg.estimatedViews} अनुमानित व्यूज
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black text-amber-400 font-mono">
                            ₹{pkg.price}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{pkg.durationDays} Days</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* How it works info box */}
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-blue-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'hi' ? 'यह कैसे काम करता है?' : 'How Promotion Works:'}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {language === 'hi'
                    ? '1. आप पैकेज चुनकर सीधे एडमिन के UPI पर सुरक्षित भुगतान करते हैं।\n2. एडमिन भुगतान की पुष्टि करके आपकी वीडियो को मुख्य होम स्क्रीन, सर्च और सजेशन में इम्प्रेशन्स देता है।'
                    : '1. Select package and pay directly to official Admin UPI account.\n2. Admin verifies the UTR and injects high-priority impressions into Bundeli feed.'}
                </p>
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <span>{language === 'hi' ? `आगे बढ़ें (भुगतान: ₹${selectedPackage.price})` : `Proceed to Payment (₹${selectedPackage.price})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: ADMIN PAYMENT & UTR SUBMISSION */}
          {step === 'payment' && (
            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {language === 'hi' ? '2. एडमिन के खाते में UPI भुगतान करें' : '2. Pay Directly to Admin UPI'}
                </span>
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  {language === 'hi' ? 'पैकेज बदलें' : 'Change Package'}
                </button>
              </div>

              {/* Amount & Admin UPI Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">कुल देय राशि (Amount Payable):</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">₹{selectedPackage.price}.00</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">आधिकारिक एडमिन UPI ID</span>
                      <span className="text-sm font-mono font-bold text-amber-400">{ADMIN_UPI_ID}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>कॉपी हो गया</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>UPI कॉपी करें</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 font-medium">
                    खाताधारक: <strong className="text-slate-200">{ADMIN_ACCOUNT_NAME}</strong>
                  </p>
                </div>

                {/* QR Code Demo Visual */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="p-2 rounded-lg bg-white text-slate-950 shrink-0">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div className="text-[11px] text-slate-300 leading-snug">
                    <p className="font-semibold text-slate-100">Paytm / PhonePe / GPay से सीधे स्कैन या UPI पर भेजें।</p>
                    <p className="text-slate-400 text-[10px]">भुगतान के बाद 12 अंकों का UTR / Transaction No नीचे दर्ज करें।</p>
                  </div>
                </div>
              </div>

              {/* UTR Input Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    UPI Transaction ID / 12-अंकों का UTR नंबर *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. 423981029384 या UPI Ref ID"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    भुगतानकर्ता का नाम / प्रेषक (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. संजय कुशवाहा"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Submit Verification Request */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <span>सत्यापन भेजा जा रहा है...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>भुगतान विवरण सबमिट करें (Submit Payment Proof)</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: SUBMITTED CONFIRMATION */}
          {step === 'confirmation' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-100">
                  {language === 'hi' ? 'प्रमोशन अनुरोध सफलतापूर्वक भेजा गया!' : 'Promotion Request Submitted!'}
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  {language === 'hi'
                    ? `आपका भुगतान (₹${selectedPackage.price}) एडमिन के खाते में सत्यापित होने के लिए कतारबद्ध है। एडमिन द्वारा पुष्टि होते ही आपके वीडियो पर ${selectedPackage.targetImpressions.toLocaleString('en-IN')} इम्प्रेशन्स सक्रिय कर दिए जाएंगे।`
                    : `Your payment of ₹${selectedPackage.price} is pending verification by Admin. Once confirmed, ${selectedPackage.targetImpressions.toLocaleString('en-IN')} impressions will be delivered.`}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 max-w-sm mx-auto space-y-1 text-left">
                <div className="flex justify-between">
                  <span>UTR / Ref No:</span>
                  <span className="text-slate-200 font-bold">{utrNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>पैकेज:</span>
                  <span className="text-amber-400">{selectedPackage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>स्थिति:</span>
                  <span className="text-amber-400 font-bold">Pending Admin Verification</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseAndReset}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                {language === 'hi' ? 'ठीक है (Close)' : 'Done'}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
