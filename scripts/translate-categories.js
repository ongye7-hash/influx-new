/**
 * 카테고리 한국어 번역 스크립트
 * 패턴 기반으로 영어 카테고리를 한국어로 번역
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

// ============================================
// 번역 패턴 정의
// ============================================

// 플랫폼 번역
const PLATFORM_TRANSLATIONS = {
  'youtube': '유튜브',
  'instagram': '인스타그램',
  'tiktok': '틱톡',
  'facebook': '페이스북',
  'twitter': '트위터',
  'telegram': '텔레그램',
  'twitch': '트위치',
  'discord': '디스코드',
  'spotify': '스포티파이',
  'linkedin': '링크드인',
  'pinterest': '핀터레스트',
  'soundcloud': '사운드클라우드',
  'threads': '쓰레드',
  'snapchat': '스냅챗',
  'whatsapp': '왓츠앱',
  'reddit': '레딧',
  'clubhouse': '클럽하우스',
  'vk': 'VK',
  'weibo': '웨이보',
  'bluesky': '블루스카이',
};

// 서비스 타입 번역
const SERVICE_TYPE_TRANSLATIONS = {
  'views': '조회수',
  'video views': '영상 조회수',
  'shorts views': '쇼츠 조회수',
  'reels views': '릴스 조회수',
  'story views': '스토리 조회수',
  'live stream viewers': '라이브 시청자',
  'live viewers': '라이브 시청자',
  'followers': '팔로워',
  'subscribers': '구독자',
  'likes': '좋아요',
  'comments': '댓글',
  'custom comments': '커스텀 댓글',
  'random comments': '랜덤 댓글',
  'shares': '공유',
  'saves': '저장',
  'retweets': '리트윗',
  'reposts': '리포스트',
  'impressions': '노출수',
  'reach': '도달',
  'plays': '재생수',
  'watch time': '시청 시간',
  'watch hours': '시청 시간',
  'members': '멤버',
  'group members': '그룹 멤버',
  'channel members': '채널 멤버',
  'reactions': '반응',
  'votes': '투표',
  'poll votes': '투표',
  'mentions': '멘션',
  'post reach': '게시물 도달',
  'post impressions': '게시물 노출',
  'profile visits': '프로필 방문',
  'engagement': '참여',
  'seo views': 'SEO 조회수',
  'search views': '검색 조회수',
  'ctr views': 'CTR 조회수',
  'monetizable views': '수익화 조회수',
  'page likes': '페이지 좋아요',
  'page followers': '페이지 팔로워',
  'photo likes': '사진 좋아요',
  'post likes': '게시물 좋아요',
  'video likes': '영상 좋아요',
  'reel likes': '릴스 좋아요',
  'igtv views': 'IGTV 조회수',
  'clip views': '클립 조회수',
};

// 품질/특성 번역
const QUALITY_TRANSLATIONS = {
  'high quality': '고품질',
  'hq': '고품질',
  'premium': '프리미엄',
  'real': '실제',
  'real users': '실제 사용자',
  'real accounts': '실제 계정',
  'active': '활성',
  'active users': '활성 사용자',
  'active accounts': '활성 계정',
  'old accounts': '오래된 계정',
  'old accounts with posts': '게시물 있는 오래된 계정',
  'accounts': '계정',
  'account': '계정',
  'organic': '오가닉',
  'natural': '자연',
  'natural increase': '자연 증가',
  'bot': '봇',
  'cheap': '저렴',
  'cheapest': '최저가',
  'best price': '특가',
  'best prices': '특가',
  'non drop': '드롭 없음',
  'no drop': '드롭 없음',
  'drop 0%': '드롭 0%',
  'instant': '즉시',
  'instant start': '즉시 시작',
  'fast': '빠름',
  'slow': '느림',
  'super speed': '초고속',
  'super': '슈퍼',
  'stable': '안정',
  'story': '스토리',
  'stories': '스토리',
  'story likes': '스토리 좋아요',
  'story vote': '스토리 투표',
  'profile': '프로필',
  'post': '게시물',
  'posts': '게시물',
  'with posts': '게시물 포함',
  'interactions': '상호작용',
  'interaction': '상호작용',
  'flag off': '플래그 OFF',
  'flag review': '플래그 검토',
  'no guarantee': '보장 없음',
  'no refund': '환불 불가',
  'guarantee': '보장',
  'guaranteed': '보장',
  'old': '오래된',
  'update special': '업데이트 스페셜',
  'special': '스페셜',
  'speed': '속도',
  'stable': '안정적',
  'guaranteed': '보장',
  'lifetime guarantee': '평생 보장',
  'lifetime refill': '평생 리필',
  'refill': '리필',
  '30 days refill': '30일 리필',
  '60 days refill': '60일 리필',
  '90 days refill': '90일 리필',
  '365 days refill': '365일 리필',
  'no refill': '리필 없음',
  'auto refill': '자동 리필',
  'country targeted': '국가 타겟팅',
  'worldwide': '전세계',
  'global': '글로벌',
  'targeted': '타겟팅',
  'niche targeted': '니치 타겟팅',
  'female': '여성',
  'male': '남성',
  'mixed': '혼합',
  'usa': '미국',
  'korea': '한국',
  'south korea': '한국',
  'update working': '업데이트 작동중',
  'working': '작동중',
  'verified': '인증됨',
  'new': '신규',
  'task method': '과제 방식',
  'adwords': '애드워즈',
  'native ads': '네이티브 광고',
  'native adwords': '네이티브 애드워즈',
  'social': '소셜',
  'max': '최대',
  'min': '최소',
  'day': '일',
  'hour': '시간',
  'per day': '/일',
  'per hour': '/시간',
  'rav': 'RAV',
  'rav-gs': 'RAV-GS',
  'suggested': '추천',
  'suggestion': '추천',
  'explore': '탐색',
  'explore page': '탐색 페이지',
  'for you': 'For You',
  'fyp': 'FYP',
  'hashtag': '해시태그',
  'location': '위치',
  'services': '서비스',
  'package': '패키지',
  'bundle': '번들',
  'promotion': '프로모션',
  's1': 'S1',
  's2': 'S2',
  's3': 'S3',
  's4': 'S4',
  's5': 'S5',
};

// 특수 패턴 (정규식)
const SPECIAL_PATTERNS = [
  // 날짜 패턴 제거 [ xx.xx.xxxx ]
  { pattern: /\s*\[\s*\d{2}\.\d{2}\.\d{4}\s*\]/g, replacement: '' },
  // 날짜 패턴 제거 ( xx.xx.xxxx )
  { pattern: /\s*\(\s*\d{2}\.\d{2}\.\d{4}\s*\)/g, replacement: '' },
  // Provider → 제거
  { pattern: /Provider\s*→\s*/gi, replacement: '' },
  // 이모지 국기 처리
  { pattern: /🇰🇷/g, replacement: '[한국]' },
  { pattern: /🇺🇸/g, replacement: '[미국]' },
  { pattern: /🇬🇧/g, replacement: '[영국]' },
  { pattern: /🇯🇵/g, replacement: '[일본]' },
  { pattern: /🇨🇳/g, replacement: '[중국]' },
  { pattern: /🇮🇳/g, replacement: '[인도]' },
  { pattern: /🇧🇷/g, replacement: '[브라질]' },
  { pattern: /🇷🇺/g, replacement: '[러시아]' },
  // NEW 표시 변환
  { pattern: /ᴺᴱᵂ/g, replacement: '[NEW]' },
  // 구분자 정리
  { pattern: /\s*\|\s*/g, replacement: ' | ' },
  { pattern: /\s*-\s*/g, replacement: ' - ' },
  // 중복 공백 제거
  { pattern: /\s+/g, replacement: ' ' },
];

