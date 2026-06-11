<script setup lang="ts">
  import { Image as ImageIcon, Trash2, Upload, X } from 'lucide-vue-next'
  import { onUnmounted, ref, watch } from 'vue'
  import { addToast } from '@/stores/toasts'
  import { useS3Upload } from '@/composables/useS3Upload'

  const props = withDefaults(
    defineProps<{
      file: File | null
      image: string
      dir?: string
      label?: string
    }>(),
    { dir: 'about', label: 'Image' }
  )

  const emit = defineEmits<{
    'update:file': [value: File | null]
    'update:image': [value: string]
  }>()

  // Selection is validated here (size/type); the parent owns the actual S3 PUT
  // on submit so the upload runs inside the save flow.
  const { assertFile } = useS3Upload()

  const assetsBase =
    (import.meta.env.PUBLIC_ASSETS_PATH as string | undefined) ?? ''

  const imageObjectUrl = ref<string | null>(null)
  const dragOver = ref(false)
  const inputEl = ref<HTMLInputElement | null>(null)

  watch(
    () => props.file,
    (file) => {
      if (imageObjectUrl.value) {
        URL.revokeObjectURL(imageObjectUrl.value)
        imageObjectUrl.value = null
      }
      if (file) imageObjectUrl.value = URL.createObjectURL(file)
    }
  )

  onUnmounted(() => {
    if (imageObjectUrl.value) URL.revokeObjectURL(imageObjectUrl.value)
  })

  function selectFile(file: File | null) {
    if (!file) return
    try {
      assertFile(file)
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Invalid file',
        description: (error as Error).message
      })
      return
    }
    emit('update:file', file)
  }

  function onInputChange(event: Event) {
    const target = event.target as HTMLInputElement
    selectFile(target.files?.[0] ?? null)
    target.value = '' // allow re-selecting the same file
  }

  function onDrop(event: DragEvent) {
    dragOver.value = false
    selectFile(event.dataTransfer?.files?.[0] ?? null)
  }
</script>

<template>
  <div>
    <label class="mb-2 block text-sm text-muted">{{ label }}</label>

    <div v-if="imageObjectUrl || image" class="mb-3">
      <div
        class="relative flex size-32 items-center justify-center overflow-hidden rounded-lg border border-hairline bg-bg-soft"
      >
        <img
          v-if="imageObjectUrl"
          :src="imageObjectUrl"
          alt="New image preview"
          class="max-h-full max-w-full object-contain"
        />
        <img
          v-else-if="assetsBase && image"
          :src="`${assetsBase}/${dir}/${image}`"
          alt="Current image"
          class="max-h-full max-w-full object-contain"
          loading="lazy"
        />
        <span v-else class="px-2 text-center text-xs break-all text-faint">
          {{ image }}
        </span>

        <button
          v-if="imageObjectUrl"
          type="button"
          aria-label="Clear new image selection"
          class="absolute end-1 top-1 inline-flex size-6 items-center justify-center rounded-md bg-surface text-muted shadow-card transition-colors hover:text-ink"
          @click="emit('update:file', null)"
        >
          <X :size="14" />
        </button>
        <button
          v-else
          type="button"
          aria-label="Remove saved image"
          class="absolute end-1 top-1 inline-flex size-6 items-center justify-center rounded-md bg-surface text-muted shadow-card transition-colors hover:text-danger"
          @click="emit('update:image', '')"
        >
          <Trash2 :size="14" />
        </button>
      </div>
    </div>

    <div
      class="flex w-full max-w-md flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-8 text-center transition-colors"
      :class="
        dragOver
          ? 'border-accent bg-accent-soft'
          : 'border-hairline-input bg-field'
      "
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <ImageIcon :size="22" class="text-faint" />
      <div>
        <span class="text-sm font-medium text-ink">Drop image here</span>
        <p class="mt-0.5 text-xs text-faint">
          WebP, SVG, PNG, or JPG (max. 2MB)
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md border border-hairline-input px-3 py-1.5 text-sm text-ink transition-colors hover:bg-row-hover"
        @click="inputEl?.click()"
      >
        <Upload :size="14" />
        Select image
      </button>
      <input
        ref="inputEl"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
        class="hidden"
        @change="onInputChange"
      />
    </div>
  </div>
</template>
