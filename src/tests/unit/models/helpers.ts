import mongoose from 'mongoose'

/**
 * Run offline document validation (no DB connection) and return the
 * ValidationError, or null when the document is valid. Uses validate(),
 * not validateSync(), because only validate() runs pre('validate') hooks.
 */
export async function validationError(doc: { validate(): Promise<void> }) {
  try {
    await doc.validate()
    return null
  } catch (error) {
    return error as mongoose.Error.ValidationError
  }
}
