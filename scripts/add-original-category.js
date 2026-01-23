// 서비스에 YTResellers 원본 카테고리 추가
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local 로드
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) envVars[key.trim()] = values.join('=').trim();
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

// YTResellers 원본 데이터 로드
const ytServices = JSON.parse(fs.readFileSync(path.join(__dirname, 'ytresellers_services.json'), 'utf8'));

// provider_service_id -> category 매핑
const categoryMap = {};
ytServices.forEach(s => {
  categoryMap[s.service] = s.category;
});

console.log('YTResellers 고유 카테고리 수:', new Set(Object.values(categoryMap)).size);

async function updateCategories() {
  // 모든 서비스 조회
  const { data: services, error } = await supabase
    .from('services')
    .select('id, provider_service_id, description')
    .order('id');

  if (error) {
    console.error('조회 에러:', error.message);
    return;
  }

  console.log('DB 서비스 수:', services.length);

  let updated = 0;
  let notFound = 0;

  for (const svc of services) {
    const originalCategory = categoryMap[svc.provider_service_id];

    if (!originalCategory) {
      notFound++;
      continue;
    }

    // 기존 메타데이터 파싱
    let meta = {};
    try {
      meta = JSON.parse(svc.description || '{}');
    } catch (e) {
      meta = {};
    }

    // original_category 추가
    meta.original_category = originalCategory;

    // 업데이트
    const { error: updateError } = await supabase
      .from('services')
      .update({ description: JSON.stringify(meta) })
      .eq('id', svc.id);

    if (!updateError) {
      updated++;
    }

    if (updated % 100 === 0 && updated > 0) {
      console.log('진행:', updated);
    }
  }

  console.log('\n=== 완료 ===');
  console.log('업데이트:', updated);
  console.log('매핑없음:', notFound);

  // 샘플 확인
  const { data: sample } = await supabase
    .from('services')
    .select('provider_service_id, description')
    .not('description', 'is', null)
    .limit(5);

  console.log('\n=== 샘플 확인 ===');
  sample?.forEach(s => {
    try {
      const m = JSON.parse(s.description);
      if (m.original_category) {
        console.log(`[${s.provider_service_id}] → ${m.original_category}`);
      }
    } catch (e) {}
  });

  // 카테고리 통계
  const { data: allServices } = await supabase.from('services').select('description');
  const catStats = {};
  allServices?.forEach(s => {
    try {
      const m = JSON.parse(s.description);
      if (m.original_category) {
        catStats[m.original_category] = (catStats[m.original_category] || 0) + 1;
      }
    } catch (e) {}
  });

  console.log('\n=== 카테고리별 서비스 수 (상위 15개) ===');
  Object.entries(catStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}개`);
    });
}

updateCategories().catch(console.error);
