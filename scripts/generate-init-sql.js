// 기존 테이블 구조 (admin_products, admin_categories, api_providers)에 맞춰
// 데이터 삽입 SQL을 생성하는 스크립트

const fs = require('fs');
const path = require('path');

// 설정
const EXCHANGE_RATE = 1450; // $1 = 1,450원
const DEFAULT_MARGIN = 2.0; // 기본 마진 2배
const KOREA_PREMIUM = 3.0; // 한국인 프리미엄 3배

// 데이터 로드
const mappings = require('./service_mappings.json');

// 가격 계산 함수
function calculatePrice(rate, productName) {
  const isKorean = productName.includes('한국인') ||
                   productName.toLowerCase().includes('korea') ||
                   productName.includes('🇰🇷');

  const margin = isKorean ? KOREA_PREMIUM : DEFAULT_MARGIN;
  let price = rate * EXCHANGE_RATE * margin;

  // 10원 단위 반올림
  price = Math.round(price / 10) * 10;

  // 최소 가격 10원
  if (price < 10) price = 10;

  return price;
}

// input_type 결정 함수
function getInputType(type, productName) {
  const nameLower = productName.toLowerCase();

  if (type === 'comments' && nameLower.includes('custom')) {
    return 'link_comments';
  }
  if (nameLower.includes('username') || nameLower.includes('mention')) {
    return 'link_usernames';
  }
  return 'link';
}

// Provider slug 매핑
const providerSlugs = {
  'JAP': 'jap',
  'SECSERS': 'secsers',
  'SMMFOLLOWS': 'smmfollows',
  'SMMKINGS': 'smmkings',
  'FIVEBBC': 'fivebbc',
  'SMMHEAVEN': 'smmheaven',
  'CHEAPESTPANEL': 'cheapestpanel',
  'BULKFOLLOWS': 'bulkfollows',
  'PEAKERR': 'peakerr',
  'TOPSMM': 'topsmm'
};

// Provider API 정보 (실제 운영시 .env에서 관리)
const providerApis = {
  'JAP': { url: 'https://justanotherpanel.com/api/v2', key: 'YOUR_JAP_API_KEY' },
  'SECSERS': { url: 'https://secsers.com/api/v2', key: 'YOUR_SECSERS_API_KEY' },
  'SMMFOLLOWS': { url: 'https://smmfollows.com/api/v2', key: 'YOUR_SMMFOLLOWS_API_KEY' },
  'SMMKINGS': { url: 'https://smmkings.com/api/v2', key: 'YOUR_SMMKINGS_API_KEY' },
  'FIVEBBC': { url: 'https://5bbc.com/api/v2', key: 'YOUR_FIVEBBC_API_KEY' },
  'SMMHEAVEN': { url: 'https://smmheaven.com/api/v2', key: 'YOUR_SMMHEAVEN_API_KEY' },
  'CHEAPESTPANEL': { url: 'https://cheapestpanel.com/api/v2', key: 'YOUR_CHEAPESTPANEL_API_KEY' },
  'BULKFOLLOWS': { url: 'https://bulkfollows.com/api/v2', key: 'YOUR_BULKFOLLOWS_API_KEY' },
  'PEAKERR': { url: 'https://peakerr.com/api/v2', key: 'YOUR_PEAKERR_API_KEY' },
  'TOPSMM': { url: 'https://topsmm.club/api/v2', key: 'YOUR_TOPSMM_API_KEY' }
};

// SQL 생성
let sql = `-- =============================================
-- INFLUX SMM Panel - 데이터 초기화 스크립트
-- 생성일: ${new Date().toISOString()}
-- 기존 테이블 사용: admin_products, admin_categories, api_providers
-- =============================================

-- 트랜잭션 시작
BEGIN;

-- =============================================
-- 1. 기존 데이터 정리 (선택적)
-- =============================================
-- 주의: 기존 데이터를 삭제합니다. 필요시 주석 처리하세요.
DELETE FROM admin_products WHERE TRUE;
-- DELETE FROM admin_categories WHERE TRUE;  -- 카테고리는 이미 추가되어 있으므로 주석 처리

-- =============================================
-- 2. API Providers 추가 (UPSERT)
-- =============================================
`;

// 사용된 providers 추출
const usedProviders = new Set();
mappings.mappings.forEach(m => {
  m.candidates.forEach(c => {
    usedProviders.add(c.provider);
  });
});

