import type { Query } from 'mongoose'

import sanitizeHtml from 'sanitize-html'

const DESCRIPTION_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'b', 'strong', 'em', 'i', 'h1', 'h2', 'h3', 'code', 'a', 'ul', 'ol', 'li'],
  allowedAttributes: {
    a: ['href', 'target', 'rel']
  },
  allowedSchemes: ['http', 'https', 'mailto']
}

export const sanitizeDescription = (html: string): string =>
  sanitizeHtml(html ?? '', DESCRIPTION_OPTIONS)

export const sanitizeDocFields = <T extends Record<string, unknown>>(
  doc: T,
  fields: readonly (keyof T & string)[]
) => {
  for (const field of fields) {
    const value = doc[field]

    if (typeof value === 'string') {
      ;(doc as Record<string, unknown>)[field] = sanitizeDescription(value)
    }
  }
}

export const sanitizeUpdateFields = (query: Query<unknown, unknown>, fields: readonly string[]) => {
  const update = query.getUpdate() as
    | (Record<string, unknown> & { $set?: Record<string, unknown> })
    | null

  if (!update) return

  for (const field of fields) {
    if (typeof update[field] === 'string') {
      update[field] = sanitizeDescription(update[field] as string)
    }

    if (update.$set && typeof update.$set[field] === 'string') {
      update.$set[field] = sanitizeDescription(update.$set[field] as string)
    }
  }
}
