const https = require('https');
const querystring = require('querystring');

const postData = querystring.stringify({
  key: '5ff7d2b5f3ce668030498faf2288b5f5',
  action: 'services'
});

const options = {
  hostname: 'ytreseller.com',
  port: 443,
  path: '/api/v2',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const services = JSON.parse(data);

      // 카테고리별로 그룹화
      const categories = {};
      services.forEach(s => {
        const cat = s.category || 'Unknown';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(s);
      });

      console.log('=== YTReseller 카테고리 구조 ===\n');
      console.log('총 카테고리:', Object.keys(categories).length, '개');
      console.log('총 서비스:', services.length, '개\n');

      // 플랫폼별 카테고리 분류
      const platforms = ['youtube', 'instagram', 'tiktok', 'twitter', 'facebook', 'telegram', 'twitch'];

      platforms.forEach(platform => {
        const platformCats = Object.keys(categories).filter(c =>
          c.toLowerCase().includes(platform)
        );

        if (platformCats.length > 0) {
          console.log(`\n=== ${platform.toUpperCase()} (${platformCats.length}개 카테고리) ===`);
          platformCats.forEach(cat => {
            console.log(`  📁 ${cat} (${categories[cat].length}개)`);
          });
        }
      });

      // YouTube 카테고리 예시 - 서비스 샘플
      console.log('\n\n=== YouTube 조회수 카테고리 서비스 샘플 ===');
      const ytViewsCat = Object.keys(categories).find(c =>
        c.toLowerCase().includes('youtube') && c.toLowerCase().includes('view')
      );
      if (ytViewsCat && categories[ytViewsCat]) {
        categories[ytViewsCat].slice(0, 5).forEach(s => {
          console.log(`  [${s.service}] ${s.name.substring(0, 60)}...`);
        });
      }

    } catch(e) {
      console.log('Error:', e.message);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(postData);
req.end();
