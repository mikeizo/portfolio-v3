<script setup lang="ts">
  defineProps<{
    title: string
  }>()
</script>

<template>
  <div class="flex justify-between pb-4 border-b border-accented">
    <h1 class="text-3xl tracking-tight sm:text-4xl text-pretty">{{ title }}</h1>
    <slot />
  </div>
</template>
