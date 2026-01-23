// 서비스 메타데이터 업데이트 (이름 기반 분석)
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

// 이름에서 입력 타입 추출
function getInputType(name) {
  const lower = name.toLowerCase();

  // Custom Comments - 댓글 내용 입력 필요
  if ((lower.includes('custom comment') || lower.includes('커스텀 댓글') ||
       lower.includes('random comment') || lower.includes('랜덤 댓글'))) {
    return 'link_comments';
  }

  // Mentions - 사용자명 입력 필요
  if (lower.includes('mention') || lower.includes('멘션')) {
    if (lower.includes('hashtag') || lower.includes('해시태그')) {
      return 'link_usernames_hashtags';
    }
    return 'link_usernames';
  }

  // SEO / Keywords
  if (lower.includes('seo') || lower.includes('search ranking') ||
      lower.includes('검색 순위') || lower.includes('keyword')) {
    return 'link_keywords';
  }

  // Poll - 투표
  if (lower.includes('poll') || lower.includes('투표')) {
    return 'link_answer';
  }

  // Default - 링크만
  return 'link';
}

// 이름에서 플랫폼 추출
function getPlatform(name) {
  const lower = name.toLowerCase();

  if (lower.includes('instagram') || lower.includes('인스타')) return 'Instagram';
  if (lower.includes('youtube') || lower.includes('유튜브')) return 'YouTube';
  if (lower.includes('tiktok') || lower.includes('틱톡')) return 'TikTok';
  if (lower.includes('facebook') || lower.includes('페이스북') || lower.includes('fb')) return 'Facebook';
  if (lower.includes('twitter') || lower.includes('트위터') || lower.includes('x(') || lower.includes('x /')) return 'Twitter/X';
  if (lower.includes('telegram') || lower.includes('텔레그램')) return 'Telegram';
  if (lower.includes('twitch') || lower.includes('트위치')) return 'Twitch';
  if (lower.includes('spotify') || lower.includes('스포티파이')) return 'Spotify';
  if (lower.includes('discord') || lower.includes('디스코드')) return 'Discord';
  if (lower.includes('linkedin') || lower.includes('링크드인')) return 'LinkedIn';
  if (lower.includes('coinmarketcap') || lower.includes('코인마켓캡')) return 'CoinMarketCap';
  if (lower.includes('threads') || lower.includes('쓰레드')) return 'Threads';
  if (lower.includes('soundcloud') || lower.includes('사운드클라우드')) return 'SoundCloud';

  return '기타';
}

// 이름에서 서비스 유형 추출
function getServiceType(name) {
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
  if (lower.includes('reaction') || lower.includes('반응')) return 'Reactions';
  if (lower.includes('vote') || lower.includes('투표')) return 'Votes';

  return '기타';
}

async function updateAllServices() {
  console.log('🚀 서비스 메타데이터 업데이트 시작 (이름 기반)\n');

  // 모든 서비스 조회
  const { data: services, error } = await supabase
    .from('services')
    .select('id, name, description')
    .order('id');

  if (error) {
    console.error('서비스 조회 에러:', error.message);
    return;
  }

  console.log('총 서비스 수:', services.length);

  let updated = 0;
  let skipped = 0;

  for (const service of services) {
    // 모든 서비스 강제 업데이트 (기존 description 보존)

    const inputType = getInputType(service.name);
    const platform = getPlatform(service.name);
    const serviceType = getServiceType(service.name);
    const subcategory = platform + ' ' + serviceType;

    const metadata = JSON.stringify({
      input_type: inputType,
      subcategory: subcategory,
      platform: platform,
      service_type: serviceType,
      original_description: service.description?.substring(0, 200) || null
    });

    const { error: updateError } = await supabase
      .from('services')
      .update({ description: metadata })
      .eq('id', service.id);

    if (updateError) {
      console.error('업데이트 에러:', service.id, updateError.message);
    } else {
      updated++;
    }

    if ((updated + skipped) % 100 === 0) {
      console.log(`진행: ${updated + skipped}/${services.length} (업데이트: ${updated}, 스킵: ${skipped})`);
    }
  }

  console.log('\n=== 완료 ===');
  console.log('업데이트됨:', updated);
  console.log('이미 처리됨 (스킵):', skipped);

  // 통계 출력
  console.log('\n=== 입력 타입별 통계 ===');
  const { data: allServices } = await supabase.from('services').select('description');

  const inputStats = {};
  const platformStats = {};
  const serviceStats = {};

  allServices?.forEach(s => {
    try {
      const meta = JSON.parse(s.description);
      inputStats[meta.input_type] = (inputStats[meta.input_type] || 0) + 1;
      platformStats[meta.platform] = (platformStats[meta.platform] || 0) + 1;
      serviceStats[meta.service_type] = (serviceStats[meta.service_type] || 0) + 1;
    } catch (e) {}
  });

  console.log('\n입력 타입:');
  Object.entries(inputStats).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    console.log(`  ${k}: ${v}개`);
  });

  console.log('\n플랫폼:');
  Object.entries(platformStats).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    console.log(`  ${k}: ${v}개`);
  });

  console.log('\n서비스 유형:');
  Object.entries(serviceStats).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    console.log(`  ${k}: ${v}개`);
  });
}

updateAllServices().catch(console.error);
