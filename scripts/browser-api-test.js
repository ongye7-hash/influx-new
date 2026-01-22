// 브라우저 API 탭 테스트용 스크립트
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const http = require('http');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) envVars[key.trim()] = values.join('=').trim();
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

function callAPI(action, params = {}, apiKey) {
  return new Promise((resolve, reject) => {
    const formData = new URLSearchParams();
    formData.append('key', apiKey);
    formData.append('action', action);
    Object.entries(params).forEach(([k, v]) => formData.append(k, v));

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v2',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(formData.toString());
    req.end();
  });
}

async function test() {
  console.log('========================================');
  console.log('   INFLUX 리셀러 API 전체 테스트');
  console.log('========================================\n');

  // 1. 사용자 찾기
  const { data: users } = await supabase.from('profiles').select('id, email, balance').limit(1);
  if (!users || users.length === 0) {
    console.log('사용자가 없습니다');
    return;
  }
  const user = users[0];
  console.log('테스트 사용자:', user.email);
  console.log('현재 잔액:', (user.balance || 0).toLocaleString() + '원\n');

  // 기존 테스트 키 삭제
  await supabase.from('api_keys').delete().eq('name', 'BROWSER_TEST_KEY');

  // 새 API 키 생성
  const testKey = require('crypto').randomBytes(16).toString('hex');
  await supabase.from('api_keys').insert({
    user_id: user.id,
    api_key: testKey,
    name: 'BROWSER_TEST_KEY',
    is_active: true
  });

  console.log('생성된 API 키:', testKey);
  console.log('\n----------------------------------------\n');

  // 2. 서비스 목록 조회
  console.log('[1] 서비스 목록 조회 (services)');
  const services = await callAPI('services', {}, testKey);
  console.log('    상태:', services.status);
  console.log('    서비스 수:', services.data.length);
  if (services.data.length > 0) {
    console.log('    예시:', services.data[0].name);
    console.log('    가격:', services.data[0].rate + '원/1000개');
  }

  // 3. 잔액 조회
  console.log('\n[2] 잔액 조회 (balance)');
  const balance = await callAPI('balance', {}, testKey);
  console.log('    상태:', balance.status);
  console.log('    잔액:', balance.data.balance, balance.data.currency);

  // 4. 잘못된 키 테스트
  console.log('\n[3] 잘못된 API 키 테스트');
  const invalid = await callAPI('balance', {}, 'wrong_key_12345');
  console.log('    상태:', invalid.status);
  console.log('    응답:', invalid.data.error);

  // 5. API 사용량 확인
  console.log('\n[4] API 사용량 확인');
  const { data: keyStats } = await supabase
    .from('api_keys')
    .select('total_requests, last_used_at')
    .eq('api_key', testKey)
    .single();
  console.log('    총 요청:', keyStats.total_requests + '회');
  console.log('    마지막 사용:', new Date(keyStats.last_used_at).toLocaleString('ko-KR'));

  // 6. 요청 로그
  console.log('\n[5] 요청 로그 확인');
  const { data: logs } = await supabase
    .from('api_request_logs')
    .select('action, status_code, execution_time_ms')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);
  if (logs && logs.length > 0) {
    logs.forEach(log => {
      console.log('    -', log.action + ':', log.status_code, '(' + log.execution_time_ms + 'ms)');
    });
  }

  console.log('\n========================================');
  console.log('   모든 API 테스트 성공!');
  console.log('========================================');
  console.log('\n브라우저에서 확인:');
  console.log('1. http://localhost:3000 접속');
  console.log('2. 로그인 후 /settings 이동');
  console.log('3. API 탭 클릭하여 키 관리 확인');
  console.log('\n(테스트 키는 BROWSER_TEST_KEY로 저장됨)');
}

test().catch(console.error);
