// 전체 패널에서 Instagram 외국인 리얼 좋아요 검색
const providers = [
  { name: 'SMMKINGS', id: '9997ee86-18b6-4608-8a45-5380bda1804c', url: 'https://smmkings.com/api/v2', key: 'd2765bc1a3ca929a77ee44e6d1f78f13' },
  { name: 'BULKFOLLOWS', id: 'c5c7a993-a6ca-4f72-9b0c-f3e408e5bc83', url: 'https://bulkfollows.com/api/v2', key: '6ebdbd6842750687d1477fd160074df2' },
  { name: 'PEAKERR', id: 'fc4f9479-1569-4f44-950b-87fc114bcb2d', url: 'https://peakerr.com/api/v2', key: 'c6108f5c0af769e9d8691c88988e289c' },
  { name: 'SMMFOLLOWS', id: '702f4b6b-87ed-4ea4-8a17-ea669c357eb3', url: 'https://smmfollows.com/api/v2', key: 'dcc8f11a305bdab9aa446b1b896a26d5' },
  { name: 'CHEAPESTPANEL', id: '529682de-92de-42f7-a615-821988099ef7', url: 'https://cheapestpanel.com/api/v2', key: 'bcf6bb1adab3fbfac616a756fbb047e3' },
  { name: 'TOPSMM', id: 'ff5f4fb4-89b2-4391-ad83-9ff43076fd3b', url: 'https://topsmm24.com/api/v2', key: '5e97e22b49d84bcd13ed6ef465afe940' },
  { name: 'SECSERS', id: 'd6708a87-97b8-4ef1-b5b4-526d9c0890e3', url: 'https://secsers.com/api/v2', key: '6015ffbcfc9f59d1bf30130f1933efe9' },
  { name: 'JAP', id: '0b8ea684-52d3-4de2-bba8-9521f726de18', url: 'https://justanotherpanel.com/api/v2', key: '4ba8350a258c92baddb77ac564732610' },
  { name: 'SMMHEAVEN', id: 'f55493b3-e25b-4ef3-9db9-68865951347e', url: 'https://smm-heaven.net/api/v2', key: '8e898ea4bdea1e557df5c7da2b7a56ea' },
];

const exchangeRate = 1464.85;
const allResults = [];

async function searchProvider(provider) {
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
    if (!Array.isArray(data)) return [];

    // Instagram 좋아요 필터링 (외국인/리얼/HQ)
    const likes = data.filter(s => {
      const n = (s.name || '').toLowerCase();
      const isInstagramLike = n.includes('instagram') && n.includes('like');
      const notOther = !n.includes('comment') && !n.includes('follow') && !n.includes('view') && !n.includes('story') && !n.includes('reel');
      const isQuality = n.includes('real') || n.includes('high') || n.includes('hq') || n.includes('worldwide') || n.includes('global') || n.includes('quality') || n.includes('instant');
      return isInstagramLike && notOther && isQuality;
    });

    return likes.map(s => ({
      provider: provider.name,
      providerId: provider.id,
      serviceId: s.service,
      name: s.name,
      rate: parseFloat(s.rate),
      rateKRW: Math.round(parseFloat(s.rate) * exchangeRate),
      min: s.min,
      max: s.max
    }));
  } catch (e) {
    console.log(`${provider.name}: 연결 실패`);
    return [];
  }
}

async function main() {
  console.log('🔍 전체 패널에서 Instagram 외국인 리얼 좋아요 검색 중...\n');

  const results = await Promise.all(providers.map(searchProvider));
  const allServices = results.flat().sort((a, b) => a.rate - b.rate);

  console.log('='.repeat(80));
  console.log('📊 검색 결과 (가격순)');
  console.log('='.repeat(80));

  allServices.slice(0, 20).forEach((s, i) => {
    console.log(`${i+1}. [${s.provider}] #${s.serviceId} | $${s.rate} (₩${s.rateKRW}) | ${s.name.slice(0, 60)}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('🎯 추천 폴백 구성 (가격/품질 기준)');
  console.log('='.repeat(80));

  // 서로 다른 패널에서 3개 선택
  const selected = [];
  const usedProviders = new Set();

  for (const s of allServices) {
    if (!usedProviders.has(s.provider) && s.rate < 1.0) { // $1 이하만
      selected.push(s);
      usedProviders.add(s.provider);
      if (selected.length >= 3) break;
    }
  }

  if (selected.length < 3) {
    // 가격 제한 완화
    for (const s of allServices) {
      if (!usedProviders.has(s.provider)) {
        selected.push(s);
        usedProviders.add(s.provider);
        if (selected.length >= 3) break;
      }
    }
  }

  console.log('\n✅ Primary:');
  if (selected[0]) console.log(`   ${selected[0].provider} | #${selected[0].serviceId} | $${selected[0].rate} (₩${selected[0].rateKRW})`);
  console.log('   ' + (selected[0]?.name || 'N/A'));

  console.log('\n✅ Fallback 1:');
  if (selected[1]) console.log(`   ${selected[1].provider} | #${selected[1].serviceId} | $${selected[1].rate} (₩${selected[1].rateKRW})`);
  console.log('   ' + (selected[1]?.name || 'N/A'));

  console.log('\n✅ Fallback 2:');
  if (selected[2]) console.log(`   ${selected[2].provider} | #${selected[2].serviceId} | $${selected[2].rate} (₩${selected[2].rateKRW})`);
  console.log('   ' + (selected[2]?.name || 'N/A'));

  // DB 업데이트용 출력
  console.log('\n' + '='.repeat(80));
  console.log('📝 DB 업데이트 정보');
  console.log('='.repeat(80));
  console.log(`상품 ID: 2b3c39dd-b157-4107-af8f-bfa9ecccaa5f (외국인 리얼 좋아요)`);
  if (selected[0]) console.log(`Primary: provider=${selected[0].providerId}, service=${selected[0].serviceId}`);
  if (selected[1]) console.log(`Fallback1: provider=${selected[1].providerId}, service=${selected[1].serviceId}`);
  if (selected[2]) console.log(`Fallback2: provider=${selected[2].providerId}, service=${selected[2].serviceId}`);
  console.log(`추천 판매가: ₩${selected[0] ? Math.round(selected[0].rateKRW * 1.5) : 'N/A'} (마진 50%)`);
}

main();
