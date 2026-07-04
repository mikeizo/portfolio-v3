<script setup lang="ts">
  // :selected mirrors :value because SSR can't serialize a select's value —
  // without it the first enabled option shows until the island hydrates.
  defineProps<{
    modelValue: string
    label: string
    name: string
    options: { label: string; value: string }[]
    placeholder?: string
    error?: string
  }>()

  defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div>
    <label
      :for="name"
      class="mb-2 block text-sm text-muted"
    >
      {{ label }}
    </label>
    <select
      :id="name"
      :name="name"
      :value="modelValue"
      class="w-full rounded-md border bg-field px-3 py-2 text-base text-ink outline-none transition-colors focus:border-accent"
      :class="error ? 'border-danger' : 'border-hairline-input'"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option
        v-if="placeholder"
        value=""
        disabled
        :selected="modelValue === ''"
      >
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :selected="option.value === modelValue"
      >
        {{ option.label }}
      </option>
    </select>
    <p
      v-if="error"
      class="mt-1 text-xs text-danger"
    >
      {{ error }}
    </p>
  </div>
</template>
