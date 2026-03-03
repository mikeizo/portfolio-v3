import type { APIRoute } from 'astro'

import { deleteData, insertData, updateData } from '@/utils/mongodb'

// const collectionName = 'experience'
const headers = {
  'Content-Type': 'application/json'
}

const ALLOWED_FEEDS = ['settings', 'experience', 'about'] as const

type AllowedFeed = (typeof ALLOWED_FEEDS)[number]

const checkFeed = (feed: string) => {
  if (!ALLOWED_FEEDS.includes(feed as AllowedFeed)) {
    return new Response(
      JSON.stringify({
        error: `Failed to fetch data from the ${feed} collection.`
      }),
      {
        status: 404,
        headers
      }
    )
  }
}

export const POST: APIRoute = async ({ request }) => {
  const collectionName = request.url.split('/').pop() || ''

  const invalid = checkFeed(collectionName)
  if (invalid) return invalid

  const body = await request.json()

  try {
    const request = await insertData(collectionName, body)

    if (request) {
      return new Response(JSON.stringify(request), {
        status: 200,
        headers
      })
    } else {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch data from the ${collectionName} collection.`
        }),
        {
          status: 404,
          headers
        }
      )
    }
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Internal server error occurred while fetching data.'
      }),
      {
        status: 500,
        headers
      }
    )
  }
}

export const DELETE: APIRoute = async ({ request }) => {
  const collectionName = request.url.split('/').pop() || ''

  const invalid = checkFeed(collectionName)
  if (invalid) return invalid

  const body = await request.json()
  const { id } = body

  try {
    const request = await deleteData(collectionName, id)

    if (request && id) {
      return new Response(JSON.stringify(request), {
        status: 200,
        headers
      })
    } else {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch data from the ${collectionName} collection.`
        }),
        {
          status: 404,
          headers
        }
      )
    }
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Internal server error occurred while fetching data.'
      }),
      {
        status: 500,
        headers
      }
    )
  }
}

export const PATCH: APIRoute = async ({ request }) => {
  const collectionName = request.url.split('/').pop() || ''

  const invalid = checkFeed(collectionName)
  if (invalid) return invalid

  const body = await request.json()
  const { id, name } = body

  try {
    const request = await updateData(collectionName, { name, id })

    if (request && id && name) {
      return new Response(JSON.stringify(request), {
        status: 200,
        headers
      })
    } else {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch data from the ${collectionName} collection.`
        }),
        {
          status: 404,
          headers
        }
      )
    }
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Internal server error occurred while fetching data.'
      }),
      {
        status: 500,
        headers
      }
    )
  }
}

export const PUT: APIRoute = async ({ request }) => {
  const collectionName = request.url.split('/').pop() || ''

  const invalid = checkFeed(collectionName)
  if (invalid) return invalid

  const body = await request.json()

  try {
    const request = await updateData(collectionName, body)

    if (request) {
      return new Response(JSON.stringify(request), {
        status: 200,
        headers
      })
    } else {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch data from the ${collectionName} collection.`
        }),
        {
          status: 404,
          headers
        }
      )
    }
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Internal server error occurred while fetching data.'
      }),
      {
        status: 500,
        headers
      }
    )
  }
}
