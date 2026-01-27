// SMM 서비스 매핑 스크립트 v3
// 58개 카테고리에 대해 3-Tier Redundancy 적용 (타입 검증 추가)

const fs = require('fs');
const path = require('path');

// 소스 파일 경로
const SOURCE_FILE = 'C:/Users/user/Desktop/smm_master_source.txt';
const OUTPUT_FILE = path.join(__dirname, 'service_mappings.json');

// 58개 타겟 카테고리 정의 (타입 검증 추가)
const targetCategories = [
  // Instagram (1-14)
  { id: 1, name: '🇰🇷 [한국인] 리얼 좋아요', platform: 'instagram', type: 'likes', mustHave: ['korea', 'korean', '🇰🇷'], typeKeywords: ['like', 'likes'] },
  { id: 2, name: '🇰🇷 [한국인] 리얼 팔로워', platform: 'instagram', type: 'followers', mustHave: ['korea', 'korean', '🇰🇷'], typeKeywords: ['follower', 'followers'], exclude: ['comment', 'like', 'view', 'story'] },
  { id: 3, name: '🇰🇷 [한국인] 커스텀 댓글', platform: 'instagram', type: 'comments', mustHave: ['custom'], typeKeywords: ['comment'] },
  { id: 4, name: '🇰🇷 [한국인] 자동 좋아요', platform: 'instagram', type: 'auto-likes', mustHave: ['auto'], typeKeywords: ['like', 'likes'] },
  { id: 5, name: '⚡ [외국인] 스피드 좋아요', platform: 'instagram', type: 'likes', mustHave: ['instant', 'fast', 'speed', '0-1', '0-15'], typeKeywords: ['like', 'likes'], exclude: ['slow', 'korea', 'korean', '🇰🇷'] },
  { id: 6, name: '🛡️ [외국인] AS보장 팔로워', platform: 'instagram', type: 'followers', mustHave: ['refill', 'r30', 'r60', 'r365', '30 day', '60 day', '365 day'], typeKeywords: ['follower', 'followers'], exclude: ['no refill', 'korea', 'korean', '🇰🇷', 'comment'] },
  { id: 7, name: '💸 [외국인] 최저가 막팔로워', platform: 'instagram', type: 'followers', typeKeywords: ['follower', 'followers'], exclude: ['korea', 'korean', '🇰🇷', 'comment'], preferCheap: true },
  { id: 8, name: '📹 [릴스] 조회수 + 도달', platform: 'instagram', type: 'reels', mustHave: ['reel', 'reels'], typeKeywords: ['view', 'reach'] },
  { id: 9, name: '👁️ [동영상] 조회수', platform: 'instagram', type: 'views', mustHave: ['video', 'igtv', 'tv view'], typeKeywords: ['view'] },
  { id: 10, name: '📖 [스토리] 조회수 + 투표', platform: 'instagram', type: 'story', mustHave: ['story', 'stories'], typeKeywords: ['view', 'poll', 'vote'] },
  { id: 11, name: '📊 [인사이트] 노출/도달/저장', platform: 'instagram', type: 'insights', mustHave: ['impression', 'reach', 'save', 'saves'], typeKeywords: ['impression', 'reach', 'save'] },
  { id: 12, name: '🔴 [라이브] 방송 시청자', platform: 'instagram', type: 'live', mustHave: ['live'], typeKeywords: ['viewer', 'view', 'stream', 'live'] },
  { id: 13, name: '💬 [댓글] 외국인/이모티콘', platform: 'instagram', type: 'comments', mustHave: ['comment', 'random'], typeKeywords: ['comment'], exclude: ['custom', 'korea', 'korean'] },
  { id: 14, name: '💙 [블루뱃지] 인증 계정', platform: 'instagram', type: 'verified', mustHave: ['verified', 'blue tick', 'blue badge', 'bluetick', '✅'], typeKeywords: ['verified', 'blue'] },

  // YouTube (15-25)
  { id: 15, name: '👀 [조회수] 고품질/논드랍', platform: 'youtube', type: 'views', mustHave: ['retention', 'non-drop', 'nondrop', 'non drop', 'nodrop', 'no drop', 'high quality'], typeKeywords: ['view'] },
  { id: 16, name: '⚡ [조회수] 빠른 유입', platform: 'youtube', type: 'views', mustHave: ['fast', 'instant', 'speed'], typeKeywords: ['view'], exclude: ['short'] },
  { id: 17, name: '📱 [쇼츠] 조회수', platform: 'youtube', type: 'shorts', mustHave: ['short', 'shorts'], typeKeywords: ['view'] },
  { id: 18, name: '📱 [쇼츠] 좋아요/공유', platform: 'youtube', type: 'shorts', mustHave: ['short', 'shorts'], typeKeywords: ['like', 'share'] },
  { id: 19, name: '👥 [구독자] 실제 유저', platform: 'youtube', type: 'subscribers', mustHave: ['real', 'active', 'hq', 'high quality'], typeKeywords: ['subscriber', 'sub'] },
  { id: 20, name: '👥 [구독자] 저가형', platform: 'youtube', type: 'subscribers', typeKeywords: ['subscriber', 'sub'], preferCheap: true },
  { id: 21, name: '⏳ [시청시간] 4000시간', platform: 'youtube', type: 'watchtime', mustHave: ['watch', 'hour', 'time'], typeKeywords: ['watch', 'hour', '4000'] },
  { id: 22, name: '👍 [좋아요/싫어요]', platform: 'youtube', type: 'likes', typeKeywords: ['like', 'dislike'], exclude: ['short'] },
  { id: 23, name: '🔴 [라이브] 스트리밍 시청자', platform: 'youtube', type: 'live', mustHave: ['live', 'stream'], typeKeywords: ['viewer', 'view', 'live', 'stream'] },
  { id: 24, name: '💬 [댓글]', platform: 'youtube', type: 'comments', typeKeywords: ['comment'] },
  { id: 25, name: '↗️ [공유]', platform: 'youtube', type: 'shares', typeKeywords: ['share'] },

  // Facebook (26-32)
  { id: 26, name: '📄 [페이지] 팔로워/좋아요', platform: 'facebook', type: 'page', mustHave: ['page', 'fanpage'], typeKeywords: ['follower', 'like', 'fan'] },
  { id: 27, name: '👤 [프로필] 팔로워/친구', platform: 'facebook', type: 'profile', mustHave: ['profile', 'friend'], typeKeywords: ['follower', 'friend'] },
  { id: 28, name: '👍 [게시물] 좋아요', platform: 'facebook', type: 'likes', mustHave: ['post', 'photo'], typeKeywords: ['like'] },
  { id: 29, name: '😍 [게시물] 이모티콘', platform: 'facebook', type: 'reactions', mustHave: ['reaction', 'emoticon', 'love', 'wow', 'haha', 'sad', 'angry', '😍', '❤️', '😢', '😮'], typeKeywords: ['reaction', 'love', 'wow', 'haha', 'sad', 'angry'] },
  { id: 30, name: '🔴 [라이브] 방송 시청자', platform: 'facebook', type: 'live', mustHave: ['live'], typeKeywords: ['viewer', 'view', 'stream', 'live'] },
  { id: 31, name: '👁️ [동영상] 조회수', platform: 'facebook', type: 'views', mustHave: ['video', 'reel'], typeKeywords: ['view'] },
  { id: 32, name: '👥 [그룹] 멤버', platform: 'facebook', type: 'group', mustHave: ['group'], typeKeywords: ['member', 'join'] },

  // TikTok (33-38)
  { id: 33, name: '👁️ [조회수] 바이럴', platform: 'tiktok', type: 'views', typeKeywords: ['view', 'viral'] },
  { id: 34, name: '❤️ [좋아요] 하트', platform: 'tiktok', type: 'likes', typeKeywords: ['like', 'heart', '❤️'] },
  { id: 35, name: '👤 [팔로워]', platform: 'tiktok', type: 'followers', typeKeywords: ['follower'], exclude: ['comment', 'like', 'view'] },
  { id: 36, name: '↗️ [공유/저장]', platform: 'tiktok', type: 'shares', typeKeywords: ['share', 'save', 'favorite'] },
  { id: 37, name: '🔴 [라이브] 시청자', platform: 'tiktok', type: 'live', mustHave: ['live'], typeKeywords: ['viewer', 'view', 'live'] },
  { id: 38, name: '💬 [댓글]', platform: 'tiktok', type: 'comments', typeKeywords: ['comment'] },

  // Twitter/X (39-45)
  { id: 39, name: '👤 [팔로워] 글로벌', platform: 'twitter', type: 'followers', typeKeywords: ['follower'], exclude: ['korea', 'korean'] },
  { id: 40, name: '🇰🇷 [팔로워] 한국인', platform: 'twitter', type: 'followers', mustHave: ['korea', 'korean', '🇰🇷'], typeKeywords: ['follower'] },
  { id: 41, name: '🔄 [리트윗]', platform: 'twitter', type: 'retweets', typeKeywords: ['retweet', 'rt', 'quote'] },
  { id: 42, name: '❤️ [좋아요]', platform: 'twitter', type: 'likes', typeKeywords: ['like', 'favorite', 'heart'] },
  { id: 43, name: '📊 [조회수] 임프레션', platform: 'twitter', type: 'impressions', typeKeywords: ['impression', 'view'] },
  { id: 44, name: '🗳️ [투표]', platform: 'twitter', type: 'votes', typeKeywords: ['poll', 'vote'] },
  { id: 45, name: '🎙️ [스페이스] 청취자', platform: 'twitter', type: 'spaces', mustHave: ['space'], typeKeywords: ['listener', 'space'] },

  // Telegram (46-49)
  { id: 46, name: '👥 [채널/그룹] 멤버', platform: 'telegram', type: 'members', typeKeywords: ['member', 'subscriber'] },
  { id: 47, name: '👁️ [조회수]', platform: 'telegram', type: 'views', typeKeywords: ['view'] },
  { id: 48, name: '👍 [반응]', platform: 'telegram', type: 'reactions', typeKeywords: ['reaction', 'emoji'] },
  { id: 49, name: '🗳️ [투표]', platform: 'telegram', type: 'votes', typeKeywords: ['poll', 'vote'] },

  // Discord (50-53)
  { id: 50, name: '👥 [멤버] 오프라인', platform: 'discord', type: 'members', mustHave: ['offline'], typeKeywords: ['member'] },
  { id: 51, name: '🟢 [멤버] 온라인', platform: 'discord', type: 'members', mustHave: ['online'], typeKeywords: ['member'] },
  { id: 52, name: '🚀 [부스트]', platform: 'discord', type: 'boosts', typeKeywords: ['boost', 'nitro'] },
  { id: 53, name: '🤝 [친구]', platform: 'discord', type: 'friends', typeKeywords: ['friend'] },

  // Threads (54-56)
  { id: 54, name: '👤 [팔로워]', platform: 'threads', type: 'followers', typeKeywords: ['follower'] },
  { id: 55, name: '❤️ [좋아요]', platform: 'threads', type: 'likes', typeKeywords: ['like'] },
  { id: 56, name: '🔄 [리포스트]', platform: 'threads', type: 'reposts', typeKeywords: ['repost', 'reshare', 'share'] },

  // Music (57-58)
  { id: 57, name: '🎧 [스트리밍] 재생수', platform: 'spotify|soundcloud', type: 'plays', typeKeywords: ['play', 'stream'] },
  { id: 58, name: '👤 [팔로워/리스너]', platform: 'spotify|soundcloud', type: 'followers', typeKeywords: ['follower', 'listener', 'monthly'] },
];

