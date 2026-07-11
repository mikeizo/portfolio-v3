import { describe, expect, it } from 'vitest'
import { Settings } from '@/models/Settings'
import { validationError } from './helpers'
import { validSettings } from '../fixtures'

describe('Settings schema validation', () => {
  it('accepts a valid document', async () => {
    expect(await validationError(new Settings(validSettings))).toBeNull()
  })

  it('enforces the 25-character title limit', async () => {
    const err = await validationError(new Settings({ ...validSettings, title: 'x'.repeat(26) }))

    expect(err?.errors.title).toBeDefined()
  })

  it('rejects malformed email and non-http(s) git url', async () => {
    const badEmail = await validationError(new Settings({ ...validSettings, email: 'nope' }))
    const badGit = await validationError(new Settings({ ...validSettings, git: 'github.com/x' }))

    expect(badEmail?.errors.email).toBeDefined()
    expect(badGit?.errors.git).toBeDefined()
  })

  it('throws StrictModeError for unknown fields', () => {
    expect(() => new Settings({ ...validSettings, bogus: 'field' })).toThrow(/strict/i)
  })

  it('sanitizes the about field in the pre-validate hook', async () => {
    const doc = new Settings({ ...validSettings, about: '<script>bad()</script><p>ok</p>' })

    await doc.validate()

    expect(doc.about).toBe('<p>ok</p>')
  })
})
