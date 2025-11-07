<script setup lang="ts">
  import { ref, provide } from 'vue'
  import type { WorkType } from '@/types/portfolio'
  import WorkItem from '@/components/work/WorkItem.vue'
  import Icon from '@/components/Icon.vue'
  import workData from '@/assets/api/work.json'

  defineProps<{
    path: string
  }>()

  const workItem = ref<WorkType | null>(null)

  const closeModal = () => {
    workItem.value = null
  }

  provide('closeModal', closeModal)

  defineOptions({ name: 'WorkList' })
</script>

<template>
  <div class="work__list">
    <div
      v-for="(work, index) in workData"
      :key="`${work.slug}-${index}`"
      class="work__list-item"
      @click="workItem = work"
    >
      <div class="work__image-logo">
        <img
          :src="`${path}/logos/${work.logo}`"
          class="work__image-logo-img"
          :alt="`Logo for ${work.name}`"
        />
      </div>
      <div class="work__name">
        <span>{{ work.name }}</span>
        <Icon class="icon" name="arrow-up-right" :height="16" :width="16" />
      </div>
    </div>
  </div>
  <WorkItem :data="workItem" :path="path" />
</template>
