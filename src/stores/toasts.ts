import { atom } from 'nanostores'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
}

export const $toasts = atom<Toast[]>([])

export function addToast(toast: Omit<Toast, 'id'>) {
  const id = crypto.randomUUID()
  $toasts.set([...$toasts.get(), { ...toast, id }])
}

export function removeToast(id: string) {
  $toasts.set($toasts.get().filter((t) => t.id !== id))
}
