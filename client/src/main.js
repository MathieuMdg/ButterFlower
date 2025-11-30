import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

createApp(App).use(router).mount('#app');

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
