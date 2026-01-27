const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

// 플랫폼 감지 패턴
const PLATFORM_PATTERNS = {
  youtube: /youtube|yt\s/i,
  instagram: /instagram|insta\s|ig\s/i,
  facebook: /facebook|fb\s/i,
  tiktok: /tiktok|tik\s?tok/i,
  telegram: /telegram|tg\s/i,
  twitter: /twitter|tweet|x\s(follower|like|view)/i,
  spotify: /spotify/i,
  discord: /discord/i,
  twitch: /twitch/i,
  threads: /threads/i,
  linkedin: /linkedin/i,
  pinterest: /pinterest/i,
  snapchat: /snapchat/i,
  soundcloud: /soundcloud/i,
  clubhouse: /clubhouse/i,
  vk: /^vk\s|vkontakte/i,
  reddit: /reddit/i,
  tumblr: /tumblr/i,
  quora: /quora/i,
  dailymotion: /dailymotion/i,
  vimeo: /vimeo/i,
  likee: /likee/i,
  kwai: /kwai/i,
  shazam: /shazam/i,
  deezer: /deezer/i,
  apple: /apple music|itunes/i,
  website: /website|traffic|seo|web\s/i,
  google: /google|gmb|google map|google review/i,
  coinmarketcap: /coinmarketcap|cmc/i,
};

