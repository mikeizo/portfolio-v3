<script setup lang="ts">
  import { inject } from 'vue'

  defineProps<{
    isOpen: boolean
    width?: number
  }>()

  const closeModal = inject<() => void>('closeModal')

  const close = () => {
    closeModal?.()
  }

  defineOptions({ name: 'Modal' })
</script>

<template>
  <Teleport v-if="isOpen" to="modal">
    <div class="modal">
      <div class="modal__content" @click.stop>
        <button @click="close">Close</button>
        <slot />
      </div>
      <div class="modal__overlay" @click="close"></div>
    </div>
  </Teleport>
</template>
