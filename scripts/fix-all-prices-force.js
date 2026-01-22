const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function main() {
  console.log('=== 전체 서비스 강제 업데이트 (마진 100%) ===\n');

  const { data: services } = await supabase.from('services').select('id, provider_service_id, rate, price');

  console.log(`총 서비스: ${services.length}개\n`);

  let updated = 0;
  let failed = 0;

  for (const s of services) {
    const newPrice = Math.ceil(s.rate * 2);

    // 무조건 업데이트 (조건 없이)
    const { error } = await supabase
      .from('services')
      .update({ price: newPrice, margin: 100 })
      .eq('id', s.id);

    if (error) {
      failed++;
      console.log(`[${s.provider_service_id}] 실패: ${error.message}`);
    } else {
      updated++;
    }
  }

  console.log(`\n업데이트 완료: ${updated}개`);
  console.log(`실패: ${failed}개`);

  // 최종 확인
  const { data: check } = await supabase
    .from('services')
    .select('provider_service_id, rate, price')
    .order('price', { ascending: true })
    .limit(15);

  console.log('\n=== 최저가 서비스 TOP 15 (최종) ===');
  check.forEach(s => {
    const expected = Math.ceil(s.rate * 2);
    const status = s.price === expected ? '✅' : '❌';
    console.log(`[${s.provider_service_id}] 원가 ${s.rate}원 → 판매가 ${s.price}원 ${status}`);
  });
}

main();
