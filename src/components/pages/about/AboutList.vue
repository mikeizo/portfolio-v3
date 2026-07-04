<script setup lang="ts">
  import type { AboutType } from '@/types/portfolio'

  import { type Ref, shallowRef } from 'vue'
  import { useObserver } from '@/composables/useObserver'

  import Icon from '@/components/Icon.vue'
  import Image from '@/components/Image.vue'

  defineProps<{
    data: AboutType[]
  }>()

  const listContainer: Ref<HTMLElement | null> = shallowRef(null)

  const path = import.meta.env.PUBLIC_ASSETS_PATH

  const toggleDescription = (e: Event) => {
    const openDesciptionClass = 'about__list-description--open'
    const descriptionElement = e.currentTarget as HTMLElement
    const accordionElement = descriptionElement.querySelector(
      '.about__list-accordion'
    ) as HTMLElement
    const height = accordionElement.scrollHeight

    descriptionElement.classList.toggle(openDesciptionClass)

    if (descriptionElement.classList.contains(openDesciptionClass)) {
      accordionElement.style.height = `${height}px`

      const wrapper = descriptionElement.closest('.about__list-wrapper') as HTMLElement | null
      const item = descriptionElement.closest('.about__list-item') as HTMLElement | null

      if (wrapper && item) {
        const onTransitionEnd = (event: TransitionEvent) => {
          if (event.propertyName !== 'height') return
          accordionElement.removeEventListener('transitionend', onTransitionEnd)

          const itemBottom = item.offsetTop + item.offsetHeight
          const visibleBottom = wrapper.scrollTop + wrapper.clientHeight
          const overflow = itemBottom - visibleBottom

          if (overflow > 0) {
            wrapper.scrollTo({
              top: wrapper.scrollTop + overflow + 16,
              behavior: 'smooth'
            })
          }
        }

        accordionElement.addEventListener('transitionend', onTransitionEnd)
      }
    } else {
      accordionElement.style.height = '0px'
    }
  }

  const aboutListObserverCallback = (
    entries: IntersectionObserverEntry[],
    observer?: IntersectionObserver | null
  ) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('slide-in-right')
        observer?.unobserve(entry.target)
      }
    })
  }

  const aboutListObserverOptions = {
    threshold: 0.8
  }

  useObserver(
    aboutListObserverCallback,
    listContainer,
    '.about__list-item',
    aboutListObserverOptions
  )

  defineOptions({
    name: 'AboutList'
  })
</script>

<template>
  <div
    ref="listContainer"
    class="about__list"
  >
    <div class="about__list-wrapper">
      <div
        v-for="(item, index) in data"
        :key="`${item.yearFrom}-${index}`"
        class="about__list-item"
      >
        <div class="about__list-year">
          <div class="about__list-year-from">{{ item.yearFrom }}</div>
          <template v-if="item.yearTo">
            <div class="about__list-year-dash">&ndash;</div>
            <div
              v-if="item.yearTo"
              class="about__list-year-to"
            >
              {{ item.yearTo }}
            </div>
          </template>
        </div>
        <div
          ref="descriptionAcc"
          class="about__list-description"
          @click="item.image && toggleDescription($event)"
        >
          <div v-html="item.description" />
          <div
            v-if="item.image"
            class="about__list-button"
          >
            <Icon
              name="close"
              :height="16"
              :width="16"
            />
          </div>
          <div
            v-if="item.image"
            class="about__list-accordion"
          >
            <Image
              :src="`${path}/about/${item.image}`"
              :height="300"
              :width="500"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
