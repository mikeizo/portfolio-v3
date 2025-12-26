<script setup lang="ts">
  import { computed, inject } from 'vue'

  import Icon from '@/components/Icon.vue'

  const props = defineProps<{
    isOpen: boolean
    classNames?: string[]
    maxWidth?: number
  }>()

  const closeModal = inject<() => void>('closeModal')

  const classes = props.classNames?.join(' ') ?? ''

  const close = () => {
    closeModal?.()
  }

  const containerStyle = computed(() => ({
    maxWidth: props.maxWidth ? `${props.maxWidth}px` : undefined
  }))

  defineOptions({
    name: 'Modal'
  })
</script>

<template>
  <Transition name="modal">
    <Teleport v-if="isOpen" to="modal">
      <div class="modal" :class="[classes]">
        <div class="modal__container" :style="containerStyle">
          <button
            class="modal__close-btn btn"
            aria-label="Close"
            @click="close"
          >
            <Icon class="modal__close-icon" name="close" />
          </button>
          <div class="modal__content">
            <slot />
          </div>
        </div>
        <div class="modal__overlay" @click="close"></div>
      </div>
    </Teleport>
  </Transition>
</template>
