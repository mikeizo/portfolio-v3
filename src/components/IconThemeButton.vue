<script setup lang="ts">
  import { $isLightTheme, toggleTheme } from '@/stores/theme'
  import { computed, onMounted, ref } from 'vue'
  import { Moon, Sun } from 'lucide'
  import { type MorphHandle, MorphIcon } from 'morphicons/vue'
  import { ThemeType } from '@/types/portfolio.d'
  import { useStore } from '@nanostores/vue'

  const isLightTheme = useStore($isLightTheme)
  const morph = ref<MorphHandle | null>(null)

  // Show the theme the button switches to
  const icon = computed(() => (isLightTheme.value ? Moon : Sun))
  const ariaLabel = computed(
    () => `Switch to ${isLightTheme.value ? ThemeType.Dark : ThemeType.Light} theme`
  )

  onMounted(() => {
    const theme = document.documentElement.getAttribute('data-theme')

    if (theme === ThemeType.Light) {
      // Jump before syncing the store so the icon doesn't morph on load
      morph.value?.set(Moon)
      $isLightTheme.set(true)
    }
  })

  defineOptions({
    name: 'IconThemeButton'
  })
</script>

<template>
  <button
    class="header__theme-btn"
    :aria-label="ariaLabel"
    @click="toggleTheme"
  >
    <MorphIcon
      ref="morph"
      class="icon icon--theme"
      :icon="icon"
      :size="20"
      spring="smooth"
      reduced-motion="user"
    />
  </button>
</template>
