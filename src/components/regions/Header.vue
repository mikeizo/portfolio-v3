<script setup lang="ts">
  import { ref, provide } from 'vue'
  import Nav from '@/components/regions/Nav.vue'
  import Logo from '@/components/Logo.vue'
  import Icon from '@/components/Icon.vue'
  import { useTheme } from '@/composables/useTheme.ts'
  import Contact from '@/components/Contact.vue'

  defineProps<{
    path: string
  }>()

  const isNavOpen = ref(false)
  const isContactOpen = ref(false)

  const openNav = () => (isNavOpen.value = !isNavOpen.value)

  const closeNav = () => (isNavOpen.value = false)

  const openContact = () => {
    isContactOpen.value = true
    closeNav()
  }

  const closeContact = () => (isContactOpen.value = false)

  provide('closeModal', closeContact)

  const { toggleTheme, theme } = useTheme()

  defineOptions({ name: 'Header' })
</script>

<template>
  <Contact :isOpen="isContactOpen" />
  <div v-if="isNavOpen" class="nav__mobile-backdrop" @click="openNav"></div>
  <header class="header wrapper sticky">
    <div class="header__content">
      <div class="header__logo logo">
        <a href="/" aria-label="Home Page">
          <Logo />
        </a>
      </div>

      <Nav :path="path" class="nav__desktop" />

      <div class="header__desktop">
        <button class="header__theme">
          <Icon :name="theme" :height="20" :width="20" @click="toggleTheme" />
        </button>
        <button class="nav__contact" aria-label="Contact" @click="openContact">
          Contact
        </button>
      </div>

      <div class="header__mobile">
        <div
          :class="{ 'header__mobile-nav--is-open': isNavOpen }"
          class="header__mobile-nav"
        >
          <Nav :path="path" class="nav__mobile" />
          <button
            class="nav__contact"
            aria-label="Contact Me"
            @click="openContact"
          >
            Contact
          </button>
        </div>

        <button
          class="header__theme"
          :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`"
        >
          <Icon :name="theme" :height="20" :width="20" @click="toggleTheme" />
        </button>
        <button
          class="header__burger"
          :aria-label="isNavOpen ? 'Close menu' : 'Open menu'"
          :aria-expanded="isNavOpen"
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
