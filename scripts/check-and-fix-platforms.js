/**
 * 플랫폼 필드 확인 및 수정 스크립트
 * - description JSON에서 platform 추출하여 services.platform 필드 업데이트
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local 로드
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) envVars[key.trim()] = values.join('=').trim();
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

// 서비스명에서 플랫폼 감지
function detectPlatform(name) {
  const lower = name.toLowerCase();

  if (lower.includes('instagram') || lower.includes('인스타')) return 'Instagram';
  if (lower.includes('youtube') || lower.includes('유튜브')) return 'YouTube';
  if (lower.includes('tiktok') || lower.includes('틱톡')) return 'TikTok';
  if (lower.includes('facebook') || lower.includes('페이스북')) return 'Facebook';
  if (lower.includes('twitter') || lower.includes('트위터') || lower.includes(' x ')) return 'Twitter';
  if (lower.includes('telegram') || lower.includes('텔레그램')) return 'Telegram';
  if (lower.includes('twitch') || lower.includes('트위치')) return 'Twitch';
  if (lower.includes('discord') || lower.includes('디스코드')) return 'Discord';
  if (lower.includes('spotify') || lower.includes('스포티파이')) return 'Spotify';
  if (lower.includes('linkedin') || lower.includes('링크드인')) return 'LinkedIn';
  if (lower.includes('pinterest') || lower.includes('핀터레스트')) return 'Pinterest';
  if (lower.includes('soundcloud') || lower.includes('사운드클라우드')) return 'SoundCloud';
  if (lower.includes('threads') || lower.includes('쓰레드')) return 'Threads';
  if (lower.includes('snapchat') || lower.includes('스냅챗')) return 'Snapchat';

  return null;
}

async function main() {
  console.log('🔍 플랫폼 필드 확인 및 수정\n');

  // 모든 서비스 조회
  let allServices = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, platform, description')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('조회 에러:', error.message);
      return;
    }

    if (!data || data.length === 0) break;
    allServices = allServices.concat(data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log('총 서비스 수:', allServices.length);

  // 플랫폼 현황
  const platformCounts = {};
  const emptyPlatform = [];

  allServices.forEach(s => {
    if (s.platform) {
      platformCounts[s.platform] = (platformCounts[s.platform] || 0) + 1;
    } else {
      emptyPlatform.push(s);
    }
  });

  console.log('\n현재 플랫폼 분포:');
  Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([platform, count]) => {
      console.log(`  ${platform}: ${count}개`);
    });

  console.log(`\n플랫폼 없음: ${emptyPlatform.length}개`);

  if (emptyPlatform.length === 0 && Object.keys(platformCounts).length > 0) {
    console.log('\n모든 서비스에 플랫폼이 설정되어 있습니다.');
    return;
  }

  // 플랫폼 업데이트
  console.log('\n=== 플랫폼 업데이트 시작 ===');

  let updated = 0;
  let skipped = 0;

  for (const service of allServices) {
    // 이미 플랫폼이 있으면 스킵
    if (service.platform) {
      skipped++;
      continue;
    }

    // description JSON에서 platform 확인
    let platform = null;
    try {
      const meta = JSON.parse(service.description);
      platform = meta.platform;
    } catch {}

    // 없으면 서비스명에서 감지
    if (!platform) {
      platform = detectPlatform(service.name);
    }

    if (platform) {
      const { error: updateError } = await supabase
        .from('services')
        .update({ platform })
        .eq('id', service.id);

      if (!updateError) {
        updated++;
      }
    }

    if (updated % 200 === 0 && updated > 0) {
      process.stdout.write(`\r진행: ${updated}개 업데이트...`);
    }
  }

  console.log(`\n\n=== 완료 ===`);
  console.log('업데이트:', updated);
  console.log('스킵 (이미 있음):', skipped);

  // 최종 확인
  const { data: finalCheck } = await supabase
    .from('services')
    .select('platform')
    .range(0, 2999);

  const finalCounts = {};
  let finalEmpty = 0;
  finalCheck?.forEach(s => {
    if (s.platform) {
      finalCounts[s.platform] = (finalCounts[s.platform] || 0) + 1;
    } else {
      finalEmpty++;
    }
  });

  console.log('\n=== 최종 플랫폼 분포 ===');
  Object.entries(finalCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([platform, count]) => {
      console.log(`  ${platform}: ${count}개`);
    });
  console.log(`  (비어있음): ${finalEmpty}개`);
}

main().catch(console.error);
