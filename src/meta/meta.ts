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

  if (page === 'home') {
    return {
      title: `${siteName} - ${metaData.home.title ?? ''}`,
      description: metaData.home.description ?? siteDescription
    }
  }

  const data: MetaDataType = metaData[page as PageType]
  const metaTitle = data?.title ? `${data.title} | ${siteName}` : siteName
  const metaDescription = data?.description || siteDescription

  return {
    title: metaTitle,
    description: metaDescription
  }
}
