import { describe, expect, it } from 'vitest'
import { fileExtension, sanitizeImageFileStem, slugify } from '@/utils/slug'

describe('slugify', () => {
  it('lowercases, trims, and dashes whitespace', () => {
    expect(slugify('  My Portfolio Project ')).toBe('my-portfolio-project')
  })

  it('strips symbols that are not word characters', () => {
    expect(slugify('Hello, World! (v2)')).toBe('hello-world-v2')
  })

  it('collapses runs of spaces, underscores, and dashes into one dash', () => {
    expect(slugify('a _ b--c')).toBe('a-b-c')
  })

  it('strips leading and trailing dashes', () => {
    expect(slugify('--edge case--')).toBe('edge-case')
  })

  it('falls back to "work" when nothing survives', () => {
    expect(slugify('')).toBe('work')
    expect(slugify('!!!')).toBe('work')
  })
})

describe('fileExtension', () => {
  it('returns the lowercased extension of a plain filename', () => {
    expect(fileExtension('photo.JPG')).toBe('jpg')
  })

  it('uses only the basename of unix and windows paths', () => {
    expect(fileExtension('a/b/c.png')).toBe('png')
    expect(fileExtension('a\\b\\c.gif')).toBe('gif')
  })

  it('strips non-alphanumeric characters from the extension', () => {
    expect(fileExtension('shot.J-P_G')).toBe('jpg')
  })

  it('falls back to "webp" for dotfiles, missing, or trailing-dot extensions', () => {
    expect(fileExtension('.env')).toBe('webp')
    expect(fileExtension('noextension')).toBe('webp')
    expect(fileExtension('trailing.')).toBe('webp')
  })
})

describe('sanitizeImageFileStem', () => {
  it('slugifies the basename without its extension', () => {
    expect(sanitizeImageFileStem('My Photo.png')).toBe('my-photo')
    expect(sanitizeImageFileStem('path/to/Img_01.webp')).toBe('img-01')
  })

  it('falls back to "image" for an empty filename', () => {
    expect(sanitizeImageFileStem('')).toBe('image')
  })
})
