<script setup lang="ts">
  import { useTheme } from '@/composables/useTheme'

  import Clouds from '@/components/pages/home/Clouds.vue'
  import Stars from '@/components/pages/home/Stars.vue'

  const { isLightTheme } = useTheme()

  defineOptions({
    name: 'Background'
  })
</script>

<template>
  <Clouds v-if="isLightTheme" />
  <Stars v-else />
</template>
