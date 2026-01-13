<script setup lang="ts">
  import type { ExperienceType } from '@/types/portfolio'

  import 'devicon'

  defineProps<{
    data: ExperienceType
  }>()
</script>

<template>
  <div class="experience" :style="`--num-items: ${data.length};`">
    <h2 class="text-center">Experience Working With</h2>
    <div class="experience__items">
      <div
        v-for="(experience, index) in data"
        :index="experience.icon"
        class="experience__item"
        :style="`--item-index: ${index};`"
      >
        <template v-if="experience.icon">
          <i
            :class="['experience__item-icon', experience.icon.toLowerCase()]"
          />
          <div class="experience__item-name">
            <small>{{ experience.name }}</small>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
