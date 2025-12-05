<template>
  <div class="albums-page">
    <!-- Barre de profil utilisateur -->
    <div class="user-profile-bar">
      <div class="profile-menu-container">
        <img
          class="profile-avatar"
          :src="profileImage"
          alt="Profil"
          @click="toggleMenu"
        />
        <div class="profile-username">{{ usernameDisplay }}</div>
        <div v-if="menuOpen" class="profile-dropdown">
          <button
            v-if="isLoggedIn"
            class="profile-menu-history"
            @click="openHistory"
          >{{ $t('profile.history') }}</button>
          <button
            v-if="isLoggedIn"
            class="profile-menu-logout"
            @click="handleLogout"
          >{{ $t('profile.logout') }}</button>
          <button
            v-else
            class="profile-menu-login"
            @click="redirectToLogin"
          >{{ $t('profile.login') }}</button>
        </div>
        <!-- Fenêtre historique flottante -->
        <div v-if="historyOpen" class="profile-history-modal">
          <div class="profile-history-header">
            <span>{{ $t('profile.historyHeader') }}</span>
            <button @click="closeHistory" class="modal-close-btn">✕</button>
          </div>
          <div v-if="userReviews.length">
            <div v-for="r in userReviews" :key="r.id" class="profile-history-item">
              <div>
                <strong>{{ r.title }}</strong> <span class="profile-history-artist">({{ r.artist }})</span>
              </div>
              <div>
                <span>{{ $t('profile.ratingLabelShort') }} <span class="profile-history-note"> {{ r.rating }} {{ $t('profile.stars') }}</span></span>
              </div>
              <div v-if="r.review_text && r.review_text.trim() !== ''">
                <span class="profile-history-comment">«{{ r.review_text }}»</span>
              </div>
              <div class="profile-history-actions">
                <button class="profile-history-btn profile-history-delete" @click="deleteReview(r.id)">
                  {{ $t('common.delete') }}
                </button>
                <button class="profile-history-btn profile-history-edit" @click="editReview(r.album_id)">
                  {{ $t('common.edit') }}
                </button>
              </div>
            </div>
          </div>
          <div v-else>
            <em>{{ $t('profile.noReviews') }}</em>
          </div>
        </div>
      </div>
    </div>

    <!-- Ligne 1 : Recommandés pour vous -->
    <section class="album-row">
      <h2 class="row-title">{{ $t('albums.recommendedForYou') }}</h2>
      <div class="albums-scroll">
        <div 
          v-for="album in recommendedAlbums" 
          :key="'rec-' + album.id" 
          class="album-card"
          @click="goToAlbum(album.id)"
        >
          <img :src="album.cover_url" :alt="album.title" class="cover" />
          <h3>{{ album.title }}</h3>
          <p>{{ album.artist }}</p>
        </div>
        <div v-if="!recommendedAlbums.length" class="no-data">{{ $t('albums.noRecommendations') }}</div>
      </div>
    </section>

    <!-- Ligne 2 : Les mieux notés -->
    <section class="album-row">
      <h2 class="row-title">{{ $t('albums.topRated') }}</h2>
      <div class="albums-scroll">
        <div 
          v-for="album in topRatedAlbums" 
          :key="'top-' + album.id" 
          class="album-card"
          @click="goToAlbum(album.id)"
        >
          <img :src="album.cover_url" :alt="album.title" class="cover" />
          <h3>{{ album.title }}</h3>
          <p>{{ album.artist }}</p>
          <p class="album-rating" v-if="album.average_rating">
            {{ album.average_rating.toFixed(1) }} ★
          </p>
        </div>
        <div v-if="!topRatedAlbums.length" class="no-data">{{ $t('albums.noTopRated') }}</div>
      </div>
    </section>

    <!-- Ligne 3 : Les plus récents -->
    <section class="album-row">
      <h2 class="row-title">{{ $t('albums.recentReleases') }}</h2>
      <div class="albums-scroll">
        <div 
          v-for="album in recentAlbums" 
          :key="'recent-' + album.id" 
          class="album-card"
          @click="goToAlbum(album.id)"
        >
          <img :src="album.cover_url" :alt="album.title" class="cover" />
          <h3>{{ album.title }}</h3>
          <p>{{ album.artist }} ({{ album.release_year }})</p>
        </div>
        <div v-if="!recentAlbums.length" class="no-data">{{ $t('albums.noRecentAlbums') }}</div>
      </div>
    </section>

    <!-- Ligne 4 : Chansons à découvrir (aléatoire) -->
    <section class="album-row">
      <h2 class="row-title">{{ $t('albums.songsToDiscover') }}</h2>
      <div class="albums-scroll">
        <div 
          v-for="chanson in randomChansons" 
          :key="'chanson-' + chanson.id" 
          class="chanson-card"
          @click="goToAlbum(chanson.album_id)"
        >
          <img :src="chanson.cover_url" :alt="chanson.album_title" class="cover" />
          <h3>{{ chanson.titre }}</h3>
          <p>{{ chanson.artist }}</p>
          <p class="chanson-album">{{ $t('albums.trackAlbum') }} {{ chanson.album_title }}</p>
        </div>
        <div v-if="!randomChansons.length" class="no-data">{{ $t('albums.noSongsAvailable') }}</div>
      </div>
    </section>

    <!-- Ligne 5 : Vos albums préférés (utilisateur connecté uniquement) -->
    <section class="album-row" v-if="isLoggedIn && userTopAlbums.length">
      <h2 class="row-title">{{ $t('albums.yourFavoriteAlbums') }}</h2>
      <div class="albums-scroll">
        <div 
          v-for="album in userTopAlbums" 
          :key="'usertop-' + album.id" 
          class="album-card"
          @click="goToAlbum(album.id)"
        >
          <img :src="album.cover_url" :alt="album.title" class="cover" />
          <h3>{{ album.title }}</h3>
          <p>{{ album.artist }}</p>
          <p class="album-rating">{{ $t('profile.ratingLabelShort') }} {{ album.user_rating }} ★</p>
        </div>
      </div>
    </section>

    <!-- Ligne 6 : Tous les albums (ancienne grille) -->
    <section class="album-row">
      <h2 class="row-title">{{ $t('albums.allAlbums') }}</h2>
      <div class="albums-scroll">
        <div class="album-card" v-for="album in albums" :key="'all-' + album.id" @click="goToAlbum(album.id)">
          <img :src="album.cover_url" :alt="album.title" class="cover"/>
          <h3>{{ album.title }}</h3>
          <p>{{ album.artist }} ({{ album.release_year }})</p>
          <p>
            <span v-if="album.average_rating">
              {{ $t('common.rating') }} : {{ album.average_rating.toFixed(1) }} ★
            </span>
            <span v-else>
              {{ $t('profile.noRating') }}
            </span>
          </p>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
