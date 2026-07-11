import { describe, expect, it } from 'vitest'
import { About } from '@/models/About'
import { validAbout } from '../fixtures'
import { validationError } from './helpers'

describe('About schema validation', () => {
  it('accepts a valid document', async () => {
    expect(await validationError(new About(validAbout))).toBeNull()
  })

  it('requires yearFrom and description', async () => {
    const err = await validationError(new About({}))

    expect(err?.errors.yearFrom).toBeDefined()
    expect(err?.errors.description).toBeDefined()
  })

  it('throws StrictModeError for unknown fields', () => {
    expect(() => new About({ ...validAbout, bogus: 'field' })).toThrow(/strict/i)
  })

  it('sanitizes description HTML in the pre-validate hook', async () => {
    const doc = new About({ ...validAbout, description: '<script>bad()</script><p>ok</p>' })

    await doc.validate()

    expect(doc.description).toBe('<p>ok</p>')
  })
})
