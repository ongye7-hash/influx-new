const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

// 서브카테고리 분류 규칙 (한글 이름 기반)
const TYPE_RULES = {
  youtube: [
    { type: 'live', patterns: [/라이브/, /live/i, /concurrent/i, /스트림/i], exclude: [] },
    { type: 'subscribers', patterns: [/구독/, /subscriber/i, /sub\s/i], exclude: [] },
    { type: 'views', patterns: [/조회/, /view/i], exclude: [/live/i, /라이브/, /스트림/] },
    { type: 'likes', patterns: [/좋아요/, /like/i], exclude: [/싫어요/, /dislike/i] },
    { type: 'dislikes', patterns: [/싫어요/, /dislike/i], exclude: [] },
    { type: 'comments', patterns: [/댓글/, /comment/i], exclude: [] },
    { type: 'watchtime', patterns: [/시청시간/, /watch.*time/i, /watch.*hour/i], exclude: [] },
    { type: 'shares', patterns: [/공유/, /share/i], exclude: [] },
    { type: 'shorts', patterns: [/쇼츠/, /short/i], exclude: [] },
  ],
  instagram: [
    { type: 'live', patterns: [/라이브/, /live/i], exclude: [] },
    { type: 'followers', patterns: [/팔로워/, /follower/i], exclude: [] },
    { type: 'likes', patterns: [/좋아요/, /like/i], exclude: [/자동/] },
    { type: 'views', patterns: [/조회/, /view/i, /릴스/, /reel/i], exclude: [/live/i, /라이브/, /스토리/] },
    { type: 'comments', patterns: [/댓글/, /comment/i], exclude: [] },
    { type: 'story', patterns: [/스토리/, /story/i], exclude: [] },
    { type: 'saves', patterns: [/저장/, /save/i], exclude: [] },
    { type: 'reach', patterns: [/리치/, /reach/i, /노출/, /impression/i], exclude: [] },
    { type: 'auto-likes', patterns: [/자동/, /auto/i], exclude: [] },
  ],
  facebook: [
    { type: 'live', patterns: [/라이브/, /live/i], exclude: [] },
    { type: 'page-likes', patterns: [/페이지.*좋아요/, /페이지.*팔로워/, /page.*like/i, /page.*follower/i], exclude: [] },
    { type: 'profile-followers', patterns: [/프로필.*팔로워/, /친구/, /profile.*follower/i, /friend/i], exclude: [/페이지/] },
    { type: 'post-likes', patterns: [/게시물/, /반응/, /post.*like/i, /reaction/i], exclude: [] },
    { type: 'views', patterns: [/영상.*조회/, /video.*view/i, /reel.*view/i], exclude: [/live/i, /라이브/] },
    { type: 'comments', patterns: [/댓글/, /comment/i], exclude: [] },
    { type: 'shares', patterns: [/공유/, /share/i], exclude: [] },
    { type: 'group', patterns: [/그룹/, /group/i], exclude: [] },
    { type: 'rating', patterns: [/평점/, /리뷰/, /rating/i, /review/i], exclude: [] },
  ],
  tiktok: [
    { type: 'live', patterns: [/라이브/, /live/i], exclude: [] },
    { type: 'followers', patterns: [/팔로워/, /follower/i], exclude: [] },
    { type: 'likes', patterns: [/좋아요/, /하트/, /like/i, /heart/i], exclude: [] },
    { type: 'views', patterns: [/조회/, /view/i], exclude: [/live/i, /라이브/] },
    { type: 'comments', patterns: [/댓글/, /comment/i], exclude: [] },
    { type: 'shares', patterns: [/공유/, /share/i], exclude: [] },
    { type: 'saves', patterns: [/저장/, /save/i, /favorite/i], exclude: [] },
  ],
  telegram: [
    { type: 'members', patterns: [/멤버/, /member/i], exclude: [] },
    { type: 'views', patterns: [/조회/, /view/i], exclude: [] },
    { type: 'reactions', patterns: [/반응/, /reaction/i], exclude: [] },
    { type: 'comments', patterns: [/댓글/, /comment/i], exclude: [] },
    { type: 'votes', patterns: [/투표/, /vote/i, /poll/i], exclude: [] },
    { type: 'subscribers', patterns: [/구독/, /subscriber/i], exclude: [] },
  ],
  twitter: [
    { type: 'followers', patterns: [/팔로워/, /follower/i], exclude: [] },
    { type: 'likes', patterns: [/좋아요/, /like/i], exclude: [] },
    { type: 'retweets', patterns: [/리트윗/, /retweet/i, /rt\s/i], exclude: [] },
    { type: 'views', patterns: [/조회/, /view/i, /노출/, /impression/i], exclude: [] },
    { type: 'comments', patterns: [/댓글/, /답글/, /comment/i, /reply/i], exclude: [] },
  ],
  spotify: [
    { type: 'plays', patterns: [/재생/, /play/i, /stream/i], exclude: [] },
    { type: 'followers', patterns: [/팔로워/, /follower/i], exclude: [] },
    { type: 'monthly-listeners', patterns: [/월간/, /monthly/i, /listener/i], exclude: [] },
    { type: 'saves', patterns: [/저장/, /save/i], exclude: [] },
  ],
  threads: [
    { type: 'followers', patterns: [/팔로워/, /follower/i], exclude: [] },
    { type: 'likes', patterns: [/좋아요/, /like/i], exclude: [] },
    { type: 'reposts', patterns: [/리포스트/, /repost/i], exclude: [] },
  ],
};

