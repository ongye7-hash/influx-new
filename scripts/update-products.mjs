// ============================================
// 상품 자동 매칭 및 업데이트 스크립트 v2
// 플랫폼 + 서비스타입 + 한국인 여부 기반 매칭
// ============================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ndjelynkpxffmapndnjx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 잔액 있는 패널들 (우선순위 순)
const PROVIDERS = [
  { id: '0b8ea684-52d3-4de2-bba8-9521f726de18', name: 'JAP', url: 'https://justanotherpanel.com/api/v2', key: '4ba8350a258c92baddb77ac564732610' },
  { id: '73d022c1-c9d8-4218-b872-2fc10e993ebc', name: 'YTResellers', url: 'https://ytresellers.com/api/v2', key: 'f98ad53368979b9381fea5773fbf1806' },
  { id: 'd6708a87-97b8-4ef1-b5b4-526d9c0890e3', name: 'SECSERS', url: 'https://secsers.com/api/v2', key: '6015ffbcfc9f59d1bf30130f1933efe9' },
  { id: '9997ee86-18b6-4608-8a45-5380bda1804c', name: 'smmkings', url: 'https://smmkings.com/api/v2', key: 'd2765bc1a3ca929a77ee44e6d1f78f13' },
];

// 환율 (USD -> KRW)
const EXCHANGE_RATE = 1450;
const MARGIN_RATE = 0.5; // 50% 마진
const MIN_PRICE = 0.3; // 최소 도매가 (너무 싼 건 제외)
const MAX_PRICE = 100; // 최대 도매가

// 플랫폼별 키워드 매핑 (패널 서비스 카테고리/이름에서 검색)
const PLATFORM_KEYWORDS = {
  instagram: ['instagram', 'insta', 'ig '],
  youtube: ['youtube', 'yt ', 'shorts'],
  tiktok: ['tiktok', 'tik tok', 'tt '],
  facebook: ['facebook', 'fb '],
  twitter: ['twitter', 'x ', ' x-', 'tweet'],
  telegram: ['telegram', 'tg '],
  discord: ['discord'],
  threads: ['thread'],
  spotify: ['spotify'],
  soundcloud: ['soundcloud'],
};

// 서비스 타입 키워드
const SERVICE_TYPE_KEYWORDS = {
  follower: ['follower', 'subscriber', 'member', 'friend'],
  like: ['like', 'heart', 'reaction', 'love', 'wow', 'haha'],
  view: ['view', 'play', 'stream', 'watch', 'impression'],
  comment: ['comment'],
  share: ['share', 'repost', 'retweet', 'rt '],
  live: ['live', 'concurrent', 'viewer'],
  save: ['save', 'bookmark', 'favorite'],
  boost: ['boost', 'nitro'],
  vote: ['vote', 'poll'],
};

// 한국인 타겟 여부 확인
function isKoreanTarget(productName) {
  const text = productName.toLowerCase();
  return text.includes('한국') || text.includes('korea') || text.includes('kr ') || text.includes('[kr]');
}

// 서비스 타입 감지
function detectServiceType(categoryName, productName) {
  const text = (categoryName + ' ' + productName).toLowerCase();

  // 한글 키워드 우선 체크
  if (text.includes('팔로워') || text.includes('구독') || text.includes('멤버') || text.includes('친구')) return 'follower';
  if (text.includes('좋아요') || text.includes('하트') || text.includes('반응') || text.includes('이모티콘')) return 'like';
  if (text.includes('조회') || text.includes('재생') || text.includes('스트리밍') || text.includes('시청') || text.includes('뷰')) return 'view';
  if (text.includes('댓글')) return 'comment';
  if (text.includes('공유') || text.includes('리트윗') || text.includes('리포스트')) return 'share';
  if (text.includes('라이브') || text.includes('방송')) return 'live';
  if (text.includes('저장')) return 'save';
  if (text.includes('부스트')) return 'boost';
  if (text.includes('투표')) return 'vote';

  // 영어 키워드
  for (const [type, keywords] of Object.entries(SERVICE_TYPE_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) return type;
  }

  return 'other';
}

