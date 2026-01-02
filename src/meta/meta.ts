import type { MetaDataType } from '@/types/portfolio'

import metaData from './meta.json'

type PageType = keyof typeof metaData

/**
 * Generates metadata (title and description) for a given page
 * @param page - The page identifier (empty string for home, or a key from metaData)
 * @returns Object containing title and description for meta tags
 */
export const getMetaData = (page: string) => {
  const siteName = 'Mike Tropea'
  const siteDescription = 'Personal website portfolio of Mike Tropea'

  const data: MetaDataType = metaData[page as PageType]
  const metaDescription = data?.description || siteDescription
  let metaTitle = data?.title ? `${data.title} | ${siteName}` : siteName

  // Handle home page (empty path)
  if (page === '') {
    metaTitle = `${siteName} | ${metaData.home.title ?? ''}`
  }

  return {
    title: metaTitle,
    description: metaDescription
  }
}
