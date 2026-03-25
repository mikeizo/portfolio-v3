<script setup lang="ts">
  import type { NavigationMenuItem } from '@nuxt/ui'
  import { ref } from 'vue'

  const open = ref(false)
  const basePath = '/admin'

  const links = [
    [
      // {
      //   label: 'Dashboard',
      //   icon: 'i-lucide-layout-dashboard',
      //   to: basePath,
      //   disabled: true,
      //   onSelect: () => {
      //     open.value = false
      //   }
      // },
      {
        label: 'Pages',
        icon: 'i-lucide-file-braces',
        defaultOpen: true,
        type: 'trigger',
        children: [
          {
            label: 'About',
            to: `${basePath}/about`,
            exact: true,
            onSelect: () => {
              open.value = false
            }
          },
          {
            label: 'Work',
            to: `${basePath}/work`,
            onSelect: () => {
              open.value = false
            }
          }
        ]
      },
      {
        label: 'Experience',
        icon: 'i-lucide-code-xml',
        to: `${basePath}/experience`,
        onSelect: () => {
          open.value = false
        }
      },
      {
        label: 'Settings',
        icon: 'i-lucide-settings',
        to: `${basePath}/settings`,
        onSelect: () => {
          open.value = false
        }
      }
    ],
    [
      {
        label: 'Site',
        icon: 'i-lucide-globe',
        to: '/',
        target: '_blank'
      }
    ]
  ] satisfies NavigationMenuItem[][]
</script>

<template>
  <UDashboardSidebar
    id="default"
    v-model:open="open"
    collapsible
    resizable
    class="bg-elevated/25"
    :ui="{ footer: 'lg:border-t lg:border-default' }"
  >
    <template #header="{ collapsed }">
      <div class="logo">Logo</div>
    </template>
    <template #default="{ collapsed }">
      <UNavigationMenu
        :collapsed="collapsed"
        :items="links[0]"
        orientation="vertical"
        tooltip
        popover
      />
      <UNavigationMenu
        :collapsed="collapsed"
        :items="links[1]"
        orientation="vertical"
        tooltip
        class="mt-auto"
      />
    </template>
    <template #footer="{ collapsed }">
      <!-- Footer Navigation -->
    </template>
  </UDashboardSidebar>
</template>
