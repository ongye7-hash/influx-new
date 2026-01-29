// ============================================
// Set Referrer API
// 회원가입 후 referred_by 필드 설정
// referral_code → profile UUID 변환 후 저장
// ============================================

import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseRouteClient();

    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { referral_code } = await request.json();
    if (!referral_code) {
      return NextResponse.json({ success: true, set: false, reason: 'no_code' });
    }

    // 이미 referred_by가 설정되어 있으면 스킵
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: myProfile } = await (supabase
      .from('profiles')
      .select('referred_by')
      .eq('id', user.id)
      .single() as any);

    if (myProfile?.referred_by) {
      return NextResponse.json({ success: true, set: false, reason: 'already_set' });
    }

    // referral_code로 추천인 프로필 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: referrer } = await (supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', referral_code)
      .single() as any);

    if (!referrer) {
      return NextResponse.json({ success: true, set: false, reason: 'referrer_not_found' });
    }

    // 자기 자신 추천 방지
    if (referrer.id === user.id) {
      return NextResponse.json({ success: true, set: false, reason: 'self_referral' });
    }

    // referred_by에 추천인 UUID 저장
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('profiles') as any)
      .update({ referred_by: referrer.id })
      .eq('id', user.id);

    if (error) {
      console.error('[Referral] Set referrer error:', error);
      return NextResponse.json({ error: '추천인 설정 실패' }, { status: 500 });
    }

    return NextResponse.json({ success: true, set: true, referrer_id: referrer.id });
  } catch (error) {
    console.error('[Referral Set] Error:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
