<template>
  <div class="home-view">
    <!-- Category Pills -->
    <v-chip-group v-model="selectedCategory" active-class="amber darken-2 white--text" mandatory class="mb-4">
      <v-chip
        v-for="cat in categories"
        :key="cat"
        filter
        outlined
        class="font-weight-medium px-4"
      >
        {{ cat }}
      </v-chip>
    </v-chip-group>

    <!-- Videos Grid -->
    <v-row>
      <v-col
        v-for="video in filteredVideos"
        :key="video.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <VideoCard :video="video" />
      </v-col>
    </v-row>

    <!-- Empty State -->
    <div v-if="filteredVideos.length === 0" class="text-center py-12">
      <v-icon size="64" color="grey darken-2">mdi-video-off</v-icon>
      <div class="text-h6 grey--text mt-2">कोई वीडियो उपलब्ध नहीं है</div>
    </div>
  </div>
</template>

<script>
import VideoCard from '@/components/VideoCard.vue';
import { db } from '@/plugins/firebase';

export default {
  name: 'Home',
  components: {
    VideoCard,
  },
  data() {
    return {
      selectedCategory: 0,
      categories: ['सभी (All)', 'बुन्देली लोकगीत', 'कॉमेडी व राई', 'भजन व कीर्तन', 'नाट्य व किस्सा', 'Shorts'],
      videos: [],
    };
  },
  computed: {
    filteredVideos() {
      // Filter out shorts from long video grid
      return this.videos.filter((v) => !v.isShort);
    },
  },
  mounted() {
    this.fetchVideos();
  },
  methods: {
    fetchVideos() {
      db.collection('videos').onSnapshot((snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        if (list.length > 0) {
          this.videos = list;
        } else {
          // Fallback mock videos for display
          this.videos = [
            {
              id: 'v1',
              title: 'बुन्देली राई नृत्य एवं लोकगीत - देशराज पटेरिया',
              channelName: 'बुन्देली संगीत गंगा',
              views: 125000,
              uploadedTime: '2 दिन पहले',
              duration: '12:45',
              thumbnailUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=600',
            },
            {
              id: 'v2',
              title: 'बुन्देली हास्य नाटक - ओरछा का मेला',
              channelName: 'बुन्देली कॉमेडी क्लब',
              views: 89000,
              uploadedTime: '1 हफ्ता पहले',
              duration: '18:20',
              thumbnailUrl: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=600',
            },
          ];
        }
      });
    },
  },
};
</script>
