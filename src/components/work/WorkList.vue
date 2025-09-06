<script setup lang="ts">
  import { ref } from 'vue'
  import type { WorkType } from '@/types/portfolio'
  import WorkItem from '@/components/work/WorkItem.vue'
  import workData from '@/assets/api/work.json'

  defineProps<{
    data: WorkType[]
    path: string
  }>()

  const workItem = ref<WorkType | null>(null)
  const isOpen = ref(false)

  const openWorkItem = (work: WorkType) => {
    workItem.value = work
    isOpen.value = true
  }

  const closeWorkItem = () => {
    workItem.value = null
    isOpen.value = false
  }

  defineOptions({ name: 'WorkList' })
</script>

<template>
  <div class="work__list">
    <div
      v-for="(work, index) in workData"
      :key="`${work.slug}-${index}`"
      class="work__list-item"
    >
      <div class="work__link" @click="openWorkItem(work)">
        <div class="work__list-content">
          <div class="work__image-logo">
            <img :src="`${path}/logos/${work.logo}`" />
          </div>
          <div class="work__name">{{ work.name }}</div>
        </div>
      </div>
    </div>
  </div>
  <WorkItem v-if="workItem" :data="workItem" @close="closeWorkItem" />
</template>
