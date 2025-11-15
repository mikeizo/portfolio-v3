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
  images: string[]
  slug: string
  weight: number
  git?: string
  created: string
  updated?: string
}