usedProviders.forEach(provider => {
  const slug = providerSlugs[provider] || provider.toLowerCase();
  const api = providerApis[provider] || { url: 'https://example.com/api/v2', key: 'API_KEY_REQUIRED' };

  sql += `
INSERT INTO api_providers (name, slug, api_url, api_key, is_active, priority)
VALUES ('${provider}', '${slug}', '${api.url}', '${api.key}', true, ${100 - Array.from(usedProviders).indexOf(provider) * 10})
ON CONFLICT (slug) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
`;
});

sql += `
-- =============================================
-- 3. 카테고리 ID 조회를 위한 임시 테이블
-- =============================================
-- 이미 admin_categories에 카테고리가 있다고 가정

-- =============================================
-- 4. 상품 데이터 삽입
-- =============================================
`;

// 각 매핑에 대해 INSERT 문 생성
mappings.mappings.forEach((mapping, index) => {
  if (mapping.candidates.length === 0) {
    sql += `-- [SKIP] ${mapping.target_name}: 후보 없음\n\n`;
    return;
  }

  const rank1 = mapping.candidates.find(c => c.rank === 1);
  const rank2 = mapping.candidates.find(c => c.rank === 2);
  const rank3 = mapping.candidates.find(c => c.rank === 3);

  if (!rank1) return;

  // 가격 계산 (Rank 1 기준)
  const priceKrw = calculatePrice(rank1.rate, mapping.target_name);

  // min/max 결정
  const minQty = Math.max(10, rank1.min || 10);
  const maxQty = Math.min(1000000, rank1.max || 100000);

  // input_type 결정
  const inputType = getInputType(mapping.type, mapping.target_name);

  // 카테고리 slug 생성
  const categorySlug = mapping.type.replace(/-/g, '_');

  // platform 매핑 (spotify|soundcloud 같은 다중 플랫폼 처리)
  let platformQuery;
  if (mapping.platform.includes('|')) {
    const platforms = mapping.platform.split('|');
    platformQuery = `(SELECT id FROM admin_categories WHERE platform IN ('${platforms.join("','")}') ORDER BY sort_order LIMIT 1)`;
  } else {
    platformQuery = `(SELECT id FROM admin_categories WHERE platform = '${mapping.platform}' ORDER BY sort_order LIMIT 1)`;
  }

  sql += `-- [${mapping.target_id}] ${mapping.target_name}
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  ${platformQuery},
  '${mapping.target_name.replace(/'/g, "''")}',
  '원가: $${rank1.rate}/1K | ${rank1.service_name.substring(0, 100).replace(/'/g, "''")}',
  ${priceKrw},
  ${minQty},
  ${maxQty},
  (SELECT id FROM api_providers WHERE slug = '${providerSlugs[rank1.provider] || rank1.provider.toLowerCase()}'),
  '${rank1.service_id}',
  ${rank2 ? `(SELECT id FROM api_providers WHERE slug = '${providerSlugs[rank2.provider] || rank2.provider.toLowerCase()}')` : 'NULL'},
  ${rank2 ? `'${rank2.service_id}'` : 'NULL'},
  ${rank3 ? `(SELECT id FROM api_providers WHERE slug = '${providerSlugs[rank3.provider] || rank3.provider.toLowerCase()}')` : 'NULL'},
  ${rank3 ? `'${rank3.service_id}'` : 'NULL'},
  '${inputType}',
  ${mapping.target_id},
  true,
  ${mapping.target_id <= 7 ? 'true' : 'false'}
);

`;
});

sql += `
-- =============================================
-- 5. 통계 확인
-- =============================================
SELECT
  '총 상품 수' as metric,
  COUNT(*) as value
FROM admin_products
WHERE is_active = true

UNION ALL

SELECT
  '총 카테고리 수' as metric,
  COUNT(DISTINCT category_id) as value
FROM admin_products

UNION ALL

SELECT
  '활성 API 공급자 수' as metric,
  COUNT(*) as value
FROM api_providers
WHERE is_active = true;

-- 트랜잭션 커밋
COMMIT;

-- =============================================
-- 완료!
-- =============================================
`;

// 파일 저장
const outputPath = path.join(__dirname, '..', 'supabase', 'migrations', 'init_smm_db.sql');
fs.writeFileSync(outputPath, sql, 'utf8');

console.log(`✅ SQL 파일 생성 완료: ${outputPath}`);
console.log(`📊 총 ${mappings.mappings.length}개 상품`);
console.log(`📦 ${usedProviders.size}개 API 공급자`);

// 가격 샘플 출력
console.log('\n💰 가격 샘플:');
mappings.mappings.slice(0, 5).forEach(m => {
  if (m.candidates.length > 0) {
    const rate = m.candidates[0].rate;
    const price = calculatePrice(rate, m.target_name);
    console.log(`  ${m.target_name}: $${rate}/1K → ${price.toLocaleString()}원/1K`);
  }
});
