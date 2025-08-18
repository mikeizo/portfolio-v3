<script setup lang="ts">
  const year = new Date().getFullYear()

  defineOptions({ name: 'Footer' })
</script>

<template>
  <div class="wrapper">
    <footer class="footer">
      © {{ year }} All Rights Reserved. Created by Mike Tropea
    </footer>
  </div>
</template>
