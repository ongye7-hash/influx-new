// ============================================
// Welcome Bonus API
// 신규 가입 시 2,000원 웰컴 크레딧 자동 지급
// (이메일 가입 + OAuth 모두 지원)
// ============================================

import { NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';

const WELCOME_CREDIT = 2000;

export async function POST() {
  try {
    const supabase = await getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    // 이미 웰컴 보너스를 받았는지 확인
    const { data: existingBonus } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'bonus')
      .ilike('description', '%가입%')
      .limit(1);

    if (existingBonus && existingBonus.length > 0) {
      return NextResponse.json({
        success: true,
        already_granted: true,
        message: '이미 웰컴 크레딧을 받으셨습니다'
      });
    }

    // 웰컴 크레딧 지급
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.rpc as any)('add_balance', {
      p_user_id: user.id,
      p_amount: WELCOME_CREDIT,
      p_type: 'bonus',
      p_description: '🎉 가입 축하 웰컴 크레딧 2,000원',
      p_reference_type: 'welcome_bonus',
    });

    if (error) {
      console.error('[Welcome Bonus] RPC error:', error);
      return NextResponse.json({ error: '크레딧 지급 실패' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      already_granted: false,
      amount: WELCOME_CREDIT,
      message: '🎉 웰컴 크레딧 2,000원이 지급되었습니다!',
    });
  } catch (error) {
    console.error('[Welcome Bonus] Error:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
