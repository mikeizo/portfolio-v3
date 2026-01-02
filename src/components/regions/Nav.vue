<script setup lang="ts">
  import type { MenuItemsType } from '@/types/portfolio.d'

  const props = defineProps<{
    site: string
    path: string
    menuItems: MenuItemsType
  }>()

  const isActive = (pathName: string) => props.path === pathName

  defineOptions({
    name: 'Nav'
  })
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
        <a :href="`${site}/${item.url}`">{{ item.title }}</a>
      </li>
    </ul>
  </nav>
</template>
