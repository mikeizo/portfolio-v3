<script setup lang="ts">
  import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

  import { ref } from 'vue'

  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const fields: AuthFormField[] = [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'Enter your email',
      required: true
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      required: true
    }
  ]

  async function onSubmit(
    payload: FormSubmitEvent<{ email: string; password: string }>
  ) {
    loading.value = true
    errorMessage.value = null
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.data.email,
          password: payload.data.password
        })
      })

      if (!response.ok) {
        const { error } = await response
          .json()
          .catch(() => ({ error: 'Login failed' }))
        errorMessage.value = error || 'Login failed'

        return
      }

      const params = new URLSearchParams(window.location.search)
      const next = params.get('next') || '/admin'
      window.location.assign(next)
    } catch {
      errorMessage.value = 'Network error'
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        title="Login"
        description="Enter your credentials to access your account."
        icon="i-lucide-user"
        :fields="fields"
        :loading="loading"
        @submit="onSubmit"
      >
        <template #validation>
          <UAlert
            v-if="errorMessage"
            color="error"
            icon="i-lucide-info"
            title="Error signing in"
            :description="errorMessage"
          />
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
