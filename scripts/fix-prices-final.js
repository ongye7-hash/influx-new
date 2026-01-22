const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function main() {
  console.log('=== 전체 서비스 가격 순차 업데이트 (100% 마진) ===\n');

  // 모든 서비스 가져오기
  const { data: services, error: fetchError } = await supabase
    .from('services')
    .select('id, provider_service_id, rate, price, margin');

  if (fetchError) {
    console.error('서비스 조회 실패:', fetchError.message);
    return;
  }

  console.log(`총 ${services.length}개 서비스\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    const newPrice = Math.ceil(s.rate * 2);

    // 이미 올바른 가격이면 스킵
    if (s.price === newPrice && s.margin === 100) {
      skipped++;
      continue;
    }

    // 업데이트
    const { error } = await supabase
      .from('services')
      .update({ price: newPrice, margin: 100 })
      .eq('id', s.id);

    if (error) {
      failed++;
      console.log(`❌ [${s.provider_service_id}] 실패: ${error.message}`);
    } else {
      updated++;
      // 첫 10개만 로그
      if (updated <= 10) {
        console.log(`✅ [${s.provider_service_id}] ${s.price}원 → ${newPrice}원`);
      }
    }

    // 진행률 표시 (100개마다)
    if ((i + 1) % 100 === 0) {
      process.stdout.write(`진행: ${i + 1}/${services.length}\r`);
    }
  }

  console.log(`\n\n=== 결과 ===`);
  console.log(`업데이트: ${updated}개`);
  console.log(`스킵 (이미 정상): ${skipped}개`);
  console.log(`실패: ${failed}개`);

  // 최종 검증
  console.log('\n=== 최종 검증 ===');

  const { data: check } = await supabase
    .from('services')
    .select('provider_service_id, rate, price, margin')
    .order('price', { ascending: true })
    .limit(15);

  let allCorrect = true;
  check.forEach(s => {
    const expected = Math.ceil(s.rate * 2);
    const status = s.price === expected ? '✅' : '❌';
    if (s.price !== expected) allCorrect = false;
    console.log(`[${s.provider_service_id}] rate=${s.rate}, price=${s.price}, margin=${s.margin}% ${status}`);
  });

  // 문제있던 서비스 확인
  const problemIds = ['7788', '6726', '7423', '7318'];
  console.log('\n문제 서비스 확인:');
  for (const pid of problemIds) {
    const { data: svc } = await supabase
      .from('services')
      .select('provider_service_id, rate, price, margin')
      .eq('provider_service_id', pid)
      .single();

    if (svc) {
      const expected = Math.ceil(svc.rate * 2);
      const status = svc.price === expected ? '✅' : '❌';
      console.log(`[${svc.provider_service_id}] rate=${svc.rate}, price=${svc.price}, margin=${svc.margin}% ${status}`);
    }
  }

  if (allCorrect) {
    console.log('\n✅ 모든 가격이 올바르게 설정되었습니다!');
  }
}

main().catch(console.error);