import api from '../api';

export default {
  name: "AlbumsList",
  data() {
    return {
      albums: [],
      recommendedAlbums: [],
      topRatedAlbums: [],
      recentAlbums: [],
      randomChansons: [],
      userTopAlbums: [],
      userToken: localStorage.getItem('token') || '',
      menuOpen: false,
      historyOpen: false,
      userReviews: []
    };
  },
  computed: {
    isLoggedIn() {
      return !!this.userToken;
    },
    usernameDisplay() {
      if (!this.userToken) return this.$t('profile.anonymous');
      try {
        const payload = JSON.parse(atob(this.userToken.split('.')[1]));
        return payload.username || this.$t('profile.user');
      } catch {
        return this.$t('profile.user');
      }
    },
    profileImage() {
      return "https://ui-avatars.com/api/?background=802BB1&color=fff&name=" +
        encodeURIComponent(this.usernameDisplay);
    }
  },
  mounted() {
    this.loadAllData();
    window.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    window.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    async loadAllData() {
      try {
        // Chargement en parallèle de toutes les données
        const [allAlbums, recommended, topRated, recent, randomSongs] = await Promise.all([
          api.get('/albums'),
          api.get('/albums/recommended').catch(() => ({ data: [] })),
          api.get('/albums/top-rated').catch(() => ({ data: [] })),
          api.get('/albums/recent').catch(() => ({ data: [] })),
          api.get('/chansons/random').catch(() => ({ data: [] }))
        ]);

        this.albums = allAlbums.data;
        this.recommendedAlbums = recommended.data;
        this.topRatedAlbums = topRated.data;
        this.recentAlbums = recent.data;
        this.randomChansons = randomSongs.data;

        // Albums préférés de l'utilisateur (si connecté)
        if (this.isLoggedIn) {
          const userId = this.getUserIdFromToken(this.userToken);
          if (userId) {
            try {
              const userTop = await api.get(`/albums/user/${userId}/top-rated`);
              this.userTopAlbums = userTop.data;
            } catch {
              this.userTopAlbums = [];
            }
          }
        }
      } catch (err) {
        console.error('Error while loading data:', err);
      }
    },
    getUserIdFromToken(token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
      } catch {
        return null;
      }
    },
    goToAlbum(id) {
      this.$router.push(`/albums/${id}`);
    },
    async deleteReview(reviewId) {
      try {
        await api.delete(`/reviews/${reviewId}`);
        this.userReviews = this.userReviews.filter(r => r.id !== reviewId);
      } catch {
        alert('Erreur lors de la suppression.');
      }
    },
    editReview(albumId) {
      this.closeHistory();
      this.$router.push(`/albums/${albumId}`);
    },
    async openHistory() {
      this.historyOpen = true;
      if (!this.userToken) return;
      try {
        const payload = JSON.parse(atob(this.userToken.split('.')[1]));
        const res = await api.get(`/reviews/user/${payload.id}`);
        this.userReviews = res.data;
      } catch {
        this.userReviews = [];
      }
    },
    closeHistory() {
      this.historyOpen = false;
    },
    handleLogout() {
      localStorage.removeItem('token');
      this.userToken = '';
      this.menuOpen = false;
      window.location.reload();
    },
    toggleMenu(e) {
      e.stopPropagation();
      this.menuOpen = !this.menuOpen;
    },
    handleClickOutside(e) {
      if (!e.target.classList.contains('profile-avatar')) {
        this.menuOpen = false;
      }
    },
    redirectToLogin() {
      this.menuOpen = false;
      this.$router.push('/userlogin');
    }
  }
};
</script>

