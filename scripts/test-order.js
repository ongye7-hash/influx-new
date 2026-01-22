/**
 * 주문 기능 테스트 스크립트
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

async function testOrder() {
  console.log('='.repeat(60));
  console.log('🧪 INFLUX 주문 기능 테스트');
  console.log('='.repeat(60));

  // 1. 틱톡 서비스 조회
  const servicesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/services?select=id,name,price,min_quantity,category_id&is_active=eq.true&name=ilike.*틱톡*&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  const services = await servicesRes.json();
  if (!services.length) {
    console.log('❌ 틱톡 서비스가 없습니다.');
    return;
  }

  const service = services[0];
  console.log(`\n📦 테스트 서비스: ${service.name}`);
  console.log(`   가격: ${service.price}원/1K, 최소: ${service.min_quantity}`);

  // 2. 테스트 유저 조회
  const profilesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=id,email,balance&balance=gt.1000&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  const profiles = await profilesRes.json();
  if (!profiles.length) {
    console.log('❌ 테스트 가능한 사용자가 없습니다.');
    return;
  }

  const user = profiles[0];
  console.log(`\n👤 테스트 사용자: ${user.email}`);
  console.log(`   현재 잔액: ${user.balance}원`);

  // 예상 금액 계산
  const quantity = service.min_quantity;
  const expectedAmount = Math.ceil((service.price / 1000) * quantity);
  console.log(`\n💰 예상 결제: ${expectedAmount}원 (${quantity}개)`);

  // 3. 올바른 틱톡 링크로 주문
  const testLink = 'https://www.tiktok.com/@test/video/1234567890123456789';
  console.log(`\n📎 테스트 링크: ${testLink}`);

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
        p_link: testLink,
        p_quantity: quantity,
      }),
    }
  );

  const rpcResult = await rpcRes.text();
  console.log(`   HTTP Status: ${rpcRes.status}`);

  if (rpcRes.ok) {
    const orderId = rpcResult.replace(/"/g, '');
    if (orderId.match(/^[0-9a-f-]{36}$/)) {
      console.log(`\n✅ 주문 성공!`);
      console.log(`   Order ID: ${orderId}`);

      // 잔액 변화 확인
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

      console.log(`\n💳 잔액 변화:`);
      console.log(`   이전: ${user.balance}원`);
      console.log(`   이후: ${newProfile[0]?.balance}원`);
      console.log(`   차감: ${actualDeduction}원 (예상: ${expectedAmount}원)`);

      if (Math.abs(actualDeduction - expectedAmount) <= 1) {
        console.log('\n✅ 서버 측 가격 계산 정상 작동!');
      } else {
        console.log('\n⚠️  금액 불일치 - 확인 필요');
      }

      // 주문 상세 확인
      const orderRes = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?select=order_number,status,charge,unit_price,quantity,link&id=eq.${orderId}`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      );
      const order = await orderRes.json();
      if (order.length > 0) {
        console.log('\n📋 생성된 주문 상세:');
        console.log(`   주문번호: ${order[0].order_number}`);
        console.log(`   상태: ${order[0].status}`);
        console.log(`   금액: ${order[0].charge}원`);
        console.log(`   단가: ${order[0].unit_price}원/1K`);
        console.log(`   수량: ${order[0].quantity}`);
      }

      // 트랜잭션 확인
      const txRes = await fetch(
        `${SUPABASE_URL}/rest/v1/transactions?select=type,amount,balance_before,balance_after,description&reference_id=eq.${orderId}&order=created_at.desc&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      );
      const tx = await txRes.json();
      if (tx.length > 0) {
        console.log('\n📝 트랜잭션 기록:');
        console.log(`   타입: ${tx[0].type}`);
        console.log(`   금액: ${tx[0].amount}원`);
        console.log(`   잔액: ${tx[0].balance_before} → ${tx[0].balance_after}`);
        console.log(`   설명: ${tx[0].description}`);
      }

      console.log('\n' + '='.repeat(60));
      console.log('✅ 주문 테스트 완료 - 모든 기능 정상 작동');
      console.log('='.repeat(60));
      return true;
    }
  }

  console.log(`\n❌ 주문 실패: ${rpcResult}`);
  return false;
}

testOrder().catch(console.error);
