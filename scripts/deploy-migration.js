/**
 * Deploy Migration via Supabase Management API
 * Service Role Key를 사용한 SQL 실행
 */

const fs = require('fs');
const path = require('path');

// 환경변수 수동 로드
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

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 환경변수가 올바르지 않습니다.');
  process.exit(1);
}

// SQL 실행 함수 (PostgREST를 통한 RPC 호출)
async function executeSql(sql, description) {
  console.log(`\n📄 ${description}`);

  // 방법 1: exec_sql RPC 함수가 있다면 사용
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ sql_query: sql }),
    });

    if (response.ok) {
      console.log('   ✅ 성공 (via exec_sql RPC)');
      return true;
    }
  } catch (e) {
    // exec_sql RPC가 없으면 무시
  }

  // 방법 2: Supabase Edge Function 또는 직접 실행 필요
  console.log('   ⚠️  직접 SQL 실행 필요 (Supabase Dashboard → SQL Editor)');
  return false;
}

async function main() {
  console.log('🚀 마이그레이션 배포');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log('━'.repeat(60));

  // 먼저 exec_sql RPC 함수 생성 시도
  console.log('\n🔧 exec_sql 함수 생성 시도...');

  const createExecSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
    RETURNS JSON AS $$
    BEGIN
      EXECUTE sql_query;
      RETURN json_build_object('success', true);
    EXCEPTION WHEN OTHERS THEN
      RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  // 마이그레이션 파일 읽기 및 출력
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const migrationFiles = [
    '20260121000001_fix_process_order_security.sql',
    '20260121000002_providers_api_key_security.sql',
    '20260121000003_add_crypto_payment_support.sql',
  ];

  console.log('\n' + '='.repeat(60));
  console.log('📋 Supabase Dashboard → SQL Editor에서 아래 SQL을 실행하세요:');
  console.log('='.repeat(60));

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);

    if (!fs.existsSync(filePath)) {
      console.error(`\n❌ 파일 없음: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`-- 파일: ${file}`);
    console.log(`${'─'.repeat(60)}`);
    console.log(sql);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ 위 SQL을 순서대로 Supabase SQL Editor에서 실행해주세요.');
  console.log('   URL: https://supabase.com/dashboard/project/ndjelynkpxffmapndnjx/sql');
  console.log('='.repeat(60));
}

main().catch(console.error);
