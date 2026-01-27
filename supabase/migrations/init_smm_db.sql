-- =============================================
-- INFLUX SMM Panel - 데이터 초기화 스크립트
-- 생성일: 2026-01-27T13:14:06.533Z
-- 기존 테이블 사용: admin_products, admin_categories, api_providers
-- =============================================

-- 트랜잭션 시작
BEGIN;

-- =============================================
-- 1. 기존 데이터 정리 (선택적)
-- =============================================
-- 주의: 기존 데이터를 삭제합니다. 필요시 주석 처리하세요.
DELETE FROM admin_products WHERE TRUE;
-- DELETE FROM admin_categories WHERE TRUE;  -- 카테고리는 이미 추가되어 있으므로 주석 처리

-- =============================================
-- 2. API Providers 추가 (UPSERT)
-- =============================================

INSERT INTO api_providers (name, slug, api_url, api_key, is_active, priority)
VALUES ('SECSERS', 'secsers', 'https://secsers.com/api/v2', 'YOUR_SECSERS_API_KEY', true, 100)
ON CONFLICT (slug) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO api_providers (name, slug, api_url, api_key, is_active, priority)
VALUES ('BULKFOLLOWS', 'bulkfollows', 'https://bulkfollows.com/api/v2', 'YOUR_BULKFOLLOWS_API_KEY', true, 90)
ON CONFLICT (slug) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO api_providers (name, slug, api_url, api_key, is_active, priority)
VALUES ('JAP', 'jap', 'https://justanotherpanel.com/api/v2', 'YOUR_JAP_API_KEY', true, 80)
ON CONFLICT (slug) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO api_providers (name, slug, api_url, api_key, is_active, priority)
VALUES ('SMMKINGS', 'smmkings', 'https://smmkings.com/api/v2', 'YOUR_SMMKINGS_API_KEY', true, 70)
ON CONFLICT (slug) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO api_providers (name, slug, api_url, api_key, is_active, priority)
VALUES ('PEAKERR', 'peakerr', 'https://peakerr.com/api/v2', 'YOUR_PEAKERR_API_KEY', true, 60)
ON CONFLICT (slug) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO api_providers (name, slug, api_url, api_key, is_active, priority)
VALUES ('TOPSMM', 'topsmm', 'https://topsmm.club/api/v2', 'YOUR_TOPSMM_API_KEY', true, 50)
ON CONFLICT (slug) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO api_providers (name, slug, api_url, api_key, is_active, priority)
VALUES ('SMMHEAVEN', 'smmheaven', 'https://smmheaven.com/api/v2', 'YOUR_SMMHEAVEN_API_KEY', true, 40)
ON CONFLICT (slug) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO api_providers (name, slug, api_url, api_key, is_active, priority)
VALUES ('SMMFOLLOWS', 'smmfollows', 'https://smmfollows.com/api/v2', 'YOUR_SMMFOLLOWS_API_KEY', true, 30)
ON CONFLICT (slug) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO api_providers (name, slug, api_url, api_key, is_active, priority)
VALUES ('CHEAPESTPANEL', 'cheapestpanel', 'https://cheapestpanel.com/api/v2', 'YOUR_CHEAPESTPANEL_API_KEY', true, 20)
ON CONFLICT (slug) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- =============================================
-- 3. 카테고리 ID 조회를 위한 임시 테이블
-- =============================================
-- 이미 admin_categories에 카테고리가 있다고 가정

-- =============================================
-- 4. 상품 데이터 삽입
-- =============================================
-- [1] 🇰🇷 [한국인] 리얼 좋아요
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'instagram' ORDER BY sort_order LIMIT 1),
  '🇰🇷 [한국인] 리얼 좋아요',
  '원가: $0.227/1K | Instagram Likes - Real - No Refill - 2K - 2K/Day | Korean Mix',
  990,
  10,
  50000,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '4823',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '12985',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '8788',
  'link',
  1,
  true,
  true
);

-- [2] 🇰🇷 [한국인] 리얼 팔로워
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'instagram' ORDER BY sort_order LIMIT 1),
  '🇰🇷 [한국인] 리얼 팔로워',
  '원가: $14.4/1K | 🇰🇷 Instagram Followers [KOREA] [Start Time: 0 - 1 Hour] [Speed: 2K/Day]',
  62640,
  42,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '7845',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '5606',
  (SELECT id FROM api_providers WHERE slug = 'smmkings'),
  '5165',
  'link',
  2,
  true,
  true
);

