<script setup lang="ts">
  import type { WorkType } from '@/types/portfolio'

  import * as v from 'valibot'
  import { adminRequest } from '@/utils/request'
  import { editorItems } from '@/utils/forms'
  import { reactive } from 'vue'
  import { TextAlign } from '@tiptap/extension-text-align'

  const props = defineProps<{
    data: WorkType
    id?: string
  }>()

  const state = reactive({
    name: props.data.name ?? '',
    weight: props.data.weight ?? 0,
    url: props.data.url ?? '',
    git: props.data.git ?? '',
    resources: props.data.resources?.map((resource) => resource.name) ?? [],
    description: props.data.description ?? ''
  })

  const buttonText = props.id ? 'Update' : 'Add'

  // Form validation
  const schema = v.object({
    name: v.pipe(v.string(), v.nonEmpty('Name is required')),
    weight: v.pipe(v.number()),
    url: v.pipe(v.string(), v.url('The url is badly formatted.')),
    git: v.pipe(v.string(), v.url('The url is badly formatted.')),
    description: v.pipe(v.string(), v.nonEmpty('Please enter a description'))
  })

  const onSubmit = async () => {
    if (props.id) {
      await adminRequest(
        'PATCH',
        'work',
        { id: props.id, ...state },
        'Work record has been updated.'
      )
    } else {
      await adminRequest('POST', 'work', state)
      window.location.href = '/admin/work?toast=work-created'
    }
  }
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Name" name="name" required>
      <UInput v-model="state.name" class="w-1/2" type="text" size="xl" />
    </UFormField>
    <UFormField label="weight" name="weight">
      <UInputNumber
        v-model="state.weight"
        class="w-1/2"
        type="number"
        size="xl"
      />
    </UFormField>
    <UFormField label="Resources">
      <UInputTags v-model="state.resources" class="w-1/2" size="xl" />
    </UFormField>
    <UFormField label="url" name="url">
      <UInput v-model="state.url" class="w-1/2" type="text" size="xl" />
    </UFormField>
    <UFormField label="git" name="GitHub">
      <UInput v-model="state.git" class="w-1/2" type="text" size="xl" />
    </UFormField>
    <UFormField label="Description" name="description">
      <UEditor
        v-slot="{ editor }"
        v-model="state.description"
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
    <UButton type="submit">{{ buttonText }}</UButton>
  </UForm>
</template>
