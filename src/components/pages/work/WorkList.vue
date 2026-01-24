<script setup lang="ts">
  import type { WorkType } from '@/types/portfolio'

  import { provide, ref, type Ref, shallowRef } from 'vue'
  import { useObserver } from '@/composables/useObserver'

  import Icon from '@/components/Icon.vue'
  import WorkItem from '@/components/pages/work/WorkItem.vue'

  const props = defineProps<{
    path: string
    data: WorkType[]
  }>()

  const workItem: Ref<WorkType | null> = ref(null)
  const listContainer: Ref<HTMLElement | null> = shallowRef(null)

  const logoPath = `${props.path}/logos`

  const closeModal = () => {
    workItem.value = null
  }

  const workListObserverCallback = (
    entries: IntersectionObserverEntry[],
    observer?: IntersectionObserver | null
  ) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('slide-in-bottom')
        observer?.unobserve(entry.target)
      }
    })
  }

  const workListObserverOptions = {
    threshold: 0.75
  }

  useObserver(
    workListObserverCallback,
    listContainer,
    '.work__list-item',
    workListObserverOptions
  )

  provide('closeModal', closeModal)

  defineOptions({
    name: 'WorkList'
  })
</script>

<template>
  <div ref="listContainer" class="work__list">
    <div
      v-for="(work, index) in data"
      :key="`${work.slug}-${index}`"
      class="work__list-item"
      @click="workItem = work"
    >
      <div class="work__image-logo">
        <img
          :src="`${logoPath}/webp/${work.logo}`"
          class="work__image-logo-img"
          :class="{ 'work__image--grayscale': work.grayscale }"
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
