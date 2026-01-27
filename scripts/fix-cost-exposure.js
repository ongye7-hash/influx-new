const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function fix() {
  console.log('══════════════════════════════════════════════════════════');
  console.log('          원가 노출 문제 수정');
  console.log('══════════════════════════════════════════════════════════\n');

  // 원가 정보가 포함된 모든 상품 조회
  const { data, error } = await supabase
    .from('admin_products')
    .select('id, name, description')
    .or('description.ilike.%원가%,description.ilike.%cost%,description.ilike.%$%');

  if (error) {
    console.log('조회 에러:', error.message);
    return;
  }

  console.log('검사할 상품:', data?.length || 0, '개\n');

  if (!data || data.length === 0) {
    console.log('수정할 상품이 없습니다.');
    return;
  }

  let fixedCount = 0;

  for (const product of data) {
    let desc = product.description || '';
    let newDesc = desc;

    // 여러 패턴으로 원가 정보 제거
    // 패턴 1: 원가: $0.1003/1K |
    newDesc = newDesc.replace(/원가:\s*\$[\d.]+\/1K\s*\|?\s*/gi, '');

    // 패턴 2: cost: $0.1003/1K |
    newDesc = newDesc.replace(/cost:\s*\$[\d.]+\/1K\s*\|?\s*/gi, '');

    // 패턴 3: ($0.1003/1K) 형태
    newDesc = newDesc.replace(/\(\$[\d.]+\/1K\)\s*/gi, '');

    // 패턴 4: 단독 $0.1003/1K
    newDesc = newDesc.replace(/\$[\d.]+\/1K\s*\|?\s*/gi, '');

    newDesc = newDesc.trim();

    // 변경된 경우에만 업데이트
    if (newDesc !== desc) {
      console.log('수정:', product.name);
      console.log('  기존:', desc);
      console.log('  수정:', newDesc || '(설명 없음)');

      const { error: updateError } = await supabase
        .from('admin_products')
        .update({ description: newDesc || null })
        .eq('id', product.id);

      if (updateError) {
        console.log('  ❌ 에러:', updateError.message);
      } else {
        console.log('  ✅ 완료!');
        fixedCount++;
      }
      console.log('');
    }
  }

  console.log('══════════════════════════════════════════════════════════');
  console.log(`수정 완료: ${fixedCount}개 상품`);
  console.log('══════════════════════════════════════════════════════════');
}

fix().catch(console.error);
