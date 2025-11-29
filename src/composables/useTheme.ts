import { computed, onMounted, ref } from 'vue'

const isLightTheme = ref(true)

export function useTheme() {
  const theme = computed(() => (isLightTheme.value ? 'light' : 'dark'))

  const toggleTheme = () => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme.value)
      localStorage.setItem('theme', theme.value)
    }

    isLightTheme.value = !isLightTheme.value
  }

  onMounted(() => {
    const savedValue = localStorage.getItem('theme')

    if (savedValue === 'light') {
      isLightTheme.value = false
    }
  })

  return {
    theme,
    toggleTheme,
    isLightTheme
  }
}
