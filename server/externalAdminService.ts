import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  addDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBOtsWLmZSAIuD4dYdUN6aVpKvcy7gN7qc",
  authDomain: "bundelitube-1c045.firebaseapp.com",
  databaseURL: "https://bundelitube-1c045-default-rtdb.firebaseio.com",
  projectId: "bundelitube-1c045",
  storageBucket: "bundelitube-1c045.firebasestorage.app",
  messagingSenderId: "909934015307",
  appId: "1:909934015307:web:be64fea9a557d9a9fbaece",
  measurementId: "G-R18Y7R9LYZ"
};

const serverApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig, 'serverNodeApp');
const db = getFirestore(serverApp);

export interface CreatorAdStat {
  creatorId: string;
  channelId: string;
  channelName: string;
  ownerUid: string;
  panCardHolderName: string;
  panNumber: string;
  mobileNumber: string;
  upiId: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  totalAdImpressions: number;
  total_long_impressions: number;
  totalViews: number;
  currentWalletBalance: number;
  lifetimeEarnings: number;
  status: string;
}

/**
 * Fetch all creators and their current ad impressions & wallet info from Firestore
 */
export async function getCreatorsAdStats(): Promise<CreatorAdStat[]> {
  const creatorsMap = new Map<string, CreatorAdStat>();

  // 1. Fetch Approved Channels
  try {
    const channelsSnap = await getDocs(collection(db, 'channels'));
    channelsSnap.forEach(docSnap => {
      const data = docSnap.data() as any;
      const creatorId = data.ownerUid || data.id;
      if (!creatorId) return;

      creatorsMap.set(creatorId, {
        creatorId,
        channelId: data.id || docSnap.id,
        channelName: data.name || data.channelName || 'बुंदेली क्रिएटर',
        ownerUid: creatorId,
        panCardHolderName: data.panCardHolderName || data.panName || '',
        panNumber: data.panNumber || '',
        mobileNumber: data.mobileNumber || '',
        upiId: data.bankDetails?.upiId || data.upiId || '',
        bankName: data.bankDetails?.bankName || data.bankName || '',
        accountNumber: data.bankDetails?.accountNumber || data.accountNumber || '',
        ifscCode: data.bankDetails?.ifscCode || data.ifscCode || '',
        totalAdImpressions: Number(data.totalAdImpressions || data.total_long_impressions || 0),
        total_long_impressions: Number(data.total_long_impressions || data.totalAdImpressions || 0),
        totalViews: Number(data.totalViews || 0),
        currentWalletBalance: 0,
        lifetimeEarnings: Number(data.adminPayoutBalance || 0),
        status: data.approvalStatus || 'approved'
      });
    });
  } catch (err) {
    console.warn('Error reading channels for ad stats:', err);
  }

  // 2. Fetch Channel Submissions (approved)
  try {
    const subsSnap = await getDocs(collection(db, 'channel_submissions'));
    subsSnap.forEach(docSnap => {
      const data = docSnap.data() as any;
      const creatorId = data.ownerUid || docSnap.id;
      if (!creatorId) return;

      const existing = creatorsMap.get(creatorId);
      if (existing) {
        existing.panCardHolderName = existing.panCardHolderName || data.panCardHolderName || data.panName || '';
        existing.panNumber = existing.panNumber || data.panNumber || '';
        existing.upiId = existing.upiId || data.upiId || '';
        existing.bankName = existing.bankName || data.bankName || '';
        existing.accountNumber = existing.accountNumber || data.accountNumber || '';
        existing.ifscCode = existing.ifscCode || data.ifscCode || '';
        existing.mobileNumber = existing.mobileNumber || data.mobileNumber || '';
        existing.totalAdImpressions = Math.max(existing.totalAdImpressions, Number(data.totalAdImpressions || data.total_long_impressions || 0));
      } else if (data.status === 'approved' || data.approvalStatus === 'approved') {
        creatorsMap.set(creatorId, {
          creatorId,
          channelId: docSnap.id,
          channelName: data.channelName || 'बुंदेली क्रिएटर',
          ownerUid: creatorId,
          panCardHolderName: data.panCardHolderName || data.panName || '',
          panNumber: data.panNumber || '',
          mobileNumber: data.mobileNumber || '',
          upiId: data.upiId || '',
          bankName: data.bankName || '',
          accountNumber: data.accountNumber || '',
          ifscCode: data.ifscCode || '',
          totalAdImpressions: Number(data.totalAdImpressions || data.total_long_impressions || 0),
          total_long_impressions: Number(data.total_long_impressions || data.totalAdImpressions || 0),
          totalViews: 0,
          currentWalletBalance: 0,
          lifetimeEarnings: 0,
          status: 'approved'
        });
      }
    });
  } catch (err) {
    console.warn('Error reading channel_submissions for ad stats:', err);
  }

  // 3. Count ad impressions from videos
  try {
    const videosSnap = await getDocs(collection(db, 'videos'));
    videosSnap.forEach(docSnap => {
      const v = docSnap.data() as any;
      const creatorId = v.creatorUid || v.ownerUid || v.channelId;
      if (!creatorId) return;

      const creator = creatorsMap.get(creatorId);
      const vAds = Number(v.total_long_impressions || v.adImpressions || v.adImpressions24h || 0);
      if (creator && vAds > 0) {
        creator.total_long_impressions = Math.max(creator.total_long_impressions, creator.total_long_impressions + vAds);
      }
    });
  } catch (err) {
    console.warn('Error reading videos for ad stats:', err);
  }

  // 4. Fetch current wallet balance
  const creators = Array.from(creatorsMap.values());
  for (const c of creators) {
    try {
      const wDoc = await getDoc(doc(db, 'wallets', c.creatorId));
      if (wDoc.exists()) {
        const wData = wDoc.data() as any;
        c.currentWalletBalance = Number(wData.currentBalance || wData.walletBalance || 0);
        c.lifetimeEarnings = Number(wData.lifetimeEarnings || wData.totalEarned || c.lifetimeEarnings);
      }
    } catch (_) {}
  }

  return creators;
}

