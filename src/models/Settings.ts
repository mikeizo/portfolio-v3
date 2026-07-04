// Mirror in src/utils/formSchema.ts (settingsSchema) — keep in sync.
import type { SettingsType } from '@/types/portfolio'

import mongoose, { type Model } from 'mongoose'

import { sanitizeDocFields, sanitizeUpdateFields } from '@/utils/sanitizeHtml'

const { Schema, model, models } = mongoose

const settingsSchema = new Schema<SettingsType>(
  {
    title: { type: String, required: true, maxlength: 25 },
    subtitle: { type: String, default: '', maxlength: 50 },
    email: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    git: { type: String, required: true, match: /^https?:\/\/\S+$/ },
    about: { type: String, default: '' }
  },
  { collection: 'settings', strict: 'throw', versionKey: false }
)

settingsSchema.pre('validate', function () {
  sanitizeDocFields(this, ['about'])
})

settingsSchema.pre('findOneAndUpdate', function () {
  sanitizeUpdateFields(this, ['about'])
})

export const Settings: Model<SettingsType> =
  (models.Settings as Model<SettingsType>) || model<SettingsType>('Settings', settingsSchema)
