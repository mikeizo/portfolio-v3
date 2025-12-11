<script setup lang="ts">
  import menuItems from '@/assets/api/menu.json'

  const props = defineProps<{
    path: string
  }>()

  const siteUrl = import.meta.env.SITE_URL ?? ''

  const isActive = (url: string) => props.path.replace('/', '') === url

  defineOptions({ name: 'Nav' })
</script>

<template>
  <nav class="nav">
    <ul class="nav__menu">
      <li
        v-for="(item, index) in menuItems"
        :key="item.title"
        class="nav__link"
        :class="{ 'nav__link--active': isActive(item.url) }"
        :aria-label="item.title"
      >
        <a :href="`${siteUrl}/${item.url}`">{{ item.title }}</a>
      </li>
    </ul>
  </nav>
</template>
