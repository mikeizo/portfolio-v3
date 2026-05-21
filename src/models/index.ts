import { About } from './About'
import { Experience } from './Experience'
import { Settings } from './Settings'
import { Work } from './Work'

export const writeModels = {
  settings: Settings,
  experience: Experience,
  about: About,
  work: Work
} as const

export type WritableCollection = keyof typeof writeModels
