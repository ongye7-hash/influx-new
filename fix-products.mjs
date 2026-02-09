// 비활성화된 상품들의 올바른 서비스 찾기
const providers = [
  { name: 'SMMKINGS', id: '9997ee86-18b6-4608-8a45-5380bda1804c', url: 'https://smmkings.com/api/v2', key: 'd2765bc1a3ca929a77ee44e6d1f78f13' },
  { name: 'BULKFOLLOWS', id: 'c5c7a993-a6ca-4f72-9b0c-f3e408e5bc83', url: 'https://bulkfollows.com/api/v2', key: '6ebdbd6842750687d1477fd160074df2' },
  { name: 'PEAKERR', id: 'fc4f9479-1569-4f44-950b-87fc114bcb2d', url: 'https://peakerr.com/api/v2', key: 'c6108f5c0af769e9d8691c88988e289c' },
  { name: 'SMMFOLLOWS', id: '702f4b6b-87ed-4ea4-8a17-ea669c357eb3', url: 'https://smmfollows.com/api/v2', key: 'dcc8f11a305bdab9aa446b1b896a26d5' },
  { name: 'JAP', id: '0b8ea684-52d3-4de2-bba8-9521f726de18', url: 'https://justanotherpanel.com/api/v2', key: '4ba8350a258c92baddb77ac564732610' },
  { name: 'SECSERS', id: 'd6708a87-97b8-4ef1-b5b4-526d9c0890e3', url: 'https://secsers.com/api/v2', key: '6015ffbcfc9f59d1bf30130f1933efe9' },
  { name: 'TOPSMM', id: 'ff5f4fb4-89b2-4391-ad83-9ff43076fd3b', url: 'https://topsmm24.com/api/v2', key: '5e97e22b49d84bcd13ed6ef465afe940' },
  { name: 'SMMHEAVEN', id: 'f55493b3-e25b-4ef3-9db9-68865951347e', url: 'https://smm-heaven.net/api/v2', key: '8e898ea4bdea1e557df5c7da2b7a56ea' },
];

const exchangeRate = 1464.85;
let allServices = [];

// 상품별 검색 키워드
const products = [
  { id: 'fdb78abd-2dca-44b4-81f2-4ab52465ed18', name: '🇰🇷 [한국인] 리얼 좋아요', platform: 'instagram', keywords: ['instagram', 'like', 'korea'], exclude: ['follow', 'view', 'comment'] },
  { id: 'fde407da-5b88-4955-92e8-a433d7827f23', name: '🇰🇷 [한국인] 리얼 팔로워', platform: 'instagram', keywords: ['instagram', 'follower', 'korea'], exclude: ['like', 'view', 'comment'] },
  { id: '073767fc-549d-4693-aeab-3eb110069d1d', name: '📹 [릴스] 조회수 + 도달', platform: 'instagram', keywords: ['instagram', 'reel', 'view'], exclude: ['like', 'follow', 'comment'] },
  { id: 'e8c2fa4d-0d8f-44e3-ad54-593825771476', name: '👍 [좋아요/싫어요]', platform: 'youtube', keywords: ['youtube', 'like'], exclude: ['view', 'subscribe', 'comment'] },
  { id: '0572353b-3fff-4ba7-bbe2-efee183b717d', name: '👀 [조회수] 고품질/논드랍', platform: 'youtube', keywords: ['youtube', 'view', 'high', 'quality'], exclude: ['like', 'subscribe'] },
  { id: 'ec64e9a9-2a05-427d-ae0d-ba8411bd06ee', name: '↗️ [공유]', platform: 'youtube', keywords: ['youtube', 'share'], exclude: ['like', 'view'] },
  { id: '46e51316-1429-4618-8134-bbaed315405e', name: '💬 [댓글] 랜덤/이모지', platform: 'tiktok', keywords: ['tiktok', 'comment'], exclude: ['like', 'view', 'follow'] },
  { id: '6b58682d-e79e-4571-a842-22658f3d743b', name: '👁️ [조회수] 바이럴', platform: 'tiktok', keywords: ['tiktok', 'view'], exclude: ['like', 'follow'] },
  { id: '8a2952b9-f028-46ea-a1d2-31cf8d7185ea', name: '❤️ [좋아요] 하트', platform: 'tiktok', keywords: ['tiktok', 'like', 'heart'], exclude: ['view', 'follow'] },
  { id: '6f78d782-5af4-4176-8c94-123dcce660a3', name: '👤 [팔로워]', platform: 'tiktok', keywords: ['tiktok', 'follower'], exclude: ['like', 'view'] },
  { id: '0a1decd4-cff4-4a76-a46a-448bf802dc6c', name: '👍 [게시물] 좋아요', platform: 'facebook', keywords: ['facebook', 'post', 'like'], exclude: ['page', 'follow'] },
  { id: '077d6bed-2c46-4d07-a526-43858831aabd', name: '📄 [페이지] 팔로워/좋아요', platform: 'facebook', keywords: ['facebook', 'page', 'like'], exclude: ['post', 'group'] },
  { id: '4a4302e4-87d8-4f9e-906d-60b4e6c55c8d', name: '👥 [그룹] 멤버', platform: 'facebook', keywords: ['facebook', 'group', 'member'], exclude: ['page', 'post'] },
  { id: 'a5446f31-db57-4a6e-80ab-c458ad3b4d12', name: '👁️ [조회수]', platform: 'telegram', keywords: ['telegram', 'view', 'post'], exclude: ['member', 'subscribe'] },
  { id: 'ccb732f9-75dd-47c6-bd5b-7b69cacc5b96', name: '📊 [조회수] 임프레션', platform: 'twitter', keywords: ['twitter', 'impression'], exclude: ['like', 'follow'] },
  { id: '3b71fbb8-dd2c-48e7-9222-6c1db3ff94c3', name: '👤 [팔로워/리스너]', platform: 'spotify', keywords: ['spotify', 'follower'], exclude: ['play', 'stream'] },
];

