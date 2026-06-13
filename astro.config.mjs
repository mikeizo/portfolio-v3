import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'
import vue from '@astrojs/vue'

const env = loadEnv(process.env, process.cwd(), '')

// https://astro.build/config
export default defineConfig({
  adapter: vercel({
    isr: {
      expiration: 60 * 5,
      exclude: [/^\/api(\/|$)/, /^\/admin(\/|$)/, /^\/login(\/|$)/]
    }
  }),
  devToolbar: {
    enabled: false
  },
  integrations: [vue()],
  output: 'server',
  server: {
    port: parseInt(env.PORT)
  },
  trailingSlash: 'never',
  vite: {
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    plugins: [tailwindcss()]
  }
})
