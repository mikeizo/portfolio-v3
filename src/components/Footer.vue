<script setup lang="ts">
  const year = new Date().getFullYear()

  defineOptions({ name: 'Footer' })
</script>

<template>
  <footer class="footer">
    &copy; {{ year }} All Rights Reserved. Created by Mike Tropea
  </footer>
</template>
