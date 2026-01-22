const fs = require('fs');
const path = require('path');

// Load ytreseller services
const servicesFile = path.join(__dirname, 'ytresellers_services.json');
const services = JSON.parse(fs.readFileSync(servicesFile, 'utf8'));

console.log(`Total services from ytreseller: ${services.length}\n`);

// Keywords for filtering (Korean / Worldwide only)
const INCLUDE_KEYWORDS = [
  '한국', 'korea', 'korean', '전세계', 'worldwide', 'global', '글로벌',
  '🇰🇷', 'kr', 'south korea'
];

// Keywords to exclude (other countries)
const EXCLUDE_KEYWORDS = [
  'nigeria', 'nigerian', 'thailand', 'thai', 'india', 'indian',
  'indonesia', 'indonesian', 'pakistan', 'pakistani', 'bangladesh',
  'vietnam', 'vietnamese', 'philippines', 'philippine', 'filipino',
  'turkey', 'turkish', 'brazil', 'brazilian', 'mexico', 'mexican',
  'arab', 'arabic', 'russia', 'russian', 'china', 'chinese',
  'japan', 'japanese', 'germany', 'german', 'france', 'french',
  'spain', 'spanish', 'italy', 'italian', 'usa', 'american',
  'uk', 'british', 'canada', 'canadian', 'australia', 'australian',
  'egypt', 'egyptian', 'iran', 'iranian', 'iraq', 'iraqi',
  'africa', 'african', 'latin', 'europe', 'european', 'asia', 'asian',
  '나이지리아', '태국', '인도', '인도네시아', '파키스탄', '방글라데시',
  '베트남', '필리핀', '터키', '브라질', '멕시코', '아랍', '러시아',
  '중국', '일본', '독일', '프랑스', '스페인', '이탈리아', '미국',
  '영국', '캐나다', '호주', '이집트', '이란', '이라크', '아프리카',
  '🇳🇬', '🇹🇭', '🇮🇳', '🇮🇩', '🇵🇰', '🇧🇩', '🇻🇳', '🇵🇭', '🇹🇷',
  '🇧🇷', '🇲🇽', '🇷🇺', '🇨🇳', '🇯🇵', '🇩🇪', '🇫🇷', '🇪🇸', '🇮🇹',
  '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇪🇬', '🇮🇷', '🇮🇶'
];

// Platform detection patterns (order matters - more specific first)
const PLATFORM_PATTERNS = [
  { platform: 'twitter', patterns: ['twitter', '트위터', 'x / twitter', 'x/twitter', 'x -'] },
  { platform: 'facebook', patterns: ['facebook', '페이스북', 'fb '] },
  { platform: 'instagram', patterns: ['instagram', '인스타', 'ig '] },
  { platform: 'youtube', patterns: ['youtube', '유튜브', 'yt '] },
  { platform: 'tiktok', patterns: ['tiktok', '틱톡'] },
  { platform: 'telegram', patterns: ['telegram', '텔레그램'] },
  { platform: 'twitch', patterns: ['twitch', '트위치'] },
  { platform: 'coinmarketcap', patterns: ['coinmarketcap', 'cmc', '코인마켓캡'] },
  { platform: 'spotify', patterns: ['spotify', '스포티파이'] },
  { platform: 'discord', patterns: ['discord', '디스코드'] },
  { platform: 'linkedin', patterns: ['linkedin', '링크드인'] },
];

// Filter function
function shouldInclude(service) {
  const name = (service.name || '').toLowerCase();
  const category = (service.category || '').toLowerCase();

  // Check if has include keywords
  const hasIncludeKeyword = INCLUDE_KEYWORDS.some(keyword =>
    name.includes(keyword.toLowerCase()) || category.includes(keyword.toLowerCase())
  );

  // Check if has exclude keywords
  const hasExcludeKeyword = EXCLUDE_KEYWORDS.some(keyword =>
    name.includes(keyword.toLowerCase()) || category.includes(keyword.toLowerCase())
  );

  // Include if has include keyword AND doesn't have exclude keyword
  // OR if it's a generic service without country specification
  return hasIncludeKeyword && !hasExcludeKeyword;
}

// Detect platform (check category first, then name)
function detectPlatform(service) {
  const name = (service.name || '').toLowerCase();
  const category = (service.category || '').toLowerCase();

  // Check category first (more reliable)
  for (const { platform, patterns } of PLATFORM_PATTERNS) {
    if (patterns.some(p => category.includes(p))) {
      return platform;
    }
  }

  // Then check name
  for (const { platform, patterns } of PLATFORM_PATTERNS) {
    if (patterns.some(p => name.includes(p))) {
      return platform;
    }
  }

  return 'other';
}

// Filter services
const filteredServices = services.filter(shouldInclude);

// Group by platform
const groupedByPlatform = {};
for (const service of filteredServices) {
  const platform = detectPlatform(service);
  if (!groupedByPlatform[platform]) {
    groupedByPlatform[platform] = [];
  }
  groupedByPlatform[platform].push(service);
}

// Print results
console.log('=== FILTERED SERVICES (Korean / Worldwide) ===\n');
console.log(`Total filtered: ${filteredServices.length} services\n`);

for (const [platform, platformServices] of Object.entries(groupedByPlatform)) {
  console.log(`\n📦 ${platform.toUpperCase()} (${platformServices.length} services)`);
  console.log('─'.repeat(60));

  // Show first 5 services from each platform
  platformServices.slice(0, 5).forEach((s, i) => {
    console.log(`  ${i + 1}. [${s.service}] ${s.name.substring(0, 60)}...`);
    console.log(`     Price: $${s.rate}/1K | Min: ${s.min} | Max: ${s.max}`);
  });

  if (platformServices.length > 5) {
    console.log(`  ... and ${platformServices.length - 5} more services`);
  }
}

// Save filtered services to file
const outputFile = path.join(__dirname, 'filtered_services_korea.json');
fs.writeFileSync(outputFile, JSON.stringify(filteredServices, null, 2));
console.log(`\n\n✅ Saved ${filteredServices.length} services to: ${outputFile}`);

// Also save platform-grouped data
const platformOutput = path.join(__dirname, 'filtered_services_by_platform.json');
fs.writeFileSync(platformOutput, JSON.stringify(groupedByPlatform, null, 2));
console.log(`✅ Saved platform-grouped data to: ${platformOutput}`);

// Create summary
const summary = Object.entries(groupedByPlatform).map(([platform, services]) => ({
  platform,
  count: services.length,
  minPrice: Math.min(...services.map(s => parseFloat(s.rate))),
  maxPrice: Math.max(...services.map(s => parseFloat(s.rate))),
}));

console.log('\n\n=== SUMMARY ===\n');
console.table(summary);
