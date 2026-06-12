<script setup lang="ts">
  import * as v from 'valibot'
  import { reactive, ref } from 'vue'
  import { loginSchema } from '@/utils/formSchema'

  import Logo from '@/components/Logo.vue'
  import TextField from '@/components/admin-new/form/TextField.vue'

  const state = reactive({
    email: '',
    password: ''
  })

  const errors = reactive<Record<string, string>>({})
  const status = ref<'idle' | 'submitting'>('idle')
  const errorMessage = ref<string | null>(null)

  async function onSubmit() {
    if (status.value === 'submitting') return

    for (const key in errors) delete errors[key]
    const result = v.safeParse(loginSchema, state)
    if (!result.success) {
      const nested = v.flatten(result.issues).nested ?? {}
      for (const field in nested) errors[field] = nested[field]![0]
      return
    }

    status.value = 'submitting'
    errorMessage.value = null
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email,
          password: state.password
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
      const next = params.get('next') || '/admin-new/settings'
      window.location.assign(next)
    } catch {
      errorMessage.value = 'Network error'
    } finally {
      status.value = 'idle'
    }
  }
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <div
      class="w-full max-w-md rounded-lg border border-hairline bg-surface p-8 shadow-card"
    >
      <div
        class="mx-auto mb-6 w-48 [--color-accent:var(--accent)] [--color-logo:var(--text)]"
      >
        <Logo />
      </div>

      <h1 class="mb-6 text-center text-2xl font-light text-ink">Login</h1>

      <form class="space-y-4" novalidate @submit.prevent="onSubmit">
        <p
          v-if="errorMessage"
          class="rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {{ errorMessage }}
        </p>

        <TextField
          v-model="state.email"
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          :error="errors.email"
        />
        <TextField
          v-model="state.password"
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          :error="errors.password"
        />

        <button
          type="submit"
          :disabled="status === 'submitting'"
          class="inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-2 text-base font-normal text-on-accent transition-colors hover:bg-accent-deep active:bg-accent-press disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ status === 'submitting' ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>
