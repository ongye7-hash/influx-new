/**
 * 서비스명을 YTResellers 원본 기반 한글 번역으로 업데이트
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

// YTResellers 데이터 로드
const ytServices = JSON.parse(fs.readFileSync(path.join(__dirname, 'ytresellers_full.json'), 'utf8'));
const ytMap = {};
ytServices.forEach(s => {
  ytMap[String(s.service)] = s;
});

// ============================================
// 번역 패턴
// ============================================
const TRANSLATIONS = {
  // 플랫폼
  'youtube': '유튜브', 'instagram': '인스타그램', 'tiktok': '틱톡',
  'facebook': '페이스북', 'twitter': '트위터', 'telegram': '텔레그램',
  'twitch': '트위치', 'discord': '디스코드', 'spotify': '스포티파이',
  'linkedin': '링크드인', 'pinterest': '핀터레스트', 'threads': '쓰레드',
  'soundcloud': '사운드클라우드', 'snapchat': '스냅챗', 'bluesky': '블루스카이',

  // 서비스 타입
  'video views': '영상 조회수', 'shorts views': '쇼츠 조회수',
  'reels views': '릴스 조회수', 'story views': '스토리 조회수',
  'live stream viewers': '라이브 시청자', 'live viewers': '라이브 시청자',
  'views': '조회수', 'followers': '팔로워', 'subscribers': '구독자',
  'likes': '좋아요', 'comments': '댓글', 'custom comments': '커스텀 댓글',
  'shares': '공유', 'saves': '저장', 'retweets': '리트윗',
  'impressions': '노출수', 'reach': '도달', 'plays': '재생수',
  'watch time': '시청시간', 'watch hours': '시청시간',
  'members': '멤버', 'group members': '그룹 멤버', 'channel members': '채널 멤버',
  'reactions': '반응', 'votes': '투표', 'mentions': '멘션',
  'profile visits': '프로필 방문', 'engagement': '참여',

  // 품질/특성
  'real & active': '실제 활성', 'real and active': '실제 활성',
  'real active': '실제 활성', 'high quality': '고품질', 'hq': '고품질',
  'premium': '프리미엄', 'real': '실제', 'active': '활성',
  'real accounts': '실제 계정', 'active accounts': '활성 계정',
  'old accounts': '오래된 계정', 'with posts': '게시물 포함',
  'accounts': '계정', 'organic': '오가닉', 'natural': '자연',

  // 국가
  'south korea': '한국', 'korea': '한국', 'worldwide': '전세계',
  'global': '글로벌', 'country targeted': '국가 타겟팅',

  // 속성
  'instant start': '즉시시작', 'instant': '즉시', 'fast': '빠름',
  'slow': '느림', 'super speed': '초고속', 'speed': '속도',
  'non drop': '드롭없음', 'no drop': '드롭없음', 'low drop': '낮은드롭',
  'drop': '드롭', 'stable': '안정', 'guaranteed': '보장',
  'lifetime': '평생', 'refill': '리필', 'no refill': '리필없음',
  'cancel enable': '취소가능', 'cancel': '취소',

  // 기타
  'max': '최대', 'min': '최소', 'day': '일', 'days': '일',
  'hour': '시간', 'hours': '시간', 'per day': '/일',
  'video': '영상', 'shorts': '쇼츠', 'post': '게시물', 'story': '스토리',
  'profile': '프로필', 'page': '페이지', 'photo': '사진',
  'cheap': '저렴', 'cheapest': '최저가', 'best price': '특가',
  'update working': '', 'working': '', 'new': '신규',
  // 추가 번역
  'live stream': '라이브', 'unlimited': '무제한',
  'minutes': '분', 'minute': '분', 'concurrent': '동시접속',
  'no refill': '리필없음', 'with posts': '게시물포함',
  'old accounts with posts': '오래된계정+게시물',
};

// 특수 패턴 (정규식)
const SPECIAL_PATTERNS = [
  // 날짜 제거
  { pattern: /\s*\[\s*\d{2}\.\d{2}\.\d{4}\s*\]/g, replacement: '' },
  { pattern: /\s*\(\s*\d{2}\.\d{2}\.\d{4}\s*\)/g, replacement: '' },
  // 이모지 국기 변환
  { pattern: /🇰🇷/g, replacement: '[한국]' },
  { pattern: /🇺🇸/g, replacement: '[미국]' },
  { pattern: /🇯🇵/g, replacement: '[일본]' },
  { pattern: /🇨🇳/g, replacement: '[중국]' },
  { pattern: /🇮🇳/g, replacement: '[인도]' },
  { pattern: /🇧🇷/g, replacement: '[브라질]' },
  { pattern: /🇷🇺/g, replacement: '[러시아]' },
  { pattern: /🇬🇧/g, replacement: '[영국]' },
  // NEW 표시
  { pattern: /ᴺᴱᵂ/g, replacement: '[NEW]' },
  // HTML 엔티티
  { pattern: /&amp;/g, replacement: '&' },
  // 중복 공백/구분자 정리
  { pattern: /\s+/g, replacement: ' ' },
  { pattern: /\s*\|\s*/g, replacement: ' | ' },
];

