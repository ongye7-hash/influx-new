// 한국인 서비스 검색
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

const searches = [
  { label: 'TikTok 좋아요 (하트)', platform: 'tiktok', type: 'like', keywords: ['tiktok', 'like'] },
  { label: 'TikTok 한국인 좋아요', platform: 'tiktok', type: 'like', keywords: ['tiktok', 'like', 'korea'] },
  { label: 'TikTok 한국인 팔로워', platform: 'tiktok', type: 'follower', keywords: ['tiktok', 'follower', 'korea'] },
  { label: 'TikTok 한국인 조회수', platform: 'tiktok', type: 'view', keywords: ['tiktok', 'view', 'korea'] },
  { label: 'Twitter 아시아 팔로워', platform: 'twitter', type: 'follower', keywords: ['twitter', 'follower', 'asia'] },
  { label: 'YouTube 한국인 댓글', platform: 'youtube', type: 'comment', keywords: ['youtube', 'comment', 'korea'] },
  { label: 'Instagram 한국인 댓글', platform: 'instagram', type: 'comment', keywords: ['instagram', 'comment', 'korea'] },
  { label: 'Telegram 한국인 조회수', platform: 'telegram', type: 'view', keywords: ['telegram', 'view', 'korea'] },
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
          });
        });
      }
    } catch (e) {}
  }

  console.log(`총 ${allServices.length}개 서비스 수집 완료\n`);
}

async function main() {
  await fetchAllServices();

  for (const search of searches) {
    console.log('='.repeat(80));
    console.log(`🔹 ${search.label}`);
    console.log('='.repeat(80));

    const matches = allServices.filter(s => {
      const name = s.name.toLowerCase();
      return search.keywords.every(kw => name.includes(kw.toLowerCase()));
    }).sort((a, b) => a.rate - b.rate).slice(0, 5);

    if (matches.length === 0) {
      // 키워드 완화 검색
      const relaxed = allServices.filter(s => {
        const name = s.name.toLowerCase();
        return name.includes(search.platform) && name.includes(search.type);
      }).sort((a, b) => a.rate - b.rate).slice(0, 3);

      if (relaxed.length > 0) {
        console.log('(정확한 한국 서비스 없음, 대체 서비스:)');
        relaxed.forEach(s => console.log(`  [${s.provider}] #${s.serviceId} | $${s.rate} (₩${s.rateKRW}) | ${s.name.slice(0, 60)}`));
      } else {
        console.log('❌ 서비스 없음');
      }
    } else {
      matches.forEach(s => console.log(`  [${s.provider}] #${s.serviceId} | $${s.rate} (₩${s.rateKRW}) | ${s.name.slice(0, 60)}`));
    }
    console.log('');
  }
}

main();
