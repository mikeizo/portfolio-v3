<script setup lang="ts">
  import { ref } from 'vue'
  import { validateForm } from '@/utils/validation'

  import Icon from '@/components/Icon.vue'
  import Modal from '@/components/Modal.vue'

  defineProps<{
    isOpen: boolean
  }>()

  const emptyForm = { name: '', email: '', phone: '', message: '' }
  const emptyFields = Object.fromEntries(
    Object.entries(emptyForm).map(([key]) => {
      return [key, { isValid: true, message: '' }]
    })
  )

  const isSubmitting = ref(false)
  const responseMessage = ref('')
  const formData = ref({ ...emptyForm })
  const fieldValidation = ref({ ...emptyFields })

  /**
   * Handles contact form submission:
   * - Sets submitting state
   * - Validates each input with validateForm
   * - Prevents submission if invalid
   * - Sends POST request to /api/mail with form data if valid
   * - Shows response message from API (success/failure)
   * - Resets form and validation state after submission
   */
  const submitForm = async () => {
    isSubmitting.value = true
    const { inputs, isValidForm } = validateForm(formData.value)

    fieldValidation.value = { ...inputs }

    // Do not proceed if invalid form
    if (!isValidForm) {
      isSubmitting.value = false
      return
    }

    const response = await fetch('/api/mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    }).then((response) => response)

    const data = await response.json()

    // Pause for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Reset form
    formData.value = { ...emptyForm }
    fieldValidation.value = { ...emptyFields }
    isSubmitting.value = false
    responseMessage.value = data.message
  }

  defineOptions({ name: 'Contact' })
</script>

<template>
  <Modal :is-open="isOpen" :classNames="['contact']">
    <div class="contact__content">
      <h2 class="contact__name text-center">Contact Me</h2>
      <form class="contact__form" @submit.prevent="submitForm">
        <div class="contact__form-group">
          <label for="contact-name" class="contact__label">*Name:</label>
          <input
            id="contact-name"
            v-model="formData.name"
            name="name"
            type="text"
            class="contact__input"
            :class="{ 'contact__input--error': !fieldValidation.name.isValid }"
            placeholder="Richard Hendricks"
            autocomplete="name"
          />
          <div
            v-if="fieldValidation.name.message"
            class="contact__error-message"
          >
            {{ fieldValidation.name.message }}
          </div>
        </div>
        <div class="contact__form-group">
          <label for="contact-email" class="contact__label">*Email:</label>
          <input
            id="contact-email"
            v-model="formData.email"
            name="email"
            type="email"
            class="contact__input"
            :class="{ 'contact__input--error': !fieldValidation.email.isValid }"
            placeholder="richard@piedpiper.com"
            autocomplete="email"
          />
          <div
            v-if="fieldValidation.email.message"
            class="contact__error-message"
          >
            {{ fieldValidation.email.message }}
          </div>
        </div>
        <div class="contact__form-group">
          <label for="contact-phone" class="contact__label">Phone:</label>
          <input
            id="contact-phone"
            v-model="formData.phone"
            name="phone"
            type="tel"
            class="contact__input"
            :class="{ 'contact__input--error': !fieldValidation.phone.isValid }"
            placeholder="555-555-5555"
            autocomplete="tel"
          />
          <div
            v-if="fieldValidation.phone.message"
            class="contact__error-message"
          >
            {{ fieldValidation.phone.message }}
          </div>
        </div>
        <div class="contact__form-group">
          <label for="contact-message" class="contact__label">Message:</label>
          <textarea
            id="contact-message"
            v-model="formData.message"
            name="message"
            rows="4"
            class="contact__input"
            :class="{
              'contact__input--error': !fieldValidation.message.isValid
            }"
            placeholder="How can I help you?"
          ></textarea>
          <div
            v-if="fieldValidation.message.message"
            class="contact__error-message"
          >
            {{ fieldValidation.message.message }}
          </div>
        </div>
        <div class="contact__form-group">
          <button
            type="submit"
            class="contact__submit btn btn--inverted"
            :disabled="isSubmitting"
          >
            Send Message
            <Icon
              v-if="isSubmitting"
              class="contact__submit-icon spin"
              name="arrow-path"
            />
            <Icon v-else class="contact__submit-icon" name="paper-airplane" />
          </button>
        </div>
      </form>
      <div v-if="responseMessage" class="contact__response">
        {{ responseMessage }}
      </div>
    </div>
  </Modal>
</template>