function translateName(originalName) {
  if (!originalName) return '서비스';

  let translated = originalName;

  // 1. 특수 패턴 처리
  for (const { pattern, replacement } of SPECIAL_PATTERNS) {
    translated = translated.replace(pattern, replacement);
  }

  // 2. 번역 (긴 패턴 먼저)
  const sortedTranslations = Object.entries(TRANSLATIONS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [en, kr] of sortedTranslations) {
    const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    translated = translated.replace(regex, kr);
  }

  // 3. 정리
  translated = translated.replace(/\s+/g, ' ').trim();
  translated = translated.replace(/\|\s*\|/g, '|');
  translated = translated.replace(/^\s*\|\s*/, '');
  translated = translated.replace(/\s*\|\s*$/, '');

  return translated;
}

async function main() {
  console.log('🔄 서비스명 한글 번역 업데이트 시작\n');

  // 모든 서비스 조회
  let allServices = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('services')
      .select('id, provider_service_id, name')
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

  // 번역 샘플 테스트
  console.log('\n=== 번역 샘플 ===');
  const testIds = ['1843', '7479', '7480', '8133'];
  for (const id of testIds) {
    const ytData = ytMap[id];
    if (ytData) {
      const translated = translateName(ytData.name);
      console.log(`[${id}] 원본: ${ytData.name.substring(0, 60)}...`);
      console.log(`      번역: ${translated.substring(0, 60)}...`);
      console.log('');
    }
  }

  // 업데이트
  console.log('=== 업데이트 중 ===');
  let updated = 0;
  let skipped = 0;

  for (const service of allServices) {
    const ytData = ytMap[service.provider_service_id];

    if (!ytData) {
      skipped++;
      continue;
    }

    // 서비스 번호 + 번역된 이름
    const translatedName = `[${service.provider_service_id}] ${translateName(ytData.name)}`;

    const { error: updateError } = await supabase
      .from('services')
      .update({ name: translatedName })
      .eq('id', service.id);

    if (!updateError) {
      updated++;
    }

    if (updated % 500 === 0 && updated > 0) {
      console.log(`진행: ${updated}/${allServices.length}`);
    }
  }

  console.log('\n=== 완료 ===');
  console.log('업데이트:', updated);
  console.log('스킵:', skipped);

  // 검증
  console.log('\n=== 검증 ===');
  const { data: verifyData } = await supabase
    .from('services')
    .select('provider_service_id, name')
    .in('provider_service_id', ['1843', '7479', '7480']);

  verifyData?.forEach(s => {
    console.log(`[${s.provider_service_id}] ${s.name}`);
  });
}

main().catch(console.error);
