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
        <span>{{ item.yearFrom }}</span>
        <span>{{ item.yearTo }}</span>
      </div>
      <div class="about_list-description">
        {{ item.description }}
      </div>
    </div>
  </div>
</template>
