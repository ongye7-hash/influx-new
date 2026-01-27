const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function fullCheck() {
  console.log('============================================================');
  console.log('           INFLUX 상품 시스템 전체 점검');
  console.log('============================================================\n');

  // 1. 카테고리 확인
  const { data: categories } = await supabase
    .from('admin_categories')
    .select('*')
    .eq('is_active', true)
    .order('platform');

  console.log('[1] 활성 카테고리:', categories?.length || 0, '개');

  // 2. 상품 확인
  const { data: products } = await supabase
    .from('admin_products')
    .select('*, admin_categories(name, platform)')
    .eq('is_active', true);

  console.log('[2] 활성 상품:', products?.length || 0, '개');

  // 3. 프로바이더 확인
  const { data: providers } = await supabase
    .from('providers')
    .select('*')
    .eq('is_active', true);

  console.log('[3] 활성 프로바이더:', providers?.length || 0, '개');
  if (providers) {
    providers.forEach(p => console.log('    -', p.name, '(' + p.slug + ')'));
  }

  // 4. 상품별 프로바이더 연결 상태 확인
  console.log('\n[4] 상품별 프로바이더 연결 상태:');
  console.log('------------------------------------------------------------');
  
  let issues = [];
  let okCount = 0;
  
  for (const product of products || []) {
    const platform = product.admin_categories?.platform || 'unknown';
    const catName = product.admin_categories?.name || 'unknown';
    
    const hasProvider = product.primary_provider_id && product.primary_service_id;
    
    if (hasProvider) {
      okCount++;
      console.log('[V] ' + platform.padEnd(12) + ' | ' + product.name);
      console.log('     Provider:', product.primary_provider_id?.substring(0, 8) + '...');
      console.log('     Service:', product.primary_service_id);
    } else {
      issues.push({ name: product.name, platform: platform });
      console.log('[X] ' + platform.padEnd(12) + ' | ' + product.name + ' (프로바이더 없음)');
    }
  }

  // 5. 문제 요약
  console.log('\n============================================================');
  console.log('                    점검 결과 요약');
  console.log('============================================================');
  console.log('총 상품:', (products?.length || 0), '개');
  console.log('연결 완료:', okCount, '개');
  console.log('미연결:', issues.length, '개');
  
  if (issues.length === 0) {
    console.log('\n[OK] 모든 상품에 프로바이더가 연결되어 있습니다!');
    console.log('[OK] 실제 주문 가능 상태입니다.');
  } else {
    console.log('\n[경고] 프로바이더 미연결 상품:');
    issues.forEach(i => console.log('  - [' + i.platform + '] ' + i.name));
    console.log('\n주의: 위 상품들은 주문해도 실제 처리가 안됩니다!');
  }
}

fullCheck();
