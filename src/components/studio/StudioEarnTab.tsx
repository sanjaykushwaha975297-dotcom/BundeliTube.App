import React from 'react';
import { 
  IndianRupee, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Download, 
  CreditCard, 
  Sparkles,
  Building2,
  Lock,
  Clock,
  Coins,
  Users,
  Timer,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Channel, CreatorWallet } from '../../types';
import { Language, translations } from '../../locales/i18n';

interface StudioEarnTabProps {
  channel: Channel;
  wallet: CreatorWallet;
  language: Language;
  onOpenWalletModal: () => void;
}

export const StudioEarnTab: React.FC<StudioEarnTabProps> = ({
  channel,
  wallet,
  language,
  onOpenWalletModal
}) => {
  const t = translations[language];
  const minLimit = wallet.minWithdrawalLimit || 5000;
  const progressPercent = Math.min(100, Math.round((wallet.currentBalance / minLimit) * 100));
  const isEligible = wallet.currentBalance >= minLimit;

  return (
    <div id="studio-earn-tab" className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <span>{t.studioEarn}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              Partner Program Active
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'आपकी विज्ञापन कमाई, पेआउट थ्रेशोल्ड, बैंक खाता और मासिक भुगतान विवरण'
              : 'Ad revenue earnings, payout progress, bank KYC, and withdrawal records'}
          </p>
        </div>

        <button
          onClick={onOpenWalletModal}
          id="earn-tab-withdraw-btn"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
        >
          <IndianRupee className="w-4 h-4" />
          <span>{language === 'hi' ? 'रुपये निकालें (Wallet)' : 'Withdraw Funds'}</span>
        </button>
      </div>

      {/* Creator Monotize / BundeliTube Partner Program Coming Soon Notice */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border-2 border-amber-500/40 p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-100 font-bundeli tracking-wide">
                  Creator Monetize • BundeliTube Partner Program
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md shadow-amber-500/20 animate-pulse">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-amber-300 font-semibold mt-0.5">
                बुन्देली ट्यूब पार्टनर प्रोग्राम (Monetization Criteria)
              </p>
            </div>
          </div>
        </div>

        {/* Criteria Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {/* Criterion 1 - 500 Subscribers (Coming Soon) */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">आवश्यक सब्सक्राइबर्स (Subscribers)</span>
                <strong className="text-base font-black text-slate-100 font-mono">
                  500 Subscribers
                </strong>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider shrink-0 animate-pulse">
              Coming Soon
            </span>
          </div>

          {/* Criterion 2 */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">आवश्यक वॉच टाइम (Watch Time)</span>
                <strong className="text-base font-black text-slate-100 font-mono">
                  2000 घण्टा (Watch Hours)
                </strong>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider shrink-0 animate-pulse">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Disclaimer / Notice Text */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-start gap-3 text-xs leading-relaxed text-slate-300">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-amber-300 font-semibold">सूचना (Coming Soon): </strong>
            यह क्राइटेरिया (500 सब्सक्राइबर्स एवं 2000 घण्टा वॉच टाइम) जल्द आ रहा है (Coming Soon)। अभी सभी स्वीकृत क्रिएटर्स के लिए मोनेटाइजेशन खुला है।
          </p>
        </div>
      </div>

      {/* Main Earn Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payout Progress Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'पेआउट निकासी प्रगति (Payout Progress)' : 'Payout Threshold'}</span>
            </h3>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {isEligible ? (language === 'hi' ? '✓ निकासी के लिए तैयार' : '✓ Ready for Withdrawal') : `${progressPercent}% Completed`}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-xs text-slate-400 block">{language === 'hi' ? 'वर्तमान उपलब्ध बैलेंस' : 'Current Balance'}</span>
                <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                  ₹{wallet.currentBalance.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">{language === 'hi' ? 'न्यूनतम सीमा' : 'Minimum Limit'}</span>
                <span className="text-lg font-bold text-slate-200 font-mono">
                  ₹{minLimit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'hi'
                ? `निकासी विंडो: प्रत्येक माह की 1 से 5 तारीख। न्यूनतम ₹${minLimit.toLocaleString('en-IN')} बैलेंस होने पर आप सीधे UPI या बैंक खाते में बिना किसी शुल्क के निकासी कर सकते हैं।`
                : `Withdrawal window: 1st to 5th of each month. Direct bank or UPI transfer available upon reaching ₹${minLimit.toLocaleString('en-IN')}.`}
            </p>
          </div>

          {/* Monthly Withdrawal Window Policy Alert */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-300 block">
                  {language === 'hi' ? 'मासिक निकासी विंडो: 1 से 5 तारीख' : 'Monthly Withdrawal Window: 1st - 5th'}
                </span>
                <span className="text-[11px] text-slate-300">
                  {language === 'hi'
                    ? 'सभी पेआउट अनुरोध हर माह 1 से 5 तारीख के बीच लिए व प्रोसेस किए जाते हैं।'
                    : 'Payout requests are accepted and processed between 1st and 5th of every month.'}
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold shrink-0">
              {language === 'hi' ? '1-5 तारीख चक्र' : '1st - 5th Cycle'}
            </span>
          </div>

          {/* Admin Panel Revenue Verification Note */}
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-2.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-[11px] text-slate-300">
              {language === 'hi'
                ? '💡 विज्ञापन एवं वीडियो प्रदर्शन की कमाई व्यवस्थापक एडमिन पैनल द्वारा जाँची जाकर सीधे आपके वॉलेट में क्रेडिट की जाती है।'
                : '💡 Ad and video performance earnings are verified and credited directly to your wallet via the Admin Panel.'}
            </span>
          </div>

          {/* Quick Ways You Earn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{language === 'hi' ? '📺 वॉच पेज विज्ञापन' : 'Watch Page Ads'}</span>
                <span className="text-emerald-400 font-bold text-[10px]">सक्रिय (Active)</span>
              </div>
              <p className="text-[11px] text-slate-400">बुंदेली गानों के प्लेबैक पर वीडियो विज्ञापनों से कमाई।</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{language === 'hi' ? '🎁 सुपर चैट व दर्शक टिप्स' : 'Supers & Tips'}</span>
                <span className="text-emerald-400 font-bold text-[10px]">सक्रिय (Active)</span>
              </div>
              <p className="text-[11px] text-slate-400">दर्शकों द्वारा सीधे दिए गए प्रोत्साहन टिप्स।</p>
            </div>
          </div>
        </div>

        {/* Bank & KYC Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-100">{language === 'hi' ? 'सत्यापित बैंक खाता' : 'Verified Bank Account'}</h3>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">खाताधारक:</span>
              <strong className="text-slate-200 font-medium">{channel.bankDetails?.accountHolder || 'बुन्देली म्यूजिक क्रिएटर'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">बैंक का नाम:</span>
              <strong className="text-slate-200 font-medium">{channel.bankDetails?.bankName || 'State Bank of India'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">खाता संख्या:</span>
              <strong className="text-slate-200 font-mono">****{channel.bankDetails?.accountNumber?.slice(-4) || '4812'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">UPI ID:</span>
              <strong className="text-amber-400 font-mono">{channel.bankDetails?.upiId || 'bundelicreator@okaxis'}</strong>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-emerald-400 font-bold">
              <span>KYC सत्यापन:</span>
              <span>✓ आधार व बैंक सत्यापित</span>
            </div>
          </div>

          {/* Action to Wallet */}
          <button
            onClick={onOpenWalletModal}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>{language === 'hi' ? 'लेन-देन इतिहास व बैंक विवरण' : 'View Transactions & Statements'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Transaction History Snapshot */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>{language === 'hi' ? 'हाल के भुगतान व निकासी (Recent Payouts)' : 'Recent Payouts'}</span>
        </h3>

        <div className="divide-y divide-slate-800/80">
          {wallet.transactions.map((tx) => (
            <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <strong className="text-slate-200 block">{tx.note || tx.type}</strong>
                <span className="text-[10px] text-slate-400 font-mono">{tx.date} • {tx.refId}</span>
              </div>
              <div className="text-right">
                <strong className={`font-mono text-sm block ${tx.type === 'withdrawal' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {tx.type === 'withdrawal' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                </strong>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">{tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
