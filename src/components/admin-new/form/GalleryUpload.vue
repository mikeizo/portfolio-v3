<script setup lang="ts">
  import { Images as ImagesIcon, Trash2, Upload, X } from 'lucide-vue-next'
  import { onUnmounted, ref, watch } from 'vue'
  import { addToast } from '@/stores/toasts'
  import { useS3Upload } from '@/composables/useS3Upload'

  const props = withDefaults(
    defineProps<{
      images: string[]
      files: File[]
      label?: string
      max?: number
    }>(),
    { label: 'Gallery', max: 5 }
  )

  const emit = defineEmits<{
    'update:images': [value: string[]]
    'update:files': [value: File[]]
  }>()

  // Selections are validated here (size/type); the parent owns the actual S3 PUT
  // on submit so the uploads run inside the save flow.
  const { assertFile } = useS3Upload()

  const assetsBase =
    (import.meta.env.PUBLIC_ASSETS_PATH as string | undefined) ?? ''

  const dragOver = ref(false)
  const inputEl = ref<HTMLInputElement | null>(null)

  // Object URLs keyed by File so previews survive reorders and are revoked once
  // their file leaves the pending list.
  const urlMap = new Map<File, string>()
  const previews = ref<{ file: File; url: string }[]>([])

  watch(
    () => props.files,
    (files) => {
      for (const [file, url] of urlMap) {
        if (!files.includes(file)) {
          URL.revokeObjectURL(url)
          urlMap.delete(file)
        }
      }
      for (const file of files) {
        if (!urlMap.has(file)) urlMap.set(file, URL.createObjectURL(file))
      }
      previews.value = files.map((file) => ({ file, url: urlMap.get(file)! }))
    },
    { immediate: true }
  )

  onUnmounted(() => {
    for (const url of urlMap.values()) URL.revokeObjectURL(url)
  })

  function addFiles(picked: File[]) {
    if (!picked.length) return

    const remaining = props.max - (props.images.length + props.files.length)
    if (remaining <= 0) {
      addToast({
        type: 'error',
        title: 'Limit reached',
        description: `Up to ${props.max} images allowed.`
      })
      return
    }

    const accepted: File[] = []
    let cappedOut = false
    for (const file of picked) {
      if (accepted.length >= remaining) {
        cappedOut = true
        break
      }
      try {
        assertFile(file)
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Invalid file',
          description: (error as Error).message
        })
        continue
      }
      accepted.push(file)
    }

    if (accepted.length) emit('update:files', [...props.files, ...accepted])
    if (cappedOut) {
      addToast({
        type: 'info',
        title: 'Limit reached',
        description: `Up to ${props.max} images allowed.`
      })
    }
  }

  function onInputChange(event: Event) {
    const target = event.target as HTMLInputElement
    addFiles(Array.from(target.files ?? []))
    target.value = '' // allow re-selecting the same file
  }

  function onDrop(event: DragEvent) {
    dragOver.value = false
    if (props.images.length + props.files.length >= props.max) return
    addFiles(Array.from(event.dataTransfer?.files ?? []))
  }

  function removeExisting(index: number) {
    emit(
      'update:images',
      props.images.filter((_, i) => i !== index)
    )
  }

  function removePending(index: number) {
    emit(
      'update:files',
      props.files.filter((_, i) => i !== index)
    )
  }
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between">
      <label class="block text-sm text-muted">{{ label }}</label>
      <span
        class="tnum text-xs"
        :class="
          images.length + files.length >= max ? 'text-danger' : 'text-faint'
        "
      >
        {{ images.length + files.length }} / {{ max }}
      </span>
    </div>

    <!-- Saved images -->
    <ul
      v-if="images.length"
      class="mb-3 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3"
    >
      <li
        v-for="(imgPath, index) in images"
        :key="`${imgPath}-${index}`"
        class="relative aspect-square overflow-hidden rounded-lg border border-hairline bg-bg-soft"
      >
        <img
          v-if="assetsBase"
          :src="`${assetsBase}/${imgPath}`"
          :alt="`Gallery image ${index + 1}`"
          class="size-full object-cover"
          loading="lazy"
        />
        <div
          v-else
          class="flex size-full items-center justify-center p-2 text-center text-xs break-all text-faint"
        >
          {{ imgPath.split('/').pop() }}
        </div>
        <button
          type="button"
          :aria-label="`Remove gallery image ${index + 1}`"
          class="absolute end-1 top-1 inline-flex size-6 items-center justify-center rounded-md bg-surface text-muted shadow-card transition-colors hover:text-danger"
          @click="removeExisting(index)"
        >
          <Trash2 :size="14" />
        </button>
      </li>
    </ul>

    <!-- Pending selections -->
    <div v-if="previews.length" class="mb-3">
      <ul class="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
        <li
          v-for="(preview, index) in previews"
          :key="preview.url"
          class="relative aspect-square overflow-hidden rounded-lg border border-dashed border-hairline-input bg-bg-soft"
        >
          <img
            :src="preview.url"
            :alt="`New image ${index + 1}`"
            class="size-full object-cover"
          />
          <button
            type="button"
            :aria-label="`Clear new image ${index + 1}`"
            class="absolute end-1 top-1 inline-flex size-6 items-center justify-center rounded-md bg-surface text-muted shadow-card transition-colors hover:text-ink"
            @click="removePending(index)"
          >
            <X :size="14" />
          </button>
        </li>
      </ul>
      <button
        type="button"
        class="mt-2 text-xs text-muted transition-colors hover:text-danger"
        @click="emit('update:files', [])"
      >
        Remove all new images
      </button>
    </div>

    <!-- Dropzone -->
    <div
      class="flex w-full max-w-md flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-8 text-center transition-colors"
      :class="[
        dragOver
          ? 'border-accent bg-accent-soft'
          : 'border-hairline-input bg-field',
        images.length + files.length >= max && 'pointer-events-none opacity-50'
      ]"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <ImagesIcon :size="22" class="text-faint" />
      <div>
        <span class="text-sm font-medium text-ink">Drop images here</span>
        <p class="mt-0.5 text-xs text-faint">
          WebP, SVG, PNG, or JPG (max. 2MB each). Up to {{ max }} total.
        </p>
      </div>
      <button
        type="button"
        :disabled="images.length + files.length >= max"
        class="inline-flex items-center gap-2 rounded-md border border-hairline-input px-3 py-1.5 text-sm text-ink transition-colors hover:bg-row-hover disabled:cursor-not-allowed disabled:opacity-50"
        @click="inputEl?.click()"
      >
        <Upload :size="14" />
        Select images
      </button>
      <input
        ref="inputEl"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
        class="hidden"
        @change="onInputChange"
      />
    </div>
  </div>
</template>