export interface DistributionParams {
  ratePerAd?: number;
  totalBudget?: number;
  totalAds?: number;
  creatorSharePercentage?: number;
  note?: string;
  adminEmail?: string;
  calculationBasis?: 'all_ads' | 'total_long_impressions' | '24h_ads';
  customCreatorAds?: Record<string, number>;
}

export interface DistributionResult {
  success: boolean;
  message: string;
  batchId: string;
  ratePerAd: number;
  creatorSharePercentage: number;
  netRatePerAd: number;
  totalDistributedRupees: number;
  totalAdsProcessed: number;
  creatorsUpdatedCount: number;
  creatorsBreakdown: Array<{
    creatorId: string;
    channelId: string;
    channelName: string;
    panCardHolderName: string;
    adsCount: number;
    creditedAmount: number;
    newWalletBalance: number;
    upiId: string;
  }>;
  createdAt: string;
}

/**
 * Execute automated distribution and update Firebase Firestore creator wallets
 */
export async function executeAdRevenueDistribution(params: DistributionParams): Promise<DistributionResult> {
  // 1. Calculate rate per ad
  let grossRatePerAd = Number(params.ratePerAd || 0);
  if (grossRatePerAd <= 0 && params.totalBudget && params.totalAds && params.totalAds > 0) {
    grossRatePerAd = Number((params.totalBudget / params.totalAds).toFixed(4));
  }

  if (grossRatePerAd <= 0) {
    throw new Error('अमान्य विज्ञापन दर (Invalid Rate per Ad). कृपया 1 विज्ञापन का रेट या कुल बजट व विज्ञापन दर्ज करें।');
  }

  const creatorSharePercentage = Number(params.creatorSharePercentage ?? 50);
  const netRatePerAd = Number((grossRatePerAd * (creatorSharePercentage / 100)).toFixed(4));
  const batchId = `ad-batch-${Date.now()}`;
  const nowIso = new Date().toISOString();

  // 2. Fetch all eligible creators
  const creators = await getCreatorsAdStats();
  if (creators.length === 0) {
    throw new Error('कोई अनुमोदित क्रिएटर नहीं मिला (No approved creators found in database).');
  }

  const creatorsBreakdown: DistributionResult['creatorsBreakdown'] = [];
  let totalDistributedRupees = 0;
  let totalAdsProcessed = 0;

  // 3. Process each creator and update their wallet
  for (const creator of creators) {
    // Determine ad count
    let adCount = 0;
    if (params.customCreatorAds && params.customCreatorAds[creator.creatorId] !== undefined) {
      adCount = Number(params.customCreatorAds[creator.creatorId] || 0);
    } else if (params.customCreatorAds && params.customCreatorAds[creator.channelId] !== undefined) {
      adCount = Number(params.customCreatorAds[creator.channelId] || 0);
    } else {
      adCount = Math.max(creator.totalAdImpressions, creator.total_long_impressions, 0);
    }

    if (adCount <= 0) {
      // Creator has no recorded ads; continue
      continue;
    }

    const earnings = Number((adCount * netRatePerAd).toFixed(2));
    if (earnings <= 0) continue;

    totalAdsProcessed += adCount;
    totalDistributedRupees += earnings;

    // Update Wallet in Firestore
    let existingWallet: any = {
      currentBalance: 0,
      totalWithdrawn: 0,
      lifetimeEarnings: 0,
      minWithdrawalLimit: 5000,
      pendingClearance: 0,
      transactions: []
    };

    try {
      const wRef = doc(db, 'wallets', creator.creatorId);
      const wDoc = await getDoc(wRef);
      if (wDoc.exists()) {
        existingWallet = wDoc.data();
      }

      const prevBal = Number(existingWallet.currentBalance || existingWallet.walletBalance || 0);
      const prevLife = Number(existingWallet.lifetimeEarnings || existingWallet.totalEarned || 0);
      const newBal = Number((prevBal + earnings).toFixed(2));
      const newLife = Number((prevLife + earnings).toFixed(2));

      const newTx = {
        id: `tx-ad-${Date.now()}-${creator.creatorId.slice(0, 5)}`,
        type: 'ad_share',
        amount: earnings,
        date: nowIso,
        description: `विज्ञापन आय वितरण (${adCount.toLocaleString('en-IN')} Ads × ₹${netRatePerAd.toFixed(2)}/Ad)`,
        referenceId: batchId,
        status: 'cleared',
        adImpressionsCount: adCount,
        ratePerAd: netRatePerAd,
        note: params.note || 'Admin ad revenue distribution'
      };

      const updatedTxs = [newTx, ...(Array.isArray(existingWallet.transactions) ? existingWallet.transactions : [])].slice(0, 50);

      await setDoc(wRef, {
        currentBalance: newBal,
        walletBalance: newBal,
        totalWithdrawn: Number(existingWallet.totalWithdrawn || 0),
        lifetimeEarnings: newLife,
        totalEarned: newLife,
        minWithdrawalLimit: 5000,
        pendingClearance: Number(existingWallet.pendingClearance || 0),
        transactions: updatedTxs,
        lastUpdated: nowIso,
        lastAdDistributionBatchId: batchId
      }, { merge: true });

      // Update Channel Document
      try {
        const cRef = doc(db, 'channels', creator.channelId);
        await updateDoc(cRef, {
          totalEarned: newLife,
          adminPayoutBalance: newBal,
          lastAdRevenueCredit: earnings,
          lastAdCreditDate: nowIso
        }).catch(() => null);
      } catch (_) {}

      // Create Live Notification for Creator
      try {
        await addDoc(collection(db, 'notifications'), {
          title: '💰 विज्ञापन आय क्रेडिट हुई!',
          description: `आपके चैनल पर ${adCount.toLocaleString('en-IN')} विज्ञापनों के ₹${earnings.toFixed(2)} आपके वॉलेट में जोड़ दिए गए हैं (दर: ₹${netRatePerAd.toFixed(2)}/Ad)।`,
          creatorId: creator.creatorId,
          targetUid: creator.creatorId,
          type: 'payout',
          timestamp: 'अभी-अभी',
          isRead: false,
          amount: earnings,
          createdAt: nowIso
        }).catch(() => null);
      } catch (_) {}

      creatorsBreakdown.push({
        creatorId: creator.creatorId,
        channelId: creator.channelId,
        channelName: creator.channelName,
        panCardHolderName: creator.panCardHolderName,
        adsCount: adCount,
        creditedAmount: earnings,
        newWalletBalance: newBal,
        upiId: creator.upiId
      });
    } catch (err) {
      console.error(`Failed to update wallet for creator ${creator.creatorId}:`, err);
    }
  }

  totalDistributedRupees = Number(totalDistributedRupees.toFixed(2));

  // 4. Record the batch audit in Firestore `ad_revenue_distributions`
  try {
    await setDoc(doc(db, 'ad_revenue_distributions', batchId), {
      batchId,
      id: batchId,
      ratePerAd: grossRatePerAd,
      creatorSharePercentage,
      netRatePerAd,
      totalAds: totalAdsProcessed,
      totalAmount: totalDistributedRupees,
      totalCreators: creatorsBreakdown.length,
      calculationBasis: params.calculationBasis || 'all_ads',
      adminNote: params.note || 'External Admin Website Automated Distribution',
      adminEmail: params.adminEmail || 'admin@bundelitube.com',
      createdAt: nowIso,
      status: 'completed',
      creatorsBreakdown
    });
  } catch (err) {
    console.warn('Could not record batch in ad_revenue_distributions:', err);
  }

  // 5. Update global remote app config
  try {
    await setDoc(doc(db, 'config', 'app_config'), {
      lastAdRatePerAd: grossRatePerAd,
      lastAdDistributionTotal: totalDistributedRupees,
      lastAdDistributionAds: totalAdsProcessed,
      lastAdDistributionDate: nowIso,
      currentAdRate: grossRatePerAd
    }, { merge: true });
  } catch (err) {
    console.warn('Could not update config/app_config:', err);
  }

  return {
    success: true,
    message: `सफलतापूर्वक ${creatorsBreakdown.length} क्रिएटर्स के वॉलेट में कुल ₹${totalDistributedRupees.toLocaleString('en-IN')} जोड़ दिए गए हैं!`,
    batchId,
    ratePerAd: grossRatePerAd,
    creatorSharePercentage,
    netRatePerAd,
    totalDistributedRupees,
    totalAdsProcessed,
    creatorsUpdatedCount: creatorsBreakdown.length,
    creatorsBreakdown,
    createdAt: nowIso
  };
}

