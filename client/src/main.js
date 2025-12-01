import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import fr from './locales/fr.json'

const app = createApp(App);

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, fr }
})

app.use(i18n)
app.use(router).mount('#app');

import api from './api';
import { userStore } from './userStore';

export default {
  async mounted() {
    try {
      const res = await api.get('/users/me');
      if (res.data && res.data.userId) {
        userStore.userId = res.data.userId;
        userStore.username = res.data.username;
        userStore.role = res.data.role;
        userStore.isLoggedIn = true;
      }
    } catch (err) {
      console.log("No active session");
    }
  }
}
