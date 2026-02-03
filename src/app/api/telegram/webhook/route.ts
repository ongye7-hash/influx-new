// ============================================
// 텔레그램 Webhook API
// 메시지 및 버튼 콜백 처리
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  handleCommand,
  answerCallback,
  editMessage,
  sendTelegramMessage,
  getTelegramSettings,
} from '@/lib/services/telegram-bot';

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 메시지 처리 (명령어)
    if (body.message?.text) {
      const chatId = body.message.chat.id.toString();
      const text = body.message.text;

      // 권한 체크 (설정된 chat_id만 응답)
      const settings = await getTelegramSettings();
      if (settings?.chat_id !== chatId) {
        console.log('[Telegram] Unauthorized chat:', chatId);
        return NextResponse.json({ ok: true });
      }

      if (text.startsWith('/')) {
        const response = await handleCommand(text, chatId);
        await sendTelegramMessage(response);
      }
    }

    // 버튼 콜백 처리
    if (body.callback_query) {
      const callbackId = body.callback_query.id;
      const data = body.callback_query.data;
      const messageId = body.callback_query.message?.message_id;
      const chatId = body.callback_query.message?.chat?.id?.toString();

      // 권한 체크
      const settings = await getTelegramSettings();
      if (settings?.chat_id !== chatId) {
        await answerCallback(callbackId, '권한이 없습니다');
        return NextResponse.json({ ok: true });
      }

      const result = await handleCallback(data, messageId);
      await answerCallback(callbackId, result.toast);

      if (result.newText && messageId) {
        // sendAsNew가 true면 새 메시지로 전송 (원래 메시지 유지)
        if (result.sendAsNew) {
          await sendTelegramMessage(result.newText);
        } else {
          await editMessage(messageId, result.newText);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error);
    return NextResponse.json({ ok: true }); // 텔레그램은 항상 200 응답 필요
  }
}

// ============================================
// 콜백 핸들러
// ============================================

async function handleCallback(
  data: string,
  messageId?: number
): Promise<{ toast: string; newText?: string; sendAsNew?: boolean }> {
  const [action, id] = data.split(':');

  switch (action) {
    case 'approve_deposit':
      return await approveDeposit(id);

    case 'reject_deposit':
      return await rejectDeposit(id);

    case 'send_coupon':
      return await sendCouponToUser(id);

    case 'gift_balance':
      return await giftBalanceToUser(id);

    case 'list_pending':
      return await listPendingDeposits();

    case 'vip_welcome':
      return { toast: 'VIP 환영 메시지 기능 준비중', newText: undefined };

    case 'user_detail':
      return await getUserDetail(id);

    default:
      return { toast: '알 수 없는 액션' };
  }
}

async function approveDeposit(depositId: string): Promise<{ toast: string; newText?: string }> {
  console.log('[Telegram] Approving deposit ID:', depositId, 'Length:', depositId?.length);

  // ID 정리 (공백, 특수문자 제거)
  const cleanId = depositId?.trim();

  if (!cleanId) {
    return { toast: '잘못된 요청입니다' };
  }

  // 1. 먼저 정확한 ID로 조회
  let { data: deposit, error } = await getSupabase()
    .from('deposits')
    .select('id, amount, user_id, status, profiles(email, balance)')
    .eq('id', cleanId)
    .single();

  console.log('[Telegram] Exact match:', deposit ? `found (status: ${deposit.status})` : 'not found', error?.message || '');

  // 2. 못 찾으면 pending 상태에서 ID prefix로 재시도
  if (!deposit) {
    const { data: depositByPrefix } = await getSupabase()
      .from('deposits')
      .select('id, amount, user_id, status, profiles(email, balance)')
      .eq('status', 'pending')
      .ilike('id', `${cleanId}%`)
      .single();

    console.log('[Telegram] Prefix match:', depositByPrefix ? 'found' : 'not found');
    if (depositByPrefix) {
      deposit = depositByPrefix;
    }
  }

  // 3. 여전히 못 찾으면 모든 상태에서 ID prefix로 재시도
  if (!deposit) {
    const { data: depositAnyStatus } = await getSupabase()
      .from('deposits')
      .select('id, amount, user_id, status, profiles(email, balance)')
      .ilike('id', `${cleanId}%`)
      .single();

    console.log('[Telegram] Any status prefix match:', depositAnyStatus ? `found (status: ${depositAnyStatus.status})` : 'not found');
    if (depositAnyStatus) {
      deposit = depositAnyStatus;
    }
  }

  // 4. 여전히 못 찾으면 최신 대기중 건 사용 (버튼 ID가 맞지 않아도 처리)
  if (!deposit) {
    console.log('[Telegram] ID not found, trying latest pending deposit');

    const { data: latestPending } = await getSupabase()
      .from('deposits')
      .select('id, amount, user_id, status, profiles(email, balance)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestPending) {
      console.log('[Telegram] Using latest pending:', latestPending.id.substring(0, 8));
      return await processApprovalInternal(latestPending);
    }

    return { toast: '대기중인 충전 요청이 없습니다' };
  }

  return await processApprovalInternal(deposit);
}

