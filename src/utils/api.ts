const { SITE_URL } = import.meta.env

export const getDataFeed = async (feed: string) => {
  try {
    const response = await fetch(`${SITE_URL}/api/${feed}`)

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
