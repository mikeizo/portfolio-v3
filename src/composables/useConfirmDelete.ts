import { computed, ref, type Ref } from 'vue'

/**
 * Drives a ConfirmDialog for a delete action. Holds the pending target until
 * the user confirms, runs `onDelete` with a loading flag, and clears on
 * settle. `target` is generic so callers can stash an id (Work/About) or a
 * richer object (Experience needs the name for its toast).
 *
 * Cancelling is ignored while a delete is in flight so the dialog can't be
 * dismissed mid-request.
 */
export function useConfirmDelete<T>(onDelete: (target: T) => Promise<void>) {
  const target = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const isOpen = computed(() => target.value !== null)

  function request(value: T) {
    target.value = value
  }

  function cancel() {
    if (!loading.value) target.value = null
  }

  async function confirm() {
    if (target.value === null) return

    loading.value = true
    try {
      await onDelete(target.value)
    } finally {
      loading.value = false
      target.value = null
    }
  }

  return { target, loading, isOpen, request, cancel, confirm }
}
