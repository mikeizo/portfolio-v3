<script setup lang="ts">

  const props = defineProps<{
    data: string
  }>()

  console.log('test props', props)

  defineOptions({ name: 'AboutContent' })
</script>

<template>
  <div class="about__content">
    <div v-html="data" />
    <img
      class="about_image"
      src="/public/images/mike-tropea.jpg"
      alt="Mike Tropea"
      width="316"
      height="395"
    />
  </div>
</template>
