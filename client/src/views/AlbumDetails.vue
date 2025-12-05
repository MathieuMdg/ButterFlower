<template>
  <div v-if="successMsg" class="notify-success">
    {{ successMsg }}
  </div>
  <div v-if="album" class="album-details-letterboxd">
    <button class="back-btn" @click="goBack">
      <span class="arrow">&#8592;</span> 
      {{ $t('albumDetails.backButton') }}
    </button>
    <div class="details-grid">
      
      <!-- À gauche : cover + infos + chansons -->
      <div class="left-side">
        <img :src="album.cover_url" :alt="album.title" class="album-cover" />
        <div class="album-infos">
          <h1 class="album-title">{{ album.title }}</h1>
          <span class="album-year">{{ album.release_year }}</span>
          <div class="album-artist">{{ album.artist }}</div>
          <div class="album-genre">{{ album.genre }}</div>
        </div>

        <!-- Liste des chansons sous la cover -->
        <div class="album-chansons" v-if="chansons.length">
          <h3 class="chansons-title">{{ $t('albumDetails.tracklistTitle') }}</h3>
          
          <div v-for="(chanson, index) in chansons" :key="chanson.id" class="chanson-wrapper">
            <div class="chanson-row">
              <!-- Bouton Play -->
              <button 
                class="play-btn" 
                @click="selectChanson(index)"
                :class="{ active: currentPlaying === index }"
                :title="this.$t('albumDetails.play')"
              >
                <span>▶</span>
              </button>

              <!-- Infos chanson -->
              <div class="chanson-info">
                <span class="chanson-title">{{ chanson.titre }} - </span>
                <span class="chanson-duration" v-if="chanson.duree">{{ chanson.duree }}</span>
              </div>

              <!-- Notation -->
              <div class="chanson-rating">
                <StarRating
                  :modelValue="chanson.my_note"
                  @update:modelValue="noteChanson(chanson.id, $event)"
                />
              </div>
            </div>

            <div v-if="currentPlaying === index" class="iframe-player-inline">
              <!-- Cas 1: On a un ID Deezer (Idéal) -->
              <iframe
                v-if="chanson.deezer_id"
                title="deezer-widget"
                :src="`https://widget.deezer.com/widget/dark/track/${chanson.deezer_id}`"
                width="100%"
                height="150"
                allow="encrypted-media; clipboard-write">
              </iframe>

              <!-- Cas 2: Pas de Deezer ID -->
              <div v-else class="no-track-msg">
                <p>Lecteur non disponible pour ce titre.</p>
              </div>
            </div>
          </div>
          
        </div>

        <div v-else class="no-chansons">
          <em>{{ $t('albumDetails.noTracksFound') }}</em>
        </div>
      </div>

      <!-- À droite : reviews + form -->
      <div class="right-side">
        <div v-if="userToken" class="review-form-box">
          <h4 class="form-title">{{ $t('albumDetails.addReviewBox.title') }}</h4>
          <form @submit.prevent="addReview" class="flex-form">
            <div class="row">
              <span class="input-label">{{ $t('albumDetails.addReviewBox.ratingLabel') }}</span> 
              <StarRating v-model="newReview.rating" />
            </div>
            <div class="row">
              <span class="input-label">{{ $t('albumDetails.addReviewBox.commentLabel') }}</span>
              <textarea v-model="newReview.review_text"
                :disabled="!canComment"
                class="fixed-textarea"
                placeholder="Commentaire"></textarea>
              <div v-if="!canComment" class="comment-blocked-info">
                {{ $t('albumDetails.addReviewBox.blockedInfo') }}
              </div>
            </div>
            <button type="submit" class="submit-btn">{{ $t('albumDetails.addReviewBox.sendButton') }}</button>
          </form>
          <div v-if="err" class="err-txt">{{ err }}</div>
        </div>
        
        <h3 class="reviews-h3">{{ $t('albumDetails.reviews.title') }}</h3>
        <div class="reviews-list">
          <div
            v-for="review in reviews"
            :key="review.id"
            class="review-block"
          >
            <div
              class="review-username"
              :class="{ clickable: isAdmin }"
              @click="isAdmin && toggleUserHistory(review.user_id, review.username, $event)"
              :title="isAdmin ? this.$t('albumDetails.userHistory.historyOf') : ''"
            >
              {{ review.username || this.$t('albumDetails.reviews.unknownUser') }}

              <div
                v-if="showUserHistory && popupUserId === review.user_id"
                class="user-history-popup"
                :style="popupPosition"
              >
                <div class="user-history-header-popup">
                  <span>{{ $t('albumDetails.userHistory.historyOf') }} {{ userHistoryName }}</span>
                  <button @click.stop="closeUserHistory" class="popup-close-btn">✕</button>
                </div>
                <div v-if="userHistory.length">
                  <div v-for="r in userHistory" :key="r.id" class="profile-history-item">
                    <div><strong>{{ r.title }}</strong> <span class="profile-history-artist">({{ r.artist }})</span></div>
                    <div>
                      <span>{{ $t('albumDetails.addReviewBox.ratingLabel') }} <span class="profile-history-note">{{ r.rating }} {{ $t('profile.stars') }}</span></span>
                    </div>
                    <div v-if="r.review_text && r.review_text.trim() !== ''">
                      <span class="profile-history-comment">«{{ r.review_text }}»</span>
                    </div>
                    <button
                      v-if="isAdmin"
                      class="admin-delete-review"
                      @click.stop="adminDeleteReview(r.id)"
                      title="{{this.$t('albumDetails.reviews.adminDeleteTitle')}}"
                    >{{ $t('albumDetails.reviews.adminDeleteTitle') }}</button>
                  </div>
                </div>
                <div v-else>
                  <em>{{ $t('albumDetails.userHistory.noReviews') }}</em>
                </div>
              </div>
            </div>
            <div class="review-stars">
              <StarRating :modelValue="review.rating" :readonly="true" />
            </div>
            <div class="review-text" v-if="review.review_text && review.review_text.trim() !== ''">
              <em>{{ review.review_text }}</em>
            </div>
            <div v-if="isMyReview(review)" class="review-actions">
              <button class="review-edit-btn" @click="editReviewMode(review)">{{ $t('albumDetails.reviews.edit') }}</button>
            </div>
            <hr class="review-separator" />
          </div>

          <!-- Formulaire d'édition -->
          <div v-if="editMode" class="edit-review-modal">
            <h4>{{ $t('albumDetails.reviews.edit') }}</h4>
            <form @submit.prevent="submitEditReview" class="flex-form">
              <div class="row">
                <span>{{ $t('albumDetails.addReviewBox.ratingLabel') }}</span>
                <StarRating v-model="editReviewData.rating" />
              </div>
              <div class="row">
                <span>{{ $t('albumDetails.addReviewBox.commentPlaceholder') }}</span>
                <textarea v-model="editReviewData.review_text" class="fixed-textarea"></textarea>
              </div>
              <button type="submit" class="submit-btn">{{ $t('albumDetails.reviews.validate') }}</button>
              <button type="button" @click="cancelEditReview" class="cancel-btn">{{ $t('albumDetails.reviews.cancel') }}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="loading">
    {{ $t('ui.loadingAlbum') }}
  </div>
