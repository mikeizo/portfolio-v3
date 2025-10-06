<script setup lang="ts">
  const year = new Date().getFullYear()

  defineOptions({ name: 'Footer' })
</script>

<template>
  <footer class="footer">
    <div class="footer__content">
      <p>&copy; {{ year }} All Rights Reserved. Created by Mike Tropea</p>
    </div>
  </footer>
</template>
