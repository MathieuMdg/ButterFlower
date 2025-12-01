<template>
  <nav class="app-navbar">
    <div class="navbar-container">
      <!-- Logo / Nom du site -->
      <div class="navbar-brand" @click="$router.push('/')">
        <span class="brand-icon">🎵</span>
        <span class="brand-name">ButterFlower</span>
      </div>

      <!-- Navigation links -->
      <div class="navbar-links">
        
        <router-link 
          v-if="isAdmin" 
          to="/admin/users" 
          class="nav-link admin-link"
          exact-active-class="active"
        >
          {{ $t('nav.adminusers') }}
        </router-link>

        <router-link 
          v-if="isAdmin" 
          to="/admin/albums" 
          class="nav-link admin-link"
          exact-active-class="active"
        >
          {{ $t('nav.adminalbums') }}
        </router-link>

        <router-link to="/blindtest" class="nav-link">🎵 Blind Test</router-link>
      </div>

      <!-- Language switcher -->
      <div class="language-switcher">
        <button @click="toggleLanguage" class="lang-btn">
          <img :src="currentFlag" :alt="$i18n.locale" class="lang-btn-flagimg" />
            <p class="lang-btn-txt">{{ this.$i18n.locale.toUpperCase() }}</p>
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
import api from '../api';
import { userStore } from '../userStore';

import ukFlag from '@/assets/flag_uk.png';
import frFlag from '@/assets/flag_france.png';

export default {
  name: 'AppNavbar',

  data() {
    return {
      ukFlag,
      frFlag
    }
  },

  computed: {
    user() {
      return userStore;
    },
    isAdmin() {
      const token = localStorage.getItem('token');
      if (!token) return false;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role === 'admin';
      } catch {
        return false;
      }
    },
    isLoggedIn() {
      return userStore.isLoggedIn;
    },
    currentFlag() {
      return this.$i18n.locale === 'en' ? this.ukFlag : this.frFlag;
    }
  },

  methods: {
    async logout() {
      await api.post('/users/logout', {}, { withCredentials: true });
      userStore.userId = null;
      userStore.username = null;
      userStore.role = null;
      userStore.isLoggedIn = false;
      this.$router.push('/');
    },
    toggleLanguage() {
      const newLocale = this.$i18n.locale === 'en' ? 'fr' : 'en';
      this.$i18n.locale = newLocale;
      localStorage.setItem('locale', newLocale);
    }
  }
};
</script>

<style scoped>
.app-navbar {
  position: relative;
  width: 100%;
  height: 100px;
  background: #0d0b14;
  border-bottom: 1px solid rgba(42, 39, 64, 0.5);
  z-index: 1;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 2em;
  gap: 3em;
}

/* ═══════════════════════════════════════════════════════════
   BRAND / LOGO
   ═══════════════════════════════════════════════════════════ */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.6em;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.navbar-brand:hover {
  opacity: 0.75;
}

.brand-icon {
  font-size: 1.3em;
}

.brand-name {
  font-size: 1.15em;
  font-weight: 700;
  color: #e1e3e6;
  letter-spacing: -0.01em;
}

/* ═══════════════════════════════════════════════════════════
   NAVIGATION LINKS
   ═══════════════════════════════════════════════════════════ */
.navbar-links {
  display: flex;
  align-items: center;
  gap: 0.3em;
}

.nav-link {
  padding: 0.55em 1.1em;
  border-radius: 4px;
  text-decoration: none;
  color: #8a8b9a;
  font-size: 0.88em;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: color 0.15s ease, background 0.15s ease;
}

.nav-link:hover {
  color: #e1e3e6;
  background: rgba(255, 255, 255, 0.04);
}

.nav-link.active {
  color: #fff;
  background: #802BB1;
}

/* Admin link */
.admin-link:hover {
  color: #ffb347;
  background: rgba(255, 179, 71, 0.08);
}

.admin-link.active {
  color: #fff;
  background: #d35400;
}

/* Language switcher */
.language-switcher {
  margin-left: auto;
  margin-right: 70px;
}

.lang-btn {
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.lang-btn:hover {
  opacity: 1;
}

.lang-btn-flagimg {
  width: 30px;
  height: 20px;
  object-fit: cover;
  background: none !important;
  display: inline-block;
}

.lang-btn-txt {
  color: rgb(211, 211, 211);
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1.2em;
    gap: 1.5em;
  }

  .brand-name {
    font-size: 1em;
  }

  .nav-link {
    padding: 0.5em 0.8em;
    font-size: 0.82em;
  }
}

@media (max-width: 480px) {
  .app-navbar {
    height: 50px;
  }

  .brand-name {
    display: none;
  }

  .navbar-container {
    padding: 0 1em;
    gap: 1em;
  }
}
</style>
