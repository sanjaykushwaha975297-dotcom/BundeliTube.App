<template>
  <v-app :dark="isDark">
    <!-- Top Navigation Bar (YouTube Clone Style) -->
    <NavBar @toggle-drawer="drawer = !drawer" @open-upload="showUploadModal = true" />

    <!-- Left Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      :mini-variant="mini"
      class="grey darken-4"
    >
      <v-list dense nav>
        <!-- Primary Menu -->
        <v-list-item-group color="amber darken-2">
          <v-list-item to="/" exact>
            <v-list-item-icon><v-icon>mdi-home</v-icon></v-list-item-icon>
            <v-list-item-title>होम (Home)</v-list-item-title>
          </v-list-item>

          <v-list-item to="/trending">
            <v-list-item-icon><v-icon>mdi-fire</v-icon></v-list-item-icon>
            <v-list-item-title>ट्रेंडिंग (Trending)</v-list-item-title>
          </v-list-item>

          <v-list-item to="/subscriptions">
            <v-list-item-icon><v-icon>mdi-youtube-subscription</v-icon></v-list-item-icon>
            <v-list-item-title>सदस्यताएँ (Subscriptions)</v-list-item-title>
          </v-list-item>

          <v-list-item to="/shorts">
            <v-list-item-icon><v-icon color="red">mdi-play-box-multiple</v-icon></v-list-item-icon>
            <v-list-item-title>शॉर्ट्स (Shorts)</v-list-item-title>
          </v-list-item>
        </v-list-item-group>

        <v-divider class="my-2"></v-divider>

        <!-- Library Section -->
        <v-subheader class="text-uppercase font-weight-bold grey--text text--lighten-1">लाइब्रेरी</v-subheader>
        <v-list-item-group color="amber darken-2">
          <v-list-item to="/history">
            <v-list-item-icon><v-icon>mdi-history</v-icon></v-list-item-icon>
            <v-list-item-title>इतिहास (History)</v-list-item-title>
          </v-list-item>

          <v-list-item to="/studio">
            <v-list-item-icon><v-icon color="amber">mdi-filmstrip</v-icon></v-list-item-icon>
            <v-list-item-title>स्टूडियो व कमाई (Studio)</v-list-item-title>
          </v-list-item>

          <v-list-item to="/downloads">
            <v-list-item-icon><v-icon color="teal">mdi-download</v-icon></v-list-item-icon>
            <v-list-item-title>डाउनलोड्स (Offline)</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Dynamic Content Views -->
    <v-main class="grey darken-4">
      <v-container fluid class="pa-4">
        <router-view />
      </v-container>
    </v-main>

    <!-- Video Upload Modal -->
    <UploadVideoModal v-model="showUploadModal" />
  </v-app>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import UploadVideoModal from '@/components/UploadVideoModal.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    UploadVideoModal,
  },
  data() {
    return {
      drawer: true,
      mini: false,
      isDark: true,
      showUploadModal: false,
    };
  },
};
</script>

<style>
/* Custom YouTube style scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #0f172a;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
