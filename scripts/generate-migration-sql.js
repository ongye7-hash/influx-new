const fs = require('fs');
const path = require('path');

// Load filtered services
const filteredServices = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'filtered_services_korea.json'), 'utf8')
);

// Configuration
const EXCHANGE_RATE = 1473; // KRW/USD - 실시간 환율 (2026-01-22)
const MARGIN = 1.5; // 50% markup
const YTRESELLER_PROVIDER_ID = '493b3f2e-d90a-41af-9df0-ae7453cc238e';

// Platform detection (same as import script)
const PLATFORM_PATTERNS = [
  { platform: 'twitter', patterns: ['twitter', '트위터', 'x / twitter', 'x/twitter', 'x -'] },
  { platform: 'facebook', patterns: ['facebook', '페이스북', 'fb '] },
  { platform: 'instagram', patterns: ['instagram', '인스타', 'ig '] },
  { platform: 'youtube', patterns: ['youtube', '유튜브', 'yt '] },
  { platform: 'tiktok', patterns: ['tiktok', '틱톡'] },
  { platform: 'telegram', patterns: ['telegram', '텔레그램'] },
  { platform: 'twitch', patterns: ['twitch', '트위치'] },
  { platform: 'coinmarketcap', patterns: ['coinmarketcap', 'cmc', '코인마켓캡'] },
];

function detectPlatform(service) {
  const name = (service.name || '').toLowerCase();
  const category = (service.category || '').toLowerCase();

  for (const { platform, patterns } of PLATFORM_PATTERNS) {
    if (patterns.some(p => category.includes(p))) return platform;
  }
  for (const { platform, patterns } of PLATFORM_PATTERNS) {
    if (patterns.some(p => name.includes(p))) return platform;
  }
  return 'other';
}

