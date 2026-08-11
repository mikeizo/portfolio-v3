import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'
import vue from '@astrojs/vue'

const env = loadEnv(process.env, process.cwd(), '')
const site = env.SITE_URL || 'https://miketropea.com'

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
  integrations: [
    vue(),
    // Route discovery picks up the admin area and login too, which must stay
    // out of search results.
    sitemap({
      filter: (page) => !/^\/(admin|login)(\/|$)/.test(new URL(page).pathname)
    })
  ],
  output: 'server',
  server: {
    port: parseInt(env.PORT)
  },
  site,
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
