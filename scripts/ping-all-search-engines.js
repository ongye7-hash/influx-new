/**
 * 모든 검색엔진에 Sitemap Ping
 *
 * 실행: node scripts/ping-all-search-engines.js
 */

const https = require('https');
const http = require('http');

const SITE_URL = 'https://www.influx-lab.com';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

// Ping 대상 검색엔진들
const pingUrls = [
  // Google
  `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,

  // Bing
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,

  // Yandex
  `https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,

  // IndexNow API (Bing, Yandex 등에 전달)
  // 별도 처리

  // 추가 ping 서비스
  `http://www.google.co.kr/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  `http://blogsearch.google.com/ping?name=INFLUX&url=${encodeURIComponent(SITE_URL)}&changesURL=${encodeURIComponent(SITEMAP_URL)}`,
];

// Naver 웹마스터도구 ping (별도 처리 필요)
const naverPing = `https://searchadvisor.naver.com/indexnow`;

async function pingUrl(url) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const protocol = isHttps ? https : http;

    try {
      const req = protocol.get(url, { timeout: 10000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const status = res.statusCode;
          const success = status >= 200 && status < 400;
          resolve({ url, status, success });
        });
      });

      req.on('error', (e) => {
        resolve({ url, status: 'ERROR', success: false, error: e.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ url, status: 'TIMEOUT', success: false });
      });
    } catch (e) {
      resolve({ url, status: 'ERROR', success: false, error: e.message });
    }
  });
}

async function main() {
  console.log('🚀 검색엔진 Sitemap Ping 시작\n');
  console.log(`📍 사이트: ${SITE_URL}`);
  console.log(`📄 Sitemap: ${SITEMAP_URL}\n`);
  console.log('='.repeat(60) + '\n');

  let successCount = 0;
  let failCount = 0;

  for (const url of pingUrls) {
    const result = await pingUrl(url);

    if (result.success) {
      console.log(`✅ [${result.status}] ${url.substring(0, 50)}...`);
      successCount++;
    } else {
      console.log(`❌ [${result.status}] ${url.substring(0, 50)}...`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 결과: 성공 ${successCount}개, 실패 ${failCount}개`);
  console.log('\n📌 추가로 해야 할 것:');
  console.log('1. Google Search Console에서 sitemap 제출');
  console.log('2. Bing Webmaster Tools에서 sitemap 제출');
  console.log('3. Naver Search Advisor에서 sitemap 제출');
  console.log('4. 각 URL 수동 색인 요청\n');
}

main().catch(console.error);
