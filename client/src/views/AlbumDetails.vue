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
          
          <div class="chanson-row" v-for="(chanson, index) in chansons" :key="chanson.id">
            <!-- Bouton Play/Pause -->
            <button 
              class="play-btn" 
              @click="togglePlay(index)"
              :disabled="!chanson.url_audio"
              :title="!chanson.url_audio ? this.$t('albumDetails.audioNotAvailable') : (currentPlaying === index ? this.$t('albumDetails.pause') : this.$t('albumDetails.play'))"
            >
              <span v-if="currentPlaying === index && isPlaying">⏸</span>
              <span v-else>▶</span>
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

          <!-- Lecteur audio caché (contrôlé par JS) -->
          <audio 
            ref="audioPlayer" 
            @ended="onAudioEnded"
            @timeupdate="onTimeUpdate"
          ></audio>

          <!-- Barre de progression -->
          <div class="audio-progress-bar" v-if="currentPlaying !== null">
            <div class="now-playing">
              <span class="now-playing-label">{{ $t('albumDetails.nowPlayingLabel') }}</span>
              <span class="now-playing-title">{{ chansons[currentPlaying]?.titre }}</span>
            </div>
            <div class="progress-container" @click="seekAudio">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <div class="time-display">
              <span>{{ formatTime(currentTime) }}</span>
              <span>{{ formatTime(duration) }}</span>
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
      currentPlaying: null, 
      isPlaying: false,     
      currentTime: 0,        
      duration: 0,          
      progressPercent: 0,
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
    this.stopAudio();
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

      togglePlay(index) {
        const audio = this.$refs.audioPlayer;
        const chanson = this.chansons[index];

        if (!chanson.url_audio) return;

        // Si on clique sur la même chanson
        if (this.currentPlaying === index) {
          if (this.isPlaying) {
            audio.pause();
            this.isPlaying = false;
          } else {
            audio.play();
            this.isPlaying = true;
          }
        } else {
          // Nouvelle chanson
          this.currentPlaying = index;
          audio.src = chanson.url_audio;
          audio.load();
          audio.play();
          this.isPlaying = true;
          
          // Récupérer la durée une fois chargée
          audio.onloadedmetadata = () => {
            this.duration = audio.duration;
          };
        }
      },

      // Quand la chanson se termine
      onAudioEnded() {
        // Passer à la chanson suivante automatiquement
        if (this.currentPlaying < this.chansons.length - 1) {
          this.togglePlay(this.currentPlaying + 1);
        } else {
          // Fin de la playlist
          this.isPlaying = false;
          this.currentPlaying = null;
          this.progressPercent = 0;
          this.currentTime = 0;
        }
      },

      // Mise à jour du temps
      onTimeUpdate() {
        const audio = this.$refs.audioPlayer;
        if (audio && audio.duration) {
          this.currentTime = audio.currentTime;
          this.progressPercent = (audio.currentTime / audio.duration) * 100;
        }
      },

      // Clic sur la barre de progression pour naviguer
      seekAudio(event) {
        const audio = this.$refs.audioPlayer;
        if (!audio || !audio.duration) return;

        const progressBar = event.currentTarget;
        const clickX = event.offsetX;
        const width = progressBar.offsetWidth;
        const seekTime = (clickX / width) * audio.duration;
        
        audio.currentTime = seekTime;
      },

      // Formater le temps en mm:ss
      formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      },

      // Arrêter la lecture quand on quitte la page
      stopAudio() {
        const audio = this.$refs.audioPlayer;
        if (audio) {
          audio.pause();
          audio.src = '';
        }
        this.isPlaying = false;
        this.currentPlaying = null;
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
  gap: 4vw;
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
  padding: 1em 4%;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5em;
  transition: color 0.15s ease;
}

.back-btn:hover {
  color: var(--accent-violet);
}

.back-btn .arrow {
  font-size: 1.2em;
}

/* ═══════════════════════════════════════════════════════════
   LEFT SIDE - COVER & INFOS
   ═══════════════════════════════════════════════════════════ */
.left-side {
  flex: 0 0 250px;  /* Réduit de 320px à 250px */
  display: flex;
  flex-direction: column;
}

.album-cover {
  width: 200px;  /* Taille fixe réduite */
  height: 200px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.5);
  border: 2px solid var(--border-subtle);
  transition: border-color 0.2s ease;
}

.album-cover:hover {
  border-color: var(--accent-violet);
}

.album-infos {
  margin-top: 1.2em;
  max-width: 200px;  /* Aligner avec la cover */
}

.album-title {
  font-size: 1.3em;  /* Réduit */
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 0.2em 0;
  line-height: 1.2;
}

.album-year {
  font-size: 0.9em;
  color: var(--text-dim);
  font-weight: 400;
}

.album-artist {
  font-size: 1em;  /* Réduit */
  color: var(--text-muted);
  margin-top: 0.3em;
}

