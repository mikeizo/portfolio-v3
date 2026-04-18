<script setup lang="ts">
  import type { AboutType } from '@/types/portfolio'

  import * as v from 'valibot'
  import { fileExtension, sanitizeImageFileStem } from '@/utils/slug'
  import { onUnmounted, reactive, ref, watch } from 'vue'
  import { editorItems } from '@/utils/forms'
  import { TextAlign } from '@tiptap/extension-text-align'
  import { useS3Upload } from '@/composables/useS3Upload'

  const props = defineProps<{
    data: AboutType
    id?: string
  }>()

  const imageFile = ref<File | null>(null)
  const imageObjectUrl = ref<string | null>(null)
  const submitting = ref(false)
  const toast = useToast()
  const { presignAndPut, deleteKeys } = useS3Upload()

  const assetsBase =
    (import.meta.env.PUBLIC_ASSETS_PATH as string | undefined) ?? ''

  const state = reactive({
    yearFrom: props.data.yearFrom ?? '',
    yearTo: props.data.yearTo ?? '',
    description: props.data.description ?? '',
    image: props.data.image ?? ''
  })

  const lastSavedImage = ref<string>(props.data.image ?? '')

  watch(imageFile, (file) => {
    if (imageObjectUrl.value) {
      URL.revokeObjectURL(imageObjectUrl.value)
      imageObjectUrl.value = null
    }
    if (file) {
      imageObjectUrl.value = URL.createObjectURL(file)
    }
  })

  onUnmounted(() => {
    if (imageObjectUrl.value) {
      URL.revokeObjectURL(imageObjectUrl.value)
    }
  })

  function clearPendingImage() {
    imageFile.value = null
  }

  function clearSavedImage() {
    state.image = ''
  }

  const buttonText = props.id ? 'Update' : 'Add'

  // Form validation
  const schema = v.object({
    yearFrom: v.pipe(v.string(), v.nonEmpty('Please enter a start year')),
    yearTo: v.pipe(v.string()),
    description: v.pipe(v.string(), v.nonEmpty('Please enter a description'))
  })

  async function persistAboutRecord(
    payload: Record<string, unknown>
  ): Promise<boolean> {
    const method = props.id ? 'PATCH' : 'POST'
    const body = props.id ? { id: props.id, ...payload } : payload

    try {
      const response = await fetch(`/api/admin/about`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        toast.add({
          title: 'Error',
          description: errorData.error || 'Failed to save about record.',
          color: 'red'
        })
        return false
      }
    } catch (error) {
      toast.add({
        title: 'Error',
        description: (error as Error).message,
        color: 'red'
      })
      return false
    }
    return true
  }

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true

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

      if (lastSavedImage.value && lastSavedImage.value !== imageFilename) {
        try {
          await deleteKeys([`about/${lastSavedImage.value}`])
        } catch (e) {
          toast.add({
            title: 'Warning',
            description:
              (e as Error).message ||
              'Record saved, but previous image could not be removed from storage.',
            color: 'warning'
          })
        }
      }

      lastSavedImage.value = imageFilename
      state.image = imageFilename
      imageFile.value = null

      if (props.id) {
        toast.add({
          title: 'Success',
          description: 'About record has been updated.',
          color: 'success'
        })
      } else {
        window.location.href = '/admin/about?toast=about-created'
      }
    } catch (e) {
      toast.add({
        title: 'Error',
        description: (e as Error).message || 'Something went wrong.',
        color: 'red'
      })
    } finally {
      submitting.value = false
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

    <UFormField label="Image" name="imageFile">
      <div v-if="imageObjectUrl || state.image" class="space-y-2 mb-4">
        <p
          v-if="!imageObjectUrl && state.image && !assetsBase"
          class="text-xs text-muted"
        >
          Set <code class="text-xs">PUBLIC_ASSETS_PATH</code> to preview the
          saved image, or select a new file below.
        </p>
        <div
          class="relative flex size-32 max-w-full items-center justify-center overflow-hidden rounded-lg border border-default bg-muted"
        >
          <img
            v-if="imageObjectUrl"
            :src="imageObjectUrl"
            alt="New image preview"
            class="max-h-full max-w-full object-contain"
          />
          <img
            v-else-if="assetsBase && state.image"
            :src="`${assetsBase}/about/${state.image}`"
            alt="Current image"
            class="max-h-full max-w-full object-contain"
            loading="lazy"
          />
          <span v-else class="px-2 text-center text-xs text-muted">
            {{ state.image }}
          </span>
          <UButton
            v-if="imageObjectUrl"
            type="button"
            color="neutral"
            variant="solid"
            size="xs"
            icon="i-lucide-x"
            class="absolute end-1 top-1 shadow-sm"
            aria-label="Clear new image selection"
            @click="clearPendingImage()"
          />
          <UButton
            v-else-if="state.image"
            type="button"
            color="neutral"
            variant="solid"
            size="xs"
            icon="i-lucide-trash-2"
            class="absolute end-1 top-1 shadow-sm"
            aria-label="Remove saved image"
            @click="clearSavedImage()"
          />
        </div>
      </div>

      <UFileUpload
        v-model="imageFile"
        accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
        icon="i-lucide-image"
        label="Drop image here"
        description="WebP, SVG, PNG, or JPG (max. 2MB)"
        layout="list"
        :interactive="false"
        class="w-full max-w-md min-h-40"
      >
        <template #actions="{ open }">
          <UButton
            label="Select image"
            icon="i-lucide-upload"
            color="neutral"
            variant="outline"
            @click="open()"
          />
        </template>
      </UFileUpload>
    </UFormField>

    <UButton type="submit" :loading="submitting" :disabled="submitting">
      {{ buttonText }}
    </UButton>
  </UForm>
</template>
