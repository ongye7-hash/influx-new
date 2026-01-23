const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function debug() {
  const userId = '1f2f41a7-e719-4c68-8b2c-45e84320da14';

  // A/B 테스트 할당 확인
  console.log('🔍 A/B 테스트 할당 확인...');
  const { data: assignments } = await supabase
    .from('ab_test_assignments')
    .select('id, variant, test_id, ab_tests(test_key, status)')
    .eq('user_id', userId);

  console.log('할당:', (assignments ? assignments.length : 0), '개');
  if (assignments) {
    assignments.forEach(a => console.log('  -', a.ab_tests?.test_key, ':', a.variant));
  }

  // 테스트 상태
  const { data: tests } = await supabase.from('ab_tests').select('id, test_key, status');
  console.log('\n테스트 상태:');
  if (tests) tests.forEach(t => console.log('  -', t.test_key, ':', t.status));

  // 할당이 없으면 추가
  const landingTest = tests ? tests.find(t => t.test_key === 'landing_hero') : null;
  const hasAssignment = assignments && assignments.length > 0;

  if (landingTest && !hasAssignment) {
    console.log('\n⚡ 할당 추가...');
    const { error: insErr } = await supabase.from('ab_test_assignments').insert({
      test_id: landingTest.id,
      user_id: userId,
      variant: 'control'
    });
    console.log(insErr ? '❌ ' + insErr.message : '✅ 할당 완료');
  }

  // 이벤트 추적
  console.log('\n📝 이벤트 추적 테스트...');
  const { data: tracked, error: trackErr } = await supabase.rpc('track_ab_test_event', {
    p_test_key: 'landing_hero',
    p_event_type: 'view',
    p_user_id: userId
  });
  console.log('결과:', tracked);
  if (trackErr) console.log('에러:', trackErr.message);

  // 이벤트 확인
  const { data: events } = await supabase.from('ab_test_events').select('event_type, variant, created_at').eq('user_id', userId);
  console.log('\n📊 이벤트 목록:', events ? events.length : 0, '개');
  if (events) events.forEach(e => console.log('  -', e.event_type, '|', e.variant, '|', e.created_at));
}

debug().catch(e => console.error('Error:', e.message));
