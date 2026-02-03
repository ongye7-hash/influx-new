-- ============================================
-- 사용자 알림 설정 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 이메일 알림
  email_notifications BOOLEAN DEFAULT TRUE,
  order_notifications BOOLEAN DEFAULT TRUE,
  marketing_notifications BOOLEAN DEFAULT FALSE,

  -- 텔레그램 알림
  telegram_notifications BOOLEAN DEFAULT FALSE,
  telegram_chat_id TEXT,

  -- 잔액 알림
  balance_alert_enabled BOOLEAN DEFAULT FALSE,
  balance_alert_threshold INTEGER DEFAULT 10000,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user_id ON user_notification_settings(user_id);

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_notification_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_notification_settings_timestamp ON user_notification_settings;
CREATE TRIGGER trigger_update_notification_settings_timestamp
  BEFORE UPDATE ON user_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_settings_timestamp();

-- RLS 활성화
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 설정만 조회/수정 가능
CREATE POLICY "users_can_read_own_notification_settings"
  ON user_notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_notification_settings"
  ON user_notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_notification_settings"
  ON user_notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- 어드민은 모든 설정 조회 가능
CREATE POLICY "admins_can_read_all_notification_settings"
  ON user_notification_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
