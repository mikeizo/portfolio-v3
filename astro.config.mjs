import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import { readFileSync } from 'node:fs'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'
import vue from '@astrojs/vue'

const env = loadEnv(process.env, process.cwd(), '')
const site = env.SITE_URL || 'https://miketropea.com'

// sanitize-html is CJS and requires the ESM-only htmlparser2@12. Vercel runs
// functions with --no-experimental-require-module, and its file tracer misses
// the require() calls left in bundled CJS, so bundle sanitize-html together
// with its whole dependency tree. Reads package.json straight from
// node_modules (htmlparser2's exports map hides it); a missing package throws
// and fails the build. Remove once either side changes.
const dependencyTree = (name, seen = new Set()) => {
  if (seen.has(name)) return seen
  seen.add(name)
  const pkg = JSON.parse(
    readFileSync(new URL(`./node_modules/${name}/package.json`, import.meta.url), 'utf8')
  )
  for (const dep of Object.keys(pkg.dependencies ?? {})) dependencyTree(dep, seen)
  return seen
}

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
    plugins: [
      tailwindcss(),
      // Build-only: dev's module runner can't execute bundled CJS, and Node
      // handles require(esm) natively there.
      {
        name: 'bundle-sanitize-html',
        apply: 'build',
        config: () => ({
          ssr: { noExternal: [...dependencyTree('sanitize-html')] }
        })
      }
    ]
  }
})
