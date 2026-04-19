import type { DeepReadonly, Ref } from 'vue'
import type { AuthUser } from '@/types/portfolio'

import { computed, inject, ref } from 'vue'

const EMPTY: Ref<AuthUser | null> = ref(null)

export function useCurrentUser() {
  const user = inject<DeepReadonly<Ref<AuthUser | null>>>('currentUser', EMPTY)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isGuest = computed(() => user.value?.role === 'guest')

  return { user, isAdmin, isGuest }
}
