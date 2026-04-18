<script setup lang="ts">
  import type { WorkType } from '@/types/portfolio'

  import * as v from 'valibot'
  import { fileExtension, slugify } from '@/utils/slug'
  import { onUnmounted, reactive, ref, watch } from 'vue'
  import { editorItems } from '@/utils/forms'
  import { TextAlign } from '@tiptap/extension-text-align'
  import { useS3Upload } from '@/composables/useS3Upload'

  const props = defineProps<{
    data: Partial<WorkType>
    id?: string
  }>()

  const galleryFiles = ref<File[]>([])
  const logoFile = ref<File | null>(null)
  const logoObjectUrl = ref<string | null>(null)
  const submitting = ref(false)
  const toast = useToast()
  const { presignAndPut, uploadMany, deleteKeys, buildUniqueKey } =
    useS3Upload()

  watch(logoFile, (file) => {
    if (logoObjectUrl.value) {
      URL.revokeObjectURL(logoObjectUrl.value)
      logoObjectUrl.value = null
    }
    if (file) {
      logoObjectUrl.value = URL.createObjectURL(file)
    }
  })

  onUnmounted(() => {
    if (logoObjectUrl.value) {
      URL.revokeObjectURL(logoObjectUrl.value)
    }
  })

  function clearPendingLogo() {
    logoFile.value = null
  }

  /** Baseline for S3 deletes after a successful save (props are frozen on client). */
  const lastSavedImages = ref<string[]>([...(props.data.images ?? [])])

  const assetsBase =
    (import.meta.env.PUBLIC_ASSETS_PATH as string | undefined) ?? ''

  const normalizeIcon = (icon: string) =>
    icon?.startsWith('devicon-') ? icon.slice(8) : (icon ?? '')

  const state = reactive({
    name: props.data.name ?? '',
    weight: props.data.weight ?? 0,
    url: props.data.url ?? '',
    git: props.data.git ?? '',
    resources: (props.data.resources ?? []).map((r) => ({
      name: r.name ?? '',
      icon: normalizeIcon(r.icon ?? '')
    })),
    description: props.data.description ?? '',
    slug: props.data.slug ?? '',
    logo: props.data.logo ?? '',
    images: [...(props.data.images ?? [])],
    grayscale: props.data.grayscale ?? false
  })

  const buttonText = props.id ? 'Update' : 'Add'

  const addResource = () => {
    state.resources.push({ name: '', icon: '' })
  }

  const removeResource = (index: number) => {
    state.resources.splice(index, 1)
  }

  const optionalUrl = v.union([
    v.literal(''),
    v.pipe(v.string(), v.url('Invalid URL format'))
  ])

  // Form validation
  const schema = v.object({
    name: v.pipe(v.string(), v.nonEmpty('Name is required')),
    weight: v.pipe(v.number()),
    url: v.optional(optionalUrl),
    git: v.optional(optionalUrl),
    description: v.pipe(v.string(), v.nonEmpty('Please enter a description')),
    resources: v.optional(
      v.array(
        v.object({
          name: v.pipe(v.string(), v.nonEmpty('Resource name is required')),
          icon: v.pipe(v.string(), v.nonEmpty('Resource icon is required'))
        })
      )
    )
  })

  function removeGalleryImage(index: number) {
    state.images.splice(index, 1)
  }

  async function persistWorkRecord(
    payload: Record<string, unknown>
  ): Promise<boolean> {
    const method = props.id ? 'PATCH' : 'POST'
    const body = props.id ? { id: props.id, ...payload } : payload

    try {
      const response = await fetch(`/api/admin/work`, {
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
          description: errorData.error || 'Failed to save work.',
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

  const onSubmit = async () => {
    if (submitting.value) return
    submitting.value = true

    try {
      const keySlug =
        props.id && props.data.slug ? props.data.slug : slugify(state.name)

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
        weight: state.weight,
        url: state.url,
        git: state.git,
        resources: state.resources,
        description: state.description,
        slug: keySlug,
        logo: logoFilename,
        images: mergedImages,
        grayscale: state.grayscale,
        ...(props.id
          ? { updated: new Date().toISOString() }
          : { created: new Date().toISOString() })
      }

      const saved = await persistWorkRecord(payload)
      if (!saved) return

      const toDelete = lastSavedImages.value.filter(
        (p) => !mergedImages.includes(p)
      )
      if (toDelete.length > 0) {
        try {
          await deleteKeys(toDelete)
        } catch (e) {
          toast.add({
            title: 'Warning',
            description:
              (e as Error).message ||
              'Work saved, but some files could not be removed from storage.',
            color: 'warning'
          })
        }
      }

      lastSavedImages.value = [...mergedImages]
      state.images = [...mergedImages]
      galleryFiles.value = []

      toast.add({
        title: 'Success',
        description: props.id
          ? 'Work record has been updated.'
          : 'Work record has been added.',
        color: 'success'
      })

      if (!props.id) {
        window.location.href = '/admin/work?toast=work-created'
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
  <UForm :schema="schema" :state="state" class="space-y-8" @submit="onSubmit">
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
      <!-- Main content -->
      <div class="space-y-8">
        <!-- Basic info -->
        <section class="space-y-4">
          <h2 class="text-lg font-semibold text-default">Basic info</h2>
          <div class="grid sm:flex gap-4">
            <UFormField
              label="Name"
              name="name"
              class="w-full sm:w-4/5"
              required
            >
              <UInput
                v-model="state.name"
                type="text"
                size="xl"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Weight"
              name="weight"
              class="w-full sm:w-1/5"
              required
            >
              <UInputNumber
                v-model="state.weight"
                type="number"
                size="xl"
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField
            v-if="state.slug"
            label="Slug"
            name="slug"
            description="Used for asset paths; set when this record was created."
          >
            <UInput
              :model-value="state.slug"
              type="text"
              size="md"
              class="w-full max-w-md"
              disabled
              readonly
            />
          </UFormField>
        </section>

        <!-- Links -->
        <section class="space-y-4">
          <h2 class="text-lg font-semibold text-default">Links</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Project URL" name="url">
              <UInput
                v-model="state.url"
                type="text"
                size="xl"
                class="w-full"
                placeholder="https://"
              />
            </UFormField>
            <UFormField label="GitHub" name="git">
              <UInput
                v-model="state.git"
                type="text"
                size="xl"
                class="w-full"
                placeholder="https://github.com/..."
              />
            </UFormField>
          </div>
        </section>

        <!-- Description -->
        <section class="space-y-4">
          <h2 class="text-lg font-semibold text-default">Description</h2>
          <UFormField name="description">
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
        </section>

        <!-- Assets -->
        <section class="space-y-4">
          <h2 class="text-lg font-bold text-default pb-4 border-b border-muted">
            Images
          </h2>

          <UFormField label="Logo" name="logoFile">
            <div v-if="logoObjectUrl || state.logo" class="space-y-2 mb-4">
              <p
                v-if="!logoObjectUrl && state.logo && !assetsBase"
                class="text-xs text-muted"
              >
                Set <code class="text-xs">PUBLIC_ASSETS_PATH</code> to preview
                the saved logo, or select a new file below.
              </p>
              <div
                class="relative flex size-32 max-w-full items-center justify-center overflow-hidden rounded-lg border border-default bg-muted"
              >
                <img
                  v-if="logoObjectUrl"
                  :src="logoObjectUrl"
                  alt="New logo preview"
                  class="max-h-full max-w-full object-contain"
                />
                <img
                  v-else-if="assetsBase && state.logo"
                  :src="`${assetsBase}/logos/${state.logo}`"
                  alt="Current logo"
                  class="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
                <span v-else class="px-2 text-center text-xs text-muted">
                  {{ state.logo }}
                </span>
                <UButton
                  v-if="logoObjectUrl"
                  type="button"
                  color="neutral"
                  variant="solid"
                  size="xs"
                  icon="i-lucide-x"
                  class="absolute end-1 top-1 shadow-sm"
                  aria-label="Clear new logo selection"
                  @click="clearPendingLogo()"
                />
              </div>
            </div>

            <UFileUpload
              v-model="logoFile"
              accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
              icon="i-lucide-image"
              label="Drop logo here"
              description="WebP, SVG, PNG, or JPG (max. 2MB)"
              layout="list"
              :interactive="false"
              class="w-full max-w-md min-h-40"
            >
              <template #actions="{ open }">
                <UButton
                  label="Select logo"
                  icon="i-lucide-upload"
                  color="neutral"
                  variant="outline"
                  @click="open()"
                />
              </template>
            </UFileUpload>
          </UFormField>

          <UFormField name="grayscale" class="flex items-center gap-2">
            <label class="flex items-center gap-2 cursor-pointer text-default">
              <input
                v-model="state.grayscale"
                type="checkbox"
                class="rounded border-default size-4"
              />
              <span>Grayscale logo</span>
            </label>
          </UFormField>

          <UFormField label="Gallery" name="images">
            <div v-if="state.images.length" class="space-y-2 mb-4">
              <p v-if="!assetsBase" class="text-xs text-muted">
                Set <code class="text-xs">PUBLIC_ASSETS_PATH</code> to preview
                thumbnails.
              </p>
              <ul
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 list-none p-0 m-0"
              >
                <li
                  v-for="(imgPath, index) in state.images"
                  :key="`${imgPath}-${index}`"
                  class="relative aspect-square rounded-lg border border-default overflow-hidden bg-muted"
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
                    class="flex items-center justify-center size-full text-xs text-muted p-2 text-center"
                  >
                    {{ imgPath.split('/').pop() }}
                  </div>
                  <UButton
                    type="button"
                    color="neutral"
                    variant="solid"
                    size="xs"
                    icon="i-lucide-trash-2"
                    class="absolute end-1 top-1 shadow-sm"
                    :aria-label="`Remove gallery image ${index + 1}`"
                    @click="removeGalleryImage(index)"
                  />
                </li>
              </ul>
            </div>

            <p class="text-sm font-medium text-default mb-2">Add images</p>
            <UFileUpload
              v-model="galleryFiles"
              accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
              icon="i-lucide-images"
              label="Drop new gallery images here"
              description="WebP, SVG, PNG, or JPG (max. 2MB each). Appended on save."
              layout="list"
              multiple
              :interactive="false"
              class="w-full max-w-md min-h-48"
            >
              <template #actions="{ open }">
                <UButton
                  label="Select images"
                  icon="i-lucide-upload"
                  color="neutral"
                  variant="outline"
                  @click="open()"
                />
              </template>

              <template #files-bottom="{ removeFile, files }">
                <UButton
                  v-if="files?.length"
                  label="Remove all files"
                  color="neutral"
                  @click="removeFile()"
                />
              </template>
            </UFileUpload>
          </UFormField>
        </section>
      </div>

      <!-- Right rail: Tech stack -->
      <aside
        class="lg:sticky lg:top-6 rounded-lg p-6 bg-gray-100 dark:bg-gray-800"
      >
        <section class="space-y-4">
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-lg font-semibold text-default">Tech stack</h2>
            <UButton
              to="https://devicon.dev"
              target="_blank"
              color="neutral"
              variant="ghost"
              size="xs"
              trailing-icon="i-lucide-arrow-up-right"
            >
              DevIcons
            </UButton>
          </div>
          <UFormField name="resources" class="w-full">
            <div class="space-y-3">
              <div
                v-for="(resource, index) in state.resources"
                :key="index"
                class="flex flex-col sm:flex-row gap-2 sm:gap-2"
              >
                <UFormField
                  :name="`resources.${index}.name`"
                  class="flex-1 min-w-0"
                >
                  <UInput
                    v-model="resource.name"
                    placeholder="Vue"
                    size="md"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  :name="`resources.${index}.icon`"
                  class="flex-1 min-w-0"
                >
                  <UInput
                    v-model="resource.icon"
                    placeholder="vue-original"
                    size="md"
                    class="w-full"
                  />
                </UFormField>
                <div class="flex items-center shrink-0">
                  <UButton
                    type="button"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-circle-x"
                    class="text-red-500"
                    :aria-label="`Remove resource ${index + 1}`"
                    @click="removeResource(index)"
                  />
                </div>
              </div>
              <UButton
                type="button"
                color="secondary"
                variant="outline"
                trailing-icon="i-lucide-circle-plus"
                size="sm"
                class="flex justify-center w-full"
                @click="addResource"
              >
                Add resource
              </UButton>
            </div>
          </UFormField>
        </section>
      </aside>
    </div>

    <UButton
      type="submit"
      size="xl"
      :loading="submitting"
      :disabled="submitting"
    >
      {{ buttonText }}
    </UButton>
  </UForm>
</template>
