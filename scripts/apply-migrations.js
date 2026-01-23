// ============================================
// Supabase 마이그레이션 적용 스크립트
// ============================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// 적용할 마이그레이션 파일들 (순서대로)
const migrationFiles = [
  '20260124000001_signup_bonus_and_rewards.sql',
  '20260124000002_reviews_system.sql',
  '20260124000003_drip_feed_orders.sql',
  '20260124000004_targeting_options.sql',
  '20260124000005_free_trials.sql',
  '20260124000006_kakaopay_integration.sql',
  '20260124000007_ab_testing.sql',
];

async function runMigration(filename) {
  const filePath = path.join(__dirname, '..', 'supabase', 'migrations', filename);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  파일 없음: ${filename}`);
    return false;
  }

  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`\n📄 실행 중: ${filename}`);
  console.log('─'.repeat(50));

  try {
    // SQL을 여러 문장으로 분리해서 실행
    // (Supabase JS client는 단일 SQL 실행만 지원)
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // exec_sql 함수가 없으면 직접 실행 시도
      if (error.message.includes('exec_sql')) {
        console.log('   ℹ️  exec_sql 함수 없음 - 직접 실행 필요');
        return 'manual';
      }
      throw error;
    }

    console.log(`   ✅ 성공!`);
    return true;
  } catch (err) {
    console.log(`   ❌ 오류: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     INFLUX Supabase 마이그레이션 적용           ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(`\n🔗 Supabase URL: ${supabaseUrl}`);
  console.log(`📦 마이그레이션 파일: ${migrationFiles.length}개\n`);

  let successCount = 0;
  let failCount = 0;
  let manualCount = 0;

  for (const file of migrationFiles) {
    const result = await runMigration(file);
    if (result === true) successCount++;
    else if (result === 'manual') manualCount++;
    else failCount++;
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`📊 결과: 성공 ${successCount}, 실패 ${failCount}, 수동 필요 ${manualCount}`);

  if (manualCount > 0 || failCount > 0) {
    console.log('\n⚠️  일부 마이그레이션은 Supabase 대시보드에서 직접 실행해야 합니다:');
    console.log('   1. https://supabase.com/dashboard 접속');
    console.log('   2. 프로젝트 선택 → SQL Editor');
    console.log('   3. supabase/migrations/ 폴더의 SQL 파일 내용 복사 후 실행');
  }
}

main().catch(console.error);
