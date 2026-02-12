<script setup lang="ts">
  import AdminNavbar from '@/components/admin/AdminNavbar.vue'
  import AdminSidebar from '@/components/admin/AdminSidebar.vue'
</script>

<template>
  <Suspense>
    <UApp>
      <UDashboardGroup unit="rem" storage="local">
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
  </Suspense>
</template>
