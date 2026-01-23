/**
 * 모든 서비스에 기본 마진 30% 적용 스크립트
 * - margin이 0이거나 null인 서비스에 30% 마진 적용
 * - 원가(rate) 기반으로 판매가(price) 재계산
 */
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

const DEFAULT_MARGIN = 30; // 기본 마진 30%

async function main() {
  console.log('🔧 전체 서비스 마진 업데이트 시작\n');
  console.log(`기본 마진: ${DEFAULT_MARGIN}%\n`);

  // 모든 서비스 조회
  let allServices = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('services')
      .select('id, rate, margin, price')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('조회 에러:', error.message);
      return;
    }

    if (!data || data.length === 0) break;
    allServices = allServices.concat(data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log('총 서비스 수:', allServices.length);

  // 마진이 0이거나 없는 서비스 필터링
  const needsUpdate = allServices.filter(s => !s.margin || s.margin === 0);
  console.log('업데이트 필요:', needsUpdate.length);

  if (needsUpdate.length === 0) {
    console.log('\n모든 서비스에 이미 마진이 설정되어 있습니다.');
    return;
  }

  // 배치 업데이트
  let updated = 0;
  let errors = 0;
  const batchSize = 100;

  for (let i = 0; i < needsUpdate.length; i += batchSize) {
    const batch = needsUpdate.slice(i, i + batchSize);

    await Promise.all(batch.map(async (service) => {
      const baseRate = service.rate || 0;
      const newPrice = Math.ceil(baseRate * (1 + DEFAULT_MARGIN / 100));

      const { error: updateError } = await supabase
        .from('services')
        .update({
          margin: DEFAULT_MARGIN,
          price: newPrice
        })
        .eq('id', service.id);

      if (updateError) {
        errors++;
      } else {
        updated++;
      }
    }));

    // 진행 상황
    const progress = Math.min(i + batchSize, needsUpdate.length);
    process.stdout.write(`\r진행: ${progress}/${needsUpdate.length}`);
  }

  console.log('\n\n=== 완료 ===');
  console.log('업데이트:', updated);
  console.log('에러:', errors);

  // 검증
  console.log('\n=== 검증 ===');
  const { data: sample } = await supabase
    .from('services')
    .select('provider_service_id, name, rate, margin, price')
    .limit(5);

  sample?.forEach(s => {
    console.log(`[${s.provider_service_id}] 원가: ₩${s.rate} → 판매가: ₩${s.price} (마진 ${s.margin}%)`);
  });

  // 통계
  const { data: stats } = await supabase
    .from('services')
    .select('margin');

  const marginStats = {};
  stats?.forEach(s => {
    const m = s.margin || 0;
    marginStats[m] = (marginStats[m] || 0) + 1;
  });

  console.log('\n=== 마진 분포 ===');
  Object.entries(marginStats)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .forEach(([margin, count]) => {
      console.log(`  ${margin}%: ${count}개`);
    });
}

main().catch(console.error);
