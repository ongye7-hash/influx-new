/**
 * YTReseller Services Migration Apply Script
 * 필터링된 한국/전세계 서비스를 Supabase에 직접 삽입
 */

const fs = require('fs');
const path = require('path');

// 환경변수 직접 로드 (dotenv 없이)
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const vars = {};
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      vars[key.trim()] = valueParts.join('=').trim();
    }
  }
  return vars;
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

// Configuration
const EXCHANGE_RATE = 1473; // 실시간 환율 (2026-01-22)
// 마진은 어드민에서 일괄 설정 (기본 0%)
const DEFAULT_MARGIN = 0;
const YTRESELLER_PROVIDER_ID = '493b3f2e-d90a-41af-9df0-ae7453cc238e';

// Platform detection
const PLATFORM_PATTERNS = [
  { platform: 'twitter', patterns: ['twitter', '트위터', 'x / twitter', 'x/twitter', 'x -'] },
  { platform: 'facebook', patterns: ['facebook', '페이스북', 'fb '] },
  { platform: 'instagram', patterns: ['instagram', '인스타', 'ig '] },
  { platform: 'youtube', patterns: ['youtube', '유튜브', 'yt '] },
  { platform: 'tiktok', patterns: ['tiktok', '틱톡'] },
  { platform: 'telegram', patterns: ['telegram', '텔레그램'] },
  { platform: 'twitch', patterns: ['twitch', '트위치'] },
  { platform: 'discord', patterns: ['discord', '디스코드'] },
  { platform: 'spotify', patterns: ['spotify', '스포티파이'] },
  { platform: 'linkedin', patterns: ['linkedin', '링크드인'] },
  { platform: 'pinterest', patterns: ['pinterest', '핀터레스트'] },
  { platform: 'soundcloud', patterns: ['soundcloud', '사운드클라우드'] },
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

function createKoreanName(service, platform) {
  const name = service.name;
  const hasKorea = /korea|한국|🇰🇷/i.test(name);
  const hasWorldwide = /worldwide|global|전세계/i.test(name);

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
  else if (nameLower.includes('reply')) serviceType = '답글';
  else if (nameLower.includes('share')) serviceType = '공유';
  else if (nameLower.includes('save')) serviceType = '저장';
  else if (nameLower.includes('watch')) serviceType = '시청시간';
  else serviceType = '서비스';

  let location = '';
  if (hasKorea) location = '[한국]';
  else if (hasWorldwide) location = '[글로벌]';

  const refillInfo = service.refill ? '♻️' : '';

  // 서비스 번호 포함
  return `[${service.service}] ${platformKr[platform] || platform} ${serviceType} ${location} ${refillInfo}`.trim().replace(/\s+/g, ' ');
}

async function supabaseRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase error: ${response.status} - ${errorText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function deleteExistingYtresellerServices() {
  console.log('🗑️  기존 YTReseller 서비스 삭제 중...');
  try {
    await supabaseRequest(
      `services?provider_id=eq.${YTRESELLER_PROVIDER_ID}`,
      'DELETE'
    );
    console.log('✅ 기존 서비스 삭제 완료\n');
  } catch (error) {
    console.log('⚠️  삭제 실패 (무시):', error.message);
  }
}

async function ensureCategories() {
  console.log('📁 카테고리 확인 중...');

  const requiredCategories = [
    { name: 'Instagram', slug: 'instagram', sort_order: 1 },
    { name: 'YouTube', slug: 'youtube', sort_order: 2 },
    { name: 'TikTok', slug: 'tiktok', sort_order: 3 },
    { name: 'Twitter/X', slug: 'twitter', sort_order: 4 },
    { name: 'Facebook', slug: 'facebook', sort_order: 5 },
    { name: 'Telegram', slug: 'telegram', sort_order: 6 },
    { name: 'Twitch', slug: 'twitch', sort_order: 7 },
    { name: 'Discord', slug: 'discord', sort_order: 8 },
    { name: 'Spotify', slug: 'spotify', sort_order: 9 },
    { name: 'LinkedIn', slug: 'linkedin', sort_order: 10 },
    { name: 'Pinterest', slug: 'pinterest', sort_order: 11 },
    { name: 'SoundCloud', slug: 'soundcloud', sort_order: 12 },
    { name: 'CoinMarketCap', slug: 'coinmarketcap', sort_order: 13 },
    { name: '기타 플랫폼', slug: 'other', sort_order: 99 },
  ];

  // Get existing categories
  const existingCategories = await supabaseRequest('categories?select=slug');
  const existingSlugs = new Set(existingCategories.map(c => c.slug));

  // Insert missing categories
  for (const cat of requiredCategories) {
    if (!existingSlugs.has(cat.slug)) {
      console.log(`  + 추가: ${cat.name}`);
      await supabaseRequest('categories', 'POST', {
        name: cat.name,
        slug: cat.slug,
        sort_order: cat.sort_order,
        is_active: true
      });
    }
  }

  // Get category ID map
  const allCategories = await supabaseRequest('categories?select=id,slug');
  const categoryMap = {};
  for (const cat of allCategories) {
    categoryMap[cat.slug] = cat.id;
  }

  console.log('✅ 카테고리 준비 완료\n');
  return categoryMap;
}

async function getExistingServiceIds() {
  const services = await supabaseRequest('services?select=provider_service_id');
  return new Set(services.map(s => s.provider_service_id));
}

async function insertServices(filteredServices, categoryMap, existingServiceIds) {
  console.log('📦 서비스 삽입 중...\n');

  let inserted = 0;
  let skipped = 0;

  for (const service of filteredServices) {
    const providerServiceId = String(service.service);

    // Skip if already exists
    if (existingServiceIds.has(providerServiceId)) {
      skipped++;
      continue;
    }

    const platform = detectPlatform(service);
    const categoryId = categoryMap[platform] || categoryMap['other'];

    const costUSD = parseFloat(service.rate);
    const costKRW = costUSD * EXCHANGE_RATE;
    // 원가 = 판매가 (마진 0%), 어드민에서 마진 일괄 적용
    const priceKRW = Math.ceil(costKRW * (1 + DEFAULT_MARGIN / 100));

    const koreanName = createKoreanName(service, platform);

    // 원본 서비스명을 설명으로 저장 (상세 정보 포함)
    const description = service.name.substring(0, 500);

    // DB 스키마에 맞는 필드만 사용
    const serviceData = {
      provider_id: YTRESELLER_PROVIDER_ID,
      category_id: categoryId,
      provider_service_id: providerServiceId,
      name: koreanName,
      description: description,
      type: 'default',
      rate: Math.round(costKRW * 100) / 100,
      price: priceKRW,
      margin: DEFAULT_MARGIN,
      min_quantity: service.min,
      max_quantity: Math.min(service.max, 10000000),
      is_active: true,
      is_featured: false,
      average_time: '1-24시간',
      refill_days: service.refill ? 30 : 0,
      quality: 'high_quality',
      sort_order: inserted + 1
    };

    try {
      await supabaseRequest('services', 'POST', serviceData);
      inserted++;
      console.log(`  ✅ ${koreanName} (₩${priceKRW.toLocaleString()}/1K)`);
    } catch (error) {
      console.error(`  ❌ ${koreanName}: ${error.message}`);
    }
  }

  return { inserted, skipped };
}

async function main() {
  console.log('═'.repeat(50));
  console.log('  YTReseller 한국/전세계 서비스 가져오기');
  console.log('═'.repeat(50));
  console.log(`  환율: $1 = ₩${EXCHANGE_RATE}`);
  console.log(`  마진: ${DEFAULT_MARGIN}% (어드민에서 일괄 설정)`);
  console.log('═'.repeat(50) + '\n');

  // Load filtered services (확장된 필터 적용)
  const filteredServicesPath = path.join(__dirname, 'filtered_services_expanded.json');
  const filteredServices = JSON.parse(fs.readFileSync(filteredServicesPath, 'utf8'));
  console.log(`📋 총 ${filteredServices.length}개 서비스 로드됨\n`);

  // Ensure categories exist
  const categoryMap = await ensureCategories();

  // Delete existing YTReseller services (전체 재등록)
  await deleteExistingYtresellerServices();

  // Get existing services to avoid duplicates (삭제 후이므로 빈 Set)
  const existingServiceIds = new Set();
  console.log(`📊 기존 서비스 삭제 후 새로 등록 시작\n`);

  // Insert services
  const { inserted, skipped } = await insertServices(filteredServices, categoryMap, existingServiceIds);

  console.log('\n' + '═'.repeat(50));
  console.log(`  완료! 삽입: ${inserted}개 | 건너뜀: ${skipped}개`);
  console.log('═'.repeat(50));
  console.log('\n⚠️  다음 단계: 어드민 > 서비스 관리 > 마진 일괄 설정');
  console.log('   원하는 마진율을 설정하세요 (예: 50%)\n');
}

main().catch(console.error);
