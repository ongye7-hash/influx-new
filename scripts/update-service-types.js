// 서비스 타입 및 서브카테고리 업데이트 스크립트
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

// YTResellers 서비스 로드
const ytServices = JSON.parse(fs.readFileSync(path.join(__dirname, 'ytresellers_services.json'), 'utf8'));

// 서비스 ID -> YTResellers 데이터 매핑
const ytServiceMap = {};
ytServices.forEach(s => {
  ytServiceMap[s.service] = s;
});

// 입력 타입 매핑
const INPUT_TYPE_MAP = {
  'Default': 'link',
  'Custom Comments': 'link_comments',
  'Comment Likes': 'link',
  'Mentions Hashtag': 'link_hashtags',
  'Mentions': 'link_usernames',
  'Package': 'link',
  'SEO': 'link_keywords',
  'Mentions with Hashtags': 'link_usernames_hashtags',
  'Mentions User Followers': 'link_usernames',
  'Mentions Custom List': 'link_usernames',
  'Mentions Media Likers': 'link_usernames',
  'Poll': 'link_answer'
};

// 카테고리에서 서브카테고리 추출
function extractSubcategory(category) {
  if (!category) return null;

  // 날짜 부분 제거 ([ xx.xx.xxxx ] 형태)
  let clean = category.replace(/\s*\[\s*\d{2}\.\d{2}\.\d{4}\s*\]/g, '');

  // [ Update Working ] 등 제거
  clean = clean.replace(/\s*\[\s*Update Working\s*\]/gi, '');
  clean = clean.replace(/\s*\[\s*Working\s*\]/gi, '');

  // Provider → 형태 처리
  clean = clean.replace(/Provider\s*→\s*/gi, '');

  // 앞뒤 공백 및 [ ] 정리
  clean = clean.replace(/\s*\[\s*/g, ' [').replace(/\s*\]\s*/g, '] ');
  clean = clean.trim();

  return clean || null;
}

async function updateServices() {
  console.log('🚀 서비스 타입 및 서브카테고리 업데이트 시작\n');

  // 1. 현재 서비스 조회
  const { data: services, error } = await supabase
    .from('services')
    .select('id, provider_service_id, name, type')
    .order('id');

  if (error) {
    console.error('서비스 조회 에러:', error.message);
    return;
  }

  console.log('총 서비스 수:', services.length);

  let updated = 0;
  let notFound = 0;

  // 2. 서비스별 업데이트
  for (const service of services) {
    const ytData = ytServiceMap[service.provider_service_id];

    if (!ytData) {
      notFound++;
      continue;
    }

    const inputType = INPUT_TYPE_MAP[ytData.type] || 'link';
    const subcategory = extractSubcategory(ytData.category);

    // 업데이트 - description 필드에 JSON으로 저장
    const metadata = JSON.stringify({
      input_type: inputType,
      subcategory: subcategory,
      original_type: ytData.type
    });

    const { error: updateError } = await supabase
      .from('services')
      .update({
        description: metadata
      })
      .eq('id', service.id);

    if (updateError) {
      console.error('업데이트 에러:', service.id, updateError.message);
    } else {
      updated++;
    }

    // 진행 상황 출력
    if (updated % 100 === 0) {
      console.log(`진행: ${updated}/${services.length}`);
    }
  }

  console.log('\n=== 완료 ===');
  console.log('업데이트됨:', updated);
  console.log('YTResellers 매핑 없음:', notFound);

  // 3. 타입별 통계
  console.log('\n=== 타입별 서비스 수 ===');
  const { data: stats } = await supabase
    .from('services')
    .select('type');

  const typeCounts = {};
  stats?.forEach(s => {
    typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
  });

  Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}개`);
  });
}

updateServices().catch(console.error);
