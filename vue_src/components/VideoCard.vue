<template>
  <v-card
    class="video-card elevation-0 grey darken-4 fill-height d-flex flex-column"
    :to="`/watch/${video.id}`"
  >
    <!-- 16:9 Thumbnail with Duration Badge -->
    <v-responsive :aspect-ratio="16 / 9" class="rounded-lg overflow-hidden position-relative grey darken-3">
      <v-img
        :src="video.thumbnailUrl || 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=600&auto=format&fit=crop&q=80'"
        class="fill-height"
        cover
      >
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular indeterminate color="amber"></v-progress-circular>
          </v-row>
        </template>
      </v-img>

      <!-- Video Duration Badge -->
      <span class="duration-badge caption font-weight-bold">
        {{ video.duration || '04:15' }}
      </span>
    </v-responsive>

    <!-- Video Metadata Details -->
    <v-card-text class="pa-2 px-1 d-flex">
      <v-avatar size="36" class="mr-3 mt-1 shrink-0">
        <v-img :src="video.channelAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'"></v-img>
      </v-avatar>

      <div class="min-w-0 flex-grow-1">
        <h3 class="video-title text-subtitle-2 font-weight-bold white--text text-truncate-2 mb-1">
          {{ video.title }}
        </h3>
        <p class="caption grey--text text--lighten-1 mb-0">{{ video.channelName || 'बुन्देली क्रिएटर' }}</p>
        <p class="caption grey--text mb-0">
          {{ formatViews(video.views) }} • {{ video.uploadedTime || 'हाल ही में' }}
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'VideoCard',
  props: {
    video: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatViews(count) {
      if (!count) return '0 बार देखा गया';
      if (count >= 10000000) return `${(count / 10000000).toFixed(1)} करोड़ व्यूज़`;
      if (count >= 100000) return `${(count / 100000).toFixed(1)} लाख व्यूज़`;
      if (count >= 1000) return `${(count / 1000).toFixed(1)}K व्यूज़`;
      return `${count} व्यूज़`;
    },
  },
};
</script>

<style scoped>
.video-card {
  transition: transform 0.2s ease;
  cursor: pointer;
}
.video-card:hover {
  transform: translateY(-4px);
}
.duration-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
}
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.25;
}
</style>
