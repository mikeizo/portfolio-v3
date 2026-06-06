<script setup lang="ts">
  import type { SettingsType } from '@/types/portfolio'

  import * as v from 'valibot'
  import { reactive, ref } from 'vue'
  import { addToast } from '@/stores/toasts'
  import { settingsSchema } from '@/utils/formSchema'
  import { useCurrentUser } from '@/composables/useCurrentUser'

  import RichTextEditor from '@/components/admin-new/form/RichTextEditor.vue'
  import TextField from '@/components/admin-new/form/TextField.vue'

  const { isGuest } = useCurrentUser()

  const props = defineProps<{ data?: SettingsType }>()

  const { title, subtitle, email, git, about } = props.data ?? {}

  const state = reactive({
    title: title ?? '',
    subtitle: subtitle ?? '',
    email: email ?? '',
    git: git ?? '',
    about: about ?? ''
  })

  const errors = reactive<Record<string, string>>({})
  const status = ref<'idle' | 'saving' | 'success' | 'error'>('idle')

  async function onSubmit() {
    if (isGuest.value || status.value === 'saving') return

    for (const key in errors) delete errors[key]
    const result = v.safeParse(settingsSchema, state)
    if (!result.success) {
      const nested = v.flatten(result.issues).nested ?? {}
      for (const field in nested) errors[field] = nested[field]![0]
      return
    }

    status.value = 'saving'
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      })
      const body = await response.json().catch(() => ({}))
      status.value = response.ok ? 'success' : 'error'
      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Saved',
          description: 'Your settings have been updated.'
        })
      } else {
        addToast({
          type: 'error',
          title: 'Update failed',
          description: body.error || 'Failed to update settings.'
        })
      }
    } catch (error) {
      status.value = 'error'
      addToast({
        type: 'error',
        title: 'Update failed',
        description: (error as Error).message || 'An unexpected error occurred.'
      })
    }
  }
</script>

<template>
  <h1 class="text-4xl font-light tracking-[-0.7px] text-ink">Settings</h1>
  <p class="mt-2 mb-7 text-base text-muted">
    Manage your profile and workspace details.
  </p>

  <form class="max-w-2xl space-y-4" @submit.prevent="onSubmit">
    <TextField
      v-model="state.title"
      class="sm:w-1/2"
      label="Title"
      name="title"
      :error="errors.title"
    />
    <TextField
      v-model="state.subtitle"
      class="sm:w-1/2"
      label="Subtitle"
      name="subtitle"
      :error="errors.subtitle"
    />
    <TextField
      v-model="state.email"
      class="sm:w-1/2"
      label="Email"
      name="email"
      :error="errors.email"
    />
    <TextField
      v-model="state.git"
      class="sm:w-1/2"
      label="GitHub"
      name="git"
      :error="errors.git"
    />

    <div>
      <label class="mb-1.5 block text-sm text-muted">About Paragraph</label>
      <RichTextEditor v-model="state.about" />
    </div>

    <button
      type="submit"
      :disabled="isGuest || status === 'saving'"
      class="inline-flex items-center rounded-md bg-accent px-4 py-2 text-base font-normal text-on-accent transition-colors hover:bg-accent-deep active:bg-accent-press disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ status === 'saving' ? 'Updating…' : 'Update' }}
    </button>
  </form>
</template>
