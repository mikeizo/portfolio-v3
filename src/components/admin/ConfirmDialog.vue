<script setup lang="ts">
  import { nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'
  import { LoaderCircle } from 'lucide-vue-next'

  const props = withDefaults(
    defineProps<{
      open: boolean
      loading?: boolean
      title?: string
      message?: string
      confirmLabel?: string
    }>(),
    {
      loading: false,
      title: 'Delete item?',
      message:
        'Are you sure you want to delete this item? This action cannot be undone.',
      confirmLabel: 'Delete'
    }
  )

  const emit = defineEmits<{ confirm: []; cancel: [] }>()

  const uid = useId()
  const cancelEl = ref<HTMLButtonElement | null>(null)

  // The dialog always starts closed, so its teleported content has nothing to
  // SSR. Gate the Teleport on a client-only flag: server and first hydration
  // render nothing into <body>, avoiding a Vue hydration mismatch where the
  // Transition's placeholder lands on Astro's injected island <style> tag.
  const mounted = ref(false)
  onMounted(() => {
    mounted.value = true
  })

  // Focus moves into the dialog on open and back to the trigger on close, so
  // keyboard users aren't dropped at <body> after dismissing.
  let restoreFocusEl: HTMLElement | null = null

  function dismiss() {
    if (!props.loading) emit('cancel')
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') dismiss()
  }

  watch(
    () => props.open,
    async (open) => {
      if (open) {
        restoreFocusEl = document.activeElement as HTMLElement | null
        document.addEventListener('keydown', onKeydown)
        await nextTick()
        cancelEl.value?.focus()
      } else {
        document.removeEventListener('keydown', onKeydown)
        restoreFocusEl?.focus()
        restoreFocusEl = null
      }
    }
  )

  onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <Transition name="confirm">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="dismiss"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="`${uid}-title`"
          :aria-describedby="`${uid}-message`"
          class="confirm__panel w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-pop"
        >
          <h2 :id="`${uid}-title`" class="text-lg font-medium text-ink">
            {{ title }}
          </h2>
          <p :id="`${uid}-message`" class="mt-2 text-sm text-muted">
            {{ message }}
          </p>

          <div class="mt-6 flex justify-end gap-3">
            <button
              ref="cancelEl"
              type="button"
              :disabled="loading"
              class="rounded-md border border-hairline-input px-4 py-2 text-sm text-ink transition-colors hover:bg-row-hover disabled:cursor-not-allowed disabled:opacity-50"
              @click="dismiss"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="loading"
              class="inline-flex items-center gap-2 rounded-md bg-danger px-4 py-2 text-sm text-on-accent transition-colors hover:bg-danger-deep disabled:cursor-not-allowed disabled:opacity-50"
              @click="emit('confirm')"
            >
              <LoaderCircle v-if="loading" :size="14" class="animate-spin" />
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .confirm-enter-active,
  .confirm-leave-active {
    transition: opacity 0.2s ease;
  }

  .confirm-enter-active .confirm__panel,
  .confirm-leave-active .confirm__panel {
    transition: transform 0.2s ease;
  }

  .confirm-enter-from,
  .confirm-leave-to {
    opacity: 0;
  }

  .confirm-enter-from .confirm__panel,
  .confirm-leave-to .confirm__panel {
    transform: scale(0.96);
  }
</style>
