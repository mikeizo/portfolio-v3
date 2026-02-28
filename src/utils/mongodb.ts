import type { SortOptionsType } from '@/types/portfolio'

import mongoose, { type ConnectOptions } from 'mongoose'
import { ObjectId } from 'mongodb'

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
    await mongoose.connect(MONGODB_URI, options as ConnectOptions)
    isConnected = true
    return mongoose.connection
  } catch (error) {
    throw error
  }
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

  try {
    await connectToDatabase()
    const data =
      sortOptions?.sort && sortOptions?.order
        ? await Collection.find().sort({
            [sortOptions.sort]: sortOptions.order
          })
        : await Collection.find()

    return data.toArray()
  } catch (error) {
    throw error
  }
}

/**
 * Saves or updates data in a MongoDB collection using Mongoose.
 *
 * If a document with the same identifier exists,
 * it will be updated; otherwise, a new document will be created.
 *
 * @param collectionName - The name of the collection to save data to.
 * @param data - The data object to save. Should conform to the schema for the collection.
 * @returns The saved/updated document or null if failed.
 */
export async function updateData(
  collectionName: string | undefined,
  data: Record<string, unknown>
) {
  if (!collectionName || !data) {
    return null
  }

  try {
    await connectToDatabase()
    const Collection = mongoose.connection.collection(collectionName)

    if (data.id) {
      const updateDoc = {
        $set: {
          name: data.name
        }
      }
      const result = await Collection.findOneAndUpdate(
        { _id: new ObjectId(data.id) },
        updateDoc,
        { returnDocument: 'after' }
      )
      return result
    } else {
      const updateDoc = {
        $set: {
          ...data
        }
      }
      const result = await Collection.updateOne({}, updateDoc)

      return result
    }
  } catch (error) {
    throw error
  }
}

export async function insertData(
  collectionName: string,
  data: Record<string, unknown>
) {
  if (!collectionName || !data) {
    return null
  }

  try {
    await connectToDatabase()

    const Collection = mongoose.connection.collection(collectionName)

    const result = Array.isArray(data)
      ? await Collection.insertMany(data)
      : await Collection.insertOne(data)

    return result
  } catch (error) {
    throw error
  }
}

export async function deleteData(collectionName: string, id: string) {
  if (!collectionName || !id) {
    return null
  }

  try {
    await connectToDatabase()

    const Collection = mongoose.connection.collection(collectionName)
    const result = await Collection.findOneAndDelete({ _id: new ObjectId(id) })

    return result
  } catch (error) {
    throw error
  }
}
