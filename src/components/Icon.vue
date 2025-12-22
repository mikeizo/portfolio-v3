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
    :aria-label="name"
  >
    <use :xlink:href="`#${name}`" />
  </svg>
</template>
