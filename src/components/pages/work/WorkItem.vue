<script setup lang="ts">
  import type { WorkType } from '@/types/portfolio'
  import Modal from '@/components/Modal.vue'
  import Slideshow from '@/components/Slideshow.vue'

  defineProps<{
    data: WorkType | null
    path: string
  }>()

  defineOptions({ name: 'WorkItem' })
</script>

<template>
  <Modal :is-open="Boolean(data)">
    <div v-if="data" class="work-item">
      <div class="work-item__content">
        <h2 class="work-item__name">{{ data?.name }}</h2>
        <p class="work-item__description">{{ data?.description }}</p>
        <div class="work-item__group">
          <div class="work-item__images">
            <Slideshow :images="data.images" />
          </div>
          <div class="work-item__assets">
            <div v-if="data?.resources" class="work-item__resources">
              <h3>Tech Stack</h3>
              <ul>
                <li
                  v-for="resource in data.resources"
                  :key="resource"
                  class="work-item__resource"
                >
                  <!-- <i :class="`devicon-${formatIcon(resource)}-plain colored`" /> -->
                  {{ resource }}
                </li>
              </ul>
            </div>
            <div v-if="data?.url || data?.git" class="work-item__links">
              <h3>Links</h3>
              <p v-if="data?.url">
                <strong>Site:&nbsp;</strong><br />
                <a :href="data?.url" target="_blank">{{ data?.url }}</a>
              </p>
              <p v-if="data?.git">
                <strong>Git:&nbsp;</strong><br />
                <a :href="data?.git" target="_blank">{{ data?.git }}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>