-- [3] 🇰🇷 [한국인] 커스텀 댓글
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'instagram' ORDER BY sort_order LIMIT 1),
  '🇰🇷 [한국인] 커스텀 댓글',
  '원가: $0.25/1K | Instagram Verified Custom Comment with Blue Tick ✅ +500K Followers Influencer',
  1090,
  10,
  1,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '10314',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '8565',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '496',
  'link',
  3,
  true,
  true
);

-- [4] 🇰🇷 [한국인] 자동 좋아요
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'instagram' ORDER BY sort_order LIMIT 1),
  '🇰🇷 [한국인] 자동 좋아요',
  '원가: $0.035/1K | Instagram Auto Likes [HQ] [Refill: No] [Max: 500K] [Start Time: 0-3 Hrs] [Speed: 100K/D] 💧⛔️',
  150,
  3510,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '9575',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '7530',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '12493',
  'link',
  4,
  true,
  true
);

-- [5] ⚡ [외국인] 스피드 좋아요
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'instagram' ORDER BY sort_order LIMIT 1),
  '⚡ [외국인] 스피드 좋아요',
  '원가: $0.0113/1K | Instagram LQ Likes [Refill: No] [Max: 1M] [Start Time: 0 - 1 Hr] [Speed: 200K/D] 💧⛔️',
  30,
  10,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '10056',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '8216',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '7474',
  'link',
  5,
  true,
  true
);

-- [6] 🛡️ [외국인] AS보장 팔로워
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'instagram' ORDER BY sort_order LIMIT 1),
  '🛡️ [외국인] AS보장 팔로워',
  '원가: $0.468/1K | Instagram Followers [Max:10M] [Refill: NO] [Speed: Up to 100K/D] [Start Time: Instant] ⛔💧',
  1360,
  10,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '2981',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '2003',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '684',
  'link',
  6,
  true,
  true
);

-- [7] 💸 [외국인] 최저가 막팔로워
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'instagram' ORDER BY sort_order LIMIT 1),
  '💸 [외국인] 최저가 막팔로워',
  '원가: $0.0012/1K | Instagram - View + Extra 5% Likes + 5% Followers | MQ 2.1B🔝',
  10,
  100,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '19326',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '2981',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '10505',
  'link',
  7,
  true,
  true
);

-- [8] 📹 [릴스] 조회수 + 도달
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'instagram' ORDER BY sort_order LIMIT 1),
  '📹 [릴스] 조회수 + 도달',
  '원가: $0.0009/1K | Instagram Views | Any Link (Video,TV,Reels,Stories) | Instant | 0% Drop, NR, Cancel Button',
  10,
  100,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'topsmm'),
  '3733',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '237',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '16452',
  'link',
  8,
  true,
  false
);

-- [9] 👁️ [동영상] 조회수
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'instagram' ORDER BY sort_order LIMIT 1),
  '👁️ [동영상] 조회수',
  '원가: $0.0009/1K | Instagram - Views ( All Videos ) ~ 500k-1M/days ~ INSTANT',
  10,
  100,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '4996',
  (SELECT id FROM api_providers WHERE slug = 'topsmm'),
  '3733',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '25103',
  'link',
  9,
  true,
  false
);

-- [10] 📖 [스토리] 조회수 + 투표
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'instagram' ORDER BY sort_order LIMIT 1),
  '📖 [스토리] 조회수 + 투표',
  '원가: $0.0009/1K | Instagram Views | Any Link (Video,TV,Reels,Stories) | Instant | 0% Drop, NR, Cancel Button',
  10,
  100,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'topsmm'),
  '3733',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '5229',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '312',
  'link',
  10,
  true,
  false
);

-- [11] 📊 [인사이트] 노출/도달/저장
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'instagram' ORDER BY sort_order LIMIT 1),
  '📊 [인사이트] 노출/도달/저장',
  '원가: $0.0023/1K | Instagram - Auto Views + Impression ~ Max 5m ~ 𝐑𝐞𝐚𝐥 ~ Speed 100k/days ~ INSTANT',
  10,
  100,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '399',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '7672',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '23076',
  'link',
  11,
  true,
  false
);

