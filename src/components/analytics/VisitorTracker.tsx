'use client';

// ============================================
// 방문자 추적 컴포넌트
// 모든 페이지 방문을 추적하여 서버로 전송
// ============================================

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// 세션 ID 생성/가져오기
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('influx_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('influx_session_id', sessionId);
  }
  return sessionId;
}

export function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string>('');

  useEffect(() => {
    // 같은 페이지 중복 추적 방지
    const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    if (fullPath === lastTrackedPath.current) return;
    lastTrackedPath.current = fullPath;

    // 봇 제외
    const userAgent = navigator.userAgent.toLowerCase();
    if (/bot|crawler|spider|crawling/i.test(userAgent)) return;

    // 관리자 페이지 제외
    if (pathname.startsWith('/admin')) return;

    // API 호출
    const trackVisit = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            title: document.title,
            referrer: document.referrer,
            sessionId: getSessionId(),
            fullUrl: window.location.href,
          }),
        });
      } catch (error) {
        // 추적 실패해도 무시 (사용자 경험에 영향 없음)
        console.debug('[Tracker] Failed:', error);
      }
    };

    // 약간의 딜레이 후 추적 (페이지 로드 완료 후)
    const timer = setTimeout(trackVisit, 100);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null; // UI 없음
}
