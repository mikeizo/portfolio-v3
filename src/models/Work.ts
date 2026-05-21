// Mirror in src/utils/formSchema.ts (workSchema) — keep in sync.
import type { WorkType } from '@/types/portfolio'

import mongoose, { type Model } from 'mongoose'

import { sanitizeDocFields, sanitizeUpdateFields } from '@/utils/sanitizeHtml'

const { Schema, model, models } = mongoose

type WorkResource = WorkType['resources'][number]

const optionalUrlValidator = {
  validator: (value: string) => value === '' || /^https?:\/\/\S+$/.test(value),
  message: 'Must be empty or a valid http(s) URL'
}

const workResourceSchema = new Schema<WorkResource>(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true }
  },
  { _id: false }
)

const isoNow = () => new Date().toISOString()

const workSchema = new Schema<WorkType>(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    url: { type: String, default: '', validate: optionalUrlValidator },
    git: { type: String, default: '', validate: optionalUrlValidator },
    resources: { type: [workResourceSchema], default: [] },
    description: { type: String, required: true },
    slug: { type: String, required: true, match: /^[a-z0-9-]+$/ },
    logo: { type: String, default: '' },
    images: { type: [String], default: [] },
    grayscale: { type: Boolean, default: false },
    created: { type: String, required: true, immutable: true },
    updated: { type: String, required: true }
  },
  { collection: 'work', strict: 'throw', versionKey: false }
)

workSchema.pre('validate', function () {
  const now = isoNow()
  if (this.isNew) {
    this.created = now
  }
  this.updated = now
  sanitizeDocFields(this, ['description'])
})

workSchema.pre('findOneAndUpdate', function () {
  this.set({ updated: isoNow() })
  sanitizeUpdateFields(this, ['description'])
})

export const Work: Model<WorkType> =
  (models.Work as Model<WorkType>) || model<WorkType>('Work', workSchema)
