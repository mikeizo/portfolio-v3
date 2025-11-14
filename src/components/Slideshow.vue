<script setup lang="ts">
  import { ref, computed, shallowRef } from 'vue'
  import Icon from '@/components/Icon.vue'
  import type { UseSwipeDirection } from '@vueuse/core'
  import { useSwipe } from '@vueuse/core'

  const props = defineProps<{
    images: string[]
  }>()

  const path = import.meta.env.PUBLIC_ASSETS_PATH

  const swipeTarget = shallowRef<HTMLElement | null>(null)

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

  useSwipe(swipeTarget, {
    passive: false,
    onSwipeEnd(e: TouchEvent, direction: UseSwipeDirection) {
      if (direction === 'left') {
        nextSlide()
      }

      if (direction === 'right') {
        prevSlide()
      }
    }
  })
</script>

<template>
  <div class="slideshow">
    <div class="slideshow__container">
      <div class="slideshow__image-container">
        <div ref="swipeTarget" class="slideshow__images" :style="sliderStyle">
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
    </div>

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
  </div>
</template>
