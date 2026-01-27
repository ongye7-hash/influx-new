/**
 * IndexNow - Bing/Yandex에 URL 색인 요청
 *
 * 실행: node scripts/indexnow-submit.js
 */

const https = require('https');

const SITE_URL = 'https://www.influx-lab.com';
const INDEXNOW_KEY = 'influx-indexnow-key-2026-abc123';

// 모든 URL 목록
const urls = [
  // 메인 페이지
  '/',
  '/blog',
  '/services/instagram',
  '/services/youtube',
  '/services/tiktok',
  '/services/facebook',
  '/services/telegram',
  '/login',

  // 블로그 글 - YouTube
  '/blog/youtube-seo-optimization-guide',
  '/blog/youtube-thumbnail-strategy',
  '/blog/youtube-community-tab-guide',
  '/blog/youtube-membership-monetization',
  '/blog/youtube-live-streaming-guide',
  '/blog/youtube-analytics-deep-dive',
  '/blog/youtube-sponsorship-guide',
  '/blog/youtube-playlist-strategy',
  '/blog/youtube-shorts-algorithm',
  '/blog/youtube-end-screen-cards',
  '/blog/youtube-copyright-guide',
  '/blog/youtube-multi-language-strategy',
  '/blog/youtube-premiere-strategy',
  '/blog/youtube-collaboration-guide',
  '/blog/youtube-content-calendar',
  '/blog/youtube-audience-retention',
  '/blog/youtube-ctr-optimization',
  '/blog/youtube-niche-selection',
  '/blog/youtube-equipment-guide',
  '/blog/youtube-monetization-requirements',

  // 블로그 글 - Instagram
  '/blog/instagram-hashtag-strategy',
  '/blog/instagram-story-engagement',
  '/blog/instagram-carousel-guide',
  '/blog/instagram-shopping-setup',
  '/blog/instagram-analytics-guide',
  '/blog/instagram-reels-algorithm',
  '/blog/instagram-influencer-collaboration',
  '/blog/instagram-bio-optimization',
  '/blog/instagram-content-pillars',
  '/blog/instagram-engagement-pods',
  '/blog/instagram-giveaway-strategy',
  '/blog/instagram-ugc-strategy',
  '/blog/instagram-aesthetic-guide',
  '/blog/instagram-caption-formula',
  '/blog/instagram-growth-timeline',
  '/blog/instagram-follower-growth-guide-2026',

  // 블로그 글 - TikTok
  '/blog/tiktok-sound-strategy',
  '/blog/tiktok-hashtag-research',
  '/blog/tiktok-duet-stitch-guide',
  '/blog/tiktok-editing-tips',
  '/blog/tiktok-profile-optimization',
  '/blog/tiktok-challenge-creation',
  '/blog/tiktok-analytics-guide',
  '/blog/tiktok-live-gifts-guide',
  '/blog/tiktok-creator-fund',
  '/blog/tiktok-brand-partnership',
  '/blog/tiktok-content-calendar',
  '/blog/tiktok-trend-prediction',
  '/blog/tiktok-series-content',
  '/blog/tiktok-comment-strategy',
  '/blog/tiktok-posting-time',
  '/blog/tiktok-hook-techniques',
  '/blog/tiktok-storytelling-guide',
  '/blog/tiktok-niche-growth',
  '/blog/tiktok-viral-formula',
  '/blog/tiktok-shop-guide',

  // 블로그 글 - Facebook
  '/blog/facebook-page-optimization',
  '/blog/facebook-group-growth',
  '/blog/facebook-ads-beginner',
  '/blog/facebook-reels-strategy',
  '/blog/facebook-messenger-marketing',
  '/blog/facebook-live-guide',
  '/blog/facebook-pixel-setup',
  '/blog/facebook-event-marketing',
  '/blog/facebook-marketplace-tips',
  '/blog/facebook-content-strategy',
  '/blog/facebook-audience-insights',
  '/blog/facebook-engagement-tactics',
  '/blog/facebook-video-optimization',
  '/blog/facebook-community-building',
  '/blog/facebook-crisis-management',
  '/blog/facebook-local-business',

  // 블로그 글 - Twitter/X
  '/blog/twitter-algorithm-guide',
  '/blog/twitter-thread-strategy',
  '/blog/twitter-spaces-guide',
  '/blog/twitter-profile-optimization',
  '/blog/twitter-engagement-tactics',
  '/blog/twitter-analytics-guide',
  '/blog/twitter-monetization-guide',
  '/blog/twitter-automation-tools',
  '/blog/twitter-hashtag-strategy',
  '/blog/twitter-viral-tweets',
  '/blog/twitter-community-building',
  '/blog/twitter-brand-voice',
  '/blog/twitter-customer-service',
  '/blog/twitter-trend-jacking',
  '/blog/twitter-list-strategy',
  '/blog/twitter-dm-marketing',

  // 블로그 글 - Telegram
  '/blog/telegram-channel-growth',
  '/blog/telegram-bot-marketing',
  '/blog/telegram-content-strategy',
  '/blog/telegram-monetization-guide',
  '/blog/telegram-analytics-tools',
  '/blog/telegram-premium-features',
  '/blog/telegram-community-management',
  '/blog/telegram-cross-promotion',
  '/blog/telegram-content-calendar',
  '/blog/telegram-engagement-tactics',
  '/blog/telegram-niche-channels',
  '/blog/telegram-group-vs-channel',
  '/blog/telegram-sticker-marketing',
  '/blog/telegram-voice-chat-guide',
  '/blog/telegram-mini-apps',
  '/blog/telegram-security-privacy',
  '/blog/telegram-ads-platform',
  '/blog/telegram-influencer-outreach',
  '/blog/telegram-content-repurposing',
  '/blog/telegram-crisis-management',
  '/blog/telegram-automation-guide',

  // 블로그 글 - Twitch
  '/blog/twitch-streamer-setup',
  '/blog/twitch-affiliate-guide',
  '/blog/twitch-overlay-design',
  '/blog/twitch-chat-engagement',
  '/blog/twitch-subscriber-perks',
  '/blog/twitch-emote-guide',
  '/blog/twitch-raid-host-strategy',
  '/blog/twitch-schedule-consistency',
  '/blog/twitch-category-selection',
  '/blog/twitch-networking-tips',
  '/blog/twitch-monetization-guide',
  '/blog/twitch-analytics-guide',
  '/blog/twitch-brand-deals',
  '/blog/twitch-community-building',
  '/blog/twitch-vod-highlights',
  '/blog/twitch-multistream-guide',
  '/blog/twitch-charity-streams',
  '/blog/twitch-esports-streaming',
  '/blog/twitch-irl-streaming',
  '/blog/twitch-music-streaming',

  // 블로그 글 - Discord
  '/blog/discord-server-setup',
  '/blog/discord-role-management',
  '/blog/discord-bot-essentials',
  '/blog/discord-moderation-guide',
  '/blog/discord-community-growth',
  '/blog/discord-monetization-guide',
  '/blog/discord-event-hosting',
  '/blog/discord-engagement-tactics',
  '/blog/discord-verification-system',
  '/blog/discord-partnership-program',
  '/blog/discord-stage-channels',
  '/blog/discord-forum-channels',
  '/blog/discord-server-templates',
  '/blog/discord-nitro-perks',
  '/blog/discord-security-guide',
  '/blog/discord-integration-guide',
  '/blog/discord-analytics-tools',
  '/blog/discord-onboarding-flow',
  '/blog/discord-content-strategy',

  // 블로그 글 - Threads
  '/blog/threads-creator-guide',
  '/blog/threads-business-marketing',
  '/blog/threads-content-strategy',
  '/blog/threads-engagement-tactics',
  '/blog/threads-growth-hacks',
  '/blog/threads-analytics-guide',
  '/blog/threads-monetization-future',
  '/blog/threads-cross-posting',
  '/blog/threads-algorithm-guide',
  '/blog/threads-community-building',
  '/blog/threads-brand-voice',
  '/blog/threads-viral-content',
  '/blog/threads-influencer-guide',
  '/blog/threads-vs-twitter',

  // 블로그 글 - SMM 일반
  '/blog/smm-panel-comparison',
  '/blog/smm-competitor-analysis',
  '/blog/smm-crisis-management',
  '/blog/smm-budget-planning',
  '/blog/smm-automation-guide',
  '/blog/smm-roi-measurement',
  '/blog/smm-content-repurposing',
  '/blog/smm-influencer-outreach',
  '/blog/smm-brand-consistency',
  '/blog/smm-trend-monitoring',
  '/blog/smm-ab-testing-guide',
  '/blog/smm-user-generated-content',
  '/blog/smm-community-management',
  '/blog/smm-paid-vs-organic',
  '/blog/smm-analytics-dashboard',
  '/blog/smm-content-calendar-template',
  '/blog/smm-platform-selection',
  '/blog/smm-goal-setting',
  '/blog/smm-team-structure',
];

