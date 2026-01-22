const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

// 서비스 이름에서 서브카테고리 추출
function extractSubCategory(name) {
  const nameLower = name.toLowerCase();

  // 유튜브
  if (nameLower.includes('유튜브') || nameLower.includes('youtube')) {
    if (nameLower.includes('조회수') || nameLower.includes('view')) return '조회수';
    if (nameLower.includes('구독자') || nameLower.includes('subscriber')) return '구독자';
    if (nameLower.includes('좋아요') || nameLower.includes('like')) return '좋아요';
    if (nameLower.includes('댓글') || nameLower.includes('comment')) return '댓글';
    if (nameLower.includes('시청') || nameLower.includes('watch')) return '시청시간';
    if (nameLower.includes('쇼츠') || nameLower.includes('short')) return '쇼츠';
    if (nameLower.includes('라이브') || nameLower.includes('live')) return '라이브';
    if (nameLower.includes('공유') || nameLower.includes('share')) return '공유';
    return '기타';
  }

  // 인스타그램
  if (nameLower.includes('인스타') || nameLower.includes('instagram')) {
    if (nameLower.includes('팔로워') || nameLower.includes('follower')) return '팔로워';
    if (nameLower.includes('좋아요') || nameLower.includes('like')) return '좋아요';
    if (nameLower.includes('조회수') || nameLower.includes('view')) return '조회수';
    if (nameLower.includes('댓글') || nameLower.includes('comment')) return '댓글';
    if (nameLower.includes('릴스') || nameLower.includes('reel')) return '릴스';
    if (nameLower.includes('스토리') || nameLower.includes('story')) return '스토리';
    if (nameLower.includes('저장') || nameLower.includes('save')) return '저장';
    if (nameLower.includes('공유') || nameLower.includes('share')) return '공유';
    if (nameLower.includes('노출') || nameLower.includes('impression')) return '노출';
    return '기타';
  }

  // 틱톡
  if (nameLower.includes('틱톡') || nameLower.includes('tiktok')) {
    if (nameLower.includes('팔로워') || nameLower.includes('follower')) return '팔로워';
    if (nameLower.includes('좋아요') || nameLower.includes('like') || nameLower.includes('heart')) return '좋아요';
    if (nameLower.includes('조회수') || nameLower.includes('view')) return '조회수';
    if (nameLower.includes('댓글') || nameLower.includes('comment')) return '댓글';
    if (nameLower.includes('공유') || nameLower.includes('share')) return '공유';
    if (nameLower.includes('저장') || nameLower.includes('save')) return '저장';
    if (nameLower.includes('라이브') || nameLower.includes('live')) return '라이브';
    return '기타';
  }

  // 트위터/X
  if (nameLower.includes('트위터') || nameLower.includes('twitter') || nameLower.includes('x /') || nameLower.includes('x/')) {
    if (nameLower.includes('팔로워') || nameLower.includes('follower')) return '팔로워';
    if (nameLower.includes('좋아요') || nameLower.includes('like')) return '좋아요';
    if (nameLower.includes('리트윗') || nameLower.includes('retweet')) return '리트윗';
    if (nameLower.includes('조회수') || nameLower.includes('view')) return '조회수';
    if (nameLower.includes('댓글') || nameLower.includes('comment') || nameLower.includes('reply')) return '댓글';
    if (nameLower.includes('노출') || nameLower.includes('impression')) return '노출';
    if (nameLower.includes('투표') || nameLower.includes('poll') || nameLower.includes('vote')) return '투표';
    return '기타';
  }

  // 페이스북
  if (nameLower.includes('페이스북') || nameLower.includes('facebook')) {
    if (nameLower.includes('팔로워') || nameLower.includes('follower')) return '팔로워';
    if (nameLower.includes('좋아요') || nameLower.includes('like')) return '좋아요';
    if (nameLower.includes('조회수') || nameLower.includes('view')) return '조회수';
    if (nameLower.includes('댓글') || nameLower.includes('comment')) return '댓글';
    if (nameLower.includes('공유') || nameLower.includes('share')) return '공유';
    if (nameLower.includes('멤버') || nameLower.includes('member')) return '그룹멤버';
    if (nameLower.includes('그룹') || nameLower.includes('group')) return '그룹';
    if (nameLower.includes('페이지') || nameLower.includes('page')) return '페이지';
    return '기타';
  }

  // 텔레그램
  if (nameLower.includes('텔레그램') || nameLower.includes('telegram')) {
    if (nameLower.includes('멤버') || nameLower.includes('member')) return '멤버';
    if (nameLower.includes('조회수') || nameLower.includes('view')) return '조회수';
    if (nameLower.includes('반응') || nameLower.includes('reaction')) return '반응';
    if (nameLower.includes('구독') || nameLower.includes('subscriber')) return '구독자';
    if (nameLower.includes('공유') || nameLower.includes('share')) return '공유';
    return '기타';
  }

  return '기타';
}

async function analyze() {
  console.log('=== 플랫폼별 서브카테고리 분석 ===\n');

  // 모든 서비스 가져오기 (페이지네이션)
  let allServices = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data } = await supabase
      .from('services')
      .select('name, category_id')
      .eq('is_active', true)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (data && data.length > 0) {
      allServices = [...allServices, ...data];
      page++;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  console.log('총 서비스:', allServices.length, '개\n');

  // 카테고리 가져오기
  const { data: categories } = await supabase.from('categories').select('*');
  const catMap = {};
  categories.forEach(c => catMap[c.id] = c.slug);

  // 플랫폼별 서브카테고리 분석
  const platforms = ['youtube', 'instagram', 'tiktok', 'twitter', 'facebook', 'telegram'];

  for (const platform of platforms) {
    const platformCat = categories.find(c => c.slug === platform);
    if (!platformCat) continue;

    const platformServices = allServices.filter(s => s.category_id === platformCat.id);

    // 서브카테고리별 카운트
    const subCats = {};
    platformServices.forEach(s => {
      const subCat = extractSubCategory(s.name);
      if (!subCats[subCat]) subCats[subCat] = 0;
      subCats[subCat]++;
    });

    console.log(`📁 ${platform.toUpperCase()} (${platformServices.length}개)`);
    Object.entries(subCats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([sub, count]) => {
        console.log(`   └── ${sub}: ${count}개`);
      });
    console.log('');
  }
}

analyze().catch(console.error);