// 서브카테고리 분류 규칙
const SUBCATEGORY_RULES = {
  youtube: [
    { type: 'live', patterns: [/live\s*stream/i, /concurrent/i, /라이브/], exclude: [] },
    { type: 'subscribers', patterns: [/subscriber/i, /구독자/i, /sub\s/i], exclude: [] },
    { type: 'views', patterns: [/view/i, /조회/i], exclude: [/live/i, /stream/i, /concurrent/i] },
    { type: 'likes', patterns: [/like/i, /좋아요/i], exclude: [/dislike/i] },
    { type: 'dislikes', patterns: [/dislike/i], exclude: [] },
    { type: 'comments', patterns: [/comment/i, /댓글/i], exclude: [] },
    { type: 'watchtime', patterns: [/watch\s*time/i, /watch\s*hour/i, /시청시간/i], exclude: [] },
    { type: 'shares', patterns: [/share/i, /공유/i], exclude: [] },
    { type: 'shorts', patterns: [/shorts/i, /쇼츠/i], exclude: [] },
    { type: 'premiere', patterns: [/premiere/i], exclude: [] },
  ],
  instagram: [
    { type: 'live', patterns: [/live\s*stream/i, /live\s*view/i, /라이브/], exclude: [] },
    { type: 'followers', patterns: [/follower/i, /팔로워/i], exclude: [] },
    { type: 'likes', patterns: [/like/i, /좋아요/i], exclude: [] },
    { type: 'views', patterns: [/view/i, /reel/i, /조회/i, /릴스/i], exclude: [/live/i, /story/i] },
    { type: 'comments', patterns: [/comment/i, /댓글/i], exclude: [] },
    { type: 'story', patterns: [/story/i, /스토리/i], exclude: [] },
    { type: 'saves', patterns: [/save/i, /저장/i], exclude: [] },
    { type: 'reach', patterns: [/reach/i, /impression/i, /리치/i], exclude: [] },
    { type: 'auto-likes', patterns: [/auto\s*like/i, /자동/i], exclude: [] },
  ],
  facebook: [
    { type: 'live', patterns: [/live\s*stream/i, /live\s*view/i, /라이브/], exclude: [] },
    { type: 'page-likes', patterns: [/page\s*like/i, /page\s*follower/i, /페이지\s*좋아요/i], exclude: [] },
    { type: 'profile-followers', patterns: [/profile\s*follower/i, /friend/i, /프로필/i], exclude: [/page/i] },
    { type: 'post-likes', patterns: [/post\s*like/i, /reaction/i, /게시물/i, /반응/i], exclude: [] },
    { type: 'views', patterns: [/video\s*view/i, /reel\s*view/i, /영상\s*조회/i], exclude: [/live/i] },
    { type: 'comments', patterns: [/comment/i, /댓글/i], exclude: [] },
    { type: 'shares', patterns: [/share/i, /공유/i], exclude: [] },
    { type: 'group', patterns: [/group\s*member/i, /그룹/i], exclude: [] },
    { type: 'event', patterns: [/event/i, /이벤트/i], exclude: [] },
    { type: 'rating', patterns: [/rating/i, /review/i, /평점/i], exclude: [] },
  ],
  tiktok: [
    { type: 'live', patterns: [/live\s*stream/i, /live\s*view/i, /라이브/], exclude: [] },
    { type: 'followers', patterns: [/follower/i, /팔로워/i], exclude: [] },
    { type: 'likes', patterns: [/like/i, /heart/i, /좋아요/i], exclude: [] },
    { type: 'views', patterns: [/view/i, /조회/i], exclude: [/live/i] },
    { type: 'comments', patterns: [/comment/i, /댓글/i], exclude: [] },
    { type: 'shares', patterns: [/share/i, /공유/i], exclude: [] },
    { type: 'saves', patterns: [/save/i, /favorite/i, /저장/i], exclude: [] },
  ],
  telegram: [
    { type: 'members', patterns: [/member/i, /멤버/i], exclude: [] },
    { type: 'views', patterns: [/view/i, /조회/i], exclude: [] },
    { type: 'reactions', patterns: [/reaction/i, /반응/i], exclude: [] },
    { type: 'comments', patterns: [/comment/i, /댓글/i], exclude: [] },
    { type: 'votes', patterns: [/vote/i, /poll/i, /투표/i], exclude: [] },
    { type: 'subscribers', patterns: [/subscriber/i, /구독/i], exclude: [] },
  ],
  twitter: [
    { type: 'followers', patterns: [/follower/i, /팔로워/i], exclude: [] },
    { type: 'likes', patterns: [/like/i, /좋아요/i], exclude: [] },
    { type: 'retweets', patterns: [/retweet/i, /rt\s/i, /리트윗/i], exclude: [] },
    { type: 'views', patterns: [/view/i, /impression/i, /조회/i], exclude: [] },
    { type: 'comments', patterns: [/comment/i, /reply/i, /댓글/i], exclude: [] },
    { type: 'bookmarks', patterns: [/bookmark/i], exclude: [] },
    { type: 'space', patterns: [/space/i, /listener/i], exclude: [] },
  ],
  spotify: [
    { type: 'plays', patterns: [/play/i, /stream/i, /재생/i], exclude: [] },
    { type: 'followers', patterns: [/follower/i, /팔로워/i], exclude: [] },
    { type: 'monthly-listeners', patterns: [/monthly\s*listener/i], exclude: [] },
    { type: 'saves', patterns: [/save/i, /저장/i], exclude: [] },
    { type: 'playlist', patterns: [/playlist/i], exclude: [] },
  ],
  discord: [
    { type: 'members', patterns: [/member/i, /멤버/i], exclude: [] },
    { type: 'online', patterns: [/online/i, /온라인/i], exclude: [] },
    { type: 'boosts', patterns: [/boost/i, /부스트/i], exclude: [] },
  ],
  twitch: [
    { type: 'followers', patterns: [/follower/i, /팔로워/i], exclude: [] },
    { type: 'views', patterns: [/view/i, /조회/i], exclude: [] },
    { type: 'chatters', patterns: [/chat/i, /채팅/i], exclude: [] },
    { type: 'clip-views', patterns: [/clip/i, /클립/i], exclude: [] },
  ],
  threads: [
    { type: 'followers', patterns: [/follower/i, /팔로워/i], exclude: [] },
    { type: 'likes', patterns: [/like/i, /좋아요/i], exclude: [] },
    { type: 'reposts', patterns: [/repost/i], exclude: [] },
    { type: 'comments', patterns: [/comment/i, /댓글/i], exclude: [] },
  ],
};

// 한국 타겟 감지
function isKoreanTargeted(name) {
  return /korea|korean|한국|🇰🇷|🇰🇵|south\s*korea/i.test(name);
}

