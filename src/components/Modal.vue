<script setup lang="ts">
  import { inject } from 'vue'

  import Icon from '@/components/Icon.vue'

  const props = defineProps<{
    isOpen: boolean
    classNames?: string[]
  }>()

  const closeModal = inject<() => void>('closeModal')

  const classes = props.classNames?.join(' ') ?? ''

  const close = () => {
    closeModal?.()
  }

  defineOptions({ name: 'Modal' })
</script>

<template>
  <Teleport to="modal">
    <Transition name="modal">
      <div v-if="isOpen" :class="['modal', classes]">
        <div class="modal__content" @click.stop>
          <button
            class="modal__close-btn btn"
            aria-label="Close"
            @click="close"
          >
            <Icon class="modal__close-icon" name="close" />
          </button>
          <slot />
        </div>
        <div class="modal__overlay" @click="close"></div>
      </div>
    </Transition>
  </Teleport>
</template>