.album-genre {
  display: inline-block;
  font-size: 0.75em;  /* Réduit */
  color: var(--accent-violet);
  background: rgba(128, 43, 177, 0.15);
  padding: 0.25em 0.7em;
  border-radius: 4px;
  margin-top: 0.6em;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ═══════════════════════════════════════════════════════════
   CHANSONS LIST - Ajuster aussi
   ═══════════════════════════════════════════════════════════ */
.album-chansons {
  margin-top: 1.5em;
  width: 100%;
  max-width: 250px;  /* Limiter la largeur */
}

.chansons-title {
  font-size: 0.75em;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.8em;
  padding-bottom: 0.5em;
  border-bottom: 1px solid var(--border-subtle);
}

.chanson-row {
  display: flex;
  align-items: center;
  gap: 0.6em;
  padding: 0.5em 0.3em;
  border-radius: 4px;
  transition: background 0.15s ease;
  margin-bottom: 0.1em;
}

/* Play Button - Plus petit */
.play-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: var(--accent-violet);
  color: #fff;
  font-size: 0.7em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, filter 0.15s ease;
  flex-shrink: 0;
}

.chanson-number {
  color: var(--text-dim);
  font-size: 0.75em;
  width: 1.2em;
  text-align: right;
  flex-shrink: 0;
}

.chanson-title {
  flex: 1;
  font-size: 0.85em;
  font-weight: 500;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chanson-duration {
  color: var(--text-dim);
  font-size: 0.75em;
  flex-shrink: 0;
}

/* Audio Progress Bar - Plus compact */
.audio-progress-bar {
  margin-top: 1em;
  padding: 0.8em;
  background: var(--bg-card);
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  max-width: 250px;
}

.now-playing-label {
  font-size: 0.7em;
}

.now-playing-title {
  font-size: 0.8em;
}

.time-display {
  font-size: 0.65em;
}

/* ═══════════════════════════════════════════════════════════
   AUDIO PROGRESS BAR
   ═══════════════════════════════════════════════════════════ */
.audio-progress-bar {
  margin-top: 1.5em;
  padding: 1em;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
}

.now-playing {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.8em;
}

.now-playing-label {
  font-size: 0.75em;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.now-playing-title {
  font-size: 0.9em;
  font-weight: 600;
  color: var(--accent-violet);
}

.progress-container {
  height: 5px;
  background: var(--border-subtle);
  border-radius: 3px;
  cursor: pointer;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-violet), var(--accent-violet-light));
  border-radius: 3px;
  transition: width 0.1s linear;
}

.time-display {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5em;
  font-size: 0.7em;
  color: var(--text-dim);
}

/* ═══════════════════════════════════════════════════════════
   RIGHT SIDE - REVIEWS
   ═══════════════════════════════════════════════════════════ */
.right-side {
  flex: 1;
  min-width: 0;
}

/* ═══════════════════════════════════════════════════════════
   REVIEW FORM
   ═══════════════════════════════════════════════════════════ */
.review-form-box {
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  padding: 1.5em;
  margin-bottom: 2em;
}

.form-title {
  margin: 0 0 1.2em 0;
  font-size: 1em;
  font-weight: 600;
  color: var(--text-main);
}

