import type { APIRoute } from 'astro'

import { updateData } from '@/utils/mongodb'

const collectionName = 'settings'
const headers = {
  'Content-Type': 'application/json'
}

export const POST: APIRoute = async ({ request }) => {
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
