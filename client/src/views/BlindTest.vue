<template>
  <div class="blindtest-page">
    <!-- Écran d'accueil -->
    <div v-if="gameState === 'start'" class="start-screen">
      <div class="start-content">
        <h1>{{ $t('blindtest.title') }}</h1>
        <p class="description" v-html="$t('blindtest.description')"></p>

        <div class="rules">
          <div class="rule">
            <span class="points">+1</span>
            <span>{{ $t('blindtest.rules.songTitle') }}</span>
          </div>
          <div class="rule">
            <span class="points">+1</span>
            <span>{{ $t('blindtest.rules.artistName') }}</span>
          </div>
          <div class="rule">
            <span class="points">+1</span>
            <span>{{ $t('blindtest.rules.albumName') }}</span>
          </div>
        </div>
        <button @click="startGame" class="btn-start" :disabled="loading">
          {{ loading ? $t('blindtest.start.loading') : $t('blindtest.start.startButton') }}
        </button>
      </div>
    </div>

    <!-- Écran de jeu -->
    <div v-else-if="gameState === 'playing'" class="game-screen">
      <div class="game-header">
        <div class="progress-info">
          <span class="question-number">Question {{ currentQuestionIndex + 1 }}/10</span>
          <span class="current-score">Score: {{ totalScore }}/{{ maxPossibleScore }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: ((currentQuestionIndex + 1) / 10) * 100 + '%' }"></div>
        </div>
      </div>

      <!-- Question non validée -->
      <div v-if="!questionValidated" class="question-content">
        <!-- Hints section -->
        <div class="hints-section">
        <!-- Lecteur audio (seulement si audio disponible) -->
        <div v-if="currentQuestion?.audioUrl" class="hint-card audio-hint">
            <h3>🎧 {{ $t('blindtest.audioExcerpt') }}</h3>
            <div class="audio-player">
            <button @click="toggleAudio" class="btn-play">
              {{ isPlaying ? '⏸️' : '▶️' }}
            </button>
            <div class="audio-progress">
                <div class="audio-bar" :style="{ width: audioProgress + '%' }"></div>
            </div>
            <span class="audio-time">{{ formatTime(currentTime) }} / {{ $t('blindtest.audio.timeMax') }}</span>
            </div>
            <audio 
            ref="audioPlayer" 
            :src="currentQuestion.audioUrl"
            @timeupdate="updateAudioProgress"
            @ended="onAudioEnded"
            ></audio>
        </div>

        <!-- Paroles (seulement si paroles disponibles) -->
        <div v-if="currentQuestion?.paroles" class="hint-card lyrics-hint">
            <h3>📝 {{ $t('blindtest.lyricsExcerpt') }}</h3>
            <p class="lyrics-text">"{{ currentQuestion.paroles }}"</p>
        </div>
        </div>

        <!-- Formulaire de réponse -->
        <div class="answer-form">
          <div class="input-group">
            <label>{{ $t('blindtest.rules.songTitle') }}</label>
            <input 
              v-model="answers.chanson" 
              type="text" 
              :placeholder="$t('blindtest.placeholders.enterTitle')"
              list="chansons-list"
              :disabled="questionValidated"
            >
            <datalist id="chansons-list">
              <option v-for="c in suggestions.chansons" :key="c" :value="c">{{ c }}</option>
            </datalist>
          </div>

          <div class="input-group">
            <label>{{ $t('blindtest.rules.artistName') }}</label>
            <input 
              v-model="answers.artiste" 
              type="text" 
              :placeholder="$t('blindtest.placeholders.enterArtist')"
              list="artistes-list"
              :disabled="questionValidated"
            >
            <datalist id="artistes-list">
              <option v-for="a in suggestions.artistes" :key="a" :value="a">{{ a }}</option>
            </datalist>
          </div>

          <div class="input-group">
            <label>{{ $t('blindtest.rules.albumName') }}</label>
            <input 
              v-model="answers.album" 
              type="text" 
              :placeholder="$t('blindtest.placeholders.enterAlbum')"
              list="albums-list"
              :disabled="questionValidated"
            >
            <datalist id="albums-list">
              <option v-for="a in suggestions.albums" :key="a" :value="a">{{ a }}</option>
            </datalist>
          </div>

          <button @click="validateAnswer" class="btn-validate">
            {{ $t('blindtest.validateAnswer') }}
          </button>
        </div>
      </div>

      <!-- Résultat de la question -->
      <div v-else class="result-content">
        <div class="result-header">
          <h2 :class="questionScore > 0 ? 'success' : 'fail'">
            {{ questionScore === 3 ? $t('blindtest.result.perfect') : questionScore > 0 ? $t('blindtest.result.wellPlayed') : $t('blindtest.result.missed') }}
          </h2>
          <div class="question-score">{{ $t('blindtest.result.pointsPrefix') }}{{ questionScore }} {{ questionScore > 1 ? $t('blindtest.result.pointsPlural') : $t('blindtest.result.point') }}</div>
        </div>

        <div class="reveal-card">
          <img :src="currentQuestion.infos.coverUrl" :alt="currentQuestion.reponses.album" class="album-cover">
          <div class="reveal-info">
            <h3 class="song-title">{{ currentQuestion.reponses.chanson }}</h3>
            <p class="artist-name">{{ currentQuestion.reponses.artiste }}</p>
            <p class="album-name">{{ currentQuestion.reponses.album }} ({{ currentQuestion.infos.releaseYear }})</p>
            <span class="genre-tag">{{ currentQuestion.infos.genre }}</span>
          </div>
        </div>

        <div class="answers-review">
          <div class="answer-item" :class="{ correct: isCorrect('chanson'), incorrect: !isCorrect('chanson') }">
            <span class="answer-label">{{ $t('blindtest.result.songLabel') }}</span>
            <span class="your-answer">{{ answers.chanson || $t('blindtest.result.empty') }}</span>
            <span class="icon">{{ isCorrect('chanson') ? '✓' : '✗' }}</span>
          </div>
          <div class="answer-item" :class="{ correct: isCorrect('artiste'), incorrect: !isCorrect('artiste') }">
            <span class="answer-label">{{ $t('blindtest.result.artistLabel') }}</span>
            <span class="your-answer">{{ answers.artiste || $t('blindtest.result.empty') }}</span>
            <span class="icon">{{ isCorrect('artiste') ? '✓' : '✗' }}</span>
          </div>
          <div class="answer-item" :class="{ correct: isCorrect('album'), incorrect: !isCorrect('album') }">
            <span class="answer-label">{{ $t('blindtest.result.albumLabel') }}</span>
            <span class="your-answer">{{ answers.album || $t('blindtest.result.empty') }}</span>
            <span class="icon">{{ isCorrect('album') ? '✓' : '✗' }}</span>
          </div>
        </div>

        <button @click="nextQuestion" class="btn-next">
          {{ currentQuestionIndex < 9 ? $t('blindtest.result.nextQuestion') : $t('blindtest.result.seeResults') }}
        </button>
      </div>
    </div>

    <!-- Écran de fin -->
    <div v-else-if="gameState === 'finished'" class="end-screen">
      <div class="end-content">
        <h1>{{ $t('blindtest.end.gameFinished') }}</h1>
        
        <div class="final-score">
          <div class="score-circle" :class="scoreClass">
            <span class="score-value">{{ totalScore }}</span>
            <span class="score-max">{{ $t('blindtest.end.finalScoreOf') }}</span>
          </div>
        </div>

        <div class="score-message">
          <p>{{ scoreMessage }}</p>
        </div>

        <div class="stats">
          <div class="stat">
            <span class="stat-value">{{ perfectAnswers }}</span>
            <span class="stat-label">{{ $t('blindtest.end.perfectAnswers') }}</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ partialAnswers }}</span>
            <span class="stat-label">{{ $t('blindtest.end.partialAnswers') }}</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ wrongAnswers }}</span>
            <span class="stat-label">{{ $t('blindtest.end.wrongAnswers') }}</span>
          </div>
        </div>

        <div class="end-actions">
          <button @click="restartGame" class="btn-restart">{{ $t('blindtest.end.playAgain') }}</button>
          <router-link to="/albums" class="btn-back">{{ $t('blindtest.end.backToAlbums') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  name: 'BlindTest',
  data() {
    return {
      gameState: 'start', // 'start', 'playing', 'finished'
      loading: false,
      questions: [],
      currentQuestionIndex: 0,
      questionValidated: false,
      questionScore: 0,
      totalScore: 0,
      scores: [],
      answers: {
        chanson: '',
        artiste: '',
        album: ''
      },
      suggestions: {
        chansons: [],
        artistes: [],
        albums: []
      },
      isPlaying: false,
      audioProgress: 0,
      currentTime: 0
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    },
    maxPossibleScore() {
      return (this.currentQuestionIndex + 1) * 3;
    },
    perfectAnswers() {
      return this.scores.filter(s => s === 3).length;
    },
    partialAnswers() {
      return this.scores.filter(s => s > 0 && s < 3).length;
    },
    wrongAnswers() {
      return this.scores.filter(s => s === 0).length;
    },
    scoreClass() {
      if (this.totalScore >= 25) return 'excellent';
      if (this.totalScore >= 18) return 'good';
      if (this.totalScore >= 10) return 'average';
      return 'low';
    },
    scoreMessage() {
      if (this.totalScore >= 27) return this.$t('blindtest.scoreMessages.incredible');
      if (this.totalScore >= 22) return this.$t('blindtest.scoreMessages.excellent');
      if (this.totalScore >= 15) return this.$t('blindtest.scoreMessages.notBad');
      if (this.totalScore >= 8) return this.$t('blindtest.scoreMessages.canDoBetter');
      return this.$t('blindtest.scoreMessages.discoverMore');
    }
  },
  methods: {
    async startGame() {
      this.loading = true;
      try {
        // Charger les questions
        const questionsRes = await api.get('/blindtest/questions');
        this.questions = questionsRes.data;

        // Charger les suggestions pour l'autocomplétion
        const suggestionsRes = await api.get('/blindtest/suggestions');
        this.suggestions = suggestionsRes.data;

        this.gameState = 'playing';
        this.currentQuestionIndex = 0;
        this.totalScore = 0;
        this.scores = [];
      } catch (error) {
        console.error('Erreur chargement blind test:', error);
        alert('Erreur lors du chargement du blind test');
      } finally {
        this.loading = false;
      }
    },

    toggleAudio() {
      const audio = this.$refs.audioPlayer;
      if (!audio) return;

      if (this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      this.isPlaying = !this.isPlaying;
    },

    updateAudioProgress() {
      const audio = this.$refs.audioPlayer;
      if (!audio) return;

      this.currentTime = audio.currentTime;
      this.audioProgress = (audio.currentTime / 30) * 100; // 30 secondes max

      // Arrêter après 30 secondes
      if (audio.currentTime >= 30) {
        audio.pause();
        audio.currentTime = 0;
        this.isPlaying = false;
      }
    },

    onAudioEnded() {
      this.isPlaying = false;
      this.audioProgress = 0;
      this.currentTime = 0;
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    normalizeString(str) {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/[^a-z0-9]/g, ''); // Enlever la ponctuation
    },

    isCorrect(type) {
      if (!this.currentQuestion) return false;
      
      const userAnswer = this.normalizeString(this.answers[type] || '');
      const correctAnswer = this.normalizeString(this.currentQuestion.reponses[type] || '');
      
      return userAnswer === correctAnswer;
    },

    validateAnswer() {
      if (!this.currentQuestion) return;

      // Arrêter l'audio
      if (this.$refs.audioPlayer) {
        this.$refs.audioPlayer.pause();
        this.isPlaying = false;
      }

      // Calculer le score
      let score = 0;
      if (this.isCorrect('chanson')) score++;
      if (this.isCorrect('artiste')) score++;
      if (this.isCorrect('album')) score++;

      this.questionScore = score;
      this.totalScore += score;
      this.scores.push(score);
      this.questionValidated = true;
    },

    nextQuestion() {
      if (this.currentQuestionIndex < 9) {
        // Passer à la question suivante
        this.currentQuestionIndex++;
        this.questionValidated = false;
        this.questionScore = 0;
        this.answers = {
          chanson: '',
          artiste: '',
          album: ''
        };
        this.audioProgress = 0;
        this.currentTime = 0;
        this.isPlaying = false;
      } else {
        // Fin de partie
        this.gameState = 'finished';
      }
    },

    restartGame() {
      this.gameState = 'start';
      this.questions = [];
      this.currentQuestionIndex = 0;
      this.questionValidated = false;
      this.questionScore = 0;
      this.totalScore = 0;
      this.scores = [];
      this.answers = {
        chanson: '',
        artiste: '',
        album: ''
      };
      this.isPlaying = false;
      this.audioProgress = 0;
      this.currentTime = 0;
    }
  },

  beforeUnmount() {
    // Arrêter l'audio avant de quitter la page
    if (this.$refs.audioPlayer) {
      this.$refs.audioPlayer.pause();
    }
  }
};
</script>

<style scoped>
.blindtest-page {
  min-height: 100vh;
  background: #14111f;
  color: #e1e3e6;
  padding: 20px;
}

/* ÉCRAN D'ACCUEIL */
.start-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 40px);
}

