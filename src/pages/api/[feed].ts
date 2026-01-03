import type { APIRoute } from 'astro'
import type { SortOptionsType } from '@/types/portfolio'

import { fetchData } from '@/utils/mongodb'

export const GET: APIRoute = async ({ params, request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
  }

  const url = new URL(request.url)
  const searchParams = url.searchParams

  try {
    const sort = searchParams.get('sort')
    const order = searchParams.get('order') === 'desc' ? -1 : 1
    let sortOptions: SortOptionsType = null

    if (sort) {
      sortOptions = {
        sort,
        order
      }
    }

    const data = await fetchData(params.feed, sortOptions)

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