// 패널에서 서비스 목록 가져오기
async function fetchServices(provider) {
  try {
    const formData = new URLSearchParams();
    formData.append('key', provider.key);
    formData.append('action', 'services');

    const response = await fetch(provider.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`[${provider.name}] Fetch error:`, error.message);
    return [];
  }
}

// 플랫폼에 맞는 서비스 필터링
function filterByPlatform(services, platform) {
  const keywords = PLATFORM_KEYWORDS[platform] || [platform];

  return services.filter(s => {
    const name = (s.name || '').toLowerCase();
    const category = (s.category || '').toLowerCase();
    return keywords.some(kw => name.includes(kw) || category.includes(kw));
  });
}

// 서비스 타입에 맞는 서비스 필터링
function filterByServiceType(services, serviceType) {
  const keywords = SERVICE_TYPE_KEYWORDS[serviceType] || [serviceType];

  return services.filter(s => {
    const name = (s.name || '').toLowerCase();
    const category = (s.category || '').toLowerCase();
    return keywords.some(kw => name.includes(kw) || category.includes(kw));
  });
}

// 한국인 타겟 서비스만 필터링
function filterByKorea(services) {
  return services.filter(s => {
    const name = (s.name || '').toLowerCase();
    const originalName = s.name || '';
    return name.includes('korea') || name.includes('south korea') ||
           originalName.includes('🇰🇷') || name.includes('[kr]');
  });
}

// 가격 범위 필터링
function filterByPrice(services) {
  return services.filter(s => {
    const rate = parseFloat(s.rate);
    return rate >= MIN_PRICE && rate <= MAX_PRICE;
  });
}

// 품질 기준 정렬
function sortByQuality(services) {
  return services.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aRate = parseFloat(a.rate);
    const bRate = parseFloat(b.rate);

    // 1. Refill/Guarantee 있으면 우선
    const aRefill = aName.includes('refill') || aName.includes('guarantee') || aName.includes('non drop');
    const bRefill = bName.includes('refill') || bName.includes('guarantee') || bName.includes('non drop');
    if (aRefill && !bRefill) return -1;
    if (!aRefill && bRefill) return 1;

    // 2. HQ/Real/Quality 있으면 우선
    const aQuality = aName.includes('hq') || aName.includes('real') || aName.includes('quality') || aName.includes('active');
    const bQuality = bName.includes('hq') || bName.includes('real') || bName.includes('quality') || bName.includes('active');
    if (aQuality && !bQuality) return -1;
    if (!aQuality && bQuality) return 1;

    // 3. 적당한 가격 ($0.5~$5)
    const aOptimal = (aRate >= 0.5 && aRate <= 5) ? 0 : Math.abs(aRate - 2);
    const bOptimal = (bRate >= 0.5 && bRate <= 5) ? 0 : Math.abs(bRate - 2);
    return aOptimal - bOptimal;
  });
}

// 상품에 맞는 서비스 찾기
function findMatchingService(allServices, platform, serviceType, requireKorea) {
  let services = [...allServices];

  // 1. 플랫폼 필터
  services = filterByPlatform(services, platform);
  if (services.length === 0) return null;

  // 2. 한국인 타겟이면 한국 서비스만
  if (requireKorea) {
    services = filterByKorea(services);
    if (services.length === 0) return null;
  }

  // 3. 서비스 타입 필터
  services = filterByServiceType(services, serviceType);
  if (services.length === 0) return null;

  // 4. 가격 필터
  services = filterByPrice(services);
  if (services.length === 0) return null;

  // 5. 품질순 정렬
  services = sortByQuality(services);

  return services[0];
}

// 판매가 계산
function calculatePrice(wholesaleUsd) {
  const price = wholesaleUsd * EXCHANGE_RATE * (1 + MARGIN_RATE);
  return Math.round(price);
}

