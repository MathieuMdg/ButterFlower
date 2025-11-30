<template>
  <div id="app">
    <!-- Navbar non affichée sur la page détails album /albums/:id -->
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
      // Disparaît pour /albums/<num>
      // Assure que la route commence par /albums/ et que ce n'est pas juste /albums
      // Adapte la longueur selon tes id d’albums (au moins 9 caractères)
      return this.$route.path.startsWith('/albums/') && this.$route.path.length > 8;
    },
  },
  created() {
    // Initialiser le store depuis le token existant
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

/* Dans App.vue ou un fichier CSS global */
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
