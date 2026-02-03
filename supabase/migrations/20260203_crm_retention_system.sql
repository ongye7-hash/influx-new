-- ============================================
-- CRM 리텐션 시스템
-- 미사용 잔액 유저 타겟팅 및 마케팅 액션
-- ============================================

-- ============================================
-- 1. PROFILES 테이블에 마지막 주문일 컬럼 추가
-- ============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_order_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_spent INTEGER DEFAULT 0;

-- 인덱스 추가 (잠자는 큰손 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_profiles_retention
ON profiles(balance, last_order_at)
WHERE balance > 5000;

-- ============================================
-- 2. USER_COUPONS 테이블 (유저별 쿠폰 발급 기록)
-- ============================================
CREATE TABLE IF NOT EXISTS user_coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    coupon_code VARCHAR(50) NOT NULL,
    coupon_type VARCHAR(50) NOT NULL, -- 'percentage', 'fixed', 'bonus'
    discount_value DECIMAL(10, 2) NOT NULL,
    min_amount INTEGER DEFAULT 0,
    max_discount INTEGER,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    issued_by UUID REFERENCES profiles(id), -- 관리자 ID
    issue_reason VARCHAR(255), -- '리텐션 마케팅', '첫 충전', etc.
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스
CREATE INDEX idx_user_coupons_user ON user_coupons(user_id);
CREATE INDEX idx_user_coupons_code ON user_coupons(coupon_code);
CREATE INDEX idx_user_coupons_expires ON user_coupons(expires_at) WHERE used_at IS NULL;

-- ============================================
-- 3. MARKETING_ACTIONS 테이블 (마케팅 액션 로그)
-- ============================================
CREATE TABLE IF NOT EXISTS marketing_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(50) NOT NULL, -- 'coupon_batch', 'balance_gift', 'notification'
    target_criteria JSONB NOT NULL, -- 필터 조건
    target_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    action_data JSONB, -- 실행 데이터 (쿠폰 코드, 금액 등)
    executed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 4. 주문 완료 시 프로필 업데이트 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_profile_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- 주문 완료 시 last_order_at 및 통계 업데이트
    IF NEW.status IN ('completed', 'processing', 'in_progress') AND
       (OLD.status IS NULL OR OLD.status = 'pending') THEN
        UPDATE profiles
        SET
            last_order_at = NOW(),
            total_orders = COALESCE(total_orders, 0) + 1,
            total_spent = COALESCE(total_spent, 0) + COALESCE(NEW.charge, 0)
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS order_profile_update_trigger ON orders;
CREATE TRIGGER order_profile_update_trigger
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_on_order();

-- ============================================
-- 5. 잠자는 큰손 조회 뷰
-- ============================================
CREATE OR REPLACE VIEW sleeping_whales AS
SELECT
    p.id,
    p.username,
    p.email,
    p.balance,
    p.tier,
    p.last_order_at,
    p.total_orders,
    p.total_spent,
    p.created_at,
    CASE
        WHEN p.last_order_at IS NULL THEN
            EXTRACT(DAY FROM NOW() - p.created_at)
        ELSE
            EXTRACT(DAY FROM NOW() - p.last_order_at)
    END AS days_inactive,
    CASE
        WHEN p.balance >= 50000 THEN 'whale'
        WHEN p.balance >= 20000 THEN 'dolphin'
        WHEN p.balance >= 5000 THEN 'fish'
        ELSE 'minnow'
    END AS customer_tier
FROM profiles p
WHERE p.balance > 5000
AND (
    p.last_order_at IS NULL
    OR p.last_order_at < NOW() - INTERVAL '14 days'
)
AND p.is_admin = FALSE
ORDER BY p.balance DESC, days_inactive DESC;

-- ============================================
-- 6. 오늘의 리텐션 타겟 수 함수
-- ============================================
CREATE OR REPLACE FUNCTION get_retention_targets_count()
RETURNS TABLE(
    total_count BIGINT,
    total_balance BIGINT,
    whale_count BIGINT,
    dolphin_count BIGINT,
    fish_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_count,
        COALESCE(SUM(balance), 0)::BIGINT as total_balance,
        COUNT(*) FILTER (WHERE balance >= 50000)::BIGINT as whale_count,
        COUNT(*) FILTER (WHERE balance >= 20000 AND balance < 50000)::BIGINT as dolphin_count,
        COUNT(*) FILTER (WHERE balance >= 5000 AND balance < 20000)::BIGINT as fish_count
    FROM sleeping_whales;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. 쿠폰 일괄 발급 함수
-- ============================================
CREATE OR REPLACE FUNCTION issue_coupons_batch(
    p_user_ids UUID[],
    p_coupon_code VARCHAR(50),
    p_coupon_type VARCHAR(50),
    p_discount_value DECIMAL(10, 2),
    p_min_amount INTEGER DEFAULT 0,
    p_max_discount INTEGER DEFAULT NULL,
    p_expires_days INTEGER DEFAULT 30,
    p_issued_by UUID DEFAULT NULL,
    p_issue_reason VARCHAR(255) DEFAULT '관리자 발급'
)
RETURNS TABLE(
    issued_count INTEGER,
    failed_count INTEGER
) AS $$
DECLARE
    v_user_id UUID;
    v_issued INTEGER := 0;
    v_failed INTEGER := 0;
    v_expires_at TIMESTAMPTZ := NOW() + (p_expires_days || ' days')::INTERVAL;
BEGIN
    FOREACH v_user_id IN ARRAY p_user_ids
    LOOP
        BEGIN
            INSERT INTO user_coupons (
                user_id,
                coupon_code,
                coupon_type,
                discount_value,
                min_amount,
                max_discount,
                expires_at,
                issued_by,
                issue_reason
            ) VALUES (
                v_user_id,
                p_coupon_code || '-' || SUBSTRING(v_user_id::TEXT, 1, 4),
                p_coupon_type,
                p_discount_value,
                p_min_amount,
                p_max_discount,
                v_expires_at,
                p_issued_by,
                p_issue_reason
            );
            v_issued := v_issued + 1;
        EXCEPTION WHEN OTHERS THEN
            v_failed := v_failed + 1;
        END;
    END LOOP;

    -- 마케팅 액션 로그 기록
    INSERT INTO marketing_actions (
        action_type,
        target_criteria,
        target_count,
        success_count,
        failed_count,
        action_data,
        executed_by
    ) VALUES (
        'coupon_batch',
        jsonb_build_object('user_ids', p_user_ids),
        array_length(p_user_ids, 1),
        v_issued,
        v_failed,
        jsonb_build_object(
            'coupon_code', p_coupon_code,
            'coupon_type', p_coupon_type,
            'discount_value', p_discount_value,
            'expires_days', p_expires_days
        ),
        p_issued_by
    );

    RETURN QUERY SELECT v_issued, v_failed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. 잔액 일괄 지급 함수
-- ============================================
CREATE OR REPLACE FUNCTION gift_balance_batch(
    p_user_ids UUID[],
    p_amount INTEGER,
    p_reason VARCHAR(255) DEFAULT '관리자 지급',
    p_issued_by UUID DEFAULT NULL
)
RETURNS TABLE(
    success_count INTEGER,
    failed_count INTEGER
) AS $$
DECLARE
    v_user_id UUID;
    v_success INTEGER := 0;
    v_failed INTEGER := 0;
BEGIN
    FOREACH v_user_id IN ARRAY p_user_ids
    LOOP
        BEGIN
            -- RPC로 잔액 추가 (트랜잭션 기록 포함)
            PERFORM add_balance(v_user_id, p_amount, 'admin_gift', p_reason);
            v_success := v_success + 1;
        EXCEPTION WHEN OTHERS THEN
            v_failed := v_failed + 1;
        END;
    END LOOP;

    -- 마케팅 액션 로그 기록
    INSERT INTO marketing_actions (
        action_type,
        target_criteria,
        target_count,
        success_count,
        failed_count,
        action_data,
        executed_by
    ) VALUES (
        'balance_gift',
        jsonb_build_object('user_ids', p_user_ids),
        array_length(p_user_ids, 1),
        v_success,
        v_failed,
        jsonb_build_object('amount', p_amount, 'reason', p_reason),
        p_issued_by
    );

    RETURN QUERY SELECT v_success, v_failed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. RLS 정책
-- ============================================
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_actions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 쿠폰만 조회 가능
CREATE POLICY "Users can view own coupons"
    ON user_coupons FOR SELECT
    USING (user_id = auth.uid());

-- 관리자는 모든 쿠폰 관리 가능
CREATE POLICY "Admins can manage all coupons"
    ON user_coupons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- 관리자만 마케팅 액션 조회 가능
CREATE POLICY "Admins can view marketing actions"
    ON marketing_actions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Service role 전체 접근
CREATE POLICY "Service role full access to user_coupons"
    ON user_coupons FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to marketing_actions"
    ON marketing_actions FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- 10. 권한 부여
-- ============================================
GRANT SELECT ON sleeping_whales TO authenticated;
GRANT EXECUTE ON FUNCTION get_retention_targets_count() TO authenticated;
GRANT EXECUTE ON FUNCTION issue_coupons_batch(UUID[], VARCHAR, VARCHAR, DECIMAL, INTEGER, INTEGER, INTEGER, UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION gift_balance_batch(UUID[], INTEGER, VARCHAR, UUID) TO authenticated;