</template>

<script>
import api from '../api';
import StarRating from "../components/StarRating.vue";

export default {
  props: ['id'],
  components: { StarRating },
  data() {
    return {
      album: null,
      reviews: [],
      newReview: { rating: 5, review_text: '' },
      err: '',
      userToken: localStorage.getItem('token') || '',
      successMsg: '',
      editMode: false,
      editReviewData: null,
      canComment: true,
      showUserHistory: false,
      popupUserId: null,
      popupPosition: {},
      userHistory: [],
      userHistoryName: '',
      chansons: [],
      currentPlaying: null
    };
  },
  mounted() {
    const id = this.$route.params.id;
    api.get(`/albums/${id}`).then(res => {
      this.album = res.data;
      return api.get(`/albums/${this.album.id}/chansons`);
    }).then(res => {
      this.chansons = res.data;
      if (this.userToken) {
        const userId = this.getUserIdFromToken(this.userToken);
        this.chansons.forEach((chanson, idx) => {
          api.get(`/chansons/${chanson.id}/note/${userId}`).then(noteRes => {
            this.chansons[idx].my_note = noteRes.data.note;
          });
        });
      }
    });
    api.get(`/reviews/album/${id}`).then(res => this.reviews = res.data);
    window.addEventListener('click', this.closeUserHistory);
    if (this.userToken) {
      api.get(`/users/me?token=${this.userToken}`).then(res => {
        this.canComment = res.data.can_comment !== 0;
      });
    }
  },
  beforeUnmount() {
    window.removeEventListener('click', this.closeUserHistory);
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
  methods: {
    selectChanson(index) {
      this.currentPlaying = this.currentPlaying === index ? null : index;
    },

    async noteChanson(chansonId, note) {
      if (!this.userToken) {
        this.err = this.$t('albumDetails.addReviewBox.errNotLogged');
        return;
      }
      try {
        await api.post(`/chansons/${chansonId}/note`, {
          note,
          user_id: this.getUserIdFromToken(this.userToken)
        });
        const idx = this.chansons.findIndex(c => c.id === chansonId);
        if (idx !== -1) {
          this.chansons[idx].my_note = note;
        }
      } catch {
        this.err = this.$t('albumDetails.addReviewBox.errRating');
      }
    },

    addReview() {
      const id = this.$route.params.id;
      api.post('/reviews', {
        rating: this.newReview.rating,
        review_text: this.newReview.review_text || null,
        user_id: this.getUserIdFromToken(this.userToken),
        album_id: parseInt(id)
      }, {
        headers: { Authorization: 'Bearer ' + this.userToken }
      }).then(() => {
        this.successMsg = this.$t('albumDetails.addReviewBox.successPosted');
        setTimeout(() => { this.successMsg = ""; }, 3000);
        return api.get(`/reviews/album/${id}`);
      }).then(res => {
        this.reviews = res.data;
        this.newReview = { rating: 5, review_text: '' };
        this.err = '';
      }).catch(() => {
        this.err = this.$t('albumDetails.addReviewBox.addError');
        this.successMsg = "";
      });
    },
    getUserIdFromToken(token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
      } catch {
        return null;
      }
    },
    goBack() {
      this.$router.push('/');
    },

    isMyReview(review) {
      if (!this.userToken) return false;
      try {
        const payload = JSON.parse(atob(this.userToken.split('.')[1]));
        return review.user_id === payload.id;
      } catch {
        return false;
      }
    },
    editReviewMode(review) {
      this.editMode = true;
      this.editReviewData = { ...review };
    },
    async submitEditReview() {
      try {
        await api.put(`/reviews/${this.editReviewData.id}`, {
          rating: this.editReviewData.rating,
          review_text: this.editReviewData.review_text
        });
        const id = this.$route.params.id;
        const res = await api.get(`/reviews/album/${id}`);
        this.reviews = res.data;
        this.successMsg = this.$t('albumDetails.reviews.yourReviewUpdated');
        setTimeout(() => { this.successMsg = ""; }, 2500);
        this.editMode = false;
        this.editReviewData = null;
      } catch {
        this.err = this.$t('albumDetails.reviews.updateFailed');
      }
    },
    cancelEditReview() {
      this.editMode = false;
      this.editReviewData = null;
    },

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
      const rect = event.target.getBoundingClientRect();
      this.popupPosition = {
        position: 'fixed',
        top: rect.bottom + 5 + 'px',
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
        const id = this.$route.params.id;
        const res = await api.get(`/reviews/album/${id}`);
        this.reviews = res.data;
      } catch {
        alert("Erreur lors de la suppression.");
      }
    },
  }
};
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   VARIABLES
   ═══════════════════════════════════════════════════════════ */
