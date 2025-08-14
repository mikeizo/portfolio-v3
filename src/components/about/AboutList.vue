<script setup lang="ts">
  import type { AboutType } from '@/types/portfolio'

  const props = defineProps<{
    data: AboutType
  }>()

  defineOptions({ name: 'AboutContent' })
</script>

<template>
  <div class="about__list">
    <div v-for="(item, index) in data" class="about__list-item">
      <div class="about__list-year">
        <div class="about__list-year-from">{{ item.yearFrom }}</div>
        <div v-if="item.yearTo" class="about__list-year-dash">&ndash;</div>
        <div v-if="item.yearTo" class="about__list-year-to">
          {{ item.yearTo }}
        </div>
      </div>
      <div class="about_list-description">
        {{ item.description }}
      </div>
    </div>
  </div>
</template>
