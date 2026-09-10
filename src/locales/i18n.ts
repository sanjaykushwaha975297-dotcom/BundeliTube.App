export type Language = 'hi' | 'en';

export interface Translations {
  // Brand & Nav
  appName: string;
  tagline: string;
  home: string;
  shorts: string;
  subscriptions: string;
  you: string;
  trending: string;
  musicTab: string;
  liveTab: string;
  gamingTab: string;
  newsTab: string;
  podcastsTab: string;
  creatorStudio: string;
  myWallet: string;
  library: string;
  history: string;
  watchLater: string;
  likedVideos: string;
  downloads: string;
  yourVideos: string;
  yourClips: string;
  playlists: string;
  premium: string;
  createChannel: string;
  login: string;
  logout: string;
  switchAccount: string;
  searchPlaceholder: string;
  searchBtn: string;
  voiceSearch: string;
  createMenu: string;
  uploadVideo: string;
  goLive: string;
  createPost: string;
  notifications: string;
  saveToPlaylist: string;
  superThanks: string;
  clipVideo: string;
  transcript: string;
  chapters: string;
  liveChat: string;
  
  // Theme & Language
  darkMode: string;
  lightMode: string;
  language: string;
  hindi: string;
  english: string;

  // Categories
  allCategories: string;
  rai: string;
  lokgeet: string;
  alha: string;
  faag: string;
  bhajan: string;
  djRemix: string;
  deshrajSpecial: string;

  // Video & Player
  views: string;
  subscribers: string;
  like: string;
  share: string;
  download: string;
  audioMode: string;
  audioModeActive: string;
  videoQuality: string;
  playbackSpeed: string;
  autoPlay: string;
  nextVideo: string;
  prevVideo: string;
  showMore: string;
  showLess: string;
  copyrightClaim: string;
  reportCopyright: string;
  comments: string;
  addComment: string;
  postComment: string;
  monetizedBadge: string;
  comingSoon: string;
  topArtists: string;
  artistSpotlightDesc: string;

  // Creator & Studio Tabs & Navigation (Full YouTube Studio Options)
  studioDashboard: string;
  studioContent: string;
  studioAnalytics: string;
  studioComments: string;
  studioSubtitles: string;
  studioCopyright: string;
  studioEarn: string;
  studioCustomization: string;
  studioAudioLibrary: string;
  studioSettings: string;
  studioFeedback: string;
  studioCreate: string;
  studioLatestVideo: string;
  studioChannelAnalytics: string;
  studioSubscribersCount: string;
  studioSummary28Days: string;
  studioTopVideos: string;
  studioRecentComments: string;
  studioNews: string;

  tabOverview: string;
  tabVideos: string;
  tabAudience: string;
  tabSettings: string;

  // Studio Analytics (Impressions & Geography & Earnings)
  impressions: string;
  totalImpressions: string;
  ctr: string;
  watchTime: string;
  videoEarnings: string;
  whichVideoEarnings: string;
  audienceGeography: string;
  whereWatched: string;
  topLocations: string;
  topStates: string;
  trafficSources: string;
  deviceTypes: string;
  ageDistribution: string;
  adRevenue: string;
  analyticsDeepDive: string;

  // App & Channel Settings
  appSettings: string;
  channelProfileSettings: string;
  playbackSettings: string;
  payoutSettings: string;
  notificationSettings: string;
  saveSettings: string;
  settingsSaved: string;

  // Channel Status & Upload
  channelStatus: string;
  pendingApproval: string;
  pendingApprovalDesc: string;
  approved: string;
  rejected: string;
  rejectionReason: string;
  youtubeSubmission: string;
  directPhoneUpload: string;
  directUploadComingSoon: string;
  customThumbnail: string;
  previewThumbnail: string;
  videoTitle: string;
  artistName: string;
  category: string;
  description: string;
  tags: string;
  verificationCodeLabel: string;
  verificationCodeNotice: string;
  submitForVerification: string;
  submitting: string;
  uploadSuccessNotice: string;

