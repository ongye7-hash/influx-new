const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function analyze() {
  // Get categories
  const { data: categories } = await supabase.from('categories').select('*');
  console.log('\n========================================');
  console.log('        현재 카테고리 목록');
  console.log('========================================\n');

  const catByPlatform = {};
  categories.forEach(c => {
    if (!catByPlatform[c.platform]) catByPlatform[c.platform] = [];
    catByPlatform[c.platform].push(c.name);
  });

  for (const [platform, cats] of Object.entries(catByPlatform)) {
    console.log(`[${platform}]`);
    cats.forEach(c => console.log(`  - ${c}`));
  }

  // Get all services
  const { data: services } = await supabase.from('services').select('*');

  const categoryMap = {};
  categories.forEach(c => {
    categoryMap[c.id] = c;
  });

  console.log('\n========================================');
  console.log('        문제점 분석');
  console.log('========================================\n');

  // 1. YouTube 분석 - 빠른 조회수 유입 카테고리 확인
  console.log('🔴 [문제 1] YouTube 카테고리 분석');
  const ytCategories = categories.filter(c => c.platform === 'youtube');
  ytCategories.forEach(cat => {
    const catServices = services.filter(s => s.category_id === cat.id);
    console.log(`\n  [${cat.name}] - ${catServices.length}개 상품`);

    // 샘플 5개만 표시
    catServices.slice(0, 5).forEach(s => {
      console.log(`    - ${s.name.substring(0, 60)}...`);
    });
    if (catServices.length > 5) {
      console.log(`    ... 외 ${catServices.length - 5}개`);
    }
  });

  // 2. Facebook 분석
  console.log('\n\n🔴 [문제 2] Facebook 카테고리 분석');
  const fbCategories = categories.filter(c => c.platform === 'facebook');
  fbCategories.forEach(cat => {
    const catServices = services.filter(s => s.category_id === cat.id);
    console.log(`\n  [${cat.name}] - ${catServices.length}개 상품`);
    catServices.slice(0, 3).forEach(s => {
      console.log(`    - ${s.name.substring(0, 60)}...`);
    });
  });

  // 3. 플랫폼별 상품 개수
  console.log('\n\n========================================');
  console.log('        플랫폼별 상품 현황');
  console.log('========================================\n');

  const platformCounts = {};
  services.forEach(s => {
    const cat = categoryMap[s.category_id];
    const platform = cat ? cat.platform : 'Unknown';
    if (!platformCounts[platform]) platformCounts[platform] = { total: 0, active: 0 };
    platformCounts[platform].total++;
    if (s.is_active) platformCounts[platform].active++;
  });

  for (const [platform, counts] of Object.entries(platformCounts).sort((a,b) => b[1].total - a[1].total)) {
    console.log(`${platform}: 총 ${counts.total}개 (활성: ${counts.active}개)`);
  }

  // 4. 한국 관련 상품 검색
  console.log('\n\n========================================');
  console.log('        한국 관련 상품 현황');
  console.log('========================================\n');

  const koreanServices = services.filter(s =>
    s.name.includes('한국') ||
    s.name.includes('Korea') ||
    s.name.includes('korean')
  );

  console.log(`한국 관련 상품: ${koreanServices.length}개`);
  koreanServices.forEach(s => {
    const cat = categoryMap[s.category_id];
    console.log(`  [${cat?.platform}] ${s.name.substring(0, 50)}...`);
  });

  // 5. 잘못된 카테고리 감지
  console.log('\n\n========================================');
  console.log('        잠재적 카테고리 오류');
  console.log('========================================\n');

  // 라이브스트림인데 조회수 카테고리에 있는 경우 등
  services.forEach(s => {
    const cat = categoryMap[s.category_id];
    if (!cat) return;

    const name = s.name.toLowerCase();

    // 라이브스트림이 조회수 카테고리에 있는 경우
    if ((name.includes('live') || name.includes('라이브')) &&
        cat.name.includes('조회수') && !cat.name.includes('라이브')) {
      console.log(`⚠️ 라이브 상품이 조회수 카테고리에: [${cat.platform}/${cat.name}]`);
      console.log(`   ${s.name.substring(0, 60)}`);
    }
  });
}

analyze();
