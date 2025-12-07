import { reactive } from 'vue';

export const userStore = reactive({
  userId: null,
  username: null,
  role: null,
  isLoggedIn: false,

  initFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userId = payload.id;
        this.username = payload.username;
        this.role = payload.role;
        this.isLoggedIn = true;
      } catch {
        this.logout();
      }
    }
  },

  login(data) {
    localStorage.setItem('token', data.token);
    this.userId = data.userId;
    this.username = data.username;
    this.role = data.role;
    this.isLoggedIn = true;
  },

  logout() {
    localStorage.removeItem('token');
    this.userId = null;
    this.username = null;
    this.role = null;
    this.isLoggedIn = false;
  }
});