// 플랫폼 감지
function detectPlatform(name, category) {
  // 먼저 카테고리 이름으로 플랫폼 추정
  const catLower = (category || '').toLowerCase();
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(catLower)) return platform;
  }

  // 서비스 이름으로 플랫폼 추정
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(name)) return platform;
  }

  return 'other';
}

// 서브카테고리 타입 감지
function detectSubcategoryType(name, platform) {
  const rules = SUBCATEGORY_RULES[platform];
  if (!rules) return 'other';

  for (const rule of rules) {
    const matchesPattern = rule.patterns.some(p => p.test(name));
    const matchesExclude = rule.exclude.some(p => p.test(name));

    if (matchesPattern && !matchesExclude) {
      return rule.type;
    }
  }

  return 'other';
}

// 가격 파싱 (USD → KRW)
function parsePrice(priceStr) {
  if (!priceStr) return null;
  const match = priceStr.match(/\$?([\d,.]+)/);
  if (!match) return null;
  const usd = parseFloat(match[1].replace(/,/g, ''));
  return Math.round(usd * 1400); // USD to KRW 환율
}

// 수량 파싱
function parseQuantity(str) {
  if (!str) return null;
  const match = str.match(/([\d,]+)\s*[kKmM]?/);
  if (!match) return null;
  let num = parseInt(match[1].replace(/,/g, ''), 10);
  if (/m/i.test(str)) num *= 1000000;
  else if (/k/i.test(str)) num *= 1000;
  return num;
}

