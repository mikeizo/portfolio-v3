<script setup lang="ts">
  import { ChevronRight } from 'lucide-vue-next'
  import { computed } from 'vue'

  const props = defineProps<{
    segments: string[]
    labelFor: (segment: string) => string
  }>()

  const crumbs = computed(() => {
    let path = ''

    return props.segments.map((segment, index) => {
      path += `/${segment}`

      return {
        label: props.labelFor(segment),
        to: path,
        isLast: index === props.segments.length - 1
      }
    })
  })
</script>

<template>
  <div
    class="h-[30px] flex items-center gap-[7px] text-[13px] text-muted px-[22px]"
  >
    <template v-for="(crumb, i) in crumbs" :key="crumb.to">
      <a
        v-if="!crumb.isLast"
        :href="crumb.to"
        class="transition-colors hover:text-ink"
      >
        {{ crumb.label }}
      </a>
      <span v-else class="text-accent">{{ crumb.label }}</span>
      <ChevronRight
        v-if="!crumb.isLast"
        :size="14"
        class="inline-flex text-faint"
      />
    </template>
  </div>
</template>
