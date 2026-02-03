// ============================================
// 자동화 엔진
// 규칙 기반 자동 처리 시스템
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  sendTelegramMessage,
  notifyLargeDeposit,
  notifySleepingWhale,
  notifyProviderFailure,
  notifyNewVip,
  getTelegramSettings,
} from './telegram-bot';

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
}

// ============================================
// Types
// ============================================
export interface AutomationRule {
  id: string;
  rule_type: string;
  enabled: boolean;
  conditions: Record<string, any>;
  actions: Record<string, any>;
}

export interface AutomationSettings {
  auto_approve_deposit: boolean;
  auto_approve_max_amount: number;
  auto_approve_existing_only: boolean;
  auto_coupon_sleeping_whale: boolean;
  auto_coupon_days_inactive: number;
  auto_coupon_min_balance: number;
  auto_coupon_discount_percent: number;
  auto_refund_failed_orders: boolean;
  provider_balance_alert: boolean;
  provider_balance_threshold: number; // USD
}

// ============================================
// Settings
// ============================================

export async function getAutomationSettings(): Promise<AutomationSettings> {
  const { data } = await getSupabase()
    .from('admin_settings')
    .select('value')
    .eq('key', 'automation')
    .single();

  return data?.value as AutomationSettings || {
    auto_approve_deposit: false,
    auto_approve_max_amount: 50000,
    auto_approve_existing_only: true,
    auto_coupon_sleeping_whale: false,
    auto_coupon_days_inactive: 14,
    auto_coupon_min_balance: 20000,
    auto_coupon_discount_percent: 10,
    auto_refund_failed_orders: false,
    provider_balance_alert: true,
    provider_balance_threshold: 100,
  };
}

// ============================================
// Automation Actions
// ============================================

/**
 * 충전 요청 자동 처리
 */
export async function processDeposit(deposit: {
  id: string;
  amount: number;
  user_id: string;
  method: string;
}): Promise<{ autoApproved: boolean; notified: boolean }> {
  const settings = await getAutomationSettings();
  const telegram = await getTelegramSettings();

  // 유저 정보 조회
  const { data: profile } = await getSupabase()
    .from('profiles')
    .select('email, balance')
    .eq('id', deposit.user_id)
    .single();

  // 누적 충전액 조회 (승인된 것만)
  const { data: approvedDeposits } = await getSupabase()
    .from('deposits')
    .select('amount')
    .eq('user_id', deposit.user_id)
    .eq('status', 'approved');

  // 전체 충전 요청 횟수
  const { count: depositCount } = await getSupabase()
    .from('deposits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', deposit.user_id);

  const totalDeposits = (approvedDeposits || []).reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalRequests = depositCount || 0;
  const isExistingCustomer = totalDeposits > 0;

  // 자동 승인 조건 체크
  const canAutoApprove =
    settings.auto_approve_deposit &&
    deposit.amount <= settings.auto_approve_max_amount &&
    (!settings.auto_approve_existing_only || isExistingCustomer);

  if (canAutoApprove) {
    // 자동 승인 처리
    const { error: balanceError } = await getSupabase()
      .from('profiles')
      .update({ balance: (profile?.balance || 0) + deposit.amount } as never)
      .eq('id', deposit.user_id);

    if (!balanceError) {
      await getSupabase()
        .from('deposits')
        .update({ status: 'approved', approved_at: new Date().toISOString() } as never)
        .eq('id', deposit.id);

      // 자동화 로그 기록
      await logAutomation('auto_approve_deposit', {
        deposit_id: deposit.id,
        amount: deposit.amount,
        user_email: profile?.email,
      });

      // VIP 체크 (누적 100만원 이상)
      if (totalDeposits + deposit.amount >= 1000000 && totalDeposits < 1000000) {
        await notifyNewVip({
          email: profile?.email || 'unknown',
          totalDeposits: totalDeposits + deposit.amount,
        });
      }

      return { autoApproved: true, notified: false };
    }
  }

  // 자동 승인 안됨 → 알림 발송 (큰 금액이면)
  if (telegram?.notify_large_deposit && deposit.amount >= (telegram.large_deposit_threshold || 50000)) {
    await notifyLargeDeposit({
      id: deposit.id,
      amount: deposit.amount,
      userEmail: profile?.email || 'unknown',
      totalDeposits,
      totalRequests,
      currentBalance: profile?.balance || 0,
    });
    return { autoApproved: false, notified: true };
  }

  return { autoApproved: false, notified: false };
}

/**
 * 잠자는 큰손 자동 처리 (스케줄러에서 호출)
 */
