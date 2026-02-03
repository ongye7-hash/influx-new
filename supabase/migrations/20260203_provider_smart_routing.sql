-- ============================================
-- 스마트 라우팅 및 장애 자동 우회 시스템
-- Provider 장애 추적 및 로깅
-- ============================================

-- ============================================
-- 1. API_PROVIDERS 테이블에 장애 추적 컬럼 추가
-- ============================================
ALTER TABLE api_providers
ADD COLUMN IF NOT EXISTS recent_failure_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_failure_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failure_cooldown_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_requests INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_failures INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_response_time_ms INTEGER DEFAULT 0;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_api_providers_failure_cooldown
ON api_providers(failure_cooldown_until)
WHERE failure_cooldown_until IS NOT NULL;

-- ============================================
-- 2. PROVIDER_LOGS 테이블 (API 요청/응답 로깅)
-- ============================================
CREATE TABLE IF NOT EXISTS provider_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES api_providers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

    -- 요청 정보
    action VARCHAR(50) NOT NULL, -- 'add', 'status', 'cancel', 'refill', 'services', 'balance'
    service_id VARCHAR(100),
    request_data JSONB,

    -- 응답 정보
    success BOOLEAN NOT NULL DEFAULT FALSE,
    response_status INTEGER, -- HTTP status code
    response_time_ms INTEGER, -- 응답 시간 (밀리초)
    response_data JSONB,
    error_message TEXT,

    -- 메타 정보
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스
CREATE INDEX idx_provider_logs_provider ON provider_logs(provider_id);
CREATE INDEX idx_provider_logs_created_at ON provider_logs(created_at DESC);
CREATE INDEX idx_provider_logs_success ON provider_logs(provider_id, success);
CREATE INDEX idx_provider_logs_action ON provider_logs(action);

-- 최근 로그만 남기기 위한 인덱스 (30일 보관)
CREATE INDEX idx_provider_logs_cleanup ON provider_logs(created_at) WHERE created_at < NOW() - INTERVAL '30 days';

-- ============================================
-- 3. PROVIDER_HEALTH_STATS 뷰 (실시간 공급자 상태)
-- ============================================
CREATE OR REPLACE VIEW provider_health_stats AS
SELECT
    p.id,
    p.name,
    p.slug,
    p.is_active,
    p.recent_failure_count,
    p.last_failure_at,
    p.failure_cooldown_until,
    p.total_requests,
    p.total_failures,
    p.avg_response_time_ms,
    CASE
        WHEN p.failure_cooldown_until IS NOT NULL AND p.failure_cooldown_until > NOW() THEN 'cooldown'
        WHEN p.is_active = FALSE THEN 'disabled'
        WHEN p.recent_failure_count >= 3 THEN 'unhealthy'
        WHEN p.recent_failure_count >= 1 THEN 'degraded'
        ELSE 'healthy'
    END AS health_status,
    -- 최근 1시간 통계
    (
        SELECT COUNT(*)
        FROM provider_logs pl
        WHERE pl.provider_id = p.id
        AND pl.created_at > NOW() - INTERVAL '1 hour'
    ) AS requests_last_hour,
    (
        SELECT COUNT(*)
        FROM provider_logs pl
        WHERE pl.provider_id = p.id
        AND pl.success = FALSE
        AND pl.created_at > NOW() - INTERVAL '1 hour'
    ) AS failures_last_hour,
    (
        SELECT ROUND(AVG(pl.response_time_ms))
        FROM provider_logs pl
        WHERE pl.provider_id = p.id
        AND pl.created_at > NOW() - INTERVAL '1 hour'
        AND pl.response_time_ms IS NOT NULL
    ) AS avg_response_time_last_hour
FROM api_providers p;

-- ============================================
-- 4. 장애 기록 함수
-- ============================================
CREATE OR REPLACE FUNCTION record_provider_failure(
    p_provider_id UUID,
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_failure_count INTEGER;
    v_cooldown_minutes INTEGER := 30; -- 30분 쿨다운
    v_failure_threshold INTEGER := 3; -- 3회 연속 실패 시 쿨다운
BEGIN
    -- 실패 카운트 증가
    UPDATE api_providers
    SET
        recent_failure_count = recent_failure_count + 1,
        last_failure_at = NOW(),
        total_failures = total_failures + 1
    WHERE id = p_provider_id
    RETURNING recent_failure_count INTO v_failure_count;

    -- 3회 연속 실패 시 쿨다운 설정
    IF v_failure_count >= v_failure_threshold THEN
        UPDATE api_providers
        SET failure_cooldown_until = NOW() + (v_cooldown_minutes || ' minutes')::INTERVAL
        WHERE id = p_provider_id;

        RAISE NOTICE '[ProviderRouter] Provider % entered cooldown for % minutes (% consecutive failures)',
            p_provider_id, v_cooldown_minutes, v_failure_count;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. 성공 기록 함수 (실패 카운트 리셋)
-- ============================================
CREATE OR REPLACE FUNCTION record_provider_success(
    p_provider_id UUID,
    p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE api_providers
    SET
        recent_failure_count = 0,
        failure_cooldown_until = NULL,
        total_requests = total_requests + 1,
        avg_response_time_ms = CASE
            WHEN p_response_time_ms IS NOT NULL THEN
                ROUND((COALESCE(avg_response_time_ms, 0) * 0.9) + (p_response_time_ms * 0.1))
            ELSE avg_response_time_ms
        END
    WHERE id = p_provider_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Provider 사용 가능 여부 확인 함수
-- ============================================
CREATE OR REPLACE FUNCTION is_provider_available(p_provider_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_provider RECORD;
BEGIN
    SELECT is_active, failure_cooldown_until
    INTO v_provider
    FROM api_providers
    WHERE id = p_provider_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- 비활성화 상태
    IF v_provider.is_active = FALSE THEN
        RETURN FALSE;
    END IF;

    -- 쿨다운 중
    IF v_provider.failure_cooldown_until IS NOT NULL
       AND v_provider.failure_cooldown_until > NOW() THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. 쿨다운 자동 해제 (30분 경과 시)
-- ============================================
CREATE OR REPLACE FUNCTION reset_expired_cooldowns()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE api_providers
    SET
        failure_cooldown_until = NULL,
        recent_failure_count = 0
    WHERE failure_cooldown_until IS NOT NULL
    AND failure_cooldown_until <= NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;

    IF v_count > 0 THEN
        RAISE NOTICE '[ProviderRouter] Reset cooldown for % providers', v_count;
    END IF;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. 오래된 로그 정리 함수
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_provider_logs()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM provider_logs
    WHERE created_at < NOW() - INTERVAL '30 days';

    GET DIAGNOSTICS v_count = ROW_COUNT;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. RLS 정책
-- ============================================
ALTER TABLE provider_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 로그 조회 가능
CREATE POLICY "Admins can view provider logs"
    ON provider_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Service role 전체 접근
CREATE POLICY "Service role can manage provider logs"
    ON provider_logs FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- 10. 권한 부여
-- ============================================
GRANT EXECUTE ON FUNCTION record_provider_failure(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION record_provider_success(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION is_provider_available(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_expired_cooldowns() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_provider_logs() TO service_role;

GRANT SELECT ON provider_health_stats TO authenticated;