-- [12] 🔴 [라이브] 방송 시청자
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'instagram' ORDER BY sort_order LIMIT 1),
  '🔴 [라이브] 방송 시청자',
  '원가: $0.02/1K | 💥 Instagram Views [50M] [10-50K/D] [0-30 MIN] [UPDATED] [WORKING WITH OVERDELIVERY]',
  60,
  100,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'smmheaven'),
  '2268',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '5083',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '169',
  'link',
  12,
  true,
  false
);

-- [13] 💬 [댓글] 외국인/이모티콘
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'instagram' ORDER BY sort_order LIMIT 1),
  '💬 [댓글] 외국인/이모티콘',
  '원가: $0.1/1K | Instagram Verified Comments | 1 Comment With Blue Tick ✅',
  290,
  10,
  1,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '10307',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '15662',
  (SELECT id FROM api_providers WHERE slug = 'topsmm'),
  '3693',
  'link',
  13,
  true,
  false
);

-- [14] 💙 [블루뱃지] 인증 계정
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'instagram' ORDER BY sort_order LIMIT 1),
  '💙 [블루뱃지] 인증 계정',
  '원가: $0.09/1K | Instagram Verified Likes | 1 Like With Blue Tick ✅',
  260,
  10,
  1,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '10312',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '6393',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '6031',
  'link',
  14,
  true,
  false
);

-- [15] 👀 [조회수] 고품질/논드랍
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'youtube' ORDER BY sort_order LIMIT 1),
  '👀 [조회수] 고품질/논드랍',
  '원가: $0.181/1K | Youtube Views | Adwords - Non Drop - Min 1M - Max 1M',
  520,
  1000000,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '11288',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '27544',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '10948',
  'link',
  15,
  true,
  false
);

-- [16] ⚡ [조회수] 빠른 유입
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'youtube' ORDER BY sort_order LIMIT 1),
  '⚡ [조회수] 빠른 유입',
  '원가: $0.049/1K | Youtube Live Stream Views [ 15 Minutes ] [ Cheapest Server - 100% ConCurrent ] [ Instant ]',
  140,
  50,
  50000,
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '27376',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '13911',
  (SELECT id FROM api_providers WHERE slug = 'smmheaven'),
  '1189',
  'link',
  16,
  true,
  false
);

-- [17] 📱 [쇼츠] 조회수
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'youtube' ORDER BY sort_order LIMIT 1),
  '📱 [쇼츠] 조회수',
  '원가: $0.572/1K | YouTube Shorts Views | Lifetime Refill | Max 2M | Day 5K',
  1660,
  100,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'cheapestpanel'),
  '197',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '5392',
  (SELECT id FROM api_providers WHERE slug = 'smmheaven'),
  '1843',
  'link',
  17,
  true,
  false
);

-- [18] 📱 [쇼츠] 좋아요/공유
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'youtube' ORDER BY sort_order LIMIT 1),
  '📱 [쇼츠] 좋아요/공유',
  '원가: $0.44/1K | YouTube Likes | For Shorts | Real | Speed: Up To 1K/Minute | No Drop | Refill Button: 30 Days | MAX ',
  1280,
  10,
  10,
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '13307',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '15202',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '19369',
  'link',
  18,
  true,
  false
);

-- [19] 👥 [구독자] 실제 유저
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'youtube' ORDER BY sort_order LIMIT 1),
  '👥 [구독자] 실제 유저',
  '원가: $0.636/1K | Youtube Subscribers | No Refill - Real - Max 20K - 500/Day',
  1840,
  100,
  50000,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '12358',
  (SELECT id FROM api_providers WHERE slug = 'smmkings'),
  '4074',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '4600',
  'link',
  19,
  true,
  false
);

-- [20] 👥 [구독자] 저가형
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'youtube' ORDER BY sort_order LIMIT 1),
  '👥 [구독자] 저가형',
  '원가: $0.125/1K | YouTube - Subscriber ~ 10k ~ 10k/days ~ INSTANT',
  360,
  10,
  500000,
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '5446',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '887',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '23304',
  'link',
  20,
  true,
  false
);

