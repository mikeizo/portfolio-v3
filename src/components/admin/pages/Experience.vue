<script setup lang="ts">
  import type { ExperienceType } from '@/types/portfolio'

  import 'devicon'
  import * as v from 'valibot'
  import { reactive, ref } from 'vue'
  import { adminRequest } from '@/utils/request'
  import { getDataFeed } from '@/utils/api'

  const props = defineProps<{
    data: ExperienceType[]
  }>()

  const endpoint = 'experience'
  const initialState = {
    icon: '',
    name: ''
  }

  const state = reactive({ ...initialState })
  const experiences = ref(props.data)
  const editIndex = ref<number | null>(null)

  const schema = v.object({
    name: v.pipe(v.string(), v.minLength(3, 'Must more than 3 characters')),
    icon: v.pipe(
      v.string(),
      v.startsWith('devicon-', 'Icon class must start with "devicon-"')
    )
  })

  // Handle edit icon name
  const editName = (index: number) => {
    editIndex.value = index
  }

  // Handle add icon
  const insertIcon = async () => {
    const description = `${state.name} has been added.`

    adminRequest('POST', endpoint, state, description)

    // Update experience list
    experiences.value = await getDataFeed('experience', 'name', 'asc')

    // Clear form
    Object.assign(state, initialState)
  }

  // Handle update icon name
  const updateIconName = async (id: string, name: string) => {
    editIndex.value = null

    const description = `${name} has been updated.`

    adminRequest('PATCH', endpoint, { id, name }, description)
  }

  // Handle delete icon
  const deleteIcon = async (id: string, name: string) => {
    const description = `${name} has been deleted`

    adminRequest('DELETE', endpoint, { id }, description)

    // Update experience list
    experiences.value = await getDataFeed('experience', 'name', 'asc')
  }
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="insertIcon">
    <div class="grid grid-cols-1 sm:grid-cols-7 gap-4 items-start">
      <UFormField label="Icon" name="icon" class="sm:col-span-3">
        <UInput
          v-model="state.icon"
          size="xl"
          class="w-full"
          placeholder="devicon-android-plain"
        />
      </UFormField>
      <UFormField label="Name" name="name" class="sm:col-span-3">
        <UInput
          v-model="state.name"
          size="xl"
          class="w-full"
          placeholder="Android"
        />
      </UFormField>
      <UButton
        type="submit"
        class="flex items-center justify-center sm:mt-6 cursor-pointer"
        size="xl"
        trailing-icon="i-lucide-circle-plus"
      >
        Add
      </UButton>
    </div>
    <UButton
      class="cursor-pointer"
      to="https://devicon.dev"
      trailing-icon="i-lucide-arrow-up-right"
      color="neutral"
      variant="outline"
      target="_blank"
    >
      DevIcons
    </UButton>
  </UForm>

  <hr class="border-default" />
  <UPageGrid
    class="grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8"
  >
    <div
      v-for="(experience, index) in experiences"
      :key="`${experience.icon}-${index}`"
      class="bg-gray-200 dark:bg-gray-800 rounded-lg p-6 text-center flex flex-col justify-between gap-4"
    >
      <i :class="[experience.icon.toLowerCase()]" class="text-[64px]" />
      <UInput
        v-if="editIndex === index"
        v-model="experience.name"
        class="w-full"
      />
      <p v-else class="experience__name">{{ experience.name }}</p>
      <div class="flex justify-center gap-8">
        <UIcon
          v-if="editIndex === index"
          name="i-lucide-save"
          class="size-5 text-green-500 cursor-pointer"
          @click="updateIconName(experience?._id ?? '', experience.name)"
        />
        <UIcon
          v-else
          name="i-lucide-pencil"
          class="size-5 text-blue-500 cursor-pointer"
          @click="editName(index)"
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
