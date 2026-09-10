import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Video as VideoIcon, 
  IndianRupee, 
  ShieldCheck, 
  MessageSquare, 
  FileText, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Check,
  Megaphone,
  BarChart3,
  Image as ImageIcon,
  Headphones,
  User,
  Bot,
  Circle
} from 'lucide-react';
import { UserAccount } from '../types';
import { Language, translations } from '../locales/i18n';
import { 
  getFirestoreSafe, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  sendLiveChatMessageToFirestore,
  createSupportTicketInFirestore
} from '../lib/firebase';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser?: UserAccount | null;
  onOpenUploadModal?: () => void;
  onOpenWalletModal?: () => void;
  onOpenCopyrightModal?: () => void;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin' | 'agent' | 'bot';
  text: string;
  createdAt: string;
}

interface FAQItem {
  id: string;
  category: 'upload' | 'monetization' | 'paid_promo' | 'analytics' | 'copyright' | 'account';
  questionHi: string;
  questionEn: string;
  answerHi: string;
  answerEn: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'upload',
    questionHi: 'अपलोड करने के बाद वीडियो का थंबनेल (Thumbnail) कैसे बदलें?',
    questionEn: 'How to change video thumbnail after uploading?',
    answerHi: 'आप कभी भी क्रिएटर स्टूडियो (Creator Studio) -> "सामग्री (Content)" टैब में जाकर किसी भी वीडियो के एडिट (Edit / Pencil) आइकन पर क्लिक करके नया थंबनेल अपलोड कर सकते हैं या इमेज URL पेस्ट कर सकते हैं। सेव करते ही नया थंबनेल तुरंत लाइव हो जाएगा।',
    answerEn: 'You can change the thumbnail anytime by going to Creator Studio -> "Content" tab, clicking the Edit icon on any video, and uploading a new image or pasting an image URL. Saving updates it instantly across the platform.'
  },
  {
    id: 'faq-2',
    category: 'monetization',
    questionHi: 'वॉलेट से निकासी (Withdrawal) कब और कैसे होती है?',
    questionEn: 'When and how can I withdraw money from my wallet?',
    answerHi: 'बुन्देलीट्यूब पर निकासी विंडो हर महीने की 1 तारीख से 5 तारीख तक खुली रहती है। बाकी दिनों (6 से 31) में सिस्टम निकासी लॉक रखता है। न्यूनतम निकासी राशि ₹5,000 है जो सीधे आपके बैंक खाते (NEFT/IMPS) या UPI आईडी पर 24-48 घंटों में ट्रांसफर की जाती है।',
    answerEn: 'The withdrawal window opens strictly from the 1st to 5th of every month. For the rest of the month (6th to 31st), withdrawals remain locked. The minimum threshold is ₹5,000, transferred via Bank or UPI within 24-48 hours.'
  },
  {
    id: 'faq-3',
    category: 'paid_promo',
    questionHi: 'पेड प्रमोशन (Paid Promotion) विकल्प का उपयोग कब करना चाहिए?',
    questionEn: 'When should I use the Paid Promotion option?',
    answerHi: 'यदि आपके वीडियो में किसी ब्रांड, दुकान, उत्पाद, या प्रायोजक (Sponsor) का प्रचार शामिल है और इसके बदले आपको भुगतान या मुफ्त उत्पाद मिला है, तो अपलोड या एडिट करते समय "सशुल्क प्रचार शामिल है (Includes Paid Promotion)" चेकबॉक्स चुनें। इससे वीडियो पर आधिकारिक स्पॉन्सरशिप बैज प्रदर्शित होगा।',
    answerEn: 'If your video includes a sponsored product, store promotion, or brand endorsement for which you received compensation, check "Includes Paid Promotion" during upload or edit. This displays an official disclosure badge on the video.'
  },
  {
    id: 'faq-4',
    category: 'analytics',
    questionHi: 'हर वीडियो का अलग एनालिटिक्स (Video Analytics) कैसे देखें?',
    questionEn: 'How can I view detailed analytics for individual videos?',
    answerHi: 'क्रिएटर स्टूडियो के "सामग्री (Content)" टैब में प्रत्येक वीडियो के सामने दिए गए बार-चार्ट (Analytics) आइकन पर क्लिक करें। वहां आप उस वीडियो के कुल व्यूज, वॉच टाइम, सीटीआर (CTR %), अनुमानित कमाई, दर्शक प्रतिधारण ग्राफ और ट्रैफ़िक स्रोत देख सकते हैं।',
    answerEn: 'In Creator Studio -> "Content" tab, click the Analytics (BarChart) icon next to any video. You will see total views, watch hours, CTR %, estimated revenue, audience retention curve, and traffic sources for that specific video.'
  },
  {
    id: 'faq-5',
    category: 'copyright',
    questionHi: 'बुन्देली लोकगीतों व राई पर कॉपीराइट के क्या नियम हैं?',
    questionEn: 'What are the copyright rules for Bundeli folk songs and Rai?',
    answerHi: 'यदि आपके पास लोकगीत, आल्हा या राई की मूल ऑडियो रिकॉर्डिंग या आधिकारिक अधिकार हैं, तो आपका वीडियो 100% मोनेटाइज होगा। किसी अन्य क्रिएटर की हूबहू कॉपी करने पर कॉपीराइट स्ट्राइक लग सकती है। विवाद होने पर 3-डॉट मेनू से "कॉपीराइट दावा" दर्ज करें।',
    answerEn: 'Original recordings of folk songs, Alha, and Rai with proper rights are 100% eligible for monetization. Unauthorized re-uploads may receive strikes. Use the Copyright Claim tool in the menu to report infringement.'
  },
  {
    id: 'faq-6',
    category: 'monetization',
    questionHi: 'बुन्देलीट्यूब पर CPM रेट कितना मिलता है?',
    questionEn: 'What is the CPM rate on BundeliTube?',
    answerHi: 'बुन्देलीट्यूब पर प्रमाणित क्रिएटर्स को ₹35 प्रति 1,000 वैध व्यूज (₹35 CPM / RPM) का पारदर्शी भुगतान दिया जाता है।',
    answerEn: 'Verified creators receive a transparent fixed rate of ₹35 per 1,000 valid views (₹35 CPM/RPM).'
  }
];

