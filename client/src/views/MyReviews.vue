<template>
  <div>
    <h2>{{ $t('profile.reviewsBy') }} {{ user.username }}</h2>

    <ul>
      <li v-for="rev in reviews" :key="rev.id">
        <strong>{{ rev.title }} – {{ rev.artist }}</strong>
        <br>
        {{ $t('common.rating') }} : {{ rev.rating }} {{ $t('profile.stars') }}
        <br>
        {{ rev.review_text }}
        <br><br>
      </li>
    </ul>
  </div>
</template>

<script>
import api from '../api';
import { userStore } from '../userStore';

export default {
  data() {
    return { reviews: [] };
  },
  computed: {
    user() {
      return userStore;
    }
  },
  async mounted() {
    if (!userStore.isLoggedIn) {
      return this.$router.push('/userlogin');
    }

    const res = await api.get(`/reviews/user/${userStore.userId}`);
    this.reviews = res.data;
  }
}
</script>

<style scoped>

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════ */
   
@media (max-width: 768px) {
  .review-item {
    padding: 1em;
  }
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5em;
  }
  .review-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  h2 {
    font-size: 1.3em;
  }
  .review-album-title {
    font-size: 1em;
  }
  .review-text {
    font-size: 0.9em;
  }
}

</style>