// ============================================
// 번역 함수
// ============================================
function translateCategory(category) {
  if (!category) return '기타';

  let translated = category;

  // 1. 특수 패턴 처리 (날짜 제거 등)
  for (const { pattern, replacement } of SPECIAL_PATTERNS) {
    translated = translated.replace(pattern, replacement);
  }

  // 2. 플랫폼 번역 (대소문자 무시)
  for (const [en, kr] of Object.entries(PLATFORM_TRANSLATIONS)) {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translated = translated.replace(regex, kr);
  }

  // 3. 서비스 타입 번역 (긴 것 먼저)
  const sortedServiceTypes = Object.entries(SERVICE_TYPE_TRANSLATIONS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [en, kr] of sortedServiceTypes) {
    const regex = new RegExp(`\\b${en.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    translated = translated.replace(regex, kr);
  }

  // 4. 품질/특성 번역 (긴 것 먼저)
  const sortedQuality = Object.entries(QUALITY_TRANSLATIONS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [en, kr] of sortedQuality) {
    const regex = new RegExp(`\\b${en.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    translated = translated.replace(regex, kr);
  }

  // 5. 정리
  translated = translated.replace(/\s+/g, ' ').trim();
  translated = translated.replace(/\s*\[\s*\]/g, ''); // 빈 브라켓 제거
  translated = translated.replace(/\|\s*$/g, '').trim(); // 끝의 | 제거

  return translated || '기타';
}

// ============================================
// 메인 실행
// ============================================
async function main() {
  console.log('🌐 카테고리 한국어 번역 시작\n');

  // 모든 서비스 조회
  let allServices = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('services')
      .select('id, description')
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

  // 번역 테스트 (샘플)
  console.log('\n=== 번역 샘플 ===');
  const sampleCategories = [
    'YouTube - Video/Shorts Views | RAV | Country Targeted',
    'YouTube - Subscribers | Non Drop ᴺᴱᵂ',
    '🇰🇷 YouTube - SEO Views | Korea | S2',
    'Instagram - Followers | Real | Lifetime Refill',
    'TikTok - Likes | High Quality | Instant Start',
    'Facebook - Live Stream Viewers | Natural Increase',
    'Telegram - Channel Members | No Drop | Fast'
  ];

  sampleCategories.forEach(cat => {
    console.log(`  원본: ${cat}`);
    console.log(`  번역: ${translateCategory(cat)}`);
    console.log('');
  });

  // 모든 서비스 업데이트
  console.log('=== 번역 적용 중 ===');
  let updated = 0;
  let errors = 0;

  for (const service of allServices) {
    try {
      const meta = JSON.parse(service.description);
      const originalCategory = meta.original_category || '';
      const categoryKr = translateCategory(originalCategory);

      // category_kr 필드 추가
      meta.category_kr = categoryKr;

      const { error: updateError } = await supabase
        .from('services')
        .update({ description: JSON.stringify(meta) })
        .eq('id', service.id);

      if (updateError) {
        errors++;
      } else {
        updated++;
      }
    } catch (e) {
      errors++;
    }

    if (updated % 500 === 0 && updated > 0) {
      console.log(`진행: ${updated}/${allServices.length}`);
    }
  }

  console.log('\n=== 완료 ===');
  console.log('업데이트:', updated);
  console.log('에러:', errors);

  // 검증
  console.log('\n=== 검증 (유튜브 카테고리) ===');
  const { data: sample } = await supabase
    .from('services')
    .select('description')
    .limit(10);

  const ytCategories = new Set();
  sample?.forEach(s => {
    try {
      const meta = JSON.parse(s.description);
      if (meta.platform === 'YouTube' && meta.category_kr) {
        ytCategories.add(meta.category_kr);
      }
    } catch {}
  });

  // 전체 유튜브 카테고리 확인
  let allYtServices = [];
  page = 0;
  while (true) {
    const { data } = await supabase
      .from('services')
      .select('description')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (!data || data.length === 0) break;
    allYtServices = allYtServices.concat(data);
    if (data.length < pageSize) break;
    page++;
  }

  const ytCatCount = {};
  allYtServices.forEach(s => {
    try {
      const meta = JSON.parse(s.description);
      if (meta.platform === 'YouTube' && meta.category_kr) {
        ytCatCount[meta.category_kr] = (ytCatCount[meta.category_kr] || 0) + 1;
      }
    } catch {}
  });

  console.log('\n유튜브 한국어 카테고리 (상위 15개):');
  Object.entries(ytCatCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([cat, count]) => {
      console.log(`  [${count}개] ${cat}`);
    });
}

main().catch(console.error);
