import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import vercel from '@astrojs/vercel'
import vue from '@astrojs/vue'

const env = loadEnv(process.env, process.cwd(), '')

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  devToolbar: {
    enabled: false
  },
  integrations: [vue()],
  server: {
    port: parseInt(env.PORT)
  },
  trailingSlash: 'never',
  vite: {
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  }
})
