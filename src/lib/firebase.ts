import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  memoryLocalCache,
  setLogLevel,
  Firestore,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs,
  serverTimestamp,
  increment,
  limit
} from 'firebase/firestore';

export {
  signInWithPopup,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  initializeFirestore,
  memoryLocalCache,
  setLogLevel,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  serverTimestamp,
  increment
};

export type { FirebaseUser, Auth, Firestore, FirebaseApp };

/**
 * Strips all undefined fields recursively so Firestore setDoc / addDoc never crashes with
 * "Unsupported field value: undefined" errors.
 * Preserves Firestore FieldValue sentinels (serverTimestamp, increment, deleteDoc, etc.), Date, and custom classes.
 */
function isPlainObject(val: any): boolean {
  if (val === null || typeof val !== 'object') return false;
  const proto = Object.getPrototypeOf(val);
  return proto === null || proto === Object.prototype;
}

export function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => (typeof item === 'object' && item !== null ? cleanFirestoreData(item) : item)) as any;
  }
  if (!isPlainObject(obj)) {
    // If it's a Firestore FieldValue, Date, Timestamp, or custom class instance, return as-is
    return obj;
  }
  
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue; // omit undefined
    } else if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        cleaned[key] = value.map(item => (typeof item === 'object' && item !== null ? cleanFirestoreData(item) : item));
      } else if (isPlainObject(value)) {
        cleaned[key] = cleanFirestoreData(value);
      } else {
        // Date, FieldValue, Timestamp, etc.
        cleaned[key] = value;
      }
    } else if (typeof value === 'string') {
      // 🛡️ Guard against Firestore 1,048,487 bytes limit on single properties (especially base64 images)
      if (value.length > 400000) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('avatar') || lowerKey.includes('logo')) {
          cleaned[key] = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
        } else if (lowerKey.includes('banner')) {
          cleaned[key] = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80';
        } else if (lowerKey.includes('thumbnail') || lowerKey.includes('image')) {
          cleaned[key] = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80';
        } else {
          // Truncate long text strings to safe size
          cleaned[key] = value.slice(0, 350000);
        }
      } else {
        cleaned[key] = value;
      }
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const authInstance = getAuthSafe();
  const currentUser = authInstance?.currentUser;
  
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connected Official Firebase Project: bundelitube-1c045 (BundeliTube Web)
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

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(firebaseConfig);
    }
  }
  return appInstance;
}

export function getAuthSafe(): Auth {
  if (!authInstance) {
    const app = getFirebaseApp();
    authInstance = getAuth(app);
    try {
      if (typeof window !== 'undefined' && browserLocalPersistence) {
        setPersistence(authInstance, browserLocalPersistence).catch((err) => {
          console.warn('Firebase setPersistence warning:', err);
        });
      }
    } catch (e) {
      console.warn('Firebase persistence init warning:', e);
    }
  }
  return authInstance;
}

export function getFirestoreSafe(): Firestore {
  if (!firestoreInstance) {
    const app = getFirebaseApp();
    try {
      setLogLevel('error');
      firestoreInstance = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
        ignoreUndefinedProperties: true,
        localCache: memoryLocalCache()
      });
    } catch {
      try {
        firestoreInstance = getFirestore(app);
      } catch (err) {
        console.warn('Firestore fallback instance note:', err);
      }
    }
  }
  return firestoreInstance!;
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Global Remote App Settings interface (read-only in public app)
export interface RemoteAppSettings {
  platformName: string;
  tagline: string;
  logoUrl: string;
  maintenanceMode: boolean;
  announcementBanner: string | null;
  withdrawalThreshold: number;
  creatorRevenuePercentage: number;
  adminRevenuePercentage: number;
  updatedAt?: string;
}

export const DEFAULT_REMOTE_SETTINGS: RemoteAppSettings = {
  platformName: "BundeliTube (बुन्देली ट्यूब)",
  tagline: "माटी की खुशबू, संगीत और क्रिएटर कमाई",
  logoUrl: "/icon.png",
  maintenanceMode: false,
  announcementBanner: null,
  withdrawalThreshold: 5000,
  creatorRevenuePercentage: 50,
  adminRevenuePercentage: 50
};

/**
 * Logs any viewer/user action to the 'user_activity' collection in Firebase
 */
export async function logUserActivity(activity: {
  action: string;
  category?: string;
  details?: string;
  videoId?: string;
  videoTitle?: string;
  channelName?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const db = getFirestoreSafe();
    const actId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const data = cleanFirestoreData({
      id: actId,
      action: activity.action,
      category: activity.category || 'viewer_action',
      details: activity.details || '',
      videoId: activity.videoId || '',
      videoTitle: activity.videoTitle || '',
      channelName: activity.channelName || '',
      userId: activity.userId || 'guest_viewer',
      userName: activity.userName || 'बुंदेली दर्शक',
      userEmail: activity.userEmail || '',
      timestamp: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
      ...(activity.metadata || {})
    });
    await setDoc(doc(db, 'user_activity', actId), data);
  } catch (err) {
    console.warn('Activity log note:', err);
  }
}

/**
 * Checks whether a user has already liked a video (with local cache fallback)
 */