// ============================================
// 영어 → 한국어 번역 함수
// 한국인이 쉽게 이해할 수 있도록 번역
// ============================================
function translateToKorean(englishDesc) {
  let desc = englishDesc;

  // 서비스 유형 번역
  const serviceTypes = {
    'views': '조회수',
    'view': '조회수',
    'followers': '팔로워',
    'follower': '팔로워',
    'likes': '좋아요',
    'like': '좋아요',
    'comments': '댓글',
    'comment': '댓글',
    'comment reply likes': '댓글 답글 좋아요',
    'subscribers': '구독자',
    'subscriber': '구독자',
    'members': '멤버',
    'member': '멤버',
    'retweets': '리트윗',
    'retweet': '리트윗',
    'reposts': '리포스트',
    'repost': '리포스트',
    'impressions': '노출수',
    'impression': '노출수',
    'shares': '공유',
    'share': '공유',
    'saves': '저장',
    'save': '저장',
    'watch time': '시청시간',
    'watch hours': '시청시간',
    'live stream': '라이브',
    'livestream': '라이브',
    'shorts': '쇼츠',
    'reels': '릴스',
    'story': '스토리',
    'stories': '스토리',
    'post': '게시물',
    'posts': '게시물',
    'video': '영상',
    'videos': '영상',
    'channel': '채널',
    'profile': '프로필',
    'page': '페이지',
    'group': '그룹',
    'votes': '투표',
    'vote': '투표',
    'plays': '재생',
    'play': '재생',
  };

  // 플랫폼 번역
  const platforms = {
    'youtube': '유튜브',
    'instagram': '인스타그램',
    'tiktok': '틱톡',
    'twitter': '트위터',
    'x / twitter': 'X(트위터)',
    'facebook': '페이스북',
    'telegram': '텔레그램',
    'twitch': '트위치',
    'discord': '디스코드',
    'spotify': '스포티파이',
    'coinmarketcap': '코인마켓캡',
    'linkedin': '링크드인',
    'threads': '쓰레드',
  };

  // 품질/특성 번역
  const qualities = {
    'real accounts': '실제 계정',
    'real users': '실제 유저',
    'real': '실제',
    'active accounts': '활성 계정',
    'active users': '활성 유저',
    'active': '활성',
    'high quality': '고품질',
    'hq': '고품질',
    'premium': '프리미엄',
    'organic': '자연 유입',
    'bot': '봇',
    'mixed': '혼합',
    'cheap': '저렴',
    'fast': '빠른',
    'slow': '느린',
    'stable': '안정적',
    'non drop': '드롭없음',
    'no drop': '드롭없음',
    'low drop': '드롭적음',
  };

  // 기간/시간 번역
  const timeTerms = {
    'instant start': '즉시 시작',
    'instant': '즉시',
    'lifetime': '평생',
    'days': '일',
    'day': '일',
    'hours': '시간',
    'hour': '시간',
    'minutes': '분',
    'minute': '분',
    'seconds': '초',
    'second': '초',
  };

  // 기타 번역 (긴 표현부터 정렬해서 우선 처리)
  const otherTerms = {
    // 긴 표현 먼저
    'south korea': '한국',
    'no refill': '보충없음',
    'cancel enable': '취소가능',
    'browse features': '탐색',
    // 중간 길이
    'korean': '한국',
    'korea': '한국',
    'worldwide': '전세계',
    'global': '글로벌',
    'unlimited': '무제한',
    'suggested': '추천',
    'retention': '시청유지',
    'source': '유입경로',
    'search': '검색',
    'refill': '보충',
    'cancel': '취소',
    'speed': '속도',
    'drop': '드롭',
    'max': '최대',
    'min': '최소',
  };

  // 숫자 단위 변환 (5K → 5천, 50K → 5만, 10M → 1000만)
  desc = desc.replace(/(\d+)K/gi, (match, num) => {
    const n = parseInt(num);
    if (n >= 10) return `${n / 10}만`;  // 10K = 1만, 50K = 5만, 100K = 10만
    return `${n}천`;  // 5K = 5천
  });
  desc = desc.replace(/(\d+)M/gi, (match, num) => {
    const n = parseInt(num);
    return `${n * 100}만`;  // 1M = 100만, 10M = 1000만
  });

  // 플랫폼 번역 (대소문자 구분 없이)
  for (const [eng, kor] of Object.entries(platforms)) {
    const regex = new RegExp(eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    desc = desc.replace(regex, kor);
  }

  // 서비스 유형 번역 (긴 것부터)
  const sortedServiceTypes = Object.entries(serviceTypes).sort((a, b) => b[0].length - a[0].length);
  for (const [eng, kor] of sortedServiceTypes) {
    const regex = new RegExp(`\\b${eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    desc = desc.replace(regex, kor);
  }

  // 품질 번역
  for (const [eng, kor] of Object.entries(qualities)) {
    const regex = new RegExp(eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    desc = desc.replace(regex, kor);
  }

  // 시간 번역
  for (const [eng, kor] of Object.entries(timeTerms)) {
    const regex = new RegExp(eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    desc = desc.replace(regex, kor);
  }

  // 기타 번역
  for (const [eng, kor] of Object.entries(otherTerms)) {
    const regex = new RegExp(eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    desc = desc.replace(regex, kor);
  }

  // 100% 같은 퍼센트 처리
  desc = desc.replace(/100%\s*/g, '100% ');

  // 불필요한 공백 정리
  desc = desc.replace(/\s+/g, ' ').trim();

  // [ ] 안의 내용 정리
  desc = desc.replace(/\[\s+/g, '[');
  desc = desc.replace(/\s+\]/g, ']');

  // | 를 보기 좋게
  desc = desc.replace(/\s*\|\s*/g, ' | ');

  return desc;
}

// Create Korean-friendly name
function createKoreanName(service, platform) {
  const name = service.name;

  // Extract key info from name
  const hasKorea = /korea|한국|🇰🇷/i.test(name);
  const hasWorldwide = /worldwide|global|전세계/i.test(name);

  // Platform translations
  const platformKr = {
    youtube: '유튜브',
    instagram: '인스타그램',
    tiktok: '틱톡',
    twitter: 'X(트위터)',
    facebook: '페이스북',
    telegram: '텔레그램',
    twitch: '트위치',
    other: '기타'
  };

  // Service type detection
  let serviceType = '';
  const nameLower = name.toLowerCase();
  if (nameLower.includes('view') || nameLower.includes('조회')) serviceType = '조회수';
  else if (nameLower.includes('follower') || nameLower.includes('팔로워')) serviceType = '팔로워';
  else if (nameLower.includes('like') || nameLower.includes('좋아요')) serviceType = '좋아요';
  else if (nameLower.includes('comment') || nameLower.includes('댓글')) serviceType = '댓글';
  else if (nameLower.includes('subscriber') || nameLower.includes('구독')) serviceType = '구독자';
  else if (nameLower.includes('member') || nameLower.includes('멤버')) serviceType = '그룹 멤버';
  else if (nameLower.includes('retweet') || nameLower.includes('리트윗')) serviceType = '리트윗';
  else if (nameLower.includes('impression')) serviceType = '노출';
  else if (nameLower.includes('clap')) serviceType = '박수';
  else serviceType = '서비스';

  // Location suffix
  let location = '';
  if (hasKorea) location = '[한국]';
  else if (hasWorldwide) location = '[글로벌]';

  // Quality info
  const hasRefill = service.refill;
  const refillInfo = hasRefill ? '♻️보충' : '';

  return `${platformKr[platform] || platform} ${serviceType} ${location} ${refillInfo}`.trim().replace(/\s+/g, ' ');
}

// Generate SQL
let sql = `-- ============================================
-- YTReseller Korea/Global Services Import
-- Generated: ${new Date().toISOString()}
-- Total Services: ${filteredServices.length}
-- ============================================

-- ============================================
-- 1. Add Missing Categories
-- ============================================
INSERT INTO categories (name, slug, sort_order, is_active) VALUES
('Twitch', 'twitch', 7, true),
('CoinMarketCap', 'coinmarketcap', 8, true),
('기타 플랫폼', 'other', 99, true)
ON CONFLICT (slug) DO UPDATE SET
  is_active = true;

-- ============================================
-- 2. Insert Services
-- ============================================
`;

// Group by platform for organization
const grouped = {};
for (const service of filteredServices) {
  const platform = detectPlatform(service);
  if (!grouped[platform]) grouped[platform] = [];
  grouped[platform].push(service);
}

// Generate INSERT statements
for (const [platform, services] of Object.entries(grouped)) {
  sql += `\n-- ${platform.toUpperCase()} Services (${services.length})\n`;

  for (const service of services) {
    const costUSD = parseFloat(service.rate);
    const costKRW = costUSD * EXCHANGE_RATE;
    const priceKRW = Math.ceil(costKRW * MARGIN);

    const koreanName = createKoreanName(service, platform);

    // 영어 설명을 한국어로 번역
    const description = translateToKorean(service.name);

    // Escape single quotes
    const escapedName = koreanName.replace(/'/g, "''");
    const escapedDesc = description.replace(/'/g, "''");
    const escapedOriginal = service.name.replace(/'/g, "''");

    // Refill days
    const refillDays = service.refill ? 30 : 0;

    sql += `INSERT INTO services (
  provider_id, category_id, provider_service_id, name, description, platform,
  rate, price, min_quantity, max_quantity, is_active, is_refill, is_cancel, refill_days, sort_order
) SELECT
  '${YTRESELLER_PROVIDER_ID}',
  (SELECT id FROM categories WHERE slug = '${platform}' LIMIT 1),
  '${service.service}',
  '${escapedName}',
  '${escapedDesc}',
  '${platform}',
  ${costKRW.toFixed(2)},
  ${priceKRW},
  ${service.min},
  ${Math.min(service.max, 10000000)},
  true,
  ${service.refill},
  ${service.cancel},
  ${refillDays},
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM services)
WHERE NOT EXISTS (
  SELECT 1 FROM services WHERE provider_service_id = '${service.service}'
);

`;
  }
}

sql += `
-- ============================================
-- 3. Update Featured Services
-- ============================================
UPDATE services SET is_featured = true, sort_order = 1
WHERE name LIKE '%유튜브%조회수%한국%';

UPDATE services SET is_featured = true, sort_order = 2
WHERE name LIKE '%인스타그램%좋아요%한국%';

UPDATE services SET is_featured = true, sort_order = 3
WHERE name LIKE '%트위터%한국%';

-- ============================================
-- Import Complete
-- ============================================
`;

// Write SQL file
const outputPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260122000001_import_ytreseller_korea.sql');
fs.writeFileSync(outputPath, sql);

console.log(`Migration SQL generated: ${outputPath}`);
console.log(`Total services: ${filteredServices.length}`);
console.log('\nPlatform breakdown:');
for (const [platform, services] of Object.entries(grouped)) {
  console.log(`  ${platform}: ${services.length}`);
}
