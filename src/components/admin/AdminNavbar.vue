<script setup lang="ts">
  import type { AuthUser } from '@/types/portfolio'
  import type { BreadcrumbItem, DropdownMenuItem } from '@nuxt/ui'

  import { computed, onMounted, ref } from 'vue'
  import { ThemeType } from '@/types/portfolio.d'

  const props = defineProps<{ user?: AuthUser | null }>()

  const isDark = ref(false)
  const pathname = ref('')

  onMounted(() => {
    const colorScheme = localStorage.getItem('vueuse-color-scheme')

    if (colorScheme === 'auto') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark.value = colorScheme === ThemeType.Dark
    }

    document.documentElement.classList.toggle(ThemeType.Dark, isDark.value)
    pathname.value = window.location.pathname
  })

  const labelMap: Record<string, string> = {
    admin: 'Admin',
    about: 'About',
    work: 'Work',
    experience: 'Experience',
    settings: 'Settings',
    new: 'New'
  }

  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const segments = pathname.value.split('/').filter(Boolean)
    let path = ''

    return segments.map((segment, index) => {
      path += `/${segment}`
      const isLast = index === segments.length - 1
      const label =
        labelMap[segment] ??
        (/^[a-f\d]{24}$/i.test(segment)
          ? 'Edit'
          : segment.charAt(0).toUpperCase() + segment.slice(1))

      return { label, to: isLast ? undefined : path }
    })
  })

  async function logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    window.location.assign('/login')
  }

  const items = computed<DropdownMenuItem[][]>(() => {
    const groups: DropdownMenuItem[][] = []

    if (props.user?.email) {
      groups.push([
        {
          label: props.user.email,
          icon: 'i-lucide-user',
          disabled: true
        }
      ])
    }

    if (props.user?.role === 'admin') {
      groups.push([
        {
          label: 'User Settings',
          icon: 'i-lucide-cog',
          to: '/admin/settings'
        }
      ])
    }

    groups.push([
      {
        label: 'Logout',
        icon: 'i-lucide-log-out',
        onSelect: logout
      }
    ])

    return groups
  })
</script>

<template>
  <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <UColorModeSwitch v-model="isDark" />
      <UDropdownMenu :items="items">
        <UButton icon="i-lucide-user" size="md" class="rounded-full" />
      </UDropdownMenu>
    </template>
  </UDashboardNavbar>

  <UDashboardToolbar>
    <template #left>
      <UBreadcrumb :items="breadcrumbs" />
    </template>
  </UDashboardToolbar>
</template>