export async function checkUserLikedVideo(videoId: string, userId?: string | null): Promise<boolean> {
  if (!videoId) return false;
  try {
    const saved = JSON.parse(localStorage.getItem('bt_liked_videos') || '{}');
    if (saved[videoId] === true) return true;
  } catch (_) {}

  const uid = userId || 'guest';
  try {
    const db = getFirestoreSafe();
    const likeDocId = `${uid}_${videoId}`;
    const likeDoc = await getDoc(doc(db, 'video_likes', likeDocId));
    if (likeDoc.exists()) {
      try {
        const saved = JSON.parse(localStorage.getItem('bt_liked_videos') || '{}');
        saved[videoId] = true;
        localStorage.setItem('bt_liked_videos', JSON.stringify(saved));
      } catch (_) {}
      return true;
    }
    const legacyLikeDoc = await getDoc(doc(db, 'likes', `like-${uid}-${videoId}`));
    if (legacyLikeDoc.exists()) {
      try {
        const saved = JSON.parse(localStorage.getItem('bt_liked_videos') || '{}');
        saved[videoId] = true;
        localStorage.setItem('bt_liked_videos', JSON.stringify(saved));
      } catch (_) {}
      return true;
    }
    return false;
  } catch (err) {
    console.warn('checkUserLikedVideo note:', err);
    return false;
  }
}

/**
 * Normalizes channelId and channelName into a consistent unique key
 */
export function normalizeChannelId(channelId?: string, channelName?: string): string {
  if (channelId && channelId !== 'chan-main' && channelId !== 'chan-default' && channelId.trim().length > 0) {
    return channelId.trim();
  }
  if (channelName && channelName.trim().length > 0) {
    const slug = channelName.trim().toLowerCase()
      .replace(/[\s\-_]+/g, '-')
      .replace(/[^\w\u0900-\u097F\-]/g, '');
    return `chan-${slug || 'creator'}`;
  }
  return 'chan-creator';
}

/**
 * Checks whether a user has already subscribed to a channel (with local cache fallback)
 */
export async function checkUserSubscribedChannel(
  channelId: string, 
  channelName?: string, 
  userId?: string | null
): Promise<boolean> {
  const normId = normalizeChannelId(channelId, channelName);
  try {
    const saved = JSON.parse(localStorage.getItem('bt_subscribed_channels') || '{}');
    if (saved[normId] === true || (channelId && saved[channelId] === true) || (channelName && saved[channelName.trim()] === true)) {
      return true;
    }
  } catch (_) {}

  if (!userId || userId === 'guest') return false;

  try {
    const db = getFirestoreSafe();
    const subDocId = `${userId}_${normId}`;
    const subDoc = await getDoc(doc(db, 'channel_subscribers', subDocId));
    if (subDoc.exists()) {
      try {
        const saved = JSON.parse(localStorage.getItem('bt_subscribed_channels') || '{}');
        saved[normId] = true;
        if (channelName) saved[channelName.trim()] = true;
        localStorage.setItem('bt_subscribed_channels', JSON.stringify(saved));
      } catch (_) {}
      return true;
    }
    const legacySubDoc = await getDoc(doc(db, 'subscriptions', `sub-${userId}-${normId}`));
    if (legacySubDoc.exists()) {
      try {
        const saved = JSON.parse(localStorage.getItem('bt_subscribed_channels') || '{}');
        saved[normId] = true;
        if (channelName) saved[channelName.trim()] = true;
        localStorage.setItem('bt_subscribed_channels', JSON.stringify(saved));
      } catch (_) {}
      return true;
    }
    return false;
  } catch (err) {
    console.warn('checkUserSubscribedChannel note:', err);
    return false;
  }
}

/**
 * Loads all active subscriptions for the logged-in user from Firestore
 * Restores them into local cache so page refresh or multi-device sync retains subscription state
 */
export async function fetchUserSubscriptionsFromFirestore(userId: string): Promise<Record<string, boolean>> {
  if (!userId || userId === 'guest') return {};
  try {
    const db = getFirestoreSafe();
    const q = query(collection(db, 'channel_subscribers'), where('subscriberUserId', '==', userId));
    const snap = await getDocs(q);
    const subMap: Record<string, boolean> = {};
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.creatorChannelId) subMap[data.creatorChannelId] = true;
      if (data.channelId) subMap[data.channelId] = true;
      if (data.channelName) subMap[data.channelName.trim()] = true;
    });

    const legacyQ = query(collection(db, 'subscriptions'), where('subscriberUserId', '==', userId));
    const legacySnap = await getDocs(legacyQ).catch(() => null);
    if (legacySnap) {
      legacySnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.creatorChannelId) subMap[data.creatorChannelId] = true;
        if (data.channelId) subMap[data.channelId] = true;
        if (data.channelName) subMap[data.channelName.trim()] = true;
      });
    }

    try {
      const existing = JSON.parse(localStorage.getItem('bt_subscribed_channels') || '{}');
      const merged = { ...existing, ...subMap };
      localStorage.setItem('bt_subscribed_channels', JSON.stringify(merged));
      localStorage.setItem(`bt_subs_${userId}`, JSON.stringify(merged));
    } catch (_) {}

    return subMap;
  } catch (err) {
    console.warn('fetchUserSubscriptionsFromFirestore note:', err);
    try {
      return JSON.parse(localStorage.getItem(`bt_subs_${userId}`) || localStorage.getItem('bt_subscribed_channels') || '{}');
    } catch (_) {
      return {};
    }
  }
}

