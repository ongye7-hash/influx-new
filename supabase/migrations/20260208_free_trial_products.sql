-- =============================================
-- 무료체험 상품 테이블 (admin_products 기반)
-- 2026-02-08
-- =============================================

-- 1. free_trial_products 테이블 생성
CREATE TABLE IF NOT EXISTS free_trial_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_product_id UUID NOT NULL REFERENCES admin_products(id) ON DELETE CASCADE,
  trial_quantity INTEGER NOT NULL DEFAULT 50,
  daily_limit INTEGER NOT NULL DEFAULT 100,
  today_used INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 한 상품당 하나의 무료체험 설정만 가능
  UNIQUE(admin_product_id)
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_free_trial_products_admin_product
  ON free_trial_products(admin_product_id);
CREATE INDEX IF NOT EXISTS idx_free_trial_products_is_active
  ON free_trial_products(is_active);

-- 3. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_free_trial_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_free_trial_products_updated_at ON free_trial_products;
CREATE TRIGGER trigger_update_free_trial_products_updated_at
  BEFORE UPDATE ON free_trial_products
  FOR EACH ROW
  EXECUTE FUNCTION update_free_trial_products_updated_at();

-- 4. RLS 정책
ALTER TABLE free_trial_products ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 활성화된 무료체험 상품 조회 가능
CREATE POLICY "Anyone can view active free trial products"
  ON free_trial_products FOR SELECT
  USING (is_active = TRUE);

-- 관리자만 무료체험 상품 관리 가능
CREATE POLICY "Admins can manage free trial products"
  ON free_trial_products FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- 5. 사용자용 무료체험 상품 뷰 생성
DROP VIEW IF EXISTS available_free_trial_products;
CREATE VIEW available_free_trial_products AS
SELECT
  ftp.id as trial_id,
  ftp.admin_product_id,
  ftp.trial_quantity,
  ftp.daily_limit,
  ftp.today_used,
  ftp.daily_limit - ftp.today_used as remaining_today,
  ftp.is_active,
  ap.name as product_name,
  ap.price_per_1000,
  ap.min_quantity,
  ap.max_quantity,
  ap.primary_provider_id,
  ap.primary_service_id,
  ap.fallback1_provider_id,
  ap.fallback1_service_id,
  ap.fallback2_provider_id,
  ap.fallback2_service_id,
  ac.id as category_id,
  ac.platform as category_platform,
  ac.name as category_name
FROM free_trial_products ftp
JOIN admin_products ap ON ap.id = ftp.admin_product_id
LEFT JOIN admin_categories ac ON ac.id = ap.category_id
WHERE ftp.is_active = true
  AND ap.is_active = true;

-- 6. 일일 사용량 리셋 함수
CREATE OR REPLACE FUNCTION reset_free_trial_daily_usage()
RETURNS void AS $$
BEGIN
  UPDATE free_trial_products SET today_used = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. free_trials 테이블에 admin_product_id 컬럼 추가 (기존 service_id 유지)
ALTER TABLE free_trials ADD COLUMN IF NOT EXISTS admin_product_id UUID REFERENCES admin_products(id);
CREATE INDEX IF NOT EXISTS idx_free_trials_admin_product ON free_trials(admin_product_id);

-- 8. 무료체험 가용성 확인 함수 (admin_products 기반)
CREATE OR REPLACE FUNCTION check_free_trial_product_availability(
  p_user_id UUID,
  p_admin_product_id UUID
)
RETURNS TABLE(
  available BOOLEAN,
  quantity INTEGER,
  message TEXT
) AS $$
DECLARE
  v_trial_product free_trial_products%ROWTYPE;
  v_user_today_count INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- 무료체험 설정 확인
  SELECT * INTO v_trial_product
  FROM free_trial_products
  WHERE admin_product_id = p_admin_product_id AND is_active = true;

  IF v_trial_product.id IS NULL THEN
    RETURN QUERY SELECT false, 0, '해당 상품은 무료 체험을 제공하지 않습니다.'::TEXT;
    RETURN;
  END IF;

  -- 일일 한도 확인
  IF v_trial_product.today_used >= v_trial_product.daily_limit THEN
    RETURN QUERY SELECT false, 0, '오늘의 무료 체험 한도가 소진되었습니다.'::TEXT;
    RETURN;
  END IF;

  -- 사용자 오늘 사용 횟수 확인
  SELECT COUNT(*) INTO v_user_today_count
  FROM free_trials
  WHERE user_id = p_user_id
    AND admin_product_id = p_admin_product_id
    AND DATE(created_at) = v_today;

  IF v_user_today_count > 0 THEN
    RETURN QUERY SELECT false, 0, '오늘 이미 이 상품의 무료 체험을 사용하셨습니다.'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, v_trial_product.trial_quantity, '무료 체험 가능합니다.'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 무료체험 신청 함수 (admin_products 기반)
CREATE OR REPLACE FUNCTION request_free_trial_product(
  p_user_id UUID,
  p_admin_product_id UUID,
  p_link TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_trial_product free_trial_products%ROWTYPE;
  v_trial_id UUID;
BEGIN
  -- 무료체험 설정 가져오기
  SELECT * INTO v_trial_product
  FROM free_trial_products
  WHERE admin_product_id = p_admin_product_id AND is_active = true
  FOR UPDATE;

  IF v_trial_product.id IS NULL THEN
    RAISE EXCEPTION '해당 상품은 무료 체험을 제공하지 않습니다.';
  END IF;

  -- 일일 사용량 증가
  UPDATE free_trial_products
  SET today_used = today_used + 1
  WHERE id = v_trial_product.id;

  -- 무료체험 기록 생성
  INSERT INTO free_trials (
    user_id,
    admin_product_id,
    link,
    quantity,
    status,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_admin_product_id,
    p_link,
    v_trial_product.trial_quantity,
    'pending',
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_trial_id;

  RETURN v_trial_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
