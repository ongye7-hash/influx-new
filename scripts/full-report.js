const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function fullReport() {
  const { data: categories } = await supabase.from('categories').select('*');
  const { data: services } = await supabase.from('services').select('*');

  const catMap = {};
  categories.forEach(c => catMap[c.id] = c);

  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║              INFLUX 서비스 현황 분석 보고서                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  // 1. 전체 현황
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. 전체 현황');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const platformCounts = {};
  services.forEach(s => {
    const cat = catMap[s.category_id];
    const platform = cat ? cat.name : 'Unknown';
    if (!platformCounts[platform]) platformCounts[platform] = { total: 0, active: 0 };
    platformCounts[platform].total++;
    if (s.is_active) platformCounts[platform].active++;
  });

  console.log('플랫폼별 상품 수:');
  Object.entries(platformCounts)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([platform, counts]) => {
      const bar = '█'.repeat(Math.min(Math.floor(counts.total / 20), 30));
      console.log(`  ${platform.padEnd(15)} ${String(counts.total).padStart(4)}개 (활성: ${counts.active}) ${bar}`);
    });

  const totalActive = services.filter(s => s.is_active).length;
  console.log(`\n총 ${services.length}개 상품 중 ${totalActive}개 활성화\n`);

  // 2. 문제점 분석
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2. 🚨 발견된 문제점');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🔴 문제 1: 서브 카테고리 없음');
  console.log('   현재: 플랫폼 단위 카테고리만 존재 (Instagram, YouTube 등)');
  console.log('   필요: 세부 카테고리 필요 (팔로워, 좋아요, 조회수, 라이브뷰 등)');
  console.log('');

  // Parse service descriptions to find service types
  const serviceTypes = {};
  services.forEach(s => {
    const cat = catMap[s.category_id];
    if (!cat) return;
    const platform = cat.name;

    try {
      const desc = JSON.parse(s.description || '{}');
      const type = desc.service_type || 'Unknown';
      const key = `${platform}|${type}`;
      if (!serviceTypes[key]) serviceTypes[key] = [];
      serviceTypes[key].push(s.name);
    } catch (e) {}
  });

  console.log('🔴 문제 2: 상품 타입 혼재');
  console.log('   각 플랫폼에 필요한 서브 카테고리:');

  const platformServiceTypes = {};
  Object.keys(serviceTypes).forEach(key => {
    const [platform, type] = key.split('|');
    if (!platformServiceTypes[platform]) platformServiceTypes[platform] = new Set();
    platformServiceTypes[platform].add(type);
  });

  Object.entries(platformServiceTypes).forEach(([platform, types]) => {
    console.log(`\n   [${platform}]`);
    Array.from(types).forEach(type => {
      const count = serviceTypes[`${platform}|${type}`]?.length || 0;
      console.log(`     - ${type}: ${count}개`);
    });
  });

  // 3. Facebook 분석
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('3. 🔍 Facebook 상세 분석');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const fbCat = categories.find(c => c.name === 'Facebook');
  const fbServices = services.filter(s => s.category_id === fbCat?.id);

  console.log(`총 ${fbServices.length}개 상품`);
  console.log('\n상품 타입별 분포:');

  const fbTypes = {};
  fbServices.forEach(s => {
    try {
      const desc = JSON.parse(s.description || '{}');
      const origCat = desc.original_category || 'Unknown';
      if (!fbTypes[origCat]) fbTypes[origCat] = 0;
      fbTypes[origCat]++;
    } catch (e) {}
  });

  Object.entries(fbTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${count.toString().padStart(3)}개: ${type.substring(0, 60)}`);
    });

  // Check for Korean services
  const fbKorean = fbServices.filter(s =>
    s.name.includes('한국') || s.name.includes('Korea')
  );
  console.log(`\n한국 대상 상품: ${fbKorean.length}개`);

  // 4. YouTube 분석
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('4. 🔍 YouTube 상세 분석');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const ytCat = categories.find(c => c.name === 'YouTube');
  const ytServices = services.filter(s => s.category_id === ytCat?.id);

  console.log(`총 ${ytServices.length}개 상품`);

  const ytTypes = {};
  ytServices.forEach(s => {
    try {
      const desc = JSON.parse(s.description || '{}');
      const origCat = desc.original_category || 'Unknown';
      if (!ytTypes[origCat]) ytTypes[origCat] = 0;
      ytTypes[origCat]++;
    } catch (e) {}
  });

  console.log('\n원본 카테고리별 분포:');
  Object.entries(ytTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${count.toString().padStart(3)}개: ${type.substring(0, 60)}`);
    });

  // Find livestream views
  const ytLive = ytServices.filter(s =>
    s.name.toLowerCase().includes('live') || s.name.includes('라이브')
  );
  console.log(`\n라이브 관련 상품: ${ytLive.length}개`);
  ytLive.slice(0, 5).forEach(s => {
    console.log(`  - ${s.name.substring(0, 60)}...`);
  });

  // 5. 권장 조치사항
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('5. ✅ 권장 조치사항');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📌 카테고리 구조 변경 필요:');
  console.log('');
  console.log('   [YouTube]');
  console.log('     ├─ 구독자');
  console.log('     ├─ 조회수 (일반)');
  console.log('     ├─ 조회수 (빠른 유입)');
  console.log('     ├─ 라이브 스트림 뷰');
  console.log('     ├─ 좋아요');
  console.log('     ├─ 댓글');
  console.log('     ├─ 시청시간');
  console.log('     └─ 한국 타겟');
  console.log('');
  console.log('   [Facebook]');
  console.log('     ├─ 페이지 좋아요 (한국인)');
  console.log('     ├─ 페이지 좋아요 (외국인)');
  console.log('     ├─ 프로필 팔로워 (한국인)');
  console.log('     ├─ 프로필 팔로워 (외국인)');
  console.log('     ├─ 게시물 좋아요');
  console.log('     ├─ 영상 조회수');
  console.log('     ├─ 라이브 스트림 뷰');
  console.log('     ├─ 댓글');
  console.log('     └─ 그룹 멤버');
  console.log('');
  console.log('   [Instagram]');
  console.log('     ├─ 팔로워 (한국인)');
  console.log('     ├─ 팔로워 (외국인)');
  console.log('     ├─ 좋아요');
  console.log('     ├─ 조회수 (릴스/영상)');
  console.log('     ├─ 댓글');
  console.log('     └─ 스토리 조회수');
  console.log('');
  console.log('📌 상품 활성화 필요:');
  console.log(`   현재 ${totalActive}개만 활성화됨 (${services.length}개 중)`);
  console.log('');
  console.log('📌 잘못된 분류 수정 필요:');
  console.log('   - 라이브 스트림 상품들이 조회수 카테고리에 혼재');
  console.log('   - 한국/외국 타겟 구분 없음');
}

fullReport();