<style>
/* ═══════════════════════════════════════════════════════════
   VARIABLES & RESET
   ═══════════════════════════════════════════════════════════ */
:root {
  --bg-dark: #14111f;
  --bg-card: #1c1928;
  --bg-card-hover: #252136;
  --accent-violet: #802BB1;
  --accent-violet-light: #9b4dca;
  --accent-green: #00c030;
  --text-main: #e1e3e6;
  --text-muted: #9a9bab;
  --text-dim: #6b6c7a;
  --border-subtle: #2a2740;
  --shadow-card: rgba(0, 0, 0, 0.4);
  --shadow-glow: rgba(128, 43, 177, 0.25);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

*::-webkit-scrollbar {
  display: none;
}

/* ═══════════════════════════════════════════════════════════
   PAGE LAYOUT
   ═══════════════════════════════════════════════════════════ */
.albums-page {
  background: var(--bg-dark);
  min-height: 100vh;
  padding: 80px 4% 3em 4%;
  color: var(--text-main);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ═══════════════════════════════════════════════════════════
   SECTION ROWS
   ═══════════════════════════════════════════════════════════ */
.album-row {
  margin-bottom: 3em;
}

.row-title {
  font-size: 1.15em;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 1em;
  padding-left: 0.2em;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.row-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--border-subtle) 0%, transparent 100%);
  margin-left: 1em;
}

/* ═══════════════════════════════════════════════════════════
   HORIZONTAL SCROLL CONTAINER
   ═══════════════════════════════════════════════════════════ */
.albums-scroll {
  display: flex;
  gap: 1.5em; /* Espace augmenté pour aérer */
  overflow-x: auto;
  padding: 1em 0.5em 2em 0.5em; /* Padding pour laisser place à l'ombre et au hover */
  scroll-behavior: smooth;
}

/* ═══════════════════════════════════════════════════════════
   ALBUM & CHANSON CARDS (CORRIGÉ)
   ═══════════════════════════════════════════════════════════ */
.album-card,
.chanson-card {
  /* FIX: Taille fixe unifiée */
  flex: 0 0 160px; 
  width: 160px; 
  background: transparent;
  border-radius: 4px;
  text-align: left;
  cursor: pointer;
  /* EFFET: Transition fluide sur tout le bloc */
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); 
  position: relative;
}

/* EFFET: Le bloc entier monte un peu */
.album-card:hover,
.chanson-card:hover {
  transform: translateY(-8px);
}