export async function processSleepingWhales(): Promise<{
  processed: number;
  couponsSent: number;
}> {
  const settings = await getAutomationSettings();

  if (!settings.auto_coupon_sleeping_whale) {
    return { processed: 0, couponsSent: 0 };
  }

  // 잠자는 큰손 조회
  const { data: whales } = await getSupabase()
    .from('sleeping_whales')
    .select('*')
    .gte('balance', settings.auto_coupon_min_balance)
    .gte('days_inactive', settings.auto_coupon_days_inactive);

  if (!whales || whales.length === 0) {
    return { processed: 0, couponsSent: 0 };
  }

  let couponsSent = 0;

  for (const whale of whales) {
    // 이미 최근에 쿠폰 발송했는지 체크
    const { data: recentCoupon } = await getSupabase()
      .from('user_coupons')
      .select('id')
      .eq('user_id', whale.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (recentCoupon) continue; // 7일 이내 쿠폰 발송됨

    // 쿠폰 발송
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const couponCode = `COMEBACK-${whale.id.substring(0, 4).toUpperCase()}`;

    const { error } = await getSupabase().from('user_coupons').insert({
      user_id: whale.id,
      coupon_code: couponCode,
      coupon_type: 'percentage',
      discount_value: settings.auto_coupon_discount_percent,
      expires_at: expiresAt.toISOString(),
      issue_reason: '자동 리텐션 마케팅',
    } as never);

    if (!error) {
      couponsSent++;

      // 자동화 로그
      await logAutomation('auto_send_coupon', {
        user_id: whale.id,
        user_email: whale.email,
        balance: whale.balance,
        days_inactive: whale.days_inactive,
        coupon_code: couponCode,
      });

      // 텔레그램 알림
      await notifySleepingWhale({
        email: whale.email,
        balance: whale.balance,
        daysInactive: Math.round(whale.days_inactive),
        autoCouponSent: true,
      });
    }
  }

  return { processed: whales.length, couponsSent };
}

/**
 * 실패 주문 자동 환불
 */
export async function processFailedOrders(): Promise<{
  processed: number;
  refunded: number;
}> {
  const settings = await getAutomationSettings();

  if (!settings.auto_refund_failed_orders) {
    return { processed: 0, refunded: 0 };
  }

  // 실패 상태이고 아직 환불 안된 주문
  const { data: failedOrders } = await getSupabase()
    .from('orders')
    .select('id, user_id, charge')
    .eq('status', 'failed')
    .eq('refunded', false)
    .limit(50);

  if (!failedOrders || failedOrders.length === 0) {
    return { processed: 0, refunded: 0 };
  }

  let refunded = 0;

  for (const order of failedOrders) {
    // 유저 잔액 조회
    const { data: profile } = await getSupabase()
      .from('profiles')
      .select('balance')
      .eq('id', order.user_id)
      .single();

    if (!profile) continue;

    // 환불 처리
    const { error: balanceError } = await getSupabase()
      .from('profiles')
      .update({ balance: profile.balance + order.charge } as never)
      .eq('id', order.user_id);

    if (!balanceError) {
      await getSupabase()
        .from('orders')
        .update({ refunded: true } as never)
        .eq('id', order.id);

      refunded++;

      await logAutomation('auto_refund', {
        order_id: order.id,
        amount: order.charge,
        user_id: order.user_id,
      });
    }
  }

  return { processed: failedOrders.length, refunded };
}

/**
 * Provider 잔액 체크 및 알림
 */
export async function checkProviderBalances(): Promise<void> {
  const settings = await getAutomationSettings();

  if (!settings.provider_balance_alert) return;

  const { data: providers } = await getSupabase()
    .from('api_providers')
    .select('id, name, api_url, api_key')
    .eq('is_active', true);

  if (!providers) return;

  for (const provider of providers) {
    try {
      const formData = new URLSearchParams();
      formData.append('key', provider.api_key);
      formData.append('action', 'balance');

      const response = await fetch(provider.api_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const data = await response.json();
      const balance = parseFloat(data.balance || '0');

      if (balance < settings.provider_balance_threshold) {
        await sendTelegramMessage(
          `⚠️ <b>Provider 잔액 부족</b>
━━━━━━━━━━━━━━━
Provider: <b>${provider.name}</b>
잔액: <b>$${balance.toFixed(2)}</b>
임계값: $${settings.provider_balance_threshold}

빠른 충전이 필요합니다.`
        );
      }
    } catch (error) {
      console.error(`[Automation] Balance check failed for ${provider.name}:`, error);
    }
  }
}

/**
 * Provider 장애 감지 시 호출 (provider-router에서 호출)
 */
export async function onProviderFailure(
  providerId: string,
  providerName: string,
  failureCount: number,
  cooldownMinutes: number
): Promise<void> {
  await notifyProviderFailure({
    name: providerName,
    failureCount,
    cooldownMinutes,
    autoSwitched: true,
  });

  await logAutomation('provider_failure', {
    provider_id: providerId,
    provider_name: providerName,
    failure_count: failureCount,
    cooldown_minutes: cooldownMinutes,
  });
}

// ============================================
// 전체 자동화 실행 (Cron에서 호출)
// ============================================

export async function runAllAutomations(): Promise<{
  sleepingWhales: { processed: number; couponsSent: number };
  failedOrders: { processed: number; refunded: number };
}> {
  const sleepingWhales = await processSleepingWhales();
  const failedOrders = await processFailedOrders();
  await checkProviderBalances();

  return { sleepingWhales, failedOrders };
}

// ============================================
// Logging
// ============================================

async function logAutomation(
  actionType: string,
  data: Record<string, any>
): Promise<void> {
  try {
    await getSupabase().from('automation_logs').insert({
      action_type: actionType,
      action_data: data,
    } as never);
  } catch (error) {
    console.error('[Automation] Log error:', error);
  }
}
