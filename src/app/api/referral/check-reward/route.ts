// ============================================
// Referral Reward Check & Payout API
// 추천인 보상 조건 확인 및 자동 지급
// 입금 승인 후 호출됨
// ============================================

import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';

const REFERRAL_REWARD = {
  referrer: 3000,   // 추천인 보상
  referred: 2000,   // 피추천인 보상
  minDeposit: 10000, // 최소 충전 금액 조건
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseRouteClient();

    // 관리자 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    // 관리자 권한 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminProfile } = await (supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single() as any);

    if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const { user_id } = await request.json();
    if (!user_id) {
      return NextResponse.json({ error: 'user_id가 필요합니다' }, { status: 400 });
    }

    // 1. 해당 유저의 프로필 조회 (referred_by, total_spent)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userProfile, error: profileError } = await (supabase
      .from('profiles')
      .select('id, referred_by, total_spent')
      .eq('id', user_id)
      .single() as any);

    if (profileError || !userProfile) {
      return NextResponse.json({ error: '유저를 찾을 수 없습니다' }, { status: 404 });
    }

    // 2. 추천인이 없으면 종료
    if (!userProfile.referred_by) {
      return NextResponse.json({ success: true, rewarded: false, reason: 'no_referrer' });
    }

    // 3. 최소 충전 조건 미달이면 종료
    if ((userProfile.total_spent || 0) < REFERRAL_REWARD.minDeposit) {
      return NextResponse.json({ success: true, rewarded: false, reason: 'min_deposit_not_met' });
    }

    // 4. 이미 이 추천 건에 대해 보상이 지급되었는지 확인
    const { data: existingReward } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference_id', user_id)
      .eq('reference_type', 'referral')
      .eq('type', 'bonus')
      .limit(1);

    if (existingReward && existingReward.length > 0) {
      return NextResponse.json({ success: true, rewarded: false, reason: 'already_rewarded' });
    }

    // 5. referred_by는 추천인의 profile UUID
    const referrerId = userProfile.referred_by;

    // 6. 추천인에게 보상 지급
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: referrerError } = await (supabase.rpc as any)('add_balance', {
      p_user_id: referrerId,
      p_amount: REFERRAL_REWARD.referrer,
      p_type: 'bonus',
      p_description: `🎁 추천 보상 - 친구 가입 & 충전 완료 (+${REFERRAL_REWARD.referrer.toLocaleString()}원)`,
      p_reference_id: user_id,
      p_reference_type: 'referral',
    });

    if (referrerError) {
      console.error('[Referral] Referrer reward error:', referrerError);
      return NextResponse.json({ error: '추천인 보상 지급 실패' }, { status: 500 });
    }

    // 7. 피추천인에게 보상 지급
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: referredError } = await (supabase.rpc as any)('add_balance', {
      p_user_id: user_id,
      p_amount: REFERRAL_REWARD.referred,
      p_type: 'bonus',
      p_description: `🎁 추천인 보상 - 추천 코드로 가입 혜택 (+${REFERRAL_REWARD.referred.toLocaleString()}원)`,
      p_reference_id: referrerId,
      p_reference_type: 'referral',
    });

    if (referredError) {
      console.error('[Referral] Referred reward error:', referredError);
      // 추천인은 이미 받았으므로 로그만 남김
    }

    return NextResponse.json({
      success: true,
      rewarded: true,
      referrer_reward: REFERRAL_REWARD.referrer,
      referred_reward: referredError ? 0 : REFERRAL_REWARD.referred,
    });
  } catch (error) {
    console.error('[Referral Check] Error:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
