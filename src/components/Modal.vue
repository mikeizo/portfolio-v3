<script setup lang="ts">
  import { inject } from 'vue'
  import Icon from '@/components/Icon.vue'

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
        <div class="modal__close">
          <Icon name="close" :height="25" :width="25" @click="close" />
        </div>
        <slot />
      </div>
      <div class="modal__overlay" @click="close"></div>
    </div>
  </Teleport>
</template>
