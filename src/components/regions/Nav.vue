<script setup lang="ts">
  import menuItems from '@/assets/api/menu.json'

  const props = defineProps<{
    siteUrl: string
    path: string
  }>()

  console.log('test path', props.path)

  const isActive = (url: string) => {
    console.log('test url', url)

    if (props.path === '/' && url === '') {
      return true
    }

    return props.path.includes(url) && url !== ''
  }

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
