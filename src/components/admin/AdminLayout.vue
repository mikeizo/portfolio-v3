<script setup lang="ts">
  import type { AuthUser } from '@/types/portfolio'

  import { provide, readonly, ref } from 'vue'

  import AdminNavbar from '@/components/admin/AdminNavbar.vue'
  import AdminSidebar from '@/components/admin/AdminSidebar.vue'

  const props = defineProps<{
    isLogin?: boolean
    user?: AuthUser | null
  }>()

  const currentUser = ref<AuthUser | null>(props.user ?? null)
  provide('currentUser', readonly(currentUser))
</script>

<template>
  <UApp>
    <section v-if="isLogin">
      <slot />
    </section>
    <UDashboardGroup v-else unit="rem" storage="local">
      <AdminSidebar />
      <UDashboardPanel id="home">
        <template #header>
          <AdminNavbar :user="currentUser" />
        </template>
        <template #body>
          <slot />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UApp>
</template>
