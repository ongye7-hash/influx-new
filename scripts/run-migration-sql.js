// Supabase SQL 실행 스크립트
const fs = require('fs');
const path = require('path');
const https = require('https');

// .env.local 파일 직접 읽기
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) {
    envVars[key.trim()] = values.join('=').trim();
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

// Supabase 프로젝트 ref 추출
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)/)[1];

const migrationSQL = `
-- ============================================
-- API Keys 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    api_key TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT 'Default API Key',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    rate_limit INTEGER DEFAULT 100,
    allowed_ips TEXT[],
    total_requests BIGINT DEFAULT 0,
    total_orders BIGINT DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

CREATE TABLE IF NOT EXISTS api_request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    request_data JSONB,
    response_data JSONB,
    status_code INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_api_key_id ON api_request_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_user_id ON api_request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_action ON api_request_logs(action);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_created_at ON api_request_logs(created_at DESC);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can view own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can insert own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can view own api logs" ON api_request_logs;

CREATE POLICY "Users can view own api keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own api keys" ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own api keys" ON api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own api keys" ON api_keys FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own api logs" ON api_request_logs FOR SELECT USING (auth.uid() = user_id);
`;

async function runSQL() {
  console.log('🚀 API Keys 마이그레이션 SQL 실행 중...\n');
  console.log(`Project: ${projectRef}`);

  // Supabase Management API를 통한 SQL 실행
  const postData = JSON.stringify({
    query: migrationSQL
  });

  const options = {
    hostname: `${projectRef}.supabase.co`,
    port: 443,
    path: '/rest/v1/rpc/exec_sql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ SQL 실행 성공!');
          resolve(data);
        } else {
          console.log(`상태 코드: ${res.statusCode}`);
          console.log(`응답: ${data}`);

          if (res.statusCode === 404) {
            console.log('\n⚠️  exec_sql RPC 함수가 없습니다.');
            console.log('📋 Supabase 대시보드에서 SQL을 직접 실행해주세요:\n');
            console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`);
            console.log('\n아래 SQL을 복사하여 실행하세요:\n');
            console.log('='.repeat(60));
            console.log(migrationSQL);
            console.log('='.repeat(60));
          }
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (e) => {
      console.error('에러:', e.message);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

runSQL().catch(() => {
  process.exit(1);
});
