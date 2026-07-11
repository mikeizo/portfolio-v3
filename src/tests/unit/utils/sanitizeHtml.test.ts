import type { Query } from 'mongoose'

import { describe, expect, it } from 'vitest'
import { sanitizeDescription, sanitizeDocFields, sanitizeUpdateFields } from '@/utils/sanitizeHtml'

const asQuery = (update: unknown) =>
  ({ getUpdate: () => update }) as unknown as Query<unknown, unknown>

describe('sanitizeDescription', () => {
  it('removes script tags including their content', () => {
    expect(sanitizeDescription('<p>hi</p><script>alert(1)</script>')).toBe('<p>hi</p>')
  })

  it('removes disallowed elements like img entirely', () => {
    expect(sanitizeDescription('<img src="x" onerror="alert(1)">safe')).toBe('safe')
  })

  it('keeps the allowed formatting tags', () => {
    const html = '<h2>Title</h2><ul><li><strong>bold</strong> and <em>italic</em></li></ul>'

    expect(sanitizeDescription(html)).toBe(html)
  })

  it('strips disallowed attributes from allowed tags', () => {
    expect(sanitizeDescription('<p style="color:red" class="x" onclick="evil()">t</p>')).toBe(
      '<p>t</p>'
    )
  })

  it('keeps href, target, and rel on anchors but drops event handlers', () => {
    const html = '<a href="https://x.com" target="_blank" rel="noopener" onclick="evil()">l</a>'

    expect(sanitizeDescription(html)).toBe(
      '<a href="https://x.com" target="_blank" rel="noopener">l</a>'
    )
  })

  it('blocks javascript: hrefs but allows http, https, and mailto', () => {
    expect(sanitizeDescription('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>')
    expect(sanitizeDescription('<a href="http://x.com">x</a>')).toContain('href="http://x.com"')
    expect(sanitizeDescription('<a href="mailto:a@b.com">m</a>')).toContain('href="mailto:a@b.com"')
  })

  it('returns an empty string for empty input', () => {
    expect(sanitizeDescription('')).toBe('')
  })
})

describe('sanitizeDocFields', () => {
  it('sanitizes only the named string fields in place', () => {
    const doc = {
      description: '<script>bad()</script><p>ok</p>',
      name: '<b>untouched</b>',
      weight: 3
    }

    sanitizeDocFields(doc, ['description', 'weight'])

    expect(doc.description).toBe('<p>ok</p>')
    expect(doc.name).toBe('<b>untouched</b>')
    expect(doc.weight).toBe(3)
  })
})

describe('sanitizeUpdateFields', () => {
  it('sanitizes top-level update fields in place', () => {
    const update: Record<string, unknown> = {
      description: '<p onclick="x()">hi</p>',
      name: 'plain'
    }

    sanitizeUpdateFields(asQuery(update), ['description'])

    expect(update.description).toBe('<p>hi</p>')
    expect(update.name).toBe('plain')
  })

  it('sanitizes fields inside a $set operator', () => {
    const update = { $set: { description: '<script>bad()</script><em>ok</em>' } }

    sanitizeUpdateFields(asQuery(update), ['description'])

    expect(update.$set.description).toBe('<em>ok</em>')
  })

  it('handles both top-level and $set forms in the same update', () => {
    const update = {
      description: '<img src=x onerror=alert(1)>top',
      $set: { description: '<script></script>set' }
    }

    sanitizeUpdateFields(asQuery(update), ['description'])

    expect(update.description).toBe('top')
    expect(update.$set.description).toBe('set')
  })

  it('does nothing when the query has no update', () => {
    expect(() => sanitizeUpdateFields(asQuery(null), ['description'])).not.toThrow()
  })
})
