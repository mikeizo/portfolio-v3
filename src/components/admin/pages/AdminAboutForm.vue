<script setup lang="ts">
  import type { AboutType } from '@/types/portfolio'

  import * as v from 'valibot'
  import { fileExtension, sanitizeImageFileStem } from '@/utils/slug'
  import { reactive, ref } from 'vue'
  import { aboutSchema } from '@/utils/formSchema'
  import { addToast } from '@/stores/toasts'
  import { useCurrentUser } from '@/composables/useCurrentUser'
  import { useS3Upload } from '@/composables/useS3Upload'

  import ImageUpload from '@/components/admin/form/ImageUpload.vue'
  import RichTextEditor from '@/components/admin/form/RichTextEditor.vue'
  import SelectField from '@/components/admin/form/SelectField.vue'

  const { isGuest } = useCurrentUser()
  const { presignAndPut, deleteKeys } = useS3Upload()

  const props = defineProps<{ data: AboutType; id?: string }>()

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => {
    const year = String(currentYear - i)
    return { label: year, value: year }
  })
  const yearToOptions = [
    { label: '—', value: '' },
    { label: 'Now', value: 'Now' },
    ...yearOptions
  ]

  const state = reactive({
    yearFrom: props.data.yearFrom ?? '',
    yearTo: props.data.yearTo ?? '',
    description: props.data.description ?? '',
    image: props.data.image ?? ''
  })

  const imageFile = ref<File | null>(null)
  const lastSavedImage = ref<string>(props.data.image ?? '')
  const errors = reactive<Record<string, string>>({})
  const status = ref<'idle' | 'saving'>('idle')

  async function persistAboutRecord(
    payload: Record<string, unknown>
  ): Promise<boolean> {
    const method = props.id ? 'PATCH' : 'POST'
    const body = props.id ? { id: props.id, ...payload } : payload

    try {
      const response = await fetch('/api/admin/about', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        addToast({
          type: 'error',
          title: 'Save failed',
          description: errorData.error || 'Failed to save about record.'
        })
        return false
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save failed',
        description: (error as Error).message
      })
      return false
    }
    return true
  }

  async function onSubmit() {
    if (isGuest.value || status.value === 'saving') return

    for (const key in errors) delete errors[key]
    const result = v.safeParse(aboutSchema, state)
    if (!result.success) {
      const nested = v.flatten(result.issues).nested ?? {}
      for (const field in nested) errors[field] = nested[field]![0]
      return
    }

    status.value = 'saving'
    try {
      let imageFilename = state.image

      if (imageFile.value) {
        const ext = fileExtension(imageFile.value.name)
        const stem = sanitizeImageFileStem(imageFile.value.name)
        const filename = `${stem}.${ext}`
        await presignAndPut(`about/${filename}`, imageFile.value)
        imageFilename = filename
      }

      const payload = {
        yearFrom: state.yearFrom,
        yearTo: state.yearTo,
        description: state.description,
        image: imageFilename
      }

      const saved = await persistAboutRecord(payload)
      if (!saved) return

      // Remove the previous image from storage once the record points elsewhere.
      if (lastSavedImage.value && lastSavedImage.value !== imageFilename) {
        try {
          await deleteKeys([`about/${lastSavedImage.value}`])
        } catch (error) {
          addToast({
            type: 'info',
            title: 'Heads up',
            description:
              (error as Error).message ||
              'Record saved, but the previous image could not be removed from storage.'
          })
        }
      }

      lastSavedImage.value = imageFilename
      state.image = imageFilename
      imageFile.value = null

      if (props.id) {
        addToast({
          type: 'success',
          title: 'Updated',
          description: 'About record has been updated.'
        })
      } else {
        window.location.href = '/admin/about?toast=about-created'
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save failed',
        description: (error as Error).message || 'Something went wrong.'
      })
    } finally {
      status.value = 'idle'
    }
  }
</script>

<template>
  <h1 class="text-4xl mb-7 font-light text-ink">
    {{ id ? 'Edit about entry' : 'New about entry' }}
  </h1>

  <form class="max-w-2xl space-y-4" @submit.prevent="onSubmit">
    <div class="flex flex-wrap items-start gap-4">
      <SelectField
        v-model="state.yearFrom"
        class="w-40"
        label="Year From"
        name="yearFrom"
        placeholder="Select year"
        :options="yearOptions"
        :error="errors.yearFrom"
      />
      <SelectField
        v-model="state.yearTo"
        class="w-40"
        label="Year To"
        name="yearTo"
        :options="yearToOptions"
        :error="errors.yearTo"
      />
    </div>

    <div>
      <label class="mb-2 block text-sm text-muted">Description</label>
      <RichTextEditor v-model="state.description" />
      <p v-if="errors.description" class="mt-1 text-xs text-danger">
        {{ errors.description }}
      </p>
    </div>

    <ImageUpload
      v-model:file="imageFile"
      v-model:image="state.image"
      dir="about"
    />

    <button
      type="submit"
      :disabled="isGuest || status === 'saving'"
      class="inline-flex items-center rounded-md bg-accent px-4 py-2 text-base font-normal text-on-accent transition-colors hover:bg-accent-deep active:bg-accent-press disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ status === 'saving' ? 'Saving…' : id ? 'Update' : 'Add' }}
    </button>
  </form>
</template>
