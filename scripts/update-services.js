const fs = require('fs');
const path = require('path');

// Load provider services
const providerServices = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'ytresellers_services.json'), 'utf8')
);

// Exchange rate and margin
const EXCHANGE_RATE = 1450; // KRW/USD
const MARGIN = 1.5; // 50% markup

// Service mappings with INFLUX service IDs
const mappings = [
  { influxId: 'eee92d4e-6087-4858-a211-c024ab67c982', providerServiceId: '7977', name: '틱톡 조회수 [실제 시청]' },
  { influxId: '3e1db3f2-4c63-44f3-9247-827fc1b032a5', providerServiceId: '8063', name: '틱톡 팔로워 [글로벌/실제]' },
  { influxId: 'd2ec27dd-1b80-427b-8e47-d52ea51da1c3', providerServiceId: '6309', name: '틱톡 좋아요' },
  { influxId: 'c9c46eac-cd24-46c0-9ee9-4d1713338dc3', providerServiceId: '4923', name: '유튜브 조회수 [한국/SEO]' },
  { influxId: '243c5d79-c40a-47dd-a558-7a9582edb9fc', providerServiceId: '6374', name: '유튜브 구독자' },
  { influxId: '3a8236ec-6466-4ceb-b4c8-9d75b8a69c6c', providerServiceId: '2', name: '유튜브 좋아요' },
  { influxId: '9c065f57-23e4-40d0-9929-88c983551f79', providerServiceId: '7665', name: '인스타그램 팔로워' },
  { influxId: 'aa507608-c08b-485a-8c93-734060b5170e', providerServiceId: '4135', name: '인스타그램 좋아요' },
  { influxId: 'd0e84984-e464-4fa0-a2ff-f9b49c719d8c', providerServiceId: '6724', name: '인스타그램 릴스 조회수' },
  { influxId: '1a702d23-a32d-41ff-a4fb-7d94648341d4', providerServiceId: '6370', name: 'X(트위터) 팔로워' },
  { influxId: 'ba130786-17f8-4ced-9e38-9831bb5dbd73', providerServiceId: '5250', name: 'X(트위터) 리트윗' },
];

console.log('=== 서비스 가격 계산 ===\n');
console.log('환율: ' + EXCHANGE_RATE + '원/USD, 마진: ' + (MARGIN * 100 - 100) + '%\n');

const updates = [];

for (const mapping of mappings) {
  const providerService = providerServices.find(
    s => String(s.service) === mapping.providerServiceId
  );

  if (!providerService) {
    console.log('❌ ' + mapping.name + ' - Provider service not found');
    continue;
  }

  const costUSD = parseFloat(providerService.rate);
  const costKRW = costUSD * EXCHANGE_RATE;
  const priceKRW = Math.ceil(costKRW * MARGIN); // Round up

  // Build description from provider service name
  const desc = providerService.name
    .replace(/\[.*?\]/g, '') // Remove brackets
    .replace(/[|]/g, ',')
    .replace(/⚠️|♻️|🚀|⛔|🇰🇷|🇹🇷/g, '')
    .trim()
    .substring(0, 100);

  const update = {
    id: mapping.influxId,
    name: mapping.name,
    description: desc,
    price: priceKRW,
    rate: costKRW, // Cost price
    min_quantity: providerService.min,
    max_quantity: Math.min(providerService.max, 10000000), // Cap at 10M
    refill_days: providerService.refill ? 30 : 0,
  };

  updates.push(update);

  console.log('✅ ' + mapping.name);
  console.log('   도매처: ' + providerService.name.substring(0, 50) + '...');
  console.log('   원가: $' + costUSD + ' → ' + costKRW.toFixed(0) + '원/1K');
  console.log('   판매가: ' + priceKRW + '원/1K');
  console.log('   수량: ' + providerService.min + ' ~ ' + providerService.max);
  console.log('');
}

// Output as JSON for easy copy
console.log('\n=== UPDATE JSON ===\n');
console.log(JSON.stringify(updates, null, 2));
