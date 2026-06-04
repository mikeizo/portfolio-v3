import type { Component } from 'vue'

export type NavLink = {
  label: string
  to: string
  icon: Component
}

export type NavGroup = {
  label: string
  icon: Component
  defaultOpen?: boolean
  children: { label: string; to: string }[]
}

export type NavItem = NavGroup | NavLink