async function main() {
  console.log('🚀 상품 업데이트 v2 시작...\n');

  // 1. 모든 패널에서 서비스 가져오기
  console.log('📥 패널 서비스 수집 중...');
  const allServices = {};
  for (const provider of PROVIDERS) {
    console.log(`  [${provider.name}] 로딩...`);
    const services = await fetchServices(provider);
    allServices[provider.id] = services;
    console.log(`  [${provider.name}] ${services.length}개 서비스`);
  }

  // 2. 현재 상품 목록 가져오기
  const { data: products, error } = await supabase
    .from('admin_products')
    .select('*, admin_categories(name, platform)')
    .eq('is_active', true);

  if (error) {
    console.error('상품 조회 실패:', error);
    return;
  }

  console.log(`\n📦 활성화된 상품 ${products.length}개 업데이트 중...\n`);

  let updated = 0;
  let skipped = 0;
  let noMatch = 0;

  for (const product of products) {
    const platform = product.admin_categories?.platform;
    const categoryName = product.admin_categories?.name || '';
    const productName = product.name;

    if (!platform) {
      console.log(`⏭️ [${productName}] 플랫폼 없음 - 스킵`);
      skipped++;
      continue;
    }

    // 서비스 타입 감지
    const serviceType = detectServiceType(categoryName, productName);

    // 한국인 타겟 여부
    const requireKorea = isKoreanTarget(productName);

    // 3개 패널에서 매칭되는 서비스 찾기
    const matches = [];
    for (const provider of PROVIDERS) {
      const services = allServices[provider.id] || [];
      const match = findMatchingService(services, platform, serviceType, requireKorea);
      if (match) {
        matches.push({
          providerId: provider.id,
          providerName: provider.name,
          serviceId: String(match.service),
          serviceName: match.name,
          rate: parseFloat(match.rate),
          min: parseInt(match.min) || 10,
          max: parseInt(match.max) || 100000,
        });
      }
    }

    if (matches.length === 0) {
      const tag = requireKorea ? '🇰🇷' : '';
      console.log(`❌ [${productName}] ${tag}${platform}/${serviceType} 매칭 없음`);
      noMatch++;
      continue;
    }

    // 가장 좋은 3개 선택
    const primary = matches[0];
    const fallback1 = matches[1] || null;
    const fallback2 = matches[2] || null;

    // 가격 계산 (1순위 도매가 기준)
    const newPrice = calculatePrice(primary.rate);

    // 업데이트
    const updateData = {
      primary_provider_id: primary.providerId,
      primary_service_id: primary.serviceId,
      fallback1_provider_id: fallback1?.providerId || null,
      fallback1_service_id: fallback1?.serviceId || null,
      fallback2_provider_id: fallback2?.providerId || null,
      fallback2_service_id: fallback2?.serviceId || null,
      price_per_1000: newPrice,
      min_quantity: primary.min,
      max_quantity: Math.min(primary.max, 1000000),
    };

    const { error: updateError } = await supabase
      .from('admin_products')
      .update(updateData)
      .eq('id', product.id);

    if (updateError) {
      console.log(`❌ [${productName}] DB 에러: ${updateError.message}`);
      noMatch++;
    } else {
      const koreaTag = requireKorea ? '🇰🇷' : '';
      const fallbackCount = [primary, fallback1, fallback2].filter(Boolean).length;
      console.log(`✅ [${productName}] ${koreaTag}→ ${primary.providerName}[${primary.serviceId}] ₩${newPrice.toLocaleString()}/1k (FB:${fallbackCount})`);
      updated++;
    }
  }

  console.log(`\n📊 완료!`);
  console.log(`  ✅ 업데이트: ${updated}개`);
  console.log(`  ⏭️ 스킵: ${skipped}개`);
  console.log(`  ❌ 매칭실패: ${noMatch}개`);
}

main().catch(console.error);
