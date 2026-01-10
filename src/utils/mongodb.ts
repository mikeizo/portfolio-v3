import type { SortOptionsType } from '@/types/portfolio'

import mongoose from 'mongoose'

const { Schema } = mongoose
const { MONGODB_URI, MONGODB_DB } = import.meta.env
const options = {
  dbName: MONGODB_DB
}
let isConnected = false

if (!MONGODB_URI || !MONGODB_DB) {
  console.error('Missing required MongoDB env variables')
}

/**
 * Fetches documents from a MongoDB collection in the current database.
 *
 * @param collectionName The name of the collection to fetch data from.
 * @returns The documents from the collection as an array or null if failed.
 */
export async function connectToDatabase() {
  if (isConnected) {
    return mongoose.connection
  }

  try {
    await mongoose.connect(MONGODB_URI, options)
    isConnected = true
    return mongoose.connection
  } catch (error) {
    throw error
  }
}

// Schemas
const settingsSchema = new Schema(
  {
    about: String,
    email: String
  },
  { collection: 'settings' }
)
const menuSchema = new Schema(
  {
    title: String,
    url: String
  },
  { collection: 'menu' }
)
const aboutSchema = new Schema(
  {
    yearFrom: String,
    yearTo: String,
    description: String,
    image: String,
    updated: String
  },
  { collection: 'about' }
)
const experienceSchema = new Schema(
  {
    name: String,
    icon: String
  },
  { collection: 'experience' }
)
const workSchema = new Schema(
  {
    name: String,
    description: String,
    resources: [
      {
        name: String,
        icon: String
      }
    ],
    url: String,
    logo: String,
    images: [String],
    slug: String,
    weight: Number,
    git: String,
    created: String,
    updated: String
  },
  { collection: 'work' }
)

const schemaMap = {
  settings: settingsSchema,
  menu: menuSchema,
  about: aboutSchema,
  experience: experienceSchema,
  work: workSchema
}

/**
 * Fetches data from a MongoDB collection specified by the given name.
 *
 * @param collection - The name of the collection to fetch data from. Should be one of the keys in schemaMap.
 * @returns An array of documents retrieved from the specified collection.
 */
export async function fetchData(
  collection: string | undefined,
  sortOptions?: SortOptionsType
) {
  const schema = schemaMap[collection as keyof typeof schemaMap]

  if (!schema || !collection) {
    return null
  }

  const Model =
    mongoose.models[collection] ?? mongoose.model(collection, schema)

  try {
    await connectToDatabase()
    const data =
      sortOptions?.sort && sortOptions?.order
        ? await Model.find()
            .lean()
            .sort({ [sortOptions.sort]: sortOptions.order })
        : await Model.find().lean()

    return data
  } catch (error) {
    throw error
  }
}
