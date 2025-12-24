export type MenuType = {
  title: string
  url: string
}[]

export type SettingsType = {
  about: string
  email: string
}[]

export type AboutType = {
  yearFrom: string
  yearTo?: string
  description: string
  image?: string
  updated?: string
}[]

export type WorkType = {
  name: string
  description: string
  resources: {
    name: string
    icon: string
  }[]
  url?: string
  logo: string
  grayscale?: boolean
  images: string[]
  slug: string
  weight: number
  git?: string
  created: string
  updated?: string
}

export type ContactType = {
  name: string
  email: string
  phone: string
  message: string
}

export type ContactErrorType = {
  isValid: boolean
  message: string | b
}

export enum ThemeType {
  Light = 'light',
  Dark = 'dark'
}

export type MenuItemsType = {
  title: string
  url: string
}[]
