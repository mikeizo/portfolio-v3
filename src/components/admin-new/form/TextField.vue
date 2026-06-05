<script setup lang="ts">
  withDefaults(
    defineProps<{
      modelValue: string
      label: string
      name: string
      type?: string
      placeholder?: string
      error?: string
    }>(),
    { type: 'text' }
  )

  defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div>
    <label :for="name" class="mb-1.5 block text-[13px] text-muted">
      {{ label }}
    </label>
    <input
      :id="name"
      :name="name"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      class="w-full rounded-md border bg-field px-3 py-2 text-[15px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
      :class="error ? 'border-danger' : 'border-hairline-input'"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
    <p v-if="error" class="mt-1 text-[12px] text-danger">{{ error }}</p>
  </div>
</template>