  // KYC & Channel Creation
  channelName: string;
  mobileNumber: string;
  verifiedEmail: string;
  panNumber: string;
  panPhoto: string;
  aadhaarNumber: string;
  aadhaarPhoto: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  branchName: string;
  upiId: string;
  submitKyc: string;
  kycPendingDesc: string;
  kycSuccessMsg: string;

  // Wallet & Monetization
  walletTitle: string;
  currentBalance: string;
  totalEarnings: string;
  totalWithdrawn: string;
  minWithdrawalNote: string;
  withdrawFunds: string;
  withdrawalPendingNotice: string;
  withdrawalWindowNote: string;
  windowOpenBadge: string;
  windowClosedBadge: string;
  windowClosedNotice: string;
  revenueShareNote: string;
  creatorShare: string;
  adminShare: string;
  bannerShareNote: string;
  uploadRewardZeroNote: string;
  recentTransactions: string;
  privacyNote: string;
  
  // General & Errors
  googleSignIn: string;
  continueWithGoogle: string;
  signInRequired: string;
  signInToUpload: string;
  onlyApprovedCanUpload: string;
  cancel: string;
  close: string;
  save: string;
  terms: string;
  privacy: string;
  copyrightPolicy: string;
}

export const translations: Record<Language, Translations> = {
  hi: {
    appName: 'बुन्देली ट्यूब',
    tagline: 'माटी की खुशबू, संगीत और क्रिएटर कमाई',
    home: 'होम',
    shorts: 'शॉर्ट्स',
    subscriptions: 'सदस्यताएँ',
    you: 'आप',
    trending: 'ट्रेंडिंग',
    musicTab: 'संगीत',
    liveTab: 'लाइव',
    gamingTab: 'नाटक व ड्रामा',
    newsTab: 'समाचार',
    podcastsTab: 'पॉडकास्ट',
    creatorStudio: 'क्रिएटर स्टूडियो',
    myWallet: 'मेरा वॉलेट',
    library: 'लाइब्रेरी',
    history: 'इतिहास',
    watchLater: 'बाद में देखें',
    likedVideos: 'पसंद किए गए वीडियो',
    downloads: 'डाउनलोड्स',
    yourVideos: 'आपके वीडियो',
    yourClips: 'आपकी क्लिप्स',
    playlists: 'प्लेलिस्ट्स',
    premium: 'प्रीमियम',
    createChannel: 'चैनल बनाएँ',
    login: 'लॉगिन करें',
    logout: 'लॉगआउट',
    switchAccount: 'खाता बदलें',
    searchPlaceholder: 'बुन्देली राई, लोकगीत, आल्हा, फाग खोजें...',
    searchBtn: 'खोजें',
    voiceSearch: 'आवाज़ से खोजें',
    createMenu: 'बनाएँ (+)',
    uploadVideo: 'वीडियो अपलोड करें',
    goLive: 'लाइव स्ट्रीम शुरू करें',
    createPost: 'कम्युनिटी पोस्ट लिखें',
    notifications: 'सूचनाएं',
    saveToPlaylist: 'प्लेलिस्ट में सहेजें',
    superThanks: 'सुपर थैंक्स',
    clipVideo: 'क्लिप काटें',
    transcript: 'बोल व ट्रांसक्रिप्ट',
    chapters: 'अध्याय',
    liveChat: 'लाइव चैट',

    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    language: 'भाषा',
    hindi: 'हिन्दी',
    english: 'English',

    allCategories: 'सभी गीत',
    rai: 'बुन्देली राई',
    lokgeet: 'लोकगीत',
    alha: 'आल्हा ऊदल',
    faag: 'फाग व रसिया',
    bhajan: 'देसी भजन',
    djRemix: 'डीजे रीमिक्स',
    deshrajSpecial: 'देशराज पटैरिया स्पेशल',

    views: 'व्यूज',
    subscribers: 'सब्सक्राइबर्स',
    like: 'पसंद',
    share: 'शेयर',
    download: 'डाउनलोड',
    audioMode: 'ऑडियो मोड (डेटा बचत)',
    audioModeActive: 'ऑडियो मोड सक्रिय • 90% डेटा बचत',
    videoQuality: 'क्वालिटी',
    playbackSpeed: 'स्पीड',
    autoPlay: 'ऑटो-प्ले अगला वीडियो',
    nextVideo: 'अगला वीडियो',
    prevVideo: 'पिछला वीडियो',
    showMore: '...और देखें',
    showLess: 'कम दिखाएं',
    copyrightClaim: 'कॉपीराइट दावा / शिकायत',
    reportCopyright: 'कॉपीराइट शिकायत दर्ज करें',
    comments: 'टिप्पणियाँ',
    addComment: 'अपनी टिप्पणी लिखें...',
    postComment: 'टिप्पणी भेजें',
    monetizedBadge: 'कमाई सक्रिय',
    comingSoon: 'जल्द आ रहा है',
    topArtists: 'शीर्ष बुंदेली कलाकार',
    artistSpotlightDesc: 'बुंदेलखंड के प्रसिद्ध लोकगायक, राई कलाकार व संगीतकार',

    // Creator Studio Tabs & Navigation (Full YouTube Studio Options)
    studioDashboard: 'डैशबोर्ड',
    studioContent: 'सामग्री',
    studioAnalytics: 'एनालिटिक्स',
    studioComments: 'टिप्पणियाँ',
    studioSubtitles: 'सबटाइटल्स व बोल',
    studioCopyright: 'कॉपीराइट',
    studioEarn: 'कमाई',
    studioCustomization: 'कस्टमाइज़ेशन',
    studioAudioLibrary: 'ऑडियो लाइब्रेरी',
    studioSettings: 'सेटिंग्स',
    studioFeedback: 'फीडबैक भेजें',
    studioCreate: 'बनाएँ',
    studioLatestVideo: 'नवीनतम वीडियो का प्रदर्शन',
    studioChannelAnalytics: 'चैनल एनालिटिक्स',
    studioSubscribersCount: 'वर्तमान सब्सक्राइबर्स',
    studioSummary28Days: 'पिछले 28 दिनों का सारांश',
    studioTopVideos: 'शीर्ष वीडियो',
    studioRecentComments: 'हाल की टिप्पणियाँ',
    studioNews: 'क्रिएटर समाचार व टिप्स',

    tabOverview: 'अवलोकन व मेट्रिक्स',
    tabVideos: 'वीडियो कमाई व इम्प्रेशंस',
    tabAudience: 'कहाँ के लोगों ने देखा (क्षेत्र)',
    tabSettings: 'ऐप व चैनल सेटिंग्स',

    // Studio Analytics
    impressions: 'इम्प्रेशंस',
    totalImpressions: 'कुल इम्प्रेशंस',
    ctr: 'क्लिक थ्रू रेट',
    watchTime: 'कुल वॉच टाइम',
    videoEarnings: 'वीडियो वार कमाई',
    whichVideoEarnings: 'किस वीडियो पे कितनी कमाई हुई',
    audienceGeography: 'दर्शक क्षेत्र व जनसांख्यिकी',
    whereWatched: 'कहाँ के लोगों ने देखा है (स्थान रिपोर्ट)',
    topLocations: 'शीर्ष जिले व शहर',
    topStates: 'शीर्ष राज्य',
    trafficSources: 'ट्रैफ़िक स्रोत',
    deviceTypes: 'उपयोगकर्ता डिवाइस',
    ageDistribution: 'आयु वर्ग',
    adRevenue: 'आपकी विज्ञापन कमाई',
    analyticsDeepDive: 'विस्तृत एनालिटिक्स रिपोर्ट',

    // Settings
    appSettings: 'ऐप व चैनल सेटिंग्स',
    channelProfileSettings: 'चैनल प्रोफ़ाइल व ब्रांडिंग',
    playbackSettings: 'प्लेबैक व ऑडियो प्राथमिकताएं',
    payoutSettings: 'भुगतान व पेआउट विवरण',
    notificationSettings: 'नोटिफिकेशन व अलर्ट्स',
    saveSettings: 'सेटिंग्स सुरक्षित करें',
    settingsSaved: 'सेटिंग्स सफलतापूर्वक सहेजी गईं!',

    channelStatus: 'चैनल स्थिति',
    pendingApproval: 'सत्यापन के लिए लंबित',
    pendingApprovalDesc: 'आपका चैनल व्यवस्थापक सत्यापन के लिए लंबित है। एडमिन द्वारा स्वीकृति मिलने के बाद वीडियो अपलोड और क्रिएटर कमाई सक्रिय हो जाएगी।',
    approved: 'स्वीकृत क्रिएटर',
    rejected: 'अस्वीकृत',
    rejectionReason: 'अस्वीकृति का कारण',
    youtubeSubmission: 'यूट्यूब लिंक द्वारा सबमिट करें (प्राथमिक विधि)',
    directPhoneUpload: 'फोन से सीधा वीडियो अपलोड',
    directUploadComingSoon: 'फोन से सीधा वीडियो अपलोड (जल्द आ रहा है)',
    customThumbnail: 'कस्टम थंबनेल (16:9)',
    previewThumbnail: 'थंबनेल पूर्वावलोकन',
    videoTitle: 'वीडियो का शीर्षक',
    artistName: 'गायक / मुख्य कलाकार',
    category: 'श्रेणी',
    description: 'वीडियो विवरण',
    tags: 'टैग्स (अल्पविराम द्वारा अलग करें)',
    verificationCodeLabel: 'यूट्यूब ओनरशिप सत्यापन कोड',
    verificationCodeNotice: 'स्वामित्व साबित करने के लिए इस सत्यापन कोड को अपने यूट्यूब वीडियो विवरण में पेस्ट करें। व्यवस्थापक द्वारा सत्यापन के बाद आपका वीडियो प्रकाशित और कमाई योग्य हो जाएगा।',
    submitForVerification: 'सत्यापन के लिए सबमिट करें',
    submitting: 'सबमिट हो रहा है...',
    uploadSuccessNotice: 'वीडियो सफलतापूर्वक सबमिट किया गया! एडमिन रिव्यू के बाद पब्लिश होगा।',

    channelName: 'चैनल का नाम',
    mobileNumber: 'मोबाइल नंबर (10 अंक)',
    verifiedEmail: 'सत्यापित ईमेल',
    panNumber: 'पैन कार्ड नंबर (PAN Card No.)',
    panPhoto: 'पैन कार्ड की फोटो (PAN Card Photo)',
    aadhaarNumber: 'आधार नंबर (12 अंक)',
    aadhaarPhoto: 'आधार कार्ड की फोटो',
    bankName: 'बैंक का नाम',
    accountHolder: 'खाताधारक का नाम',
    accountNumber: 'बैंक खाता संख्या',
    confirmAccountNumber: 'खाता संख्या दोबारा दर्ज करें',
    ifscCode: 'IFSC कोड',
    branchName: 'शाखा',
    upiId: 'UPI ID (वैकल्पिक)',
    submitKyc: 'चैनल व KYC सबमिट करें',
    kycPendingDesc: 'आपकी KYC जानकारी सुरक्षित रूप से एडमिन पोर्टल पर भेज दी जाएगी।',
    kycSuccessMsg: 'चैनल आवेदन सफलतापूर्वक सबमिट हुआ! एडमिन स्वीकृति की प्रतीक्षा करें।',

    walletTitle: 'क्रिएटर वॉलेट व कमाई',
    currentBalance: 'वर्तमान वॉलेट शेष',
    totalEarnings: 'कुल अर्जित राशि',
    totalWithdrawn: 'कुल निकाली गई राशि',
    minWithdrawalNote: 'न्यूनतम निकासी सीमा ₹5,000 है। (निकासी विंडो: प्रत्येक माह की 1 से 5 तारीख)',
    withdrawFunds: 'निकासी का अनुरोध करें',
    withdrawalPendingNotice: 'आपकी निकासी का अनुरोध एडमिन के पास लंबित है।',
    withdrawalWindowNote: 'निकासी विंडो: हर महीने की 1 से 5 तारीख के बीच (न्यूनतम राशि ₹5,000)',
    windowOpenBadge: 'निकासी विंडो खुली है (1-5 तारीख)',
    windowClosedBadge: 'निकासी विंडो बंद है (1 से 5 तारीख को खुलेगी)',
    windowClosedNotice: 'निकासी अनुरोध केवल प्रत्येक महीने की 1 से 5 तारीख के बीच स्वीकार किए जाते हैं। कृपया 1 तारीख को पुनः प्रयास करें।',
    revenueShareNote: 'सत्यापित और योग्य वीडियो व्यूज के आधार पर नियमित विज्ञापन कमाई',
    creatorShare: 'आपकी विज्ञापन कमाई',
    adminShare: 'प्लेटफ़ॉर्म सुरक्षा व CDN',
    bannerShareNote: 'प्लेटफ़ॉर्म विज्ञापन सिस्टम',
    uploadRewardZeroNote: 'अपलोड रिवॉर्ड: ₹0 (केवल वास्तविक योग्य वीडियो प्लेबैक से कमाई होती है)',
    recentTransactions: 'हाल के लेनदेन विवरण',
    privacyNote: 'आपकी कमाई केवल आपको और एडमिन पोर्टल को दिखाई देती है।',

    googleSignIn: 'गूगल से लॉगिन करें',
    continueWithGoogle: 'Google से जारी रखें',
    signInRequired: 'कृपया पहले Google से लॉगिन करें',
    signInToUpload: 'वीडियो अपलोड करने के लिए लॉगिन आवश्यक है',
    onlyApprovedCanUpload: 'केवल स्वीकृत क्रिएटर ही वीडियो अपलोड कर सकते हैं',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    save: 'सहेजें',
    terms: 'नियम व शर्तें',
    privacy: 'गोपनीयता नीति',
    copyrightPolicy: 'कॉपीराइट नीति'
  },
  en: {
    appName: 'BundeliTube',
    tagline: 'Fragrance of Bundelkhand, Music & Creator Monetization',
    home: 'Home',
    shorts: 'Shorts',
    subscriptions: 'Subscriptions',
    you: 'You',
    trending: 'Trending',
    musicTab: 'Music',
    liveTab: 'Live',
    gamingTab: 'Drama & Theatre',
    newsTab: 'News',
    podcastsTab: 'Podcasts',
    creatorStudio: 'Creator Studio',
    myWallet: 'My Wallet',
    library: 'Library',
    history: 'History',
    watchLater: 'Watch Later',
    likedVideos: 'Liked Videos',
    downloads: 'Downloads',
    yourVideos: 'Your Videos',
    yourClips: 'Your Clips',
    playlists: 'Playlists',
    premium: 'Premium',
    createChannel: 'Create Channel',
    login: 'Login',
    logout: 'Logout',
    switchAccount: 'Switch Account',
    searchPlaceholder: 'Search Bundeli Rai, Lokgeet, Alha, Faag...',
    searchBtn: 'Search',
    voiceSearch: 'Search with your voice',
    createMenu: 'Create (+)',
    uploadVideo: 'Upload video',
    goLive: 'Go live',
    createPost: 'Create community post',
    notifications: 'Notifications',
    saveToPlaylist: 'Save to playlist',
    superThanks: 'Super Thanks',
    clipVideo: 'Clip video',
    transcript: 'Transcript & Lyrics',
    chapters: 'Chapters',
    liveChat: 'Live Chat',

    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    hindi: 'हिन्दी',
    english: 'English',

    allCategories: 'All Songs',
    rai: 'Bundeli Rai Dance',
    lokgeet: 'Folk Songs (Lokgeet)',
    alha: 'Alha Udal Recital',
    faag: 'Faag & Rasiya',
    bhajan: 'Desi Bhajan & Jas',
    djRemix: 'DJ Remix',
    deshrajSpecial: 'Deshraj Patairiya Special',

    views: 'Views',
    subscribers: 'Subscribers',
    like: 'Like',
    share: 'Share',
    download: 'Download',
    audioMode: 'Audio Mode (Data Saver)',
    audioModeActive: 'Audio Mode Active • 90% Data Saved',
    videoQuality: 'Quality',
    playbackSpeed: 'Speed',
    autoPlay: 'Auto-play Next Video',
    nextVideo: 'Next Video',
    prevVideo: 'Previous Video',
    showMore: '...more',
    showLess: 'Show Less',
    copyrightClaim: 'Copyright Claim / Dispute',
    reportCopyright: 'Submit Copyright Report',
    comments: 'Comments',
    addComment: 'Add a comment...',
    postComment: 'Post Comment',
    monetizedBadge: 'Monetized',
    comingSoon: 'Coming Soon',
    topArtists: 'Top Bundeli Artists',
    artistSpotlightDesc: 'Famous folk singers, Rai artists and masters of Bundelkhand',

    // Creator Studio Tabs & Navigation (Full YouTube Studio Options)
    studioDashboard: 'Dashboard',
    studioContent: 'Content',
    studioAnalytics: 'Analytics',
    studioComments: 'Comments',
    studioSubtitles: 'Subtitles & Lyrics',
    studioCopyright: 'Copyright',
    studioEarn: 'Earn & Monetization',
    studioCustomization: 'Customization',
    studioAudioLibrary: 'Audio Library',
    studioSettings: 'Settings',
    studioFeedback: 'Send Feedback',
    studioCreate: 'Create',
    studioLatestVideo: 'Latest video performance',
    studioChannelAnalytics: 'Channel analytics',
    studioSubscribersCount: 'Current subscribers',
    studioSummary28Days: 'Summary (Last 28 days)',
    studioTopVideos: 'Top videos',
    studioRecentComments: 'Latest comments',
    studioNews: 'Creator News & Tips',

    tabOverview: 'Overview & Metrics',
    tabVideos: 'Video Earnings & Impressions',
    tabAudience: 'Where Viewers Watched',
    tabSettings: 'App & Channel Settings',

    // Studio Analytics
    impressions: 'Impressions',
    totalImpressions: 'Total Impressions',
    ctr: 'Click-Through Rate (CTR)',
    watchTime: 'Total Watch Time',
    videoEarnings: 'Video Earnings Breakdown',
    whichVideoEarnings: 'Earnings by Video',
    audienceGeography: 'Audience Geography & Regions',
    whereWatched: 'Where Viewers Watched From',
    topLocations: 'Top Districts & Cities',
    topStates: 'Top States',
    trafficSources: 'Traffic Sources',
    deviceTypes: 'Viewer Devices',
    ageDistribution: 'Age Demographics',
    adRevenue: 'Your Ad Revenue',
    analyticsDeepDive: 'Detailed Analytics Report',

    // Settings
    appSettings: 'App & Channel Settings',
    channelProfileSettings: 'Channel Profile & Branding',
    playbackSettings: 'Playback & Audio Preferences',
    payoutSettings: 'Payout & Bank Preferences',
    notificationSettings: 'Notifications & Alerts',
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings saved successfully!',

    channelStatus: 'Channel Status',
    pendingApproval: 'Pending Admin Approval',
    pendingApprovalDesc: 'Your channel application is pending admin review. Video uploads and monetization will unlock upon approval.',
    approved: 'Approved Creator',
    rejected: 'Rejected',
    rejectionReason: 'Rejection Reason',
    youtubeSubmission: 'Submit YouTube Link (Primary Method)',
    directPhoneUpload: 'Direct Phone Video Upload',
    directUploadComingSoon: 'Direct Phone Video Upload (Coming Soon)',
    customThumbnail: 'Custom Thumbnail (16:9)',
    previewThumbnail: 'Thumbnail Preview',
    videoTitle: 'Video Title',
    artistName: 'Singer / Main Artist',
    category: 'Category',
    description: 'Video Description',
    tags: 'Tags (comma separated)',
    verificationCodeLabel: 'YouTube Ownership Verification Code',
    verificationCodeNotice: 'Paste this verification code into your YouTube video description to prove ownership. Admin will verify and publish your video.',
    submitForVerification: 'Submit for Verification',
    submitting: 'Submitting...',
    uploadSuccessNotice: 'Video successfully submitted! It will publish upon admin verification.',

    channelName: 'Channel Name',
    mobileNumber: 'Mobile Number (10 digits)',
    verifiedEmail: 'Verified Google Gmail',
    panNumber: 'PAN Card Number',
    panPhoto: 'PAN Card Photo',
    aadhaarNumber: 'Aadhaar Number (12 digits)',
    aadhaarPhoto: 'Aadhaar Card Photo',
    bankName: 'Bank Name',
    accountHolder: 'Account Holder Name',
    accountNumber: 'Bank Account Number',
    confirmAccountNumber: 'Confirm Account Number',
    ifscCode: 'IFSC Code',
    branchName: 'Branch Name',
    upiId: 'UPI ID (Optional)',
    submitKyc: 'Submit Channel & KYC',
    kycPendingDesc: 'Your KYC and bank information is securely stored and transmitted only to the verified Admin Portal.',
    kycSuccessMsg: 'Channel application submitted successfully! Please wait for Admin approval.',

    walletTitle: 'Creator Wallet & Monetization',
    currentBalance: 'Current Balance',
    totalEarnings: 'Total Lifetime Earnings',
    totalWithdrawn: 'Total Withdrawn',
    minWithdrawalNote: 'Minimum withdrawal threshold is ₹5,000. (Withdrawal window: 1st to 5th of each month)',
    withdrawFunds: 'Request Withdrawal',
    withdrawalPendingNotice: 'Your withdrawal request is pending admin processing.',
    withdrawalWindowNote: 'Withdrawal window is open from 1st to 5th of every month (Min ₹5,000)',
    windowOpenBadge: 'Withdrawal Window Open (1st - 5th)',
    windowClosedBadge: 'Withdrawal Window Closed (Opens 1st - 5th)',
    windowClosedNotice: 'Withdrawal requests are processed only between the 1st and 5th of each month. Please submit during the 1st - 5th window.',
    revenueShareNote: 'Ad earnings calculated from verified playback and real viewer engagement',
    creatorShare: 'Your Ad Revenue',
    adminShare: 'Platform CDN & Infrastructure',
    bannerShareNote: 'Platform Advertising System',
    uploadRewardZeroNote: 'Upload Reward: ₹0 (Earnings strictly from verified playback)',
    recentTransactions: 'Recent Transactions',
    privacyNote: 'Your earnings are private and visible only to you and the Admin Portal.',

    googleSignIn: 'Sign in with Google',
    continueWithGoogle: 'Continue with Google',
    signInRequired: 'Please sign in with Google first',
    signInToUpload: 'Sign in is required to upload videos',
    onlyApprovedCanUpload: 'Only approved creators can upload videos',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    copyrightPolicy: 'Copyright Policy'
  }
};
