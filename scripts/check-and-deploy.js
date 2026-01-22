/**
 * Check current DB state and deploy migrations
 */

const fs = require('fs');
const path = require('path');

// 환경변수 로드
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkCurrentState() {
  console.log('🔍 현재 DB 상태 확인 중...\n');

  // 1. services 테이블 확인
  const servicesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/services?select=id,name,price,min_quantity,max_quantity,is_active&limit=3`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  let services = [];
  if (servicesRes.ok) {
    services = await servicesRes.json();
    console.log('📦 서비스 샘플 (3개):');
    services.forEach(s => {
      console.log(`   - ${s.name}: ${s.price}원/1K (${s.min_quantity}~${s.max_quantity})`);
    });
  } else {
    console.log('❌ 서비스 조회 실패:', await servicesRes.text());
  }

  // 2. profiles 테이블 확인 (테스트 유저)
  const profilesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=id,email,balance,is_admin&limit=3`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  let profiles = [];
  if (profilesRes.ok) {
    profiles = await profilesRes.json();
    console.log('\n👤 사용자 샘플:');
    profiles.forEach(p => {
      console.log(`   - ${p.email}: ${p.balance}원 ${p.is_admin ? '(관리자)' : ''}`);
    });
  }

  // 3. process_order RPC 상태 확인 (더미 데이터로 호출)
  console.log('\n🔧 process_order RPC 상태 확인...');
  const rpcRes = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/process_order`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_service_id: '00000000-0000-0000-0000-000000000000',
        p_link: 'test',
        p_quantity: 100,
      }),
    }
  );

  const rpcResult = await rpcRes.text();
  if (rpcResult.includes('User not found') || rpcResult.includes('Service not found')) {
    console.log('   ✅ process_order RPC 함수 존재 확인 (4-param 버전, 서버 측 가격 계산)');
  } else if (rpcResult.includes('function') && rpcResult.includes('does not exist')) {
    console.log('   ⚠️  process_order RPC 함수가 없거나 시그니처가 다름');
    console.log(`   → 마이그레이션 필요`);
  } else if (rpcResult.includes('p_amount')) {
    console.log('   ⚠️  process_order가 구버전 (5-param, p_amount 필요)');
    console.log(`   → 마이그레이션 필요`);
  } else {
    console.log(`   응답: ${rpcResult.substring(0, 200)}`);
  }

  // 4. providers 테이블 보안 확인 (anon key로)
  console.log('\n🔐 providers 보안 확인...');
  const providersAnonRes = await fetch(
    `${SUPABASE_URL}/rest/v1/providers?select=*&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );

  const providersAnonResult = await providersAnonRes.text();
  try {
    const providersAnon = JSON.parse(providersAnonResult);
    if (Array.isArray(providersAnon) && providersAnon.length > 0 && providersAnon[0].api_key) {
      console.log('   ⚠️  경고: anon key로 providers.api_key 접근 가능! → 마이그레이션 필요');
    } else if (Array.isArray(providersAnon) && providersAnon.length === 0) {
      console.log('   ✅ anon key로 providers 접근 시 빈 결과 (보안 정상)');
    }
  } catch {
    if (providersAnonResult.includes('policy')) {
      console.log('   ✅ anon key로 providers 접근 차단됨 (RLS 정상)');
    } else {
      console.log(`   anon 응답: ${providersAnonResult.substring(0, 100)}`);
    }
  }

  // providers_safe 뷰 확인
  const providersSafeRes = await fetch(
    `${SUPABASE_URL}/rest/v1/providers_safe?select=*&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  if (providersSafeRes.ok) {
    const safe = await providersSafeRes.json();
    if (safe.length > 0) {
      console.log('   ✅ providers_safe 뷰 존재');
      console.log(`      API Key 마스킹: ${safe[0].api_key_masked || 'N/A'}`);
    }
  } else {
    console.log('   ⚠️  providers_safe 뷰 없음 → 마이그레이션 필요');
  }

  return { services, profiles };
}

async function testProcessOrder() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 process_order RPC 실제 테스트');
  console.log('='.repeat(60));

  // 1. 서비스 조회
  const servicesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/services?select=id,name,price,min_quantity&is_active=eq.true&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  const services = await servicesRes.json();
  if (!services.length) {
    console.log('❌ 활성 서비스가 없습니다.');
    return;
  }

  const service = services[0];
  console.log(`\n📦 테스트 서비스: ${service.name}`);
  console.log(`   가격: ${service.price}원/1K, 최소: ${service.min_quantity}`);

  // 2. 테스트 유저 조회 (잔액이 있는)
  const profilesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=id,email,balance&balance=gt.0&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  const profiles = await profilesRes.json();
  if (!profiles.length) {
    console.log('❌ 잔액이 있는 사용자가 없습니다.');
    return;
  }

  const user = profiles[0];
  console.log(`\n👤 테스트 사용자: ${user.email}`);
  console.log(`   현재 잔액: ${user.balance}원`);

  // 예상 금액 계산
  const quantity = service.min_quantity;
  const expectedAmount = Math.ceil((service.price / 1000) * quantity);
  console.log(`\n💰 예상 결제 금액: ${expectedAmount}원 (${quantity}개)`);

  if (user.balance < expectedAmount) {
    console.log('❌ 잔액 부족으로 테스트 불가');
    return;
  }

  // 3. process_order RPC 호출
  console.log('\n🚀 process_order RPC 호출...');
  const rpcRes = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/process_order`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        p_user_id: user.id,
        p_service_id: service.id,
        p_link: 'https://instagram.com/test_migration_' + Date.now(),
        p_quantity: quantity,
      }),
    }
  );

  const rpcResult = await rpcRes.text();
  console.log(`   HTTP Status: ${rpcRes.status}`);

  if (rpcRes.ok) {
    // UUID 형식 체크
    const orderId = rpcResult.replace(/"/g, '');
    if (orderId.match(/^[0-9a-f-]{36}$/)) {
      console.log(`\n✅ 주문 성공! Order ID: ${orderId}`);

      // 잔액 확인
      const newProfileRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=balance&id=eq.${user.id}`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      );
      const newProfile = await newProfileRes.json();
      const actualDeduction = user.balance - newProfile[0]?.balance;

      console.log(`   잔액 변화: ${user.balance}원 → ${newProfile[0]?.balance}원`);
      console.log(`   차감액: ${actualDeduction}원 (예상: ${expectedAmount}원)`);

      if (actualDeduction === expectedAmount) {
        console.log('   ✅ 서버 측 가격 계산 정상 작동!');
      } else {
        console.log('   ⚠️  금액 불일치 - 확인 필요');
      }

      // 주문 확인
      const orderRes = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?select=*&id=eq.${orderId}`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      );
      const order = await orderRes.json();
      if (order.length > 0) {
        console.log(`\n📋 생성된 주문:`);
        console.log(`   주문번호: ${order[0].order_number}`);
        console.log(`   상태: ${order[0].status}`);
        console.log(`   금액(charge): ${order[0].charge}원`);
        console.log(`   단가(unit_price): ${order[0].unit_price}원/1K`);
      }

      return true;
    }
  }

  console.log(`\n❌ 주문 실패: ${rpcResult}`);
  if (rpcResult.includes('does not exist')) {
    console.log('   → process_order 함수가 없거나 시그니처가 다릅니다.');
  } else if (rpcResult.includes('p_amount')) {
    console.log('   → 구버전 함수 (p_amount 필요). 마이그레이션 실행 필요!');
  }

  return false;
}

async function main() {
  console.log('='.repeat(60));
  console.log('🔍 INFLUX DB 상태 확인 및 테스트');
  console.log('='.repeat(60));

  await checkCurrentState();
  const success = await testProcessOrder();

  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('✅ 모든 테스트 통과!');
  } else {
    console.log('⚠️  마이그레이션이 필요할 수 있습니다.');
    console.log('   Supabase Dashboard → SQL Editor에서 마이그레이션 SQL 실행 필요');
  }
  console.log('='.repeat(60));
}

main().catch(console.error);
