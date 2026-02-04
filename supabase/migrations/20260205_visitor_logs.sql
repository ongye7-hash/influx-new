-- ============================================
-- 방문자 로그 테이블
-- 실시간 방문자 추적 + 텔레그램 리포트용
-- ============================================

CREATE TABLE IF NOT EXISTS visitor_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- 방문자 정보
  ip_address VARCHAR(45),           -- IPv4/IPv6
  ip_hash VARCHAR(64),              -- 익명화된 IP 해시 (프라이버시)

  -- 페이지 정보
  page_path VARCHAR(500) NOT NULL,  -- /order, /dashboard 등
  page_title VARCHAR(200),
  referrer VARCHAR(500),            -- 유입 경로
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),

  -- 기기 정보
  user_agent TEXT,
  device_type VARCHAR(20),          -- mobile, desktop, tablet
  browser VARCHAR(50),
  os VARCHAR(50),

  -- 위치 정보 (IP 기반)
  country VARCHAR(2),               -- KR, US 등
  city VARCHAR(100),

  -- 세션 정보
  session_id VARCHAR(64),           -- 브라우저 세션 추적
  is_new_visitor BOOLEAN DEFAULT true,

  -- 시간
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 인덱스용
  visit_date DATE DEFAULT CURRENT_DATE
);

-- 인덱스 (빠른 조회용)
CREATE INDEX idx_visitor_logs_created_at ON visitor_logs(created_at DESC);
CREATE INDEX idx_visitor_logs_visit_date ON visitor_logs(visit_date);
CREATE INDEX idx_visitor_logs_ip_hash ON visitor_logs(ip_hash);
CREATE INDEX idx_visitor_logs_page_path ON visitor_logs(page_path);
CREATE INDEX idx_visitor_logs_country ON visitor_logs(country);

-- RLS 정책 (서비스 키로만 접근)
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

-- 서비스 역할만 INSERT/SELECT 가능
CREATE POLICY "Service role can manage visitor_logs" ON visitor_logs
  FOR ALL USING (true) WITH CHECK (true);

-- 3개월 이상 된 데이터 자동 삭제용 함수 (선택사항)
-- CREATE OR REPLACE FUNCTION cleanup_old_visitor_logs()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM visitor_logs WHERE created_at < NOW() - INTERVAL '90 days';
-- END;
-- $$ LANGUAGE plpgsql;
