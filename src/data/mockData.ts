import { Video, Channel, CreatorWallet, Category, Comment, AppBanner, RemoteAppConfig, CopyrightReportData, ChannelSubmission, ShortItem, SubscribedChannel, UserAccount } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All', hindiName: 'सभी', icon: 'Sparkles', description: 'सभी प्रकार के बुन्देली व यूट्यूब वीडियो' },
  { id: 'music', name: 'Music', hindiName: 'संगीत (Music)', icon: 'Music', description: 'संगीत, गाने, लोकगीत व एल्बम' },
  { id: 'entertainment', name: 'Entertainment', hindiName: 'मनोरंजन (Entertainment)', icon: 'Film', description: 'मनोरंजन, शो, वेबसीरीज व कार्यक्रम' },
  { id: 'comedy', name: 'Comedy', hindiName: 'कॉमेडी (Comedy)', icon: 'Sparkles', description: 'हास्य, प्रैंक व मजेदार वीडियो' },
  { id: 'gaming', name: 'Gaming', hindiName: 'गेमिंग (Gaming)', icon: 'Radio', description: 'लाइव गेमिंग, ई-स्पोर्ट्स व वॉकथ्रू' },
  { id: 'education', name: 'Education', hindiName: 'शिक्षा (Education)', icon: 'BookOpen', description: 'पढ़ाई, ज्ञान, ट्यूटोरियल व सीख' },
  { id: 'news', name: 'News & Politics', hindiName: 'समाचार (News & Politics)', icon: 'Flame', description: 'ताज़ा खबरें, विश्लेषण व राजनीति' },
  { id: 'tech', name: 'Science & Technology', hindiName: 'तकनीक व विज्ञान (Tech)', icon: 'Radio', description: 'मोबाइल, गैजेट्स व नई तकनीक' },
  { id: 'howto', name: 'Howto & Style', hindiName: 'लाइफस्टाइल (Howto & Style)', icon: 'Sparkles', description: 'फैशन, ब्यूटी व DIY टिप्स' },
  { id: 'sports', name: 'Sports', hindiName: 'खेलकूद (Sports)', icon: 'Flame', description: 'क्रिकेट, फुटबॉल व खेल मुकाबले' },
  { id: 'film', name: 'Film & Animation', hindiName: 'फिल्म व एनीमेशन (Film)', icon: 'Film', description: 'मूवी ट्रेलर, शॉर्ट फिल्म व एनीमेशन' },
  { id: 'people', name: 'People & Blogs', hindiName: 'ब्लॉग्स (People & Blogs)', icon: 'Users', description: 'डेली व्लॉग्स व लाइफस्टाइल' },
  { id: 'autos', name: 'Autos & Vehicles', hindiName: 'वाहन (Autos & Vehicles)', icon: 'Radio', description: 'गाड़ी, बाइक रिव्यू व मॉडिफिकेशन' },
  { id: 'travel', name: 'Travel & Events', hindiName: 'यात्रा (Travel & Events)', icon: 'Compass', description: 'घूमना-फिरना, ऐतिहासिक स्थल व मेले' },
  { id: 'pets', name: 'Pets & Animals', hindiName: 'पशु-पक्षी (Pets & Animals)', icon: 'HeartHandshake', description: 'जानवर व पालतू पशु' },
  { id: 'devotional', name: 'Devotional & Spiritual', hindiName: 'भक्ति व धर्म (Devotional)', icon: 'Flame', description: 'भजन, आरती, कथा व सत्संग' },
  { id: 'rai', name: 'Rai Dance', hindiName: 'बुंदेली राई', icon: 'Music', description: 'पारंपरिक बुंदेलखंडी राई व जवाबी मुकाबला' },
  { id: 'lokgeet', name: 'Lokgeet', hindiName: 'देसी लोकगीत', icon: 'Mic2', description: 'देसी माटी के ठेठ बुंदेली लोकगीत' },
  { id: 'alha', name: 'Alha Udal', hindiName: 'आल्हा ऊदल', icon: 'ShieldAlert', description: 'वीर रस से परिपूर्ण बुंदेलखंडी आल्हा' },
  { id: 'faag', name: 'Faag & Rasiya', hindiName: 'फाग व रसिया', icon: 'HeartHandshake', description: 'होली के रसभरे बुंदेली फाग व ढिमरयाई' },
  { id: 'bhajan', name: 'Bhajan & Kirtan', hindiName: 'भजन व कीर्तन', icon: 'Flame', description: 'माता के जस, रामचरित व देसी सत्संग' },
  { id: 'dj_remix', name: 'DJ Remix', hindiName: 'डीजे रीमिक्स', icon: 'Radio', description: 'धमाकेदार डीजे लोकधुन व रीमिक्स' },
  { id: 'dehati_comedy', name: 'Dehati Comedy', hindiName: 'देहाती कॉमेडी', icon: 'Sparkles', description: 'बुंदेलखंडी हास्य, नाटक व चुटकुले' },
  { id: 'nautanki', name: 'Nautanki Natak', hindiName: 'नौटंकी नाटक', icon: 'Film', description: 'पारंपरिक स्वांग व देहाती नौटंकी' },
  { id: 'dhimrayai', name: 'Dhimrayai', hindiName: 'ढिमरयाई', icon: 'Music', description: 'बुंदेली ढिमरयाई नृत्य व गायन' },
  { id: 'jas_geet', name: 'Mata Jas', hindiName: 'माता के जस', icon: 'Flame', description: 'नवरात्रि स्पेशल बुंदेली देवी जस' },
  { id: 'deshraj', name: 'Deshraj Patairiya', hindiName: 'देशराज पटैरिया', icon: 'Mic2', description: 'स्व. देशराज पटैरिया के सदाबहार गीत' },
  { id: 'dance', name: 'Desi Dance', hindiName: 'देसी डांस', icon: 'Music', description: 'गाँव के शादी-विवाह देसी डांस' },
  { id: 'live', name: 'Live', hindiName: 'लाइव', icon: 'Radio', description: 'लाइव संगीत व कार्यक्रम' },
];

