// Mirror in src/utils/formSchema.ts (experienceSchema) — keep in sync.
import type { ExperienceType } from '@/types/portfolio'

import mongoose, { type Model } from 'mongoose'

const { Schema, model, models } = mongoose

const experienceSchema = new Schema<ExperienceType>(
  {
    name: { type: String, required: true, minlength: 3 },
    icon: { type: String, required: true, match: /^devicon-/ }
  },
  { collection: 'experience', strict: 'throw', versionKey: false }
)

export const Experience: Model<ExperienceType> =
  (models.Experience as Model<ExperienceType>) ||
  model<ExperienceType>('Experience', experienceSchema)
