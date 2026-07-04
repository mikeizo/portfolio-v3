<script setup lang="ts">
  import type { WorkType } from '@/types/portfolio'

  import * as v from 'valibot'
  import { ArrowUpRight, CirclePlus, CircleX } from 'lucide-vue-next'
  import { fileExtension, slugify } from '@/utils/slug'
  import { reactive, ref } from 'vue'
  import { addToast } from '@/stores/toasts'
  import { useCurrentUser } from '@/composables/useCurrentUser'
  import { useS3Upload } from '@/composables/useS3Upload'
  import { workSchema } from '@/utils/formSchema'

  import GalleryUpload from '@/components/admin/form/GalleryUpload.vue'
  import ImageUpload from '@/components/admin/form/ImageUpload.vue'
  import RichTextEditor from '@/components/admin/form/RichTextEditor.vue'
  import TextField from '@/components/admin/form/TextField.vue'

  const { isGuest } = useCurrentUser()
  const { presignAndPut, uploadMany, buildUniqueKey, deleteKeys } = useS3Upload()

  const props = defineProps<{ data: Partial<WorkType>; id?: string }>()

  const state = reactive({
    name: props.data.name ?? '',
    // String in state — TextField type=number emits strings; coerced to Number
    // for valibot (workSchema.weight is v.number()) and the payload.
    weight: String(props.data.weight ?? ''),
    url: props.data.url ?? '',
    git: props.data.git ?? '',
    resources: (props.data.resources ?? []).map((r) => ({
      name: r.name ?? '',
      icon: r.icon.toLowerCase() ?? ''
    })),
    description: props.data.description ?? '',
    slug: props.data.slug ?? '',
    logo: props.data.logo ?? '',
    images: [...(props.data.images ?? [])],
    grayscale: props.data.grayscale ?? false
  })

  const galleryFiles = ref<File[]>([])
  const logoFile = ref<File | null>(null)
  const lastSavedImages = ref<string[]>([...(props.data.images ?? [])])
  const lastSavedLogo = ref<string>(props.data.logo ?? '')
  const errors = reactive<Record<string, string>>({})
  const status = ref<'idle' | 'saving'>('idle')

  function addResource() {
    state.resources.push({ name: '', icon: '' })
  }

  function removeResource(index: number) {
    state.resources.splice(index, 1)
  }

  async function persistWorkRecord(payload: Record<string, unknown>): Promise<boolean> {
    const method = props.id ? 'PATCH' : 'POST'
    const body = props.id ? { id: props.id, ...payload } : payload

    try {
      const response = await fetch('/api/admin/work', {
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
          description: errorData.error || 'Failed to save work record.'
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
    const candidate = { ...state, weight: Number(state.weight) }
    const result = v.safeParse(workSchema, candidate)
    if (!result.success) {
      const nested = v.flatten(result.issues).nested ?? {}
      for (const field in nested) errors[field] = nested[field]![0]
      return
    }

    status.value = 'saving'
    try {
      // Slug is immutable once set — reuse the saved one on edit, derive on create.
      const keySlug = props.id && props.data.slug ? props.data.slug : slugify(state.name)

      const usedKeys = new Set(state.images)
      const newPaths = await uploadMany(galleryFiles.value, (file) =>
        buildUniqueKey(keySlug, file, usedKeys)
      )
      const mergedImages = [...state.images, ...newPaths]

      let logoFilename = state.logo
      if (logoFile.value) {
        const ext = fileExtension(logoFile.value.name)
        const filename = `${keySlug}-logo.${ext}`
        await presignAndPut(`logos/${filename}`, logoFile.value)
        logoFilename = filename
      }

      const payload = {
        name: state.name,
        weight: Number(state.weight),
        url: state.url,
        git: state.git,
        resources: state.resources,
        description: state.description,
        slug: keySlug,
        logo: logoFilename,
        images: mergedImages,
        grayscale: state.grayscale
      }

      const saved = await persistWorkRecord(payload)
      if (!saved) return

      // Clean up storage once the record points elsewhere: gallery images dropped
      // during this edit, plus the previous logo if it was replaced.
      const toDelete = lastSavedImages.value.filter((p) => !mergedImages.includes(p))
      if (lastSavedLogo.value && lastSavedLogo.value !== logoFilename) {
        toDelete.push(`logos/${lastSavedLogo.value}`)
      }
      if (toDelete.length) {
        try {
          await deleteKeys(toDelete)
        } catch (error) {
          addToast({
            type: 'info',
            title: 'Heads up',
            description:
              (error as Error).message ||
              'Record saved, but some files could not be removed from storage.'
          })
        }
      }

      lastSavedImages.value = [...mergedImages]
      lastSavedLogo.value = logoFilename
      state.images = [...mergedImages]
      state.logo = logoFilename
      state.slug = keySlug
      galleryFiles.value = []
      logoFile.value = null

      if (props.id) {
        addToast({
          type: 'success',
          title: 'Updated',
          description: 'Work record has been updated.'
        })
      } else {
        window.location.href = '/admin/work?toast=work-created'
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
    {{ id ? 'Edit work entry' : 'New work entry' }}
  </h1>

  <form
    class="space-y-8"
    @submit.prevent="onSubmit"
  >
    <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_400px]">
      <!-- Main content -->
      <div class="space-y-8">
        <!-- Basic info -->
        <section class="space-y-4">
          <h2 class="text-lg font-medium text-ink">Basic info</h2>
          <div class="flex flex-wrap items-start gap-4">
            <TextField
              v-model="state.name"
              class="min-w-60 flex-1"
              label="Name"
              name="name"
              :error="errors.name"
            />
            <TextField
              v-model="state.weight"
              class="w-32"
              label="Weight"
              name="weight"
              type="number"
              :error="errors.weight"
            />
          </div>
          <div v-if="state.slug">
            <label class="mb-2 block text-sm text-muted">Slug</label>
            <input
              :value="state.slug"
              type="text"
              readonly
              class="w-full rounded-md border border-hairline-input bg-field px-3 py-2 text-base text-muted outline-none"
            />
          </div>
        </section>

        <!-- Links -->
        <section class="space-y-4">
          <h2 class="text-lg font-medium text-ink">Links</h2>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              v-model="state.url"
              label="Project URL"
              name="url"
              placeholder="https://"
              :error="errors.url"
            />
            <TextField
              v-model="state.git"
              label="GitHub"
              name="git"
              placeholder="https://github.com/..."
              :error="errors.git"
            />
          </div>
        </section>

        <!-- Description -->
        <section class="space-y-4">
          <h2 class="text-lg font-medium text-ink">Description</h2>
          <div>
            <RichTextEditor v-model="state.description" />
            <p
              v-if="errors.description"
              class="mt-1 text-xs text-danger"
            >
              {{ errors.description }}
            </p>
          </div>
        </section>

        <!-- Images -->
        <section class="space-y-4">
          <h2 class="text-lg font-medium text-ink">Images</h2>
          <ImageUpload
            v-model:file="logoFile"
            v-model:image="state.logo"
            dir="logos"
            label="Logo"
          />
          <label class="flex w-fit cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              v-model="state.grayscale"
              type="checkbox"
              class="size-4 rounded border-hairline-input accent-accent"
            />
            Grayscale logo
          </label>
          <GalleryUpload
            v-model:images="state.images"
            v-model:files="galleryFiles"
          />
        </section>
      </div>

      <!-- Right rail: Tech stack -->
      <aside class="space-y-4 rounded-lg bg-bg-soft p-6 lg:sticky lg:top-6">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-lg font-medium text-ink">Tech stack</h2>
          <a
            href="https://devicon.dev"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink"
          >
            DevIcons
            <ArrowUpRight :size="14" />
          </a>
        </div>

        <div class="space-y-3">
          <div
            v-for="(resource, index) in state.resources"
            :key="index"
            class="space-y-1"
          >
            <div class="flex items-center gap-2">
              <input
                v-model="resource.name"
                type="text"
                placeholder="Vue"
                class="w-full min-w-0 rounded-md border bg-field px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
                :class="
                  errors[`resources.${index}.name`] ? 'border-danger' : 'border-hairline-input'
                "
              />
              <input
                v-model="resource.icon"
                type="text"
                placeholder="devicon-vue-original"
                class="w-full min-w-0 rounded-md border bg-field px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
                :class="
                  errors[`resources.${index}.icon`] ? 'border-danger' : 'border-hairline-input'
                "
              />
              <button
                type="button"
                :aria-label="`Remove resource ${index + 1}`"
                class="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-row-hover hover:text-danger"
                @click="removeResource(index)"
              >
                <CircleX :size="16" />
              </button>
            </div>
            <p
              v-if="errors[`resources.${index}.name`] || errors[`resources.${index}.icon`]"
              class="text-xs text-danger"
            >
              {{ errors[`resources.${index}.name`] || errors[`resources.${index}.icon`] }}
            </p>
          </div>

          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-md border border-hairline-input px-3 py-2 text-sm text-ink transition-colors hover:bg-row-hover"
            @click="addResource"
          >
            <CirclePlus :size="16" />
            Add resource
          </button>
        </div>
      </aside>
    </div>

    <button
      type="submit"
      :disabled="isGuest || status === 'saving'"
      class="inline-flex items-center rounded-md bg-accent px-4 py-2 text-base font-normal text-on-accent transition-colors hover:bg-accent-deep active:bg-accent-press disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ status === 'saving' ? 'Saving…' : id ? 'Update' : 'Add' }}
    </button>
  </form>
</template>