.start-content {
  max-width: 600px;
  text-align: center;
}

.start-content h1 {
  font-size: 3.5rem;
  margin-bottom: 20px;
  color: #802BB1;
}

.description {
  font-size: 1.2rem;
  color: #9a9bab;
  margin-bottom: 40px;
  line-height: 1.6;
}

.rules {
  background: #1c1928;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rule {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 1.1rem;
}

.points {
  background: #802BB1;
  color: white;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.btn-start {
  background: #802BB1;
  color: white;
  border: none;
  padding: 18px 40px;
  font-size: 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
}

.btn-start:hover:not(:disabled) {
  background: #9a3dd1;
  transform: translateY(-2px);
}

.btn-start:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ÉCRAN DE JEU */
.game-screen {
  max-width: 900px;
  margin: 0 auto;
}

.game-header {
  margin-bottom: 30px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 1.1rem;
  font-weight: 500;
}

.question-number {
  color: #e1e3e6;
}

.current-score {
  color: #802BB1;
  font-weight: bold;
}

.progress-bar {
  height: 8px;
  background: #1c1928;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #802BB1, #9a3dd1);
  transition: width 0.5s ease;
}

/* QUESTION */
.question-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.hints-section {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.hint-card {
  background: #1c1928;
  border-radius: 12px;
  padding: 25px;
  flex: 1;
  max-width: 600px; /* Limite la largeur quand il y a un seul élément */
}


.hint-card h3 {
  margin-bottom: 20px;
  color: #802BB1;
  font-size: 1.2rem;
}

/* Lecteur audio */
.audio-player {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn-play {
  background: #802BB1;
  color: white;
  border: none;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  margin: 0 auto;
}

.btn-play:hover {
  background: #9a3dd1;
  transform: scale(1.1);
}

.audio-progress {
  height: 6px;
  background: #14111f;
  border-radius: 10px;
  overflow: hidden;
}

.audio-bar {
  height: 100%;
  background: #802BB1;
  transition: width 0.1s linear;
}

.audio-time {
  text-align: center;
  color: #9a9bab;
  font-size: 0.9rem;
}

/* Paroles */
.lyrics-text {
  font-style: italic;
  color: #e1e3e6;
  font-size: 1.1rem;
  line-height: 1.8;
  text-align: center;
  padding: 20px;
}

/* Formulaire */
.answer-form {
  background: #1c1928;
  border-radius: 12px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: #9a9bab;
  font-size: 0.95rem;
  font-weight: 500;
}

.input-group input {
  background: #14111f;
  border: 2px solid #2a2735;
  color: #e1e3e6;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #802BB1;
}

.input-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-validate {
  background: #802BB1;
  color: white;
  border: none;
  padding: 14px 30px;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  margin-top: 10px;
}

.btn-validate:hover {
  background: #9a3dd1;
  transform: translateY(-2px);
}

/* RÉSULTAT */
.result-content {
  max-width: 700px;
  margin: 0 auto;
}

.result-header {
  text-align: center;
  margin-bottom: 30px;
}

.result-header h2 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.result-header h2.success {
  color: #4caf50;
}

.result-header h2.fail {
  color: #9a9bab;
}

.question-score {
  font-size: 1.5rem;
  color: #802BB1;
  font-weight: bold;
}

.reveal-card {
  background: #1c1928;
  border-radius: 12px;
  padding: 30px;
  display: flex;
  gap: 25px;
  margin-bottom: 30px;
  align-items: center;
}

.album-cover {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.reveal-info {
  flex: 1;
}

.song-title {
  font-size: 1.8rem;
  margin-bottom: 8px;
  color: #e1e3e6;
}

.artist-name {
  font-size: 1.3rem;
  color: #802BB1;
  margin-bottom: 5px;
}

.album-name {
  color: #9a9bab;
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.genre-tag {
  background: #2a2735;
  color: #9a9bab;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  display: inline-block;
}

.answers-review {
  background: #1c1928;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.answer-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 15px;
  border-radius: 8px;
  transition: all 0.3s;
}

.answer-item.correct {
  background: rgba(76, 175, 80, 0.1);
  border-left: 4px solid #4caf50;
}

.answer-item.incorrect {
  background: rgba(244, 67, 54, 0.1);
  border-left: 4px solid #f44336;
}

.answer-label {
  color: #9a9bab;
  font-weight: 500;
  min-width: 80px;
}

.your-answer {
  color: #e1e3e6;
  flex: 1;
}

.icon {
  font-size: 1.5rem;
  font-weight: bold;
}

.answer-item.correct .icon {
  color: #4caf50;
}

.answer-item.incorrect .icon {
  color: #f44336;
}

.btn-next {
  background: #802BB1;
  color: white;
  border: none;
  padding: 14px 30px;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  width: 100%;
}

.btn-next:hover {
  background: #9a3dd1;
  transform: translateY(-2px);
}

/* ÉCRAN DE FIN */
.end-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 40px);
}

.end-content {
  max-width: 600px;
  text-align: center;
  width: 100%;
}

.end-content h1 {
  font-size: 3rem;
  margin-bottom: 40px;
  color: #802BB1;
}

.final-score {
  margin-bottom: 30px;
}

.score-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 8px solid;
  position: relative;
}

.score-circle.excellent {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.score-circle.good {
  border-color: #2196F3;
  background: rgba(33, 150, 243, 0.1);
}

.score-circle.average {
  border-color: #FF9800;
  background: rgba(255, 152, 0, 0.1);
}

.score-circle.low {
  border-color: #9a9bab;
  background: rgba(154, 155, 171, 0.1);
}

.score-value {
  font-size: 4rem;
  font-weight: bold;
  color: #e1e3e6;
  line-height: 1;
}

.score-max {
  font-size: 1.5rem;
  color: #9a9bab;
}

.score-message {
  margin-bottom: 40px;
  padding: 20px;
  background: #1c1928;
  border-radius: 12px;
}

.score-message p {
  font-size: 1.3rem;
  color: #e1e3e6;
  line-height: 1.6;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat {
  background: #1c1928;
  border-radius: 12px;
  padding: 25px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #802BB1;
}

.stat-label {
  color: #9a9bab;
  font-size: 0.95rem;
  text-align: center;
  line-height: 1.3;
}

.end-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-restart,
.btn-back {
  padding: 14px 30px;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  text-decoration: none;
  display: inline-block;
}

.btn-restart {
  background: #802BB1;
  color: white;
  border: none;
}

.btn-restart:hover {
  background: #9a3dd1;
  transform: translateY(-2px);
}

.btn-back {
  background: #2a2735;
  color: #e1e3e6;
  border: 2px solid #3a3748;
}

.btn-back:hover {
  background: #3a3748;
  transform: translateY(-2px);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .hints-section {
    grid-template-columns: 1fr;
  }

  .reveal-card {
    flex-direction: column;
    text-align: center;
  }

  .album-cover {
    width: 180px;
    height: 180px;
  }

  .song-title {
    font-size: 1.5rem;
  }

  .artist-name {
    font-size: 1.2rem;
  }
}

@media (max-width: 600px) {
  .blindtest-page {
    padding: 15px;
  }

  .start-content h1 {
    font-size: 2.5rem;
  }

  .description {
    font-size: 1rem;
  }

  .rules {
    padding: 20px;
  }

  .rule {
    font-size: 1rem;
  }

  .points {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .btn-start {
    padding: 15px 30px;
    font-size: 1rem;
  }

  .game-header {
    margin-bottom: 20px;
  }

  .progress-info {
    font-size: 1rem;
  }

  .hint-card {
    padding: 20px;
  }

  .hint-card h3 {
    font-size: 1.1rem;
    margin-bottom: 15px;
  }

  .lyrics-text {
    font-size: 1rem;
    padding: 15px;
  }

  .answer-form {
    padding: 20px;
  }

  .input-group input {
    padding: 10px 14px;
  }

  .btn-validate {
    padding: 12px 25px;
    font-size: 1rem;
  }

  .result-header h2 {
    font-size: 2rem;
  }

  .question-score {
    font-size: 1.3rem;
  }

  .reveal-card {
    padding: 20px;
  }

  .album-cover {
    width: 120px;
    height: 120px;
  }

  .song-title {
    font-size: 1.3rem;
  }

  .artist-name {
    font-size: 1rem;
  }

  .album-name {
    font-size: 0.95rem;
  }

  .answers-review {
    padding: 15px;
    gap: 10px;
  }

  .answer-item {
    padding: 10px 12px;
    gap: 10px;
  }

  .answer-label {
    min-width: 70px;
    font-size: 0.9rem;
  }

  .your-answer {
    font-size: 0.9rem;
  }

  .icon {
    font-size: 1.2rem;
  }

  .btn-next {
    padding: 12px 25px;
    font-size: 1rem;
  }

  .end-content h1 {
    font-size: 2.2rem;
    margin-bottom: 30px;
  }

  .score-circle {
    width: 160px;
    height: 160px;
    border-width: 6px;
  }

  .score-value {
    font-size: 3rem;
  }

  .score-max {
    font-size: 1.2rem;
  }

  .score-message {
    padding: 15px;
    margin-bottom: 30px;
  }

  .score-message p {
    font-size: 1.1rem;
  }

  .stats {
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 30px;
  }

  .stat {
    padding: 20px 15px;
  }

  .stat-value {
    font-size: 2rem;
  }

  .stat-label {
    font-size: 0.9rem;
  }

  .end-actions {
    flex-direction: column;
    gap: 12px;
  }

  .btn-restart,
  .btn-back {
    width: 100%;
    padding: 12px 25px;
    font-size: 1rem;
  }
}

@media (max-width: 400px) {
  .blindtest-page {
    padding: 10px;
  }

  .start-content h1 {
    font-size: 2rem;
  }

  .rules {
    padding: 15px;
    gap: 15px;
  }

  .hint-card {
    padding: 15px;
  }

  .btn-play {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }

  .answer-form {
    padding: 15px;
    gap: 15px;
  }

  .reveal-card {
    padding: 15px;
    gap: 15px;
  }

  .album-cover {
    width: 100px;
    height: 100px;
  }

  .song-title {
    font-size: 1.1rem;
  }

  .end-content h1 {
    font-size: 1.8rem;
  }

  .score-circle {
    width: 140px;
    height: 140px;
  }

  .score-value {
    font-size: 2.5rem;
  }
}
</style>
