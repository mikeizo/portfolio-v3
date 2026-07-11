/**
 * Shared test data for the unit suite: the JWT secret injected by
 * vitest.config.ts, plus the canonical valid model/schema fixtures.
 */

/**
 * Single source for the unit-test JWT secret. It is injected as
 * AUTH_JWT_SECRET in vitest.config.ts and re-used by the auth/middleware
 * tests to sign and verify tokens, so both sides always agree.
 */
export const TEST_JWT_SECRET = 'unit-test-secret-at-least-32-bytes-long!!'

/**
 * Canonical valid fixtures shared by the model tests (Mongoose schema
 * validation) and the formSchema tests (valibot). Every value here satisfies
 * both layers; per-test variations are made with spread overrides so the
 * shared object is never mutated.
 */
export const validSettings = {
  title: 'Mike TEST',
  subtitle: 'Web Developer',
  email: 'mike@example.com',
  git: 'https://github.com/mikeizo',
  about: '<p>Hi</p>'
}

export const validExperience = {
  name: 'Vue',
  icon: 'devicon-vuejs-plain'
}

export const validAbout = {
  yearFrom: '2020',
  yearTo: '2023',
  description: '<p>Did things</p>',
  image: 'about/me.webp'
}

export const validLogin = {
  email: 'mike@example.com',
  password: 'hunter22'
}

export const validWork = {
  name: 'Portfolio',
  weight: 1,
  url: 'https://miketropea.com',
  git: '',
  resources: [{ name: 'Vue', icon: 'devicon-vuejs-plain' }],
  description: '<p>A site</p>',
  slug: 'portfolio',
  logo: '',
  images: ['work/portfolio/shot.webp'],
  grayscale: false
}
