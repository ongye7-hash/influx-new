// ============================================
// Cryptomus 웹훅 API
// 결제 상태 변경 시 자동 잔액 충전
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
// 설정
// ============================================
const CRYPTOMUS_API_KEY = process.env.CRYPTOMUS_API_KEY!;
const ALLOWED_IPS = ['91.227.144.54'];

// ============================================
// 서명 검증
// ============================================
function verifySign(body: Record<string, unknown>): boolean {
  const receivedSign = body.sign as string;
  if (!receivedSign) return false;

  // sign 필드 제거 후 서명 계산
  const { sign: _, ...bodyWithoutSign } = body;
  const jsonStr = JSON.stringify(bodyWithoutSign);
  const base64 = Buffer.from(jsonStr).toString('base64');
  const expectedSign = crypto.createHash('md5').update(base64 + CRYPTOMUS_API_KEY).digest('hex');

  return receivedSign === expectedSign;
}

// ============================================
// POST Handler
// ============================================
export async function POST(request: NextRequest) {
  try {
    // IP 화이트리스트 검증
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || '';

    if (ALLOWED_IPS.length > 0 && !ALLOWED_IPS.includes(clientIp)) {
      console.warn('[Webhook] Unauthorized IP:', clientIp);
      // 프로덕션에서는 IP 체크, 개발 중에는 서명만으로 검증
      // return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // 서명 검증
    if (!verifySign(body)) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const { status, order_id, uuid, txid } = body;

    console.log(`[Webhook] Payment ${uuid} status: ${status}, order: ${order_id}`);

    // paid 또는 paid_over 상태만 처리
    if (status !== 'paid' && status !== 'paid_over') {
      // 실패/취소 상태 업데이트
      if (status === 'fail' || status === 'cancel' || status === 'wrong_amount') {
        await getSupabaseAdmin()
          .from('deposits')
          .update({
            status: 'rejected',
            admin_note: `Cryptomus: ${status}`,
          })
          .eq('id', order_id)
          .eq('status', 'pending');
      }

      return NextResponse.json({ success: true });
    }

    // 중복 처리 방지: 이미 approved면 skip
    const { data: deposit } = await getSupabaseAdmin()
      .from('deposits')
      .select('id, user_id, amount, status')
      .eq('id', order_id)
      .single();

    if (!deposit) {
      console.error('[Webhook] Deposit not found:', order_id);
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    if (deposit.status === 'approved') {
      console.log('[Webhook] Already approved, skipping:', order_id);
      return NextResponse.json({ success: true });
    }

    // txid 업데이트
    if (txid) {
      await getSupabaseAdmin()
        .from('deposits')
        .update({ tx_id: txid })
        .eq('id', order_id);
    }

    // 잔액 충전 (add_balance RPC)
    const { error: balanceError } = await getSupabaseAdmin().rpc('add_balance', {
      p_user_id: deposit.user_id,
      p_amount: deposit.amount,
    });

    if (balanceError) {
      console.error('[Webhook] add_balance error:', balanceError);
      return NextResponse.json({ error: 'Balance update failed' }, { status: 500 });
    }

    // deposit 상태 업데이트
    await getSupabaseAdmin()
      .from('deposits')
      .update({
        status: 'approved',
        admin_note: `Cryptomus auto-approved (${status})`,
        approved_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    console.log(`[Webhook] Deposit ${order_id} approved. Amount: ${deposit.amount}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhook] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