async function fetchAllServices() {
  console.log('🔍 전체 패널 서비스 수집 중...\n');

  for (const provider of providers) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(provider.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `key=${provider.key}&action=services`,
        signal: controller.signal
      });
      clearTimeout(timeout);

      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach(s => {
          allServices.push({
            provider: provider.name,
            providerId: provider.id,
            serviceId: String(s.service),
            name: s.name || '',
            rate: parseFloat(s.rate) || 0,
            rateKRW: Math.round((parseFloat(s.rate) || 0) * exchangeRate),
            min: s.min,
            max: s.max
          });
        });
        console.log(`✅ ${provider.name}: ${data.length}개 서비스`);
      }
    } catch (e) {
      console.log(`❌ ${provider.name}: 연결 실패`);
    }
  }

  console.log(`\n총 ${allServices.length}개 서비스 수집 완료\n`);
}

function findBestServices(product) {
  const matches = allServices.filter(s => {
    const name = s.name.toLowerCase();
    const hasKeywords = product.keywords.every(kw => name.includes(kw.toLowerCase()));
    const noExclude = !product.exclude.some(ex => name.includes(ex.toLowerCase()));
    return hasKeywords && noExclude && s.rate > 0 && s.rate < 50; // $50 이하만
  }).sort((a, b) => a.rate - b.rate);

  // 서로 다른 패널에서 3개 선택
  const selected = [];
  const usedProviders = new Set();

  for (const s of matches) {
    if (!usedProviders.has(s.provider)) {
      selected.push(s);
      usedProviders.add(s.provider);
      if (selected.length >= 3) break;
    }
  }

  return selected;
}

async function main() {
  await fetchAllServices();

  console.log('='.repeat(100));
  console.log('📊 상품별 추천 서비스');
  console.log('='.repeat(100));

  const results = [];

  for (const product of products) {
    console.log(`\n🔹 ${product.name} (${product.platform})`);
    const best = findBestServices(product);

    if (best.length === 0) {
      console.log('   ❌ 적합한 서비스를 찾지 못함');
      continue;
    }

    best.forEach((s, i) => {
      const role = i === 0 ? 'Primary' : `Fallback${i}`;
      console.log(`   ${role}: [${s.provider}] #${s.serviceId} | $${s.rate} (₩${s.rateKRW})`);
      console.log(`           ${s.name.slice(0, 70)}`);
    });

    if (best.length >= 1) {
      results.push({
        id: product.id,
        name: product.name,
        primary: best[0],
        fallback1: best[1] || null,
        fallback2: best[2] || null,
        suggestedPrice: Math.max(200, Math.round(best[0].rateKRW * 2))
      });
    }
  }

  // SQL 업데이트 출력
  console.log('\n' + '='.repeat(100));
  console.log('📝 DB 업데이트 SQL');
  console.log('='.repeat(100));

  for (const r of results) {
    console.log(`\n-- ${r.name}`);
    let sql = `UPDATE admin_products SET
  primary_provider_id = '${r.primary.providerId}',
  primary_service_id = '${r.primary.serviceId}',
  price_per_1000 = ${r.suggestedPrice},
  is_active = true`;

    if (r.fallback1) {
      sql += `,
  fallback1_provider_id = '${r.fallback1.providerId}',
  fallback1_service_id = '${r.fallback1.serviceId}'`;
    }
    if (r.fallback2) {
      sql += `,
  fallback2_provider_id = '${r.fallback2.providerId}',
  fallback2_service_id = '${r.fallback2.serviceId}'`;
    }
    sql += `\nWHERE id = '${r.id}';`;
    console.log(sql);
  }
}

main();