.album-card .cover,
.chanson-card .cover {
  width: 100%;
  /* FIX: Force le ratio carré parfait */
  aspect-ratio: 1 / 1; 
  object-fit: cover;
  border-radius: 8px; /* Un peu plus arrondi */
  box-shadow: 0 4px 15px var(--shadow-card);
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

/* EFFET: L'image brille au survol */
.album-card:hover .cover,
.chanson-card:hover .cover {
  border-color: var(--accent-violet);
  box-shadow: 0 12px 40px var(--shadow-glow);
}

.album-card h3,
.chanson-card h3 {
  font-size: 0.95em;
  font-weight: 600;
  color: var(--text-main);
  margin: 0.8em 0 0.2em 0;
  /* FIX: Coupe proprement le texte trop long */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.album-card p,
.chanson-card p {
  font-size: 0.85em;
  color: var(--text-muted);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.album-rating {
  color: var(--accent-green) !important;
  font-weight: 600;
  font-size: 0.85em !important;
  margin-top: 0.3em !important;
}

.chanson-album {
  font-size: 0.75em !important;
  color: var(--text-dim) !important;
  font-style: normal;
  margin-top: 0.3em !important;
}

.no-data {
  color: var(--text-dim);
  font-style: italic;
  padding: 2em;
  font-size: 0.95em;
  white-space: nowrap;
}

/* ═══════════════════════════════════════════════════════════
   USER PROFILE BAR (Reste inchangé)
   ═══════════════════════════════════════════════════════════ */
.user-profile-bar {
  position: fixed;
  top: 1.2em;
  right: 2em;
  z-index: 100;
}

.profile-menu-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-subtle);
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.profile-avatar:hover {
  border-color: var(--accent-violet);
  transform: scale(1.05);
}

.profile-username {
  font-size: 0.85em;
  color: var(--text-muted);
  font-weight: 500;
  margin-top: 0.4em;
  text-align: center;
  background: rgba(20, 17, 31, 0.8); /* Petit fond pour lisibilité */
  padding: 2px 6px;
  border-radius: 4px;
}

/* ═══════════════════════════════════════════════════════════
   DROPDOWN MENU
   ═══════════════════════════════════════════════════════════ */
.profile-dropdown {
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  min-width: 140px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  padding: 0.5em 0;
  display: flex;
  flex-direction: column;
  animation: dropdownFade 0.15s ease;
  z-index: 200;
}

@keyframes dropdownFade {
  from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.profile-menu-history,
.profile-menu-logout,
.profile-menu-login {
  background: none;
  border: none;
  color: var(--text-main);
  font-size: 0.92em;
  font-weight: 400;
  padding: 0.6em 1em;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s, color 0.12s;
}

.profile-menu-history:hover,
.profile-menu-logout:hover,
.profile-menu-login:hover {
  background: var(--accent-violet);
  color: #fff;
}

/* ═══════════════════════════════════════════════════════════
   HISTORY MODAL
   ═══════════════════════════════════════════════════════════ */
.profile-history-modal {
  position: fixed;
  top: 70px;
  right: 2em;
  background: var(--bg-card);
  color: var(--text-main);
  width: 360px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 1.5em;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  animation: dropdownFade 0.2s ease;
  z-index: 9999;
}

.profile-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.2em;
  padding-bottom: 0.8em;
  border-bottom: 1px solid var(--border-subtle);
}

.profile-history-header span {
  font-size: 1em;
  font-weight: 600;
  color: var(--text-main);
}

.modal-close-btn {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 1.2em;
  cursor: pointer;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  transition: background 0.12s, color 0.12s;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-main);
}

.profile-history-item {
  padding: 1em 0;
  border-bottom: 1px solid var(--border-subtle);
}

.profile-history-item:last-child {
  border-bottom: none;
}

.profile-history-item strong {
  color: var(--text-main);
  font-weight: 500;
}

.profile-history-artist {
  color: var(--text-dim);
  font-size: 0.9em;
}

.profile-history-note {
  color: var(--accent-green);
  font-weight: 600;
}

.profile-history-comment {
  color: var(--text-muted);
  font-style: italic;
  font-size: 0.9em;
  margin-top: 0.4em;
  display: block;
  line-height: 1.4;
}

.profile-history-actions {
  display: flex;
  gap: 0.6em;
  margin-top: 0.8em;
}

.profile-history-btn {
  border: none;
  color: #fff;
  padding: 0.4em 0.9em;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 500;
  cursor: pointer;
  transition: filter 0.15s;
}

.profile-history-btn:hover {
  filter: brightness(1.15);
}

.profile-history-delete {
  background: #e74c3c;
}

.profile-history-edit {
  background: var(--accent-violet);
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .albums-page {
    padding: 70px 3% 2em 3%;
  }

  .albums-scroll {
    gap: 1em;
  }

  .album-card,
  .chanson-card {
    flex: 0 0 130px;
    width: 130px;
  }

  .row-title {
    font-size: 1em;
  }

  .profile-history-modal {
    width: calc(100vw - 2em);
    right: 1em;
  }
}

@media (max-width: 480px) {
  .user-profile-bar {
    top: 0.8em;
    right: 1em;
  }

  .profile-avatar {
    width: 36px;
    height: 36px;
  }

  .album-card,
  .chanson-card {
    flex: 0 0 110px;
    width: 110px;
  }

  .album-card h3,
  .chanson-card h3 {
    font-size: 0.85em;
  }
}
</style>
