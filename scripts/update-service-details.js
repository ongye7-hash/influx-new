/**
 * 서비스 상세 정보 메타데이터 업데이트
 * - 취소 가능 여부, 리필, 속도 등 구조화된 정보 추가
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

// YTResellers 원본 데이터 로드
const ytServices = JSON.parse(fs.readFileSync(path.join(__dirname, 'ytresellers_full.json'), 'utf8'));
const ytMap = {};
ytServices.forEach(s => {
  ytMap[String(s.service)] = s;
});

console.log('YTResellers 서비스 수:', Object.keys(ytMap).length);

// 원본 설명에서 속도 파싱
function parseSpeed(name) {
  // Day 50K, Day 10K, Speed 100/Day 등
  const dayMatch = name.match(/Day\s*(\d+[KkMm]?)/i);
  if (dayMatch) {
    return dayMatch[1].toUpperCase() + '/일';
  }

  const speedMatch = name.match(/Speed\s*(\d+[KkMm]?)\/?\s*Day/i);
  if (speedMatch) {
    return speedMatch[1].toUpperCase() + '/일';
  }

  const speedMatch2 = name.match(/(\d+[KkMm]?)\/Day/i);
  if (speedMatch2) {
    return speedMatch2[1].toUpperCase() + '/일';
  }

  return null;
}

// 원본 설명에서 시작 시간 파싱
function parseStartTime(name) {
  if (/instant\s*start/i.test(name) || /instant/i.test(name)) {
    return '즉시';
  }
  if (/0-1\s*hour/i.test(name)) return '0-1시간';
  if (/0-6\s*hour/i.test(name)) return '0-6시간';
  if (/0-12\s*hour/i.test(name)) return '0-12시간';
  if (/0-24\s*hour/i.test(name)) return '0-24시간';
  if (/1-24\s*hour/i.test(name)) return '1-24시간';

  return null;
}

// 원본 설명에서 드롭율 파싱
function parseDrop(name) {
  if (/drop\s*0%/i.test(name) || /no\s*drop/i.test(name) || /non\s*drop/i.test(name)) {
    return '0%';
  }
  if (/low\s*drop/i.test(name)) {
    return '낮음';
  }

  const dropMatch = name.match(/drop\s*(\d+)%/i);
  if (dropMatch) {
    return dropMatch[1] + '%';
  }

  return null;
}

// 원본 설명에서 리필 기간 파싱
function parseRefillPeriod(name, hasRefill) {
  if (!hasRefill) return null;

  if (/lifetime/i.test(name)) return '평생';
  if (/365\s*day/i.test(name)) return '365일';
  if (/180\s*day/i.test(name)) return '180일';
  if (/90\s*day/i.test(name)) return '90일';
  if (/60\s*day/i.test(name)) return '60일';
  if (/30\s*day/i.test(name)) return '30일';
  if (/15\s*day/i.test(name)) return '15일';
  if (/7\s*day/i.test(name)) return '7일';

  return '있음';
}

// 원본 설명에서 품질 파싱
function parseQuality(name) {
  if (/real\s*(user|account)/i.test(name) || /100%\s*real/i.test(name)) return '실제 사용자';
  if (/high\s*quality/i.test(name) || /\bHQ\b/i.test(name)) return '고품질';
  if (/premium/i.test(name)) return '프리미엄';
  if (/old\s*account/i.test(name)) return '오래된 계정';
  if (/active/i.test(name)) return '활성';

  return null;
}

async function main() {
  console.log('\n🔧 서비스 상세 정보 업데이트 시작\n');

  // 모든 서비스 조회
  let allServices = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('services')
      .select('id, provider_service_id, description, min_quantity, max_quantity, refill_days')
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
  let errors = 0;

  for (const service of allServices) {
    const ytData = ytMap[service.provider_service_id];

    try {
      const meta = JSON.parse(service.description);
      const originalName = ytData?.name || meta.original_description || '';

      // 상세 정보 추가
      meta.details = {
        cancel: ytData?.cancel || false,  // 취소 가능
        refill: ytData?.refill || false,  // 리필 가능
        refill_period: parseRefillPeriod(originalName, ytData?.refill || service.refill_days > 0),
        dripfeed: ytData?.dripfeed || false,  // 점진적 배송
        speed: parseSpeed(originalName),  // 일일 속도
        start_time: parseStartTime(originalName),  // 시작 시간
        drop: parseDrop(originalName),  // 드롭율
        quality: parseQuality(originalName),  // 품질
        min: service.min_quantity,
        max: service.max_quantity,
      };

      const { error: updateError } = await supabase
        .from('services')
        .update({ description: JSON.stringify(meta) })
        .eq('id', service.id);

      if (updateError) {
        errors++;
      } else {
        updated++;
      }
    } catch (e) {
      errors++;
    }

    if (updated % 500 === 0 && updated > 0) {
      console.log(`진행: ${updated}/${allServices.length}`);
    }
  }

  console.log('\n=== 완료 ===');
  console.log('업데이트:', updated);
  console.log('에러:', errors);

  // 검증 - 7479, 7480 비교
  console.log('\n=== 검증: 7479 vs 7480 ===');
  const { data: testServices } = await supabase
    .from('services')
    .select('provider_service_id, name, price, description')
    .in('provider_service_id', ['7479', '7480']);

  testServices?.forEach(s => {
    console.log('\n[' + s.provider_service_id + '] ' + s.name);
    console.log('가격: ₩' + s.price + '/1K');
    try {
      const meta = JSON.parse(s.description);
      const d = meta.details;
      console.log('취소:', d.cancel ? '✅ 가능' : '❌ 불가');
      console.log('리필:', d.refill ? '♻️ ' + (d.refill_period || '있음') : '⚠️ 없음');
      console.log('시작:', d.start_time || '-');
      console.log('속도:', d.speed || '-');
      console.log('드롭:', d.drop || '-');
      console.log('품질:', d.quality || '-');
      console.log('최소/최대:', d.min + ' ~ ' + d.max);
    } catch {}
  });

  // 통계
  console.log('\n=== 통계 ===');
  let cancelTrue = 0, cancelFalse = 0;
  let refillTrue = 0, refillFalse = 0;

  for (const service of allServices) {
    const ytData = ytMap[service.provider_service_id];
    if (ytData?.cancel) cancelTrue++; else cancelFalse++;
    if (ytData?.refill) refillTrue++; else refillFalse++;
  }

  console.log('취소 가능:', cancelTrue, '| 취소 불가:', cancelFalse);
  console.log('리필 있음:', refillTrue, '| 리필 없음:', refillFalse);
}

main().catch(console.error);
