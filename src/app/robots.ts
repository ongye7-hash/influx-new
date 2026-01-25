// ============================================
// Robots.txt 생성
// 검색 엔진 봇 접근 규칙
// ============================================

import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.influx-lab.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/_next/static/',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/private/',
          '/_next/image',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
        ],
      },
      {
        userAgent: 'Yeti', // 네이버
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
