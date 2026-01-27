// scraped-descriptions.json을 DB에 저장
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

// Description 정제 함수
function cleanDescription(desc) {
  if (!desc) return null;

  // 페이지 헤더 패턴 제거
  const headerPatterns = [
    /YtResellers\n/g,
    /Log in\n/g,
    /Services\n/g,
    /API\n/g,
    /Terms\n/g,
    /Sign up\n/g,
    /USD \$ \n/g,
    /All\n/g,
    /Instagram\n/g,
    /TikTok\n/g,
    /YouTube\n/g,
    /Facebook\n/g,
    /Twitter\n/g,
    /Telegram\n/g,
    /LinkedIn\n/g,
    /Kick\n/g,
    /Twitch\n/g,
    /WhatsApp\n/g,
    /Other\n/g,
    /ID\tService\tRate per 1000\tMin order\tMax order\t\nAverage time\n\tDescription\n\n/g,
    /\d+\t[^\n]+\t\$[\d.]+\t[\d,\s]+\t[\d,\s]+\t[^\n]*\t\nView\n/g
  ];

  let cleaned = desc;
  for (const pattern of headerPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  // "✅ Example" 시작점 찾기
  const startPatterns = ['✅ Example', '- Example Link', '- Link:'];
  for (const p of startPatterns) {
    const idx = cleaned.indexOf(p);
    if (idx > 0) {
      cleaned = cleaned.substring(idx);
      break;
    }
  }

  return cleaned.trim();
}

async function saveDescriptionsToDb() {
  console.log('🚀 Description DB 저장 시작\n');

  // 스크래핑 결과 로드
  const resultsFile = path.join(__dirname, 'scraped-descriptions.json');
  if (!fs.existsSync(resultsFile)) {
    console.error('스크래핑 결과 파일이 없습니다:', resultsFile);
    return;
  }

  const results = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
  const serviceIds = Object.keys(results);
  console.log('스크래핑된 서비스 수:', serviceIds.length);

  // DB에서 서비스 목록 가져오기 (페이지네이션)
  let dbServices = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('services')
      .select('id, provider_service_id, description')
      .eq('is_active', true)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('DB 에러:', error);
      return;
    }

    if (!data || data.length === 0) break;
    dbServices = dbServices.concat(data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log('DB 서비스 수:', dbServices.length);

  // provider_service_id로 맵 생성
  const dbMap = new Map();
  dbServices.forEach(s => {
    dbMap.set(s.provider_service_id, s);
  });

  // 업데이트
  let updated = 0;
  let failed = 0;
  let skipped = 0;

  for (const providerServiceId of serviceIds) {
    const dbService = dbMap.get(providerServiceId);
    if (!dbService) {
      skipped++;
      continue;
    }

    const rawDesc = results[providerServiceId];
    const cleanedDesc = cleanDescription(rawDesc);

    if (!cleanedDesc || cleanedDesc.length < 10) {
      skipped++;
      continue;
    }

    // 기존 description (metadata JSON) 파싱
    let metadata = {};
    try {
      if (dbService.description) {
        metadata = JSON.parse(dbService.description);
      }
    } catch (e) {
      metadata = {};
    }

    // provider_description 필드에 저장
    metadata.provider_description = cleanedDesc;

    const { error } = await supabase
      .from('services')
      .update({ description: JSON.stringify(metadata) })
      .eq('id', dbService.id);

    if (error) {
      failed++;
      if (failed <= 5) console.log('에러:', providerServiceId, error.message);
    } else {
      updated++;
    }

    if ((updated + failed + skipped) % 100 === 0) {
      process.stdout.write(`\r진행: ${updated + failed + skipped}/${serviceIds.length}`);
    }
  }

  console.log('\n\n✅ DB 저장 완료!');
  console.log('업데이트:', updated);
  console.log('실패:', failed);
  console.log('스킵:', skipped);

  // 샘플 확인
  const { data: sample } = await supabase
    .from('services')
    .select('provider_service_id, name, description')
    .eq('provider_service_id', '1319')
    .single();

  if (sample) {
    console.log('\n=== 샘플 확인 (1319) ===');
    console.log('name:', sample.name);
    try {
      const meta = JSON.parse(sample.description);
      console.log('provider_description:', meta.provider_description?.substring(0, 200) + '...');
    } catch (e) {
      console.log('description:', sample.description);
    }
  }
}

saveDescriptionsToDb().catch(console.error);
