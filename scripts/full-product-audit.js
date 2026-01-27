const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function audit() {
  console.log('================================================================');
  console.log('          INFLUX 상품 시스템 전체 점검');
  console.log('================================================================\n');

  const [productsRes, providersRes] = await Promise.all([
    supabase.from('admin_products').select('*, admin_categories(*)'),
    supabase.from('api_providers').select('*').eq('is_active', true),
  ]);

  const products = productsRes.data || [];
  const providers = providersRes.data || [];

  console.log('총 상품:', products.length, '개');
  console.log('활성 프로바이더:', providers.length, '개\n');

  const providerMap = new Map(providers.map(p => [p.id, p]));
  const issues = [];

  // 1. input_type 점검
  console.log('================================================================');
  console.log('[1] INPUT_TYPE 점검');
  console.log('================================================================');

  for (const product of products) {
    const name = (product.name + ' ' + (product.description || '')).toLowerCase();
    let expectedType = 'link';

    if (name.includes('댓글') || name.includes('comment') || name.includes('커스텀') || name.includes('custom')) {
      expectedType = 'link_comments';
    }
    if (name.includes('사용자명') || name.includes('username') || name.includes('멘션')) {
      expectedType = 'link_usernames';
    }

    if (product.input_type !== expectedType) {
      console.log('[X] ' + product.name);
      console.log('    현재: ' + product.input_type + ' -> 필요: ' + expectedType);
      issues.push({
        type: 'input_type',
        id: product.id,
        name: product.name,
        current: product.input_type,
        expected: expectedType,
      });
    }
  }

  if (issues.filter(i => i.type === 'input_type').length === 0) {
    console.log('[V] 모든 상품 input_type 정상');
  }

  // 2. 프로바이더 연결 점검
  console.log('\n================================================================');
  console.log('[2] 프로바이더 연결 점검');
  console.log('================================================================');

  for (const product of products) {
    if (!product.primary_provider_id || !product.primary_service_id) {
      console.log('[X] ' + product.name + ' - 프로바이더/서비스ID 없음');
      issues.push({ type: 'no_provider', id: product.id, name: product.name });
      continue;
    }

    const provider = providerMap.get(product.primary_provider_id);
    if (!provider) {
      console.log('[X] ' + product.name + ' - 프로바이더 ID 유효하지 않음: ' + product.primary_provider_id);
      issues.push({ type: 'invalid_provider', id: product.id, name: product.name });
    }
  }

  const providerIssueCount = issues.filter(i => i.type === 'no_provider' || i.type === 'invalid_provider').length;
  if (providerIssueCount === 0) {
    console.log('[V] 모든 상품 프로바이더 연결 정상');
  }

  // 3. 플랫폼별 상품 현황
  console.log('\n================================================================');
  console.log('[3] 플랫폼별 상품 현황');
  console.log('================================================================');

  const byPlatform = {};
  for (const product of products) {
    const platform = product.admin_categories?.platform || 'unknown';
    if (!byPlatform[platform]) byPlatform[platform] = [];
    byPlatform[platform].push(product);
  }

  for (const [platform, prods] of Object.entries(byPlatform)) {
    console.log('\n[' + platform.toUpperCase() + '] ' + prods.length + '개');
    for (const p of prods) {
      const provider = providerMap.get(p.primary_provider_id);
      const pName = provider ? provider.name : '(없음)';
      console.log('  - ' + p.name);
      console.log('    ' + pName + ' #' + (p.primary_service_id || 'X') + ' | ' + p.input_type + ' | ' + p.price_per_1000 + '원');
    }
  }

  // 4. 문제 요약
  console.log('\n================================================================');
  console.log('                    문제 요약');
  console.log('================================================================');
  console.log('input_type 문제:', issues.filter(i => i.type === 'input_type').length, '개');
  console.log('프로바이더 문제:', providerIssueCount, '개');
  console.log('총 문제:', issues.length, '개');

  return issues;
}

audit().then(issues => {
  if (issues.length > 0) {
    console.log('\n수정이 필요한 항목:');
    issues.forEach((issue, i) => {
      console.log((i+1) + '. [' + issue.type + '] ' + issue.name);
      if (issue.expected) {
        console.log('   -> ' + issue.expected + '로 변경 필요');
      }
    });
  }
}).catch(console.error);
