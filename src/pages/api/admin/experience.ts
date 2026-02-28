import type { APIRoute } from 'astro'

import { deleteData, insertData, updateData } from '@/utils/mongodb'

export const POST: APIRoute = async ({ params, request }) => {
  const headers = {
    'Content-Type': 'application/json'
  }

  const body = await request.json()
  const collectionName = 'experience'

  try {
    const data = await insertData(collectionName, body)

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

export const DELETE: APIRoute = async ({ request }) => {
  // const body = await request.json()
  const collectionName = 'experience'
  const headers = {
    'Content-Type': 'application/json'
  }

  const body = await request.json()
  const { id } = body

  try {
    const data = await deleteData(collectionName, id)

    if (data || !id) {
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
