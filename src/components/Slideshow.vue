<script setup lang="ts">
  import { computed, ref, type Ref, shallowRef } from 'vue'
  import { useObserver } from '@/composables/useObserver'

  import Icon from '@/components/Icon.vue'
  import Image from '@/components/Image.vue'

  const props = defineProps<{
    images: string[]
  }>()

  const path = import.meta.env.PUBLIC_ASSETS_PATH

  const slideshowTarget: Ref<HTMLElement | null> = shallowRef(null)
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

  let observerInitialized = false

  const slideshowObserverCallback = (entries: IntersectionObserverEntry[]) => {
    // Skip the initial callback on observer setup
    if (!observerInitialized) {
      observerInitialized = true

      return
    }

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        currentIndex.value = Number(
          entry.target.getAttribute('data-index') ?? 0
        )
      }
    })
  }

  useObserver(slideshowObserverCallback, slideshowTarget, '.slideshow__image')
</script>

<template>
  <div class="slideshow">
    <div class="slideshow__container">
      <div class="slideshow__image-container">
        <div ref="slideshowTarget" class="slideshow__images">
          <Image
            v-for="(image, index) in imageUrls"
            :key="`slide-image-${index}`"
            :src="image"
            :className="[
              'slideshow__image',
              `${index === currentIndex ? 'slideshow__image--active' : ''}`
            ]"
            :height="300"
            :width="300"
            :alt="`Slide ${index + 1}`"
            :loading="`${index === 0 ? 'eager' : 'lazy'}`"
            :attributes="{ 'data-index': index }"
          />
        </div>
      </div>
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
    <div
      v-if="multipleImage"
      class="slideshow__dots"
      role="tablist"
      aria-label="Slide navigation"
    >
      <button
        v-for="(image, index) in images"
        :key="`dot-${index}`"
        class="slideshow__dot"
        :class="{ 'slideshow__dot--active': index === currentIndex }"
        role="tab"
        :aria-label="`Go to slide ${index + 1}`"
        :aria-selected="index === currentIndex"
        @click="goToSlide(index)"
      />
    </div>
  </div>
</template>
