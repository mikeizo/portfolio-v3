<script setup lang="ts">
  // import type { MenuType } from '@/types/portfolio'
  import { ref } from 'vue'
  import menuItems from '@/assets/api/menu.json'
  import Logo from '@/components/Logo.vue'

  const props = defineProps<{
    path: string
  }>()

  const isOpen = ref(false)

  const openNav = () => {
    isOpen.value = !isOpen.value
  }

  const isActive = (url: string) => {
    return props.path === url
  }

  defineOptions({ name: 'Header' })
</script>

<template>
  <header class="header">
    <a class="header__logo" href="/" aria-label="Home Page">
      <Logo />
    </a>
    <div :class="{ 'header__nav--is-open': isOpen }" class="header__nav">
      <nav class="header__nav-menu">
        <ul class="nav__menu">
          <li
            v-for="(item, index) in menuItems"
            :key="item.title"
            class="nav__link"
            :class="{ 'nav__link--active': isActive(item.url) }"
            :aria-label="item.title"
          >
            <a :href="item.url">{{ item.title }}</a>
          </li>
        </ul>
      </nav>
      <button class="nav__contact" aria-label="Contact">Contact</button>
    </div>
    <button
      class="header__burger"
      aria-label="Toggle mobile menu"
      @click="openNav"
    >
      <span />
      <span />
      <span />
    </button>
  </header>
</template>
