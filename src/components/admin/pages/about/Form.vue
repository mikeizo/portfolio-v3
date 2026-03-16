<script setup lang="ts">
  import type { AboutType } from '@/types/portfolio'

  import * as v from 'valibot'
  import { adminRequest } from '@/utils/request'
  import { editorItems } from '@/utils/forms'
  import { reactive } from 'vue'
  import { TextAlign } from '@tiptap/extension-text-align'

  const props = defineProps<{
    data: AboutType
    id?: string
  }>()

  const state = reactive({
    yearFrom: props.data.yearFrom ?? '',
    yearTo: props.data.yearTo ?? '',
    description: props.data.description ?? ''
  })

  const buttonText = props.id ? 'Update' : 'Add'

  // Form validation
  const schema = v.object({
    yearFrom: v.pipe(v.string(), v.nonEmpty('Please enter a start year')),
    yearTo: v.pipe(v.string()),
    description: v.pipe(v.string(), v.nonEmpty('Please enter a description'))
  })

  async function onSubmit() {
    if (props.id) {
      await adminRequest(
        'PATCH',
        'about',
        { id: props.id, ...state },
        'About record has been updated.'
      )
    } else {
      await adminRequest('POST', 'about', state)
      window.location.href = '/admin/about?toast=about-created'
    }
  }
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <div class="flex flex-wrap items-center gap-2">
      <UFormField label="Year From" name="yearFrom">
        <UInput v-model="state.yearFrom" class="w-50" type="text" size="xl" />
      </UFormField>
      <span class="text-muted-foreground">-</span>
      <UFormField label="Year To" name="yearTo">
        <UInput v-model="state.yearTo" class="w-50" type="text" size="xl" />
      </UFormField>
    </div>
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
