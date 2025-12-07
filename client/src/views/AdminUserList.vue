<template>
  <div v-if="isAdmin" class="admin-page">
    <div class="admin-container">
      <h2 class="admin-title">{{ $t('admin.users.pageTitle') }}</h2>
      
      <div class="table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>{{ $t('admin.users.table.id') }}</th>
              <th>{{ $t('admin.users.table.username') }}</th>
              <th>{{ $t('admin.users.table.email') }}</th>
              <th>{{ $t('admin.users.table.role') }}</th>
              <th>{{ $t('admin.users.table.comments') }}</th>
              <th>{{ $t('admin.users.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td class="cell-id">{{ u.id }}</td>
              <td>
                <span class="user-link" @click="toggleUserHistory(u.id, u.username, $event)">
                  {{ u.username }}
                </span>
              </td>
              <td class="cell-email">{{ u.email }}</td>
              <td>
                <span class="role-badge" :class="u.role">{{ u.role }}</span>
              </td>
              <td>
                <span class="status-badge" :class="u.can_comment ? 'active' : 'blocked'">
                  {{ u.can_comment ? $t('admin.users.table.allowed') : $t('admin.users.table.blocked') }}
                </span>
              </td>
              <td>
                <button 
                  v-if="u.can_comment" 
                  class="action-btn block-btn" 
                  @click="block(u.id)"
                >
                  {{ $t('admin.users.table.block') }}
                </button>
                <button 
                  v-else 
                  class="action-btn unblock-btn" 
                  @click="unblock(u.id)"
                >
                  {{ $t('admin.users.table.unblock') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- User History -->
      <div
        v-if="showUserHistory && popupUserId"
        class="user-history-popup"
        :style="popupPosition"
        @click.stop
      >
        <div class="popup-header">
          <span>{{ $t('admin.users.userHistory.historyOf') }} {{ userHistoryName }}</span>
          <button @click.stop="closeUserHistory" class="popup-close-btn">✕</button>
        </div>
        <div class="popup-content">
          <div v-if="userHistory.length">
            <div v-for="r in userHistory" :key="r.id" class="history-item">
              <div class="history-album">
                <strong>{{ r.title }}</strong>
                <span class="history-artist">({{ r.artist }})</span>
              </div>
              <div class="history-rating">
                {{ $t('admin.users.userHistory.ratingLabel') }}
                <span class="rating-value">{{ r.rating }} ★</span>
              </div>
              <div v-if="r.review_text && r.review_text.trim() !== ''" class="history-comment">
                « {{ r.review_text }} »
              </div>
              <button class="delete-review-btn" @click.stop="adminDeleteReview(r.id)">
                {{ $t('admin.users.userHistory.delete') }}
              </button>
            </div>
          </div>
          <div v-else class="no-history">
            <em>{{ $t('admin.users.userHistory.noHistory') }}</em>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="access-denied">
    <div class="denied-content">
      <span class="denied-icon">🔒</span>
      <h2>{{ $t('admin.users.accessDenied.title') }}</h2>
      <p>{{ $t('admin.users.accessDenied.message') }}</p>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  data() {
    return {
      userToken: localStorage.getItem('token') || '',
      users: [],
      showUserHistory: false,
      userHistory: [],
      userHistoryName: '',
      popupUserId: null,
      popupPosition: {},
    };
  },
  computed: {
    isAdmin() {
      if (!this.userToken) return false;
      try {
        const payload = JSON.parse(atob(this.userToken.split('.')[1]));
        return payload.role === 'admin';
      } catch {
        return false;
      }
    }
  },
  mounted() {
    if (this.isAdmin) {
      api.get('/users', { headers: { Authorization: 'Bearer ' + this.userToken } }).then(res => {
        this.users = res.data;
      });
      window.addEventListener('click', this.closeUserHistory);
    }
  },
  beforeUnmount() {
    window.removeEventListener('click', this.closeUserHistory);
  },
  methods: {
    async toggleUserHistory(userId, username, event) {
      if (this.showUserHistory && this.popupUserId === userId) {
        this.closeUserHistory();
        return;
      }
      const res = await api.get(`/reviews/user/${userId}`);
      this.userHistory = res.data;
      this.userHistoryName = username;
      this.showUserHistory = true;
      this.popupUserId = userId;
      
      this.popupPosition = this.calculatePopupPosition(event.target);
    },

    calculatePopupPosition(targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const popupHeight = 400;
      const gap = 8;
      const viewportHeight = window.innerHeight;
      
      const spaceBelow = viewportHeight - (rect.bottom + gap);
      const spaceAbove = rect.top - gap;
      
      let top;
      
      if (spaceBelow > popupHeight) {
        top = rect.bottom + gap;
      }

      else if (spaceAbove > popupHeight) {
        top = rect.top - popupHeight - gap;
      }
      
      else {
        top = rect.bottom + gap;
      }
      
      return {
        position: 'fixed',
        top: top + 'px',
        left: rect.left + 'px'
      };
    },

    closeUserHistory() {
      this.showUserHistory = false;
      this.popupUserId = null;
      this.userHistory = [];
      this.userHistoryName = '';
      this.popupPosition = {};
    },
    async adminDeleteReview(reviewId) {
      try {
        await api.delete(`/reviews/${reviewId}`, { headers: { Authorization: 'Bearer ' + this.userToken } });
        this.userHistory = this.userHistory.filter(r => r.id !== reviewId);
      } catch {
        alert("Erreur lors de la suppression.");
      }
    },
    block(id) {
      api.put(`/users/${id}/block-comments`, {}, { headers: { Authorization: 'Bearer ' + this.userToken } }).then(() => {
        this.users.find(u => u.id === id).can_comment = 0;
      });
    },
    unblock(id) {
      api.put(`/users/${id}/unblock-comments`, {}, { headers: { Authorization: 'Bearer ' + this.userToken } }).then(() => {
        this.users.find(u => u.id === id).can_comment = 1;
      });
    },
  }
};
</script>

<style scoped>

/* ═══════════════════════════════════════════════════════════
   VARIABLES
   ═══════════════════════════════════════════════════════════ */

.admin-page {
  --bg-dark: #14111f;
  --bg-card: #1c1928;
  --bg-row-hover: #252136;
  --accent-violet: #802BB1;
  --accent-green: #00c030;
  --accent-red: #e74c3c;
  --accent-orange: #f39c12;
  --text-main: #e1e3e6;
  --text-muted: #9a9bab;
  --text-dim: #6b6c7a;
  --border-subtle: #2a2740;
}

/* ═══════════════════════════════════════════════════════════
   PAGE LAYOUT
   ═══════════════════════════════════════════════════════════ */

.admin-page {
  min-height: 100vh;
  background: var(--bg-dark);
  color: var(--text-main);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 2em;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-title {
  font-size: 1.4em;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 1.5em;
  padding-bottom: 0.8em;
  border-bottom: 1px solid var(--border-subtle);
}

/* ═══════════════════════════════════════════════════════════
   TABLE
   ═══════════════════════════════════════════════════════════ */

.table-wrapper {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}

.admin-table thead {
  background: rgba(255, 255, 255, 0.03);
}

.admin-table th {
  text-align: center;
  padding: 1em 1.2em;
  font-size: 0.8em;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-subtle);
}

.admin-table td {
  padding: 1em 1.2em;
  font-size: 0.95em;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: middle;
}

.admin-table tbody tr:last-child td {
  border-bottom: none;
}

.admin-table tbody tr:hover {
  background: var(--bg-row-hover);
}

.cell-id {
  color: var(--text-dim);
  font-size: 0.9em;
}

.cell-email {
  color: var(--text-muted);
  font-size: 0.9em;
}

/* ═══════════════════════════════════════════════════════════
   USER LINK
   ═══════════════════════════════════════════════════════════ */

.user-link {
  color: var(--accent-violet);
  cursor: pointer;
  font-weight: 500;
  transition: color 0.15s ease;
}

.user-link:hover {
  color: var(--accent-green);
  text-decoration: underline;
}

/* ═══════════════════════════════════════════════════════════
   BADGES
   ═══════════════════════════════════════════════════════════ */

.role-badge {
  display: inline-block;
  padding: 0.3em 0.8em;
  font-size: 0.8em;
  font-weight: 600;
  border-radius: 4px;
  text-transform: capitalize;
}

.role-badge.admin {
  background: rgba(128, 43, 177, 0.2);
  color: var(--accent-violet);
}

.role-badge.user {
  background: rgba(154, 155, 171, 0.15);
  color: var(--text-muted);
}

.status-badge {
  display: inline-block;
  padding: 0.3em 0.8em;
  font-size: 0.8em;
  font-weight: 600;
  border-radius: 4px;
}

.status-badge.active {
  background: rgba(0, 192, 48, 0.15);
  color: var(--accent-green);
}

.status-badge.blocked {
  background: rgba(231, 76, 60, 0.15);
  color: var(--accent-red);
}

/* ═══════════════════════════════════════════════════════════
   ACTION BUTTONS
   ═══════════════════════════════════════════════════════════ */

.action-btn {
  padding: 0.45em 1em;
  font-size: 0.85em;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.action-btn:hover {
  filter: brightness(1.15);
}

.block-btn {
  background: var(--accent-red);
  color: #fff;
}

.unblock-btn {
  background: var(--accent-green);
  color: #fff;
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════ */

@media (max-width: 900px) {
  .admin-page {
    padding: 1.5em 1em;
  }
  .admin-table th,
  .admin-table td {
    padding: 0.7em;
    font-size: 0.85em;
  }
  .actions-cell {
    flex-direction: column;
    gap: 0.3em;
  }
  .action-btn {
    padding: 0.3em 0.6em;
    font-size: 0.8em;
  }
}

@media (max-width: 600px) {
  .admin-title {
    font-size: 1.2em;
  }
  .admin-table th:nth-child(3),
  .admin-table td:nth-child(3),
  .admin-table th:nth-child(4),
  .admin-table td:nth-child(4) {
    display: none;
  }
}

@media (max-width: 400px) {
  .admin-table th:nth-child(5),
  .admin-table td:nth-child(5) {
    display: none;
  }
}


/* ═══════════════════════════════════════════════════════════
   USER HISTORY
   ═══════════════════════════════════════════════════════════ */

.user-history-popup {
  background: var(--bg-card);
  color: var(--text-main);
  min-width: 340px;
  max-width: 400px;
  max-height: 100vh;
  overflow-y: auto;
  padding: 1.2em;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
  z-index: 3000;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1em;
  padding-bottom: 0.8em;
  border-bottom: 1px solid var(--border-subtle);
}

.popup-header span {
  font-size: 0.95em;
  font-weight: 600;
  color: var(--text-main);
}

.popup-close-btn {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 1.1em;
  cursor: pointer;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  transition: background 0.12s, color 0.12s;
}

.popup-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-main);
}

.popup-content {
  max-height: calc(60vh - 60px);
  overflow-y: auto;
}

.history-item {
  padding: 1em 0;
  border-bottom: 1px solid var(--border-subtle);
}

.history-item:last-child {
  border-bottom: none;
}

.history-album strong {
  color: var(--text-main);
  font-weight: 500;
}

.history-artist {
  color: var(--text-dim);
  font-size: 0.9em;
  margin-left: 0.3em;
}

.history-rating {
  font-size: 0.9em;
  color: var(--text-muted);
  margin-top: 0.3em;
}

.rating-value {
  color: var(--accent-green);
  font-weight: 600;
}

.history-comment {
  font-size: 0.9em;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 0.4em;
  line-height: 1.4;
}

.delete-review-btn {
  margin-top: 0.8em;
  padding: 0.4em 0.9em;
  font-size: 0.8em;
  font-weight: 500;
  background: var(--accent-red);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.delete-review-btn:hover {
  filter: brightness(1.15);
}

.no-history {
  color: var(--text-dim);
  font-size: 0.9em;
  padding: 1em 0;
}

/* ═══════════════════════════════════════════════════════════
   ACCESS DENIED
   ═══════════════════════════════════════════════════════════ */

.access-denied {
  min-height: 100vh;
  background: var(--bg-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.denied-content {
  text-align: center;
  color: var(--text-main);
}

.denied-icon {
  font-size: 3em;
  display: block;
  margin-bottom: 0.5em;
}

.denied-content h2 {
  font-size: 1.5em;
  font-weight: 600;
  color: #e1e3e6;
  margin-bottom: 0.5em;
}

.denied-content p {
  font-size: 0.95em;
  color: #9a9bab;
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

@media (max-width: 900px) {
  .admin-page {
    padding: 1.5em 1em;
  }

  .admin-table th,
  .admin-table td {
    padding: 0.8em;
    font-size: 0.85em;
  }

  .user-history-popup {
    min-width: 300px;
    max-width: calc(100vw - 2em);
  }
}

@media (max-width: 600px) {
  .admin-title {
    font-size: 1.2em;
  }

  .admin-table {
    font-size: 0.85em;
  }

  .admin-table th,
  .admin-table td {
    padding: 0.6em 0.5em;
  }

  .role-badge,
  .status-badge {
    padding: 0.2em 0.5em;
    font-size: 0.75em;
  }

  .action-btn {
    padding: 0.35em 0.7em;
    font-size: 0.8em;
  }

  .user-history-popup {
    left: 1em !important;
    right: 1em;
    min-width: auto;
    max-width: none;
    width: calc(100vw - 2em);
  }
}

@media (max-width: 480px) {
  .admin-page {
    padding: 1em 0.5em;
  }

  .admin-table th:nth-child(1),
  .admin-table td:nth-child(1),
  .admin-table th:nth-child(3),
  .admin-table td:nth-child(3) {
    display: none;
  }
}
</style>
