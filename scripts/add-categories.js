// 카테고리 대량 추가 스크립트
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local 파일 직접 파싱
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

const categories = [
  // ========== Instagram ==========
  { platform: 'instagram', name: '🇰🇷 [한국인] 리얼 좋아요', slug: 'kr-real-likes', sort_order: 1 },
  { platform: 'instagram', name: '🇰🇷 [한국인] 리얼 팔로워', slug: 'kr-real-followers', sort_order: 2 },
  { platform: 'instagram', name: '🇰🇷 [한국인] 커스텀 댓글', slug: 'kr-custom-comments', sort_order: 3 },
  { platform: 'instagram', name: '🇰🇷 [한국인] 자동 좋아요', slug: 'kr-auto-likes', sort_order: 4 },
  { platform: 'instagram', name: '⚡ [외국인] 스피드 좋아요', slug: 'global-speed-likes', sort_order: 5 },
  { platform: 'instagram', name: '🛡️ [외국인] AS보장 팔로워', slug: 'global-refill-followers', sort_order: 6 },
  { platform: 'instagram', name: '💸 [외국인] 최저가 막팔로워', slug: 'global-cheap-followers', sort_order: 7 },
  { platform: 'instagram', name: '📹 [릴스] 조회수 + 도달', slug: 'reels-views-reach', sort_order: 8 },
  { platform: 'instagram', name: '👁️ [동영상] 조회수', slug: 'video-views', sort_order: 9 },
  { platform: 'instagram', name: '📖 [스토리] 조회수 + 투표', slug: 'story-views-polls', sort_order: 10 },
  { platform: 'instagram', name: '📊 [인사이트] 노출/도달/저장', slug: 'insights-impressions', sort_order: 11 },
  { platform: 'instagram', name: '🔴 [라이브] 방송 시청자', slug: 'live-viewers', sort_order: 12 },
  { platform: 'instagram', name: '💬 [댓글] 외국인/이모티콘', slug: 'global-comments-emoji', sort_order: 13 },
  { platform: 'instagram', name: '💙 [블루뱃지] 인증 계정', slug: 'verified-engagement', sort_order: 14 },

  // ========== YouTube ==========
  { platform: 'youtube', name: '👀 [조회수] 고품질/논드랍', slug: 'hq-views-nodrop', sort_order: 1 },
  { platform: 'youtube', name: '⚡ [조회수] 빠른 유입', slug: 'fast-views', sort_order: 2 },
  { platform: 'youtube', name: '📱 [쇼츠] 조회수', slug: 'shorts-views', sort_order: 3 },
  { platform: 'youtube', name: '📱 [쇼츠] 좋아요/공유', slug: 'shorts-engagement', sort_order: 4 },
  { platform: 'youtube', name: '👥 [구독자] 실제 유저', slug: 'real-subscribers', sort_order: 5 },
  { platform: 'youtube', name: '👥 [구독자] 저가형', slug: 'cheap-subscribers', sort_order: 6 },
  { platform: 'youtube', name: '⏳ [시청시간] 4000시간', slug: 'watchtime-4000', sort_order: 7 },
  { platform: 'youtube', name: '👍 [좋아요/싫어요] 반응', slug: 'likes-dislikes', sort_order: 8 },
  { platform: 'youtube', name: '🔴 [라이브] 스트리밍 시청자', slug: 'live-stream-viewers', sort_order: 9 },
  { platform: 'youtube', name: '💬 [댓글] 한국인/외국인', slug: 'comments', sort_order: 10 },
  { platform: 'youtube', name: '↗️ [공유] 소셜 공유', slug: 'social-shares', sort_order: 11 },

  // ========== Facebook ==========
  { platform: 'facebook', name: '📄 [페이지] 팔로워/좋아요', slug: 'page-followers-likes', sort_order: 1 },
  { platform: 'facebook', name: '👤 [프로필] 팔로워/친구', slug: 'profile-followers-friends', sort_order: 2 },
  { platform: 'facebook', name: '👍 [게시물] 좋아요', slug: 'post-likes', sort_order: 3 },
  { platform: 'facebook', name: '😍 [게시물] 이모티콘 반응', slug: 'post-reactions', sort_order: 4 },
  { platform: 'facebook', name: '🔴 [라이브] 방송 시청자', slug: 'live-viewers', sort_order: 5 },
  { platform: 'facebook', name: '👁️ [동영상] 조회수', slug: 'video-views', sort_order: 6 },
  { platform: 'facebook', name: '👥 [그룹] 멤버 추가', slug: 'group-members', sort_order: 7 },

  // ========== TikTok ==========
  { platform: 'tiktok', name: '👁️ [조회수] 바이럴/추천', slug: 'viral-views', sort_order: 1 },
  { platform: 'tiktok', name: '❤️ [좋아요] 게시물 하트', slug: 'post-likes', sort_order: 2 },
  { platform: 'tiktok', name: '👤 [팔로워] 계정 팔로우', slug: 'followers', sort_order: 3 },
  { platform: 'tiktok', name: '↗️ [공유/저장] 쉐어/즐겨찾기', slug: 'shares-saves', sort_order: 4 },
  { platform: 'tiktok', name: '🔴 [라이브] 시청자 + 하트', slug: 'live-viewers-hearts', sort_order: 5 },
  { platform: 'tiktok', name: '💬 [댓글] 랜덤/이모지', slug: 'comments-emoji', sort_order: 6 },

  // ========== Twitter/X ==========
  { platform: 'twitter', name: '👤 [팔로워] 글로벌/NFT', slug: 'global-nft-followers', sort_order: 1 },
  { platform: 'twitter', name: '🇰🇷 [팔로워] 한국인', slug: 'kr-followers', sort_order: 2 },
  { platform: 'twitter', name: '🔄 [리트윗] RT + 인용', slug: 'retweets-quotes', sort_order: 3 },
  { platform: 'twitter', name: '❤️ [좋아요] 마음', slug: 'likes', sort_order: 4 },
  { platform: 'twitter', name: '📊 [조회수] 임프레션', slug: 'impressions', sort_order: 5 },
  { platform: 'twitter', name: '🗳️ [투표] 설문조사', slug: 'poll-votes', sort_order: 6 },
  { platform: 'twitter', name: '🎙️ [스페이스] 청취자', slug: 'spaces-listeners', sort_order: 7 },

  // ========== Telegram ==========
  { platform: 'telegram', name: '👥 [채널/그룹] 멤버 추가', slug: 'channel-group-members', sort_order: 1 },
  { platform: 'telegram', name: '👁️ [조회수] 게시물 뷰', slug: 'post-views', sort_order: 2 },
  { platform: 'telegram', name: '👍 [반응] 이모지/리액션', slug: 'reactions', sort_order: 3 },
  { platform: 'telegram', name: '🗳️ [투표] 설문조사', slug: 'poll-votes', sort_order: 4 },

  // ========== Discord ==========
  { platform: 'discord', name: '👥 [멤버] 오프라인 멤버', slug: 'offline-members', sort_order: 1 },
  { platform: 'discord', name: '🟢 [멤버] 온라인 멤버', slug: 'online-members', sort_order: 2 },
  { platform: 'discord', name: '🚀 [부스트] 서버 부스팅', slug: 'server-boosts', sort_order: 3 },
  { platform: 'discord', name: '🤝 [친구] 친구 요청', slug: 'friend-requests', sort_order: 4 },

  // ========== Threads ==========
  { platform: 'threads', name: '👤 [팔로워] 계정 팔로우', slug: 'followers', sort_order: 1 },
  { platform: 'threads', name: '❤️ [좋아요] 게시물 하트', slug: 'post-likes', sort_order: 2 },
  { platform: 'threads', name: '🔄 [리포스트] 재게시', slug: 'reposts', sort_order: 3 },

  // ========== Spotify ==========
  { platform: 'spotify', name: '🎧 [스트리밍] 음원 재생수', slug: 'plays', sort_order: 1 },
  { platform: 'spotify', name: '👤 [팔로워/리스너] 월간 청취자', slug: 'monthly-listeners', sort_order: 2 },

  // ========== SoundCloud ==========
  { platform: 'soundcloud', name: '🎧 [재생수] Plays', slug: 'plays', sort_order: 1 },
  { platform: 'soundcloud', name: '👤 [팔로워] Followers', slug: 'followers', sort_order: 2 },
];

