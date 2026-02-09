// 한국인 고품질 서비스 검색 (비싼 순 = 고품질)
const providers = [
  { name: 'SMMKINGS', url: 'https://smmkings.com/api/v2', key: 'd2765bc1a3ca929a77ee44e6d1f78f13' },
  { name: 'BULKFOLLOWS', url: 'https://bulkfollows.com/api/v2', key: '6ebdbd6842750687d1477fd160074df2' },
  { name: 'PEAKERR', url: 'https://peakerr.com/api/v2', key: 'c6108f5c0af769e9d8691c88988e289c' },
  { name: 'SMMFOLLOWS', url: 'https://smmfollows.com/api/v2', key: 'dcc8f11a305bdab9aa446b1b896a26d5' },
  { name: 'JAP', url: 'https://justanotherpanel.com/api/v2', key: '4ba8350a258c92baddb77ac564732610' },
  { name: 'SECSERS', url: 'https://secsers.com/api/v2', key: '6015ffbcfc9f59d1bf30130f1933efe9' },
  { name: 'SMMHEAVEN', url: 'https://smm-heaven.net/api/v2', key: '8e898ea4bdea1e557df5c7da2b7a56ea' },
  { name: 'YTRESELLERS', url: 'https://ytresellers.com/api/v2', key: 'f98ad53368979b9381fea5773fbf1806' },
];

const rate = 1464.85;

async function search() {
  let all = [];

  console.log('🔍 패널 검색 중...\n');

  for (const p of providers) {
    try {
      const res = await fetch(p.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'key=' + p.key + '&action=services',
        signal: AbortSignal.timeout(15000)
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach(s => all.push({ ...s, provider: p.name, rate: parseFloat(s.rate) || 0 }));
        console.log(`✅ ${p.name}: ${data.length}개`);
      }
    } catch(e) {
      console.log(`❌ ${p.name}: 실패`);
    }
  }

  console.log('\n' + '='.repeat(90));
  console.log('🇰🇷 1. 한국인 인스타 팔로워 (고품질 - 비싼순)');
  console.log('='.repeat(90));

  const krFollowers = all.filter(s => {
    const n = (s.name || '').toLowerCase();
    return n.includes('instagram') && n.includes('follower') &&
           (n.includes('korea') || n.includes('🇰🇷') || n.includes('korean'));
  }).sort((a,b) => b.rate - a.rate); // 비싼 순

  krFollowers.slice(0, 10).forEach(s => {
    const p300 = Math.round(s.rate * 0.3 * rate);
    console.log(`\n[${s.provider}] #${s.service} | $${s.rate}/1K (300개≈₩${p300.toLocaleString()})`);
    console.log(`  📦 ${s.name}`);
    console.log(`  Min: ${s.min} | Max: ${s.max} | Refill: ${s.refill ? '✅30일' : '❌없음'}`);
  });

  console.log('\n' + '='.repeat(90));
  console.log('🇰🇷 2. 한국인 인스타 좋아요 (고품질 - 비싼순)');
  console.log('='.repeat(90));

  const krLikes = all.filter(s => {
    const n = (s.name || '').toLowerCase();
    return n.includes('instagram') && n.includes('like') &&
           (n.includes('korea') || n.includes('🇰🇷') || n.includes('korean')) &&
           n.indexOf('auto') === -1 && n.indexOf('comment') === -1 && n.indexOf('follower') === -1;
  }).sort((a,b) => b.rate - a.rate);

  krLikes.slice(0, 10).forEach(s => {
    const p300 = Math.round(s.rate * 0.3 * rate);
    console.log(`\n[${s.provider}] #${s.service} | $${s.rate}/1K (300개≈₩${p300.toLocaleString()})`);
    console.log(`  📦 ${s.name}`);
    console.log(`  Min: ${s.min} | Max: ${s.max} | Refill: ${s.refill ? '✅' : '❌'}`);
  });

  console.log('\n' + '='.repeat(90));
  console.log('🇰🇷 3. 한국어 커스텀 댓글 (전체)');
  console.log('='.repeat(90));

  const krComments = all.filter(s => {
    const n = (s.name || '').toLowerCase();
    return n.includes('instagram') && n.includes('comment') &&
           (n.includes('korea') || n.includes('🇰🇷') || n.includes('korean'));
  }).sort((a,b) => b.rate - a.rate);

  if (krComments.length === 0) {
    console.log('\n⚠️ 한국어 댓글 서비스 없음!');
    console.log('\n📍 대안 - 커스텀 댓글 (영어):');
    const customComments = all.filter(s => {
      const n = (s.name || '').toLowerCase();
      return n.includes('instagram') && n.includes('comment') && n.includes('custom');
    }).sort((a,b) => b.rate - a.rate).slice(0, 5);

    customComments.forEach(s => {
      console.log(`\n[${s.provider}] #${s.service} | $${s.rate}/1K`);
      console.log(`  📦 ${s.name}`);
      console.log(`  Min: ${s.min} | Max: ${s.max}`);
    });
  } else {
    krComments.slice(0, 10).forEach(s => {
      const p10 = Math.round(s.rate * 0.01 * rate);
      console.log(`\n[${s.provider}] #${s.service} | $${s.rate}/1K (10개≈₩${p10.toLocaleString()})`);
      console.log(`  📦 ${s.name}`);
      console.log(`  Min: ${s.min} | Max: ${s.max}`);
    });
  }

  console.log('\n' + '='.repeat(90));
  console.log('📤 4. 인스타 저장/공유 (고품질)');
  console.log('='.repeat(90));

  // 저장
  console.log('\n📍 저장 (Save):');
  const saves = all.filter(s => {
    const n = (s.name || '').toLowerCase();
    return n.includes('instagram') && n.includes('save') &&
           (n.includes('real') || n.includes('hq') || n.includes('high') || n.includes('quality') || n.includes('active'));
  }).sort((a,b) => b.rate - a.rate);

  saves.slice(0, 5).forEach(s => {
    console.log(`[${s.provider}] #${s.service} | $${s.rate}/1K | Min:${s.min} | ${s.name.slice(0,60)}`);
  });

  // 공유
  console.log('\n📍 공유 (Share):');
  const shares = all.filter(s => {
    const n = (s.name || '').toLowerCase();
    return n.includes('instagram') && n.includes('share') &&
           (n.includes('real') || n.includes('hq') || n.includes('high') || n.includes('quality') || n.includes('active'));
  }).sort((a,b) => b.rate - a.rate);

  shares.slice(0, 5).forEach(s => {
    console.log(`[${s.provider}] #${s.service} | $${s.rate}/1K | Min:${s.min} | ${s.name.slice(0,60)}`);
  });

  console.log('\n' + '='.repeat(90));
  console.log('🎬 추가: 릴스 조회수 + 도달 (알고리즘 부스트)');
  console.log('='.repeat(90));

  const reelViews = all.filter(s => {
    const n = (s.name || '').toLowerCase();
    return n.includes('instagram') && n.includes('reel') &&
           (n.includes('view') || n.includes('reach') || n.includes('impression'));
  }).sort((a,b) => b.rate - a.rate);

  reelViews.slice(0, 8).forEach(s => {
    console.log(`[${s.provider}] #${s.service} | $${s.rate}/1K | ${s.name.slice(0,65)}`);
  });
}

search();
