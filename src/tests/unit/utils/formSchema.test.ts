import * as v from 'valibot'
import {
  aboutSchema,
  experienceSchema,
  loginSchema,
  settingsSchema,
  workSchema
} from '@/utils/formSchema'
import { describe, expect, it } from 'vitest'
import { validAbout, validExperience, validLogin, validSettings, validWork } from '../fixtures'

describe('settingsSchema', () => {
  it('accepts a valid settings object', () => {
    expect(v.safeParse(settingsSchema, validSettings).success).toBe(true)
  })

  it('rejects an empty or over-long title', () => {
    expect(v.safeParse(settingsSchema, { ...validSettings, title: '' }).success).toBe(false)
    expect(v.safeParse(settingsSchema, { ...validSettings, title: 'x'.repeat(26) }).success).toBe(
      false
    )
  })

  it('rejects a malformed email or git url', () => {
    expect(v.safeParse(settingsSchema, { ...validSettings, email: 'nope' }).success).toBe(false)
    expect(v.safeParse(settingsSchema, { ...validSettings, git: 'not-a-url' }).success).toBe(false)
  })
})

describe('experienceSchema', () => {
  it('accepts a valid experience object', () => {
    expect(v.safeParse(experienceSchema, validExperience).success).toBe(true)
  })

  it('rejects names of 3 characters or fewer', () => {
    expect(v.safeParse(experienceSchema, { ...validExperience, name: 'Vu' }).success).toBe(false)
  })

  it('rejects icons without the devicon- prefix', () => {
    expect(v.safeParse(experienceSchema, { ...validExperience, icon: 'vuejs-plain' }).success).toBe(
      false
    )
  })
})

describe('aboutSchema', () => {
  it('accepts a valid about object, including empty yearTo', () => {
    expect(v.safeParse(aboutSchema, validAbout).success).toBe(true)
    expect(v.safeParse(aboutSchema, { ...validAbout, yearTo: '' }).success).toBe(true)
  })

  it('requires yearFrom and description', () => {
    expect(v.safeParse(aboutSchema, { ...validAbout, yearFrom: '' }).success).toBe(false)
    expect(v.safeParse(aboutSchema, { ...validAbout, description: '' }).success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(v.safeParse(loginSchema, validLogin).success).toBe(true)
  })

  it('requires a well-formed email and a non-empty password', () => {
    expect(v.safeParse(loginSchema, { ...validLogin, email: 'nope' }).success).toBe(false)
    expect(v.safeParse(loginSchema, { ...validLogin, password: '' }).success).toBe(false)
  })
})

describe('workSchema', () => {
  it('accepts a valid work object', () => {
    expect(v.safeParse(workSchema, validWork).success).toBe(true)
  })

  it('allows url and git to be empty but not malformed', () => {
    expect(v.safeParse(workSchema, { ...validWork, url: '', git: '' }).success).toBe(true)
    expect(v.safeParse(workSchema, { ...validWork, url: 'not-a-url' }).success).toBe(false)
    expect(v.safeParse(workSchema, { ...validWork, git: 'not-a-url' }).success).toBe(false)
  })

  it('requires name, description, and a numeric weight', () => {
    expect(v.safeParse(workSchema, { ...validWork, name: '' }).success).toBe(false)
    expect(v.safeParse(workSchema, { ...validWork, description: '' }).success).toBe(false)
    expect(v.safeParse(workSchema, { ...validWork, weight: '1' }).success).toBe(false)
  })

  it('requires resource entries to have a name and icon', () => {
    expect(
      v.safeParse(workSchema, { ...validWork, resources: [{ name: '', icon: 'devicon-x' }] })
        .success
    ).toBe(false)
  })
})

describe('strictObject contract (mirrors Mongoose strict: "throw")', () => {
  const cases = [
    ['settingsSchema', settingsSchema, validSettings],
    ['experienceSchema', experienceSchema, validExperience],
    ['aboutSchema', aboutSchema, validAbout],
    ['loginSchema', loginSchema, validLogin],
    ['workSchema', workSchema, validWork]
  ] as const

  it.each(cases)('%s rejects unknown keys', (_name, schema, fixture) => {
    expect(v.safeParse(schema, { ...fixture, bogus: 'field' }).success).toBe(false)
  })
})
