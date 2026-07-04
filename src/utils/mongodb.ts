import type { SortOptionsType } from '@/types/portfolio'

import mongoose, { type ConnectOptions } from 'mongoose'
import { type WritableCollection, writeModels } from '@/models'
import { ObjectId } from 'mongodb'

function getModel(collectionName: string | undefined) {
  if (!collectionName || !(collectionName in writeModels)) return null
  return writeModels[collectionName as WritableCollection]
}

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

  await mongoose.connect(MONGODB_URI, options as ConnectOptions)
  isConnected = true
  return mongoose.connection
}

/**
 * Fetches data from a MongoDB collection specified by the given name.
 *
 * @param collectionName - The name of the collection to fetch data from.
 * Should be one of the keys in schemaMap.
 * @returns An array of documents retrieved from the specified collection.
 */
export async function fetchData(
  collectionName: string | undefined,
  sortOptions?: SortOptionsType
) {
  if (!collectionName) {
    return null
  }

  const Collection = mongoose.connection.collection(collectionName)

  await connectToDatabase()
  const data =
    sortOptions?.sort && sortOptions?.order
      ? await Collection.find().sort({
          [sortOptions.sort]: sortOptions.order
        })
      : await Collection.find()

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
export async function fetchDataById(
  collectionName: string | undefined,
  id: string | undefined
) {
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

export async function insertData(
  collectionName: string,
  data: Record<string, unknown>
) {
  const Model = getModel(collectionName)
  if (!Model || !data) return null

  await connectToDatabase()

  return Array.isArray(data) ? Model.insertMany(data) : Model.create(data)
}

export async function deleteData(collectionName: string, id: string) {
  const Model = getModel(collectionName)
  if (!Model || !id) return null

  await connectToDatabase()

  return Model.findByIdAndDelete(id)
}
