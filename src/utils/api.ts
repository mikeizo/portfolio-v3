const { SITE_URL } = import.meta.env

export const getDataFeed = async (
  feed: string,
  sort?: string,
  order?: 'asc' | 'desc'
) => {
  try {
    const url = new URL(`${SITE_URL}/api/${feed}`)

    if (sort) {
      url.searchParams.append('sort', sort)
      url.searchParams.append('order', order || 'asc')
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
      console.error(`Failed to fetch data from the ${feed} feed.`)
      return []
    }

    const data = await response.json()

    if (data && data.length > 0) {
      return data
    }
  } catch (error) {
    console.error('getDataFeed error', error)
  }

  return []
}
