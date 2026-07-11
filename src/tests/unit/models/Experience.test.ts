import { describe, expect, it } from 'vitest'
import { Experience } from '@/models/Experience'
import { validationError } from './helpers'
import { validExperience } from '../fixtures'

describe('Experience schema validation', () => {
  it('accepts a valid document', async () => {
    expect(await validationError(new Experience(validExperience))).toBeNull()
  })

  it('requires a name of at least 3 characters', async () => {
    expect(
      (await validationError(new Experience({ ...validExperience, name: '' })))?.errors.name
    ).toBeDefined()
    expect(
      (await validationError(new Experience({ ...validExperience, name: 'Vu' })))?.errors.name
    ).toBeDefined()
  })

  it('requires the icon to start with devicon-', async () => {
    const err = await validationError(new Experience({ ...validExperience, icon: 'vuejs-plain' }))

    expect(err?.errors.icon).toBeDefined()
  })

  it('throws StrictModeError for unknown fields', () => {
    expect(() => new Experience({ ...validExperience, bogus: 'field' })).toThrow(/strict/i)
  })
})
