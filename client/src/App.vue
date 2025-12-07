<template>
  <div id="app">

    <!-- Navbar -->
    <AppNavbar v-if="!isAlbumDetailsPage" />
    <router-view />

  </div>
</template>

<script>
import { userStore } from './userStore';
import AppNavbar from './components/AppNavbar.vue';
export default {
  components: { AppNavbar },
  computed: {
    isAlbumDetailsPage() {
      return this.$route.path.startsWith('/albums/') && this.$route.path.length > 8;
    },
  },
  created() {
    userStore.initFromToken();
  }
  
}
</script>

<style>

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ffffff;
  margin-top: 60px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background: #0d0b14;
}

#app {
  margin: 0;
  padding: 0;
}

</style>