// 파일 파싱 함수 (다중 형식 지원)
function parseSourceFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const services = [];
  let currentProvider = '';

  console.log('파일 분석 중... 총 라인 수:', lines.length);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 공급자 감지
    if (trimmedLine.startsWith('PROVIDER')) {
      const match = trimmedLine.match(/PROVIDER[:\s\d]*:\s*([A-Z0-9]+)/i);
      if (match) {
        currentProvider = match[1].toUpperCase();
        console.log(`  🔍 Provider 발견 (line ${i + 1}): ${currentProvider}`);
      }
      continue;
    }

    if (!currentProvider) continue;

    // === 형식 1: 단일 줄 탭 구분 (SECSERS, SMMKINGS, PEAKERR 등) ===
    if (line.includes('\t')) {
      const parts = line.split('\t');
      const firstPart = parts[0].trim();

      if (/^\d+$/.test(firstPart) && parts.length >= 3) {
        const serviceId = firstPart;
        const serviceName = parts[1]?.trim();

        let rate = 0;
        let min = 10;
        let max = 1000000;

        for (let j = 2; j < parts.length; j++) {
          const part = parts[j].trim();

          if (part.startsWith('$') && rate === 0) {
            const priceMatch = part.match(/\$([0-9.,]+)/);
            if (priceMatch) {
              rate = parseFloat(priceMatch[1].replace(/,/g, ''));
            }
          }

          const minMaxMatch = part.match(/^(\d[\d\s,]*)\s*[-/]\s*(\d[\d\s,]*)$/);
          if (minMaxMatch) {
            min = parseInt(minMaxMatch[1].replace(/[\s,]/g, '')) || 10;
            max = parseInt(minMaxMatch[2].replace(/[\s,]/g, '')) || 1000000;
          }
        }

        if (parts.length >= 5) {
          const minPart = parts[3]?.trim();
          const maxPart = parts[4]?.trim();

          if (/^[\d\s,]+$/.test(minPart)) {
            min = parseInt(minPart.replace(/[\s,]/g, '')) || min;
          }
          if (/^[\d\s,]+$/.test(maxPart)) {
            max = parseInt(maxPart.replace(/[\s,]/g, '')) || max;
          }
        }

        // Min/Max 검증 (비정상적인 값 수정)
        if (min > max) {
          [min, max] = [max, min];
        }
        if (max > 100000000) max = 100000000;
        if (min < 1) min = 1;

        if (serviceName && serviceName.length > 3 && rate > 0 && !serviceName.startsWith('$')) {
          services.push({
            provider: currentProvider,
            id: serviceId,
            name: serviceName,
            rate: rate,
            min: min,
            max: max,
            nameLower: serviceName.toLowerCase()
          });
          continue;
        }
      }
    }

    // === 형식 2: 다중 줄 (JAP, BULKFOLLOWS 등) ===
    if (/^\d+$/.test(trimmedLine) && currentProvider) {
      const serviceId = trimmedLine;
      const nextLine = lines[i + 1]?.trim() || '';
      const nextNextLine = lines[i + 2]?.trim() || '';

      if (nextLine &&
          !nextLine.startsWith('$') &&
          !/^\d+$/.test(nextLine) &&
          nextLine.length > 5 &&
          !nextLine.includes('ID\t')) {

        let rate = 0;
        let min = 10;
        let max = 1000000;

        let priceLine = nextNextLine;

        if (nextLine.includes('\t')) {
          const parts = nextLine.split('\t');
          priceLine = parts.find(p => p.includes('$')) || priceLine;

          for (const part of parts) {
            const priceMatch = part.match(/\$([0-9.,]+)/);
            if (priceMatch) {
              rate = parseFloat(priceMatch[1].replace(/,/g, ''));
            }

            const minMaxMatch = part.match(/^(\d[\d\s,]*)\s*[/-]\s*(\d[\d\s,]*)$/);
            if (minMaxMatch) {
              min = parseInt(minMaxMatch[1].replace(/[\s,]/g, '')) || 10;
              max = parseInt(minMaxMatch[2].replace(/[\s,]/g, '')) || 1000000;
            }
          }

          const serviceName = parts[0]?.trim();

          // Min/Max 검증
          if (min > max) [min, max] = [max, min];
          if (max > 100000000) max = 100000000;
          if (min < 1) min = 1;

          if (serviceName && serviceName.length > 3 && rate > 0) {
            services.push({
              provider: currentProvider,
              id: serviceId,
              name: serviceName,
              rate: rate,
              min: min,
              max: max,
              nameLower: serviceName.toLowerCase()
            });
            i += 1;
            continue;
          }
        }

        const priceMatch = priceLine.match(/\$([0-9.,]+)/);
        if (priceMatch) {
          rate = parseFloat(priceMatch[1].replace(/,/g, ''));

          const minMaxMatch = priceLine.match(/(\d[\d\s,]*)\t(\d[\d\s,]*)/);
          if (minMaxMatch) {
            min = parseInt(minMaxMatch[1].replace(/[\s,]/g, '')) || 10;
            max = parseInt(minMaxMatch[2].replace(/[\s,]/g, '')) || 1000000;
          }
        }

        // Min/Max 검증
        if (min > max) [min, max] = [max, min];
        if (max > 100000000) max = 100000000;
        if (min < 1) min = 1;

        if (rate > 0) {
          services.push({
            provider: currentProvider,
            id: serviceId,
            name: nextLine,
            rate: rate,
            min: min,
            max: max,
            nameLower: nextLine.toLowerCase()
          });
          i += 2;
        }
      }
    }
  }

  return services;
}