-- [21] ⏳ [시청시간] 4000시간
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'youtube' ORDER BY sort_order LIMIT 1),
  '⏳ [시청시간] 4000시간',
  '원가: $0.12/1K | YouTube Live Stream Views | 15 minutes | 80% - 120% Concurrent | Speed: Up To 20K/Hour | No Refill |',
  350,
  10,
  50,
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '12845',
  (SELECT id FROM api_providers WHERE slug = 'smmheaven'),
  '1189',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '17122',
  'link',
  21,
  true,
  false
);

-- [22] 👍 [좋아요/싫어요]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'youtube' ORDER BY sort_order LIMIT 1),
  '👍 [좋아요/싫어요]',
  '원가: $0.0605/1K | Youtube Live Stream Views + Likes [15 Minutes]',
  180,
  50,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '27583',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '11274',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '7452',
  'link',
  22,
  true,
  false
);

-- [23] 🔴 [라이브] 스트리밍 시청자
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'youtube' ORDER BY sort_order LIMIT 1),
  '🔴 [라이브] 스트리밍 시청자',
  '원가: $0.039/1K | YouTube Live Stream Views | 15 Minutes - 𝗖𝗵𝗲𝗮𝗽',
  110,
  50,
  50000,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '1805',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '27376',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '13911',
  'link',
  23,
  true,
  false
);

-- [24] 💬 [댓글]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'youtube' ORDER BY sort_order LIMIT 1),
  '💬 [댓글]',
  '원가: $0.104/1K | YouTube - Comment Likes ~ 𝗥𝗘𝗙𝗜𝗟𝗟 30D ~ 1k-10k/days ~ INSTANT',
  300,
  10,
  20000,
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '11537',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '24636',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '16546',
  'link',
  24,
  true,
  false
);

-- [25] ↗️ [공유]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'youtube' ORDER BY sort_order LIMIT 1),
  '↗️ [공유]',
  '원가: $0.25/1K | YouTube Social Shares | Mixed | Speed: Up To 8M/Day | Refill: 365 Days | MAX 50M',
  730,
  10,
  50,
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '11910',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '11911',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '4059',
  'link',
  25,
  true,
  false
);

-- [26] 📄 [페이지] 팔로워/좋아요
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'facebook' ORDER BY sort_order LIMIT 1),
  '📄 [페이지] 팔로워/좋아요',
  '원가: $0.123/1K | Facebook Page Followers [ 𝐀𝐧𝐲 𝐓𝐲𝐩𝐞 ] 60 Days Refill - 500K/Day',
  360,
  100,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '7511',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '7920',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '14201',
  'link',
  26,
  true,
  false
);

-- [27] 👤 [프로필] 팔로워/친구
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'facebook' ORDER BY sort_order LIMIT 1),
  '👤 [프로필] 팔로워/친구',
  '원가: $0.135/1K | Facebook Profile page Followers | 30 Days Refill - Real - 500k - 50k/day',
  390,
  100,
  200000,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '7920',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '9274',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '14201',
  'link',
  27,
  true,
  false
);

-- [28] 👍 [게시물] 좋아요
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'facebook' ORDER BY sort_order LIMIT 1),
  '👍 [게시물] 좋아요',
  '원가: $0.084/1K | Facebook - Post Reaction [ Like 👍 ] ~ 𝐍𝐎 𝗥𝗘𝗙𝗜𝗟𝗟 ~ 1k-10k/days ~ INSTANT',
  240,
  10,
  500000,
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '13601',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '7966',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '5382',
  'link',
  28,
  true,
  false
);

-- [29] 😍 [게시물] 이모티콘
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'facebook' ORDER BY sort_order LIMIT 1),
  '😍 [게시물] 이모티콘',
  '원가: $0.084/1K | Facebook - Post Reaction [ Like 👍 ] ~ 𝐍𝐎 𝗥𝗘𝗙𝗜𝗟𝗟 ~ 1k-10k/days ~ INSTANT',
  240,
  10,
  500000,
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '13601',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '13602',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '5382',
  'link',
  29,
  true,
  false
);

-- [30] 🔴 [라이브] 방송 시청자
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'facebook' ORDER BY sort_order LIMIT 1),
  '🔴 [라이브] 방송 시청자',
  '원가: $0.0399/1K | [ WC ] - Facebook Live Stream Viewers [ 15 Minutes ]',
  120,
  20,
  30000,
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '28009',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '28000',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '6074',
  'link',
  30,
  true,
  false
);

