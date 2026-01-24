<script setup lang="ts">
  import { onMounted, ref, shallowRef } from 'vue'

  defineProps<{
    src: string
    height?: number
    width?: number
    alt?: string
    className?: string[]
    loading?: 'eager' | 'lazy'
    attributes?: Record<string, string | number>
  }>()

  const isLoading = ref(false)
  const img = shallowRef<HTMLImageElement>()

  const onLoad = () => {
    isLoading.value = true
  }

  onMounted(() => {
    if (img.value?.complete) {
      isLoading.value = true
    }
  })
</script>

<template>
  <img
    ref="img"
    :src="src"
    :alt="alt || 'Image'"
    :height="height"
    :width="width"
    :class="className || 'image'"
    :loading="loading"
    v-bind="attributes"
    @load="onLoad()"
    @error="onLoad()"
  />
  <div v-if="!isLoading" class="image__placeholder">
    <span>.</span>
    <span style="animation-delay: 0.3s">.</span>
    <span style="animation-delay: 0.5s">.</span>
  </div>
</template>

<style lang="scss">
  .image {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
    object-position: center;
    position: relative;
    z-index: 1;

    &__placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--background-color-200);
      font-size: 1rem;
      z-index: 0;

      span {
        font-size: 6rem;
        display: inline-block;
        animation: bounceLoad 2s infinite ease-in-out;
      }
    }
  }
</style>
