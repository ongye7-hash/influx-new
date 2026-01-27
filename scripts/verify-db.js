// 데이터베이스 상태 확인 스크립트
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local 파일 파싱
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
  console.log('📊 데이터베이스 상태 확인\n');

  // 1. API Providers 확인
  const { data: providers, error: pErr } = await supabase
    .from('api_providers')
    .select('name, slug, is_active, priority')
    .order('priority', { ascending: false });

  if (pErr) {
    console.error('❌ api_providers 에러:', pErr.message);
  } else {
    console.log(`✅ API 공급자: ${providers.length}개`);
    providers.forEach(p => {
      console.log(`   ${p.is_active ? '🟢' : '🔴'} ${p.name} (${p.slug}) - 우선순위: ${p.priority}`);
    });
  }

  // 2. Categories 확인
  const { data: categories, error: cErr } = await supabase
    .from('admin_categories')
    .select('platform, name, is_active')
    .order('platform')
    .order('sort_order');

  if (cErr) {
    console.error('❌ admin_categories 에러:', cErr.message);
  } else {
    const platformCounts = {};
    categories.forEach(c => {
      platformCounts[c.platform] = (platformCounts[c.platform] || 0) + 1;
    });
    console.log(`\n✅ 카테고리: ${categories.length}개`);
    Object.entries(platformCounts).forEach(([p, c]) => {
      console.log(`   ${p}: ${c}개`);
    });
  }

  // 3. Products 확인
  const { data: products, error: prErr } = await supabase
    .from('admin_products')
    .select(`
      name,
      price_per_1000,
      is_active,
      is_recommended,
      primary_service_id,
      fallback1_service_id,
      fallback2_service_id,
      category:admin_categories(platform, name)
    `)
    .order('sort_order');

  if (prErr) {
    console.error('❌ admin_products 에러:', prErr.message);
  } else {
    console.log(`\n✅ 상품: ${products.length}개`);

    // 플랫폼별 통계
    const platformProducts = {};
    products.forEach(p => {
      const platform = p.category?.platform || 'unknown';
      platformProducts[platform] = (platformProducts[platform] || 0) + 1;
    });

    console.log('\n📦 플랫폼별 상품 수:');
    Object.entries(platformProducts).forEach(([p, c]) => {
      console.log(`   ${p}: ${c}개`);
    });

    // Fallback 통계
    const withFallback1 = products.filter(p => p.fallback1_service_id).length;
    const withFallback2 = products.filter(p => p.fallback2_service_id).length;
    console.log(`\n🔄 Fallback 설정:`);
    console.log(`   Primary: ${products.filter(p => p.primary_service_id).length}개`);
    console.log(`   Fallback 1: ${withFallback1}개`);
    console.log(`   Fallback 2: ${withFallback2}개`);

    // 추천 상품
    const recommended = products.filter(p => p.is_recommended);
    console.log(`\n⭐ 추천 상품: ${recommended.length}개`);
    recommended.forEach(p => {
      console.log(`   - ${p.name}: ${p.price_per_1000.toLocaleString()}원/1K`);
    });

    // 가격 샘플
    console.log('\n💰 가격 샘플 (상위 10개):');
    products.slice(0, 10).forEach(p => {
      console.log(`   ${p.name}: ${Number(p.price_per_1000).toLocaleString()}원/1K`);
    });
  }
}

verify();
