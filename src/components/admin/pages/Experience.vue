<script setup lang="ts">
  import type { ExperienceType } from '@/types/portfolio'

  import 'devicon'
  import * as v from 'valibot'
  import { ArrowUpRight, CirclePlus, CircleX, Pencil, Save } from 'lucide-vue-next'
  import { reactive, ref } from 'vue'
  import { addToast } from '@/stores/toasts'
  import { experienceSchema } from '@/utils/formSchema'
  import { useConfirmDelete } from '@/composables/useConfirmDelete'
  import { useCurrentUser } from '@/composables/useCurrentUser'

  import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
  import TextField from '@/components/admin/form/TextField.vue'

  const { isGuest } = useCurrentUser()

  const props = defineProps<{ data: ExperienceType[] }>()

  const experiences = ref<ExperienceType[]>([...props.data])
  const editIndex = ref<number | null>(null)
  const state = reactive({ icon: '', name: '' })
  const errors = reactive<Record<string, string>>({})
  const status = ref<'idle' | 'saving'>('idle')

  const {
    isOpen: confirmOpen,
    loading: deleting,
    request: requestDelete,
    confirm: confirmDelete,
    cancel: cancelDelete
  } = useConfirmDelete<{ id: string; name: string }>((t) => deleteIcon(t.id, t.name))

  const sortByName = () => experiences.value.sort((a, b) => a.name.localeCompare(b.name))

  // Add a new experience icon
  async function addIcon() {
    if (isGuest.value || status.value === 'saving') return

    for (const key in errors) delete errors[key]
    const result = v.safeParse(experienceSchema, state)
    if (!result.success) {
      const nested = v.flatten(result.issues).nested ?? {}
      for (const field in nested) errors[field] = nested[field]![0]
      return
    }

    status.value = 'saving'
    try {
      const response = await fetch('/api/admin/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icon: state.icon, name: state.name })
      })
      const body = await response.json().catch(() => ({}))

      if (response.ok) {
        experiences.value.push(body)
        sortByName()
        addToast({
          type: 'success',
          title: 'Added',
          description: `${state.name} has been added.`
        })
        state.icon = ''
        state.name = ''
      } else {
        addToast({
          type: 'error',
          title: 'Add failed',
          description: body.error || 'Failed to add experience.'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Add failed',
        description: (error as Error).message || 'An unexpected error occurred.'
      })
    } finally {
      status.value = 'idle'
    }
  }

  // Toggle inline name editing
  const editName = (index: number) => {
    editIndex.value = index
  }

  // Save an edited experience name
  async function updateName(id: string, name: string) {
    editIndex.value = null

    try {
      const response = await fetch('/api/admin/experience', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name })
      })
      const body = await response.json().catch(() => ({}))

      addToast(
        response.ok
          ? {
              type: 'success',
              title: 'Updated',
              description: `${name} has been updated.`
            }
          : {
              type: 'error',
              title: 'Update failed',
              description: body.error || 'Failed to update experience.'
            }
      )
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update failed',
        description: (error as Error).message || 'An unexpected error occurred.'
      })
    }
  }

  // Delete an experience icon
  async function deleteIcon(id: string, name: string) {
    try {
      const response = await fetch('/api/admin/experience', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const body = await response.json().catch(() => ({}))

      if (response.ok) {
        experiences.value = experiences.value.filter((e) => e._id !== id)
        addToast({
          type: 'success',
          title: 'Deleted',
          description: `${name} has been deleted.`
        })
      } else {
        addToast({
          type: 'error',
          title: 'Delete failed',
          description: body.error || 'Failed to delete experience.'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Delete failed',
        description: (error as Error).message || 'An unexpected error occurred.'
      })
    }
  }
</script>

<template>
  <h1 class="text-4xl font-light text-ink">Experience</h1>
  <p class="mt-2 mb-7 text-base text-muted">Manage the technologies shown on your profile.</p>

  <form
    class="max-w-2xl space-y-4"
    @submit.prevent="addIcon"
  >
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-7 sm:items-start">
      <TextField
        v-model="state.icon"
        class="sm:col-span-3"
        label="Icon"
        name="icon"
        placeholder="devicon-android-plain"
        :error="errors.icon"
      />
      <TextField
        v-model="state.name"
        class="sm:col-span-3"
        label="Name"
        name="name"
        placeholder="Android"
        :error="errors.name"
      />
      <button
        type="submit"
        :disabled="isGuest || status === 'saving'"
        class="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-base font-normal text-on-accent transition-colors hover:bg-accent-deep active:bg-accent-press disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-1 sm:mt-6"
      >
        Add
        <CirclePlus :size="16" />
      </button>
    </div>

    <a
      href="https://devicon.dev"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 rounded-md border border-hairline-strong px-4 py-2 text-base text-ink transition-colors hover:bg-row-hover"
    >
      DevIcons
      <ArrowUpRight :size="16" />
    </a>
  </form>

  <hr class="my-8 border-hairline" />

  <div class="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
    <div
      v-for="(experience, index) in experiences"
      :key="`${experience.icon}-${index}`"
      class="flex flex-col justify-between gap-4 rounded-lg border border-hairline bg-surface p-6 text-center shadow-card"
    >
      <i
        :class="experience.icon.toLowerCase()"
        class="text-6xl text-ink"
      />

      <input
        v-if="editIndex === index"
        v-model="experience.name"
        class="w-full rounded-md border border-hairline-input bg-field px-3 py-2 text-center text-base text-ink outline-none transition-colors focus:border-accent"
      />
      <p
        v-else
        class="text-base text-ink"
      >
        {{ experience.name }}
      </p>

      <div
        v-if="!isGuest"
        class="flex justify-center gap-6"
      >
        <button
          v-if="editIndex === index"
          type="button"
          title="Save"
          class="text-success transition-opacity hover:opacity-70"
          @click="updateName(experience._id ?? '', experience.name)"
        >
          <Save :size="18" />
        </button>
        <button
          v-else
          type="button"
          title="Edit"
          class="text-accent transition-opacity hover:opacity-70"
          @click="editName(index)"
        >
          <Pencil :size="18" />
        </button>
        <button
          type="button"
          title="Delete"
          class="text-danger transition-opacity hover:opacity-70"
          @click="requestDelete({ id: experience._id ?? '', name: experience.name })"
        >
          <CircleX :size="18" />
        </button>
      </div>
    </div>
  </div>

  <ConfirmDialog
    :open="confirmOpen"
    :loading="deleting"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />
</template>
