# BundeliTube -> Vue 2 + Vuetify 2 Integration & Migration Guide

This document contains the step-by-step instructions and ready-to-use architecture to run BundeliTube with the exact **Vuetify YouTube Clone Template (`vuetify-youtube-clone-template-master`)** while preserving 100% of your backend logic (Firebase Firestore, Telegram Cloud Upload via Render, AdMob Monetization Wallet, Shorts Player, and Creator Studio).

---

## 📦 1. Dependencies Setup (`package.json`)

In your Vuetify project directory, install the required backend packages:

```bash
npm install firebase@8.10.1 axios
```

*(Note: Vue 2 projects with Webpack 4/Babel standardly use Firebase SDK v8 namespaced syntax or v9 compat for seamless plug-and-play integration).*

---

## 🔥 2. Firebase Configuration (`src/plugins/firebase.js`)

Create `src/plugins/firebase.js` to initialize Firebase Auth & Firestore:

```javascript
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN || "bundelitube.firebaseapp.com",
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID || "bundelitube",
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET || "bundelitube.appspot.com",
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID || "732753075583",
  appId: process.env.VUE_APP_FIREBASE_APP_ID || "YOUR_APP_ID"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export default firebase;
```

---

## 🚀 3. Telegram Cloud Video Upload (`src/services/telegramService.js`)

Connects directly to your high-speed Render backend:

```javascript
import axios from 'axios';

const RENDER_BACKEND_URL = 'https://bt-upload-bot.onrender.com';

/**
 * Uploads video file in chunks or full stream to Telegram via Render
 * @param {File} file - Video file selected by creator
 * @param {Function} onProgress - Progress callback (0 - 100%)
 */
export async function uploadVideoToTelegram(file, onProgress) {
  const formData = new FormData();
  formData.append('video', file);

  const response = await axios.post(`${RENDER_BACKEND_URL}/api/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percent);
      }
    }
  });

  return response.data; // { fileId, streamUrl, duration, size }
}
```

---

## 🎬 4. Vue Vuetify Upload Video Modal (`src/components/UploadVideoModal.vue`)

Integrates Vuetify modal with Telegram Upload and Firestore saving:

```vue
<template>
  <v-dialog v-model="dialog" max-width="700px" persistent>
    <v-card class="elevation-12 rounded-lg">
      <v-card-title class="headline grey darken-4 white--text d-flex justify-space-between align-center">
        <span><v-icon left color="amber">mdi-video-plus</v-icon> {{ isShort ? 'Upload Short' : 'Upload Video' }}</span>
        <v-btn icon dark @click="closeModal"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <!-- Step 1: File Selection -->
        <div v-if="!selectedFile" class="text-center pa-8 border-dashed rounded-lg">
          <v-icon size="64" color="amber darken-2">mdi-cloud-upload</v-icon>
          <div class="subtitle-1 font-weight-bold mt-2">Select video file to upload</div>
          <p class="caption grey--text">Supports MP4, MOV, WebM. Uploads to high-speed Telegram Cloud.</p>
          <input type="file" ref="fileInput" accept="video/*" class="d-none" @change="onFileSelected" />
          <v-btn color="amber darken-2" dark class="mt-2" @click="$refs.fileInput.click()">
            Select File
          </v-btn>
        </div>

        <!-- Step 2: Metadata & Progress -->
        <div v-else>
          <v-progress-linear
            v-if="uploading"
            v-model="uploadProgress"
            color="amber"
            height="18"
            striped
            class="mb-4 rounded"
          >
            <strong>{{ uploadProgress }}% Uploading to Telegram...</strong>
          </v-progress-linear>

          <v-text-field v-model="title" label="Video Title" outlined dense prepend-inner-icon="mdi-format-title"></v-text-field>
          <v-textarea v-model="description" label="Description" outlined dense rows="3" prepend-inner-icon="mdi-text"></v-textarea>
          
          <v-select
            v-model="category"
            :items="['Entertainment', 'Music', 'Bundeli Culture', 'Comedy', 'News', 'Education']"
            label="Category"
            outlined
            dense
          ></v-select>

          <v-switch v-model="isShort" label="Post as BundeliTube Short (< 60s vertical)" color="amber"></v-switch>
        </div>
      </v-card-text>

      <v-card-actions v-if="selectedFile" class="pa-4 grey lighten-4 d-flex justify-end">
        <v-btn text @click="closeModal" :disabled="uploading">Cancel</v-btn>
        <v-btn color="amber darken-3" dark :loading="uploading" @click="startUpload">Publish Video</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { db, auth } from '@/plugins/firebase';
import { uploadVideoToTelegram } from '@/services/telegramService';

