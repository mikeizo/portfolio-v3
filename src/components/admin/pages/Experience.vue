<script setup lang="ts">
  import type { ExperienceType } from '@/types/portfolio'
  import type { FormSubmitEvent } from '@nuxt/ui'

  import 'devicon'
  import * as v from 'valibot'
  import { reactive, ref } from 'vue'
  import { getDataFeed } from '@/utils/api'

  const props = defineProps<{
    data: ExperienceType[]
  }>()

  const initialState = {
    icon: '',
    name: ''
  }
  const state = reactive({ ...initialState })
  const experiences = ref(props.data)

  const schema = v.object({
    name: v.pipe(v.string(), v.minLength(3, 'Must more than 3 characters')),
    icon: v.pipe(
      v.string(),
      v.startsWith('devicon-', 'Icon class must start with "devicon-"')
    )
  })

  type Schema = v.InferOutput<typeof schema>

  const toast = useToast()

  // Handle add icon
  async function insertIcon(event: FormSubmitEvent<Schema>) {
    try {
      const response = await fetch('/api/admin/experience', {
        method: 'POST',
        body: JSON.stringify(state)
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.add({
          title: 'Error',
          description: errorData.error || 'Failed to update settings.',
          color: 'red'
        })
        return
      }
    } catch (error) {
      toast.add({
        title: 'Error',
        description:
          (error as Error).message || 'An unexpected error occurred.',
        color: 'red'
      })
      return
    }

    // Update experience list
    experiences.value = await getDataFeed('experience', 'name', 'asc')

    toast.add({
      title: 'Success',
      description: `${state.name} has been added.`,
      color: 'success'
    })

    // Clear form
    Object.assign(state, initialState)
  }

  // Handle updating icon
  async function editName(id: string) {
    toast.add({
      title: 'Success',
      description: `The form has been updated.`,
      color: 'success'
    })
  }

  // Handle delete icon
  async function deleteIcon(id: string, name: string) {
    try {
      const response = await fetch('/api/admin/experience', {
        method: 'DELETE',
        body: JSON.stringify({ id })
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.add({
          title: 'Error',
          description: errorData.error || 'Failed to update settings.',
          color: 'red'
        })
        return
      }
    } catch (error) {
      toast.add({
        title: 'Error',
        description:
          (error as Error).message || 'An unexpected error occurred.',
        color: 'red'
      })
      return
    }

    // // Update experience list
    experiences.value = await getDataFeed('experience', 'name', 'asc')

    toast.add({
      title: 'Success',
      description: `${name} has been deleted`,
      color: 'success'
    })
  }
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="insertIcon">
    <div class="flex gap-4">
      <UFormField label="Icon" name="icon" class="w-1/2">
        <UInput v-model="state.icon" size="xl" class="w-full" />
      </UFormField>
      <UFormField label="Name" name="name" class="w-1/2">
        <UInput v-model="state.name" size="xl" class="w-full" />
      </UFormField>
    </div>
    <UButton type="submit">Add</UButton>
  </UForm>
  <hr class="border-default" />
  <UPageGrid
    class="grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8"
  >
    <div
      v-for="(experience, index) in experiences"
      :key="experience.icon"
      class="bg-gray-200 dark:bg-gray-800 rounded-lg p-6 text-center flex flex-col justify-between gap-4"
    >
      <i :class="[experience.icon.toLowerCase()]" class="text-[64px]" />
      <p>{{ experience.name }}</p>
      <div class="flex justify-center gap-8">
        <UIcon
          name="i-lucide-pencil"
          class="size-5 text-blue-500 cursor-pointer"
          @click="editName(experience?._id ?? '')"
        />
        <UIcon
          name="i-lucide-circle-x"
          class="size-5 text-red-500 cursor-pointer"
          @click="deleteIcon(experience?._id ?? '', experience.name)"
        />
      </div>
    </div>
  </UPageGrid>
</template>