async function addCategories() {
  console.log(`총 ${categories.length}개 카테고리 추가 시작...`);

  // 기존 카테고리 확인
  const { data: existing } = await supabase
    .from('admin_categories')
    .select('platform, slug');

  const existingSet = new Set(
    (existing || []).map((c) => `${c.platform}-${c.slug}`)
  );

  const toInsert = categories
    .filter((c) => !existingSet.has(`${c.platform}-${c.slug}`))
    .map((c) => ({
      ...c,
      is_active: true,
    }));

  if (toInsert.length === 0) {
    console.log('추가할 새 카테고리가 없습니다.');
    return;
  }

  console.log(`${toInsert.length}개 새 카테고리 추가 중...`);

  const { data, error } = await supabase
    .from('admin_categories')
    .insert(toInsert)
    .select();

  if (error) {
    console.error('에러:', error);
  } else {
    console.log(`✅ ${data.length}개 카테고리 추가 완료!`);

    // 플랫폼별 카운트
    const counts = {};
    data.forEach((c) => {
      counts[c.platform] = (counts[c.platform] || 0) + 1;
    });
    console.log('\n플랫폼별 추가 수:');
    Object.entries(counts).forEach(([platform, count]) => {
      console.log(`  ${platform}: ${count}개`);
    });
  }
}

addCategories();
