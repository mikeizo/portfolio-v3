<script setup lang="ts">
  import AdminNavbar from '@/components/admin/AdminNavbar.vue'
  import AdminSidebar from '@/components/admin/AdminSidebar.vue'

  defineProps<{ isLogin?: boolean }>()
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
          <AdminNavbar />
        </template>
        <template #body>
          <slot />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UApp>
</template>
