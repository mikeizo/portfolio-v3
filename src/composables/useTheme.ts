import { computed, onMounted, ref } from 'vue'
import { ThemeType } from '@/types/portfolio.d'

const isLightTheme = ref(false)

export function useTheme() {
  const theme = computed(() => {
    return isLightTheme.value ? ThemeType.Light : ThemeType.Dark
  })

  const toggleTheme = () => {
    isLightTheme.value = !isLightTheme.value

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme.value)
      localStorage.setItem('theme', theme.value)
    }
  }

  onMounted(() => {
    const theme = document.documentElement.getAttribute('data-theme')

    if (theme === ThemeType.Light) {
      isLightTheme.value = true
    }
  })

  return {
    theme,
    toggleTheme,
    isLightTheme
  }
}
