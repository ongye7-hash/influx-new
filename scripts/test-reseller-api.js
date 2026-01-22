// 리셀러 API 테스트 스크립트
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// .env.local 파일 직접 읽기
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) envVars[key.trim()] = values.join('=').trim();
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

// API 호출 함수
function callAPI(action, params = {}, apiKey) {
  return new Promise((resolve, reject) => {
    const formData = new URLSearchParams();
    formData.append('key', apiKey);
    formData.append('action', action);
    Object.entries(params).forEach(([k, v]) => formData.append(k, v));

    const postData = formData.toString();

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v2',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 리셀러 API 테스트 시작\n');
  console.log('='.repeat(50));

  // 1. 테스트용 API 키 생성
  console.log('\n1️⃣ 테스트용 API 키 생성...');

  // 관리자 계정 찾기
  const { data: adminUser, error: adminErr } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('is_admin', true)
    .limit(1)
    .single();

  if (adminErr || !adminUser) {
    console.log('❌ 관리자 계정을 찾을 수 없습니다');

    // 일반 사용자로 시도
    const { data: anyUser } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1)
      .single();

    if (!anyUser) {
      console.log('❌ 테스트할 사용자가 없습니다');
      return;
    }

    console.log(`   사용자: ${anyUser.email}`);
    var testUserId = anyUser.id;
  } else {
    console.log(`   관리자: ${adminUser.email}`);
    var testUserId = adminUser.id;
  }

  // 기존 테스트 API 키 삭제
  await supabase.from('api_keys').delete().eq('name', 'TEST_API_KEY');

  // 새 API 키 생성
  const testApiKey = require('crypto').randomBytes(16).toString('hex');
  const { data: newKey, error: keyErr } = await supabase
    .from('api_keys')
    .insert({
      user_id: testUserId,
      api_key: testApiKey,
      name: 'TEST_API_KEY',
      is_active: true
    })
    .select()
    .single();

  if (keyErr) {
    console.log('❌ API 키 생성 실패:', keyErr.message);
    return;
  }

  console.log(`   ✅ API 키 생성됨: ${testApiKey.substring(0, 8)}...`);

  // 2. 잘못된 API 키 테스트
  console.log('\n2️⃣ 잘못된 API 키 테스트...');
  try {
    const invalidResult = await callAPI('balance', {}, 'invalid_key');
    console.log(`   상태: ${invalidResult.status}`);
    console.log(`   응답: ${JSON.stringify(invalidResult.data)}`);
    if (invalidResult.data.error === 'Invalid API key') {
      console.log('   ✅ 잘못된 키 거부됨');
    }
  } catch (e) {
    console.log('   ⚠️ 서버 연결 실패 (개발 서버가 실행 중이어야 합니다)');
    console.log('   npm run dev 실행 후 다시 테스트해주세요');

    // API 키 정리
    await supabase.from('api_keys').delete().eq('name', 'TEST_API_KEY');
    return;
  }

  // 3. 서비스 목록 테스트
  console.log('\n3️⃣ 서비스 목록 조회 테스트...');
  const servicesResult = await callAPI('services', {}, testApiKey);
  console.log(`   상태: ${servicesResult.status}`);
  if (Array.isArray(servicesResult.data)) {
    console.log(`   ✅ 서비스 ${servicesResult.data.length}개 조회됨`);
    if (servicesResult.data.length > 0) {
      console.log(`   첫 번째 서비스: ${servicesResult.data[0].name}`);
    }
  } else {
    console.log(`   응답: ${JSON.stringify(servicesResult.data)}`);
  }

  // 4. 잔액 조회 테스트
  console.log('\n4️⃣ 잔액 조회 테스트...');
  const balanceResult = await callAPI('balance', {}, testApiKey);
  console.log(`   상태: ${balanceResult.status}`);
  console.log(`   ✅ 잔액: ${balanceResult.data.balance} ${balanceResult.data.currency}`);

  // 5. API 사용량 확인
  console.log('\n5️⃣ API 사용량 확인...');
  const { data: keyStats } = await supabase
    .from('api_keys')
    .select('total_requests, last_used_at')
    .eq('api_key', testApiKey)
    .single();

  console.log(`   총 요청 수: ${keyStats?.total_requests || 0}`);
  console.log(`   마지막 사용: ${keyStats?.last_used_at || '없음'}`);

  // 6. 요청 로그 확인
  console.log('\n6️⃣ 요청 로그 확인...');
  const { data: logs, error: logsErr } = await supabase
    .from('api_request_logs')
    .select('action, status_code, execution_time_ms, created_at')
    .eq('user_id', testUserId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (logs && logs.length > 0) {
    console.log(`   ✅ 최근 로그 ${logs.length}개:`);
    logs.forEach(log => {
      console.log(`      - ${log.action}: ${log.status_code} (${log.execution_time_ms}ms)`);
    });
  } else {
    console.log('   로그 없음 (또는 조회 오류)');
  }

  // 정리
  console.log('\n🧹 테스트 API 키 정리...');
  await supabase.from('api_keys').delete().eq('name', 'TEST_API_KEY');
  console.log('   ✅ 정리 완료');

  console.log('\n' + '='.repeat(50));
  console.log('✅ 리셀러 API 테스트 완료!');
  console.log('\n📋 테스트용 API 키 (삭제됨): ' + testApiKey);
}

runTests().catch(console.error);
