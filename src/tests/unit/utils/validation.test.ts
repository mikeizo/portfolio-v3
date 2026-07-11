import { describe, expect, it } from 'vitest'
import {
  isValidEmail,
  isValidMessage,
  isValidName,
  isValidPhone,
  validateForm
} from '@/utils/validation'

describe('isValidName', () => {
  it('requires a name', () => {
    expect(isValidName('')).toEqual({ isValid: false, message: 'Name is required' })
  })

  it('enforces 2-50 characters after trimming', () => {
    expect(isValidName('A').isValid).toBe(false)
    expect(isValidName(' A ').isValid).toBe(false)
    expect(isValidName('A'.repeat(51)).isValid).toBe(false)
    expect(isValidName('A'.repeat(50)).isValid).toBe(true)
    expect(isValidName('Al').isValid).toBe(true)
  })

  it('allows unicode letters, spaces, apostrophes, and hyphens', () => {
    expect(isValidName("Mary-Jane O'Neil").isValid).toBe(true)
    expect(isValidName('José Müller').isValid).toBe(true)
  })

  it('rejects digits, symbols, and periods', () => {
    expect(isValidName('John3').isValid).toBe(false)
    expect(isValidName('John <script>').isValid).toBe(false)
    expect(isValidName('J. Smith').isValid).toBe(false)
  })

  it('clears the message when valid', () => {
    expect(isValidName('Mike')).toEqual({ isValid: true, message: '' })
  })
})

describe('isValidEmail', () => {
  it('requires an email', () => {
    expect(isValidEmail('')).toEqual({ isValid: false, message: 'Email is required' })
  })

  it('accepts a standard address and tolerates surrounding whitespace', () => {
    expect(isValidEmail('user@example.com').isValid).toBe(true)
    expect(isValidEmail(' user@example.com ').isValid).toBe(true)
    expect(isValidEmail('first.last+tag@sub.example.co').isValid).toBe(true)
  })

  it('rejects addresses without a dot after the @ host', () => {
    expect(isValidEmail('user@example').isValid).toBe(false)
  })

  it('rejects malformed addresses', () => {
    expect(isValidEmail('not an email').isValid).toBe(false)
    expect(isValidEmail('user @example.com').isValid).toBe(false)
    expect(isValidEmail('@example.com').isValid).toBe(false)
  })
})

describe('isValidPhone', () => {
  it('treats empty or whitespace-only phone as valid (optional field)', () => {
    expect(isValidPhone('')).toEqual({ isValid: true, message: '' })
    expect(isValidPhone('   ')).toEqual({ isValid: true, message: '' })
  })

  it('accepts 10 digits with common US formatting', () => {
    expect(isValidPhone('5551234567').isValid).toBe(true)
    expect(isValidPhone('(555) 123-4567').isValid).toBe(true)
    expect(isValidPhone('555.123.4567').isValid).toBe(true)
  })

  it('rejects anything that is not exactly 10 digits', () => {
    expect(isValidPhone('555-1234').isValid).toBe(false)
    expect(isValidPhone('15551234567').isValid).toBe(false)
    expect(isValidPhone('555123456a').isValid).toBe(false)
  })
})

describe('isValidMessage', () => {
  it('treats an empty message as valid (intentional: message is optional server-side)', () => {
    expect(isValidMessage('')).toEqual({ isValid: true, message: '' })
    expect(isValidMessage('   ')).toEqual({ isValid: true, message: '' })
  })

  it('enforces 10-1000 characters after trimming when non-empty', () => {
    expect(isValidMessage('too short').isValid).toBe(false)
    expect(isValidMessage('long enough now').isValid).toBe(true)
    expect(isValidMessage('m'.repeat(1000)).isValid).toBe(true)
    expect(isValidMessage('m'.repeat(1001)).isValid).toBe(false)
  })
})

describe('validateForm', () => {
  const validData = {
    name: 'Mike Tropea',
    email: 'mike@example.com',
    phone: '',
    message: 'Hello, this is a valid message.'
  }

  it('is valid when every field passes', () => {
    const result = validateForm(validData)

    expect(result.isValidForm).toBe(true)
    expect(result.inputs.name.isValid).toBe(true)
  })

  it('is invalid when any single field fails, and reports which one', () => {
    const result = validateForm({ ...validData, email: 'nope' })

    expect(result.isValidForm).toBe(false)
    expect(result.inputs.email).toEqual({ isValid: false, message: 'Invalid email' })
    expect(result.inputs.name.isValid).toBe(true)
  })
})
