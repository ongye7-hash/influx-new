// ============================================
// Cryptomus 결제 생성 API
// KRW 금액 → USDT 환산 → Cryptomus 인보이스 생성
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// ============================================
// Supabase Admin Client (lazy initialization)
// ============================================
let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabaseAdmin;
}

// ============================================
// Cryptomus 설정
// ============================================
const CRYPTOMUS_API_URL = 'https://api.cryptomus.com/v1/payment';
const CRYPTOMUS_API_KEY = process.env.CRYPTOMUS_API_KEY!;
const CRYPTOMUS_MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID!;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.influx-lab.com';

// ============================================
// 환율 조회 (내부 호출)
// ============================================
async function getExchangeRate(): Promise<number> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=krw', {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    const rate = data?.tether?.krw;
    if (typeof rate === 'number' && rate > 0) {
      // 1.5% 마진 적용
      return Math.ceil(rate * 1.015);
    }
  } catch (e) {
    console.error('[CreatePayment] Exchange rate fetch failed:', e);
  }
  return Math.ceil(1450 * 1.015); // fallback
}

// ============================================
// POST Handler
// ============================================
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await getSupabaseAdmin().auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: '유효하지 않은 인증입니다' }, { status: 401 });
    }

    // 요청 파싱
    const body = await request.json();
    const krwAmount = parseInt(body.amount, 10);

    if (!krwAmount || krwAmount < 10000) {
      return NextResponse.json({ error: '최소 충전 금액은 10,000원입니다' }, { status: 400 });
    }

    // 환율 조회 & USDT 계산
    const systemRate = await getExchangeRate();
    const usdtAmount = (krwAmount / systemRate).toFixed(2);

    // deposits 레코드 생성
    const { data: deposit, error: depositError } = await getSupabaseAdmin()
      .from('deposits')
      .insert({
        user_id: user.id,
        amount: krwAmount,
        depositor_name: 'Cryptomus',
        payment_method: 'crypto',
        exchange_rate: systemRate,
        crypto_amount: parseFloat(usdtAmount),
        crypto_currency: 'USDT',
        network: 'TRC-20',
        status: 'pending',
      })
      .select('id')
      .single();

    if (depositError) {
      console.error('[CreatePayment] Deposit insert error:', depositError);
      return NextResponse.json({ error: '충전 요청 생성 실패', details: depositError.message }, { status: 500 });
    }

    // Cryptomus 인보이스 생성
    const paymentBody: Record<string, unknown> = {
      amount: usdtAmount,
      currency: 'USDT',
      network: 'tron',
      order_id: String(deposit.id),
      url_callback: `${SITE_URL}/api/crypto/webhook`,
      url_return: `${SITE_URL}/deposit`,
      url_success: `${SITE_URL}/deposit?status=success`,
      lifetime: 3600,
      is_payment_multiple: false,
    };

    const jsonBody = JSON.stringify(paymentBody);
    const base64Body = Buffer.from(jsonBody).toString('base64');
    const sign = crypto.createHash('md5').update(base64Body + CRYPTOMUS_API_KEY).digest('hex');

    const cryptomusRes = await fetch(CRYPTOMUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        merchant: CRYPTOMUS_MERCHANT_ID,
        sign,
      },
      body: jsonBody,
    });

    const cryptomusData = await cryptomusRes.json();

    if (!cryptomusRes.ok || !cryptomusData?.result?.url) {
      console.error('[CreatePayment] Cryptomus API error:', JSON.stringify(cryptomusData));

      // 실패 시 deposit 레코드 삭제
      await getSupabaseAdmin().from('deposits').delete().eq('id', deposit.id);

      return NextResponse.json(
        { error: 'Cryptomus 결제 생성 실패', details: cryptomusData?.message },
        { status: 502 }
      );
    }

    // deposit에 Cryptomus UUID 저장
    await getSupabaseAdmin()
      .from('deposits')
      .update({ tx_id: cryptomusData.result.uuid })
      .eq('id', deposit.id);

    return NextResponse.json({
      success: true,
      data: {
        payment_url: cryptomusData.result.url,
        uuid: cryptomusData.result.uuid,
        amount_usdt: usdtAmount,
        exchange_rate: systemRate,
        deposit_id: deposit.id,
      },
    });
  } catch (error) {
    console.error('[CreatePayment] Unexpected error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
