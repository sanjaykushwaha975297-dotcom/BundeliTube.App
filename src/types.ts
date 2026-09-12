export interface VideoPart {
  partNumber: number;
  fileId: string;
  messageId: number;
  streamUrl: string;
  sizeMB: number;
  durationSeconds?: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  youtubeUrl?: string;
  thumbnail: string;
  category: string;
  artist: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  creatorId?: string;
  creatorUid?: string;
  ownerUid?: string;
  status?: 'published' | 'pending' | 'approved' | 'rejected' | 'archived';
  isShort?: boolean;
  videoType?: 'video' | 'short';
  views: number;
  likes: number;
  dislikes?: number;
  duration: string;
  uploadDate: string;
  isVerified?: boolean;
  isMonetized?: boolean;
  estimatedEarnings?: number;
  impressions?: number;
  ctr?: number; // Click-Through Rate in %
  rpm?: number; // Rate per 1000 views in INR
  watchTimeHours?: number;
  tags: string[];
  lyrics?: string;
  audioOnlyAvailable?: boolean;
  verificationCode?: string;
  visibility?: 'public' | 'unlisted' | 'private';
  hasPaidPromotion?: boolean;
  sponsorName?: string;
  sourceType?: 'youtube' | 'direct_upload';
  streamUrl?: string;
  directFileUrl?: string;
  fileSizeMB?: number;
  adConfig?: VideoAdConfig;
  adImpressions?: number;
  adImpressions24h?: number;
  total_long_impressions?: number;
  views24h?: number;
  adminPayoutAmount?: number;
  adminPayoutStatus?: 'pending' | 'approved' | 'paid';
  isTakenDown?: boolean;
  takenDownReason?: string;
  isPromoted?: boolean;
  commentsCount?: number;
  rejectionReason?: string;
  promotionStatus?: 'pending_payment' | 'pending_admin_approval' | 'pending_approval' | 'active' | 'completed' | 'rejected';
  promotionImpressionsTarget?: number;
  promotionTargetImpressions?: number;
  promotionPackageId?: string;
  promotionImpressionsDelivered?: number;
}

export interface PromotionPackage {
  id: string;
  name: string;
  hindiName: string;
  targetImpressions: number;
  estimatedViews: string;
  price: number;
  durationDays: number;
  badge: string;
  placementType: 'top_feed' | 'watch_next' | 'trending_boost' | 'all_round';
}

export interface VideoPromotionCampaign {
  id: string;
  videoId: string;
  videoTitle: string;
  videoThumbnail: string;
  channelId: string;
  channelName: string;
  packageId: string;
  packageName: string;
  targetImpressions: number;
  deliveredImpressions: number;
  amountPaid: number;
  paymentMethod: 'UPI' | 'QR_CODE' | 'BANK_TRANSFER';
  paymentReferenceUtr: string;
  adminUpiId: string;
  status: 'pending_payment' | 'pending_admin_approval' | 'active' | 'completed' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  adminNote?: string;
}

export interface AppUserSettings {
  defaultAudioMode: boolean;
  videoQuality: 'auto' | '1080p' | '720p' | '480p';
  autoPlayNext: boolean;
  pushNotifications: boolean;
  payoutAlerts: boolean;
  emailStatements: boolean;
  showWatermark: boolean;
  preferredPayoutMethod: 'UPI' | 'Bank Transfer';
  language: 'hi' | 'en';
  theme: 'dark' | 'light';
}

export interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  banner: string;
  subscribers: number;
  bio: string;
  joinedDate: string;
  isVerified: boolean;
  approvalStatus: 'approved' | 'pending' | 'rejected' | 'none';
  rejectionReason?: string;
  ownerUid: string;
  kycStatus: 'verified' | 'pending' | 'not_submitted';
  panCardHolderName?: string;
  panName?: string;
  panNumber?: string;
  panPhotoUrl?: string;
  aadhaarNumber?: string;
  aadhaarPhotoUrl?: string;
  aadhaarFrontPhotoUrl?: string;
  aadhaarBackPhotoUrl?: string;
  mobileNumber?: string;
  bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName?: string;
    upiId?: string;
  };
  totalViews: number;
  views24h?: number;
  totalAdImpressions?: number;
  total_long_impressions?: number;
  adImpressions24h?: number;
  adminPayoutBalance?: number;
  lastPayoutDate?: string;
  videoCount: number;
  cpmRate: number; // e.g. ₹35 per 1,000 views
}

