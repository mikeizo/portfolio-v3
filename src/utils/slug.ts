/**
 * Produce a URL-safe slug for work items and S3 key prefixes.
 */
export function slugify(text: string): string {
  const s = text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return s || 'work'
}

export function fileExtension(filename: string): string {
  const base = filename.trim().split(/[/\\]/).pop() ?? ''
  const i = base.lastIndexOf('.')

  if (i <= 0 || i === base.length - 1) return 'webp'

  const ext = base.slice(i + 1).toLowerCase()

  return ext.replace(/[^a-z0-9]/g, '') || 'webp'
}

/**
 * Original upload basename (no path, no extension), slugified for S3 gallery keys.
 */
export function sanitizeImageFileStem(filename: string): string {
  const base = filename.trim().split(/[/\\]/).pop() ?? 'image'
  const i = base.lastIndexOf('.')
  const stem = i > 0 ? base.slice(0, i) : base
  const raw = stem.trim()
  const s = raw ? slugify(raw) : 'image'

  return s || 'image'
}