-- [31] 👁️ [동영상] 조회수
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'facebook' ORDER BY sort_order LIMIT 1),
  '👁️ [동영상] 조회수',
  '원가: $0.0063/1K | Facebook Reels Views [Max: 100M] [Start Time: 0-1 Hr] [Speed: Up to 5K/D] 💧',
  20,
  46,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '9572',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '9604',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '5788',
  'link',
  31,
  true,
  false
);

-- [32] 👥 [그룹] 멤버
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'facebook' ORDER BY sort_order LIMIT 1),
  '👥 [그룹] 멤버',
  '원가: $0.238/1K | Facebook Group Members | 30 Days Refill - Max 50K - Fast',
  690,
  500,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '13197',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '4354',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '1737',
  'link',
  32,
  true,
  false
);

-- [33] 👁️ [조회수] 바이럴
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'tiktok' ORDER BY sort_order LIMIT 1),
  '👁️ [조회수] 바이럴',
  '원가: $0.0003/1K | TikTok - Video Views | MQ 300M | Speed 10M P/D 🔥🔥🔝',
  10,
  100,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '14075',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '10120',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '4680',
  'link',
  33,
  true,
  false
);

-- [34] ❤️ [좋아요] 하트
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'tiktok' ORDER BY sort_order LIMIT 1),
  '❤️ [좋아요] 하트',
  '원가: $0.0048/1K | TikTok - Live Like ~ 𝐍𝐎 𝗥𝗘𝗙𝗜𝗟𝗟 ~ 5k-100k/days ~ INSTANT',
  10,
  10,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '13952',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '13953',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '25231',
  'link',
  34,
  true,
  false
);

-- [35] 👤 [팔로워]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'tiktok' ORDER BY sort_order LIMIT 1),
  '👤 [팔로워]',
  '원가: $0.147/1K | TikTok Followers [ Max 5M ] | LQ Accounts | Cancel Enable | Low Drop | No Refill ⚠️ | Instant Start ',
  430,
  10,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '28161',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '28162',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '3882',
  'link',
  35,
  true,
  false
);

-- [36] ↗️ [공유/저장]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'tiktok' ORDER BY sort_order LIMIT 1),
  '↗️ [공유/저장]',
  '원가: $0.0052/1K | TikTok Video Save [ Max Unlimited ] | HQ | Cancel Enable | Drop 0% | No Refill ⚠️ | Instant Start | ',
  20,
  100,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '28133',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '28134',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '14163',
  'link',
  36,
  true,
  false
);

-- [37] 🔴 [라이브] 시청자
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'tiktok' ORDER BY sort_order LIMIT 1),
  '🔴 [라이브] 시청자',
  '원가: $0.0048/1K | TikTok - Live Like ~ 𝐍𝐎 𝗥𝗘𝗙𝗜𝗟𝗟 ~ 5k-100k/days ~ INSTANT',
  10,
  10,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '13952',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '13953',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '25231',
  'link',
  37,
  true,
  false
);

-- [38] 💬 [댓글]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'tiktok' ORDER BY sort_order LIMIT 1),
  '💬 [댓글]',
  '원가: $0.084/1K | Tiktok - Comments | MQ 1K | 3 Comments | 100% Real Humans | Any Quality | Post-Related | Emojis & Te',
  240,
  1000,
  1000,
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '19856',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '11207',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '9322',
  'link',
  38,
  true,
  false
);

-- [39] 👤 [팔로워] 글로벌
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'twitter' ORDER BY sort_order LIMIT 1),
  '👤 [팔로워] 글로벌',
  '원가: $0.0012/1K | Twitter - New Followers Impression ~ Max 100M ~ Refill 30D ~ 100M/days ~ INSTANT',
  10,
  250,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '11100',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '11098',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '10350',
  'link',
  39,
  true,
  false
);

-- [40] 🇰🇷 [팔로워] 한국인
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'twitter' ORDER BY sort_order LIMIT 1),
  '🇰🇷 [팔로워] 한국인',
  '원가: $5.7625/1K | Twitter Asia Followers [JAPAN / KOREA / HK] [Refill: No] [Max: 50K] [Start Time: 0 - 3 Hours] [Speed',
  25070,
  50000,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '1019',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '1022',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '1333',
  'link',
  40,
  true,
  false
);

