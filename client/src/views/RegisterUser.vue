<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <span class="auth-icon">🎵</span>
        <h1>Créer un compte</h1>
        <p class="auth-subtitle">Rejoignez ButterFlower pour noter vos albums préférés</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">Pseudo</label>
          <input 
            id="username"
            v-model="username" 
            type="text" 
            required 
            placeholder="Votre pseudo"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            required 
            placeholder="votre@email.com"
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            required 
            minlength="6"
            placeholder="Minimum 6 caractères"
            autocomplete="new-password"
          />
        </div>

        <button type="submit" class="submit-btn">S'inscrire</button>

        <div v-if="errorMsg" class="message error">{{ errorMsg }}</div>
        <div v-if="successMsg" class="message success">{{ successMsg }}</div>
      </form>

      <div class="auth-footer">
        <p>Déjà un compte ? <router-link to="/userlogin" class="auth-link">Se connecter</router-link></p>
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
      username: '',
      email: '',
      password: '',
      errorMsg: '',
      successMsg: ''
    };
  },
  methods: {
    handleRegister() {
      this.errorMsg = this.successMsg = '';
      api.post('/users/register', {
        username: this.username,
        email: this.email,
        password: this.password
      }).then(() => {
        this.successMsg = "Compte créé ! Connecte-toi pour continuer.";
        this.username = this.email = this.password = '';
      }).catch(err => {
        this.errorMsg = err.response?.data || err.message || "Inscription impossible";
      });
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
   SCROLLBAR HIDDEN
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
