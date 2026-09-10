<template>
  <v-app-bar app clipped-left flat class="grey darken-4 border-bottom px-2">
    <!-- Left: Menu Toggle & BundeliTube Logo -->
    <v-app-bar-nav-icon @click="$emit('toggle-drawer')" color="white"></v-app-bar-nav-icon>

    <router-link to="/" class="d-flex align-center text-decoration-none mr-4">
      <v-avatar size="32" color="amber darken-2" class="mr-2 elevation-2">
        <v-icon color="black">mdi-play</v-icon>
      </v-avatar>
      <span class="font-weight-bold white--text text-h6 tracking-tight">
        बुन्देली<span class="amber--text text--darken-1">Tube</span>
      </span>
    </router-link>

    <v-spacer></v-spacer>

    <!-- Center: YouTube Search Bar -->
    <div class="d-none d-sm-flex align-center" style="max-width: 580px; width: 100%;">
      <v-text-field
        v-model="searchQuery"
        placeholder="खोजें (Search Bundeli videos)..."
        dense
        outlined
        hide-details
        clearable
        rounded
        class="search-input"
        @keyup.enter="onSearch"
      >
        <template v-slot:append>
          <v-btn icon small @click="onSearch" color="amber">
            <v-icon small>mdi-magnify</v-icon>
          </v-btn>
        </template>
      </v-text-field>
    </div>

    <v-spacer></v-spacer>

    <!-- Right: Actions (Create +, Studio Grid, Notifications, Profile) -->
    <div class="d-flex align-center">
      <!-- Upload / Create Button -->
      <v-btn
        rounded
        color="amber darken-3"
        dark
        class="mr-2 font-weight-bold text-capitalize"
        @click="$emit('open-upload')"
      >
        <v-icon left>mdi-plus</v-icon>
        <span>अपलोड</span>
      </v-btn>

      <!-- Studio Grid Link -->
      <v-btn icon to="/studio" class="d-none d-sm-flex mr-1" color="grey lighten-1">
        <v-icon>mdi-view-grid-outline</v-icon>
      </v-btn>

      <!-- Notification Bell -->
      <v-btn icon class="mr-1" color="grey lighten-1">
        <v-badge dot color="amber" overlap>
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>

      <!-- User Profile Menu -->
      <v-menu offset-y min-width="240" rounded="lg">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-avatar size="32" color="amber darken-2">
              <span class="white--text font-weight-bold">B</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list dense class="grey darken-4">
          <v-list-item to="/studio">
            <v-list-item-icon><v-icon color="amber">mdi-filmstrip</v-icon></v-list-item-icon>
            <v-list-item-title>क्रिएटर स्टूडियो (Studio)</v-list-item-title>
          </v-list-item>
          <v-list-item to="/wallet">
            <v-list-item-icon><v-icon color="green">mdi-currency-inr</v-icon></v-list-item-icon>
            <v-list-item-title>वॉलेट व कमाई (Earnings)</v-list-item-title>
          </v-list-item>
          <v-divider class="my-1"></v-divider>
          <v-list-item to="/settings">
            <v-list-item-icon><v-icon>mdi-cog</v-icon></v-list-item-icon>
            <v-list-item-title>सेटिंग्स (Settings)</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      searchQuery: '',
    };
  },
  methods: {
    onSearch() {
      if (this.searchQuery && this.searchQuery.trim()) {
        this.$router.push({ path: '/search', query: { q: this.searchQuery.trim() } }).catch(() => {});
      }
    },
  },
};
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}
</style>