/**
 * Toggle withdrawal lock / unlock (1st to 5th of the month)
 */
export async function toggleWithdrawalWindow(unlocked: boolean, adminNote?: string): Promise<{ success: boolean; isWithdrawalWindowUnlocked: boolean }> {
  try {
    await setDoc(doc(db, 'config', 'app_config'), {
      isWithdrawalWindowUnlocked: unlocked,
      withdrawalMinAmount: 5000,
      withdrawalWindowDatesText: '1 से 5 तारीख',
      withdrawalAdminNotice: adminNote || (unlocked ? 'विड्रॉल विंडो चालू है' : 'विड्रॉल विंडो बंद है'),
      withdrawalLastToggledAt: new Date().toISOString()
    }, { merge: true });

    return {
      success: true,
      isWithdrawalWindowUnlocked: unlocked
    };
  } catch (err: any) {
    throw new Error('विड्रॉल स्थिति बदलने में त्रुटि: ' + err.message);
  }
}

/**
 * Fetch past distribution history batches
 */
export async function getDistributionHistory(): Promise<any[]> {
  try {
    const q = query(
      collection(db, 'ad_revenue_distributions'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach(d => list.push(d.data()));
    return list;
  } catch (err) {
    console.warn('Error fetching distribution history:', err);
    return [];
  }
}

/**
 * Real-time Firestore Listener:
 * Listens to 'ad_distribution_requests' collection in the same Firebase project.
 * When the separate admin panel website creates a request with { status: 'pending', ratePerAd: 0.50 },
 * this listener automatically calculates everyone's earnings and updates all creator wallets!
 */
export function startFirestoreDistributionListener() {
  console.log('[Firebase Bridge] Starting real-time listener for ad_distribution_requests...');
  try {
    const q = query(
      collection(db, 'ad_distribution_requests'),
      where('status', '==', 'pending')
    );

    onSnapshot(q, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added' || change.type === 'modified') {
          const reqDoc = change.doc;
          const reqData = reqDoc.data();

          if (reqData.status !== 'pending') continue;

          console.log(`[Firebase Bridge] Processing ad_distribution_request from external admin: ${reqDoc.id}`, reqData);

          try {
            // Lock request from double execution
            await updateDoc(doc(db, 'ad_distribution_requests', reqDoc.id), {
              status: 'processing',
              processingStartedAt: new Date().toISOString()
            });

            const result = await executeAdRevenueDistribution({
              ratePerAd: Number(reqData.ratePerAd || 0),
              totalBudget: reqData.totalBudget ? Number(reqData.totalBudget) : undefined,
              totalAds: reqData.totalAds ? Number(reqData.totalAds) : undefined,
              creatorSharePercentage: Number(reqData.creatorSharePercentage ?? 50),
              note: reqData.note || 'External Admin Website Automated Distribution',
              adminEmail: reqData.adminEmail || 'admin@bundelitube.com',
              calculationBasis: reqData.calculationBasis || 'all_ads',
              customCreatorAds: reqData.customCreatorAds
            });

            await updateDoc(doc(db, 'ad_distribution_requests', reqDoc.id), {
              status: 'completed',
              completedAt: new Date().toISOString(),
              batchId: result.batchId,
              totalDistributedRupees: result.totalDistributedRupees,
              creatorsUpdatedCount: result.creatorsUpdatedCount,
              totalAdsProcessed: result.totalAdsProcessed,
              netRatePerAd: result.netRatePerAd,
              message: result.message
            });

            console.log(`[Firebase Bridge] Successfully processed request ${reqDoc.id}: ₹${result.totalDistributedRupees} distributed to ${result.creatorsUpdatedCount} creators.`);
          } catch (execErr: any) {
            console.error(`[Firebase Bridge] Error executing ad_distribution_request ${reqDoc.id}:`, execErr);
            await updateDoc(doc(db, 'ad_distribution_requests', reqDoc.id), {
              status: 'failed',
              failedAt: new Date().toISOString(),
              error: execErr.message
            }).catch(() => null);
          }
        }
      }
    }, (err) => {
      console.warn('[Firebase Bridge] Error in ad_distribution_requests listener:', err);
    });
  } catch (err) {
    console.warn('[Firebase Bridge] Could not start Firestore distribution listener:', err);
  }
}