// 한국 타겟 감지
function isKoreanTargeted(name) {
  return /한국|korea|korean|🇰🇷|🇰🇵/i.test(name);
}

// 서브카테고리 타입 감지
function detectType(name, platform) {
  const rules = TYPE_RULES[platform];
  if (!rules) return 'other';

  for (const rule of rules) {
    const matchesPattern = rule.patterns.some(p => p.test(name));
    const matchesExclude = rule.exclude.some(p => p.test(name));

    if (matchesPattern && !matchesExclude) {
      const isKorean = isKoreanTargeted(name);
      return isKorean ? `${rule.type}-korean` : rule.type;
    }
  }

  return 'other';
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           서비스 타입 분류 및 활성화');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. 카테고리 조회
  const { data: categories } = await supabase.from('categories').select('*');
  const categoryMap = {};
  categories.forEach(c => {
    categoryMap[c.id] = c.slug;
  });

  // 2. 모든 서비스 조회
  console.log('[1/3] 서비스 조회 중...');
  const { data: services, error } = await supabase.from('services').select('*');

  if (error) {
    console.log('Error:', error);
    return;
  }

  console.log(`      총 ${services.length}개 서비스 로드\n`);

  // 3. 타입 분류 및 통계
  console.log('[2/3] 타입 분류 중...');

  const typeStats = {};
  const updates = [];

  services.forEach(s => {
    const platform = categoryMap[s.category_id] || 'other';
    const newType = detectType(s.name, platform);

    if (!typeStats[`${platform}/${newType}`]) {
      typeStats[`${platform}/${newType}`] = 0;
    }
    typeStats[`${platform}/${newType}`]++;

    updates.push({
      id: s.id,
      type: newType,
      is_active: true, // 모든 서비스 활성화
    });
  });

  console.log('\n서브카테고리별 분류 결과:');
  Object.entries(typeStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .forEach(([key, count]) => {
      console.log(`  ${key.padEnd(35)} ${String(count).padStart(4)}개`);
    });

  // 한국 타겟 통계
  const koreanCount = Object.entries(typeStats)
    .filter(([k]) => k.includes('-korean'))
    .reduce((sum, [, count]) => sum + count, 0);
  console.log(`\n한국 타겟 상품 총: ${koreanCount}개`);

  // 4. DB 업데이트
  console.log('\n[3/3] DB 업데이트 중...');

  let updated = 0;
  let errors = 0;

  // 개별 업데이트 (배치 업데이트가 안되므로)
  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('services')
      .update({ type: update.type, is_active: update.is_active })
      .eq('id', update.id);

    if (updateError) {
      errors++;
    } else {
      updated++;
      if (updated % 100 === 0) {
        process.stdout.write(`  ${updated}/${updates.length} 완료\r`);
      }
    }
  }

  console.log(`\n\n═══════════════════════════════════════════════════════════════`);
  console.log(`           작업 완료!`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`업데이트: ${updated}개`);
  console.log(`에러: ${errors}개`);
}

main().catch(console.error);
