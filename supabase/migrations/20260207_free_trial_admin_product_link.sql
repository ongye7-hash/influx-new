-- =============================================
-- 무료체험 → admin_products 연동
-- 2026-02-07
-- =============================================

-- 1. free_trial_services 테이블에 admin_product_id 컬럼 추가
ALTER TABLE free_trial_services
ADD COLUMN IF NOT EXISTS admin_product_id UUID REFERENCES admin_products(id);

-- 2. 기존 무료체험 서비스에 admin_product_id 매핑
-- 한국인 팔로워 → 인스타 외국인 AS보장 팔로워
UPDATE free_trial_services
SET admin_product_id = '188ce35e-15d3-4762-b374-4c6c784c105a'
WHERE service_id = 'e9e7804e-e887-44a3-9cab-dfb5cb47da2f';

-- 인스타 좋아요 → 외국인 스피드 좋아요
UPDATE free_trial_services
SET admin_product_id = 'a8f9cd28-296d-4145-b547-696781a911c9'
WHERE service_id = '7b104deb-8e89-4c3e-8b20-493ed8a37671';

-- 유튜브 조회수 → 빠른 유입
UPDATE free_trial_services
SET admin_product_id = 'b14ce729-f37e-448d-a886-5cf3ee3d5849'
WHERE service_id = '58b410b7-7323-44c0-b90f-a8fd6cbcc5db';

-- 틱톡 팔로워 → 외국인 리얼 팔로워
UPDATE free_trial_services
SET admin_product_id = 'd4f6c24b-8f69-4c84-9aa1-617000a862c7'
WHERE service_id = '1b0db207-8942-40bb-8e40-22629edae191';

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_free_trial_services_admin_product
ON free_trial_services(admin_product_id);

-- 4. 틱톡 좋아요 무료체험 서비스 추가 (services 테이블에 추가)
INSERT INTO services (id, name, description, rate, price, margin, min_quantity, max_quantity, is_active, quality)
VALUES (
  gen_random_uuid(),
  '🎁 [무료체험] 틱톡 좋아요',
  '틱톡 좋아요 무료 체험',
  1.0000,
  2000.0000,
  30.00,
  10,
  10,
  true,
  'high_quality'
)
ON CONFLICT DO NOTHING;

-- 5. available_free_trials VIEW 업데이트 (admin_product_id 포함)
DROP VIEW IF EXISTS available_free_trials;

CREATE VIEW available_free_trials AS
SELECT
  fts.id,
  fts.service_id,
  fts.admin_product_id,
  s.name,
  s.description,
  fts.trial_quantity as quantity,
  fts.daily_limit,
  fts.today_used,
  fts.is_active
FROM free_trial_services fts
JOIN services s ON s.id = fts.service_id
WHERE fts.is_active = true
  AND s.is_active = true
  AND fts.admin_product_id IS NOT NULL;
