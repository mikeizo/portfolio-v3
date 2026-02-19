import type { APIRoute } from 'astro'

import { saveData } from '@/utils/mongodb'

export const POST: APIRoute = async ({ params, request }) => {
  const headers = {
    'Content-Type': 'application/json'
  }

  const body = await request.json()

  try {
    const data = await saveData(params.feed, body)

    if (data) {
      return new Response(JSON.stringify(data), {
        status: 200,
        headers
      })
    } else {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch data from the ${params.feed} collection.`
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
