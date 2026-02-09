// 릴스 마케팅용 고품질 서비스 검색
const providers = [
  { name: 'SMMKINGS', id: '9997ee86-18b6-4608-8a45-5380bda1804c', url: 'https://smmkings.com/api/v2', key: 'd2765bc1a3ca929a77ee44e6d1f78f13' },
  { name: 'BULKFOLLOWS', id: 'c5c7a993-a6ca-4f72-9b0c-f3e408e5bc83', url: 'https://bulkfollows.com/api/v2', key: '6ebdbd6842750687d1477fd160074df2' },
  { name: 'PEAKERR', id: 'fc4f9479-1569-4f44-950b-87fc114bcb2d', url: 'https://peakerr.com/api/v2', key: 'c6108f5c0af769e9d8691c88988e289c' },
  { name: 'SMMFOLLOWS', id: '702f4b6b-87ed-4ea4-8a17-ea669c357eb3', url: 'https://smmfollows.com/api/v2', key: 'dcc8f11a305bdab9aa446b1b896a26d5' },
  { name: 'JAP', id: '0b8ea684-52d3-4de2-bba8-9521f726de18', url: 'https://justanotherpanel.com/api/v2', key: '4ba8350a258c92baddb77ac564732610' },
  { name: 'SECSERS', id: 'd6708a87-97b8-4ef1-b5b4-526d9c0890e3', url: 'https://secsers.com/api/v2', key: '6015ffbcfc9f59d1bf30130f1933efe9' },
  { name: 'TOPSMM', id: 'ff5f4fb4-89b2-4391-ad83-9ff43076fd3b', url: 'https://topsmm24.com/api/v2', key: '5e97e22b49d84bcd13ed6ef465afe940' },
  { name: 'SMMHEAVEN', id: 'f55493b3-e25b-4ef3-9db9-68865951347e', url: 'https://smm-heaven.net/api/v2', key: '8e898ea4bdea1e557df5c7da2b7a56ea' },
  { name: 'CHEAPESTPANEL', id: '529682de-92de-42f7-a615-821988099ef7', url: 'https://cheapestpanel.com/api/v2', key: 'bcf6bb1adab3fbfac616a756fbb047e3' },
  { name: 'YTRESELLERS', id: '73d022c1-c9d8-4218-b872-2fc10e993ebc', url: 'https://ytresellers.com/api/v2', key: 'f98ad53368979b9381fea5773fbf1806' },
];

const exchangeRate = 1464.85;
let allServices = [];
let apiErrors = [];

async function fetchAllServices() {
  console.log('🔍 10개 패널 서비스 수집 중...\n');

  for (const provider of providers) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

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
            min: parseInt(s.min) || 0,
            max: parseInt(s.max) || 0,
            refill: s.refill || false,
          });
        });
        console.log(`✅ ${provider.name}: ${data.length}개`);
      } else if (data.error) {
        apiErrors.push({ provider: provider.name, error: data.error });
        console.log(`❌ ${provider.name}: ${data.error}`);
      }
    } catch (e) {
      apiErrors.push({ provider: provider.name, error: e.message });
      console.log(`❌ ${provider.name}: 연결 실패`);
    }
  }

  console.log(`\n총 ${allServices.length}개 서비스 수집\n`);
}

function searchServices(label, keywords, excludes = [], preferKorean = false) {
  console.log('='.repeat(90));
  console.log(`🔹 ${label}`);
  console.log('='.repeat(90));

  let matches = allServices.filter(s => {
    const name = s.name.toLowerCase();
    const hasKeywords = keywords.every(kw => name.includes(kw.toLowerCase()));
    const noExcludes = !excludes.some(ex => name.includes(ex.toLowerCase()));
    return hasKeywords && noExcludes && s.rate > 0;
  });

  // 한국 서비스 우선
  if (preferKorean) {
    const korean = matches.filter(s => s.name.toLowerCase().includes('korea') || s.name.includes('🇰🇷'));
    if (korean.length > 0) {
      console.log('\n📍 한국 타겟 서비스:');
      korean.sort((a, b) => a.rate - b.rate).slice(0, 5).forEach(s => {
        const price300 = Math.round(s.rate * 0.3 * exchangeRate);
        console.log(`  [${s.provider}] #${s.serviceId} | $${s.rate}/1K (300개=$${(s.rate*0.3).toFixed(2)}≈₩${price300})`);
        console.log(`    ${s.name.slice(0, 75)}`);
        console.log(`    Min: ${s.min} | Max: ${s.max} | Refill: ${s.refill ? '✅' : '❌'}`);
      });
    }
  }

  // 고품질 서비스
  const hq = matches.filter(s => {
    const n = s.name.toLowerCase();
    return n.includes('real') || n.includes('high') || n.includes('hq') || n.includes('quality') || n.includes('premium') || n.includes('active');
  });

  console.log('\n📍 고품질 서비스 (Real/HQ/Active):');
  hq.sort((a, b) => a.rate - b.rate).slice(0, 5).forEach(s => {
    const price300 = Math.round(s.rate * 0.3 * exchangeRate);
    console.log(`  [${s.provider}] #${s.serviceId} | $${s.rate}/1K (300개=$${(s.rate*0.3).toFixed(2)}≈₩${price300})`);
    console.log(`    ${s.name.slice(0, 75)}`);
    console.log(`    Min: ${s.min} | Max: ${s.max} | Refill: ${s.refill ? '✅' : '❌'}`);
  });

  // Drip-feed 지원
  const drip = matches.filter(s => s.name.toLowerCase().includes('drip') || s.name.toLowerCase().includes('gradual') || s.name.toLowerCase().includes('slow'));
  if (drip.length > 0) {
    console.log('\n📍 Drip-feed (자연스러운 속도):');
    drip.sort((a, b) => a.rate - b.rate).slice(0, 3).forEach(s => {
      console.log(`  [${s.provider}] #${s.serviceId} | $${s.rate}/1K | ${s.name.slice(0, 60)}`);
    });
  }

  console.log('');
}

