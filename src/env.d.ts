/// <reference types="astro/client" />

import type { AuthUser } from '@/types/portfolio'

declare global {
  namespace App {
    interface Locals {
      user: AuthUser | null
    }
  }
}
