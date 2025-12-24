const { SITE_URL } = import.meta.env

export const getDataFeed = async (feed: string) => {
  const data = await fetch(`${SITE_URL}/api/${feed}`).then((res) => res.json())

  if (data.length > 0) {
    return data
  }
}
