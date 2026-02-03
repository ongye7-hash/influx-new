-- ============================================
-- 가격 동기화 로그 테이블
-- 역마진 방지 및 가격 변동 추적
-- ============================================

-- ============================================
-- 1. PRICE_SYNC_LOGS 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS price_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exchange_rate DECIMAL(10, 2) NOT NULL,
    margin_rate DECIMAL(5, 2) NOT NULL,
    fixed_fee DECIMAL(10, 2) DEFAULT 0,
    total_products INTEGER NOT NULL DEFAULT 0,
    updated_count INTEGER NOT NULL DEFAULT 0,
    disabled_count INTEGER NOT NULL DEFAULT 0,
    skipped_count INTEGER NOT NULL DEFAULT 0,
    results JSONB DEFAULT '[]'::jsonb,
    errors TEXT[] DEFAULT '{}',
    trigger_type VARCHAR(20) DEFAULT 'manual', -- 'cron' or 'manual'
    triggered_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스
CREATE INDEX idx_price_sync_logs_created_at ON price_sync_logs(created_at DESC);
CREATE INDEX idx_price_sync_logs_disabled ON price_sync_logs(disabled_count) WHERE disabled_count > 0;

-- ============================================
-- 2. ADMIN_SETTINGS 테이블 (마진 설정 저장용)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- 기본 마진 설정 추가
INSERT INTO admin_settings (key, value, description)
VALUES (
    'pricing_config',
    '{"margin_rate": 50, "fixed_fee": 0, "auto_sync_enabled": false, "spike_threshold": 50}'::jsonb,
    '가격 동기화 설정 (마진율, 고정수수료, 자동동기화, 급등임계치)'
)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 3. RLS 정책
-- ============================================
ALTER TABLE price_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 관리자만 로그 조회 가능
CREATE POLICY "Admins can view price sync logs"
    ON price_sync_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- 관리자만 로그 생성 가능
CREATE POLICY "Admins can create price sync logs"
    ON price_sync_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Service role은 로그 생성 가능 (Cron용)
CREATE POLICY "Service role can manage price sync logs"
    ON price_sync_logs FOR ALL
    USING (auth.role() = 'service_role');

-- 관리자 설정 조회
CREATE POLICY "Admins can view settings"
    ON admin_settings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- 관리자 설정 수정
CREATE POLICY "Admins can manage settings"
    ON admin_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Service role 전체 접근
CREATE POLICY "Service role can manage settings"
    ON admin_settings FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- 4. 가격 변동 알림 함수 (선택사항)
-- ============================================
CREATE OR REPLACE FUNCTION notify_price_spike()
RETURNS TRIGGER AS $$
BEGIN
    -- 비활성화된 상품이 있으면 로그
    IF NEW.disabled_count > 0 THEN
        RAISE NOTICE '[PriceSync Alert] % products disabled due to price spike', NEW.disabled_count;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS price_sync_alert_trigger ON price_sync_logs;
CREATE TRIGGER price_sync_alert_trigger
    AFTER INSERT ON price_sync_logs
    FOR EACH ROW
    EXECUTE FUNCTION notify_price_spike();

-- ============================================
-- 5. 권한 부여
-- ============================================
GRANT SELECT ON price_sync_logs TO authenticated;
GRANT SELECT ON admin_settings TO authenticated;