// 플랫폼 매칭 함수
function matchesPlatform(serviceName, platform) {
  const name = serviceName.toLowerCase();
  const platforms = platform.split('|');

  for (const p of platforms) {
    if (p === 'instagram' && (name.includes('instagram') || name.includes('ig ') || name.includes('insta '))) return true;
    if (p === 'youtube' && (name.includes('youtube') || name.includes('yt '))) return true;
    if (p === 'facebook' && (name.includes('facebook') || name.includes('fb '))) return true;
    if (p === 'tiktok' && name.includes('tiktok')) return true;
    if (p === 'twitter' && (name.includes('twitter') || name.includes('x.com') || name.includes('( x )') || name.includes('/x/'))) return true;
    if (p === 'telegram' && name.includes('telegram')) return true;
    if (p === 'discord' && name.includes('discord')) return true;
    if (p === 'threads' && name.includes('thread')) return true;
    if (p === 'spotify' && name.includes('spotify')) return true;
    if (p === 'soundcloud' && name.includes('soundcloud')) return true;
  }
  return false;
}

// 키워드 매칭 함수
function hasKeyword(name, keywords) {
  const nameLower = name.toLowerCase();
  return keywords.some(kw => nameLower.includes(kw.toLowerCase()));
}

// 서비스 매칭 함수 (개선된 버전)
function findCandidates(services, category) {
  let matches = services.filter(s => {
    // 1. 플랫폼 확인
    if (!matchesPlatform(s.name, category.platform)) return false;

    // 2. 제외 키워드 확인
    if (category.exclude && hasKeyword(s.name, category.exclude)) return false;

    // 3. 타입 키워드 확인 (필수)
    if (category.typeKeywords && category.typeKeywords.length > 0) {
      if (!hasKeyword(s.name, category.typeKeywords)) return false;
    }

    // 4. 필수 키워드 확인 (mustHave가 있으면 반드시 매칭되어야 함)
    if (category.mustHave && category.mustHave.length > 0) {
      if (!hasKeyword(s.name, category.mustHave)) {
        return false; // 필수 키워드가 없으면 제외
      }
    }

    return true;
  });

  // 가격 기준 정렬
  matches.sort((a, b) => a.rate - b.rate);

  return matches;
}

