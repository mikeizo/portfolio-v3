<script setup lang="ts">
  import { ref } from 'vue'
  import Icon from '@/components/Icon.vue'
  import Modal from '@/components/Modal.vue'

  defineProps<{
    isOpen: boolean
  }>()

  const submitting = ref(false)

  const submitForm = () => {
    submitting.value = true
    // TODO: submit form
  }

  defineOptions({ name: 'Contact' })
</script>

<template>
  <Modal :is-open="isOpen" :classNames="['contact']">
    <div class="contact__content">
      <h2 class="contact__name text-center">Contact Me</h2>
      <form class="contact__form" @submit.prevent>
        <div class="contact__form-group">
          <label for="contact-name" class="contact__label">Name:</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            class="contact__input"
            placeholder="Richard Hendricks"
            autocomplete="name"
            required
          />
        </div>
        <div class="contact__form-group">
          <label for="contact-email" class="contact__label">Email:</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            class="contact__input"
            placeholder="richard@piedpiper.com"
            autocomplete="email"
            required
          />
        </div>
        <div class="contact__form-group">
          <label for="contact-phone" class="contact__label">Phone:</label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            class="contact__input"
            placeholder="(555) 555-5555"
            autocomplete="tel"
            pattern="^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$"
          />
        </div>
        <div class="contact__form-group">
          <label for="contact-comments" class="contact__label">Comments:</label>
          <textarea
            id="contact-comments"
            name="comments"
            rows="4"
            class="contact__input"
            placeholder="How can I help you?"
            required
          ></textarea>
        </div>
        <div class="contact__form-group">
          <button
            type="submit"
            class="contact__submit button"
            :disable="submitting"
            @click.prevent="submitForm"
          >
            Send Message
            <Icon
              v-if="submitting"
              class="contact__submit-icon spin"
              name="arrow-path"
            />
            <Icon v-else class="contact__submit-icon" name="paper-airplane" />
          </button>
        </div>
      </form>
    </div>
  </Modal>
</template>
