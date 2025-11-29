<script setup lang="ts">
  import { provide, ref } from 'vue'
  import { useTheme } from '@/composables/useTheme.ts'

  import Contact from '@/components/Contact.vue'
  import Icon from '@/components/Icon.vue'
  import Logo from '@/components/Logo.vue'
  import Nav from '@/components/regions/Nav.vue'

  defineProps<{
    path: string
  }>()

  const isNavOpen = ref(false)
  const isContactOpen = ref(false)

  const toggleNav = () => (isNavOpen.value = !isNavOpen.value)

  const openContact = () => {
    isContactOpen.value = true
    isNavOpen.value = false
  }

  const closeContact = () => (isContactOpen.value = false)

  provide('closeModal', closeContact)

  const { toggleTheme, theme } = useTheme()

  defineOptions({ name: 'Header' })
</script>

<template>
  <Contact :isOpen="isContactOpen" />
  <div v-if="isNavOpen" class="nav__mobile-backdrop" @click="toggleNav"></div>
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
        <button
          class="nav__contact btn"
          aria-label="Contact"
          @click="openContact"
        >
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
            class="nav__contact btn btn--inverted"
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
          :class="{ 'header__burger--is-open': isNavOpen }"
          class="header__burger"
          :aria-label="isNavOpen ? 'Close menu' : 'Open menu'"
          :aria-expanded="isNavOpen"
          @click="toggleNav"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>
  </header>
</template>
