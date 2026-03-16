<script setup lang="ts">
  import type { SettingsType } from '@/types/portfolio'

  import * as v from 'valibot'
  import { adminRequest } from '@/utils/request'
  import { editorItems } from '@/utils/forms'
  import { reactive } from 'vue'
  import { TextAlign } from '@tiptap/extension-text-align'

  const props = defineProps<{
    data: SettingsType
  }>()

  const { title, subtitle, email, git, about } = props.data

  const state = reactive({
    title: title ?? '',
    subtitle: subtitle ?? '',
    email: email ?? '',
    git: git ?? '',
    about: about ?? ''
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

  async function onSubmit() {
    await adminRequest('PUT', 'settings', state, 'Settings have been updated.')
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
          :items="editorItems"
          class="border-b border-muted mb-5"
        />
      </UEditor>
    </UFormField>
    <UButton type="submit">Update</UButton>
  </UForm>
</template>
