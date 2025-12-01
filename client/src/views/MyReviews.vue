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