function searchComments() {
  console.log('='.repeat(90));
  console.log('🔹 3. 한국어 커스텀 댓글 (7~10개)');
  console.log('='.repeat(90));

  const matches = allServices.filter(s => {
    const name = s.name.toLowerCase();
    return name.includes('instagram') && name.includes('comment') &&
           (name.includes('custom') || name.includes('korea') || name.includes('🇰🇷'));
  }).sort((a, b) => a.rate - b.rate);

  console.log('\n📍 한국어/커스텀 댓글:');
  matches.slice(0, 8).forEach(s => {
    const price10 = Math.round(s.rate * 0.01 * exchangeRate);
    console.log(`  [${s.provider}] #${s.serviceId} | $${s.rate}/1K (10개=$${(s.rate*0.01).toFixed(2)}≈₩${price10})`);
    console.log(`    ${s.name.slice(0, 75)}`);
    console.log(`    Min: ${s.min} | Max: ${s.max}`);
  });
  console.log('');
}

function searchSaveShare() {
  console.log('='.repeat(90));
  console.log('🔹 4. 릴스 공유/저장 (30~50개)');
  console.log('='.repeat(90));

  // 저장
  const saves = allServices.filter(s => {
    const name = s.name.toLowerCase();
    return name.includes('instagram') && (name.includes('save') || name.includes('bookmark'));
  }).sort((a, b) => a.rate - b.rate);

  console.log('\n📍 저장 (Save/Bookmark):');
  saves.slice(0, 5).forEach(s => {
    const price50 = Math.round(s.rate * 0.05 * exchangeRate);
    console.log(`  [${s.provider}] #${s.serviceId} | $${s.rate}/1K (50개=$${(s.rate*0.05).toFixed(2)}≈₩${price50})`);
    console.log(`    ${s.name.slice(0, 70)} | Min: ${s.min}`);
  });

  // 공유
  const shares = allServices.filter(s => {
    const name = s.name.toLowerCase();
    return name.includes('instagram') && name.includes('share');
  }).sort((a, b) => a.rate - b.rate);

  console.log('\n📍 공유 (Share):');
  shares.slice(0, 5).forEach(s => {
    const price50 = Math.round(s.rate * 0.05 * exchangeRate);
    console.log(`  [${s.provider}] #${s.serviceId} | $${s.rate}/1K (50개=$${(s.rate*0.05).toFixed(2)}≈₩${price50})`);
    console.log(`    ${s.name.slice(0, 70)} | Min: ${s.min}`);
  });
  console.log('');
}

function searchReelsViews() {
  console.log('='.repeat(90));
  console.log('🔹 추가 추천: 릴스 조회수 (알고리즘 부스트)');
  console.log('='.repeat(90));

  const matches = allServices.filter(s => {
    const name = s.name.toLowerCase();
    return name.includes('instagram') && name.includes('reel') && name.includes('view');
  }).sort((a, b) => a.rate - b.rate);

  console.log('\n📍 릴스 조회수:');
  matches.slice(0, 5).forEach(s => {
    const price1k = Math.round(s.rate * exchangeRate);
    console.log(`  [${s.provider}] #${s.serviceId} | $${s.rate}/1K (≈₩${price1k})`);
    console.log(`    ${s.name.slice(0, 70)}`);
    console.log(`    Min: ${s.min} | Max: ${s.max}`);
  });
  console.log('');
}

function searchReach() {
  console.log('='.repeat(90));
  console.log('🔹 추가 추천: 릴스 도달/임프레션 (탐색탭 노출)');
  console.log('='.repeat(90));

  const matches = allServices.filter(s => {
    const name = s.name.toLowerCase();
    return name.includes('instagram') && (name.includes('reach') || name.includes('impression') || name.includes('explore'));
  }).sort((a, b) => a.rate - b.rate);

  console.log('\n📍 도달/임프레션/탐색:');
  matches.slice(0, 5).forEach(s => {
    console.log(`  [${s.provider}] #${s.serviceId} | $${s.rate}/1K | ${s.name.slice(0, 60)}`);
  });
  console.log('');
}

async function main() {
  await fetchAllServices();

  // 1. 팔로워 300명
  searchServices('1. 인스타 팔로워 300명 (고품질, Drip-feed)', ['instagram', 'follower'], ['bot', 'cheap', 'auto'], true);

  // 2. 릴스 좋아요 200~300개
  searchServices('2. 릴스 좋아요 200~300개 (빠른 시작)', ['instagram', 'like'], ['comment', 'follow', 'view', 'story', 'auto'], true);

  // 3. 댓글
  searchComments();

  // 4. 공유/저장
  searchSaveShare();

  // 추가 추천
  searchReelsViews();
  searchReach();

  // API 에러 리포트
  if (apiErrors.length > 0) {
    console.log('='.repeat(90));
    console.log('⚠️ API 키 문제 패널:');
    console.log('='.repeat(90));
    apiErrors.forEach(e => console.log(`  ${e.provider}: ${e.error}`));
  }
}

main();
