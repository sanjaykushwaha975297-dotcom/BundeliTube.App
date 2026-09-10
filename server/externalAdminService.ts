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

