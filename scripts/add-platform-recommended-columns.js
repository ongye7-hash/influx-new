/**
 * services 테이블에 platform, is_recommended 컬럼 추가
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
  console.log('🔧 services 테이블 컬럼 추가\n');

  // 1. 컬럼 추가 시도 (이미 있으면 무시)
  console.log('1. platform, is_recommended 컬럼 추가...');

  // Supabase JS 클라이언트로는 직접 ALTER TABLE 실행 불가
  // 대신 RPC 호출이나 대시보드에서 수동으로 추가해야 함

  // 먼저 현재 테이블 구조 확인
  const { data: sample, error: sampleError } = await supabase
    .from('services')
    .select('*')
    .limit(1);

  if (sampleError) {
    console.error('에러:', sampleError.message);
    return;
  }

  console.log('현재 services 테이블 컬럼:', Object.keys(sample[0] || {}));

  // platform 컬럼 존재 여부 확인
  const hasplatform = sample[0] && 'platform' in sample[0];
  const hasRecommended = sample[0] && 'is_recommended' in sample[0];

  console.log('\nplatform 컬럼 존재:', hasplatform);
  console.log('is_recommended 컬럼 존재:', hasRecommended);

  if (!hasplatform || !hasRecommended) {
    console.log('\n⚠️ 누락된 컬럼이 있습니다.');
    console.log('\nSupabase 대시보드에서 다음 SQL을 실행해주세요:\n');

    if (!hasplatform) {
      console.log(`ALTER TABLE services ADD COLUMN IF NOT EXISTS platform TEXT;`);
    }
    if (!hasRecommended) {
      console.log(`ALTER TABLE services ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT false;`);
    }

    console.log('\n또는 아래 전체 SQL:');
    console.log(`
-- platform과 is_recommended 컬럼 추가
ALTER TABLE services ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT false;

-- 인덱스 추가 (선택사항)
CREATE INDEX IF NOT EXISTS idx_services_platform ON services(platform);
CREATE INDEX IF NOT EXISTS idx_services_is_recommended ON services(is_recommended);
`);
    return;
  }

  // 컬럼이 이미 있으면 플랫폼 데이터 업데이트
  console.log('\n2. 플랫폼 데이터 업데이트...');

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

  let updated = 0;
  for (const service of allServices) {
    if (service.platform) continue;

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
      await supabase
        .from('services')
        .update({ platform })
        .eq('id', service.id);
      updated++;
    }
  }

  console.log('플랫폼 업데이트:', updated);
}

main().catch(console.error);