/**
 * Record a video play/view event:
 * 1. Checks session memory to prevent duplicate view spam in same session
 * 2. Increments views on videos/{videoId} and channels/{channelId}
 * 3. Saves unique view record in 'video_views' & 'watch_history' collections
 * 4. Logs to 'user_activity'
 */
const recentViewCache = new Set<string>();

export async function recordVideoView(
  video: { id: string; title: string; channelName?: string; channelId?: string },
  user?: { id?: string; name?: string; email?: string } | null
) {
  if (!video?.id) return;
  const viewKey = `${user?.id || 'anon'}_${video.id}`;
  if (recentViewCache.has(viewKey)) {
    return; // Prevent duplicate rapid counting in same session
  }
  recentViewCache.add(viewKey);
  setTimeout(() => recentViewCache.delete(viewKey), 10 * 60 * 1000); // 10 minute cooldown per viewer

  try {
    const db = getFirestoreSafe();
    const nowIso = new Date().toISOString();

    // 1. Increment view count in videos document
    const videoRef = doc(db, 'videos', video.id);
    await setDoc(videoRef, {
      views: increment(1),
      viewsCount: increment(1),
      lastViewedAt: nowIso,
      serverTimestamp: serverTimestamp()
    }, { merge: true }).catch(() => {});

    // 2. Increment totalViews on channel document
    if (video.channelId) {
      await setDoc(doc(db, 'channels', video.channelId), {
        totalViews: increment(1),
        serverTimestamp: serverTimestamp()
      }, { merge: true }).catch(() => {});
    }

    // 3. Add to unique 'video_views' collection
    const viewDocId = `view-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await setDoc(doc(db, 'video_views', viewDocId), cleanFirestoreData({
      id: viewDocId,
      videoId: video.id,
      videoTitle: video.title,
      channelId: video.channelId || '',
      creatorChannelId: video.channelId || '',
      viewerUserId: user?.id || 'guest_viewer',
      userName: user?.name || 'बुंदेली दर्शक',
      userEmail: user?.email || '',
      timestamp: nowIso,
      createdAt: nowIso,
      serverTimestamp: serverTimestamp()
    })).catch(() => {});

    // 4. Add to watch_history collection
    const historyId = `watch-${user?.id || 'guest'}-${video.id}`;
    await setDoc(doc(db, 'watch_history', historyId), cleanFirestoreData({
      id: historyId,
      videoId: video.id,
      videoTitle: video.title,
      channelName: video.channelName || '',
      channelId: video.channelId || '',
      userId: user?.id || 'guest_viewer',
      userName: user?.name || 'बुंदेली दर्शक',
      userEmail: user?.email || '',
      viewedAt: nowIso,
      serverTimestamp: serverTimestamp()
    }), { merge: true }).catch(() => {});

    // 5. Log user activity
    await logUserActivity({
      action: 'video_view',
      category: 'playback',
      details: `देखा: ${video.title}`,
      videoId: video.id,
      videoTitle: video.title,
      channelName: video.channelName,
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email
    });
  } catch (err) {
    console.warn('recordVideoView error:', err);
  }
}

/**
 * Record a like or dislike on a video (One-Time / Toggle Action Logic):
 * 1. Updates likes counter in videos/{videoId}
 * 2. Saves/Deletes unique like doc in 'video_likes' (doc ID: `${userId}_${videoId}`)
 * 3. Keeps 'likes' collection synchronized
 */
export async function recordVideoLike(
  videoId: string,
  videoTitle: string,
  isLiked: boolean,
  user?: { id?: string; name?: string; email?: string; avatar?: string } | null,
  channelId?: string
) {
  if (!videoId) return;
  const uid = user?.id || 'guest';
  const likeDocId = `${uid}_${videoId}`;
  const legacyDocId = `like-${uid}-${videoId}`;

  // Instant local storage cache update
  try {
    const saved = JSON.parse(localStorage.getItem('bt_liked_videos') || '{}');
    if (isLiked) {
      saved[videoId] = true;
    } else {
      delete saved[videoId];
    }
    localStorage.setItem('bt_liked_videos', JSON.stringify(saved));
  } catch (_) {}

  try {
    const db = getFirestoreSafe();
    const likeDocRef = doc(db, 'video_likes', likeDocId);
    
    // Check current DB state to ensure 1-time strict idempotency
    const existingSnap = await getDoc(likeDocRef).catch(() => null);
    const alreadyLiked = Boolean(existingSnap && existingSnap.exists());
    if (isLiked === alreadyLiked) {
      return; // Already in desired state; do not double count
    }

    const videoRef = doc(db, 'videos', videoId);

    // 1. Update video document likes count safely
    await setDoc(videoRef, {
      likes: increment(isLiked ? 1 : -1),
      serverTimestamp: serverTimestamp()
    }, { merge: true }).catch(() => {});

    const nowIso = new Date().toISOString();

    if (isLiked) {
      const likePayload = cleanFirestoreData({
        id: likeDocId,
        userId: uid,
        userName: user?.name || 'बुंदेली दर्शक',
        userAvatar: user?.avatar || '',
        userEmail: user?.email || '',
        videoId,
        videoTitle,
        channelId: channelId || '',
        createdAt: nowIso,
        serverTimestamp: serverTimestamp()
      });

      // Write to both primary 'video_likes' and legacy 'likes'
      await setDoc(doc(db, 'video_likes', likeDocId), likePayload);
      await setDoc(doc(db, 'likes', legacyDocId), likePayload).catch(() => {});
    } else {
      // Unlike -> Delete documents
      await deleteDoc(doc(db, 'video_likes', likeDocId)).catch(() => {});
      await deleteDoc(doc(db, 'likes', legacyDocId)).catch(() => {});
    }

    await logUserActivity({
      action: isLiked ? 'video_like' : 'video_unlike',
      category: 'interaction',
      details: isLiked ? `पसंद किया: ${videoTitle}` : `पसंद हटाया: ${videoTitle}`,
      videoId,
      videoTitle,
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email
    });
  } catch (err) {
    console.warn('recordVideoLike error:', err);
  }
}

/**
 * Record a channel subscription event (One-Time / Toggle Action Logic):
 * 1. Strict Requirement: User MUST be logged in (uid !== 'guest' and has email/id).
 * 2. Increments / decrements channel subscribers in 'channels/{channelId}'
 * 3. Saves/Deletes unique subscription record in 'channel_subscribers' (doc ID: `${userId}_${normalizedChannelId}`)
 * 4. Keeps 'subscriptions' collection synchronized
 * 5. Returns { success: boolean, isSubscribed: boolean, subscribersCount?: number, error?: string }
 */
export async function recordSubscription(
  channelId: string,
  channelName: string,
  isSubscribed: boolean,
  user?: { id?: string; name?: string; email?: string; avatar?: string } | null
): Promise<{ success: boolean; isSubscribed: boolean; subscribersCount?: number; error?: string }> {
  // REQUIRE LOGIN: User MUST be logged in with Gmail / user account
  if (!user || !user.id || user.id === 'guest' || !user.email) {
    console.warn('Subscription rejected: User must be logged in with Gmail / account');
    return { success: false, isSubscribed: false, error: 'login_required' };
  }

  const normChannelId = normalizeChannelId(channelId, channelName);
  const uid = user.id;
  const subDocId = `${uid}_${normChannelId}`;
  const legacySubDocId = `sub-${uid}-${normChannelId}`;

  // Instant local storage cache update for both ID and Name
  try {
    const saved = JSON.parse(localStorage.getItem('bt_subscribed_channels') || '{}');
    if (isSubscribed) {
      saved[normChannelId] = true;
      if (channelId) saved[channelId] = true;
      if (channelName) saved[channelName.trim()] = true;
    } else {
      delete saved[normChannelId];
      if (channelId) delete saved[channelId];
      if (channelName) delete saved[channelName.trim()];
    }
    localStorage.setItem('bt_subscribed_channels', JSON.stringify(saved));
    localStorage.setItem(`bt_subs_${uid}`, JSON.stringify(saved));
  } catch (_) {}

  // Update bt_channels_v2 cache if present
  let updatedSubscribersCount: number | undefined;
  try {
    const savedChannelsStr = localStorage.getItem('bt_channels_v2');
    if (savedChannelsStr) {
      const channels = JSON.parse(savedChannelsStr);
      const ch = channels.find((c: any) => c.id === normChannelId || c.id === channelId || c.name === channelName);
      if (ch) {
        ch.subscribers = isSubscribed ? (ch.subscribers || 0) + 1 : Math.max(0, (ch.subscribers || 1) - 1);
        updatedSubscribersCount = ch.subscribers;
        localStorage.setItem('bt_channels_v2', JSON.stringify(channels));
      }
    }
  } catch (_) {}

  // Dispatch broadcast event so all open views (VideoPlayer, Shorts, ChannelModal) sync instantly
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bt_subscription_changed', {
      detail: {
        channelId: normChannelId,
        legacyChannelId: channelId,
        channelName: channelName?.trim(),
        isSubscribed,
        subscribersCount: updatedSubscribersCount,
        userId: uid
      }
    }));
  }

  try {
    const db = getFirestoreSafe();
    const subDocRef = doc(db, 'channel_subscribers', subDocId);

    // Check current DB state to ensure 1-time strict idempotency
    const existingSnap = await getDoc(subDocRef).catch(() => null);
    const alreadySubbed = Boolean(existingSnap && existingSnap.exists());
    if (isSubscribed === alreadySubbed) {
      return { success: true, isSubscribed, subscribersCount: updatedSubscribersCount }; // Already in desired state; do not double count
    }

    const channelRef = doc(db, 'channels', normChannelId);

    // 1. Update channel subscribers counter
    await setDoc(channelRef, {
      subscribers: increment(isSubscribed ? 1 : -1),
      channelName: channelName || '',
      id: normChannelId,
      serverTimestamp: serverTimestamp()
    }, { merge: true }).catch(() => {});

    const nowIso = new Date().toISOString();

    if (isSubscribed) {
      const subPayload = cleanFirestoreData({
        id: subDocId,
        subscriberUserId: uid,
        creatorChannelId: normChannelId,
        channelId: normChannelId,
        channelName: channelName?.trim() || '',
        subscriberName: user?.name || 'बुंदेली दर्शक',
        subscriberAvatar: user?.avatar || '',
        subscriberEmail: user?.email || '',
        createdAt: nowIso,
        subscribedAt: nowIso,
        serverTimestamp: serverTimestamp()
      });

      await setDoc(doc(db, 'channel_subscribers', subDocId), subPayload);
      await setDoc(doc(db, 'subscriptions', legacySubDocId), subPayload).catch(() => {});
    } else {
      await deleteDoc(doc(db, 'channel_subscribers', subDocId)).catch(() => {});
      await deleteDoc(doc(db, 'subscriptions', legacySubDocId)).catch(() => {});
    }

    await logUserActivity({
      action: isSubscribed ? 'channel_subscribe' : 'channel_unsubscribe',
      category: 'subscription',
      details: isSubscribed ? `सब्सक्राइब किया: ${channelName}` : `अनसब्सक्राइब किया: ${channelName}`,
      channelName,
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email
    });

    return { success: true, isSubscribed, subscribersCount: updatedSubscribersCount };
  } catch (err) {
    console.warn('recordSubscription error:', err);
    return { success: false, isSubscribed, error: String(err) };
  }
}

/**
 * Save comment to 'comments' collection in Firestore and trigger real-time notification to creator
 */
export async function saveCommentToFirestore(comment: {
  id: string;
  videoId: string;
  videoTitle?: string;
  author: string;
  avatar?: string;
  text: string;
  userId?: string;
  userEmail?: string;
  creatorId?: string;
  channelId?: string;
  parentId?: string;
}) {
  try {
    const db = getFirestoreSafe();
    const nowIso = new Date().toISOString();
    const commentData = cleanFirestoreData({
      id: comment.id,
      videoId: comment.videoId,
      videoTitle: comment.videoTitle || '',
      author: comment.author,
      userName: comment.author,
      avatar: comment.avatar || '',
      userAvatar: comment.avatar || '',
      text: comment.text,
      userId: comment.userId || 'guest',
      userEmail: comment.userEmail || '',
      creatorId: comment.creatorId || comment.channelId || '',
      creatorChannelId: comment.channelId || comment.creatorId || '',
      channelId: comment.channelId || comment.creatorId || '',
      parentId: comment.parentId || null,
      likes: 0,
      isHearted: false,
      isPinned: false,
      isQuestion: comment.text.includes('?') || comment.text.includes('क्या') || comment.text.includes('कब') || comment.text.includes('कहाँ') || comment.text.includes('कैसे'),
      createdAt: nowIso,
      serverTimestamp: serverTimestamp()
    });
    await setDoc(doc(db, 'comments', comment.id), commentData);

    // Trigger Real-Time In-App Notification to Video Creator
    const targetCreator = comment.creatorId || comment.channelId;
    if (targetCreator && targetCreator !== comment.userId) {
      const notifId = `notif-cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await setDoc(doc(db, 'users', targetCreator, 'notifications', notifId), cleanFirestoreData({
        id: notifId,
        title: '💬 नयी टिप्पणी (New Comment)',
        description: `${comment.author} ने आपकी वीडियो "${comment.videoTitle || 'बुंदेली वीडियो'}" पर टिप्पणी की: "${comment.text.slice(0, 80)}"`,
        timestamp: nowIso,
        isRead: false,
        type: 'comment',
        targetVideoId: comment.videoId,
        avatar: comment.avatar || '',
        openCommentSection: true,
        creatorId: targetCreator,
        createdAt: nowIso,
        serverTimestamp: serverTimestamp()
      })).catch((e) => console.warn('Creator comment notification note:', e));
    }

    await logUserActivity({
      action: 'comment_post',
      category: 'comment',
      details: `टिप्पणी की: "${comment.text.slice(0, 40)}..."`,
      videoId: comment.videoId,
      videoTitle: comment.videoTitle,
      userId: comment.userId,
      userName: comment.author,
      userEmail: comment.userEmail
    });
  } catch (err) {
    console.warn('saveCommentToFirestore error:', err);
  }
}

