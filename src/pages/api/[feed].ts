import type { APIRoute } from 'astro'
import { fetchData } from '@/utils/mongodb'

export const GET: APIRoute = async ({ params }) => {
  const headers = {
    'Content-Type': 'application/json'
  }

  try {
    const data = await fetchData(params.feed)

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
