/**
 * 서비스 메타데이터를 JSON 형식으로 업데이트
 * - platform, service_type, input_type, original_category 포함
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local 로드
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) envVars[key.trim()] = values.join('=').trim();
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

// YTResellers 원본 데이터 로드
const ytServices = JSON.parse(fs.readFileSync(path.join(__dirname, 'ytresellers_full.json'), 'utf8'));
const ytMap = {};
ytServices.forEach(s => {
  ytMap[String(s.service)] = s;
});

console.log('YTResellers 서비스 수:', Object.keys(ytMap).length);

// 입력 타입 매핑
const INPUT_TYPE_MAP = {
  'Default': 'link',
  'Custom Comments': 'link_comments',
  'Comment Likes': 'link',
  'Mentions Hashtag': 'link_hashtags',
  'Mentions': 'link_usernames',
  'Package': 'link',
  'SEO': 'link_keywords',
  'Mentions with Hashtags': 'link_usernames_hashtags',
  'Mentions User Followers': 'link_usernames',
  'Mentions Custom List': 'link_usernames',
  'Mentions Media Likers': 'link_usernames',
  'Poll': 'link_answer'
};

// 플랫폼 감지
function detectPlatform(name, category) {
  const text = (name + ' ' + category).toLowerCase();

  if (text.includes('instagram') || text.includes('인스타')) return 'Instagram';
  if (text.includes('youtube') || text.includes('유튜브')) return 'YouTube';
  if (text.includes('tiktok') || text.includes('틱톡')) return 'TikTok';
  if (text.includes('facebook') || text.includes('페이스북')) return 'Facebook';
  if (text.includes('twitter') || text.includes('트위터') || text.includes('x /') || text.includes('x-')) return 'Twitter/X';
  if (text.includes('telegram') || text.includes('텔레그램')) return 'Telegram';
  if (text.includes('twitch') || text.includes('트위치')) return 'Twitch';
  if (text.includes('discord') || text.includes('디스코드')) return 'Discord';
  if (text.includes('spotify') || text.includes('스포티파이')) return 'Spotify';
  if (text.includes('linkedin') || text.includes('링크드인')) return 'LinkedIn';
  if (text.includes('pinterest')) return 'Pinterest';
  if (text.includes('soundcloud')) return 'SoundCloud';
  if (text.includes('threads') || text.includes('쓰레드')) return 'Threads';

  return '기타';
}

// 서비스 타입 감지
function detectServiceType(name) {
  const lower = name.toLowerCase();

  if (lower.includes('follower') || lower.includes('팔로워')) return 'Followers';
  if (lower.includes('subscriber') || lower.includes('구독')) return 'Subscribers';
  if (lower.includes('like') || lower.includes('좋아요')) return 'Likes';
  if (lower.includes('view') || lower.includes('조회')) return 'Views';
  if (lower.includes('comment') || lower.includes('댓글')) return 'Comments';
  if (lower.includes('share') || lower.includes('공유')) return 'Shares';
  if (lower.includes('save') || lower.includes('저장')) return 'Saves';
  if (lower.includes('retweet') || lower.includes('리트윗')) return 'Retweets';
  if (lower.includes('impression') || lower.includes('노출')) return 'Impressions';
  if (lower.includes('reach') || lower.includes('도달')) return 'Reach';
  if (lower.includes('play') || lower.includes('재생')) return 'Plays';
  if (lower.includes('watch') || lower.includes('시청')) return 'Watch Hours';
  if (lower.includes('member') || lower.includes('멤버')) return 'Members';

  return '기타';
}

async function updateMetadata() {
  console.log('\n🚀 메타데이터 업데이트 시작\n');

  // 모든 서비스 조회 (페이지네이션)
  let allServices = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, provider_service_id, description')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('조회 에러:', error.message);
      return;
    }

    if (!data || data.length === 0) break;
    allServices = allServices.concat(data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log('총 서비스 수:', allServices.length);

  let updated = 0;
  let errors = 0;

  for (const service of allServices) {
    const ytData = ytMap[service.provider_service_id];

    // YTResellers 데이터에서 정보 추출
    const originalName = ytData?.name || service.description || '';
    const originalCategory = ytData?.category || '';
    const originalType = ytData?.type || 'Default';

    // 메타데이터 생성
    const metadata = {
      input_type: INPUT_TYPE_MAP[originalType] || 'link',
      platform: detectPlatform(originalName, originalCategory),
      service_type: detectServiceType(originalName),
      original_category: originalCategory || null,
      original_description: originalName.substring(0, 300)
    };

    // 업데이트
    const { error: updateError } = await supabase
      .from('services')
      .update({ description: JSON.stringify(metadata) })
      .eq('id', service.id);

    if (updateError) {
      errors++;
      if (errors < 5) console.error('업데이트 에러:', service.id, updateError.message);
    } else {
      updated++;
    }

    if (updated % 500 === 0 && updated > 0) {
      console.log(`진행: ${updated}/${allServices.length}`);
    }
  }

  console.log('\n=== 완료 ===');
  console.log('업데이트:', updated);
  console.log('에러:', errors);

  // 검증
  console.log('\n=== 검증 ===');
  const { data: sample } = await supabase
    .from('services')
    .select('name, description')
    .limit(5);

  sample?.forEach(s => {
    console.log('Name:', s.name);
    try {
      const meta = JSON.parse(s.description);
      console.log('Platform:', meta.platform, '| Type:', meta.service_type);
      console.log('Category:', meta.original_category?.substring(0, 50));
    } catch {
      console.log('(파싱 실패)');
    }
    console.log('---');
  });

  // 플랫폼별 통계
  console.log('\n=== 플랫폼별 서비스 수 ===');
  const { data: allSvc } = await supabase.from('services').select('description').range(0, 2999);

  const platformCount = {};
  allSvc?.forEach(s => {
    try {
      const meta = JSON.parse(s.description);
      platformCount[meta.platform] = (platformCount[meta.platform] || 0) + 1;
    } catch {}
  });

  Object.entries(platformCount).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    console.log(`  ${k}: ${v}`);
  });
}

updateMetadata().catch(console.error);
