// API Keys 테이블 마이그레이션 스크립트
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('🚀 API Keys 마이그레이션 시작...\n');

  try {
    // 1. api_keys 테이블 생성
    console.log('1. api_keys 테이블 생성 중...');
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (tableError) {
      // RPC가 없으면 직접 insert로 테스트
      console.log('   RPC 미지원, 직접 테이블 확인 중...');

      // 테이블 존재 여부 확인
      const { data, error: selectError } = await supabase
        .from('api_keys')
        .select('id')
        .limit(1);

      if (selectError && selectError.code === '42P01') {
        console.log('   ❌ api_keys 테이블이 없습니다.');
        console.log('\n📋 Supabase 대시보드에서 다음 SQL을 실행해주세요:');
        console.log('   https://supabase.com/dashboard/project/ndjelynkpxffmapndnjx/sql/new\n');
        printMigrationSQL();
        return;
      } else if (selectError) {
        throw selectError;
      } else {
        console.log('   ✅ api_keys 테이블이 이미 존재합니다.');
      }
    } else {
      console.log('   ✅ api_keys 테이블 생성 완료');
    }

    // 테이블 확인
    const { data: tables, error: checkError } = await supabase
      .from('api_keys')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('\n✅ 마이그레이션 완료! api_keys 테이블이 준비되었습니다.');

      // api_request_logs 테이블 확인
      const { error: logsError } = await supabase
        .from('api_request_logs')
        .select('id')
        .limit(1);

      if (logsError && logsError.code === '42P01') {
        console.log('⚠️  api_request_logs 테이블은 수동으로 생성해야 합니다.');
      } else if (!logsError) {
        console.log('✅ api_request_logs 테이블도 준비되었습니다.');
      }
    }

  } catch (error) {
    console.error('❌ 마이그레이션 에러:', error.message);
    console.log('\n📋 Supabase 대시보드에서 직접 SQL을 실행해주세요:');
    console.log('   https://supabase.com/dashboard/project/ndjelynkpxffmapndnjx/sql/new\n');
    printMigrationSQL();
  }
}

function printMigrationSQL() {
  console.log(`
-- ============================================
-- API Keys 테이블 생성 SQL
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

CREATE POLICY "Users can view own api keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own api keys" ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own api keys" ON api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own api keys" ON api_keys FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own api logs" ON api_request_logs FOR SELECT USING (auth.uid() = user_id);
`);
}

applyMigration();