// 메인 로직
function main() {
  console.log('📂 소스 파일 파싱 중...');
  const services = parseSourceFile(SOURCE_FILE);
  console.log(`\n✅ ${services.length}개 서비스 파싱 완료`);

  // 공급자별 서비스 수 출력
  const providerCounts = {};
  services.forEach(s => {
    providerCounts[s.provider] = (providerCounts[s.provider] || 0) + 1;
  });
  console.log('\n📊 공급자별 서비스 수:');
  Object.entries(providerCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([p, c]) => console.log(`  ${p}: ${c}개`));

  // 매핑 수행
  console.log('\n🔄 서비스 매핑 시작...');

  const mappings = [];

  for (const category of targetCategories) {
    const candidates = findCandidates(services, category);

    // Rank 1: 최저가
    const rank1 = candidates[0] || null;

    // Rank 2: 품질/속도 (Instant, Fast, HQ, Real 키워드)
    let rank2 = candidates.find(s =>
      s !== rank1 &&
      hasKeyword(s.name, ['instant', 'fast', 'speed', 'hq', 'real', 'active', 'quality', '🔥', 'recommended'])
    ) || candidates[1] || null;

    // Rank 3: 다른 공급자 (Failover)
    let rank3 = null;
    const usedProviders = new Set();
    if (rank1) usedProviders.add(rank1.provider);
    if (rank2) usedProviders.add(rank2.provider);

    rank3 = candidates.find(s =>
      s !== rank1 && s !== rank2 && !usedProviders.has(s.provider)
    );

    if (!rank3) {
      rank3 = candidates.find(s => s !== rank1 && s !== rank2);
    }

    const mapping = {
      target_id: category.id,
      target_name: category.name,
      platform: category.platform,
      type: category.type,
      total_candidates: candidates.length,
      candidates: []
    };

    if (rank1) {
      mapping.candidates.push({
        rank: 1,
        provider: rank1.provider,
        service_id: rank1.id,
        service_name: rank1.name,
        rate: rank1.rate,
        min: rank1.min,
        max: rank1.max,
        note: 'Lowest price'
      });
    }

    if (rank2 && rank2 !== rank1) {
      mapping.candidates.push({
        rank: 2,
        provider: rank2.provider,
        service_id: rank2.id,
        service_name: rank2.name,
        rate: rank2.rate,
        min: rank2.min,
        max: rank2.max,
        note: 'Quality/Speed'
      });
    }

    if (rank3) {
      mapping.candidates.push({
        rank: 3,
        provider: rank3.provider,
        service_id: rank3.id,
        service_name: rank3.name,
        rate: rank3.rate,
        min: rank3.min,
        max: rank3.max,
        note: rank3.provider !== rank1?.provider ? 'Different provider backup' : 'Same provider backup'
      });
    }

    mappings.push(mapping);

    // 진행 상황 출력
    const status = mapping.candidates.length === 3 ? '✅' : mapping.candidates.length > 0 ? '⚠️' : '❌';
    console.log(`${status} [${category.id}] ${category.name}: ${mapping.candidates.length}개 선택 (${candidates.length}개 후보)`);
  }

  // 결과 저장
  const result = {
    generated_at: new Date().toISOString(),
    total_services: services.length,
    providers: providerCounts,
    mappings
  };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n📁 결과 저장: ${OUTPUT_FILE}`);

  // 요약
  const fullMatch = mappings.filter(m => m.candidates.length === 3).length;
  const partialMatch = mappings.filter(m => m.candidates.length > 0 && m.candidates.length < 3).length;
  const noMatch = mappings.filter(m => m.candidates.length === 0).length;

  console.log('\n📊 매핑 결과 요약:');
  console.log(`  ✅ 완전 매칭 (3개): ${fullMatch}개`);
  console.log(`  ⚠️ 부분 매칭 (1-2개): ${partialMatch}개`);
  console.log(`  ❌ 매칭 없음: ${noMatch}개`);

  // 매칭 없는 카테고리 출력
  const noMatchCategories = mappings.filter(m => m.candidates.length === 0);
  if (noMatchCategories.length > 0) {
    console.log('\n❌ 매칭 없는 카테고리:');
    noMatchCategories.forEach(m => console.log(`  - ${m.target_name}`));
  }

  // 부분 매칭 카테고리 출력
  const partialCategories = mappings.filter(m => m.candidates.length > 0 && m.candidates.length < 3);
  if (partialCategories.length > 0) {
    console.log('\n⚠️ 부분 매칭 카테고리:');
    partialCategories.forEach(m => console.log(`  - ${m.target_name}: ${m.candidates.length}개`));
  }
}

main();