async function submitToIndexNow(urlList) {
  const fullUrls = urlList.map(path => SITE_URL + path);

  const data = JSON.stringify({
    host: 'www.influx-lab.com',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: fullUrls
  });

  const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        console.log(`IndexNow API 응답: ${res.statusCode}`);
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log('✅ 성공적으로 제출됨!');
          resolve(true);
        } else {
          console.log('응답:', responseData);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ 에러:', e.message);
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function submitToBing(urlList) {
  const fullUrls = urlList.map(path => SITE_URL + path);

  const data = JSON.stringify({
    host: 'www.influx-lab.com',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: fullUrls
  });

  const options = {
    hostname: 'www.bing.com',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        console.log(`Bing 응답: ${res.statusCode}`);
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log('✅ Bing에 성공적으로 제출됨!');
          resolve(true);
        } else {
          console.log('응답:', responseData);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Bing 에러:', e.message);
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function submitToYandex(urlList) {
  const fullUrls = urlList.map(path => SITE_URL + path);

  const data = JSON.stringify({
    host: 'www.influx-lab.com',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: fullUrls
  });

  const options = {
    hostname: 'yandex.com',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        console.log(`Yandex 응답: ${res.statusCode}`);
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log('✅ Yandex에 성공적으로 제출됨!');
          resolve(true);
        } else {
          console.log('응답:', responseData);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Yandex 에러:', e.message);
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 IndexNow 제출 시작\n');
  console.log(`📊 총 URL 수: ${urls.length}개\n`);
  console.log('='.repeat(50) + '\n');

  // IndexNow API (여러 검색엔진에 동시 전달)
  console.log('1️⃣ IndexNow API 제출 중...');
  await submitToIndexNow(urls);

  console.log('\n2️⃣ Bing 직접 제출 중...');
  await submitToBing(urls);

  console.log('\n3️⃣ Yandex 직접 제출 중...');
  await submitToYandex(urls);

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ 완료!');
  console.log('\n📌 참고:');
  console.log('- Bing/Yandex는 보통 24-48시간 내 색인');
  console.log('- Google은 Search Console에서 수동 요청 필요');
  console.log(`\n📋 Google용 URL ${urls.length}개가 준비되었습니다.`);
}

main().catch(console.error);