function getBundeliHelpdeskAnswer(userMsg: string, lang: 'hi' | 'en'): string {
  const lower = userMsg.toLowerCase();
  
  if (lower.includes('निकासी') || lower.includes('withdrawal') || lower.includes('payout') || lower.includes('wallet') || lower.includes('5000') || lower.includes('बैंक') || lower.includes('upi')) {
    return lang === 'hi'
      ? '💰 पेआउट व निकासी नियम:\n• क्रिएटर वॉलेट से न्यूनतम निकासी राशि ₹5,000 है।\n• निकासी अनुरोध प्रत्येक माह की 1 से 5 तारीख के बीच स्वीकार किए जाते हैं।\n• राशि आपके सत्यापित बैंक खाते या UPI आईडी में 24-48 घंटे में अंतरित की जाती है।'
      : '💰 Payout Rules: Minimum withdrawal is ₹5,000. Requests are processed between 1st-5th of each month to your verified Bank/UPI.';
  }
  
  if (lower.includes('थंबनेल') || lower.includes('thumbnail') || lower.includes('फोटो') || lower.includes('बदल')) {
    return lang === 'hi'
      ? '🖼️ वीडियो थंबनेल कैसे बदलें:\n1. ऐप में "स्टूडियो (Studio)" मेनू खोलें।\n2. अपनी वीडियो के पास "संपादित करें (Edit)" बटन पर क्लिक करें।\n3. नया आकर्षक पोस्टर/थंबनेल (16:9 या 1280x720) अपलोड करें और "सहेजें (Save)" दबाएं।'
      : '🖼️ Thumbnail Change: Open Studio > Edit your video > upload custom 16:9 thumbnail and Save.';
  }

  if (lower.includes('अपलोड') || lower.includes('upload') || lower.includes('video') || lower.includes('साइज') || lower.includes('size')) {
    return lang === 'hi'
      ? '📤 वीडियो अपलोड सहायता:\n• आप 2GB तक की फुल HD MP4 वीडियो अपलोड कर सकते हैं।\n• टेलीग्राम क्लाउड बैकएंड व 206 रेंज स्ट्रीमिंग से वीडियो बिना अटके तुरंत चलती है।'
      : '📤 Video Upload: Supports up to 2GB MP4 with instant HTTP 206 Range streaming.';
  }

  if (lower.includes('मोनेटाइज') || lower.includes('monetiz') || lower.includes('कमाई') || lower.includes('earning') || lower.includes('cpm') || lower.includes('view')) {
    return lang === 'hi'
      ? '📊 मोनेटाइजेशन व कमाई दर:\n• बुन्देलीट्यूब पर बेस CPM दर ₹35 प्रति 1,000 व्यूज है।\n• वीडियो विज्ञापनों (Pre-roll/Mid-roll) से अतिरिक्त राजस्व प्राप्त होता है।\n• 1,000 सब्सक्राइबर्स के बाद मोनेटाइजेशन ऑटो-एक्टिव हो जाता है।'
      : '📊 Monetization: ₹35 CPM per 1,000 views plus in-stream video ads.';
  }

  if (lower.includes('चैनल') || lower.includes('channel') || lower.includes('पेंडिंग') || lower.includes('pending') || lower.includes('आधार') || lower.includes('aadhar')) {
    return lang === 'hi'
      ? '🛡️ चैनल वेरिफिकेशन व पेंडिंग स्टेटस:\n• चैनल सुरक्षा हेतु आधार कार्ड का फ्रंट और बैक फोटो तथा 12-अंकीय आधार नंबर अनिवार्य है।\n• एडमिन संजय द्वारा सत्यापन के बाद आपका चैनल स्वीकृत (Approved) हो जाता है।'
      : '🛡️ Channel Approval: Aadhaar KYC (front/back photos + 12-digit number) required. Reviewed and approved by Admin Sanjay.';
  }

  return lang === 'hi'
    ? 'नमस्ते! आपका संदेश बुन्देलीट्यूब हेल्पडेस्क व व्यवस्थापक (Admin Sanjay) को प्राप्त हो गया है। ✅\n\nसंजय जी या सपोर्ट टीम शीघ्र ही इस चैट पर उत्तर देंगे। आप ऊपर दिए गए त्वरित विकल्पों पर भी क्लिक कर सकते हैं।'
    : 'Hello! Your message has been received by Admin Sanjay and the BundeliTube team. We will reply shortly.';
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
  language,
  currentUser,
  onOpenUploadModal,
  onOpenWalletModal,
  onOpenCopyrightModal
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'chat' | 'faqs'>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');
  
  // Support Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('payout');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketEmail, setTicketEmail] = useState(currentUser?.email || '');
  const [ticketPhone, setTicketPhone] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState<string | null>(null);

  // Live Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Derive unique persistent chat ID for this user/guest
  const [chatId] = useState<string>(() => {
    if (currentUser?.id) return `chat_${currentUser.id}`;
    let stored = localStorage.getItem('bt_guest_chat_id');
    if (!stored) {
      stored = `guest_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('bt_guest_chat_id', stored);
    }
    return `chat_${stored}`;
  });

  // Real-time Firestore Subscription for Live Chat & SMS Messages
  useEffect(() => {
    if (!isOpen) return;

    // Initial greeting if empty
    const initialGreeting: ChatMessage = {
      id: 'greeting-bot',
      senderId: 'system_bot',
      senderName: 'बुंदेली हेल्पडेस्क 24x7',
      senderRole: 'agent',
      text: language === 'hi'
        ? `नमस्ते ${currentUser?.name || 'दर्शक बंधु'}! 🙏 बुन्देलीट्यूब लाइव सपोर्ट में आपका स्वागत है। आप वीडियो अपलोड, चैनल, पेआउट या एडमिन से बातचीत के लिए संदेश (SMS/Message) लिखें।`
        : `Hello ${currentUser?.name || 'friend'}! Welcome to BundeliTube Live Support. Feel free to send messages or queries to Admin!`,
      createdAt: new Date().toISOString()
    };

    const unsubs: (() => void)[] = [];
    const msgStore = new Map<string, ChatMessage>();

    const updateCombinedMessages = () => {
      const allMsgs = Array.from(msgStore.values());
      allMsgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      if (allMsgs.length > 0) {
        setChatMessages([initialGreeting, ...allMsgs]);
      } else {
        setChatMessages([initialGreeting]);
      }
    };

    const checkIsRelevant = (d: any): boolean => {
      if (!d) return false;
      const cId = d.chatId || '';
      const uId = d.userId || d.senderId || '';
      const recId = d.recipientId || '';
      const uEmail = d.userEmail || d.email || '';
      const curUid = currentUser?.id;
      const curEmail = currentUser?.email;

      if (cId === chatId) return true;
      if (cId === `chat_${curUid}`) return true;
      if (curUid && (cId === curUid || uId === curUid || recId === curUid)) return true;
      if (recId === 'all') return true;
      if (curEmail && (uEmail === curEmail || d.recipientEmail === curEmail)) return true;
      if (!curUid && (cId === chatId || uId === chatId)) return true;
      return false;
    };

    const processSnapshot = (snapshot: any) => {
      snapshot.forEach((docSnap: any) => {
        const d = docSnap.data();
        if (checkIsRelevant(d)) {
          const rawText = d.text || d.message || d.sms || d.body || d.content || '';
          if (rawText.trim()) {
            const role = d.senderRole === 'admin' || d.senderRole === 'agent' 
              ? 'agent' 
              : (d.senderId === currentUser?.id || d.userId === currentUser?.id ? 'user' : 'agent');

            msgStore.set(docSnap.id, {
              id: docSnap.id,
              senderId: d.senderId || d.userId || 'admin',
              senderName: d.senderName || (role === 'agent' ? 'बुंदेली एडमिन' : (currentUser?.name || 'यूज़र')),
              senderRole: role,
              text: rawText,
              createdAt: d.createdAt || d.timestamp || new Date().toISOString()
            });
          }
        }
      });
      updateCombinedMessages();
    };

    try {
      const db = getFirestoreSafe();
      if (db) {
        // 1. Listen to support_messages
        const unsubSupport = onSnapshot(collection(db, 'support_messages'), processSnapshot, (err) => {
          console.warn('support_messages listener note:', err);
        });
        unsubs.push(unsubSupport);

        // 2. Listen to messages collection
        const unsubMessages = onSnapshot(collection(db, 'messages'), processSnapshot, (err) => {
          console.warn('messages listener note:', err);
        });
        unsubs.push(unsubMessages);

        // 3. Listen to sms collection
        const unsubSms = onSnapshot(collection(db, 'sms'), processSnapshot, (err) => {
          console.warn('sms listener note:', err);
        });
        unsubs.push(unsubSms);
      }
    } catch (e) {
      console.warn('Live chat init note:', e);
      setChatMessages([initialGreeting]);
    }

    return () => {
      unsubs.forEach(unsub => {
        try { unsub(); } catch (_) {}
      });
    };
  }, [isOpen, chatId, language, currentUser?.id, currentUser?.name, currentUser?.email]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  if (!isOpen) return null;

  const filteredFaqs = FAQ_LIST.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.questionHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.questionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answerHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answerEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setTicketSubmitting(true);
    const generatedTicketId = `BT-SUP-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await createSupportTicketInFirestore({
        id: generatedTicketId,
        category: ticketCategory,
        subject: ticketSubject.trim(),
        message: ticketMessage.trim(),
        email: ticketEmail.trim() || currentUser?.email,
        phone: ticketPhone.trim(),
        userId: currentUser?.id || chatId,
        userName: currentUser?.name || (language === 'hi' ? 'बुंदेली दर्शक' : 'Bundeli User'),
        status: 'open'
      });
    } catch (err) {
      console.warn('Ticket firestore note:', err);
    }

    setTicketSubmitting(false);
    setTicketSubmitted(generatedTicketId);
    setTicketSubject('');
    setTicketMessage('');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const msgText = (textToSend || inputMessage).trim();
    if (!msgText || isSendingMessage) return;

    setIsSendingMessage(true);
    const senderName = currentUser?.name || (language === 'hi' ? 'बुंदेली दर्शक' : 'Bundeli Viewer');
    const senderId = currentUser?.id || chatId;

    // 1. Instant optimistic update on UI
    const localId = `msg-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: localId,
      senderId,
      senderName,
      senderRole: 'user',
      text: msgText,
      createdAt: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, optimisticMsg]);
    setInputMessage('');

    try {
      // 2. Persist message to Firestore (synced across support_messages, messages, and sms)
      await sendLiveChatMessageToFirestore({
        id: localId,
        chatId: chatId,
        senderId: senderId,
        senderName: senderName,
        senderRole: 'user',
        text: msgText,
        userEmail: currentUser?.email || ticketEmail
      });
    } catch (err) {
      console.warn('Send message note:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const quickPrompts = [
    { label: '💰 1-5 तारीख निकासी सहायता', prompt: 'मुझे वॉलेट से बैंक या UPI निकासी (₹5,000 नियम) के बारे में जानकारी चाहिए।' },
    { label: '🖼️ वीडियो थंबनेल बदलाव', prompt: 'अपलोड किए गए वीडियो का थंबनेल कैसे बदलें?' },
    { label: '📢 पेड प्रमोशन पॉलिसी', prompt: 'पेड प्रमोशन (Sponsored Video) का टैग कैसे लगाएं?' },
    { label: '📊 व्यूज व एनालिटिक्स', prompt: 'मेरी वीडियो के व्यूज और ₹35 CPM कमाई कब अपडेट होती है?' },
    { label: '🛡️ कॉपीराइट दावा प्रश्न', prompt: 'बुंदेली राई/लोकगीत ऑडियो कॉपीराइट के क्या नियम हैं?' }
  ];

  return (
    <div id="help-center-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-slate-100 my-6 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  {language === 'hi' ? 'बुन्देलीट्यूब सहायता व 24x7 लाइव सपोर्ट' : 'BundeliTube Help & 24x7 Live Support'}
                </h2>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Desk
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {language === 'hi'
                  ? 'Firebase रीयल-टाइम सपोर्ट: पेआउट, थंबनेल, वीडियो वेरिफिकेशन व तकनीकी सहायता'
                  : 'Real-time synchronized support for creators and viewers'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'chat'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800/60 shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{language === 'hi' ? '24x7 लाइव चैट (Live Chat)' : '24x7 Live Chat'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/40" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'faqs'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800/60 shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'hi' ? 'मार्गदर्शिका व टिकट (FAQs & Tickets)' : 'Guides & Tickets'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col bg-white dark:bg-slate-900">
          
          {/* TAB 1: 24x7 REAL-TIME LIVE CHAT DESK */}
          {activeTab === 'chat' && (
            <div className="flex flex-col flex-1 h-full min-h-[420px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-inner">
              
              {/* Live Desk Status Subheader */}
              <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {language === 'hi' ? 'बुंदेली हेल्पडेस्क अधिकारी ऑनलाइन' : 'Bundeli Support Agent Online'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
                    (ID: {chatId.slice(0, 16)})
                  </span>
                </div>
                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{language === 'hi' ? 'औसत उत्तर: < 2 मिनट' : 'Avg reply: < 2 min'}</span>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-100/50 dark:bg-slate-950/70">
                {chatMessages.map((msg) => {
                  const isMe = msg.senderRole === 'user';
                  const isAgent = msg.senderRole === 'agent' || msg.senderRole === 'admin' || msg.senderRole === 'bot';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        {isAgent ? (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            <Bot className="w-3 h-3" />
                            <span>{msg.senderName}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300">
                              Support Desk
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            <User className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                            <span>{msg.senderName}</span>
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-tl-none shadow'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/80 overflow-x-auto flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  त्वरित प्रश्न:
                </span>
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(qp.prompt)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 border border-slate-300 dark:border-slate-700 whitespace-nowrap transition cursor-pointer shrink-0"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={language === 'hi' ? 'यहाँ अपना संदेश या समस्या लिखें और एंटर दबाएं...' : 'Type your question or issue and press Enter...'}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSendingMessage}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'hi' ? 'भेजें' : 'Send'}</span>
                </button>
              </form>

            </div>
          )}

          {/* TAB 2: FAQS & TICKET DESK */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              
              {/* Quick Search Help Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'अपनी समस्या या प्रश्न खोजें (जैसे: थंबनेल, निकासी, पेड प्रमोशन, एनालिटिक्स)...' : 'Search help topics (e.g. thumbnail, withdrawal, paid promo, analytics)...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-amber-500 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Action Category Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setSelectedCategory('upload')}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                    selectedCategory === 'upload' ? 'bg-amber-500/20 border-amber-500 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/40' : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs block font-bold">{language === 'hi' ? 'थंबनेल व अपलोड' : 'Thumbnails & Upload'}</strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{language === 'hi' ? 'थंबनेल बदलना सीखें' : 'Edit & Upload Guide'}</span>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedCategory('monetization')}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                    selectedCategory === 'monetization' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/40' : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs block font-bold">{language === 'hi' ? '1 से 5 तारीख निकासी' : '1st-5th Payouts'}</strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{language === 'hi' ? '₹5,000 व बैंक नियम' : 'Monthly Window Rules'}</span>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedCategory('paid_promo')}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                    selectedCategory === 'paid_promo' ? 'bg-purple-500/20 border-purple-500 text-purple-800 dark:text-purple-300 ring-1 ring-purple-500/40' : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs block font-bold">{language === 'hi' ? 'पेड प्रमोशन नीति' : 'Paid Promotion'}</strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{language === 'hi' ? 'स्पॉन्सरशिप टैग्स' : 'Sponsor Disclosures'}</span>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedCategory('analytics')}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                    selectedCategory === 'analytics' ? 'bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-300 ring-1 ring-blue-500/40' : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs block font-bold">{language === 'hi' ? 'वीडियो एनालिटिक्स' : 'Video Analytics'}</strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{language === 'hi' ? 'व्यूज व वॉच टाइम' : 'CTR, RPM & Retention'}</span>
                  </div>
                </button>
              </div>

              {/* FAQ Accordion Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>{language === 'hi' ? 'प्रमुख मार्गदर्शिका व अक्सर पूछे जाने वाले प्रश्न (FAQs)' : 'Guides & Frequently Asked Questions'}</span>
                  </h3>
                  {selectedCategory !== 'all' && (
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer"
                    >
                      {language === 'hi' ? 'सभी प्रश्न देखें' : 'Show all'}
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                      >
                        <button
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                            {language === 'hi' ? faq.questionHi : faq.questionEn}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800/80 animate-in fade-in">
                            <p>{language === 'hi' ? faq.answerHi : faq.answerEn}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredFaqs.length === 0 && (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                      {language === 'hi' ? 'इस खोज के लिए कोई उत्तर नहीं मिला। कृपया नीचे सहायता फॉर्म भरें।' : 'No FAQs matched your search. Submit a support ticket below.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Support Ticket Submission Form (Direct to Firestore) */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {language === 'hi' ? '24x7 क्रिएटर सहायता टिकट दर्ज करें (Firebase Saved)' : 'Submit a Creator Support Ticket'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Response &lt; 2 hrs</span>
                </div>

                {ticketSubmitted ? (
                  <div className="p-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs space-y-2 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <strong className="block text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {language === 'hi' ? 'सहायता टिकट Firebase में सफलतापूर्वक दर्ज हुआ!' : 'Support Ticket Created!'}
                    </strong>
                    <p className="text-slate-700 dark:text-slate-300">
                      {language === 'hi' ? 'टिकट संदर्भ संख्या:' : 'Ticket Reference ID:'}{' '}
                      <span className="font-mono font-black text-amber-700 dark:text-amber-400 bg-white/40 dark:bg-black/40 px-2 py-0.5 rounded">{ticketSubmitted}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'hi'
                        ? 'यह टिकट सीधे एडमिन पैनल व Firebase के support_tickets कलेक्शन में दर्ज हो गया है।'
                        : 'Our dedicated support desk will respond within 2 hours.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setTicketSubmitted(null)}
                      className="mt-2 px-4 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      {language === 'hi' ? 'नया टिकट बनाएं' : 'Submit Another'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleTicketSubmit} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'समस्या श्रेणी' : 'Issue Category'}
                        </label>
                        <select
                          value={ticketCategory}
                          onChange={(e) => setTicketCategory(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="payout">💰 1-5 तारीख निकासी व वॉलेट (Payout & Withdrawal)</option>
                          <option value="thumbnail">🖼️ थंबनेल व वीडियो विवरण (Thumbnail & Metadata)</option>
                          <option value="paid_promo">📢 सशुल्क प्रचार व स्पॉन्सरशिप (Paid Promotion)</option>
                          <option value="analytics">📊 वीडियो एनालिटिक्स व आंकड़े (Video Analytics)</option>
                          <option value="copyright">🛡️ कॉपीराइट व कंटेंट सुरक्षा (Copyright Claims)</option>
                          <option value="other">❓ अन्य सहायता (Other Assistance)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'विषय (Subject)' : 'Subject'}
                        </label>
                        <input
                          type="text"
                          placeholder={language === 'hi' ? 'संक्षेप में समस्या लिखें...' : 'Brief summary of issue...'}
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'ईमेल आईडी' : 'Email Address'}
                        </label>
                        <input
                          type="email"
                          placeholder="creator@example.com"
                          value={ticketEmail}
                          onChange={(e) => setTicketEmail(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'मोबाइल नंबर / व्हाट्सएप' : 'Mobile / WhatsApp'}
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98XXXXXXXX"
                          value={ticketPhone}
                          onChange={(e) => setTicketPhone(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {language === 'hi' ? 'समस्या का विस्तार से विवरण दें' : 'Detailed Description'}
                      </label>
                      <textarea
                        rows={3}
                        placeholder={language === 'hi' ? 'कृपया अपनी समस्या, वीडियो लिंक या संदर्भ विवरण यहाँ लिखें...' : 'Describe your request or issue in detail...'}
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 leading-relaxed"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-amber-500" />
                        <span>support@bundelitube.com</span>
                      </div>

                      <button
                        type="submit"
                        disabled={ticketSubmitting || !ticketSubject.trim() || !ticketMessage.trim()}
                        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-amber-500/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{ticketSubmitting ? 'भेजा जा रहा है...' : (language === 'hi' ? 'टिकट सबमिट करें' : 'Submit Ticket')}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>निकासी विंडो: 1 से 5 तारीख</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% सुरक्षित बुंदेली मंच (Firebase Synced)</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};
