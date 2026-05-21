// Mirror in src/utils/formSchema.ts (aboutSchema) — keep in sync.
import type { AboutType } from '@/types/portfolio'

import mongoose, { type Model } from 'mongoose'

const { Schema, model, models } = mongoose

const aboutSchema = new Schema<AboutType>(
  {
    yearFrom: { type: String, required: true },
    yearTo: { type: String, default: '' },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    updated: { type: String }
  },
  { collection: 'about', strict: 'throw', versionKey: false }
)

export const About: Model<AboutType> =
  (models.About as Model<AboutType>) || model<AboutType>('About', aboutSchema)
