/**
 * Migration Runner Script
 * Supabase Service Role Key를 사용하여 마이그레이션 실행
 */

const fs = require('fs');
const path = require('path');

// 환경변수 로드
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

// Supabase REST API를 통해 SQL 실행
async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    // REST API로 RPC 실행이 안 되면 다른 방법 시도
    return null;
  }

  return response.json();
}

// PostgreSQL 직접 연결 (pg 모듈 필요)
async function executeSqlDirect(sql) {
  try {
    // Supabase URL에서 프로젝트 ref 추출
    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1];
    if (!projectRef) throw new Error('Invalid Supabase URL');

    // Supabase Pooler 연결 문자열
    const connectionString = `postgresql://postgres.${projectRef}:${SUPABASE_SERVICE_KEY}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`;

    const { Client } = require('pg');
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

    await client.connect();
    const result = await client.query(sql);
    await client.end();

    return result;
  } catch (error) {
    console.log('⚠️  PostgreSQL 직접 연결 실패:', error.message);
    return null;
  }
}

async function runMigrations() {
  console.log('🚀 마이그레이션 실행 시작...\n');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const migrationFiles = [
    '20260121000001_fix_process_order_security.sql',
    '20260121000002_providers_api_key_security.sql',
  ];

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ 파일 없음: ${file}`);
      continue;
    }

    console.log(`📄 ${file}`);
    const sql = fs.readFileSync(filePath, 'utf8');

    // SQL 내용 출력 (처음 200자)
    console.log(`   SQL 미리보기: ${sql.substring(0, 100).replace(/\n/g, ' ')}...`);
    console.log(`   총 ${sql.length} 문자\n`);
  }

  console.log('━'.repeat(50));
  console.log('\n⚠️  Supabase Dashboard에서 직접 실행이 필요합니다:\n');
  console.log('1. https://supabase.com/dashboard 접속');
  console.log('2. 프로젝트 선택 → SQL Editor 클릭');
  console.log('3. 위 마이그레이션 파일 내용을 복사하여 실행\n');
  console.log('━'.repeat(50));

  // 마이그레이션 SQL 전체 내용 출력
  console.log('\n📋 복사할 SQL (전체):\n');

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`\n-- ========== ${file} ==========\n`);
      console.log(fs.readFileSync(filePath, 'utf8'));
    }
  }
}

runMigrations().catch(console.error);
