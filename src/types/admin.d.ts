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

export type DropdownItem = {
  type?: 'label' | 'separator' | 'link' | 'action'
  label?: string
  icon?: Component
  to?: string
  target?: string
  danger?: boolean
  onSelect?: () => void | Promise<void>
}
