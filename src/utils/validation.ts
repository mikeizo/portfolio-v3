import type { ContactType, ContactErrorType } from '@/types/portfolio'

const response = (isValid: boolean, message: string): ContactErrorType => {
  return {
    isValid,
    message: !isValid ? message : ''
  }
}

/**
 * Validates whether the given string is a valid name for a user form input.
 * Rules:
 * - Must be non-empty
 * - Minimum 2 characters after trimming
 * - Maximum 50 characters after trimming
 * - Allows letters, spaces, apostrophes, hyphens, and periods
 * - No numbers or special symbols except above
 *
 * @param name - The name string to validate.
 * @returns True if the name is valid, otherwise false.
 */
export function isValidName(name: string): ContactErrorType {
  const min = 2
  const max = 50

  if (name === '') {
    return response(false, 'Name is required')
  }

  if (typeof name !== 'string') {
    return response(false, 'Invalid name')
  }

  const trimmed = name.trim()

  if (trimmed.length < min || trimmed.length > max) {
    return response(false, `Name must be between ${min} and ${max} characters`)
  }

  // Allows: unicode letters, spaces, apostrophes, hyphens (periods NOT allowed)
  const nameRegex = /^[\p{L} '-]+$/u

  return response(
    nameRegex.test(trimmed),
    'Invalid name: only letters, spaces, apostrophes, and hyphens are allowed'
  )
}

/**
 * Validates whether the given string is a valid email address.
 *
 * @param email - The email string to validate.
 * @returns True if the email is valid, otherwise false.
 */
export function isValidEmail(email: string): ContactErrorType {
  const message = 'Invalid email'

  if (email === '') {
    return response(false, 'Email is required')
  }

  if (typeof email !== 'string') {
    return response(false, message)
  }

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/

  return response(emailRegex.test(email.trim()), message)
}

/**
 * Validates whether the given string is a valid US phone number.
 * Only digits and common delimiters are allowed.
 *
 * @param phone - The phone string to validate.
 * @returns True if the phone number is valid US format, otherwise false.
 */
export function isValidPhone(phone: string): ContactErrorType {
  if (typeof phone !== 'string') {
    return response(false, 'Invalid phone number')
  }

  const trimmed = phone.trim()

  // Return valid if empty
  if (!trimmed) {
    return response(true, '')
  }

  const phoneDigits = trimmed.replace(/[().\-\s]/g, '')

  // Phone must be exactly 10 digits after removing country code and formatting
  if (!/^\d{10}$/.test(phoneDigits)) {
    return response(false, 'Phone number must be 10 digits')
  }

  return response(true, '')
}

/**
 * Validates whether the given string is a valid message for a user form input.
 * Rules:
 * - Must be a string
 * - Minimum 10 characters after trimming
 * - Maximum 1000 characters after trimming
 * - Cannot contain only whitespace
 *
 * @param message - The message string to validate.
 * @returns True if the message is valid, otherwise false.
 */
export function isValidMessage(message: string): ContactErrorType {
  const min = 10
  const max = 1000

  if (typeof message !== 'string') {
    return response(false, 'Message must be a string')
  }

  const trimmed = message.trim()

  // Empty message
  if (!trimmed) {
    return response(true, '')
  }

  if (trimmed.length < min) {
    return response(false, `Message must be at least ${min} characters`)
  }

  if (trimmed.length > max) {
    return response(false, `Message must be less than ${max} characters`)
  }

  return response(true, '')
}

/**
 * Validates the entire contact form object.
 * Checks each field (name, email, phone, message) using their respective validation functions.
 *
 * @param data - ContactType object containing name, email, phone, and message.
 * @returns An object with field-level validation results and the overall form validity.
 */
export function validateForm(data: ContactType) {
  const { name, email, phone, message } = data

  const inputValidation = {
    name: isValidName(name),
    email: isValidEmail(email),
    phone: isValidPhone(phone),
    message: isValidMessage(message)
  }

  const isValidForm = !Object.values(inputValidation).some((input) => {
    return input.isValid === false
  })

  return {
    inputs: inputValidation,
    isValidForm
  }
}