async function processApprovalInternal(deposit: any): Promise<{ toast: string; newText?: string }> {
  if (deposit.status !== 'pending') {
    return { toast: `이미 처리된 요청입니다 (${deposit.status})` };
  }

  const profile = deposit.profiles as any;
  const newBalance = (profile?.balance || 0) + deposit.amount;

  // 잔액 업데이트
  const { error: balanceError } = await getSupabase()
    .from('profiles')
    .update({ balance: newBalance } as never)
    .eq('id', deposit.user_id);

  if (balanceError) {
    console.error('[Telegram] Balance update error:', balanceError);
    return { toast: '잔액 업데이트 실패' };
  }

  // 상태 업데이트
  await getSupabase()
    .from('deposits')
    .update({ status: 'approved', approved_at: new Date().toISOString() } as never)
    .eq('id', deposit.id);

  console.log('[Telegram] Deposit approved:', deposit.id);

  return {
    toast: '승인 완료!',
    newText: `✅ <b>승인 완료</b>
━━━━━━━━━━━━━━━
금액: ₩${deposit.amount.toLocaleString()}
유저: ${profile?.email}
처리: ${new Date().toLocaleString('ko-KR')}`,
  };
}

async function rejectDeposit(depositId: string): Promise<{ toast: string; newText?: string }> {
  console.log('[Telegram] Rejecting deposit:', depositId);

  const cleanId = depositId?.trim();
  if (!cleanId) {
    return { toast: '잘못된 요청입니다' };
  }

  // 1. 정확한 ID로 조회
  let { data: deposit } = await getSupabase()
    .from('deposits')
    .select('id, amount, status, profiles(email)')
    .eq('id', cleanId)
    .single();

  // 2. prefix로 재시도
  if (!deposit) {
    const { data: depositByPrefix } = await getSupabase()
      .from('deposits')
      .select('id, amount, status, profiles(email)')
      .eq('status', 'pending')
      .ilike('id', `${cleanId}%`)
      .single();

    if (depositByPrefix) {
      deposit = depositByPrefix;
    }
  }

  // 3. 모든 상태에서 prefix로 재시도
  if (!deposit) {
    const { data: depositAnyStatus } = await getSupabase()
      .from('deposits')
      .select('id, amount, status, profiles(email)')
      .ilike('id', `${cleanId}%`)
      .single();

    if (depositAnyStatus) {
      deposit = depositAnyStatus;
    }
  }

  // 4. 못 찾으면 최신 대기중 건 사용
  if (!deposit) {
    const { data: latestPending } = await getSupabase()
      .from('deposits')
      .select('id, amount, status, profiles(email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestPending) {
      deposit = latestPending;
    } else {
      return { toast: '대기중인 충전 요청이 없습니다' };
    }
  }

  if (deposit.status !== 'pending') {
    return { toast: `이미 처리됨 (${deposit.status})` };
  }

  await getSupabase()
    .from('deposits')
    .update({ status: 'rejected' } as never)
    .eq('id', deposit.id);

  console.log('[Telegram] Deposit rejected:', deposit.id);

  const profile = deposit.profiles as any;

  return {
    toast: '거절됨',
    newText: `❌ <b>거절됨</b>
━━━━━━━━━━━━━━━
금액: ₩${deposit.amount.toLocaleString()}
유저: ${profile?.email}
처리: ${new Date().toLocaleString('ko-KR')}`,
  };
}

