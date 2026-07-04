import type { APIRoute } from 'astro'

import { deleteData, insertData, updateData } from '@/utils/mongodb'
import { type WritableCollection, writeModels } from '@/models'

const headers = {
  'Content-Type': 'application/json'
}

const ALLOWED_FEEDS = Object.keys(writeModels) as WritableCollection[]

const checkFeed = (feed: string) => {
  if (!ALLOWED_FEEDS.includes(feed as WritableCollection)) {
    return new Response(
      JSON.stringify({
        error: `Invalid collection ${feed}`
      }),
      {
        status: 404,
        headers
      }
    )
  }
}

type MongooseError = {
  name?: string
  message?: string
  errors?: unknown
}

const VALIDATION_ERROR_NAMES = new Set(['ValidationError', 'StrictModeError', 'CastError'])

const mapWriteError = (error: unknown, fallback: string) => {
  const err = error as MongooseError
  if (err?.name && VALIDATION_ERROR_NAMES.has(err.name)) {
    return new Response(
      JSON.stringify({
        error: 'Validation failed',
        name: err.name,
        message: err.message,
        details: err.errors
      }),
      { status: 400, headers }
    )
  }
  return new Response(JSON.stringify({ error: fallback }), {
    status: 500,
    headers
  })
}

export const POST: APIRoute = async ({ params, request }) => {
  const collectionName = params.feed ?? ''

  const invalid = checkFeed(collectionName)
  if (invalid) return invalid

  try {
    const body = await request.json()
    const results = await insertData(collectionName, body)

    if (results) {
      return new Response(JSON.stringify(results), {
        status: 200,
        headers
      })
    } else {
      return new Response(
        JSON.stringify({
          error: `Failed to insert data from the ${collectionName} collection`
        }),
        {
          status: 400,
          headers
        }
      )
    }
  } catch (error) {
    return mapWriteError(error, 'Internal server error')
  }
}

export const DELETE: APIRoute = async ({ params, request }) => {
  const collectionName = params.feed ?? ''

  const invalid = checkFeed(collectionName)
  if (invalid) return invalid

  try {
    const body = await request.json()
    const { id } = body
    const results = await deleteData(collectionName, id)

    if (results && id) {
      return new Response(JSON.stringify(results), {
        status: 200,
        headers
      })
    } else {
      return new Response(
        JSON.stringify({
          error: `Failed to delete data from the ${collectionName} collection`
        }),
        {
          status: 400,
          headers
        }
      )
    }
  } catch (error) {
    return mapWriteError(error, 'Internal server error')
  }
}

export const PATCH: APIRoute = async ({ params, request }) => {
  const collectionName = params.feed ?? ''

  const invalid = checkFeed(collectionName)
  if (invalid) return invalid

  try {
    const body = await request.json()
    const results = await updateData(collectionName, body)

    if (results) {
      return new Response(JSON.stringify(results), {
        status: 200,
        headers
      })
    } else {
      return new Response(
        JSON.stringify({
          error: `Failed to update data from the ${collectionName} collection`
        }),
        {
          status: 400,
          headers
        }
      )
    }
  } catch (error) {
    return mapWriteError(error, 'Internal server error')
  }
}

export const PUT: APIRoute = async ({ params, request }) => {
  const collectionName = params.feed ?? ''

  const invalid = checkFeed(collectionName)
  if (invalid) return invalid

  try {
    const body = await request.json()
    const results = await updateData(collectionName, body)

    if (results) {
      return new Response(JSON.stringify(results), {
        status: 200,
        headers
      })
    } else {
      return new Response(
        JSON.stringify({
          error: `Failed to update data from the ${collectionName} collection`
        }),
        {
          status: 400,
          headers
        }
      )
    }
  } catch (error) {
    return mapWriteError(error, 'Internal server error')
  }
}
