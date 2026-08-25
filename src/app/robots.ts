import type {MetadataRoute} from 'next'
import {BASE_URL} from '@/utils/constants'

const SITE_URL = BASE_URL || 'https://nextjs.ruoyi.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/customer/',
          '/checkout/',
          '/rfqs/',
          '/api/',
          '/account/',
          '/success',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
