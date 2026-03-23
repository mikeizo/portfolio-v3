import type { APIRoute } from 'astro'

import { deleteData, insertData, updateData } from '@/utils/mongodb'

const headers = {
  'Content-Type': 'application/json'
}

const ALLOWED_FEEDS = ['settings', 'experience', 'about', 'work'] as const

type AllowedFeed = (typeof ALLOWED_FEEDS)[number]

const checkFeed = (feed: string) => {
  if (!ALLOWED_FEEDS.includes(feed as AllowedFeed)) {
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
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers
      }
    )
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
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers
      }
    )
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
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers
      }
    )
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
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers
      }
    )
  }
}
