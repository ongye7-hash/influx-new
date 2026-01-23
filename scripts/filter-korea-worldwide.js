/**
 * 한국/전세계 서비스만 필터링
 * 다른 국가 특정 서비스는 모두 제외
 */
const fs = require('fs');
const path = require('path');

// 최신 API 데이터 로드
const services = JSON.parse(fs.readFileSync(path.join(__dirname, 'ytresellers_full.json'), 'utf8'));
console.log('📦 API 전체 서비스:', services.length);

// 포함할 키워드 (한국/전세계)
const INCLUDE_KEYWORDS = [
  '한국', 'korea', 'korean', '🇰🇷',
  '전세계', 'worldwide', 'global', '글로벌'
];

// 제외할 키워드 (모든 다른 국가)
const EXCLUDE_KEYWORDS = [
  // 아시아
  'vietnam', 'viet nam', '베트남', '🇻🇳',
  'thailand', 'thai', '태국', '🇹🇭',
  'india', 'indian', '인도', '🇮🇳',
  'indonesia', 'indonesian', '인도네시아', '🇮🇩',
  'pakistan', 'pakistani', '파키스탄', '🇵🇰',
  'bangladesh', '방글라데시', '🇧🇩',
  'philippines', 'philippine', 'filipino', '필리핀', '🇵🇭',
  'malaysia', 'malaysian', '말레이시아', '🇲🇾',
  'singapore', '싱가포르', '🇸🇬',
  'japan', 'japanese', '일본', '🇯🇵',
  'china', 'chinese', '중국', '🇨🇳',
  'taiwan', '대만', '🇹🇼',
  'hong kong', '홍콩', '🇭🇰',

  // 중동
  'arab', 'arabic', '아랍',
  'saudi', '사우디', '🇸🇦',
  'uae', 'emirates', '🇦🇪',
  'iran', 'iranian', '이란', '🇮🇷',
  'iraq', 'iraqi', '이라크', '🇮🇶',
  'turkey', 'turkish', '터키', '🇹🇷',
  'israel', '이스라엘', '🇮🇱',

  // 유럽
  'russia', 'russian', '러시아', '🇷🇺',
  'germany', 'german', '독일', '🇩🇪',
  'france', 'french', '프랑스', '🇫🇷',
  'spain', 'spanish', '스페인', '🇪🇸',
  'italy', 'italian', '이탈리아', '🇮🇹',
  'uk', 'british', 'england', '영국', '🇬🇧',
  'netherlands', 'dutch', '네덜란드', '🇳🇱',
  'poland', 'polish', '폴란드', '🇵🇱',
  'portugal', 'portuguese', '포르투갈', '🇵🇹',
  'greece', 'greek', '그리스', '🇬🇷',
  'ukraine', 'ukrainian', '우크라이나', '🇺🇦',

  // 아메리카
  'usa', 'united states', 'american', 'us ', '미국', '🇺🇸',
  'canada', 'canadian', '캐나다', '🇨🇦',
  'mexico', 'mexican', '멕시코', '🇲🇽',
  'brazil', 'brazilian', '브라질', '🇧🇷',
  'argentina', '아르헨티나', '🇦🇷',
  'colombia', '콜롬비아', '🇨🇴',
  'chile', '칠레', '🇨🇱',
  'peru', '페루', '🇵🇪',
  'venezuela', '베네수엘라', '🇻🇪',
  'latin', 'latino', 'latina', '라틴',

  // 아프리카
  'nigeria', 'nigerian', '나이지리아', '🇳🇬',
  'egypt', 'egyptian', '이집트', '🇪🇬',
  'south africa', '남아프리카', '🇿🇦',
  'africa', 'african', '아프리카',
  'kenya', '케냐', '🇰🇪',
  'morocco', '모로코', '🇲🇦',
  'ghana', '가나', '🇬🇭',

  // 오세아니아
  'australia', 'australian', '호주', '🇦🇺',
  'new zealand', '뉴질랜드', '🇳🇿',

  // 지역 그룹
  'europe', 'european', '유럽',
  'asia', 'asian', '아시아',
  'middle east', '중동',
  'southeast asia', '동남아'
];

function shouldInclude(service) {
  const text = (service.name + ' ' + service.category).toLowerCase();

  // 1. 제외 키워드 체크 (우선)
  for (const keyword of EXCLUDE_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      return false;
    }
  }

  // 2. 포함 키워드 체크
  for (const keyword of INCLUDE_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      return true;
    }
  }

  // 3. 국가 미지정 = 전세계로 간주하여 포함
  return true;
}

// 필터링 실행
const filtered = services.filter(shouldInclude);

console.log('\n=== 필터링 결과 ===');
console.log('포함:', filtered.length);
console.log('제외:', services.length - filtered.length);

// 국가 분포 확인
const countryCheck = { '한국': 0, '전세계': 0, '미지정': 0 };
filtered.forEach(s => {
  const text = (s.name + ' ' + s.category).toLowerCase();
  if (text.includes('korea') || text.includes('한국') || text.includes('🇰🇷')) {
    countryCheck['한국']++;
  } else if (text.includes('worldwide') || text.includes('global') || text.includes('전세계')) {
    countryCheck['전세계']++;
  } else {
    countryCheck['미지정']++;
  }
});

console.log('\n=== 국가 분포 ===');
Object.entries(countryCheck).forEach(([k, v]) => {
  console.log(`  ${k}: ${v}개`);
});

// 플랫폼별 분포
const platforms = {};
filtered.forEach(s => {
  const text = (s.name + ' ' + s.category).toLowerCase();
  let platform = '기타';
  if (text.includes('youtube')) platform = 'YouTube';
  else if (text.includes('instagram')) platform = 'Instagram';
  else if (text.includes('tiktok')) platform = 'TikTok';
  else if (text.includes('twitter') || text.includes('x /') || text.includes('x-')) platform = 'Twitter/X';
  else if (text.includes('facebook')) platform = 'Facebook';
  else if (text.includes('telegram')) platform = 'Telegram';
  else if (text.includes('twitch')) platform = 'Twitch';
  else if (text.includes('discord')) platform = 'Discord';
  else if (text.includes('spotify')) platform = 'Spotify';

  platforms[platform] = (platforms[platform] || 0) + 1;
});

console.log('\n=== 플랫폼별 분포 ===');
Object.entries(platforms).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
  console.log(`  ${k}: ${v}개`);
});

// 저장
const outputPath = path.join(__dirname, 'filtered_services_korea_only.json');
fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2));
console.log('\n✅ 저장됨:', outputPath);

// 샘플 출력
console.log('\n=== 한국 서비스 샘플 ===');
filtered.filter(s => {
  const text = (s.name + ' ' + s.category).toLowerCase();
  return text.includes('korea') || text.includes('한국');
}).slice(0, 5).forEach(s => {
  console.log(`  [${s.service}] ${s.name.substring(0, 60)}...`);
});
