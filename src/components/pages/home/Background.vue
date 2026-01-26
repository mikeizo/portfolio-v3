<script setup lang="ts">
  import { $isLightTheme } from '@/stores/theme'
  import { useStore } from '@nanostores/vue'

  import Clouds from '@/components/pages/home/Clouds.vue'
  import Stars from '@/components/pages/home/Stars.vue'

  const isLightTheme = useStore($isLightTheme)

  defineOptions({
    name: 'Background'
  })
</script>

<template>
  <Clouds v-if="isLightTheme" />
  <Stars v-else />
</template>