export interface ChannelSubmission {
  id: string;
  ownerUid: string;
  channelName: string;
  channelHandle?: string;
  channelAvatar?: string;
  channelLogoUrl?: string;
  avatarUrl?: string;
  category?: string;
  verifiedEmail?: string;
  mobileNumber?: string;
  panCardHolderName?: string;
  panName?: string;
  panNumber?: string;
  panCardNumber?: string;
  panPhotoUrl?: string;
  aadhaarNumber?: string;
  aadhaarPhotoUrl?: string;
  aadhaarFrontPhotoUrl?: string;
  aadhaarBackPhotoUrl?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  upiId?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  kycStatus?: string;
  partnerProgramStatus?: string;
  programType?: string;
  panPhoto?: string;
  panCardPhoto?: string;
  panCardPhotoUrl?: string;
  panFrontPhotoUrl?: string;
  aadhaarUid?: string;
  documentNumber?: string;
  kycPhotoUrl?: string;
  kycPhoto?: string;
  frontPhotoUrl?: string;
  frontPhoto?: string;
  backPhotoUrl?: string;
  backPhoto?: string;
  documentPhotoUrl?: string;
  documentUrl?: string;
  logo?: string;
  avatar?: string;
  phone?: string;
  contactNumber?: string;
  total_long_impressions?: number;
  totalAdImpressions?: number;
  adImpressions24h?: number;
  rejectionReason?: string;
  submittedAt?: string;
  createdAt?: string;
}

export interface VideoSubmission {
  id: string;
  creatorUid: string;
  channelId: string;
  channelName: string;
  channelAvatar?: string;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  category: string;
  artist: string;
  description: string;
  thumbnailUrl: string;
  duration?: string;
  verificationCode: string;
  visibility?: 'public' | 'unlisted' | 'private';
  hasPaidPromotion?: boolean;
  sponsorName?: string;
  sourceType?: 'youtube' | 'direct_upload';
  streamUrl?: string;
  directFileUrl?: string;
  fileSizeMB?: number;
  adConfig?: VideoAdConfig;
  isShort?: boolean;
  videoType?: 'video' | 'short';
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  date: string;
  amount: number;
  type: 'earning' | 'withdrawal' | 'bonus';
  status: 'completed' | 'pending' | 'processing' | 'rejected';
  payoutMethod: 'UPI' | 'Bank Transfer';
  targetAccount: string;
  refId: string;
  note?: string;
}

export interface CreatorWallet {
  currentBalance: number;
  totalWithdrawn: number;
  lifetimeEarnings: number;
  minWithdrawalLimit: number; // ₹5,000
  pendingClearance: number;
  transactions: WalletTransaction[];
}

export interface Comment {
  id: string;
  videoId: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  userLiked?: boolean;
}

export interface Category {
  id: string;
  name: string;
  hindiName: string;
  icon: string;
  description: string;
}

export interface UserAccount {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  role: 'creator' | 'viewer' | 'admin';
  channelHandle?: string;
  isLoggedIn: boolean;
  memberSince: string;
  channelId?: string;
  channelStatus?: 'approved' | 'pending' | 'rejected' | 'none';
}

export interface StudioAudioTrack {
  id: string;
  title: string;
  hindiTitle: string;
  genre: string;
  mood: string;
  duration: string;
  artist: string;
  license: string;
}

export interface StudioComment {
  id: string;
  videoId: string;
  videoTitle: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isHearted: boolean;
  isPinned: boolean;
  replies?: {
    id: string;
    author: string;
    avatar: string;
    text: string;
    timestamp: string;
  }[];
  isQuestion?: boolean;
}

export interface StudioPlaylist {
  id: string;
  title: string;
  videoCount: number;
  visibility: 'public' | 'unlisted' | 'private';
  updatedAt: string;
  thumbnail: string;
}

export interface StudioPost {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  imageUrl?: string;
}

export interface StudioCopyrightClaim {
  id: string;
  videoId: string;
  videoTitle: string;
  claimant: string;
  claimType: string;
  status: 'active' | 'resolved' | 'disputed' | 'none';
  actionTaken: string;
  date: string;
}

export interface CopyrightReportData {
  id: string;
  reporterUid: string;
  reporterEmail: string;
  videoId: string;
  videoTitle: string;
  claimType: 'copyright_strike' | 'content_claim' | 'inappropriate_content' | 'fake_artist';
  claimDetails: string;
  originalWorkUrl?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AppBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  targetType: 'video' | 'channel' | 'category' | 'external';
  targetUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  creatorUid: string;
  creatorName: string;
  channelName: string;
  amount: number;
  paymentMethod: 'UPI' | 'Bank Transfer';
  upiId?: string;
  targetAccount: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  transactionRef?: string;
  createdAt: string;
  processedAt?: string;
}

export interface VideoAdConfig {
  enabled: boolean;
  preRollUrl?: string;
  midRollTime?: number;
  skipAfterSeconds?: number;
  sponsorName?: string;
  ctaUrl?: string;
  ctaText?: string;
  title?: string;
}

export interface CustomVideoAdConfig {
  id: string;
  title: string;
  advertiser?: string;
  sponsorName?: string;
  videoUrl: string;
  targetUrl?: string;
  ctaUrl?: string;
  ctaText?: string;
  durationSeconds: number;
  skipAfterSeconds?: number;
  bannerImageUrl?: string;
  isActive: boolean;
}

