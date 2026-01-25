const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/blog-posts.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 카테고리별 썸네일 매핑
const thumbnailMap = {
  '유튜브': '/thumbnails/youtube-thumb.svg',
  '인스타그램': '/thumbnails/instagram-thumb.svg',
  '틱톡': '/thumbnails/tiktok-thumb.svg',
  '페이스북': '/thumbnails/facebook-thumb.svg',
  '트위터': '/thumbnails/twitter-thumb.svg',
  '텔레그램': '/thumbnails/telegram-thumb.svg',
  '트위치': '/thumbnails/twitch-thumb.svg',
  '디스코드': '/thumbnails/discord-thumb.svg',
  '스레드': '/thumbnails/threads-thumb.svg',
  'SMM': '/thumbnails/smm-thumb.svg',
  'SMM 팁': '/thumbnails/smm-thumb.svg',
  '기타': '/thumbnails/smm-thumb.svg'
};

// 블로그 포스트 배열에서 각 객체를 찾아서 업데이트
// 패턴: category: '카테고리' ... thumbnail: '...'
let updateCount = 0;

for (const [category, thumbnail] of Object.entries(thumbnailMap)) {
  // 특수문자 이스케이프
  const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // category와 thumbnail이 같은 객체 안에 있다고 가정
  // category가 나온 후 thumbnail이 나오는 패턴 (같은 객체 내에서)
  const regex = new RegExp(
    `(category:\\s*'${escapedCategory}'[\\s\\S]*?thumbnail:\\s*)'[^']+'`,
    'g'
  );

  const matches = content.match(regex);
  if (matches) {
    updateCount += matches.length;
  }

  content = content.replace(regex, `$1'${thumbnail}'`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Updated ${updateCount} blog posts with category-specific thumbnails`);

// 검증
const verifyRegex = /thumbnail:\s*'([^']+)'/g;
const thumbnails = {};
let match;
while ((match = verifyRegex.exec(content)) !== null) {
  const thumb = match[1];
  thumbnails[thumb] = (thumbnails[thumb] || 0) + 1;
}
console.log('\nThumbnail distribution:');
for (const [thumb, count] of Object.entries(thumbnails)) {
  console.log(`  ${thumb}: ${count} posts`);
}
