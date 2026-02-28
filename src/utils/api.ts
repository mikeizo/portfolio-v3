const { SITE_URL } = import.meta.env

export const getDataFeed = async (
  feed: string,
  sort?: string,
  order?: 'asc' | 'desc'
) => {
  let siteUrl = SITE_URL

  if (!siteUrl && typeof window !== 'undefined') {
    siteUrl = window.location.origin
  }

  try {
    const url = new URL(`/api/${feed}`, siteUrl)

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
