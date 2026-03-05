<script setup lang="ts">
  import type { EditorToolbarItem } from '@nuxt/ui'
  import type { SettingsType } from '@/types/portfolio'

  import * as v from 'valibot'
  import { adminRequest } from '@/utils/request'
  import { reactive } from 'vue'
  import { TextAlign } from '@tiptap/extension-text-align'

  const props = defineProps<{
    data: SettingsType
  }>()

  const state = reactive({
    title: props.data?.title ?? '',
    subtitle: props.data?.subtitle ?? '',
    email: props.data?.email ?? '',
    git: props.data?.git ?? '',
    about: props.data?.about ?? ''
  })

  // Form validation
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

  // Editor form toolbar items
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

  async function onSubmit() {
    const description = 'Settings have been updated.'

    adminRequest('PUT', 'settings', state, description)
  }
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField class="sm:w-1/2" label="Title" name="title">
      <UInput v-model="state.title" class="w-full" type="text" size="xl" />
    </UFormField>
    <UFormField class="sm:w-1/2" label="Subtitle" name="subtitle">
      <UInput v-model="state.subtitle" class="w-full" type="text" size="xl" />
    </UFormField>
    <UFormField class="sm:w-1/2" label="Email" name="email">
      <UInput v-model="state.email" class="w-full" size="xl" />
    </UFormField>
    <UFormField class="sm:w-1/2" label="GitHub" name="git">
      <UInput v-model="state.git" class="w-full" size="xl" />
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
