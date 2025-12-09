<script setup lang="ts">
  import type { WorkType } from '@/types/portfolio'

  import { provide, ref, type Ref } from 'vue'
  import Icon from '@/components/Icon.vue'
  import useObserver from '@/composables/useObserver'
  import workData from '@/assets/api/work.json'
  import WorkItem from '@/components/pages/work/WorkItem.vue'

  const props = defineProps<{
    path: string
  }>()

  const workItem: Ref<WorkType | null> = ref(null)
  const listContainer: Ref<HTMLElement | null> = ref(null)

  const logoPath = `${props.path}/logos`

  const closeModal = () => {
    workItem.value = null
  }

  const observerConfig = {
    root: listContainer.value
  }

  useObserver(
    listContainer,
    '.work__list-item',
    'slide-in-bottom',
    observerConfig
  )

  provide('closeModal', closeModal)

  defineOptions({ name: 'WorkList' })
</script>

<template>
  <div ref="listContainer" class="work__list">
    <div
      v-for="(work, index) in workData"
      :key="`${work.slug}-${index}`"
      class="work__list-item"
      @click="workItem = work"
    >
      <div class="work__image-logo">
        <img
          :src="`${logoPath}/${work.logo}`"
          class="work__image-logo-img work__image--light"
          :alt="`Logo for ${work.name}`"
          loading="lazy"
        />
        <img
          :src="`${logoPath}/dark/${work.logo}`"
          class="work__image-logo-img work__image--dark"
          :alt="`Logo for ${work.name}`"
          loading="lazy"
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
