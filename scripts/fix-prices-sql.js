const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function main() {
  console.log('=== 전체 서비스 가격 일괄 수정 (SQL 방식) ===\n');

  // 먼저 현재 상태 확인
  const { data: before } = await supabase
    .from('services')
    .select('id, provider_service_id, rate, price')
    .order('price', { ascending: true })
    .limit(5);

  console.log('수정 전 최저가 5개:');
  before.forEach(s => {
    console.log(`  [${s.provider_service_id}] rate=${s.rate}, price=${s.price}, 예상=${Math.ceil(s.rate * 2)}`);
  });

  // 모든 서비스 가져오기
  const { data: services, error: fetchError } = await supabase
    .from('services')
    .select('id, rate');

  if (fetchError) {
    console.error('서비스 조회 실패:', fetchError.message);
    return;
  }

  console.log(`\n총 ${services.length}개 서비스 가격 업데이트 중...\n`);

  // 배치로 업데이트 (10개씩)
  const batchSize = 10;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < services.length; i += batchSize) {
    const batch = services.slice(i, i + batchSize);

    // Promise.all로 병렬 처리
    const results = await Promise.all(
      batch.map(async (s) => {
        const newPrice = Math.ceil(s.rate * 2);
        const { error } = await supabase
          .from('services')
          .update({ price: newPrice, margin: 100 })
          .eq('id', s.id);
        return { id: s.id, error, newPrice };
      })
    );

    for (const r of results) {
      if (r.error) {
        failed++;
        console.log(`실패 [${r.id}]: ${r.error.message}`);
      } else {
        updated++;
      }
    }

    // 진행률 표시 (100개마다)
    if ((i + batchSize) % 100 === 0 || i + batchSize >= services.length) {
      console.log(`진행: ${Math.min(i + batchSize, services.length)}/${services.length}`);
    }
  }

  console.log(`\n업데이트 완료: ${updated}개`);
  console.log(`실패: ${failed}개`);

  // 결과 확인
  console.log('\n=== 업데이트 후 검증 ===');

  const { data: after } = await supabase
    .from('services')
    .select('id, provider_service_id, rate, price')
    .order('price', { ascending: true })
    .limit(10);

  console.log('\n최저가 10개 서비스:');
  let allCorrect = true;
  after.forEach(s => {
    const expected = Math.ceil(s.rate * 2);
    const status = s.price === expected ? '✅' : '❌';
    if (s.price !== expected) allCorrect = false;
    console.log(`  [${s.provider_service_id}] rate=${s.rate}, price=${s.price}, 예상=${expected} ${status}`);
  });

  // 특정 서비스 확인 (8027, 7788)
  const checkIds = ['8027', '7788', '6726'];
  console.log('\n특정 서비스 확인:');
  for (const pid of checkIds) {
    const { data: svc } = await supabase
      .from('services')
      .select('provider_service_id, rate, price, margin')
      .eq('provider_service_id', pid)
      .single();

    if (svc) {
      const expected = Math.ceil(svc.rate * 2);
      const status = svc.price === expected ? '✅' : '❌';
      console.log(`  [${svc.provider_service_id}] rate=${svc.rate}, price=${svc.price}, margin=${svc.margin}%, 예상=${expected} ${status}`);
    }
  }

  if (allCorrect) {
    console.log('\n✅ 모든 가격이 올바르게 설정되었습니다!');
  } else {
    console.log('\n❌ 일부 가격이 아직 올바르지 않습니다.');
  }
}

main().catch(console.error);
