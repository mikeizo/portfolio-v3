<script setup lang="ts">
  import type { DropdownMenuItem } from '@nuxt/ui'

  import { onMounted, ref } from 'vue'
  import { ThemeType } from '@/types/portfolio.d'

  const isDark = ref(false)

  onMounted(() => {
    const colorScheme = localStorage.getItem('vueuse-color-scheme')

    if (colorScheme === 'auto') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark.value = colorScheme === ThemeType.Dark
    }

    document.documentElement.classList.toggle(ThemeType.Dark, isDark.value)
  })

  const items = [
    [
      {
        label: 'User Settings',
        icon: 'i-lucide-cog',
        to: '/inbox'
      }
    ],
    [
      {
        label: 'Logout',
        icon: 'i-lucide-log-out',
        to: '/customers'
      }
    ]
  ] satisfies DropdownMenuItem[][]
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
      <!-- Breadcrumbs -->
    </template>
  </UDashboardToolbar>
</template>
