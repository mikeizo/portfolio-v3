<script setup lang="ts">
  import type { MenuType } from '@/types/portfolio'
  import { ref } from 'vue'
  import logoUrl from '/public/images/logo.svg'
  import menuItems from '@/assets/api/menu.json'

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
    <div class="header__logo">
      <img :src="logoUrl.src" alt="Mike Tropea Logo" height="32" width="150" />
    </div>
    <div :class="{ 'header__nav--is-open': isOpen }" class="header__nav">
      <nav class="header__nav-menu">
        <ul class="nav__menu">
          <li
            v-for="(item, index) in menuItems"
            :key="item.title"
            class="nav__link"
            :class="{ 'nav__link--active': isActive(item.url) }"
          >
            <a :href="item.url">{{ item.title }}</a>
          </li>
        </ul>
      </nav>
      <button class="nav__contact">Contact</button>
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
