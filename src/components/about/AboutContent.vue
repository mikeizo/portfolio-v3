<script setup lang="ts">
  const props = defineProps<{
    data: string
  }>()

  defineOptions({ name: 'AboutContent' })
</script>

<template>
  <div class="about__content">
    <div v-html="data" />
    <img
      class="about__image"
      src="/images/mike-tropea.jpg"
      alt="Mike Tropea"
      width="316"
      height="395"
    />
  </div>
</template>
