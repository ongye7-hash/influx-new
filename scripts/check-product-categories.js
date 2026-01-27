const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function check() {
  // 카테고리별 상품 조회
  const { data: categories } = await supabase
    .from('admin_categories')
    .select('*')
    .order('platform')
    .order('sort_order');

  const { data: products } = await supabase
    .from('admin_products')
    .select('*, admin_categories(name, platform)')
    .order('sort_order');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('          카테고리별 상품 배치 현황');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 플랫폼별로 그룹화
  const byPlatform = {};
  categories.forEach(cat => {
    if (!byPlatform[cat.platform]) byPlatform[cat.platform] = [];
    byPlatform[cat.platform].push(cat);
  });

  for (const [platform, cats] of Object.entries(byPlatform)) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[' + platform.toUpperCase() + ']');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (const cat of cats) {
      const catProducts = products.filter(p => p.category_id === cat.id);
      console.log('\n  📁 ' + cat.name + ' (' + catProducts.length + '개)');

      catProducts.forEach(p => {
        const desc = p.description || '';
        console.log('     - ' + p.name);
        if (desc) console.log('       └ ' + desc.substring(0, 70) + (desc.length > 70 ? '...' : ''));
      });

      if (catProducts.length === 0) {
        console.log('     (상품 없음)');
      }
    }
  }

  // 카테고리 없는 상품 확인
  const noCategory = products.filter(p => !p.category_id);
  if (noCategory.length > 0) {
    console.log('\n\n⚠️ 카테고리 없는 상품: ' + noCategory.length + '개');
    noCategory.forEach(p => console.log('  - ' + p.name));
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('총 카테고리: ' + categories.length + '개');
  console.log('총 상품: ' + products.length + '개');
  console.log('═══════════════════════════════════════════════════════════════');
}

check().catch(console.error);
