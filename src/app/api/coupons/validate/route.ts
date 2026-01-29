// ============================================
// Coupon Validation & Redemption API
// 쿠폰 검증 및 적용
// ============================================

import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';

// GET: 쿠폰 코드 검증 (적용 전 확인)
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const code = request.nextUrl.searchParams.get('code');
    if (!code) {
      return NextResponse.json({ error: '쿠폰 코드를 입력해주세요' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: couponData, error } = await (supabase.from('coupons') as any)
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    const coupon = couponData as { id: string; code: string; type: 'fixed' | 'percent'; value: number; min_amount: number; max_uses: number | null; used_count: number; expires_at: string | null; is_active: boolean } | null;

    if (error || !coupon) {
      return NextResponse.json({ error: '유효하지 않은 쿠폰 코드입니다' }, { status: 404 });
    }

    // 만료 확인
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: '만료된 쿠폰입니다' }, { status: 400 });
    }

    // 사용 횟수 확인
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: '사용 한도를 초과한 쿠폰입니다' }, { status: 400 });
    }

    // 이미 이 유저가 사용했는지 확인
    const { data: usedBefore } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'bonus')
      .eq('reference_id', coupon.id)
      .eq('reference_type', 'coupon')
      .limit(1);

    if (usedBefore && usedBefore.length > 0) {
      return NextResponse.json({ error: '이미 사용한 쿠폰입니다' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        min_amount: coupon.min_amount,
      },
    });
  } catch (error) {
    console.error('[Coupon Validate] Error:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// POST: 쿠폰 적용 (충전 시 보너스 지급)
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { code, deposit_amount } = await request.json();

    if (!code || !deposit_amount) {
      return NextResponse.json({ error: '쿠폰 코드와 충전 금액이 필요합니다' }, { status: 400 });
    }

    // 쿠폰 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: couponData2, error } = await (supabase.from('coupons') as any)
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    const coupon = couponData2 as { id: string; code: string; type: 'fixed' | 'percent'; value: number; min_amount: number; max_uses: number | null; used_count: number; expires_at: string | null; is_active: boolean } | null;

    if (error || !coupon) {
      return NextResponse.json({ error: '유효하지 않은 쿠폰 코드입니다' }, { status: 404 });
    }

    // 검증
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: '만료된 쿠폰입니다' }, { status: 400 });
    }
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: '사용 한도를 초과한 쿠폰입니다' }, { status: 400 });
    }
    if (deposit_amount < coupon.min_amount) {
      return NextResponse.json({
        error: `최소 ${coupon.min_amount.toLocaleString()}원 이상 충전 시 사용 가능합니다`
      }, { status: 400 });
    }

    // 중복 사용 확인
    const { data: usedBefore } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'bonus')
      .eq('reference_id', coupon.id)
      .eq('reference_type', 'coupon')
      .limit(1);

    if (usedBefore && usedBefore.length > 0) {
      return NextResponse.json({ error: '이미 사용한 쿠폰입니다' }, { status: 400 });
    }

    // 보너스 계산
    let bonusAmount: number;
    if (coupon.type === 'percent') {
      bonusAmount = Math.floor(deposit_amount * (coupon.value / 100));
    } else {
      bonusAmount = coupon.value;
    }

    // 보너스 지급
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: rpcError } = await (supabase.rpc as any)('add_balance', {
      p_user_id: user.id,
      p_amount: bonusAmount,
      p_type: 'bonus',
      p_description: `🎫 쿠폰 적용 (${coupon.code}) +${bonusAmount.toLocaleString()}원`,
      p_reference_id: coupon.id,
      p_reference_type: 'coupon',
    });

    if (rpcError) {
      console.error('[Coupon Apply] RPC error:', rpcError);
      return NextResponse.json({ error: '쿠폰 적용 실패' }, { status: 500 });
    }

    // 쿠폰 사용 횟수 증가
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('coupons') as any)
      .update({ used_count: coupon.used_count + 1 })
      .eq('id', coupon.id);

    return NextResponse.json({
      success: true,
      bonus_amount: bonusAmount,
      message: `🎫 쿠폰 적용 완료! +${bonusAmount.toLocaleString()}원 보너스 지급`,
    });
  } catch (error) {
    console.error('[Coupon Apply] Error:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
