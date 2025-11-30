<template>
  <div class="star-rating">
    <span
      v-for="n in 5"
      :key="n"
      class="star"
      :class="starClass(n)"
      @mousemove="!readonly && updateHover($event, n)"
      @mouseleave="!readonly && (hoverRating = 0)"
      @click="!readonly && setRating($event, n)"
      :style="{ cursor: readonly ? 'default' : 'pointer' }"
    >★</span>
  </div>
</template>



<script>
export default {
  props: {
    modelValue: { type: Number, default: 0 },
    readonly: { type: Boolean, default: false }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      internalValue: this.modelValue || 0,
      hoverRating: 0
    };
  },
  computed: {
    displayValue() {
      return this.readonly ? this.modelValue : (this.hoverRating || this.internalValue);
    }
  },
  watch: {
    modelValue(newVal) {
      this.internalValue = newVal;
    }
  },
  methods: {
    updateHover(e, index) {
      if (this.readonly) return;
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      this.hoverRating = x < rect.width / 2
        ? index - 0.5
        : index;
    },
    setRating(e, index) {
      if (this.readonly) return;
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      this.internalValue = x < rect.width / 2
        ? index - 0.5
        : index;
      this.$emit("update:modelValue", this.internalValue);
    },
    starClass(n) {
      if (this.displayValue >= n) return 'full';
      if (this.displayValue + 0.5 >= n) return 'half';
      return 'empty';
    }
  }
};

</script>

<style scoped>
.star-rating {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 1em 0;
  user-select: none;
}

.star {
  font-size: 28px;
  color: #B5B5CC; /* gris par défaut */
  position: relative;
  transition: color .15s;
}

.star.full {
  color: #FFD700; /* jaune */
}

.star.half {
  background: linear-gradient(90deg, #FFD700 50%, #B5B5CC 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.star.empty {
  color: #B5B5CC; /* gris */
}

</style>