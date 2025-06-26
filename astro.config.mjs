import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import vue from '@astrojs/vue'

const env = loadEnv(process.env, process.cwd(), '')

// https://astro.build/config
export default defineConfig({
  server: {
    port: parseInt(env.PORT)
  },
  integrations: [vue()]
})