-- [41] 🔄 [리트윗]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'twitter' ORDER BY sort_order LIMIT 1),
  '🔄 [리트윗]',
  '원가: $0.0038/1K | Twitter Video Views [Refill: No Drop] [Max: 10M] [Start Time: 0 - 1 Hr] [Speed: 10M/Day]',
  10,
  38100,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '8239',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '6590',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '14720',
  'link',
  41,
  true,
  false
);

-- [42] ❤️ [좋아요]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'twitter' ORDER BY sort_order LIMIT 1),
  '❤️ [좋아요]',
  '원가: $0.1125/1K | Twitter Likes [Refill: No] [Max: 10K] [Start Time: 0 - 2 Hrs] [Speed: 10K/Day] ⛔💧',
  330,
  10000,
  112550,
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '9393',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '8858',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '12447',
  'link',
  42,
  true,
  false
);

-- [43] 📊 [조회수] 임프레션
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'twitter' ORDER BY sort_order LIMIT 1),
  '📊 [조회수] 임프레션',
  '원가: $0.0012/1K | Twitter - New Followers Impression ~ Max 100M ~ Refill 30D ~ 100M/days ~ INSTANT',
  10,
  250,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '11100',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '8239',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '8003',
  'link',
  43,
  true,
  false
);

-- [44] 🗳️ [투표]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'twitter' ORDER BY sort_order LIMIT 1),
  '🗳️ [투표]',
  '원가: $0.1/1K | Twitter Poll Votes [Refill: 30D] [Max: 20K] [Start Time: 0-2 Hours] [Speed: 20K/Day]',
  290,
  57,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '9015',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '5678',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '325',
  'link',
  44,
  true,
  false
);

-- [45] 🎙️ [스페이스] 청취자
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'twitter' ORDER BY sort_order LIMIT 1),
  '🎙️ [스페이스] 청취자',
  '원가: $0.112/1K | Twitter Space Listeners [ 5 Minutes ] Cheap',
  320,
  50,
  20000,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '10733',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '2214',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '7488',
  'link',
  45,
  true,
  false
);

-- [46] 👥 [채널/그룹] 멤버
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'telegram' ORDER BY sort_order LIMIT 1),
  '👥 [채널/그룹] 멤버',
  '원가: $0.05/1K | 🔥 Telegram Channel Members [Mixed - Max 50K] ⚡️⚡️',
  150,
  100,
  50000,
  (SELECT id FROM api_providers WHERE slug = 'smmkings'),
  '6330',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '7102',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '15050',
  'link',
  46,
  true,
  false
);

-- [47] 👁️ [조회수]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'telegram' ORDER BY sort_order LIMIT 1),
  '👁️ [조회수]',
  '원가: $0.002/1K | Telegram Post Views | Instant - Fast delivery - Cheapest',
  10,
  50,
  20000,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '5649',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '16475',
  (SELECT id FROM api_providers WHERE slug = 'peakerr'),
  '15974',
  'link',
  47,
  true,
  false
);

-- [48] 👍 [반응]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'telegram' ORDER BY sort_order LIMIT 1),
  '👍 [반응]',
  '원가: $0.009/1K | Telegram Reactions Positive [🥴💔🤨🖕😈] 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 | Lifetime Refill',
  30,
  10,
  200000,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '9210',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '4207',
  (SELECT id FROM api_providers WHERE slug = 'smmkings'),
  '6217',
  'link',
  48,
  true,
  false
);

-- [49] 🗳️ [투표]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'telegram' ORDER BY sort_order LIMIT 1),
  '🗳️ [투표]',
  '원가: $0.1519/1K | Telegram - Poll VOTE ~ INSTANT',
  440,
  10,
  100000,
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '5159',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '16478',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '7503',
  'link',
  49,
  true,
  false
);

-- [50] 👥 [멤버] 오프라인
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'discord' ORDER BY sort_order LIMIT 1),
  '👥 [멤버] 오프라인',
  '원가: $2.9231/1K | Discord - Members [ Offline] ~ 𝗥𝗘𝗙𝗜𝗟𝗟 30D ~ 2k/days ~ [Read Description]',
  8480,
  50,
  1000,
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '13100',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '13281',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '13099',
  'link',
  50,
  true,
  false
);

