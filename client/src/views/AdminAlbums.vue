<template>
  <div v-if="isAdmin" class="admin-page">
    <div class="admin-container">
      <h2 class="admin-title">Gestion des albums</h2>

      <!-- Bouton Ajouter -->
      <button class="add-album-btn" @click="openAddModal">
        <span>+</span> Ajouter un album
      </button>

      <!-- Liste des albums -->
      <div class="albums-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Titre</th>
              <th>Artiste</th>
              <th>Année</th>
              <th>Genre</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="album in albums" :key="album.id">
              <td>
                <img :src="album.cover_url || 'https://via.placeholder.com/50x50?text=No'" :alt="album.title" class="table-cover" />
              </td>
              <td class="cell-title">{{ album.title }}</td>
              <td>{{ album.artist }}</td>
              <td>{{ album.release_year || '-' }}</td>
              <td>
                <span class="genre-badge" v-if="album.genre">{{ album.genre }}</span>
                <span v-else class="no-genre">-</span>
              </td>
              <td class="actions-cell">
                <button class="action-btn edit-btn" @click="openEditModal(album)">
                  Modifier
                </button>
                <button class="action-btn delete-btn" @click="confirmDelete(album)">
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Ajouter/Modifier -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Modifier l\'album' : 'Ajouter un album' }}</h3>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>
          
          <form @submit.prevent="submitForm" class="album-form">
            <div class="form-group">
              <label>Titre *</label>
              <input v-model="formData.title" type="text" required placeholder="Titre de l'album" />
            </div>
            
            <div class="form-group">
              <label>Artiste *</label>
              <input v-model="formData.artist" type="text" required placeholder="Nom de l'artiste" />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Année de sortie</label>
                <input v-model="formData.release_year" type="number" placeholder="2024" min="1900" max="2100" />
              </div>
              
              <div class="form-group">
                <label>Genre</label>
                <input v-model="formData.genre" type="text" placeholder="Pop, Rock, etc." />
              </div>
            </div>
            
            <div class="form-group">
              <label>URL de la cover</label>
              <input v-model="formData.cover_url" type="url" placeholder="https://..." />
            </div>
            
            <!-- Prévisualisation de la cover -->
            <div v-if="formData.cover_url" class="cover-preview">
              <label>Aperçu :</label>
              <img :src="formData.cover_url" alt="Preview" @error="onCoverError" />
            </div>
            
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeModal">Annuler</button>
              <button type="submit" class="submit-btn">
                {{ isEditing ? 'Enregistrer' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Confirmation Suppression -->
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="closeDeleteConfirm">
        <div class="modal-content delete-confirm">
          <div class="delete-icon">⚠️</div>
          <h3>Supprimer cet album ?</h3>
          <p>
            Êtes-vous sûr de vouloir supprimer <strong>{{ albumToDelete?.title }}</strong> ?
            <br><span class="warning-text">Cette action supprimera également toutes les reviews et chansons associées.</span>
          </p>
          <div class="form-actions">
            <button class="cancel-btn" @click="closeDeleteConfirm">Annuler</button>
            <button class="delete-confirm-btn" @click="deleteAlbum">Supprimer</button>
          </div>
        </div>
      </div>

      <!-- Notification -->
      <div v-if="notification" class="notification" :class="notification.type">
        {{ notification.message }}
      </div>
    </div>
  </div>

  <div v-else class="access-denied">
    <div class="denied-content">
      <span class="denied-icon">🔒</span>
      <h2>Accès refusé</h2>
      <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  name: 'AdminAlbums',
  data() {
    return {
      userToken: localStorage.getItem('token') || '',
      albums: [],
      showModal: false,
      isEditing: false,
      editingId: null,
      formData: {
        title: '',
        artist: '',
        release_year: '',
        genre: '',
        cover_url: ''
      },
      showDeleteConfirm: false,
      albumToDelete: null,
      notification: null
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
      this.loadAlbums();
    }
  },
  methods: {
    async loadAlbums() {
      try {
        const res = await api.get('/albums');
        this.albums = res.data;
      } catch {
        this.showNotification('Erreur lors du chargement des albums', 'error');
      }
    },

    openAddModal() {
      this.isEditing = false;
      this.editingId = null;
      this.formData = {
        title: '',
        artist: '',
        release_year: '',
        genre: '',
        cover_url: ''
      };
      this.showModal = true;
    },

    openEditModal(album) {
      this.isEditing = true;
      this.editingId = album.id;
      this.formData = {
        title: album.title,
        artist: album.artist,
        release_year: album.release_year || '',
        genre: album.genre || '',
        cover_url: album.cover_url || ''
      };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.isEditing = false;
      this.editingId = null;
    },

    async submitForm() {
      try {
        const headers = { Authorization: 'Bearer ' + this.userToken };
        
        if (this.isEditing) {
          await api.put(`/albums/${this.editingId}`, this.formData, { headers });
          this.showNotification('Album modifié avec succès', 'success');
        } else {
          await api.post('/albums', this.formData, { headers });
          this.showNotification('Album ajouté avec succès', 'success');
        }
        
        this.closeModal();
        this.loadAlbums();
      } catch (err) {
        this.showNotification(err.response?.data || 'Erreur lors de l\'opération', 'error');
      }
    },

    confirmDelete(album) {
      this.albumToDelete = album;
      this.showDeleteConfirm = true;
    },

    closeDeleteConfirm() {
      this.showDeleteConfirm = false;
      this.albumToDelete = null;
    },

    async deleteAlbum() {
      try {
        const headers = { Authorization: 'Bearer ' + this.userToken };
        await api.delete(`/albums/${this.albumToDelete.id}`, { headers });
        this.showNotification('Album supprimé avec succès', 'success');
        this.closeDeleteConfirm();
        this.loadAlbums();
      } catch (err) {
        this.showNotification(err.response?.data || 'Erreur lors de la suppression', 'error');
      }
    },

    showNotification(message, type) {
      this.notification = { message, type };
      setTimeout(() => {
        this.notification = null;
      }, 3000);
    },

    onCoverError(e) {
      e.target.src = 'https://via.placeholder.com/100x100?text=Erreur';
    }
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
  --accent-violet-light: #9b4dca;
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
   ADD BUTTON
   ═══════════════════════════════════════════════════════════ */
.add-album-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.7em 1.5em;
  font-size: 0.95em;
  font-weight: 600;
  background: var(--accent-violet);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 1.5em;
  transition: filter 0.15s ease, transform 0.15s ease;
}

.add-album-btn:hover {
  filter: brightness(1.15);
  transform: translateY(-1px);
}

.add-album-btn span {
  font-size: 1.2em;
  font-weight: 700;
}

/* ═══════════════════════════════════════════════════════════
   TABLE
   ═══════════════════════════════════════════════════════════ */
.albums-table-wrapper {
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
  text-align: left;
  padding: 1em 1.2em;
  font-size: 0.8em;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-subtle);
}

.admin-table td {
  padding: 0.8em 1.2em;
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

.table-cover {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--border-subtle);
}

.cell-title {
  font-weight: 600;
  color: var(--text-main);
}

.genre-badge {
  display: inline-block;
  padding: 0.25em 0.6em;
  font-size: 0.8em;
  font-weight: 500;
  background: rgba(128, 43, 177, 0.2);
  color: var(--accent-violet);
  border-radius: 4px;
  text-transform: capitalize;
}

.no-genre {
  color: var(--text-dim);
}

.actions-cell {
  display: flex;
  gap: 0.5em;
}

/* ═══════════════════════════════════════════════════════════
   ACTION BUTTONS
   ═══════════════════════════════════════════════════════════ */
.action-btn {
  padding: 0.4em 0.8em;
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

.edit-btn {
  background: var(--accent-violet);
  color: #fff;
}

.delete-btn {
  background: var(--accent-red);
  color: #fff;
}

/* ═══════════════════════════════════════════════════════════
   MODAL OVERLAY
   ═══════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1em;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2em 1.5em;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1em;
  font-weight: 600;
  color: var(--text-main);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 1.2em;
  cursor: pointer;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  transition: background 0.12s, color 0.12s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-main);
}

/* ═══════════════════════════════════════════════════════════
   FORM
   ═══════════════════════════════════════════════════════════ */
.album-form {
  padding: 1.5em;
}

.form-group {
  margin-bottom: 1.2em;
}

.form-group label {
  display: block;
  font-size: 0.85em;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 0.4em;
}

.form-group input {
  width: 100%;
  padding: 0.7em 1em;
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

.form-row {
  display: flex;
  gap: 1em;
}

.form-row .form-group {
  flex: 1;
}

/* ═══════════════════════════════════════════════════════════
   COVER PREVIEW
   ═══════════════════════════════════════════════════════════ */
.cover-preview {
  margin-bottom: 1.2em;
}

.cover-preview label {
  display: block;
  font-size: 0.85em;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 0.5em;
}

.cover-preview img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid var(--border-subtle);
}

/* ═══════════════════════════════════════════════════════════
   FORM ACTIONS
   ═══════════════════════════════════════════════════════════ */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8em;
  margin-top: 1.5em;
  padding-top: 1.2em;
  border-top: 1px solid var(--border-subtle);
}

.cancel-btn {
  padding: 0.6em 1.2em;
  font-size: 0.9em;
  font-weight: 500;
  background: var(--border-subtle);
  color: var(--text-main);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.cancel-btn:hover {
  background: #3a3650;
}

.submit-btn {
  padding: 0.6em 1.5em;
  font-size: 0.9em;
  font-weight: 600;
  background: var(--accent-violet);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.submit-btn:hover {
  filter: brightness(1.15);
}

/* ═══════════════════════════════════════════════════════════
   DELETE CONFIRMATION MODAL
   ═══════════════════════════════════════════════════════════ */
.delete-confirm {
  text-align: center;
  padding: 2em;
}

.delete-icon {
  font-size: 3em;
  margin-bottom: 0.3em;
}

.delete-confirm h3 {
  font-size: 1.2em;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 0.8em;
}

.delete-confirm p {
  font-size: 0.95em;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1.5em;
}

.warning-text {
  color: var(--accent-orange);
  font-size: 0.9em;
}

.delete-confirm-btn {
  padding: 0.6em 1.5em;
  font-size: 0.9em;
  font-weight: 600;
  background: var(--accent-red);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.delete-confirm-btn:hover {
  filter: brightness(1.15);
}

.delete-confirm .form-actions {
  justify-content: center;
  border-top: none;
  padding-top: 0;
}

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION
   ═══════════════════════════════════════════════════════════ */
.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.8em 2em;
  border-radius: 8px;
  font-size: 0.9em;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.notification.success {
  background: var(--accent-green);
  color: #fff;
}

.notification.error {
  background: var(--accent-red);
  color: #fff;
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
@media (max-width: 900px) {
  .admin-page {
    padding: 1.5em 1em;
  }

  .admin-table th,
  .admin-table td {
    padding: 0.7em;
    font-size: 0.85em;
  }

  .table-cover {
    width: 40px;
    height: 40px;
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

  .add-album-btn {
    width: 100%;
    justify-content: center;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .modal-content {
    margin: 0.5em;
    max-height: 95vh;
  }

  .album-form {
    padding: 1em;
  }

  /* Cacher certaines colonnes sur mobile */
  .admin-table th:nth-child(4),
  .admin-table td:nth-child(4),
  .admin-table th:nth-child(5),
  .admin-table td:nth-child(5) {
    display: none;
  }
}

@media (max-width: 400px) {
  .admin-table th:nth-child(3),
  .admin-table td:nth-child(3) {
    display: none;
  }

  .table-cover {
    width: 35px;
    height: 35px;
  }
}
</style>
