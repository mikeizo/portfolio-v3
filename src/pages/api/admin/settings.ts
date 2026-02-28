import type { APIRoute } from 'astro'

import { updateData } from '@/utils/mongodb'

export const POST: APIRoute = async ({ params, request }) => {
  const headers = {
    'Content-Type': 'application/json'
  }

  const body = await request.json()
  const collectionName = 'settings'

  try {
    const data = await updateData(collectionName, body)

    if (data) {
      return new Response(JSON.stringify(data), {
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
