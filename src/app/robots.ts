import {BASE_URL} from '@/utils/constants';

export default function robots() {
  const siteUrl = BASE_URL || 'https://nextjs.ruoyi.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/account/',
          '/checkout/',
          '/customer/',
          '/api/',
          '/rfqs/',
          '/success/',
          '/proxy/',
        ],
      },
      {
        userAgent: 'SemrushBot',
        disallow: '/',
      },
      {
        userAgent: 'MJ12bot',
        disallow: '/',
      },
      {
        userAgent: 'AhrefsBot',
        disallow: '/',
      },
      {
        userAgent: 'DotBot',
        disallow: '/',
      },
      {
        userAgent: 'PetalBot',
        disallow: '/',
      },
      {
        userAgent: 'Baiduspider',
        disallow: '/',
      },
      {
        userAgent: 'YandexBot',
        disallow: '/',
      },
      {
        userAgent: 'Sogou Spider',
        disallow: '/',
      },
      {
        userAgent: '360Spider',
        disallow: '/',
      },
      {
        userAgent: 'Bytespider',
        disallow: '/',
      },
      {
        userAgent: 'facebookexternalhit',
        disallow: '/',
      },
      {
        userAgent: 'Twitterbot',
        disallow: '/',
      },
      {
        userAgent: 'LinkedInBot',
        disallow: '/',
      },
      {
        userAgent: 'Applebot',
        disallow: '/',
      },
      {
        userAgent: 'AppleNewsBot',
        disallow: '/',
      },
      {
        userAgent: 'SeznamBot',
        disallow: '/',
      },
      {
        userAgent: 'Qwantify',
        disallow: '/',
      },
      {
        userAgent: 'Buck',
        disallow: '/',
      },
      {
        userAgent: 'BlexBot',
        disallow: '/',
      },
      {
        userAgent: 'Diffbot',
        disallow: '/',
      },
      {
        userAgent: 'HeadlessChrome',
        disallow: '/',
      },
      {
        userAgent: 'Chrome-Lighthouse',
        disallow: '/',
      },
      {
        userAgent: 'PageSpeed Insights',
        disallow: '/',
      },
      {
        userAgent: 'Pingdom',
        disallow: '/',
      },
      {
        userAgent: 'UptimeRobot',
        disallow: '/',
      },
      {
        userAgent: 'GTmetrix',
        disallow: '/',
      },
      {
        userAgent: 'web-measurement',
        disallow: '/',
      },
      {
        userAgent: 'Go-http-client',
        disallow: '/',
      },
      {
        userAgent: 'python-requests',
        disallow: '/',
      },
      {
        userAgent: 'Scrapy',
        disallow: '/',
      },
      {
        userAgent: 'HTTrack',
        disallow: '/',
      },
      {
        userAgent: 'wget',
        disallow: '/',
      },
      {
        userAgent: 'curl',
        disallow: '/',
      },
      {
        userAgent: 'Masscan',
        disallow: '/',
      },
      {
        userAgent: 'Nmap Scripting Engine',
        disallow: '/',
      },
      {
        userAgent: 'Bullseye',
        disallow: '/',
      },
      {
        userAgent: 'Datanyze',
        disallow: '/',
      },
      {
        userAgent: 'Censys',
        disallow: '/',
      },
      {
        userAgent: 'Shodan',
        disallow: '/',
      },
      {
        userAgent: 'ZoominfoBot',
        disallow: '/',
      },
      {
        userAgent: 'EmailWebCrawler',
        disallow: '/',
      },
      {
        userAgent: 'B2BBot',
        disallow: '/',
      },
      {
        userAgent: 'CriteoBot',
        disallow: '/',
      },
      {
        userAgent: 'Outbrain',
        disallow: '/',
      },
      {
        userAgent: 'TaboolaBot',
        disallow: '/',
      },
      {
        userAgent: 'Trendkite',
        disallow: '/',
      },
      {
        userAgent: 'PricePanda',
        disallow: '/',
      },
      {
        userAgent: 'Prisjakt',
        disallow: '/',
      },
      {
        userAgent: 'Pricerunner',
        disallow: '/',
      },
      {
        userAgent: 'KelkooBot',
        disallow: '/',
      },
      {
        userAgent: 'ShopBot',
        disallow: '/',
      },
      {
        userAgent: 'TheWebBot',
        disallow: '/',
      },
      {
        userAgent: 'Spbot',
        disallow: '/',
      },
      {
        userAgent: 'SpiderLing',
        disallow: '/',
      },
      {
        userAgent: 'WebDaemon',
        disallow: '/',
      },
      {
        userAgent: 'WebmasterWorld',
        disallow: '/',
      },
      {
        userAgent: 'Xenu Link Sleuth',
        disallow: '/',
      },
      {
        userAgent: 'SEOkicks',
        disallow: '/',
      },
      {
        userAgent: 'SEMrush',
        disallow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/account/',
          '/checkout/',
          '/customer/',
          '/api/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/account/',
          '/checkout/',
          '/customer/',
          '/api/',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      {
        userAgent: 'Googlebot-Video',
        allow: '/',
      },
      {
        userAgent: 'Googlebot-News',
        allow: '/',
      },
      {
        userAgent: 'AdsBot-Google',
        allow: '/',
      },
      {
        userAgent: 'APIs-Google',
        disallow: '/',
      },
      {
        userAgent: 'Mediapartners-Google',
        allow: '/',
      },
      {
        userAgent: 'Google Favicon',
        allow: '/',
      },
      {
        userAgent: 'Google-Read-Aloud',
        allow: '/',
      },
      {
        userAgent: 'DuplexWeb-Google',
        allow: '/',
      },
      {
        userAgent: 'Google-Site-Verification',
        allow: '/',
      },
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
        disallow: [
          '/account/',
          '/checkout/',
          '/customer/',
          '/api/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}