// ============================================
// OAuth Callback Handler
// Google/Kakao 로그인 콜백 처리 + 웰컴 크레딧 지급
// ============================================

import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';

const WELCOME_CREDIT = 2000; // 가입 즉시 2,000원 지급

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await getSupabaseRouteClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 웰컴 크레딧 지급 (신규 사용자 감지)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // 이미 웰컴 보너스를 받았는지 확인
          const { data: existingBonus } = await supabase
            .from('transactions')
            .select('id')
            .eq('user_id', user.id)
            .eq('type', 'bonus')
            .ilike('description', '%가입%')
            .limit(1);

          if (!existingBonus || existingBonus.length === 0) {
            // 웰컴 크레딧 지급
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.rpc as any)('add_balance', {
              p_user_id: user.id,
              p_amount: WELCOME_CREDIT,
              p_type: 'bonus',
              p_description: '🎉 가입 축하 웰컴 크레딧 2,000원',
              p_reference_type: 'welcome_bonus',
            });
          }
        }
      } catch (e) {
        // 웰컴 크레딧 지급 실패해도 로그인은 진행
        console.error('[Auth Callback] Welcome credit error:', e);
      }

      // 로그인 성공 시 비회원 모드 쿠키 삭제
      const response = NextResponse.redirect(new URL(next, requestUrl.origin));
      response.cookies.set('influx_guest_mode', '', {
        path: '/',
        expires: new Date(0), // 즉시 만료
      });
      return response;
    }
  }

  // 오류 발생 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(
    new URL('/login?error=auth_error', requestUrl.origin)
  );
}
