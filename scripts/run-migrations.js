// ============================================
// Supabase 마이그레이션 직접 실행 스크립트
// ============================================

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase pooler connection (Transaction mode)
const connectionString = 'postgresql://postgres.ndjelynkpxffmapndnjx:A2QfY0gzMIynt78W@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';

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

async function runMigration(client, filename) {
  const filePath = path.join(__dirname, '..', 'supabase', 'migrations', filename);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  파일 없음: ${filename}`);
    return { success: false, error: 'File not found' };
  }

  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`\n📄 실행 중: ${filename}`);
  console.log('─'.repeat(50));

  try {
    await client.query(sql);
    console.log(`   ✅ 성공!`);
    return { success: true };
  } catch (err) {
    console.log(`   ❌ 오류: ${err.message}`);
    // 이미 존재하는 객체는 무시
    if (err.message.includes('already exists') || err.message.includes('duplicate')) {
      console.log(`   ℹ️  (이미 존재 - 무시)`);
      return { success: true, skipped: true };
    }
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     INFLUX Supabase 마이그레이션 실행           ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    console.log('🔗 Supabase DB 연결 중...');
    await client.connect();
    console.log('✅ 연결 성공!\n');

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (const file of migrationFiles) {
      const result = await runMigration(client, file);
      if (result.success) {
        if (result.skipped) skippedCount++;
        else successCount++;
      } else {
        failCount++;
      }
    }

    console.log('\n' + '═'.repeat(50));
    console.log(`📊 결과: 성공 ${successCount}, 스킵 ${skippedCount}, 실패 ${failCount}`);

    if (failCount === 0) {
      console.log('\n🎉 모든 마이그레이션이 성공적으로 적용되었습니다!');
    }

  } catch (err) {
    console.error('❌ 연결 실패:', err.message);
  } finally {
    await client.end();
    console.log('\n🔌 연결 종료');
  }
}

main();
