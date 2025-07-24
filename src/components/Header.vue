<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import logoUrl from '@/assets/images/logo.svg'

  const isOpen = ref(false)

  const openNav = () => {
    isOpen.value = !isOpen.value
  }

  const showMenu = () => {
    if (window.innerWidth >= 768) {
      isOpen.value = true
    } else {
      isOpen.value = false
    }
  }

  onMounted(() => {
    showMenu()
    // Add a resize event listener to update isOpen based on window width
    window.addEventListener('resize', () => showMenu())
  })
</script>

<template>
  <header class="header">
    <div class="header__logo">
      <img :src="logoUrl.src" alt="Mike Tropea Logo" height="32" width="150" />
    </div>
    <div v-show="isOpen" class="header__nav">
      <nav class="header__nav-menu">
        <ul class="nav__menu">
          <li class="nav__link nav__link--active">
            <a href="/">Home</a>
          </li>
          <li class="nav__link">
            <a href="/work">Work</a>
          </li>
          <li class="nav__link">
            <a href="/about">About</a>
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
