import * as v from 'valibot'

// --- Settings (src/models/Settings.ts) ---
export const settingsSchema = v.strictObject({
  title: v.pipe(
    v.string(),
    v.nonEmpty('Please enter a title'),
    v.maxLength(25, 'Must be less than 25 characters')
  ),
  subtitle: v.pipe(
    v.string(),
    v.maxLength(50, 'Must be less than 50 characters')
  ),
  email: v.pipe(v.string(), v.email('Please enter a valid email')),
  git: v.pipe(v.string(), v.url('Please enter a valid url')),
  about: v.string()
})

// --- Experience (src/models/Experience.ts) ---
export const experienceSchema = v.strictObject({
  name: v.pipe(v.string(), v.minLength(3, 'Must more than 3 characters')),
  icon: v.pipe(
    v.string(),
    v.startsWith('devicon-', 'Icon class must start with "devicon-"')
  )
})

// --- About (src/models/About.ts) ---
export const aboutSchema = v.strictObject({
  yearFrom: v.pipe(v.string(), v.nonEmpty('Please enter a start year')),
  yearTo: v.string(),
  description: v.pipe(v.string(), v.nonEmpty('Please enter a description')),
  image: v.string()
})

// --- Work (src/models/Work.ts) ---
const optionalUrl = v.union([
  v.literal(''),
  v.pipe(v.string(), v.url('Invalid URL format'))
])

const workResource = v.strictObject({
  name: v.pipe(v.string(), v.nonEmpty('Resource name is required')),
  icon: v.pipe(v.string(), v.nonEmpty('Resource icon is required'))
})

export const workSchema = v.strictObject({
  name: v.pipe(v.string(), v.nonEmpty('Name is required')),
  weight: v.number(),
  url: optionalUrl,
  git: optionalUrl,
  resources: v.array(workResource),
  description: v.pipe(v.string(), v.nonEmpty('Please enter a description')),
  slug: v.string(),
  logo: v.string(),
  images: v.array(v.string()),
  grayscale: v.boolean()
})
