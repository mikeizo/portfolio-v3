<script setup lang="ts">
  import type { ExperienceType } from '@/types/portfolio'

  import 'devicon'

  defineProps<{
    data: ExperienceType
  }>()
</script>

<template>
  <div class="experience">
    <h2 class="experience__title">Experience Working With</h2>
    <div class="experience__items-container">
      <div class="experience__items">
        <div
          v-for="experience in data"
          :index="experience.icon"
          class="experience__item"
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

      <div class="experience__items" aria-hidden="true">
        <div
          v-for="experience in data"
          :index="experience.icon"
          class="experience__item"
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
  </div>
</template>