async function sendCouponToUser(email: string): Promise<{ toast: string; newText?: string }> {
  const { data: profile } = await getSupabase()
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .single();

  if (!profile) {
    return { toast: '유저를 찾을 수 없습니다' };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const couponCode = `SPECIAL-${profile.id.substring(0, 4).toUpperCase()}`;

  await getSupabase().from('user_coupons').insert({
    user_id: profile.id,
    coupon_code: couponCode,
    coupon_type: 'percentage',
    discount_value: 10,
    expires_at: expiresAt.toISOString(),
    issue_reason: '텔레그램 수동 발송',
  } as never);

  return {
    toast: '쿠폰 발송됨!',
    newText: `🎫 <b>쿠폰 발송 완료</b>
━━━━━━━━━━━━━━━
유저: ${email}
쿠폰: ${couponCode}
할인: 10%
만료: ${expiresAt.toLocaleDateString('ko-KR')}`,
  };
}

async function giftBalanceToUser(email: string): Promise<{ toast: string; newText?: string }> {
  const { data: profile } = await getSupabase()
    .from('profiles')
    .select('id, email, balance')
    .eq('email', email)
    .single();

  if (!profile) {
    return { toast: '유저를 찾을 수 없습니다' };
  }

  const giftAmount = 5000; // 기본 5000원

  await getSupabase()
    .from('profiles')
    .update({ balance: profile.balance + giftAmount } as never)
    .eq('id', profile.id);

  return {
    toast: '잔액 지급됨!',
    newText: `🎁 <b>잔액 지급 완료</b>
━━━━━━━━━━━━━━━
유저: ${email}
지급액: ₩${giftAmount.toLocaleString()}
현재 잔액: ₩${(profile.balance + giftAmount).toLocaleString()}`,
  };
}

async function listPendingDeposits(): Promise<{ toast: string; newText?: string }> {
  const { data } = await getSupabase()
    .from('deposits')
    .select('id, amount, created_at, profiles(email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5);

  if (!data || data.length === 0) {
    return { toast: '대기중 없음', newText: '✅ 대기중인 충전이 없습니다.' };
  }

  let text = `⏳ <b>대기중 충전</b> (${data.length}건)\n━━━━━━━━━━━━━━━\n`;

  for (const d of data) {
    const email = (d.profiles as any)?.email || 'unknown';
    const shortEmail = email.length > 15 ? email.substring(0, 15) + '...' : email;
    text += `• ₩${d.amount.toLocaleString()} - ${shortEmail}\n`;
  }

  return { toast: '목록 로드됨', newText: text };
}

async function getUserDetail(email: string): Promise<{ toast: string; newText?: string; sendAsNew?: boolean }> {
  const { data: profile } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (!profile) {
    return { toast: '유저를 찾을 수 없습니다' };
  }

  // 총 주문 수
  const { count: orderCount } = await getSupabase()
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id);

  // 총 충전액
  const { data: deposits } = await getSupabase()
    .from('deposits')
    .select('amount')
    .eq('user_id', profile.id)
    .eq('status', 'approved');

  const totalDeposits = (deposits || []).reduce((sum, d) => sum + (d.amount || 0), 0);

  return {
    toast: '유저 정보',
    sendAsNew: true, // 새 메시지로 전송 (원래 승인/거절 버튼 유지)
    newText: `👤 <b>유저 상세</b>
━━━━━━━━━━━━━━━
이메일: ${profile.email}
잔액: ₩${profile.balance?.toLocaleString() || 0}
등급: ${profile.tier || 'bronze'}
가입일: ${new Date(profile.created_at).toLocaleDateString('ko-KR')}

📊 통계
• 총 주문: ${orderCount || 0}건
• 총 충전: ₩${totalDeposits.toLocaleString()}
${totalDeposits >= 1000000 ? '⭐ VIP 고객' : ''}`,
  };
}

// GET: Webhook 설정 확인용
export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook is active' });
}
