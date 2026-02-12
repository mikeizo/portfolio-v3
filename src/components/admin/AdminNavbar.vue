<script setup lang="ts">
  import type { DropdownMenuItem } from '@nuxt/ui'
  import { ref } from 'vue'
  import { useColorMode } from '@vueuse/core'

  const colorMode = useColorMode()

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
      <UColorModeSwitch />
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
