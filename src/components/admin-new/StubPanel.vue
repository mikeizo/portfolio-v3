<script setup lang="ts">
  import { CirclePlus } from 'lucide-vue-next'

  defineProps<{
    title: string
    sub?: string
    actionLabel?: string
  }>()
</script>

<template>
  <div class="mb-6 flex items-center justify-between gap-4">
    <div>
      <h1 class="m-0 text-4xl font-light tracking-tight text-ink">
        {{ title }}
      </h1>
      <p v-if="sub" class="mt-2 text-base text-muted">{{ sub }}</p>
    </div>
    <button
      v-if="actionLabel"
      type="button"
      class="inline-flex shrink-0 items-center gap-2 rounded-pill bg-accent px-4 py-2 text-base font-normal text-white transition-colors hover:bg-accent-deep active:bg-accent-press"
    >
      {{ actionLabel }}
      <CirclePlus :size="16" />
    </button>
  </div>

  <div
    class="flex min-h-65 flex-col items-center justify-center gap-2 rounded-xl border border-hairline bg-surface p-10 text-center shadow-card"
  >
    <p class="text-base text-ink-secondary">{{ title }} screen</p>
    <p class="text-sm text-muted">
      Layout shell only — this screen is ported in a later phase.
    </p>
  </div>
</template>
