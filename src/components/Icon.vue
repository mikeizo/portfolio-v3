<script setup lang="ts">
  defineProps<{
    name: string
    height?: number
    width?: number
    alt?: string
  }>()

  defineOptions({
    name: 'Icon'
  })
</script>

<template>
  <svg
    :height="height"
    :width="width"
    :class="`icon icon--${name}`"
    :aria-label="alt || name"
  >
    <use :href="`#${name}`" />
  </svg>
</template>
