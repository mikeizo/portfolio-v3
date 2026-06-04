<script setup lang="ts">
  import type { AuthUser } from '@/types/portfolio'

  import { computed, onMounted, provide, readonly, ref, watchEffect } from 'vue'
  import { useColorMode, usePreferredDark, useStorage } from '@vueuse/core'

  import Breadcrumb from '@/components/admin-new/Breadcrumb.vue'
  import Sidebar from '@/components/admin-new/Sidebar.vue'
  import Topbar from '@/components/admin-new/Topbar.vue'

  const props = defineProps<{
    isLogin?: boolean
    user?: AuthUser | null
    path: string
  }>()

  const currentUser = ref<AuthUser | null>(props.user ?? null)
  provide('currentUser', readonly(currentUser))

  // Theme for the admin-new shell: `auto` follows the OS until the user toggles
  // (then light/dark are stored). Persists as admin-new-color-scheme; sets
  // [data-theme] for admin-new.css. Pre-paint runs in AdminNew.astro.
  const mode = useColorMode({
    attribute: 'data-theme',
    storageKey: 'admin-new-color-scheme',
    initialValue: 'auto',
    disableTransition: false
  })

  const preferredDark = usePreferredDark()
  const isDark = computed(() =>
    mode.value === 'auto' ? preferredDark.value : mode.value === 'dark'
  )

  function toggleTheme() {
    mode.value = isDark.value ? 'light' : 'dark'
  }

  // Sidebar: rail (desktop) persisted, mobile off-canvas overlay.
  const rail = useStorage('admin-new-rail', false)
  const mobileOpen = ref(false)

  // The grid width is driven by [data-rail] on <html> (pre-painted by the inline
  // script in AdminNew.astro to avoid a reflow flash). Keep it in sync for live toggles.
  watchEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.rail = rail.value
        ? 'collapsed'
        : 'expanded'
    }
  })

  // Keep the grid's width transition off until the collapsed width has settled
  // post-hydration, so the rail doesn't animate closed on every reload. Enabled
  // for subsequent user toggles only.
  const transitionsReady = ref(false)

  function toggleSidebar() {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      rail.value = !rail.value
    } else {
      mobileOpen.value = !mobileOpen.value
    }
  }

  // Current route → drives nav active state, breadcrumb and page title.
  onMounted(() => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        transitionsReady.value = true
      })
    )
  })

  const labelMap: Record<string, string> = {
    'admin-new': 'Admin',
    about: 'About',
    work: 'Work',
    experience: 'Experience',
    settings: 'Settings',
    new: 'New'
  }

  function labelFor(segment: string) {
    return (
      labelMap[segment] ??
      (/^[a-f\d]{24}$/i.test(segment)
        ? 'Edit'
        : segment.charAt(0).toUpperCase() + segment.slice(1))
    )
  }

  const segments = props.path.split('/').filter(Boolean) ?? []
  const last = segments.at(-1)
  const pageTitle = last ? labelFor(last) : 'Admin'
</script>

<template>
  <section v-if="isLogin">
    <slot />
  </section>

  <div
    v-else
    class="h-screen overflow-hidden bg-bg lg:grid lg:grid-cols-[244px_1fr] rail:lg:grid-cols-[68px_1fr]"
    :class="
      transitionsReady &&
      'lg:transition-[grid-template-columns] lg:duration-200 lg:ease-out'
    "
  >
    <!-- backdrop for mobile overlay -->
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-30 bg-black/40 lg:hidden"
      @click="mobileOpen = false"
    />

    <Sidebar
      :mobileOpen="mobileOpen"
      :rail="rail"
      :pathname="path"
      @navigate="mobileOpen = false"
      @expand="rail = false"
    />

    <div class="flex h-screen min-w-0 flex-col">
      <Topbar
        :title="pageTitle"
        :user="currentUser"
        @toggle-sidebar="toggleSidebar"
        @toggle-theme="toggleTheme"
      />
      <Breadcrumb :segments="segments" :label-for="labelFor" />
      <div class="flex-1 overflow-y-auto">
        <div class="mx-auto px-10 pb-16 pt-8">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
