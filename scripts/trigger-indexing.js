/**
 * IndexNow API - 검색엔진 강제 색인 요청
 * Bing, Naver, Yandex 등에 URL 즉시 제출
 *
 * 실행: node scripts/trigger-indexing.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================
// 설정
// ============================================
const HOST = 'www.influx-lab.com';
const KEY = 'influx-indexnow-key-2026-abc123'; // IndexNow 인증 키
const KEY_FILE_NAME = `${KEY}.txt`;

// ============================================
// 블로그 포스트 슬러그 (201개)
// ============================================
const blogSlugs = [
  // 인스타그램 (20)
  'instagram-followers-guide-complete-2026',
  'instagram-followers-growth-2026',
  'instagram-reels-algorithm-2026',
  'instagram-hashtag-strategy-2026',
  'instagram-engagement-rate-boost-2026',
  'instagram-shadowban-fix-2026',
  'instagram-story-views-increase-2026',
  'instagram-business-account-guide-2026',
  'instagram-influencer-marketing-2026',
  'instagram-content-strategy-2026',
  'instagram-analytics-guide-2026',
  'instagram-shopping-setup-2026',
  'instagram-ads-guide-2026',
  'instagram-bio-optimization-2026',
  'instagram-collab-posts-2026',
  'instagram-live-streaming-2026',
  'instagram-carousel-posts-2026',
  'instagram-ugc-strategy-2026',
  'instagram-competitor-analysis-2026',
  'instagram-brand-partnership-2026',

  // 유튜브 (20)
  'youtube-growth-monetization-guide-2026',
  'youtube-subscribers-growth-2026',
  'youtube-shorts-algorithm-viral-2026',
  'youtube-seo-optimization-2026',
  'youtube-thumbnail-ctr-optimization',
  'youtube-watch-time-4000-hours',
  'youtube-revenue-traffic-guide',
  'youtube-channel-branding-2026',
  'youtube-analytics-guide-2026',
  'youtube-community-tab-strategy-2026',
  'youtube-premiere-strategy-2026',
  'youtube-playlist-optimization-2026',
  'youtube-end-screen-cards-2026',
  'youtube-collaboration-guide-2026',
  'youtube-niche-selection-2026',
  'youtube-equipment-setup-2026',
  'youtube-editing-tips-2026',
  'youtube-copyright-guide-2026',
  'youtube-studio-analytics-2026',
  'youtube-membership-setup-2026',

  // 틱톡 (20)
  'tiktok-monetization-creator-fund-2026',
  'tiktok-followers-views-guide-2026',
  'tiktok-algorithm-viral-strategy-2026',
  'tiktok-hashtag-strategy-2026',
  'tiktok-duet-stitch-guide-2026',
  'tiktok-live-streaming-2026',
  'tiktok-business-account-2026',
  'tiktok-ads-guide-2026',
  'tiktok-analytics-guide-2026',
  'tiktok-content-calendar-2026',
  'tiktok-trending-sounds-2026',
  'tiktok-shadowban-fix-2026',
  'tiktok-shop-setup-2026',
  'tiktok-influencer-collab-2026',
  'tiktok-video-editing-2026',
  'tiktok-caption-hooks-2026',
  'tiktok-niche-selection-2026',
  'tiktok-posting-schedule-2026',
  'tiktok-engagement-boost-2026',
  'tiktok-series-content-2026',

  // 페이스북 (20)
  'facebook-organic-reach-2026',
  'facebook-page-likes-followers-guide',
  'facebook-reels-strategy-2026',
  'facebook-groups-marketing-2026',
  'facebook-ads-guide-2026',
  'facebook-marketplace-guide-2026',
  'facebook-live-streaming-2026',
  'facebook-business-suite-2026',
  'facebook-analytics-guide-2026',
  'facebook-event-marketing-2026',
  'facebook-messenger-marketing-2026',
  'facebook-shop-setup-2026',
  'facebook-content-strategy-2026',
  'facebook-algorithm-2026',
  'facebook-video-marketing-2026',
  'facebook-carousel-ads-2026',
  'facebook-retargeting-guide-2026',
  'facebook-lookalike-audience-2026',
  'facebook-pixel-setup-2026',
  'facebook-community-building-2026',

  // 트위터/X (20)
  'twitter-x-algorithm-2026',
  'twitter-x-followers-growth-2026',
  'twitter-x-monetization-2026',
  'twitter-x-spaces-guide-2026',
  'twitter-x-threads-strategy-2026',
  'twitter-x-analytics-guide-2026',
  'twitter-x-ads-guide-2026',
  'twitter-x-hashtag-strategy-2026',
  'twitter-x-viral-tweets-2026',
  'twitter-x-engagement-tips-2026',
  'twitter-x-profile-optimization-2026',
  'twitter-x-content-calendar-2026',
  'twitter-x-community-notes-2026',
  'twitter-x-blue-verification-2026',
  'twitter-x-lists-strategy-2026',
  'twitter-x-dm-marketing-2026',
  'twitter-x-polls-engagement-2026',
  'twitter-x-media-optimization-2026',
  'twitter-x-trending-topics-2026',
  'twitter-x-brand-voice-2026',

  // 텔레그램 (20)
  'telegram-channel-marketing-2026',
  'telegram-channel-subscribers-guide-2026',
  'telegram-group-management-2026',
  'telegram-bot-marketing-2026',
  'telegram-ads-platform-2026',
  'telegram-content-strategy-2026',
  'telegram-engagement-tips-2026',
  'telegram-analytics-guide-2026',
  'telegram-premium-features-2026',
  'telegram-sticker-marketing-2026',
  'telegram-voice-chat-2026',
  'telegram-mini-apps-2026',
  'telegram-monetization-2026',
  'telegram-cross-promotion-2026',
  'telegram-community-building-2026',
  'telegram-news-channel-2026',
  'telegram-business-channel-2026',
  'telegram-growth-hacks-2026',
  'telegram-scheduling-posts-2026',
  'telegram-member-retention-2026',

  // 트위치 (20)
  'twitch-streamer-growth-guide-2026',
  'twitch-followers-viewers-guide-2026',
  'twitch-affiliate-partner-2026',
  'twitch-monetization-guide-2026',
  'twitch-obs-setup-2026',
  'twitch-overlay-design-2026',
  'twitch-chat-engagement-2026',
  'twitch-raid-host-guide-2026',
  'twitch-schedule-consistency-2026',
  'twitch-networking-tips-2026',
  'twitch-clips-highlights-2026',
  'twitch-channel-points-2026',
  'twitch-emotes-guide-2026',
  'twitch-vod-content-2026',
  'twitch-category-selection-2026',
  'twitch-title-optimization-2026',
  'twitch-panels-setup-2026',
  'twitch-alerts-setup-2026',
  'twitch-music-dmca-2026',
  'twitch-community-building-2026',

  // 디스코드 (20)
  'discord-server-growth-guide-2026',
  'discord-server-members-guide-2026',
  'discord-bot-setup-2026',
  'discord-roles-permissions-2026',
  'discord-engagement-tips-2026',
  'discord-monetization-2026',
  'discord-events-setup-2026',
  'discord-moderation-guide-2026',
  'discord-welcome-screen-2026',
  'discord-channels-organization-2026',
  'discord-nitro-perks-2026',
  'discord-server-boost-2026',
  'discord-community-guidelines-2026',
  'discord-integration-guide-2026',
  'discord-voice-channels-2026',
  'discord-stage-channels-2026',
  'discord-forum-channels-2026',
  'discord-thread-channels-2026',
  'discord-automod-setup-2026',
  'discord-partnership-program-2026',

  // 스레드 (20)
  'threads-marketing-guide-2026',
  'threads-followers-growth-2026',
  'threads-algorithm-2026',
  'threads-content-strategy-2026',
  'threads-engagement-tips-2026',
  'threads-instagram-integration-2026',
  'threads-hashtag-strategy-2026',
  'threads-posting-schedule-2026',
  'threads-viral-content-2026',
  'threads-profile-optimization-2026',
  'threads-business-use-2026',
  'threads-text-formatting-2026',
  'threads-quote-posts-2026',
  'threads-reposts-strategy-2026',
  'threads-mentions-tags-2026',
  'threads-analytics-guide-2026',
  'threads-cross-posting-2026',
  'threads-community-building-2026',
  'threads-brand-voice-2026',
  'threads-growth-hacks-2026',

  // SMM/기타 (21)
  'smm-panel-comparison-guide-2026',
  'smm-marketing-trends-2026',
  'smm-automation-tools-2026',
  'smm-roi-calculation-2026',
  'smm-strategy-guide-2026',
  'smm-content-calendar-2026',
  'smm-analytics-tools-2026',
  'smm-influencer-marketing-2026',
  'smm-paid-vs-organic-2026',
  'smm-crisis-management-2026',
  'smm-brand-awareness-2026',
  'smm-lead-generation-2026',
  'smm-customer-service-2026',
  'smm-user-generated-content-2026',
  'smm-video-marketing-2026',
  'smm-storytelling-2026',
  'smm-community-management-2026',
  'smm-competitor-analysis-2026',
  'smm-budget-planning-2026',
  'smm-kpi-metrics-2026',
  'smm-case-studies-2026',
];

// ============================================
// URL 생성
// ============================================
const urls = [
  `https://${HOST}/`,
  `https://${HOST}/blog`,
  `https://${HOST}/login`,
  `https://${HOST}/services/youtube`,
  `https://${HOST}/services/instagram`,
  `https://${HOST}/services/tiktok`,
  `https://${HOST}/services/facebook`,
  `https://${HOST}/services/telegram`,
  `https://${HOST}/reseller`,
];

// 블로그 포스트 URL 추가
blogSlugs.forEach(slug => {
  urls.push(`https://${HOST}/blog/${slug}`);
});

console.log(`📊 총 ${urls.length}개 URL 준비 완료\n`);

// ============================================
// 인증 파일 생성
// ============================================
const publicDir = path.join(__dirname, '../public');
const keyFilePath = path.join(publicDir, KEY_FILE_NAME);

fs.writeFileSync(keyFilePath, KEY);
console.log(`✅ 인증 파일 생성: public/${KEY_FILE_NAME}\n`);

// ============================================
// IndexNow API 호출
// ============================================
async function submitToIndexNow() {
  // URL을 100개씩 나눠서 제출 (API 제한)
  const chunkSize = 100;
  const chunks = [];

  for (let i = 0; i < urls.length; i += chunkSize) {
    chunks.push(urls.slice(i, i + chunkSize));
  }

  console.log(`🚀 IndexNow API 호출 시작 (${chunks.length}개 배치)\n`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const payload = JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY_FILE_NAME}`,
      urlList: chunk
    });

    const options = {
      hostname: 'api.indexnow.org',
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 202) {
            console.log(`✅ 배치 ${i + 1}/${chunks.length}: ${chunk.length}개 URL 제출 성공`);
          } else {
            console.log(`⚠️ 배치 ${i + 1}: 상태 ${res.statusCode} - ${data}`);
          }
          resolve();
        });
      });

      req.on('error', (e) => {
        console.error(`❌ 배치 ${i + 1} 에러:`, e.message);
        resolve();
      });

      req.write(payload);
      req.end();
    });

    // API 부하 방지를 위한 딜레이
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n🎉 완료! 총 ${urls.length}개 URL을 IndexNow에 제출했습니다.`);
  console.log(`\n📌 다음 단계:`);
  console.log(`1. 배포: npx vercel --prod`);
  console.log(`2. 인증 확인: https://${HOST}/${KEY_FILE_NAME}`);
  console.log(`3. Bing Webmaster Tools에서 제출 상태 확인`);
}

submitToIndexNow();
