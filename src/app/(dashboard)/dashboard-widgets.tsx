// ============================================
// Dashboard Widgets (Client Component)
// 대시보드 전역 위젯 (카카오톡 버튼, 웰컴 알림 등)
// ============================================

'use client';

import { useEffect } from 'react';
import { KakaoChatButton } from '@/components/kakao-chat-button';
import { toast } from 'sonner';

export function DashboardWidgets() {
  // 웰컴 보너스 이벤트 리스너 - 신규 가입자에게 쿠폰 코드 안내
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      toast.success(`🎉 환영합니다! ${detail.amount?.toLocaleString()}원이 지급되었습니다`, {
        description: '첫충전 20% 쿠폰 코드: INFLUX2026',
        duration: 8000,
      });
    };
    window.addEventListener('influx:welcome-bonus', handler);
    return () => window.removeEventListener('influx:welcome-bonus', handler);
  }, []);

  return (
    <>
      <KakaoChatButton />
    </>
  );
}
