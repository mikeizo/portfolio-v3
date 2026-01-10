export type MenuType = {
  title: string
  url: string
}[]

export type SettingsType = {
  about: string
  title: string
  subtitle: string
  email: string
}[]

export type AboutType = {
  yearFrom: string
  yearTo?: string
  description: string
  image?: string
  updated?: string
}[]

export type ExperienceType = {
  name: string
  icon: string
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
  message: string | boolean
}

export enum ThemeType {
  Light = 'light',
  Dark = 'dark'
}

export type MenuItemsType = {
  title: string
  url: string
}[]

export type SortOptionsType = {
  sort: string
  order: -1 | 1
} | null

export type MetaDataType = {
  title: string
  description?: string
}
