import { ref, computed, onMounted } from 'vue'

const toggleMode = ref(true)

export function useTheme() {
  const theme = computed(() => (toggleMode.value ? 'light' : 'dark'))

  const toggleTheme = () => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme.value)
      localStorage.setItem('theme', theme.value)
    }

    toggleMode.value = !toggleMode.value
  }

  onMounted(() => {
    const savedValue = localStorage.getItem('theme')

    if (savedValue === 'light') {
      toggleMode.value = false
    }
  })

  return {
    theme,
    toggleTheme,
    toggleMode
  }
}
