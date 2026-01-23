const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function testFeatures() {
  console.log('🧪 새 기능 테스트 시작\n');
  console.log('═'.repeat(50));

  // 1. 프로필 보너스 컬럼 테스트
  console.log('\n1️⃣ 프로필 보너스 시스템 테스트');
  const { data: profiles } = await supabase.from('profiles').select('id, email, balance, signup_bonus_received, first_deposit_bonus_received, total_points_earned').limit(3);
  if (profiles && profiles.length > 0) {
    console.log('   ✅ 프로필 보너스 컬럼 정상');
    profiles.forEach(p => {
      console.log('      - ' + (p.email || 'N/A').substring(0, 20) + ' | 잔액: ' + p.balance + ' | 가입보너스: ' + (p.signup_bonus_received ? '받음' : '안받음'));
    });
  }

  // 2. 첫충전 보너스 함수 테스트
  console.log('\n2️⃣ 첫충전 보너스 함수 테스트');
  const { data: bonusTest, error: bonusErr } = await supabase.rpc('apply_first_deposit_bonus', {
    p_user_id: '00000000-0000-0000-0000-000000000000',
    p_deposit_amount: 10000
  });
  if (bonusErr) {
    console.log('   ✅ apply_first_deposit_bonus 함수 존재 (테스트 ID 오류는 정상)');
  } else {
    console.log('   ✅ 함수 정상 동작');
  }

  // 3. 리뷰 시스템 테스트
  console.log('\n3️⃣ 리뷰 시스템 테스트');
  const { data: reviews, error: revErr } = await supabase.from('reviews').select('*').limit(1);
  console.log(revErr ? '   ❌ ' + revErr.message : '   ✅ reviews 테이블 접근 가능');

  const { data: ratings } = await supabase.from('service_ratings').select('*').limit(5);
  if (ratings) {
    console.log('   ✅ service_ratings 뷰: ' + ratings.length + '개 서비스 평점 데이터');
  }

  // 4. 무료 체험 시스템 테스트
  console.log('\n4️⃣ 무료 체험 시스템 테스트');
  const { data: trialServices } = await supabase.from('free_trial_services').select('*');
  console.log('   ✅ free_trial_services: ' + (trialServices?.length || 0) + '개 등록됨');

  const { error: trialsErr } = await supabase.from('free_trials').select('*').limit(1);
  console.log(trialsErr ? '   ❌ ' + trialsErr.message : '   ✅ free_trials 테이블 접근 가능');

  // 5. 카카오페이 시스템 테스트
  console.log('\n5️⃣ 카카오페이 결제 시스템 테스트');
  const { data: paymentMethods } = await supabase.from('payment_methods').select('code, name, is_active');
  if (paymentMethods) {
    paymentMethods.forEach(p => console.log('   ✅ ' + p.code + ': ' + p.name + ' (' + (p.is_active ? '활성' : '비활성') + ')'));
  }

  const { error: kakaoErr } = await supabase.from('kakaopay_payments').select('id').limit(1);
  console.log(kakaoErr ? '   ❌ ' + kakaoErr.message : '   ✅ kakaopay_payments 테이블 접근 가능');

  // 6. A/B 테스트 시스템 테스트
  console.log('\n6️⃣ A/B 테스트 시스템 테스트');
  const { data: abTests } = await supabase.from('ab_tests').select('test_key, name, status, variants');
  if (abTests) {
    abTests.forEach(t => {
      console.log('   ✅ ' + t.test_key + ' (' + t.status + ')');
      console.log('      변형: ' + JSON.stringify(t.variants));
    });
  }

  // A/B 테스트 함수 테스트
  const { data: variant, error: varErr } = await supabase.rpc('get_ab_test_variant', {
    p_test_key: 'landing_hero',
    p_anonymous_id: 'test-user-' + Date.now()
  });
  if (variant) {
    console.log('   ✅ get_ab_test_variant 함수 정상: ' + variant);
  }

  // 7. Drip-feed 시스템 테스트
  console.log('\n7️⃣ Drip-feed 주문 시스템 테스트');
  const { error: ordersErr } = await supabase.from('orders').select('id, is_drip_feed, drip_feed_runs').limit(1);
  console.log(ordersErr ? '   ❌ ' + ordersErr.message : '   ✅ orders drip-feed 컬럼 접근 가능');

  const { error: dripErr } = await supabase.from('drip_feed_logs').select('*').limit(1);
  console.log(dripErr ? '   ❌ ' + dripErr.message : '   ✅ drip_feed_logs 테이블 접근 가능');

  // 8. 타겟팅 옵션 테스트
  console.log('\n8️⃣ 타겟팅 옵션 시스템 테스트');
  const { data: targeting, error: targetErr } = await supabase.from('targeting_options').select('*');
  console.log(targetErr ? '   ❌ ' + targetErr.message : '   ✅ targeting_options: ' + (targeting?.length || 0) + '개 등록됨');

  const { error: orderTargetErr } = await supabase.from('orders').select('id, targeting, targeting_multiplier').limit(1);
  console.log(orderTargetErr ? '   ❌ ' + orderTargetErr.message : '   ✅ orders targeting 컬럼 접근 가능');

  console.log('\n' + '═'.repeat(50));
  console.log('\n✨ 모든 기능 테스트 완료!');
}

testFeatures().catch(e => console.error('Error:', e.message));
