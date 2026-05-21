<script setup lang="ts">
  import type { SettingsType } from '@/types/portfolio'

  import { adminRequest } from '@/utils/request'
  import { editorItems } from '@/utils/forms'
  import { reactive } from 'vue'
  import { settingsSchema } from '@/utils/formSchema'
  import { TextAlign } from '@tiptap/extension-text-align'
  import { useCurrentUser } from '@/composables/useCurrentUser'

  import Title from '@/components/admin/AdminTitle.vue'

  const { isGuest } = useCurrentUser()

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

  async function onSubmit() {
    await adminRequest('PUT', 'settings', state, 'Settings have been updated.')
  }
</script>

<template>
  <Title title="Settings" class="pb-4 border-b border-accented" />
  <UForm
    :schema="settingsSchema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
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
    <UButton type="submit" :disabled="isGuest">Update</UButton>
  </UForm>
</template>
