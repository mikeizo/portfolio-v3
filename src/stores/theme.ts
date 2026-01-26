import { atom, computed } from 'nanostores'
import { ThemeType } from '@/types/portfolio.d'

export const $isLightTheme = atom(false)

export const theme = computed($isLightTheme, (isLight) =>
  isLight ? ThemeType.Light : ThemeType.Dark
)

export const toggleTheme = () => {
  $isLightTheme.set(!$isLightTheme.value)
  const themeName = theme.get()

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', themeName)
    localStorage.setItem('theme', themeName)
  }
}
