<script setup lang="ts">
  import menuItems from '@/assets/api/menu.json'

  const props = defineProps<{
    url: URL
  }>()

  const { origin, pathname: pathName } = props.url

  const isActive = (path: string) => pathName.replace('/', '') === path

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
        <a :href="`${origin}/${item.url}`">{{ item.title }}</a>
      </li>
    </ul>
  </nav>
</template>
