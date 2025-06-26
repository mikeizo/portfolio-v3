import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vuePlugin from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import astroPlugin from 'eslint-plugin-astro'
import astroParser from 'astro-eslint-parser'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  {
    ignores: ['.astro/', 'dist/', 'coverage/', 'build/', 'node_modules/']
  },
  // Global configuration
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        parser: tsParser
      }
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      'no-console': 'warn'
    }
  },
  // TypeScript
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json'
      }
    }
  },
  // Astro
  {
    plugins: {
      astro: astroPlugin
    },
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.astro']
      }
    },
    rules: {
      ...astroPlugin.configs.recommended.rules
    }
  },
  // Vue
  {
    plugins: {
      vue: vuePlugin
    },
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue']
      }
    },
    rules: {
      ...vuePlugin.configs.recommended.rules,
      'vue/multi-word-component-names': 'off'
    }
  },
  // Prettier
  prettierConfig
]
