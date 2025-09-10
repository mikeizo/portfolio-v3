<script setup lang="ts">
  import type { WorkType } from '@/types/portfolio'
  import Modal from '@/components/Modal.vue'

  defineProps<{
    data: WorkType | null
  }>()

  defineOptions({ name: 'WorkItem' })
</script>

<template>
  <Modal :is-open="Boolean(data)">
    <div v-if="data" class="work__item">
      <div class="work__item-content">
        <h2>{{ data?.name }}</h2>
        <p class="work__item-description">{{ data?.description }}</p>
        <ul class="work__item-resources">
          <li
            v-for="resource in data?.resources"
            :key="resource"
            class="work__item-resource"
          >
            {{ resource }}
          </li>
        </ul>
        <a :href="data?.url" target="_blank">{{ data?.url }}</a>
        <a :href="data?.git" target="_blank">{{ data?.git }}</a>
      </div>
    </div>
  </Modal>
</template>
