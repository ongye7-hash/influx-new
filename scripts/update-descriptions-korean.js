// ============================================
// 기존 서비스 description을 한국어로 업데이트
// ============================================

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

// 영어 → 한국어 번역 함수
function translateToKorean(englishDesc) {
  if (!englishDesc) return '';
  let desc = englishDesc;

  const serviceTypes = {
    'views': '조회수',
    'view': '조회수',
    'followers': '팔로워',
    'follower': '팔로워',
    'likes': '좋아요',
    'like': '좋아요',
    'comments': '댓글',
    'comment': '댓글',
    'comment reply likes': '댓글 답글 좋아요',
    'subscribers': '구독자',
    'subscriber': '구독자',
    'members': '멤버',
    'member': '멤버',
    'retweets': '리트윗',
    'retweet': '리트윗',
    'reposts': '리포스트',
    'repost': '리포스트',
    'impressions': '노출수',
    'impression': '노출수',
    'shares': '공유',
    'share': '공유',
    'saves': '저장',
    'save': '저장',
    'watch time': '시청시간',
    'watch hours': '시청시간',
    'live stream': '라이브',
    'livestream': '라이브',
    'shorts': '쇼츠',
    'reels': '릴스',
    'story': '스토리',
    'stories': '스토리',
    'post': '게시물',
    'posts': '게시물',
    'video': '영상',
    'videos': '영상',
    'channel': '채널',
    'profile': '프로필',
    'page': '페이지',
    'group': '그룹',
    'votes': '투표',
    'vote': '투표',
    'plays': '재생',
    'play': '재생',
  };

  const platforms = {
    'youtube': '유튜브',
    'instagram': '인스타그램',
    'tiktok': '틱톡',
    'twitter': '트위터',
    'x / twitter': 'X(트위터)',
    'facebook': '페이스북',
    'telegram': '텔레그램',
    'twitch': '트위치',
    'discord': '디스코드',
    'spotify': '스포티파이',
    'coinmarketcap': '코인마켓캡',
    'linkedin': '링크드인',
    'threads': '쓰레드',
  };

  const qualities = {
    'real accounts': '실제 계정',
    'real users': '실제 유저',
    'real': '실제',
    'active accounts': '활성 계정',
    'active users': '활성 유저',
    'active': '활성',
    'high quality': '고품질',
    'hq': '고품질',
    'premium': '프리미엄',
    'organic': '자연 유입',
    'bot': '봇',
    'mixed': '혼합',
    'cheap': '저렴',
    'fast': '빠른',
    'slow': '느린',
    'stable': '안정적',
    'non drop': '드롭없음',
    'no drop': '드롭없음',
    'low drop': '드롭적음',
  };

  const timeTerms = {
    'instant start': '즉시 시작',
    'instant': '즉시',
    'lifetime': '평생',
    'days': '일',
    'day': '일',
    'hours': '시간',
    'hour': '시간',
    'minutes': '분',
    'minute': '분',
    'seconds': '초',
    'second': '초',
  };

  const otherTerms = {
    // 긴 표현 먼저
    'south korea': '한국',
    'no refill': '보충없음',
    'cancel enable': '취소가능',
    'browse features': '탐색',
    'real accounts': '실제 계정',
    'hq accounts': '고품질 계정',
    'lq accounts': '저품질 계정',
    'bot accounts': '봇 계정',
    'mix accounts': '혼합 계정',
    'hidden accounts': '비공개 계정',
    'active accounts': '활성 계정',
    'global accounts': '글로벌 계정',
    'latin accounts': '라틴 계정',
    'accounts with posts': '게시물 있는 계정',
    'accounts': '계정',
    'created by ai': 'AI 생성',
    'auto-generate': '자동 생성',
    'based on': '기반',
    'native ads': '네이티브 광고',
    'adwords': '애드워즈 광고',
    'all link': '모든 링크',
    'hidden data': '비공개 데이터',
    'apps data': '앱 데이터',
    'page or profile': '페이지/프로필',
    'video or reels': '영상/릴스',
    'chat comments': '채팅 댓글',
    'custom comments': '맞춤 댓글',
    'pk battle': 'PK 배틀',
    'live chat': '라이브 채팅',
    // 중간 길이
    'korean': '한국',
    'korea': '한국',
    'worldwide': '전세계',
    'global': '글로벌',
    'unlimited': '무제한',
    'suggested': '추천',
    'retention': '시청유지',
    'source': '유입경로',
    'search': '검색',
    'refill': '보충',
    'cancel': '취소',
    'speed': '속도',
    'drop': '드롭',
    'max': '최대',
    'min': '최소',
    'concurrent': '동시접속',
    'external': '외부',
    'direct': '직접',
    'unknown': '알수없음',
    'unkown': '알수없음',
    'custom': '맞춤',
    'reply': '답글',
    'content': '콘텐츠',
    'overflow': '추가제공',
    'random': '랜덤',
    'female': '여성',
    'male': '남성',
    'latin': '라틴',
    'points': '포인트',
    'battle': '배틀',
    'hidden': '비공개',
    'auto': '자동',
    'start': '시작',
    'with': '',
    'or': '/',
  };

  // 숫자 단위 변환
  desc = desc.replace(/(\d+)K/gi, (match, num) => {
    const n = parseInt(num);
    if (n >= 10) return `${n / 10}만`;
    return `${n}천`;
  });
  desc = desc.replace(/(\d+)M/gi, (match, num) => {
    const n = parseInt(num);
    return `${n * 100}만`;
  });

  // 플랫폼 번역
  for (const [eng, kor] of Object.entries(platforms)) {
    const regex = new RegExp(eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    desc = desc.replace(regex, kor);
  }

  // 서비스 유형 번역 (긴 것부터)
  const sortedServiceTypes = Object.entries(serviceTypes).sort((a, b) => b[0].length - a[0].length);
  for (const [eng, kor] of sortedServiceTypes) {
    const regex = new RegExp(`\\b${eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    desc = desc.replace(regex, kor);
  }

  // 품질 번역 (긴 것부터)
  const sortedQualities = Object.entries(qualities).sort((a, b) => b[0].length - a[0].length);
  for (const [eng, kor] of sortedQualities) {
    const regex = new RegExp(eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    desc = desc.replace(regex, kor);
  }

  // 시간 번역 (긴 것부터)
  const sortedTimeTerms = Object.entries(timeTerms).sort((a, b) => b[0].length - a[0].length);
  for (const [eng, kor] of sortedTimeTerms) {
    const regex = new RegExp(eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    desc = desc.replace(regex, kor);
  }

  // 기타 번역 (긴 것부터)
  const sortedOtherTerms = Object.entries(otherTerms).sort((a, b) => b[0].length - a[0].length);
  for (const [eng, kor] of sortedOtherTerms) {
    const regex = new RegExp(eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    desc = desc.replace(regex, kor);
  }

  // 정리
  desc = desc.replace(/100%\s*/g, '100% ');
  desc = desc.replace(/\s+/g, ' ').trim();
  desc = desc.replace(/\[\s+/g, '[');
  desc = desc.replace(/\s+\]/g, ']');
  desc = desc.replace(/\s*\|\s*/g, ' | ');

  return desc;
}

async function main() {
  console.log('=== 기존 서비스 description 한국어 업데이트 ===\n');

  // 모든 서비스 조회
  const { data: services, error } = await supabase
    .from('services')
    .select('id, name, description, provider_service_id')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('서비스 조회 실패:', error.message);
    return;
  }

  console.log(`총 ${services.length}개 서비스 발견\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const service of services) {
    const originalDesc = service.description || '';

    // 이미 한국어인지 체크 (한글 포함 여부)
    const hasKorean = /[가-힣]/.test(originalDesc);
    const hasEnglish = /[a-zA-Z]{3,}/.test(originalDesc);

    // 영어가 포함되어 있으면 번역
    if (hasEnglish) {
      const translatedDesc = translateToKorean(originalDesc);

      // 변경이 있는 경우만 업데이트
      if (translatedDesc !== originalDesc) {
        const { error: updateError } = await supabase
          .from('services')
          .update({ description: translatedDesc })
          .eq('id', service.id);

        if (updateError) {
          console.error(`[${service.provider_service_id}] 업데이트 실패:`, updateError.message);
        } else {
          console.log(`[${service.provider_service_id}] ${service.name}`);
          console.log(`  원문: ${originalDesc.substring(0, 80)}...`);
          console.log(`  번역: ${translatedDesc.substring(0, 80)}...`);
          console.log('');
          updatedCount++;
        }
      } else {
        skippedCount++;
      }
    } else {
      skippedCount++;
    }
  }

  console.log('\n=== 완료 ===');
  console.log(`업데이트: ${updatedCount}개`);
  console.log(`스킵: ${skippedCount}개`);
}

main().catch(console.error);