export interface RemoteAppConfig {
  adsEnabled: boolean;
  interstitialFrequency: number; // e.g. 3 (1 ad every 3 video plays)
  nativeAdInterval: number; // e.g. 4 (every 4th item in feed)
  rewardedAdEnabled: boolean;
  admobPublisherId?: string;
  adsenseCustomerId?: string;
  admobAppId: string;
  admobBannerId: string;
  admobInterstitialId: string;
  admobRewardedId: string;
  admobNativeId: string;
  maintenanceMode: boolean;
  minAppVersion: string;
  bannerAutoScrollSeconds: number;
  appLogoUrl?: string;
  appName?: string;
  supportWhatsapp?: string;
  supportPhone?: string;
  supportEmail?: string;
  supportTelegram?: string;
  supportHours?: string;
  adminUpiId?: string;
  cpmRate?: number;
  // Video Ads & Monetization
  videoAdsEnabled?: boolean;
  enableVideoAds?: boolean;
  adSkipSeconds?: number;
  videoAdSkipSeconds?: number;
  videoAdCpmRate?: number;
  customVideoAds?: CustomVideoAdConfig[];
  enableAdMob?: boolean;
  adMobBannerId?: string;
  adMobInterstitialId?: string;
  adMobRewardedId?: string;
  // Manual Admin Payout & Withdrawal Controls (1st to 5th of month)
  isWithdrawalWindowUnlocked?: boolean;
  withdrawalMinAmount?: number;
  withdrawalWindowDatesText?: string;
  withdrawalAdminNotice?: string;
  withdrawalLastToggledBy?: string;
  withdrawalLastToggledAt?: string;
  // Automated Ad Revenue Distribution Fields
  lastAdRatePerAd?: number;
  lastAdDistributionTotal?: number;
  lastAdDistributionAds?: number;
  lastAdDistributionDate?: string;
  currentAdRate?: number;
  // Security & Anti-Fraud Config
  disableAutoWalletCredit?: boolean;
  monetizationMode?: 'admin_batch_distribution' | 'client_instant';
}

export interface AdRevenueDistributionBatch {
  id: string;
  batchId: string;
  ratePerAd: number; // The gross rate per 1 ad (₹)
  creatorSharePercentage: number; // e.g. 50%
  netRatePerAd: number; // ratePerAd * (creatorSharePercentage / 100)
  totalAds: number;
  totalAmount: number;
  totalCreators: number;
  calculationBasis: 'all_ads' | 'total_long_impressions' | '24h_ads';
  adminNote?: string;
  adminEmail?: string;
  createdAt: string;
  serverTimestamp?: any;
  status: 'completed' | 'failed';
  creatorsBreakdown: {
    creatorId: string;
    channelId: string;
    channelName: string;
    accountHolder?: string;
    panCardHolderName?: string;
    adsCount: number;
    creditedAmount: number;
  }[];
}

export type MainAppView = 
  | 'home' 
  | 'shorts' 
  | 'subscriptions' 
  | 'you' 
  | 'library' 
  | 'history'
  | 'watch_later'
  | 'liked'
  | 'downloads'
  | 'playlists'
  | 'explore'
  | 'trending' 
  | 'music' 
  | 'live' 
  | 'podcasts' 
  | 'studio' 
  | 'wallet'
  | 'policies';

export interface ShortItem {
  id: string;
  title: string;
  videoUrl: string;
  youtubeId: string;
  thumbnail: string;
  channelId?: string;
  channelName: string;
  channelAvatar: string;
  likes: number;
  commentsCount: number;
  soundTitle: string;
  isLiked?: boolean;
  isDisliked?: boolean;
  isSaved?: boolean;
  isSubscribed?: boolean;
  views?: number;
}

export interface SubscribedChannel {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  subscribers: string;
  hasUnseen: boolean;
  isLive?: boolean;
  description: string;
}

export interface UserPlaylist {
  id: string;
  title: string;
  videoCount: number;
  visibility: 'public' | 'unlisted' | 'private';
  updatedAt: string;
  thumbnail: string;
  videoIds: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  thumbnail?: string;
  avatar?: string;
  isRead: boolean;
  type: 'upload' | 'comment' | 'payout' | 'live' | 'system';
  targetVideoId?: string;
  openCommentSection?: boolean;
  creatorId?: string;
}

export interface ShortAdPoolRecord {
  id: string;
  creatorIds: string[];
  creator_ids?: string[];
  watched_count: number;
  watchedVideos?: Array<{
    videoId: string;
    videoTitle?: string;
    creatorId: string;
    channelName?: string;
  }>;
  adTriggeredAtVideoId?: string;
  activeShortTitle?: string;
  sponsorBrand?: string;
  timestamp: string;
  createdAt: string;
  createdAtMs?: number;
  status: 'pending_admin_review' | 'reviewed';
}

