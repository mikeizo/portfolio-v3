<script setup lang="ts">
  import { computed, ref, shallowRef } from 'vue'

  import Icon from '@/components/Icon.vue'

  const props = defineProps<{
    images: string[]
  }>()

  const path = import.meta.env.PUBLIC_ASSETS_PATH

  const slideshowTarget = shallowRef<HTMLElement | null>(null)
  const currentIndex = ref(0)

  const totalImages = computed(() => props.images.length)
  const multipleImage = computed(() => totalImages.value > 1)

  const imageUrls = computed(() =>
    props.images.map((image) => `${path}/${image}`)
  )

  const goToSlide = (index: number) => {
    currentIndex.value = index

    const slideEl = slideshowTarget.value?.children[index] as
      | HTMLElement
      | undefined
    if (!slideEl) return

    slideEl.scrollIntoView({
      behavior: 'smooth',
      inline: 'center'
    })
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
    <div class="slideshow__container">
      <div class="slideshow__image-container">
        <div ref="slideshowTarget" class="slideshow__images">
          <img
            v-for="(image, index) in imageUrls"
            :key="`slide-${index}`"
            class="slideshow__image"
            :class="{ 'slideshow__image--active': index === currentIndex }"
            :src="image"
            :alt="`Slide ${index + 1}`"
            :loading="index === 0 ? 'eager' : 'lazy'"
          />
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
