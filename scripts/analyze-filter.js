const fs = require('fs');
const expanded = JSON.parse(fs.readFileSync('filtered_services_expanded.json', 'utf8'));
const full = JSON.parse(fs.readFileSync('ytresellers_full.json', 'utf8'));

// expanded에 있는 서비스 ID들
const expandedIds = new Set(expanded.map(s => String(s.service)));

// full에만 있고 expanded에 없는 것들
const notIncluded = full.filter(s => !expandedIds.has(String(s.service)));

console.log('=== 필터링 분석 ===');
console.log('API 전체:', full.length);
console.log('DB 저장됨:', expanded.length);
console.log('제외됨:', notIncluded.length);

// 제외된 서비스의 국가/지역 패턴
console.log('\n=== 제외된 서비스 국가 분포 (상위 10개) ===');
const excludedCountries = {};
notIncluded.forEach(s => {
  const text = (s.name + ' ' + s.category).toLowerCase();
  const countryPatterns = [
    ['nigeria', '나이지리아'], ['thailand', '태국'], ['india', '인도'],
    ['indonesia', '인도네시아'], ['pakistan', '파키스탄'], ['brazil', '브라질'],
    ['turkey', '터키'], ['arab', '아랍'], ['russia', '러시아'],
    ['china', '중국'], ['japan', '일본'], ['germany', '독일'],
    ['france', '프랑스'], ['spain', '스페인'], ['usa', '미국'], ['uk', '영국']
  ];

  for (const [en, kr] of countryPatterns) {
    if (text.includes(en)) {
      excludedCountries[kr] = (excludedCountries[kr] || 0) + 1;
      return;
    }
  }
  excludedCountries['기타/미분류'] = (excludedCountries['기타/미분류'] || 0) + 1;
});

Object.entries(excludedCountries).sort((a,b) => b[1] - a[1]).slice(0, 10).forEach(([k,v]) => {
  console.log(`  ${k}: ${v}개`);
});

// DB에 저장된 서비스 중 베트남 서비스
console.log('\n=== DB 저장된 베트남 서비스 샘플 ===');
const vietnamInDB = expanded.filter(s => {
  const text = (s.name + ' ' + s.category).toLowerCase();
  return text.includes('vietnam') || text.includes('viet nam') || text.includes('🇻🇳');
});
console.log('베트남 서비스 수:', vietnamInDB.length);
vietnamInDB.slice(0, 3).forEach(s => {
  console.log(`  [${s.service}] ${s.name.substring(0, 60)}...`);
});
