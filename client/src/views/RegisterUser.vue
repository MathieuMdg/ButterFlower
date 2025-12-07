<template>
  <div class="auth-page">
    <div class="auth-container">
      <header class="auth-header">
        <div class="auth-icon">🎵</div>
        <h1>{{ $t('auth.registerTitle') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.registerSubtitle') }}</p>
      </header>

      <form class="auth-form" @submit.prevent="register">
        <div class="form-group">
          <label for="username">{{ $t('auth.usernameLabel') }}</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            :placeholder="$t('auth.usernamePlaceholder')"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">{{ $t('auth.emailLabel') }}</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            :placeholder="$t('auth.emailPlaceholder')"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">{{ $t('auth.passwordLabel') }}</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            :placeholder="$t('auth.passwordPlaceholder')"
            required
          />
        </div>

        <button class="submit-btn" type="submit" :disabled="loading">
          <span v-if="!loading">{{ $t('nav.register') }}</span>
          <span v-else>...</span>
        </button>
      </form>

      <p v-if="message" class="message" :class="{ error: isError, success: !isError }">
        {{ message }}
      </p>

      <div class="auth-footer">
        <p class="auth-subtitle">
          {{ $t('auth.alreadyAccountPrompt') }}
          <router-link to="/userlogin" class="auth-link">{{ $t('auth.signinLink') }}</router-link>
        </p>
      </div>
      
    </div>
  </div> 
</template>

<script>
import api from '../api';

export default {
  name: 'RegisterUser',
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: ''
      },
      loading: false,
      message: '',
      isError: false
    };
  },
  methods: {
    async register() {
      this.loading = true;
      this.message = '';
      this.isError = false;

      try {
        await api.post('/users/register', this.form);
        this.message = this.$t('auth.registerSuccess');
        this.isError = false;
      } catch (err) {
        this.message = this.$t('auth.registerError');
        this.isError = true;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   VARIABLES
   ═══════════════════════════════════════════════════════════ */

.auth-page {
  --bg-dark: #14111f;
  --bg-card: #1c1928;
  --accent-violet: #802BB1;
  --accent-violet-light: #9b4dca;
  --accent-green: #00c030;
  --accent-red: #e74c3c;
  --text-main: #e1e3e6;
  --text-muted: #9a9bab;
  --text-dim: #6b6c7a;
  --border-subtle: #2a2740;
}

/* ═══════════════════════════════════════════════════════════
   PAGE LAYOUT
   ═══════════════════════════════════════════════════════════ */

.auth-page {
  min-height: 100vh;
  background: var(--bg-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2em;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  padding: 2.5em 2em;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

/* ═══════════════════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════════════════ */

.auth-header {
  text-align: center;
  margin-bottom: 2em;
}

.auth-icon {
  font-size: 2.5em;
  display: block;
  margin-bottom: 0.3em;
}

.auth-header h1 {
  font-size: 1.5em;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 0.3em 0;
}

.auth-subtitle {
  font-size: 0.9em;
  color: var(--text-muted);
  margin: 0;
}

/* ═══════════════════════════════════════════════════════════
   FORM
   ═══════════════════════════════════════════════════════════ */

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4em;
}

.form-group label {
  font-size: 0.85em;
  font-weight: 500;
  color: var(--text-muted);
}

.form-group input {
  padding: 0.8em 1em;
  font-size: 0.95em;
  background: var(--bg-dark);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-main);
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input::placeholder {
  color: var(--text-dim);
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-violet);
  box-shadow: 0 0 0 3px rgba(128, 43, 177, 0.15);
}

/* ═══════════════════════════════════════════════════════════
   SUBMIT BUTTON
   ═══════════════════════════════════════════════════════════ */

.submit-btn {
  margin-top: 0.5em;
  padding: 0.9em;
  font-size: 1em;
  font-weight: 600;
  background: var(--accent-violet);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: filter 0.15s ease, transform 0.15s ease;
}

.submit-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.submit-btn:active {
  transform: translateY(0);
}

/* ═══════════════════════════════════════════════════════════
   MESSAGES
   ═══════════════════════════════════════════════════════════ */

.message {
  padding: 0.8em 1em;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: 500;
  text-align: center;
}

.message.error {
  background: rgba(231, 76, 60, 0.15);
  color: var(--accent-red);
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.message.success {
  background: rgba(0, 192, 48, 0.15);
  color: var(--accent-green);
  border: 1px solid rgba(0, 192, 48, 0.3);
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════ */

.auth-footer {
  margin-top: 2em;
  padding-top: 1.5em;
  border-top: 1px solid var(--border-subtle);
  text-align: center;
}

.auth-footer p {
  font-size: 0.9em;
  color: var(--text-muted);
  margin: 0;
}

.auth-link {
  color: var(--accent-violet);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s ease;
}

.auth-link:hover {
  color: var(--accent-violet-light);
  text-decoration: underline;
}

/* ═══════════════════════════════════════════════════════════
   SCROLLBAR
   ═══════════════════════════════════════════════════════════ */

* {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

*::-webkit-scrollbar {
  display: none;
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════ */
   
@media (max-width: 480px) {
  .auth-page {
    padding: 1em;
  }

  .auth-container {
    padding: 2em 1.5em;
    border-radius: 8px;
  }

  .auth-header h1 {
    font-size: 1.3em;
  }

  .auth-icon {
    font-size: 2em;
  }
}
</style>
