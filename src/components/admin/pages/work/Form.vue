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
    description: props.data.description ?? ''
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

    <UButton type="submit" size="xl">{{ buttonText }}</UButton>
  </UForm>
</template>
