<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import Logo from '@/components/Logo.vue'
  import Nav from '@/components/Nav.vue'
  import Icon from '@/components/Icon.vue'

  defineProps<{
    path: string
  }>()

  const isOpen = ref(false)
  const isSticky = ref(true)

  const openNav = () => {
    isOpen.value = !isOpen.value
  }

  const toggleTheme = () => {
    document.documentElement.setAttribute('data-theme', theme.value)
    localStorage.setItem('theme', theme.value)

    toggleMode.value = !toggleMode.value
  }

  const toggleMode = ref(true)
  const theme = computed(() => (toggleMode.value ? 'light' : 'dark'))

  onMounted(() => {
    const savedValue = localStorage.getItem('theme')

    if (savedValue === 'light') {
      toggleTheme()
    }
  })

  defineOptions({ name: 'Header' })
</script>

<template>
  <div v-show="isOpen" class="nav__mobile-backdrop" @click="openNav"></div>
  <header class="header wrapper" :class="{ sticky: isSticky }">
    <div class="header__content">
      <div class="header__logo">
        <a class="" href="/" aria-label="Home Page">
          <Logo />
        </a>
      </div>

      <Nav :path="path" class="nav__desktop" />

      <div class="header__desktop">
        <button class="header__theme">
          <Icon :name="theme" :height="20" :width="20" @click="toggleTheme" />
        </button>
        <button class="nav__contact" aria-label="Contact">Contact</button>
      </div>

      <div class="header__mobile">
        <div
          :class="{ 'header__mobile-nav--is-open': isOpen }"
          class="header__mobile-nav"
        >
          <Nav :path="path" class="nav__mobile" />
          <button class="nav__contact" aria-label="Contact">Contact</button>
        </div>

        <button class="header__theme">
          <Icon :name="theme" :height="20" :width="20" @click="toggleTheme" />
        </button>
        <button
          class="header__burger"
          aria-label="Toggle mobile menu"
          @click="openNav"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>
  </header>
</template>