-- [51] 🟢 [멤버] 온라인
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'discord' ORDER BY sort_order LIMIT 1),
  '🟢 [멤버] 온라인',
  '원가: $4.62/1K | Discord Server Members | 🌍Location: Global | ❇️State: 24/7 Online | ✅Quality: High | ♻️Refill: 30 D',
  13400,
  10,
  50,
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '16601',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '13280',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '5642',
  'link',
  51,
  true,
  false
);

-- [52] 🚀 [부스트]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'discord' ORDER BY sort_order LIMIT 1),
  '🚀 [부스트]',
  '원가: $1.5786/1K | Discord x2 Server Boost [NO BOT] – 1 Month | 𝗥𝗘𝗙𝗜𝗟𝗟 30D',
  4580,
  10,
  1,
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '13103',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '13104',
  (SELECT id FROM api_providers WHERE slug = 'smmkings'),
  '6724',
  'link',
  52,
  true,
  false
);

-- [SKIP] 🤝 [친구]: 후보 없음

-- [54] 👤 [팔로워]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'threads' ORDER BY sort_order LIMIT 1),
  '👤 [팔로워]',
  '원가: $1.44/1K | Threads Followers [Refill: No] [Max: 500] [Start Time: 0-3 Hours] [Speed: Up to 500/Day] 💧⛔',
  4180,
  15,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '2127',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '2934',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '8025',
  'link',
  54,
  true,
  false
);

-- [55] ❤️ [좋아요]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'threads' ORDER BY sort_order LIMIT 1),
  '❤️ [좋아요]',
  '원가: $0.49/1K | YouTube Likes | Threads.net | Real | Speed: Up To 50K/Day | No Drop | Refill Button: 365 Days | MAX ',
  1420,
  10,
  10,
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '13357',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '2133',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '1010',
  'link',
  55,
  true,
  false
);

-- [56] 🔄 [리포스트]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform = 'threads' ORDER BY sort_order LIMIT 1),
  '🔄 [리포스트]',
  '원가: $5.093/1K | Threads Reshare',
  14770,
  10,
  5000,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '1011',
  (SELECT id FROM api_providers WHERE slug = 'jap'),
  '6835',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '8012',
  'link',
  56,
  true,
  false
);

-- [57] 🎧 [스트리밍] 재생수
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform IN ('spotify','soundcloud') ORDER BY sort_order LIMIT 1),
  '🎧 [스트리밍] 재생수',
  '원가: $0.1003/1K | Spotify Mobile Plays [GLOBAL] [MIX Premium - Free]',
  290,
  500,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '10881',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '7864',
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '8016',
  'link',
  57,
  true,
  false
);

-- [58] 👤 [팔로워/리스너]
INSERT INTO admin_products (
  category_id,
  name,
  description,
  price_per_1000,
  min_quantity,
  max_quantity,
  primary_provider_id,
  primary_service_id,
  fallback1_provider_id,
  fallback1_service_id,
  fallback2_provider_id,
  fallback2_service_id,
  input_type,
  sort_order,
  is_active,
  is_recommended
) VALUES (
  (SELECT id FROM admin_categories WHERE platform IN ('spotify','soundcloud') ORDER BY sort_order LIMIT 1),
  '👤 [팔로워/리스너]',
  '원가: $0.149/1K | Spotify Followers | No Refill - Max 1M - 25K/Day [All Links]',
  430,
  50,
  1000000,
  (SELECT id FROM api_providers WHERE slug = 'secsers'),
  '5790',
  (SELECT id FROM api_providers WHERE slug = 'bulkfollows'),
  '8623',
  (SELECT id FROM api_providers WHERE slug = 'smmfollows'),
  '7859',
  'link',
  58,
  true,
  false
);


-- =============================================
-- 5. 통계 확인
-- =============================================
SELECT
  '총 상품 수' as metric,
  COUNT(*) as value
FROM admin_products
WHERE is_active = true

UNION ALL

SELECT
  '총 카테고리 수' as metric,
  COUNT(DISTINCT category_id) as value
FROM admin_products

UNION ALL

SELECT
  '활성 API 공급자 수' as metric,
  COUNT(*) as value
FROM api_providers
WHERE is_active = true;

-- 트랜잭션 커밋
COMMIT;

-- =============================================
-- 완료!
-- =============================================