export const DEFAULT_CREATOR_USER: UserAccount = {
  id: '',
  name: '',
  email: '',
  phone: '',
  avatar: '',
  role: 'viewer',
  isLoggedIn: false,
  memberSince: '2026'
};

export const DEFAULT_VIEWER_CHANNEL: Channel = {
  id: '',
  ownerUid: '',
  name: '',
  handle: '',
  avatar: '',
  banner: '',
  subscribers: 0,
  bio: '',
  joinedDate: '2026',
  isVerified: false,
  approvalStatus: 'none',
  kycStatus: 'not_submitted',
  totalViews: 0,
  videoCount: 0,
  cpmRate: 35.00
};

export const DUMMY_DEFAULT_CHANNEL: Channel = DEFAULT_VIEWER_CHANNEL;
export const MY_CREATOR_CHANNEL: Channel = DEFAULT_VIEWER_CHANNEL;

export const INITIAL_VIDEOS: Video[] = [];

export const DEFAULT_EMPTY_WALLET: CreatorWallet = {
  currentBalance: 0,
  totalWithdrawn: 0,
  lifetimeEarnings: 0,
  minWithdrawalLimit: 5000,
  pendingClearance: 0,
  transactions: []
};

export const DEFAULT_CREATOR_WALLET: CreatorWallet = DEFAULT_EMPTY_WALLET;
export const INITIAL_CREATOR_WALLET: CreatorWallet = DEFAULT_EMPTY_WALLET;

export const INITIAL_CHANNEL_SUBMISSIONS: ChannelSubmission[] = [];
export const SAMPLE_COMMENTS: Comment[] = [];
export const TOP_ARTISTS: any[] = [];
export const STUDIO_AUDIO_TRACKS: any[] = [];
export const STUDIO_COMMENTS: any[] = [];
export const STUDIO_PLAYLISTS: any[] = [];
export const STUDIO_POSTS: any[] = [];
export const STUDIO_COPYRIGHT_CLAIMS: any[] = [];
export const MOCK_SHORTS: ShortItem[] = [];
export const MOCK_SUBSCRIBED_CHANNELS: SubscribedChannel[] = [];
export const MOCK_NOTIFICATIONS: any[] = [];
export const INITIAL_BANNERS: AppBanner[] = [];

export const INITIAL_REMOTE_CONFIG: RemoteAppConfig = {
  adsEnabled: true,
  interstitialFrequency: 3, // 1 ad every 3 video plays
  nativeAdInterval: 4, // 1 in-feed native card every 4 videos
  rewardedAdEnabled: true,
  admobPublisherId: 'pub-5666532653138550',
  adsenseCustomerId: '647-489-8116',
  admobAppId: 'ca-app-pub-5666532653138550~5941128324',
  admobBannerId: 'ca-app-pub-5666532653138550/9305658265',
  admobInterstitialId: 'ca-app-pub-5666532653138550/9245948510',
  admobRewardedId: 'ca-app-pub-5666532653138550/1962304537',
  admobNativeId: 'ca-app-pub-5666532653138550/1582894537',
  maintenanceMode: false,
  minAppVersion: '1.4.0',
  bannerAutoScrollSeconds: 5,
  appLogoUrl: '',
  appName: 'BundeliTube',
  supportWhatsapp: '+919876543210',
  supportPhone: '+919876543210',
  supportEmail: 'support@bundelitube.com',
  supportTelegram: 'https://t.me/bundelitube_official',
  supportHours: '10:00 AM - 07:00 PM (Mon - Sat)',
  adminUpiId: 'bundelitube.official@upi',
  cpmRate: 35.00,
  // Video Ads & Monetization
  videoAdsEnabled: true,
  videoAdSkipSeconds: 5,
  videoAdCpmRate: 65.00,
  customVideoAds: [],
  // Manual Admin Payout Control (1st to 5th)
  isWithdrawalWindowUnlocked: false,
  withdrawalMinAmount: 5000,
  withdrawalWindowDatesText: '1 से 5 तारीख',
  withdrawalAdminNotice: 'निकासी केवल 1 से 5 तारीख के बीच एडमिन द्वारा मैन्युअल रूप से अनलॉक होने पर ही उपलब्ध होगी।'
};

export const INITIAL_COPYRIGHT_REPORTS: CopyrightReportData[] = [];