// 소스 파일 파싱
function parseSourceFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const services = [];
  let currentCategory = '';
  let currentProvider = '';
  let lineNum = 0;

  for (const line of lines) {
    lineNum++;
    const trimmed = line.trim();

    // 프로바이더 감지
    if (trimmed.startsWith('PROVIDER:')) {
      currentProvider = trimmed.replace('PROVIDER:', '').trim();
      continue;
    }

    // 카테고리 헤더 감지 (예: " Facebook Page Likes")
    if (trimmed.startsWith(' ') && !trimmed.match(/^\d/) && trimmed.length > 3 && trimmed.length < 100) {
      // 이게 서비스가 아닌 카테고리인지 확인
      if (!trimmed.includes('$') && !trimmed.match(/\d+\s*-\s*\d/)) {
        currentCategory = trimmed.trim();
        continue;
      }
    }

    // 서비스 라인 파싱 (ID가 있는 라인)
    // 형식: ID[탭]서비스이름[탭]가격[탭]최소-최대[...]
    const match = trimmed.match(/^(\d+)\t(.+?)\t\$?([\d,.]+)\t([\d,\s]+)\s*-\s*([\d,\s]+)/);
    if (match) {
      const [, serviceId, name, rate, min, max] = match;

      services.push({
        provider_service_id: serviceId,
        name: name.trim(),
        original_category: currentCategory,
        provider: currentProvider,
        rate: parseFloat(rate.replace(/,/g, '')),
        min_quantity: parseQuantity(min),
        max_quantity: parseQuantity(max),
        line_number: lineNum,
      });
    }
  }

  return services;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           INFLUX 상품 분류 및 DB 업데이트');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. 소스 파일 파싱
  const sourceFile = 'C:\\Users\\user\\Desktop\\smm_master_source.txt';
  console.log(`[1/4] 소스 파일 파싱 중: ${sourceFile}`);

  const services = parseSourceFile(sourceFile);
  console.log(`      총 ${services.length}개 서비스 발견\n`);

  // 2. 플랫폼 및 서브카테고리 분류
  console.log('[2/4] 플랫폼 및 서브카테고리 분류 중...');

  const classified = services.map(s => {
    const platform = detectPlatform(s.name, s.original_category);
    const subcategory = detectSubcategoryType(s.name, platform);
    const isKorean = isKoreanTargeted(s.name);

    return {
      ...s,
      platform,
      subcategory,
      is_korean: isKorean,
      type: isKorean ? `${subcategory}-korean` : subcategory,
    };
  });

  // 플랫폼별 통계
  const platformStats = {};
  const subcategoryStats = {};

  classified.forEach(s => {
    platformStats[s.platform] = (platformStats[s.platform] || 0) + 1;
    const key = `${s.platform}/${s.subcategory}`;
    subcategoryStats[key] = (subcategoryStats[key] || 0) + 1;
  });

  console.log('\n플랫폼별 분류 결과:');
  Object.entries(platformStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([platform, count]) => {
      console.log(`  ${platform.padEnd(15)} ${String(count).padStart(5)}개`);
    });

  console.log('\n서브카테고리별 분류 결과 (상위 20개):');
  Object.entries(subcategoryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([key, count]) => {
      console.log(`  ${key.padEnd(30)} ${String(count).padStart(5)}개`);
    });

  // 한국 타겟 통계
  const koreanServices = classified.filter(s => s.is_korean);
  console.log(`\n한국 타겟 상품: ${koreanServices.length}개`);

  // 3. 기존 카테고리 조회
  console.log('\n[3/4] 기존 카테고리 조회 중...');

  const { data: categories } = await supabase.from('categories').select('*');
  const categoryMap = {};
  categories.forEach(c => {
    categoryMap[c.slug] = c.id;
    categoryMap[c.name.toLowerCase()] = c.id;
  });

  console.log(`      ${categories.length}개 카테고리 로드\n`);

  // 4. DB 업데이트 (실제 실행 시 주석 해제)
  console.log('[4/4] DB 업데이트 준비...');

  // 프로바이더 ID 조회/생성
  const { data: providers } = await supabase.from('providers').select('*');
  const providerMap = {};
  providers.forEach(p => {
    providerMap[p.name] = p.id;
  });

  // 기본 프로바이더 (없으면 JAP 사용)
  const defaultProviderId = providerMap['JAP'] || providerMap['JustAnotherPanel'] || providers[0]?.id;

  // 배치로 삽입할 서비스 준비
  const toInsert = [];
  let skipped = 0;

  classified.forEach(s => {
    const categoryId = categoryMap[s.platform] || categoryMap[s.platform.toLowerCase()];
    if (!categoryId) {
      skipped++;
      return;
    }

    // 마진 30% 적용
    const basePrice = s.rate * 1400; // USD to KRW
    const priceWithMargin = Math.round(basePrice * 1.3);

    toInsert.push({
      provider_id: defaultProviderId,
      category_id: categoryId,
      provider_service_id: s.provider_service_id,
      name: s.name,
      description: JSON.stringify({
        original_category: s.original_category,
        provider: s.provider,
        platform: s.platform,
        subcategory: s.subcategory,
        is_korean: s.is_korean,
      }),
      type: s.type,
      rate: s.rate,
      price: priceWithMargin,
      margin: 30,
      min_quantity: s.min_quantity || 10,
      max_quantity: s.max_quantity || 1000000,
      is_active: true,
      quality: s.is_korean ? 'premium' : 'standard',
      sort_order: 0,
    });
  });

  console.log(`\n삽입 준비 완료: ${toInsert.length}개`);
  console.log(`스킵 (카테고리 없음): ${skipped}개`);

  // 실제 DB 삽입
  console.log('\nDB에 삽입 중... (배치 500개씩)');

  const batchSize = 500;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize);
    const { data, error } = await supabase.from('services').upsert(batch, {
      onConflict: 'provider_service_id,provider_id',
      ignoreDuplicates: false
    });

    if (error) {
      console.log(`  배치 ${Math.floor(i/batchSize)+1} 에러:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      process.stdout.write(`  ${inserted}/${toInsert.length} 완료\r`);
    }
  }

  console.log(`\n\n═══════════════════════════════════════════════════════════════`);
  console.log(`           작업 완료!`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`총 서비스: ${services.length}개`);
  console.log(`삽입/업데이트: ${inserted}개`);
  console.log(`에러: ${errors}개`);
  console.log(`스킵: ${skipped}개`);
}

main().catch(console.error);
