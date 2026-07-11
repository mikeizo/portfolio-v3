/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config'
import { TEST_JWT_SECRET } from './src/tests/unit/fixtures'

export default getViteConfig({
  test: {
    include: ['src/tests/unit/**/*.test.ts'],
    environment: 'node',
    env: {
      AUTH_JWT_SECRET: TEST_JWT_SECRET,
      // Present only so mongodb.ts doesn't log missing-env errors at import;
      // no unit test ever opens a connection.
      MONGODB_URI: 'mongodb://127.0.0.1:27017',
      MONGODB_DB: 'unit-test'
    }
  }
})
