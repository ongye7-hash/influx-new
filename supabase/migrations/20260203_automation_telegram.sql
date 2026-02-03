-- ============================================
-- 자동화 엔진 + 텔레그램 봇 시스템
-- ============================================

-- ============================================
-- 1. 자동화 로그 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(50) NOT NULL,
    action_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_automation_logs_type ON automation_logs(action_type);
CREATE INDEX idx_automation_logs_created_at ON automation_logs(created_at DESC);

-- ============================================
-- 2. 텔레그램 로그 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS telegram_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    direction VARCHAR(20) NOT NULL, -- 'incoming', 'outgoing'
    content TEXT,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_telegram_logs_created_at ON telegram_logs(created_at DESC);

-- ============================================
-- 3. 텔레그램 설정 기본값 삽입
-- ============================================
INSERT INTO admin_settings (key, value) VALUES
    ('telegram', '{
        "bot_token": "",
        "chat_id": "",
        "enabled": false,
        "quiet_hours_start": 23,
        "quiet_hours_end": 8,
        "daily_briefing_time": "21:00",
        "notify_large_deposit": true,
        "notify_provider_failure": true,
        "notify_sleeping_whale": true,
        "notify_new_vip": true,
        "large_deposit_threshold": 50000
    }')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 4. 자동화 설정 기본값 삽입
-- ============================================
INSERT INTO admin_settings (key, value) VALUES
    ('automation', '{
        "auto_approve_deposit": false,
        "auto_approve_max_amount": 50000,
        "auto_approve_existing_only": true,
        "auto_coupon_sleeping_whale": false,
        "auto_coupon_days_inactive": 14,
        "auto_coupon_min_balance": 20000,
        "auto_coupon_discount_percent": 10,
        "auto_refund_failed_orders": false,
        "provider_balance_alert": true,
        "provider_balance_threshold": 100
    }')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 5. orders 테이블에 refunded 컬럼 추가
-- ============================================
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT FALSE;

-- ============================================
-- 6. deposits 테이블에 approved_at 컬럼 추가
-- ============================================
ALTER TABLE deposits
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- ============================================
-- 7. RLS 정책
-- ============================================
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 접근
CREATE POLICY "Admins can view automation logs"
    ON automation_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can view telegram logs"
    ON telegram_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Service role 전체 접근
CREATE POLICY "Service role full access to automation_logs"
    ON automation_logs FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to telegram_logs"
    ON telegram_logs FOR ALL
    USING (auth.role() = 'service_role');