export interface ChannelApplicationRecord {
  id: string;
  submissionId: string;
  channelId: string;
  ownerUid: string;
  channelName: string;
  channelHandle: string;
  channelAvatar: string;
  category: string;
  mobileNumber: string;
  panCardHolderName: string;
  panNumber: string;
  panPhotoUrl: string;
  bankDetails: {
    bankName?: string;
    accountHolder?: string;
    accountNumber?: string;
    ifscCode?: string;
    branchName?: string;
    upiId?: string;
  };
  approvalStatus: 'pending' | 'approved' | 'rejected';
  kycStatus: string;
  submittedAt: string;
  rejectionReason?: string;
  totalSubscribers?: number;
  totalViews?: number;
  totalAds?: number;
  sourceCollection: 'channel_submissions' | 'channels';
}

export interface UserAccountSummary {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  role: 'viewer' | 'creator' | 'admin';
  channelStatus: 'none' | 'pending' | 'approved' | 'rejected';
  channelId?: string;
  channelName?: string;
  mobileNumber?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

/**
 * Fetch categorized user profiles and BundeliTube Partner Program (BPP) applications
 * Deduplicates multiple pending entries so admin sees each applicant once.
 */
export async function getChannelApplicationsAndUsers() {
  const pendingMap = new Map<string, ChannelApplicationRecord>();
  const partnerMap = new Map<string, ChannelApplicationRecord>();
  const rejectedMap = new Map<string, ChannelApplicationRecord>();
  const allUsersMap = new Map<string, UserAccountSummary>();

  // 1. Read channel_submissions
  try {
    const subSnap = await getDocs(collection(db, 'channel_submissions'));
    subSnap.forEach(docSnap => {
      const data = docSnap.data() as any;
      const ownerUid = data.ownerUid || docSnap.id;
      if (!ownerUid) return;

      const rawPhoto = data.panPhotoUrl || data.panPhoto || data.panCardPhoto || data.panCardPhotoUrl || data.panFrontPhotoUrl || data.aadhaarPhotoUrl || data.aadhaarFrontPhotoUrl || data.frontPhotoUrl || data.kycPhotoUrl || data.documentPhotoUrl || data.documentUrl || '';

      const chanName = data.channelName || data.name || 'बुंदेली चैनल';
      const cleanSegment = chanName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'CREATOR';
      const mobileClean = (data.mobileNumber || data.phone || '').replace(/\D/g, '');
      const last4 = mobileClean.slice(-4) || ownerUid.slice(-4).toUpperCase() || '2026';
      const cleanChanId = (data.id && data.id.startsWith('BT-CH-')) ? data.id : (docSnap.id.startsWith('BT-CH-') ? docSnap.id : `BT-CH-${cleanSegment}-${last4}`);

      const record: ChannelApplicationRecord = {
        id: cleanChanId,
        submissionId: docSnap.id,
        channelId: cleanChanId,
        ownerUid,
        channelName: chanName,
        channelHandle: data.channelHandle || data.handle || `@${chanName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        channelAvatar: data.channelAvatar || data.channelLogoUrl || data.avatarUrl || data.avatar || data.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        category: data.category || 'music',
        mobileNumber: mobileClean,
        panCardHolderName: data.panCardHolderName || data.panName || data.accountHolder || '',
        panNumber: data.panNumber || data.panCardNumber || data.documentNumber || '',
        panPhotoUrl: rawPhoto,
        bankDetails: {
          bankName: data.bankName || data.bankDetails?.bankName,
          accountHolder: data.accountHolder || data.panCardHolderName || data.panName,
          accountNumber: data.accountNumber || data.bankDetails?.accountNumber,
          ifscCode: data.ifscCode || data.bankDetails?.ifscCode,
          branchName: data.branchName || data.bankDetails?.branchName,
          upiId: data.upiId || data.bankDetails?.upiId
        },
        approvalStatus: (data.status === 'approved' || data.approvalStatus === 'approved') ? 'approved' : (data.status === 'rejected' || data.approvalStatus === 'rejected') ? 'rejected' : 'pending',
        kycStatus: data.kycStatus || 'pending',
        submittedAt: data.submittedAt || data.createdAt || new Date().toISOString(),
        rejectionReason: data.rejectionReason,
        sourceCollection: 'channel_submissions'
      };

      if (record.approvalStatus === 'approved') {
        partnerMap.set(ownerUid, record);
      } else if (record.approvalStatus === 'rejected') {
        rejectedMap.set(ownerUid, record);
      } else {
        // Pending approval
        pendingMap.set(ownerUid, record);
      }
    });
  } catch (err) {
    console.warn('Error reading channel_submissions:', err);
  }

  // 2. Read channels collection for active partners and legacy pending clean-up
  try {
    const chanSnap = await getDocs(collection(db, 'channels'));
    chanSnap.forEach(docSnap => {
      const data = docSnap.data() as any;
      const ownerUid = data.ownerUid || data.uid || docSnap.id;
      if (!ownerUid) return;

      const isApproved = data.approvalStatus === 'approved' || data.status === 'approved' || data.isVerified === true;
      const isPending = !isApproved && (data.approvalStatus === 'pending' || data.status === 'pending');

      const rawPhoto = data.panPhotoUrl || data.panPhoto || data.panCardPhoto || data.panCardPhotoUrl || data.panFrontPhotoUrl || data.aadhaarPhotoUrl || data.kycPhotoUrl || '';
      const chanName = data.name || data.channelName || 'बुंदेली चैनल';

      if (isApproved) {
        if (!partnerMap.has(ownerUid)) {
          partnerMap.set(ownerUid, {
            id: docSnap.id,
            submissionId: docSnap.id,
            channelId: docSnap.id,
            ownerUid,
            channelName: chanName,
            channelHandle: data.handle || `@${chanName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            channelAvatar: data.avatar || data.channelLogoUrl || data.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            category: data.category || 'music',
            mobileNumber: data.mobileNumber || '',
            panCardHolderName: data.panCardHolderName || data.panName || '',
            panNumber: data.panNumber || '',
            panPhotoUrl: rawPhoto,
            bankDetails: {
              bankName: data.bankDetails?.bankName || data.bankName,
              accountHolder: data.bankDetails?.accountHolder || data.panCardHolderName,
              accountNumber: data.bankDetails?.accountNumber || data.accountNumber,
              ifscCode: data.bankDetails?.ifscCode || data.ifscCode,
              branchName: data.bankDetails?.branchName || data.branchName,
              upiId: data.bankDetails?.upiId || data.upiId
            },
            approvalStatus: 'approved',
            kycStatus: 'verified',
            submittedAt: data.createdAt || data.joinedDate || new Date().toISOString(),
            totalSubscribers: Number(data.subscribers || 0),
            totalViews: Number(data.totalViews || 0),
            totalAds: Number(data.totalAdImpressions || data.total_long_impressions || 0),
            sourceCollection: 'channels'
          });
        }
        // If partner already approved, remove any lingering pending entry
        pendingMap.delete(ownerUid);
      } else if (isPending && !partnerMap.has(ownerUid)) {
        // If not already in pending from channel_submissions, add it
        if (!pendingMap.has(ownerUid)) {
          pendingMap.set(ownerUid, {
            id: docSnap.id,
            submissionId: docSnap.id,
            channelId: docSnap.id,
            ownerUid,
            channelName: chanName,
            channelHandle: data.handle || `@${chanName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            channelAvatar: data.avatar || data.channelLogoUrl || data.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            category: data.category || 'music',
            mobileNumber: data.mobileNumber || '',
            panCardHolderName: data.panCardHolderName || data.panName || '',
            panNumber: data.panNumber || '',
            panPhotoUrl: rawPhoto,
            bankDetails: {
              bankName: data.bankDetails?.bankName || data.bankName,
              accountHolder: data.bankDetails?.accountHolder || data.panCardHolderName,
              accountNumber: data.bankDetails?.accountNumber || data.accountNumber,
              ifscCode: data.bankDetails?.ifscCode || data.ifscCode,
              branchName: data.bankDetails?.branchName || data.branchName,
              upiId: data.bankDetails?.upiId || data.upiId
            },
            approvalStatus: 'pending',
            kycStatus: 'pending',
            submittedAt: data.createdAt || new Date().toISOString(),
            sourceCollection: 'channels'
          });
        }
      }
    });
  } catch (err) {
    console.warn('Error reading channels:', err);
  }

  // 3. Read users collection to separate Normal Users (दर्शकों / व्यूवर्स) vs Creators
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    usersSnap.forEach(docSnap => {
      const u = docSnap.data() as any;
      const uid = docSnap.id;
      allUsersMap.set(uid, {
        uid,
        name: u.name || 'उपयोगकर्ता',
        email: u.email || '',
        avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        role: (partnerMap.has(uid) || u.role === 'creator') ? 'creator' : (u.role === 'admin' ? 'admin' : 'viewer'),
        channelStatus: partnerMap.has(uid) ? 'approved' : (pendingMap.has(uid) ? 'pending' : (u.channelStatus || 'none')),
        channelId: u.channelId || partnerMap.get(uid)?.id || pendingMap.get(uid)?.id,
        channelName: u.channelName || partnerMap.get(uid)?.channelName || pendingMap.get(uid)?.channelName,
        mobileNumber: u.mobileNumber || partnerMap.get(uid)?.mobileNumber || pendingMap.get(uid)?.mobileNumber || '',
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt
      });
    });
  } catch (err) {
    console.warn('Error reading users:', err);
  }

  // Normal users are those without an approved partner channel
  const normalUsers: UserAccountSummary[] = [];
  allUsersMap.forEach(user => {
    if (!partnerMap.has(user.uid) && user.role !== 'admin') {
      normalUsers.push(user);
    }
  });

  return {
    success: true,
    pendingApplications: Array.from(pendingMap.values()),
    partnerChannels: Array.from(partnerMap.values()),
    normalUsers,
    rejectedApplications: Array.from(rejectedMap.values()),
    counts: {
      pending: pendingMap.size,
      partners: partnerMap.size,
      normalUsers: normalUsers.length,
      rejected: rejectedMap.size
    }
  };
}

/**
 * Approve a channel application: Promotes applicant to active BundeliTube Partner Program creator
 */
export async function approveChannelApplication(id: string, adminNote?: string) {
  let targetSub: any = null;
  let targetDocId = id;

  // Find document in channel_submissions
  const subRef = doc(db, 'channel_submissions', id);
  const subSnap = await getDoc(subRef).catch(() => null);

  if (subSnap && subSnap.exists()) {
    targetSub = subSnap.data();
    targetDocId = subSnap.id;
  } else {
    // Look up by ownerUid
    const q = query(collection(db, 'channel_submissions'), where('ownerUid', '==', id));
    const qs = await getDocs(q).catch(() => null);
    if (qs && !qs.empty) {
      targetSub = qs.docs[0].data();
      targetDocId = qs.docs[0].id;
    } else {
      // Look in channels collection
      const chanSnap = await getDoc(doc(db, 'channels', id)).catch(() => null);
      if (chanSnap && chanSnap.exists()) {
        targetSub = chanSnap.data();
        targetDocId = chanSnap.id;
      }
    }
  }

  if (!targetSub) {
    throw new Error(`Channel application not found for ID: ${id}`);
  }

  const ownerUid = targetSub.ownerUid || targetSub.uid || id;
  const chanName = targetSub.channelName || targetSub.name || 'बुंदेली चैनल';
  const cleanSegment = chanName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'CREATOR';
  const mobileClean = (targetSub.mobileNumber || targetSub.phone || '').replace(/\D/g, '');
  const last4 = mobileClean.slice(-4) || ownerUid.slice(-4).toUpperCase() || '2026';
  const finalChanId = (targetDocId && targetDocId.startsWith('BT-CH-')) ? targetDocId : `BT-CH-${cleanSegment}-${last4}`;

  const rawPhoto = targetSub.panPhotoUrl || targetSub.panPhoto || targetSub.panCardPhoto || targetSub.panCardPhotoUrl || targetSub.panFrontPhotoUrl || targetSub.aadhaarPhotoUrl || targetSub.frontPhotoUrl || targetSub.kycPhotoUrl || '';
  const effectiveAvatar = targetSub.channelAvatar || targetSub.channelLogoUrl || targetSub.avatarUrl || targetSub.avatar || targetSub.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

  // 1. Update channel_submissions to approved
  await setDoc(doc(db, 'channel_submissions', targetDocId), {
    ...targetSub,
    id: finalChanId,
    status: 'approved',
    approvalStatus: 'approved',
    kycStatus: 'verified',
    approvedAt: new Date().toISOString(),
    adminNote: adminNote || 'Admin website approved'
  }, { merge: true });

  // 2. Provision active channel in channels collection
  await setDoc(doc(db, 'channels', finalChanId), {
    id: finalChanId,
    ownerUid,
    name: chanName,
    handle: targetSub.channelHandle || targetSub.handle || `@${chanName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    avatar: effectiveAvatar,
    channelLogoUrl: effectiveAvatar,
    logo: effectiveAvatar,
    banner: targetSub.banner || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
    subscribers: Number(targetSub.subscribers || 0),
    totalViews: Number(targetSub.totalViews || 0),
    videoCount: Number(targetSub.videoCount || 0),
    cpmRate: Number(targetSub.cpmRate || 35.00),
    isVerified: true,
    approvalStatus: 'approved',
    kycStatus: 'verified',
    status: 'approved',
    partnerProgramStatus: 'active',
    category: targetSub.category || 'music',
    mobileNumber: mobileClean,
    panCardHolderName: targetSub.panCardHolderName || targetSub.panName || '',
    panNumber: targetSub.panNumber || targetSub.panCardNumber || '',
    panPhotoUrl: rawPhoto,
    bankDetails: targetSub.bankDetails || {
      bankName: targetSub.bankName,
      accountHolder: targetSub.accountHolder || targetSub.panCardHolderName,
      accountNumber: targetSub.accountNumber,
      ifscCode: targetSub.ifscCode,
      branchName: targetSub.branchName,
      upiId: targetSub.upiId
    },
    approvedAt: new Date().toISOString(),
    createdAt: targetSub.createdAt || targetSub.submittedAt || new Date().toISOString()
  }, { merge: true });

  // 3. Clean up any duplicate legacy documents in channels collection
  if (finalChanId !== `chan-${ownerUid}`) {
    deleteDoc(doc(db, 'channels', `chan-${ownerUid}`)).catch(() => {});
  }
  if (finalChanId !== ownerUid) {
    deleteDoc(doc(db, 'channels', ownerUid)).catch(() => {});
  }

  // 4. Update user profile to creator
  await setDoc(doc(db, 'users', ownerUid), {
    role: 'creator',
    channelStatus: 'approved',
    approvalStatus: 'approved',
    partnerProgramStatus: 'active',
    channelId: finalChanId,
    channelName: chanName,
    avatar: effectiveAvatar,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  // 5. Ensure wallet is initialized
  const walletRef = doc(db, 'wallets', ownerUid);
  const wDoc = await getDoc(walletRef).catch(() => null);
  if (!wDoc || !wDoc.exists()) {
    await setDoc(walletRef, {
      creatorUid: ownerUid,
      channelId: finalChanId,
      currentBalance: 0,
      walletBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      minWithdrawalLimit: 5000,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  }

  return {
    success: true,
    message: `चैनल "${chanName}" (ID: ${finalChanId}) को बुन्देली ट्यूब पार्टनर प्रोग्राम में सफलतापूर्वक अनुमोदित किया गया।`,
    channelId: finalChanId,
    ownerUid
  };
}

/**
 * Reject a channel application
 */
export async function rejectChannelApplication(id: string, reason?: string) {
  const subRef = doc(db, 'channel_submissions', id);
  const subSnap = await getDoc(subRef).catch(() => null);

  let ownerUid = id;
  if (subSnap && subSnap.exists()) {
    ownerUid = subSnap.data().ownerUid || id;
    await updateDoc(subRef, {
      status: 'rejected',
      approvalStatus: 'rejected',
      kycStatus: 'not_submitted',
      rejectionReason: reason || 'केवाईसी / पहचान विवरण का सत्यापन पूर्ण नहीं हो सका।',
      rejectedAt: new Date().toISOString()
    }).catch(() => null);
  }

  // Remove pending channel from channels
  deleteDoc(doc(db, 'channels', id)).catch(() => {});
  deleteDoc(doc(db, 'channels', `chan-${ownerUid}`)).catch(() => {});
  deleteDoc(doc(db, 'channels', ownerUid)).catch(() => {});

  // Set user role to viewer
  await setDoc(doc(db, 'users', ownerUid), {
    role: 'viewer',
    channelStatus: 'rejected',
    partnerProgramStatus: 'rejected',
    rejectionReason: reason || 'केवाईसी सत्यापन विफल',
    updatedAt: new Date().toISOString()
  }, { merge: true }).catch(() => null);

  return {
    success: true,
    message: `चैनल आवेदन (ID: ${id}) को अस्वीकार कर दिया गया।`,
    id
  };
}


