<script setup lang="ts">
  import type { EditorToolbarItem } from '@nuxt/ui'
  import type { FormSubmitEvent } from '@nuxt/ui'
  import type { SettingsType } from '@/types/portfolio'

  import * as v from 'valibot'
  import { reactive } from 'vue'

  import { TextAlign } from '@tiptap/extension-text-align'

  const props = defineProps<{
    data: SettingsType
  }>()

  const items: EditorToolbarItem[][] = [
    [
      { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold' },
      { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic' }
    ],
    [
      // { kind: 'heading', level: 1, icon: 'i-lucide-heading-1' },
      { kind: 'heading', level: 2, icon: 'i-lucide-heading-2' },
      { kind: 'heading', level: 3, icon: 'i-lucide-heading-3' }
    ],
    [
      { kind: 'textAlign', align: 'left', icon: 'i-lucide-align-left' },
      { kind: 'textAlign', align: 'center', icon: 'i-lucide-align-center' },
      { kind: 'bulletList', icon: 'i-lucide-list' },
      { kind: 'orderedList', icon: 'i-lucide-list-ordered' },
      { kind: 'link', icon: 'i-lucide-link' }
    ],
    [{ kind: 'mark', mark: 'code', icon: 'i-lucide-code' }]
  ]

  const state = reactive({
    title: props.data?.title ?? '',
    subtitle: props.data?.subtitle ?? '',
    email: props.data?.email ?? '',
    git: props.data?.git ?? '',
    about: props.data?.about ?? ''
  })

  const schema = v.object({
    title: v.pipe(
      v.string(),
      v.nonEmpty('Please enter a title'),
      v.maxLength(25, 'Must be less than 25 characters')
    ),
    subtitle: v.pipe(
      v.string(),
      v.maxLength(50, 'Must be less than 50 characters')
    ),
    email: v.pipe(v.string(), v.email('Please enter a valid email')),
    git: v.pipe(v.string(), v.url('Please enter a valid url')),
    about: v.pipe(v.string())
  })

  type Schema = v.InferOutput<typeof schema>

  const toast = useToast()
  async function onSubmit(event: FormSubmitEvent<Schema>) {
    // Submit the form data to the API endpoint for settings
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(state)
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.add({
          title: 'Error',
          description: errorData.error || 'Failed to update settings.',
          color: 'red'
        })
        return
      }
    } catch (error) {
      toast.add({
        title: 'Error',
        description:
          (error as Error).message || 'An unexpected error occurred.',
        color: 'red'
      })
      return
    }

    toast.add({
      title: 'Success',
      description: 'The form has been submitted.',
      color: 'success'
    })
  }
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Title" name="title">
      <UInput v-model="state.title" type="text" size="xl" class="w-1/2" />
    </UFormField>
    <UFormField label="Subtitle" name="subtitle">
      <UInput v-model="state.subtitle" type="text" size="xl" class="w-1/2" />
    </UFormField>
    <UFormField label="Email" name="email">
      <UInput v-model="state.email" size="xl" class="w-1/2" />
    </UFormField>
    <UFormField label="GitHub" name="git">
      <UInput v-model="state.git" size="xl" class="w-1/2" />
    </UFormField>
    <UFormField label="About Paragraph" name="about">
      <UEditor
        v-slot="{ editor }"
        v-model="state.about"
        class="border border-default rounded-md pb-5"
        :extensions="[
          TextAlign.configure({
            types: ['heading', 'paragraph']
          })
        ]"
      >
        <UEditorToolbar
          :editor="editor"
          :items="items"
          class="border-b border-muted mb-5"
        />
      </UEditor>
    </UFormField>
    <UButton type="submit">Update</UButton>
  </UForm>
</template>
