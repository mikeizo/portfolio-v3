<script setup lang="ts">
  import type { AboutType } from '@/types/portfolio'

  import { ref, type Ref } from 'vue'
  import { useObserver } from '@/composables/useObserver'

  defineProps<{
    data: AboutType
  }>()

  const listContainer: Ref<HTMLElement | null> = ref(null)

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
    <div class="about__list-inner">
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
        <div class="about_list-description">
          {{ item.description }}
        </div>
      </div>
    </div>
  </div>
</template>
