<script setup lang="ts">
  import type { WorkType } from '@/types/portfolio'

  defineProps<{
    data: WorkType | null
  }>()

  const emit = defineEmits<{
    close: []
  }>()

  // const closeModal = () => {
  //   emit('close')
  // }

  defineOptions({ name: 'WorkItem' })
</script>

<template>
  <div v-if="data" class="work__modal">
    <div class="work__modal-content">
      <h2>{{ data?.name }}</h2>
      <p>{{ data?.description }}</p>
      <ul>
        <li v-for="resource in data?.resources" :key="resource">
          {{ resource }}
        </li>
      </ul>
      <a :href="data?.url" target="_blank">{{ data?.url }}</a>
      <a :href="data?.git" target="_blank">{{ data?.git }}</a>
    </div>
  </div>
</template>
