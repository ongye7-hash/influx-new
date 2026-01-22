// 번역 테스트 스크립트
function translateToKorean(englishDesc) {
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

  // 기타 번역 (긴 표현부터 정렬)
  const otherTerms = {
    'south korea': '한국',
    'no refill': '보충없음',
    'cancel enable': '취소가능',
    'browse features': '탐색',
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
  };

  // 숫자 단위 변환 (5K → 5천, 50K → 5만, 10M → 1000만)
  desc = desc.replace(/(\d+)K/gi, (match, num) => {
    const n = parseInt(num);
    if (n >= 10) return `${n / 10}만`;  // 10K = 1만, 50K = 5만
    return `${n}천`;  // 5K = 5천
  });
  desc = desc.replace(/(\d+)M/gi, (match, num) => {
    const n = parseInt(num);
    return `${n * 100}만`;  // 1M = 100만, 10M = 1000만
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

// 테스트
const tests = [
  'YouTube Comment Reply Likes [ Video / Shorts / LiveStream ] [ Max 5K ] | 100% Real Accounts | Drop 0% | 30 Days ♻️ | Instant Start | Day 5K 🚀',
  'YouTube Views [ Max 10M ] | Source: Suggested / YouTube Search / Browse Features | 10-30 Seconds Retention | Drop 0% | 30 Days ♻️ | Instant Start | Day 150K 🚀',
  'Instagram Followers [ Korean ] [ Max 100K ] | Real Accounts | No Drop | Lifetime ♻️ | Instant Start',
  'TikTok Views [ Max Unlimited ] | Cancel Enable | No Refill ⚠️ | Instant Start | Day 10M 🚀',
  'X / Twitter Followers [ Korean ] [ Max 50K ] | Real Accounts | Low Drop | 30 Days ♻️ | Instant Start | Day 200 / 400'
];

console.log('=== 번역 테스트 ===\n');
for (const test of tests) {
  console.log('원문:', test);
  console.log('번역:', translateToKorean(test));
  console.log('---');
}
