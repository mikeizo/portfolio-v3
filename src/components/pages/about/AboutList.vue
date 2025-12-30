<script setup lang="ts">
  import type { AboutType } from '@/types/portfolio'

  import { ref, type Ref } from 'vue'
  import { useObserver } from '@/composables/useObserver'

  import Icon from '@/components/Icon.vue'

  defineProps<{
    data: AboutType
  }>()

  const listContainer: Ref<HTMLElement | null> = ref(null)

  const toggleDescription = (e: Event) => {
    const descriptionElement = e.currentTarget as HTMLElement
    descriptionElement.classList.toggle('about__list-description--open')
  }

  const observerConfig = {
    root: listContainer.value
  }

  useObserver(
    listContainer,
    '.about__list-item',
    'slide-in-right',
    observerConfig
  )

  defineOptions({
    name: 'AboutList'
  })
</script>

<template>
  <div ref="listContainer" class="about__list">
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
            <div v-if="item.yearTo" class="about__list-year-to">
              {{ item.yearTo }}
            </div>
          </template>
        </div>
        <div
          ref="descriptionAcc"
          class="about__list-description"
          @click="toggleDescription($event)"
        >
          <p>{{ item.description }}</p>
          <div v-if="item.image" class="about__list-button">
            <Icon name="close" :height="16" :width="16" />
          </div>
          <div v-if="item.image" class="about__list-accordion">
            <img
              :src="`images/old-sites/${item.image}`"
              height="300"
              width="500"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
