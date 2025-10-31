<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import Icon from '@/components/Icon.vue'

  const props = defineProps<{
    images: string[]
  }>()

  const path = import.meta.env.PUBLIC_ASSETS_PATH

  const currentIndex = ref(0)

  const imageUrls = computed(() =>
    props.images.map((image) => `${path}/${image}`)
  )

  const totalImages = computed(() => props.images.length)
  const multipleImage = computed(() => totalImages.value > 1)
  const sliderStyle = computed(() => {
    const gap = 20

    return {
      gap: `${gap}%`,
      transform: `translateX(-${currentIndex.value * (100 + gap)}%)`
    }
  })

  const goToSlide = (index: number) => {
    currentIndex.value = index
  }

  const nextSlide = () => {
    const nextIndex =
      currentIndex.value === totalImages.value - 1 ? 0 : currentIndex.value + 1
    goToSlide(nextIndex)
  }

  const prevSlide = () => {
    const prevIndex =
      currentIndex.value === 0 ? totalImages.value - 1 : currentIndex.value - 1
    goToSlide(prevIndex)
  }
</script>

<template>
  <div class="slideshow">
    <div class="slideshow__image-container">
      <div class="slideshow__images" :style="sliderStyle">
        <div
          v-for="(image, index) in imageUrls"
          :key="`slide-${index}`"
          class="slideshow__image"
          :class="{ 'slideshow__image--active': index === currentIndex }"
        >
          <img :src="image" :alt="`Slide ${index + 1}`" />
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <button
      v-if="multipleImage"
      class="slideshow__button slideshow__button--prev"
      aria-label="Previous image"
      @click="prevSlide"
    >
      <Icon name="chevron-left" />
    </button>
    <button
      v-if="multipleImage"
      class="slideshow__button slideshow__button--next"
      aria-label="Next image"
      @click="nextSlide"
    >
      <Icon name="chevron-right" />
    </button>

    <!-- Dots indicator -->
    <div v-if="multipleImage" class="slideshow__dots">
      <button
        v-for="(image, index) in images"
        :key="`dot-${index}`"
        class="slideshow__dot"
        :class="{ 'slideshow__dot--active': index === currentIndex }"
        :aria-label="`Go to slide ${index + 1}`"
        role="tab"
        :aria-selected="index === currentIndex"
        @click="goToSlide(index)"
      />
    </div>

    <!-- Image counter -->
    <!-- <div v-if="multipleImage" class="slideshow__counter">
      {{ currentIndex + 1 }} / {{ totalImages }}
    </div> -->
  </div>
</template>

<style lang="scss">
  .slideshow {
    position: relative;
    max-width: 700px;
    margin-inline: auto;

    // Images
    &__image-container {
      position: relative;
      padding: 0.5rem;
      box-shadow: 0 0px 16px rgba(0, 0, 0, 0.1);
      border-radius: var(--border-radius);
      background-color: var(--accent-color);
      overflow: hidden;
    }

    &__images {
      display: flex;
      align-items: center;
      height: 100%;
      transition: transform 0.5s ease-in-out;
    }

    &__image {
      height: 100%;
      width: 100%;
      object-fit: contain;
      display: block;
      flex-shrink: 0;
    }

    // Buttons
    &__button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: var(--background-color-hsl);
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;

      svg {
        width: 10px;
        height: 10px;
        fill: var(--primary-color);
      }

      &:hover {
        background: var(--background-color);
        transform: translateY(-50%) scale(1.1);
      }

      &--prev {
        left: -24px;
      }

      &--next {
        right: -24px;
      }
    }

    // Dots
    &__dots {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
    }

    &__dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--accent-color);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.6);
        transform: scale(1.2);
      }

      &--active {
        background: var(--background-color);
        transform: scale(1.2);
      }
    }

    // &__counter {
    //   position: absolute;
    //   bottom: 1rem;
    //   right: 0;
    //   font-size: 0.75rem;
    // }
  }
</style>
