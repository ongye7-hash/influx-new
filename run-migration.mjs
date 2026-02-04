// Supabase 마이그레이션 실행 스크립트
import fs from 'fs';

const SUPABASE_URL = 'https://ndjelynkpxffmapndnjx.supabase.co';
// Service role key는 환경변수에서 가져오거나 직접 입력
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.');
  console.log('사용법: SUPABASE_SERVICE_ROLE_KEY=xxx node run-migration.mjs');
  process.exit(1);
}

const sql = fs.readFileSync('./supabase/migrations/20260205_visitor_logs.sql', 'utf-8');

async function runMigration() {
  console.log('마이그레이션 실행 중...\n');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  // SQL Editor를 통해 직접 실행해야 함
  console.log('Supabase Dashboard에서 SQL을 직접 실행해주세요:');
  console.log('1. https://supabase.com/dashboard 접속');
  console.log('2. 프로젝트 선택 → SQL Editor');
  console.log('3. 아래 SQL 실행:\n');
  console.log('─'.repeat(50));
  console.log(sql);
  console.log('─'.repeat(50));
}

runMigration();