.album-details-letterboxd {
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
.album-details-letterboxd {
  width: 100%;
  min-height: 100vh;
  padding: 0;
  margin: 0;
  background: var(--bg-dark);
  color: var(--text-main);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.details-grid {
  display: flex;
  gap: 4rem; /* Espace propre et large entre les colonnes */
  max-width: 1200px;
  margin: 0 auto;
  padding: 2em 4%;
  min-height: calc(100vh - 56px);
}

/* ═══════════════════════════════════════════════════════════
   BACK BUTTON
   ═══════════════════════════════════════════════════════════ */
.back-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.9em;
  font-weight: 500;
  padding: 1em 0; /* Alignement avec le contenu */
  margin-left: 4%; /* Alignement page */
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5em;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: var(--accent-violet);
  transform: translateX(-3px); /* Petit mouvement indicateur */
}

.back-btn .arrow { font-size: 1.2em; }

/* ═══════════════════════════════════════════════════════════
   LEFT SIDE - COVER & INFOS (AMÉLIORÉ)
   ═══════════════════════════════════════════════════════════ */
.left-side {
  /* FIX: Largeur fixe pour stabilité */
  flex: 0 0 300px; 
  width: 300px;
  display: flex;
  flex-direction: column;
}

.album-cover {
  /* FIX: Prend toute la largeur et force le carré */
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  /* EFFET: Transition douce */
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* EFFET: Zoom + Ombre violette au survol */
.album-cover:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 20px 50px rgba(128, 43, 177, 0.25);
  border-color: var(--accent-violet);
}

.album-infos {
  margin-top: 1.5em;
  width: 100%;
}

.album-title {
  font-size: 1.6em;
  font-weight: 800;
  color: var(--text-main);
  margin: 0 0 0.2em 0;
  line-height: 1.2;
  word-wrap: break-word;
}

.album-year {
  font-size: 1em;
  color: var(--text-dim);
  font-weight: 400;
}

.album-artist {
  font-size: 1.1em;
  color: var(--text-muted);
  margin-top: 0.4em;
  font-weight: 500;
}

.album-genre {
  display: inline-block;
  font-size: 0.75em;
  color: var(--accent-violet);
  background: rgba(128, 43, 177, 0.12);
  padding: 0.3em 0.8em;
  border-radius: 100px; /* Style "pillule" plus moderne */
  margin-top: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

/* ═══════════════════════════════════════════════════════════
   CHANSONS LIST
   ═══════════════════════════════════════════════════════════ */
.album-chansons {
  margin-top: 2.5em;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.2em;
}

.chansons-title {
  font-size: 0.8em;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1em;
  padding-bottom: 0.8em;
  border-bottom: 1px solid var(--border-subtle);
}

.chanson-wrapper {
  display: flex;
  flex-direction: column;
}

.chanson-row {
  display: flex;
  align-items: center;
  gap: 0.8em;
  padding: 0.7em 0.5em;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.chanson-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

/* Play Button - Modernisé */
.play-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--accent-violet);
  font-size: 0.75em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding-left: 2px; /* Ajustement optique icône play */
}

.play-btn:hover {
  border-color: var(--accent-violet);
  background: var(--accent-violet);
  color: #fff;
  transform: scale(1.1);
}

.play-btn.active {
  background: var(--accent-green);
  border-color: var(--accent-green);
  color: #fff;
}

.chanson-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chanson-title {
  font-size: 0.9em;
  font-weight: 500;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chanson-duration {
  color: var(--text-dim);
  font-size: 0.75em;
  margin-top: 2px;
}

.chanson-rating {
  transform: scale(0.85);
  transform-origin: right center;
}

/* ═══════════════════════════════════════════════════════════
   RIGHT SIDE - REVIEWS & FORM
   ═══════════════════════════════════════════════════════════ */
.right-side {
  flex: 1;
  min-width: 0;
}

.review-form-box {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  padding: 2em;
  margin-bottom: 2.5em;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.form-title {
  margin: 0 0 1.5em 0;
  font-size: 1.1em;
  font-weight: 700;
  color: var(--text-main);
}

.flex-form {
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}

.flex-form .row {
  display: flex;
  gap: 1.5em;
}

.input-label {
  min-width: 100px;
  font-size: 0.9em;
  font-weight: 600;
  color: var(--text-muted);
  padding-top: 10px;
}

.fixed-textarea {
  flex: 1;
  min-height: 100px;
  max-height: 200px;
  resize: vertical;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  padding: 1em;
  font-size: 0.95em;
  background: rgba(0,0,0,0.2); /* Fond plus sombre pour le champ */
  color: var(--text-main);
  font-family: inherit;
  transition: all 0.2s ease;
}

.fixed-textarea:focus {
  outline: none;
  border-color: var(--accent-violet);
  background: rgba(0,0,0,0.3);
}

.submit-btn {
  align-self: flex-start;
  padding: 0.8em 2em;
  font-size: 0.9em;
  font-weight: 600;
  background: var(--accent-violet);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: calc(100px + 1.5em); /* Alignement visuel */
}

.submit-btn:hover {
  background: var(--accent-violet-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(128, 43, 177, 0.3);
}

/* Reviews List */
.reviews-h3 {
  font-size: 0.9em;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.5em;
  padding-bottom: 0.8em;
  border-bottom: 1px solid var(--border-subtle);
}

.review-block {
  padding: 1.5em;
  background: rgba(255,255,255,0.02); /* Fond subtil pour chaque avis */
  border-radius: 8px;
  margin-bottom: 1em;
  border: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.review-block:hover {
  border-color: var(--border-subtle);
}

.review-username {
  font-size: 1em;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.3em;
}

.review-username.clickable:hover {
  color: var(--accent-violet);
  text-decoration: underline;
  cursor: pointer;
}

.review-text {
  font-size: 1em;
  color: #d1d1d6;
  line-height: 1.6;
  margin-top: 0.8em;
  font-style: normal; /* Plus lisible que l'italique par défaut */
}

/* ═══════════════════════════════════════════════════════════
   PLAYER & POPUPS
   ═══════════════════════════════════════════════════════════ */
.iframe-player-inline {
  grid-column: 1 / -1;
  margin: 0.5em 0 1em 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  animation: slideDown 0.3s ease;
}

.no-track-msg {
  padding: 15px;
  text-align: center;
  font-size: 0.9em;
  background: #000;
  color: var(--text-dim);
}

/* Tes styles existants pour les popups et notifs (inchangés car fonctionnels) */
.notify-success {
  position: fixed; top: 0; left: 50%; transform: translateX(-50%);
  background: var(--accent-green); color: #fff; padding: 1em 2em;
  border-radius: 0 0 8px 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.3); z-index: 9999;
}

.user-history-popup {
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  padding: 1em; border-radius: 8px; max-height: 50vh; overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 9999;
}
.popup-close-btn { float: right; background: none; border: none; color: #fff; cursor: pointer; }

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 900px) {
  .details-grid {
    flex-direction: column;
    align-items: center;
    gap: 3em;
  }

  .left-side {
    flex: none;
    width: 100%;
    max-width: 400px; /* Sur mobile on laisse un peu plus large */
  }

  .album-infos { text-align: center; }
  
  .submit-btn { margin-left: 0; width: 100%; }
  
  .flex-form .row { flex-direction: column; gap: 0.5em; }
  .input-label { padding-top: 0; }
}
</style>
