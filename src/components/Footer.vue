<script setup lang="ts">
  const year = new Date().getFullYear()

  defineOptions({ name: 'Footer' })
</script>

<template>
  <div class="wrapper">
    <div class="footer">
      © {{ year }} All Rights Reserved. Created by Mike Tropea
    </div>
  </div>
</template>
