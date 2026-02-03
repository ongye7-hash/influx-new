-- ============================================
-- 고객 문의 (Support Tickets) 테이블
-- ============================================

-- 문의 테이블 생성
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('order', 'payment', 'refund', 'account', 'service', 'other')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  admin_reply TEXT,
  admin_id UUID REFERENCES auth.users(id),
  replied_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- RLS 활성화
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 문의만 조회 가능
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS 정책: 사용자는 문의 생성 가능
CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS 정책: 관리자는 모든 문의 조회/수정 가능
CREATE POLICY "Admins can manage all tickets"
  ON support_tickets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_support_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_support_ticket_updated_at ON support_tickets;
CREATE TRIGGER trigger_update_support_ticket_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_updated_at();

-- 문의 유형 한글 변환 함수
CREATE OR REPLACE FUNCTION get_ticket_type_label(ticket_type TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE ticket_type
    WHEN 'order' THEN '주문 관련'
    WHEN 'payment' THEN '결제/충전'
    WHEN 'refund' THEN '환불 요청'
    WHEN 'account' THEN '계정 문의'
    WHEN 'service' THEN '서비스 이용'
    WHEN 'other' THEN '기타'
    ELSE ticket_type
  END;
END;
$$ LANGUAGE plpgsql;
