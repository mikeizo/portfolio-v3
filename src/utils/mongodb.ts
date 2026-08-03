import type { SortOptionsType } from '@/types/portfolio'

import mongoose, { type ConnectOptions, type Model } from 'mongoose'
import { type WritableCollection, writeModels } from '@/models'
import { ObjectId } from 'mongodb'

function getModel(collectionName: string | undefined): Model<Record<string, unknown>> | null {
  if (!collectionName || !(collectionName in writeModels)) return null
  return writeModels[collectionName as WritableCollection] as unknown as Model<
    Record<string, unknown>
  >
}

const { MONGODB_URI, MONGODB_DB } = import.meta.env
const options: ConnectOptions = {
  dbName: MONGODB_DB,
  maxPoolSize: 5, // per-instance cap; each Vercel instance has its own pool
  minPoolSize: 0, // don't hold idle connections in dormant instances
  maxIdleTimeMS: 15_000, // release connections quickly after a burst
  serverSelectionTimeoutMS: 5_000 // fail fast instead of hanging a serverless function
}

if (!MONGODB_URI || !MONGODB_DB) {
  console.error('Missing required MongoDB env variables')
}

// Cached on globalThis so the promise survives module re-evaluation (dev HMR)
// and is shared across concurrent requests within a warm serverless instance.
const globalCache = globalThis as typeof globalThis & {
  __mongooseConn?: Promise<typeof mongoose> | null
}

/**
 * Connects to MongoDB, reusing a single in-flight or established connection
 * per process. A failed connect clears the cache so the next call retries.
 *
 * @returns The shared Mongoose connection.
 */
export async function connectToDatabase() {
  if (!globalCache.__mongooseConn) {
    globalCache.__mongooseConn = mongoose.connect(MONGODB_URI, options).catch((error) => {
      globalCache.__mongooseConn = null
      throw error
    })
  }

  await globalCache.__mongooseConn
  return mongoose.connection
}

/**
 * Fetches data from a MongoDB collection specified by the given name.
 *
 * @param collectionName - The name of the collection to fetch data from.
 * Should be one of the keys in schemaMap.
 * @returns An array of documents retrieved from the specified collection.
 */
export async function fetchData(collectionName: string | undefined, sortOptions?: SortOptionsType) {
  if (!collectionName) {
    return null
  }

  await connectToDatabase()

  const Collection = mongoose.connection.collection(collectionName)
  const data =
    sortOptions?.sort && sortOptions?.order
      ? Collection.find().sort({
          [sortOptions.sort]: sortOptions.order
        })
      : Collection.find()

  return JSON.parse(JSON.stringify(await data.toArray()))
}

/**
 * Fetches a single document from a MongoDB collection by its unique identifier.
 *
 * @param collectionName - The name of the collection to query.
 * @param id - The unique identifier (_id) of the document to retrieve.
 * @returns The document if found, or null if not found or parameters are missing.
 * @throws Will throw an error if the database query fails.
 */
export async function fetchDataById(collectionName: string | undefined, id: string | undefined) {
  if (!collectionName || !id) return null

  await connectToDatabase()

  const Collection = mongoose.connection.collection(collectionName)
  const data = await Collection.findOne({ _id: new ObjectId(id) })

  return data ? JSON.parse(JSON.stringify(data)) : null
}

/**
 * Saves or updates data in a MongoDB collection via the per-collection Mongoose Model.
 *
 * Writes are validated by the Model's schema (`strict: 'throw'`, required fields,
 * matchers, etc.). If `data.id` is present, the matching document is updated;
 * otherwise the singleton document for the collection is updated.
 *
 * @param collectionName - The name of the collection to save data to.
 * @param data - The data object to save. Validated against the Model's schema.
 * @returns The saved/updated document or null if the collection is unknown.
 */
export async function updateData(
  collectionName: string | undefined,
  data: Record<string, unknown>
) {
  const Model = getModel(collectionName)
  if (!Model || !data) return null

  await connectToDatabase()

  if (data.id) {
    const { id, ...rest } = data
    return Model.findByIdAndUpdate(id as string, rest, {
      new: true,
      runValidators: true,
      strict: 'throw',
      context: 'query'
    })
  }

  // Singleton update (settings, about) — match the first/only document.
  return Model.findOneAndUpdate({}, data, {
    new: true,
    runValidators: true,
    strict: 'throw',
    context: 'query'
  })
}

/**
 * Inserts new data into a MongoDB collection via the per-collection Mongoose Model.
 *
 * The inserted data is validated against the Model's schema (`strict: 'throw'`), which
 * enforces field requirements, type checks, and sanitization via schema hooks.
 * Accepts either a single data object or an array of data objects.
 *
 * @param collectionName - The name of the collection to insert data into.
 * @param data - The data object or array of objects to insert. Validated against the Model's schema.
 * @returns The created document(s), or null if the collection is unknown.
 */
export async function insertData(collectionName: string, data: Record<string, unknown>) {
  const Model = getModel(collectionName)
  if (!Model || !data) return null

  await connectToDatabase()

  return Array.isArray(data) ? Model.insertMany(data) : Model.create(data)
}

/**
 * Deletes a single document by ID from a MongoDB collection using the per-collection Mongoose Model.
 *
 * The operation is performed only if a valid Model exists for the given collection and an ID is provided.
 * The function connects to the database, and attempts to delete the document with the matching ID.
 *
 * @param collectionName - The name of the collection from which to delete the document.
 * @param id - The unique identifier (_id) of the document to delete.
 * @returns The deleted document if found, or null if not found or if the collection is unknown.
 */
export async function deleteData(collectionName: string, id: string) {
  const Model = getModel(collectionName)
  if (!Model || !id) return null

  await connectToDatabase()

  return Model.findByIdAndDelete(id)
}
