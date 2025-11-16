<script setup lang="ts">
  // import { ref, provide } from 'vue'
  // import Icon from '@/components/Icon.vue'
  import Modal from '@/components/Modal.vue'

  defineProps<{
    isOpen: boolean
  }>()

  defineOptions({ name: 'Contact' })
</script>

<template>
  <Modal :is-open="isOpen">
    <div class="contact">
      <div class="contact__content">
        <h2 class="contact__name text-center">Contact Me</h2>
      </div>
    </div>
  </Modal>
</template>
