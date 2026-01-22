const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function main() {
  console.log('=== 모든 서비스 강제 업데이트 (100% 마진) ===\n');

  // 전체 서비스 수 확인
  const { count } = await supabase.from('services').select('*', { count: 'exact', head: true });
  console.log(`DB 총 서비스 수: ${count}개\n`);

  // 모든 서비스 가져오기 (페이지네이션 포함)
  let allServices = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('services')
      .select('id, provider_service_id, rate, price, margin')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('조회 오류:', error.message);
      break;
    }

    allServices = allServices.concat(data);
    console.log(`조회됨: ${allServices.length}개`);

    if (data.length < limit) break;
    offset += limit;
  }

  console.log(`\n총 ${allServices.length}개 서비스 업데이트 시작...\n`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < allServices.length; i++) {
    const s = allServices[i];
    const newPrice = Math.ceil(s.rate * 2);

    // 조건 없이 무조건 업데이트
    const { error } = await supabase
      .from('services')
      .update({ price: newPrice, margin: 100 })
      .eq('id', s.id);

    if (error) {
      failed++;
      console.log(`❌ [${s.provider_service_id}] ${error.message}`);
    } else {
      updated++;
    }

    // 진행률
    if ((i + 1) % 100 === 0 || i === allServices.length - 1) {
      process.stdout.write(`진행: ${i + 1}/${allServices.length}\r`);
    }
  }

  console.log(`\n\n=== 업데이트 완료 ===`);
  console.log(`성공: ${updated}개`);
  console.log(`실패: ${failed}개`);

  // 검증
  console.log('\n=== 검증 ===');

  // margin이 0인 서비스 확인
  const { data: wrongMargin, count: wrongCount } = await supabase
    .from('services')
    .select('*', { count: 'exact' })
    .eq('margin', 0);

  console.log(`margin=0인 서비스: ${wrongCount}개`);

  // 가격이 잘못된 서비스 확인
  const { data: check } = await supabase
    .from('services')
    .select('provider_service_id, rate, price, margin')
    .order('price', { ascending: true })
    .limit(20);

  console.log('\n최저가 20개:');
  let issues = 0;
  check.forEach(s => {
    const expected = Math.ceil(s.rate * 2);
    const status = s.price === expected && s.margin === 100 ? '✅' : '❌';
    if (s.price !== expected || s.margin !== 100) issues++;
    console.log(`[${s.provider_service_id}] rate=${s.rate}, price=${s.price}, margin=${s.margin}% ${status}`);
  });

  if (issues === 0) {
    console.log('\n✅ 모든 가격이 올바르게 설정되었습니다!');
  } else {
    console.log(`\n⚠️ ${issues}개 서비스가 아직 문제 있음`);
  }
}

main().catch(console.error);