.flex-form {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.flex-form .row {
  display: flex;
  align-items: center;
  gap: 1em;
}

.input-label {
  min-width: 100px;
  font-size: 0.9em;
  font-weight: 500;
  color: var(--text-muted);
}

.fixed-textarea {
  flex: 1;
  min-height: 80px;
  max-height: 120px;
  resize: none;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  padding: 0.8em;
  font-size: 0.95em;
  background: var(--bg-dark);
  color: var(--text-main);
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.fixed-textarea:focus {
  outline: none;
  border-color: var(--accent-violet);
  box-shadow: 0 0 0 3px rgba(128, 43, 177, 0.15);
}

.fixed-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn {
  align-self: flex-start;
  padding: 0.6em 1.5em;
  font-size: 0.9em;
  font-weight: 600;
  background: var(--accent-violet);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: filter 0.15s ease, transform 0.15s ease;
}

.submit-btn:hover {
  filter: brightness(1.15);
  transform: translateY(-1px);
}

.err-txt {
  color: var(--accent-red);
  font-size: 0.9em;
  margin-top: 0.5em;
}

.comment-blocked-info {
  color: var(--accent-red);
  font-size: 0.85em;
  margin-top: 0.5em;
}

/* ═══════════════════════════════════════════════════════════
   REVIEWS LIST
   ═══════════════════════════════════════════════════════════ */
.reviews-h3 {
  font-size: 0.8em;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1em;
  padding-bottom: 0.6em;
  border-bottom: 1px solid var(--border-subtle);
}

.reviews-list {
  width: 100%;
}

.review-block {
  padding: 1.2em 0;
  border-bottom: 1px solid var(--border-subtle);
}

.review-block:last-child {
  border-bottom: none;
}

.review-username {
  font-size: 0.95em;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 0.3em;
}

.review-username.clickable {
  color: var(--accent-violet);
  cursor: pointer;
}

.review-username.clickable:hover {
  text-decoration: underline;
}

.review-stars {
  margin: 0.3em 0 0.5em 0;
}

.review-text {
  font-size: 0.95em;
  color: var(--text-muted);
  line-height: 1.5;
  font-style: italic;
}

.review-separator {
  display: none;
}

.review-actions {
  margin-top: 0.8em;
}

.review-edit-btn {
  padding: 0.4em 1em;
  font-size: 0.85em;
  font-weight: 500;
  background: var(--accent-violet);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.review-edit-btn:hover {
  filter: brightness(1.15);
}

/* ═══════════════════════════════════════════════════════════
   EDIT MODAL
   ═══════════════════════════════════════════════════════════ */
.edit-review-modal {
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  padding: 1.5em;
  margin: 1em 0;
}

.edit-review-modal h4 {
  margin: 0 0 1em 0;
  font-size: 1em;
  font-weight: 600;
  color: var(--text-main);
}

.cancel-btn {
  padding: 0.4em 1em;
  font-size: 0.85em;
  font-weight: 500;
  background: var(--border-subtle);
  color: var(--text-main);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 0.5em;
  transition: background 0.15s ease;
}

.cancel-btn:hover {
  background: var(--accent-red);
}

/* ═══════════════════════════════════════════════════════════
   USER HISTORY POPUP
   ═══════════════════════════════════════════════════════════ */
.user-history-popup {
  background: var(--bg-card);
  color: var(--text-main);
  min-width: 320px;
  max-width: 380px;
  max-height: 60vh;
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

.user-history-header-popup {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1em;
  padding-bottom: 0.8em;
  border-bottom: 1px solid var(--border-subtle);
}

.user-history-header-popup span {
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

.profile-history-item {
  padding: 0.8em 0;
  border-bottom: 1px solid var(--border-subtle);
}

.profile-history-item:last-child {
  border-bottom: none;
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
  margin-top: 0.3em;
  display: block;
  line-height: 1.4;
}

.admin-delete-review {
  padding: 0.35em 0.8em;
  font-size: 0.8em;
  font-weight: 500;
  background: var(--accent-red);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5em;
  transition: filter 0.15s ease;
}

.admin-delete-review:hover {
  filter: brightness(1.15);
}

/* ═══════════════════════════════════════════════════════════
   NOTIFICATIONS
   ═══════════════════════════════════════════════════════════ */
.notify-success {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent-green);
  color: #fff;
  font-weight: 600;
  font-size: 0.9em;
  padding: 0.8em 2em;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* ═══════════════════════════════════════════════════════════
   LOADING STATE
   ═══════════════════════════════════════════════════════════ */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-dark);
  color: var(--text-muted);
  font-size: 1em;
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
  .details-grid {
    flex-direction: column;
    padding: 1.5em 4%;
    gap: 2em;
  }

  .left-side {
    flex: none;
    width: 100%;
    max-width: 350px;
    margin: 0 auto;
  }

  .right-side {
    width: 100%;
  }

  .album-title {
    font-size: 1.4em;
  }
}

@media (max-width: 600px) {
  .details-grid {
    padding: 1em 3%;
  }

  .left-side {
    max-width: 280px;
  }

  .album-cover {
    border-radius: 6px;
  }

  .album-title {
    font-size: 1.2em;
  }

  .back-btn {
    padding: 0.8em 3%;
    font-size: 0.85em;
  }

  .review-form-box {
    padding: 1em;
  }

  .flex-form .row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5em;
  }

  .input-label {
    min-width: auto;
  }

  .fixed-textarea {
    width: 100%;
    min-width: auto;
    max-width: none;
  }

  .chanson-row {
    flex-wrap: wrap;
    gap: 0.5em;
    padding: 0.6em 0.3em;
  }

  .chanson-info {
    flex: 1 1 calc(100% - 50px);
  }

  .chanson-rating {
    flex: 1 1 100%;
    margin-top: 0.3em;
  }

  .play-btn {
    width: 30px;
    height: 30px;
    font-size: 0.75em;
  }

  .user-history-popup {
    min-width: 280px;
    max-width: calc(100vw - 2em);
    left: 1em !important;
    right: 1em;
  }

  .audio-progress-bar {
    padding: 0.8em;
  }
}

@media (max-width: 400px) {
  .album-title {
    font-size: 1.1em;
  }

  .album-artist {
    font-size: 1em;
  }

  .reviews-h3,
  .chansons-title {
    font-size: 0.75em;
  }

  .review-text {
    font-size: 0.9em;
  }

  .chanson-title {
    font-size: 0.85em;
  }

  .chanson-number {
    display: none;
  }
}
</style>