/**
 * Delete a comment from Firestore
 */
export async function deleteCommentFromFirestore(commentId: string) {
  try {
    const db = getFirestoreSafe();
    await deleteDoc(doc(db, 'comments', commentId));
    return true;
  } catch (err) {
    console.warn('deleteCommentFromFirestore error:', err);
    return false;
  }
}

/**
 * Toggle Creator Heart on a comment
 */
export async function toggleCommentHeartInFirestore(commentId: string, isHearted: boolean) {
  try {
    const db = getFirestoreSafe();
    await setDoc(doc(db, 'comments', commentId), {
      isHearted,
      serverTimestamp: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('toggleCommentHeartInFirestore error:', err);
    return false;
  }
}

/**
 * Toggle Pin on a comment
 */
export async function toggleCommentPinInFirestore(commentId: string, isPinned: boolean) {
  try {
    const db = getFirestoreSafe();
    await setDoc(doc(db, 'comments', commentId), {
      isPinned,
      serverTimestamp: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('toggleCommentPinInFirestore error:', err);
    return false;
  }
}

/**
 * Reply to a comment
 */
export async function replyToCommentInFirestore(parentComment: {
  id: string;
  videoId: string;
  videoTitle?: string;
  author: string;
  userId?: string;
}, replyData: {
  author: string;
  avatar?: string;
  text: string;
  userId?: string;
  creatorId?: string;
}) {
  try {
    const db = getFirestoreSafe();
    const replyId = `reply-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();
    
    await setDoc(doc(db, 'comments', replyId), cleanFirestoreData({
      id: replyId,
      videoId: parentComment.videoId,
      videoTitle: parentComment.videoTitle || '',
      parentId: parentComment.id,
      author: replyData.author,
      userName: replyData.author,
      avatar: replyData.avatar || '',
      userAvatar: replyData.avatar || '',
      text: replyData.text,
      userId: replyData.userId || 'guest',
      creatorId: replyData.creatorId || '',
      likes: 0,
      createdAt: nowIso,
      serverTimestamp: serverTimestamp()
    }));

    // Notify original commenter
    if (parentComment.userId && parentComment.userId !== replyData.userId) {
      const notifId = `notif-reply-${Date.now()}`;
      await setDoc(doc(db, 'users', parentComment.userId, 'notifications', notifId), cleanFirestoreData({
        id: notifId,
        title: '💬 टिप्पणी का उत्तर (Reply to your comment)',
        description: `${replyData.author} ने आपकी टिप्पणी का उत्तर दिया: "${replyData.text.slice(0, 80)}"`,
        timestamp: nowIso,
        isRead: false,
        type: 'comment_reply',
        targetVideoId: parentComment.videoId,
        createdAt: nowIso,
        serverTimestamp: serverTimestamp()
      })).catch(() => {});
    }

    return replyId;
  } catch (err) {
    console.warn('replyToCommentInFirestore error:', err);
    return null;
  }
}

/**
 * Delete video from 'videos' and 'video_submissions' collections in Firestore
 */
export async function deleteVideoFromFirestore(videoId: string) {
  try {
    const db = getFirestoreSafe();
    await deleteDoc(doc(db, 'videos', videoId)).catch(() => {});
    await deleteDoc(doc(db, 'video_submissions', videoId)).catch(() => {});
    return true;
  } catch (err) {
    console.warn('deleteVideoFromFirestore error:', err);
    return false;
  }
}

/**
 * Delete channel and reset creator role to viewer in Firestore
 */
export async function deleteChannelFromFirestore(channelId: string, ownerUid?: string) {
  try {
    const db = getFirestoreSafe();
    if (channelId) {
      await deleteDoc(doc(db, 'channels', channelId)).catch(() => {});
      await deleteDoc(doc(db, 'channel_submissions', channelId)).catch(() => {});
    }
    if (ownerUid) {
      await deleteDoc(doc(db, 'channels', ownerUid)).catch(() => {});
      await deleteDoc(doc(db, 'channels', `chan-${ownerUid}`)).catch(() => {});
      await deleteDoc(doc(db, 'channel_submissions', ownerUid)).catch(() => {});
      await setDoc(doc(db, 'users', ownerUid), cleanFirestoreData({
        role: 'viewer',
        channelStatus: 'none',
        channelId: null,
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      }), { merge: true }).catch(() => {});
    }
    return true;
  } catch (err) {
    console.warn('deleteChannelFromFirestore error:', err);
    return false;
  }
}

/**
 * Update channel logo in Firestore and propagate to user profile, channel submissions, and all videos & video submissions
 */
export async function updateChannelLogoGlobally(channelId: string, ownerUid: string, newLogoUrl: string, channelName?: string) {
  if (!newLogoUrl) return false;
  try {
    const db = getFirestoreSafe();
    const cleanChanName = channelName ? channelName.trim() : undefined;
    
    // 1. Update channel document by channelId
    if (channelId) {
      await setDoc(doc(db, 'channels', channelId), cleanFirestoreData({
        avatar: newLogoUrl,
        channelLogoUrl: newLogoUrl,
        logo: newLogoUrl,
        name: cleanChanName,
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      }), { merge: true }).catch(() => {});
    }

    // 2. Update channel document by ownerUid
    if (ownerUid && ownerUid !== channelId) {
      await setDoc(doc(db, 'channels', ownerUid), cleanFirestoreData({
        avatar: newLogoUrl,
        channelLogoUrl: newLogoUrl,
        logo: newLogoUrl,
        name: cleanChanName,
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      }), { merge: true }).catch(() => {});
    }

    // 3. Update user profile document
    if (ownerUid) {
      await setDoc(doc(db, 'users', ownerUid), cleanFirestoreData({
        avatar: newLogoUrl,
        channelLogoUrl: newLogoUrl,
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      }), { merge: true }).catch(() => {});
    }

    // 4. Propagate to channel submissions
    if (ownerUid) {
      await setDoc(doc(db, 'channel_submissions', ownerUid), cleanFirestoreData({
        channelLogoUrl: newLogoUrl,
        channelAvatar: newLogoUrl,
        avatarUrl: newLogoUrl,
        channelName: cleanChanName,
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      }), { merge: true }).catch(() => {});
    }
    if (channelId && channelId !== ownerUid) {
      await setDoc(doc(db, 'channel_submissions', channelId), cleanFirestoreData({
        channelLogoUrl: newLogoUrl,
        channelAvatar: newLogoUrl,
        avatarUrl: newLogoUrl,
        channelName: cleanChanName,
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      }), { merge: true }).catch(() => {});
    }

    // 5. Update ALL videos in Firestore belonging to this channel
    try {
      const videosCol = collection(db, 'videos');
      const vSnap = await getDocs(videosCol).catch(() => null);
      if (vSnap && !vSnap.empty) {
        const updatePromises: Promise<any>[] = [];
        vSnap.forEach((docSnap) => {
          const vData = docSnap.data();
          const matches =
            (channelId && vData.channelId === channelId) ||
            (ownerUid && (vData.creatorUid === ownerUid || vData.uploaderUid === ownerUid || vData.creatorId === ownerUid)) ||
            (cleanChanName && (
              (vData.channelName && vData.channelName.trim().toLowerCase() === cleanChanName.toLowerCase()) ||
              (vData.artist && vData.artist.trim().toLowerCase() === cleanChanName.toLowerCase())
            ));
          
          if (matches) {
            updatePromises.push(
              updateDoc(doc(db, 'videos', docSnap.id), {
                channelAvatar: newLogoUrl,
                uploaderAvatar: newLogoUrl,
                updatedAt: new Date().toISOString()
              }).catch(() => {})
            );
          }
        });
        if (updatePromises.length > 0) {
          await Promise.allSettled(updatePromises);
        }
      }
    } catch (e) {
      console.warn('Error updating videos in Firestore with new logo:', e);
    }

    // 6. Update ALL video submissions in Firestore belonging to this channel
    try {
      const vidSubCol = collection(db, 'video_submissions');
      const sSnap = await getDocs(vidSubCol).catch(() => null);
      if (sSnap && !sSnap.empty) {
        const subPromises: Promise<any>[] = [];
        sSnap.forEach((docSnap) => {
          const sData = docSnap.data();
          const matches =
            (channelId && sData.channelId === channelId) ||
            (ownerUid && (sData.creatorUid === ownerUid || sData.uploaderUid === ownerUid)) ||
            (cleanChanName && (
              (sData.channelName && sData.channelName.trim().toLowerCase() === cleanChanName.toLowerCase()) ||
              (sData.artist && sData.artist.trim().toLowerCase() === cleanChanName.toLowerCase())
            ));

          if (matches) {
            subPromises.push(
              updateDoc(doc(db, 'video_submissions', docSnap.id), {
                channelAvatar: newLogoUrl,
                uploaderAvatar: newLogoUrl,
                updatedAt: new Date().toISOString()
              }).catch(() => {})
            );
          }
        });
        if (subPromises.length > 0) {
          await Promise.allSettled(subPromises);
        }
      }
    } catch (e) {
      console.warn('Error updating video submissions in Firestore with new logo:', e);
    }

    return true;
  } catch (err) {
    console.warn('updateChannelLogoGlobally error:', err);
    return false;
  }
}

/**
 * Record Search query to 'search_logs' and 'user_activity'
 */
export async function recordSearchQuery(searchQuery: string, user?: { id?: string; name?: string; email?: string } | null) {
  if (!searchQuery.trim()) return;
  try {
    const db = getFirestoreSafe();
    const searchId = `srch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await setDoc(doc(db, 'search_logs', searchId), cleanFirestoreData({
      id: searchId,
      query: searchQuery.trim(),
      userId: user?.id || 'guest_viewer',
      userName: user?.name || 'बुंदेली दर्शक',
      userEmail: user?.email || '',
      searchedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    }));

    await logUserActivity({
      action: 'search_query',
      category: 'search',
      details: `सर्च: "${searchQuery.trim()}"`,
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email
    });
  } catch (err) {
    console.warn('recordSearchQuery error:', err);
  }
}

/**
 * Record Super Thanks / Tip in 'super_thanks' collection
 */
export async function recordSuperThanks(thanks: {
  id: string;
  videoId: string;
  videoTitle: string;
  channelName: string;
  amount: number;
  message: string;
  senderName: string;
  senderUid?: string;
}) {
  try {
    const db = getFirestoreSafe();
    await setDoc(doc(db, 'super_thanks', thanks.id), cleanFirestoreData({
      ...thanks,
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    }));

    await logUserActivity({
      action: 'super_thanks',
      category: 'monetization',
      details: `सुपर थैंक्स ₹${thanks.amount}: ${thanks.channelName} (${thanks.videoTitle})`,
      videoId: thanks.videoId,
      videoTitle: thanks.videoTitle,
      channelName: thanks.channelName,
      userId: thanks.senderUid,
      userName: thanks.senderName
    });
  } catch (err) {
    console.warn('recordSuperThanks error:', err);
  }
}

/**
 * Record Save to Playlist / Watch Later
 */
export async function recordSaveToPlaylist(item: {
  videoId: string;
  videoTitle: string;
  playlistName: string;
  userId?: string;
  userName?: string;
}) {
  try {
    const db = getFirestoreSafe();
    const pid = `pl-${item.userId || 'guest'}-${item.playlistName}-${item.videoId}`;
    await setDoc(doc(db, 'playlists', pid), cleanFirestoreData({
      id: pid,
      playlistName: item.playlistName,
      videoId: item.videoId,
      videoTitle: item.videoTitle,
      userId: item.userId || 'guest',
      userName: item.userName || 'बुंदेली दर्शक',
      savedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    }), { merge: true });

    await logUserActivity({
      action: 'playlist_save',
      category: 'playlist',
      details: `प्लेलिस्ट में जोड़ा (${item.playlistName}): ${item.videoTitle}`,
      videoId: item.videoId,
      videoTitle: item.videoTitle,
      userId: item.userId,
      userName: item.userName
    });
  } catch (err) {
    console.warn('recordSaveToPlaylist error:', err);
  }
}

/**
 * Creates or updates a Support Ticket in 'support_tickets' collection in Firestore
 */
export async function createSupportTicketInFirestore(ticket: {
  id: string;
  category: string;
  subject: string;
  message: string;
  email?: string;
  phone?: string;
  userId?: string;
  userName?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
}) {
  try {
    const db = getFirestoreSafe();
    const docData = cleanFirestoreData({
      id: ticket.id,
      category: ticket.category,
      subject: ticket.subject,
      message: ticket.message,
      email: ticket.email || '',
      phone: ticket.phone || '',
      userId: ticket.userId || 'guest_viewer',
      userName: ticket.userName || 'बुंदेली दर्शक',
      status: ticket.status || 'open',
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    });
    await setDoc(doc(db, 'support_tickets', ticket.id), docData);

    // Also mirror to support_messages, messages, and sms so external admin panel can read it anywhere
    const initialMsgData = cleanFirestoreData({
      id: `msg-${ticket.id}`,
      chatId: ticket.id,
      ticketId: ticket.id,
      userId: ticket.userId || 'guest_viewer',
      senderId: ticket.userId || 'guest_viewer',
      senderName: ticket.userName || 'बुंदेली दर्शक',
      senderRole: 'user',
      text: ticket.message,
      message: ticket.message,
      sms: ticket.message,
      subject: ticket.subject,
      category: ticket.category,
      userEmail: ticket.email || '',
      phone: ticket.phone || '',
      status: 'open',
      createdAt: docData.createdAt,
      timestamp: docData.createdAt,
      serverTimestamp: serverTimestamp()
    });
    setDoc(doc(db, 'support_messages', `msg-${ticket.id}`), initialMsgData).catch(() => {});
    setDoc(doc(db, 'messages', `msg-${ticket.id}`), initialMsgData).catch(() => {});
    setDoc(doc(db, 'sms', `msg-${ticket.id}`), initialMsgData).catch(() => {});

    await logUserActivity({
      action: 'support_ticket_created',
      category: 'support',
      details: `सपोर्ट टिकट #${ticket.id}: ${ticket.subject} (${ticket.category})`,
      userId: ticket.userId,
      userName: ticket.userName,
      userEmail: ticket.email
    });
    return true;
  } catch (err) {
    console.warn('createSupportTicketInFirestore error:', err);
    return false;
  }
}

/**
 * Sends a real-time message / SMS to 'support_messages', 'messages', and 'sms' collections in Firestore
 * ensuring full compatibility with any external admin website implementation.
 */
export async function sendLiveChatMessageToFirestore(msg: {
  id?: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin' | 'agent' | 'bot' | 'creator';
  text: string;
  userEmail?: string;
  phone?: string;
}) {
  try {
    const db = getFirestoreSafe();
    const msgId = msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();
    
    // Comprehensive message payload with all field conventions
    const msgData = cleanFirestoreData({
      id: msgId,
      chatId: msg.chatId,
      userId: msg.senderId,
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderRole: msg.senderRole,
      text: msg.text,
      message: msg.text,
      sms: msg.text,
      content: msg.text,
      body: msg.text,
      userEmail: msg.userEmail || '',
      phone: msg.phone || '',
      status: 'sent',
      isRead: false,
      createdAt: nowIso,
      timestamp: nowIso,
      serverTimestamp: serverTimestamp()
    });

    // 1. Write to support_messages
    setDoc(doc(db, 'support_messages', msgId), msgData).catch(e => console.warn('support_messages write error:', e));

    // 2. Write to messages collection
    setDoc(doc(db, 'messages', msgId), msgData).catch(e => console.warn('messages write error:', e));

    // 3. Write to sms collection
    setDoc(doc(db, 'sms', msgId), msgData).catch(e => console.warn('sms write error:', e));

    // 4. Also update/touch the support chat conversation document in support_tickets
    setDoc(doc(db, 'support_tickets', msg.chatId), cleanFirestoreData({
      id: msg.chatId,
      lastMessage: msg.text,
      lastSender: msg.senderName,
      lastSenderRole: msg.senderRole,
      lastUpdated: nowIso,
      userId: msg.senderId,
      userName: msg.senderName,
      userEmail: msg.userEmail || '',
      phone: msg.phone || '',
      status: 'open',
      serverTimestamp: serverTimestamp()
    }), { merge: true }).catch(() => {});

    // 5. If specific user, save in user's subcollection
    if (msg.senderId && msg.senderId !== 'guest' && !msg.senderId.startsWith('guest_')) {
      setDoc(doc(db, 'users', msg.senderId, 'messages', msgId), msgData).catch(() => {});
    }

    await logUserActivity({
      action: 'live_chat_message',
      category: 'support',
      details: `[${msg.senderRole}] ${msg.senderName}: ${msg.text.slice(0, 50)}`,
      userId: msg.senderId,
      userName: msg.senderName,
      userEmail: msg.userEmail
    });
    return msgId;
  } catch (err) {
    console.warn('sendLiveChatMessageToFirestore error:', err);
    return null;
  }
}

