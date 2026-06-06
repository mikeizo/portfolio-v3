<script setup lang="ts">
  import type { AuthUser } from '@/types/portfolio'

  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { LogOut, Moon, PanelLeft, Settings, Sun } from 'lucide-vue-next'

  const props = defineProps<{
    title: string
    user?: AuthUser | null
  }>()

  defineEmits<{ toggleSidebar: []; toggleTheme: [] }>()

  const menuOpen = ref(false)

  const initials = computed(() => {
    const email = props.user?.email ?? ''
    return email.slice(0, 2).toUpperCase() || 'AD'
  })

  async function logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    window.location.assign('/login')
  }

  function closeMenu() {
    menuOpen.value = false
  }
  onMounted(() => document.addEventListener('click', closeMenu))
  onBeforeUnmount(() => document.removeEventListener('click', closeMenu))
</script>

<template>
  <header
    class="flex h-14 shrink-0 items-center gap-3 border-b border-hairline bg-bg px-6"
  >
    <button
      type="button"
      title="Collapse menu"
      class="inline-flex size-8 items-center justify-center rounded-md transition-colors bg-row-hover text-muted hover:text-ink cursor-pointer"
      @click="$emit('toggleSidebar')"
    >
      <PanelLeft :size="19" />
    </button>
    <div class="ml-auto flex items-center gap-2">
      <!-- theme pill toggle -->
      <button
        type="button"
        title="Toggle theme"
        class="relative inline-flex h-6 w-12 items-center rounded-pill border border-hairline bg-surface-2 transition-colors"
        @click="$emit('toggleTheme')"
      >
        <!-- Position + icon are driven by [data-theme] (set pre-paint by the inline
             script in AdminNew.astro) so the pill is correct on the first frame and
             only animates on an actual user toggle, never on reload. -->
        <span
          class="absolute left-1 flex size-5 items-center justify-center rounded-full bg-accent text-white transition-transform duration-200 dark:translate-x-5"
        >
          <Sun :size="12" class="dark:hidden" />
          <Moon :size="12" class="hidden dark:block" />
        </span>
      </button>

      <!-- avatar menu -->
      <div class="relative">
        <button
          type="button"
          class="inline-flex size-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-white"
          @click.stop="menuOpen = !menuOpen"
        >
          {{ initials }}
        </button>

        <div
          v-if="menuOpen"
          class="absolute right-0 top-13 z-40 min-w-50 rounded-lg border border-hairline bg-surface p-1.5 shadow-pop"
          @click.stop
        >
          <div class="mb-1 border-b border-hairline px-2.5 pb-2.5 pt-2">
            <div class="truncate text-sm text-ink">
              {{ user?.email ?? 'Admin' }}
            </div>
            <div class="text-xs capitalize text-muted">
              {{ user?.role ?? '' }}
            </div>
          </div>
          <a
            v-if="user?.role === 'admin'"
            href="/admin-new/settings"
            class="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-ink-secondary transition-colors hover:bg-row-hover hover:text-ink"
          >
            <Settings :size="16" class="text-muted" />
            User settings
          </a>
          <button
            type="button"
            class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-ink-secondary transition-colors hover:bg-row-hover hover:text-ink"
            @click="logout"
          >
            <LogOut :size="16" class="text-muted" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
