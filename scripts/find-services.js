const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'ytresellers_services.json'), 'utf8'));

console.log('Total services:', data.length);
console.log('');

const searches = [
  { name: 'TikTok Views (Regular)', keywords: ['tiktok', 'view'], exclude: ['like', 'save', 'share', 'live'] },
  { name: 'TikTok Followers', keywords: ['tiktok', 'follower'], exclude: ['live'] },
  { name: 'TikTok Likes (Regular)', keywords: ['tiktok', 'like'], exclude: ['view', 'live'] },
  { name: 'YouTube Views (Regular)', keywords: ['youtube', 'view'], exclude: ['subscriber', 'like', 'comment', 'short', 'live', 'stream'] },
  { name: 'YouTube Subscribers', keywords: ['youtube', 'subscrib'], exclude: ['live'] },
  { name: 'YouTube Likes (Regular)', keywords: ['youtube', 'like'], exclude: ['comment', 'live', 'stream', 'view'] },
  { name: 'Instagram Followers', keywords: ['instagram', 'follower'], exclude: ['live'] },
  { name: 'Instagram Likes (Regular)', keywords: ['instagram', 'like'], exclude: ['follower', 'view', 'story', 'live'] },
  { name: 'Instagram Reels Views', keywords: ['instagram', 'reel'], exclude: ['like', 'live'] },
  { name: 'Twitter/X Followers', keywords: ['twitter', 'follower'], exclude: ['view', 'impression', 'live'] },
  { name: 'Twitter/X Retweets', keywords: ['twitter', 'retweet'], exclude: [] },
];

const recommended = {};

for (const search of searches) {
  const matches = data.filter(s => {
    const txt = (s.name + ' ' + (s.category || '')).toLowerCase();
    const hasAll = search.keywords.every(k => txt.includes(k));
    const hasExclude = search.exclude.some(e => txt.includes(e));
    return hasAll && !hasExclude;
  }).sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

  console.log('=== ' + search.name + ' (' + matches.length + ' found) ===');
  matches.slice(0, 3).forEach((m, i) => {
    const marker = i === 0 ? ' ★ RECOMMENDED' : '';
    console.log('  [' + m.service + '] $' + m.rate + '/1K' + marker);
    console.log('    ' + m.name.substring(0, 70));
    console.log('    min=' + m.min + ' max=' + m.max);
  });

  if (matches.length > 0) {
    recommended[search.name] = matches[0].service;
  }
  console.log('');
}

console.log('=== RECOMMENDED MAPPING ===');
console.log(JSON.stringify(recommended, null, 2));
