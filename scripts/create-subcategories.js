const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

// 새로운 서브 카테고리 구조
const SUBCATEGORIES = {
  youtube: [
    { name: '구독자', slug: 'youtube-subscribers', keywords: ['subscriber', '구독자'] },
    { name: '조회수 (일반)', slug: 'youtube-views', keywords: ['views', '조회수'], excludeKeywords: ['live', '라이브'] },
    { name: '조회수 (빠른유입)', slug: 'youtube-views-fast', keywords: ['adwords', 'ads', 'fast', 'instant'], excludeKeywords: ['live'] },
    { name: '라이브 스트림', slug: 'youtube-live', keywords: ['live stream', 'live concurrent', '라이브'] },
    { name: '좋아요', slug: 'youtube-likes', keywords: ['like', '좋아요'] },
    { name: '댓글', slug: 'youtube-comments', keywords: ['comment', '댓글'] },
    { name: '시청시간', slug: 'youtube-watchtime', keywords: ['watch time', 'watchtime', 'watch hour', '시청시간'] },
    { name: '한국 타겟', slug: 'youtube-korea', keywords: ['korea', '한국', '🇰🇷'] },
  ],
  facebook: [
    { name: '페이지 좋아요', slug: 'facebook-page-likes', keywords: ['page like', 'page follower', '페이지 좋아요', '페이지 팔로워'] },
    { name: '프로필 팔로워', slug: 'facebook-profile-followers', keywords: ['profile follower', '프로필 팔로워'] },
    { name: '게시물 좋아요/반응', slug: 'facebook-post-reactions', keywords: ['post like', 'post reaction', 'reaction', '게시물 좋아요', '반응'] },
    { name: '영상 조회수', slug: 'facebook-views', keywords: ['video view', 'reel view', '영상 조회수', '릴스'], excludeKeywords: ['live'] },
    { name: '라이브 스트림', slug: 'facebook-live', keywords: ['live stream', 'live view', '라이브'] },
    { name: '댓글', slug: 'facebook-comments', keywords: ['comment', '댓글'] },
    { name: '공유', slug: 'facebook-shares', keywords: ['share', '공유'] },
    { name: '그룹 멤버', slug: 'facebook-group', keywords: ['group member', '그룹 멤버'] },
  ],
  instagram: [
    { name: '팔로워 (외국인)', slug: 'instagram-followers', keywords: ['follower', '팔로워'], excludeKeywords: ['korea', '한국', '🇰🇷'] },
    { name: '팔로워 (한국인)', slug: 'instagram-followers-kr', keywords: ['follower', '팔로워'], requireKeywords: ['korea', '한국', '🇰🇷'] },
    { name: '좋아요', slug: 'instagram-likes', keywords: ['like', '좋아요'] },
    { name: '조회수 (릴스/영상)', slug: 'instagram-views', keywords: ['view', 'reel', '조회수', '릴스'] },
    { name: '댓글', slug: 'instagram-comments', keywords: ['comment', '댓글'] },
    { name: '스토리 조회수', slug: 'instagram-story', keywords: ['story', '스토리'] },
    { name: '라이브 스트림', slug: 'instagram-live', keywords: ['live', '라이브'] },
  ],
  tiktok: [
    { name: '팔로워', slug: 'tiktok-followers', keywords: ['follower', '팔로워'] },
    { name: '좋아요', slug: 'tiktok-likes', keywords: ['like', 'heart', '좋아요'] },
    { name: '조회수', slug: 'tiktok-views', keywords: ['view', '조회수'] },
    { name: '댓글', slug: 'tiktok-comments', keywords: ['comment', '댓글'] },
    { name: '공유', slug: 'tiktok-shares', keywords: ['share', '공유'] },
    { name: '라이브 스트림', slug: 'tiktok-live', keywords: ['live', '라이브'] },
  ],
  telegram: [
    { name: '멤버', slug: 'telegram-members', keywords: ['member', '멤버'] },
    { name: '조회수', slug: 'telegram-views', keywords: ['view', '조회수'] },
    { name: '반응', slug: 'telegram-reactions', keywords: ['reaction', '반응'] },
  ],
  twitter: [
    { name: '팔로워', slug: 'twitter-followers', keywords: ['follower', '팔로워'] },
    { name: '좋아요', slug: 'twitter-likes', keywords: ['like', '좋아요'] },
    { name: '리트윗', slug: 'twitter-retweets', keywords: ['retweet', '리트윗'] },
    { name: '조회수', slug: 'twitter-views', keywords: ['view', '조회수'] },
  ]
};

async function createSubcategories() {
  console.log('서브 카테고리 생성 시작...\n');

  // 기존 카테고리 조회
  const { data: existingCats } = await supabase.from('categories').select('*');
  console.log('기존 카테고리:', existingCats.length, '개');

  // 플랫폼별 카테고리 ID 매핑
  const platformCatId = {};
  existingCats.forEach(c => {
    platformCatId[c.slug] = c.id;
  });

  // 새 서브카테고리 생성
  let sortOrder = 100;
  const newCategories = [];

  for (const [platform, subcats] of Object.entries(SUBCATEGORIES)) {
    console.log(`\n[${platform}] 서브카테고리 ${subcats.length}개 준비`);

    for (const subcat of subcats) {
      newCategories.push({
        name: subcat.name,
        slug: subcat.slug,
        platform: platform,
        parent_id: platformCatId[platform] || null,
        keywords: JSON.stringify(subcat.keywords),
        exclude_keywords: JSON.stringify(subcat.excludeKeywords || []),
        require_keywords: JSON.stringify(subcat.requireKeywords || []),
        sort_order: sortOrder++,
        is_active: true
      });
    }
  }

  console.log('\n총', newCategories.length, '개 서브카테고리 생성 예정');
  console.log('\n서브카테고리 목록:');
  newCategories.forEach(c => {
    console.log(`  - [${c.platform}] ${c.name}`);
  });

  // 실제 DB에 삽입하려면 아래 주석 해제
  // const { data, error } = await supabase.from('categories').insert(newCategories);
  // if (error) console.log('Error:', error);
  // else console.log('성공!');

  return newCategories;
}

createSubcategories();
