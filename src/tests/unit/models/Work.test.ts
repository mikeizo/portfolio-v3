import { describe, expect, it } from 'vitest'
import { validationError } from './helpers'
import { validWork } from '../fixtures'
import { Work } from '@/models/Work'

describe('Work schema validation', () => {
  it('accepts a valid document', async () => {
    expect(await validationError(new Work(validWork))).toBeNull()
  })

  it('requires name, description, and slug', async () => {
    const err = await validationError(new Work({ weight: 1 }))

    expect(err?.errors.name).toBeDefined()
    expect(err?.errors.description).toBeDefined()
    expect(err?.errors.slug).toBeDefined()
  })

  it('rejects slugs that are not lowercase-kebab', async () => {
    const err = await validationError(new Work({ ...validWork, slug: 'Bad Slug!' }))

    expect(err?.errors.slug).toBeDefined()
  })

  it('allows url and git to be empty but not non-http(s)', async () => {
    expect(await validationError(new Work({ ...validWork, url: '', git: '' }))).toBeNull()

    const err = await validationError(new Work({ ...validWork, url: 'ftp://files.example.com' }))

    expect(err?.errors.url).toBeDefined()
  })

  it('throws StrictModeError for unknown fields', () => {
    expect(() => new Work({ ...validWork, bogus: 'field' })).toThrow(/strict/i)
  })
})

describe('Work timestamps (pre-validate hook)', () => {
  it('sets created and updated on new documents, overwriting client values', async () => {
    const doc = new Work({ ...validWork, created: '1999-01-01', updated: '1999-01-01' })

    await doc.validate()

    expect(doc.created).not.toBe('1999-01-01')
    expect(doc.updated).not.toBe('1999-01-01')
    expect(new Date(doc.created).toISOString()).toBe(doc.created)
    expect(new Date(doc.updated).toISOString()).toBe(doc.updated)
  })
})

describe('Work sanitization (pre-validate hook)', () => {
  it('sanitizes description HTML', async () => {
    const doc = new Work({ ...validWork, description: '<script>bad()</script><p>ok</p>' })

    await doc.validate()

    expect(doc.description).toBe('<p>ok</p>')
  })

  it('fails required check when description is empty after sanitizing', async () => {
    const doc = new Work({ ...validWork, description: '<script>only()</script>' })
    const err = await validationError(doc)

    expect(err?.errors.description).toBeDefined()
  })
})
