import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import ui from '@nuxt/ui/vite'
import vercel from '@astrojs/vercel'
import vue from '@astrojs/vue'

const env = loadEnv(process.env, process.cwd(), '')

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  devToolbar: {
    enabled: false
  },
  integrations: [
    vue({
      appEntrypoint: '/src/app.ts',
      tailwindcss
    })
  ],
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
    plugins: [
      ui({
        router: false,
        ui: {
          colors: {
            primary: 'blue',
            neutral: 'slate'
          },
          table: {
            slots: {
              thead: 'bg-muted rounded-t-lg',
              th: 'text-sm text-elevated font-bold first:rounded-tl-lg last:rounded-tr-lg'
            }
          }
        }
      })
    ]
  }
})
