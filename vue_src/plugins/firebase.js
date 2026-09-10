import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY || "AIzaSyDummyKey_BundeliTube",
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN || "bundelitube.firebaseapp.com",
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID || "bundelitube",
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET || "bundelitube.appspot.com",
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID || "732753075583",
  appId: process.env.VUE_APP_FIREBASE_APP_ID || "1:732753075583:web:dummy"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();

/**
 * 1 Like per Video strictly saved to localStorage & Firestore
 */
export async function recordVideoLike(videoId, userId, isLiked) {
  try {
    const saved = JSON.parse(localStorage.getItem('bt_liked_videos') || '{}');
    if (isLiked) {
      saved[videoId] = true;
    } else {
      delete saved[videoId];
    }
    localStorage.setItem('bt_liked_videos', JSON.stringify(saved));

    const videoRef = db.collection('videos').doc(videoId);
    await videoRef.update({
      likes: firebase.firestore.FieldValue.increment(isLiked ? 1 : -1)
    });
  } catch (err) {
    console.warn('Like update error:', err);
  }
}

/**
 * 1 Subscription per Channel strictly saved to localStorage & Firestore
 */
export async function recordSubscription(channelId, userId, isSubscribed) {
  try {
    const saved = JSON.parse(localStorage.getItem('bt_subscribed_channels') || '{}');
    if (isSubscribed) {
      saved[channelId] = true;
    } else {
      delete saved[channelId];
    }
    localStorage.setItem('bt_subscribed_channels', JSON.stringify(saved));

    const chanRef = db.collection('channels').doc(channelId);
    await chanRef.update({
      subscribers: firebase.firestore.FieldValue.increment(isSubscribed ? 1 : -1)
    });
  } catch (err) {
    console.warn('Sub update error:', err);
  }
}

export default firebase;
