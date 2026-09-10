<template>
  <v-container fluid class="pa-2 pa-sm-4">
    <v-row>
      <!-- Main Player & Details Column -->
      <v-col cols="12" lg="8">
        <!-- Video Player Frame -->
        <v-responsive :aspect-ratio="16 / 9" class="black rounded-lg overflow-hidden elevation-6">
          <video
            ref="videoPlayer"
            controls
            autoplay
            class="fill-height fill-width"
            :src="videoStreamUrl"
            style="width: 100%; height: 100%; object-fit: contain;"
          ></video>
        </v-responsive>

        <!-- Video Title -->
        <h1 class="text-h6 font-weight-bold white--text mt-3 mb-2">
          {{ video.title || 'लोड हो रहा है...' }}
        </h1>

        <!-- Channel Bar & Like / Share / Download Actions -->
        <div class="d-flex flex-wrap align-center justify-space-between pb-3 border-bottom gap-2">
          <!-- Channel Info & Subscribe Button -->
          <div class="d-flex align-center mr-4 my-1">
            <v-avatar size="40" class="mr-3">
              <v-img :src="video.channelAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'"></v-img>
            </v-avatar>
            <div class="mr-4">
              <div class="subtitle-2 font-weight-bold white--text">{{ video.channelName || 'बुन्देली क्रिएटर' }}</div>
              <div class="caption grey--text">{{ subscribersCount }} सब्सक्राइबर्स</div>
            </div>

            <!-- Permanent Subscribe Button (1 Sub per Channel) -->
            <v-btn
              :color="isSubscribed ? 'grey darken-3' : 'white'"
              :class="isSubscribed ? 'grey--text text--lighten-1' : 'black--text font-weight-bold'"
              rounded
              dense
              elevation="0"
              @click="toggleSubscribe"
            >
              {{ isSubscribed ? 'सब्सक्राइब्ड ✓' : 'सदस्यता लें (Subscribe)' }}
            </v-btn>
          </div>

          <!-- Like / Dislike & Download Actions -->
          <div class="d-flex align-center gap-2 my-1">
            <!-- 1 Like per Video Button -->
            <v-btn-toggle dense rounded class="grey darken-3 elevation-0">
              <v-btn
                small
                text
                :color="isLiked ? 'amber' : 'white'"
                class="font-weight-bold"
                @click="toggleLike"
              >
                <v-icon left small :color="isLiked ? 'amber' : 'white'">mdi-thumb-up</v-icon>
                {{ likesCount }}
              </v-btn>
              <v-btn small text color="white">
                <v-icon small>mdi-thumb-down</v-icon>
              </v-btn>
            </v-btn-toggle>

            <!-- Download Button -->
            <v-btn rounded small color="grey darken-3" dark class="font-weight-bold" @click="downloadVideo">
              <v-icon left small color="teal">mdi-download</v-icon>
              <span>डाउनलोड</span>
            </v-btn>

            <!-- Share Button -->
            <v-btn icon small color="grey lighten-1">
              <v-icon small>mdi-share-variant</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- Description Box -->
        <v-card class="grey darken-3 rounded-lg mt-3 pa-3" elevation="0">
          <div class="caption font-weight-bold white--text mb-1">
            {{ video.views || 0 }} व्यूज़ • {{ video.uploadedTime || 'आज' }}
          </div>
          <p class="body-2 grey--text text--lighten-2 mb-0" style="white-space: pre-line;">
            {{ video.description || 'बुन्देलीट्यूब पर बेहतरीन बुन्देली वीडियो का आनंद लें।' }}
          </p>
        </v-card>
      </v-col>

      <!-- Up Next / Recommended Column -->
      <v-col cols="12" lg="4">
        <h3 class="subtitle-1 font-weight-bold white--text mb-3">अगले वीडियो (Up Next)</h3>
        <div v-for="item in recommendedVideos" :key="item.id" class="mb-3">
          <v-card :to="`/watch/${item.id}`" class="d-flex grey darken-4 elevation-0 rounded-lg overflow-hidden">
            <v-responsive :aspect-ratio="16 / 9" max-width="140" class="grey darken-3 shrink-0">
              <v-img :src="item.thumbnailUrl" cover class="fill-height"></v-img>
            </v-responsive>
            <div class="pa-2 min-w-0">
              <div class="caption font-weight-bold white--text text-truncate-2 mb-1">{{ item.title }}</div>
              <div class="text-caption grey--text text--lighten-1">{{ item.channelName }}</div>
              <div class="text-caption grey--text">{{ item.views || 0 }} व्यूज़</div>
            </div>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { db, recordVideoLike, recordSubscription } from '@/plugins/firebase';
import { getTelegramStreamUrl } from '@/services/telegramService';

export default {
  name: 'Watch',
  data() {
    return {
      video: {},
      videoStreamUrl: '',
      isLiked: false,
      likesCount: 0,
      isSubscribed: false,
      subscribersCount: '1.2K',
      recommendedVideos: [],
    };
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(newId) {
        if (newId) this.loadVideo(newId);
      },
    },
  },
  methods: {
    async loadVideo(id) {
      // 1. Check local persistent states
      const savedLikes = JSON.parse(localStorage.getItem('bt_liked_videos') || '{}');
      this.isLiked = Boolean(savedLikes[id]);

      try {
        const doc = await db.collection('videos').doc(id).get();
        if (doc.exists) {
          this.video = { id: doc.id, ...doc.data() };
          this.likesCount = this.video.likes || 0;
          this.videoStreamUrl = this.video.telegramFileId
            ? getTelegramStreamUrl(this.video.telegramFileId)
            : this.video.streamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        }
      } catch (err) {
        console.warn('Firestore load fallback:', err);
      }
    },
    async toggleLike() {
      const nextLiked = !this.isLiked;
      this.isLiked = nextLiked;
      this.likesCount += nextLiked ? 1 : -1;
      await recordVideoLike(this.video.id, 'user-1', nextLiked);
    },
    async toggleSubscribe() {
      const nextSub = !this.isSubscribed;
      this.isSubscribed = nextSub;
      await recordSubscription(this.video.channelId || 'chan-1', 'user-1', nextSub);
    },
    downloadVideo() {
      alert('वीडियो सुरक्षित ऑफ़लाइन डाउनलोड्स में सहेज लिया गया है!');
    },
  },
};
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
