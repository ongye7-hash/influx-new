// YTResellers 원본 name을 description에 저장
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

async function updateDescriptions() {
  console.log('🚀 YTResellers 원본 name을 description에 저장\n');

  // YTResellers 데이터 로드
  const ytDataPath = path.join(__dirname, 'ytresellers_full.json');
  const ytServices = JSON.parse(fs.readFileSync(ytDataPath, 'utf-8'));
  console.log('YTResellers 서비스 수:', ytServices.length);

  // service ID로 맵 생성
  const ytMap = new Map();
  ytServices.forEach(s => {
    ytMap.set(String(s.service), s.name);
  });

  // DB에서 우리 서비스 가져오기
  const { data: dbServices, error } = await supabase
    .from('services')
    .select('id, provider_service_id, name, description')
    .eq('is_active', true);

  if (error) {
    console.error('DB 조회 에러:', error);
    return;
  }

  console.log('DB 서비스 수:', dbServices.length);

  // 업데이트할 서비스들
  const updates = [];
  let matched = 0;
  let notMatched = 0;

  for (const svc of dbServices) {
    const ytName = ytMap.get(svc.provider_service_id);
    if (ytName) {
      matched++;
      // description 컬럼에 원본 영문 name 저장
      updates.push({
        id: svc.id,
        original_description: ytName
      });
    } else {
      notMatched++;
    }
  }

  console.log('\n매칭된 서비스:', matched);
  console.log('매칭 안 된 서비스:', notMatched);

  // 배치 업데이트
  console.log('\n📝 업데이트 중...');
  let success = 0;
  let failed = 0;

  for (let i = 0; i < updates.length; i += 100) {
    const batch = updates.slice(i, i + 100);

    for (const item of batch) {
      // description 컬럼에 metadata JSON으로 저장
      const { data: current } = await supabase
        .from('services')
        .select('description')
        .eq('id', item.id)
        .single();

      let metadata = {};
      try {
        if (current?.description) {
          metadata = JSON.parse(current.description);
        }
      } catch (e) {
        metadata = {};
      }

      // original_description 필드 추가
      metadata.original_description = item.original_description;

      const { error: updateError } = await supabase
        .from('services')
        .update({ description: JSON.stringify(metadata) })
        .eq('id', item.id);

      if (updateError) {
        failed++;
        if (failed <= 5) console.log('에러:', item.id, updateError.message);
      } else {
        success++;
      }
    }

    process.stdout.write(`\r진행: ${Math.min(i + 100, updates.length)}/${updates.length}`);
  }

  console.log('\n\n✅ 완료!');
  console.log('성공:', success);
  console.log('실패:', failed);

  // 샘플 확인
  const { data: sample } = await supabase
    .from('services')
    .select('provider_service_id, name, description')
    .eq('provider_service_id', '4127')
    .single();

  if (sample) {
    console.log('\n=== 샘플 확인 (4127) ===');
    console.log('name:', sample.name);
    try {
      const meta = JSON.parse(sample.description);
      console.log('original_description:', meta.original_description);
    } catch (e) {
      console.log('description:', sample.description);
    }
  }
}

updateDescriptions().catch(console.error);