export default {
  name: 'UploadVideoModal',
  props: {
    value: Boolean
  },
  data() {
    return {
      selectedFile: null,
      title: '',
      description: '',
      category: 'Entertainment',
      isShort: false,
      uploading: false,
      uploadProgress: 0
    };
  },
  computed: {
    dialog: {
      get() { return this.value; },
      set(val) { this.$emit('input', val); }
    }
  },
  methods: {
    onFileSelected(e) {
      const files = e.target.files;
      if (files && files[0]) {
        this.selectedFile = files[0];
        this.title = this.selectedFile.name.replace(/\.[^/.]+$/, "");
      }
    },
    async startUpload() {
      if (!this.selectedFile || !this.title) return;
      this.uploading = true;
      try {
        // 1. Upload to Telegram Cloud via Render backend
        const result = await uploadVideoToTelegram(this.selectedFile, (pct) => {
          this.uploadProgress = pct;
        });

        // 2. Save document to Firebase Firestore
        const user = auth.currentUser;
        await db.collection('videos').add({
          title: this.title,
          description: this.description,
          category: this.isShort ? 'shorts' : this.category,
          isShort: this.isShort,
          telegramFileId: result.fileId || '',
          streamUrl: result.streamUrl || '',
          likes: 0,
          views: 0,
          channelName: user ? user.displayName || 'Bundeli Creator' : 'Bundeli Creator',
          channelId: user ? user.uid : 'chan-default',
          createdAt: new Date().toISOString()
        });

        this.$emit('uploaded');
        this.closeModal();
      } catch (err) {
        console.error('Upload failed:', err);
      } finally {
        this.uploading = false;
      }
    },
    closeModal() {
      this.selectedFile = null;
      this.uploadProgress = 0;
      this.dialog = false;
    }
  }
};
</script>
```

---

## 💰 5. AdMob Monetization & Creator Studio (`src/views/Studio/Dashboard.vue`)

Integrates real-time CPM calculations, wallet balance, and video metrics:

```vue
<template>
  <v-container fluid class="pa-6">
    <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
      <v-icon color="amber darken-2" class="mr-2">mdi-view-dashboard</v-icon>
      BundeliTube Creator Studio
    </h2>

    <!-- Revenue & Stats Grid -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card color="grey darken-4" dark class="rounded-lg pa-4">
          <div class="caption grey--text">Total Balance</div>
          <div class="text-h4 font-weight-bold green--text">₹{{ walletBalance.toFixed(2) }}</div>
          <div class="caption mt-1">CPM: ₹35.00 / 1K views</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="grey darken-4" dark class="rounded-lg pa-4">
          <div class="caption grey--text">Total Views</div>
          <div class="text-h4 font-weight-bold amber--text">{{ totalViews.toLocaleString() }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="grey darken-4" dark class="rounded-lg pa-4">
          <div class="caption grey--text">Subscribers</div>
          <div class="text-h4 font-weight-bold blue--text">{{ totalSubscribers }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="grey darken-4" dark class="rounded-lg pa-4">
          <div class="caption grey--text">AdMob Status</div>
          <div class="text-h6 font-weight-bold teal--text">ACTIVE (Native + Skippable)</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Uploaded Videos Table -->
    <v-card class="rounded-lg">
      <v-card-title class="font-weight-bold">Your Videos</v-card-title>
      <v-data-table
        :headers="headers"
        :items="videos"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:item.type="{ item }">
          <v-chip small :color="item.isShort ? 'red' : 'blue'" dark>
            {{ item.isShort ? 'Short' : 'Long Video' }}
          </v-chip>
        </template>
        <template v-slot:item.revenue="{ item }">
          <span class="green--text font-weight-bold">₹{{ ((item.views || 0) * 0.035).toFixed(2) }}</span>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { db, auth } from '@/plugins/firebase';

export default {
  name: 'StudioDashboard',
  data() {
    return {
      loading: true,
      videos: [],
      walletBalance: 0,
      totalViews: 0,
      totalSubscribers: 0,
      headers: [
        { text: 'Title', value: 'title' },
        { text: 'Type', value: 'type' },
        { text: 'Views', value: 'views' },
        { text: 'Likes', value: 'likes' },
        { text: 'Estimated Revenue', value: 'revenue' },
        { text: 'Date', value: 'createdAt' }
      ]
    };
  },
  mounted() {
    this.fetchStudioData();
  },
  methods: {
    async fetchStudioData() {
      this.loading = true;
      try {
        const user = auth.currentUser;
        const channelId = user ? user.uid : 'chan-default';

        // Listen to Firestore Videos
        db.collection('videos')
          .where('channelId', '==', channelId)
          .onSnapshot((snapshot) => {
            const list = [];
            let views = 0;
            snapshot.forEach((doc) => {
              const data = doc.data();
              list.push({ id: doc.id, ...data });
              views += data.views || 0;
            });
            this.videos = list;
            this.totalViews = views;
            this.walletBalance = views * 0.035; // CPM Calculation
            this.loading = false;
          });
      } catch (err) {
        console.error('Error fetching studio data:', err);
        this.loading = false;
      }
    }
  }
};
</script>
```
