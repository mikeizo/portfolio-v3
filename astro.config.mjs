import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import vue from '@astrojs/vue'

import vercel from '@astrojs/vercel';

const env = loadEnv(process.env, process.cwd(), '')

// https://astro.build/config
export default defineConfig({
  server: {
    port: parseInt(env.PORT)
  },

  integrations: [vue()],

  vite: {
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  },

  adapter: vercel()
})