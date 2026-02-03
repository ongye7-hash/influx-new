// ============================================
// 텔레그램 봇 서비스
// 알림 발송 + 인터랙티브 버튼 + 명령어 처리
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
}

const TELEGRAM_API = 'https://api.telegram.org/bot';

// ============================================
// Types
// ============================================
export interface TelegramSettings {
  bot_token: string;
  chat_id: string;
  enabled: boolean;
  quiet_hours_start: number; // 0-23
  quiet_hours_end: number;
  daily_briefing_time: string; // "21:00"
  notify_large_deposit: boolean;
  notify_provider_failure: boolean;
  notify_sleeping_whale: boolean;
  notify_new_vip: boolean;
  large_deposit_threshold: number;
}

export interface InlineButton {
  text: string;
  callback_data: string;
}

export interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  reply_markup?: {
    inline_keyboard: InlineButton[][];
  };
}

// ============================================
// Core Functions
// ============================================

/**
 * 텔레그램 설정 조회
 */
export async function getTelegramSettings(): Promise<TelegramSettings | null> {
  const { data } = await getSupabase()
    .from('admin_settings')
    .select('value')
    .eq('key', 'telegram')
    .single();

  return data?.value as TelegramSettings || null;
}

/**
 * 텔레그램 메시지 발송
 */
export async function sendTelegramMessage(
  message: string,
  buttons?: InlineButton[][],
  settings?: TelegramSettings | null
): Promise<boolean> {
  const config = settings || await getTelegramSettings();

  if (!config?.enabled || !config.bot_token || !config.chat_id) {
    console.log('[Telegram] Not configured or disabled');
    return false;
  }

  // 야간 시간 체크
  if (isQuietHours(config)) {
    console.log('[Telegram] Quiet hours, skipping notification');
    return false;
  }

  try {
    const payload: TelegramMessage = {
      chat_id: config.chat_id,
      text: message,
      parse_mode: 'HTML',
    };

    if (buttons && buttons.length > 0) {
      payload.reply_markup = { inline_keyboard: buttons };
    }

    const response = await fetch(`${TELEGRAM_API}${config.bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('[Telegram] Send failed:', result.description);
      return false;
    }

    // 로그 기록
    await logTelegramMessage('outgoing', message, result.ok);

    return true;
  } catch (error) {
    console.error('[Telegram] Error:', error);
    return false;
  }
}

/**
 * 버튼 콜백 응답 (버튼 누른 후 메시지 수정)
 */
export async function answerCallback(
  callbackQueryId: string,
  text?: string
): Promise<void> {
  const config = await getTelegramSettings();
  if (!config?.bot_token) return;

  await fetch(`${TELEGRAM_API}${config.bot_token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text || '처리됨',
    }),
  });
}

/**
 * 메시지 수정 (버튼 처리 후)
 */
export async function editMessage(
  messageId: number,
  newText: string,
  buttons?: InlineButton[][]
): Promise<void> {
  const config = await getTelegramSettings();
  if (!config?.bot_token || !config.chat_id) return;

  const payload: any = {
    chat_id: config.chat_id,
    message_id: messageId,
    text: newText,
    parse_mode: 'HTML',
  };

  if (buttons) {
    payload.reply_markup = { inline_keyboard: buttons };
  }

  await fetch(`${TELEGRAM_API}${config.bot_token}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// ============================================
// 알림 템플릿
// ============================================

/**
 * 대형 충전 요청 알림
 */
export async function notifyLargeDeposit(deposit: {
  id: string;
  amount: number;
  userEmail: string;
  totalDeposits: number;
  totalRequests?: number;
  currentBalance?: number;
}): Promise<void> {
  const config = await getTelegramSettings();
  if (!config?.notify_large_deposit) return;
  if (deposit.amount < config.large_deposit_threshold) return;

  const isVip = deposit.totalDeposits >= 1000000;
  const isNewUser = deposit.totalRequests === 1;
  const emoji = deposit.amount >= 100000 ? '🐋' : '💰';

  let userStatus = '';
  if (isVip) userStatus = '⭐ VIP';
  else if (isNewUser) userStatus = '🆕 신규';
  else if (deposit.totalRequests && deposit.totalRequests > 1) userStatus = `🔄 ${deposit.totalRequests}회차`;

  const message = `${emoji} <b>충전 요청</b>
━━━━━━━━━━━━━━━
금액: <b>₩${deposit.amount.toLocaleString()}</b>
유저: ${deposit.userEmail}
현재 잔액: ₩${(deposit.currentBalance || 0).toLocaleString()}
누적 충전: ₩${deposit.totalDeposits.toLocaleString()} ${userStatus}
ID: <code>${deposit.id.substring(0, 8)}</code>
`;

  const buttons: InlineButton[][] = [
    [
      { text: '✅ 승인', callback_data: `approve_deposit:${deposit.id}` },
      { text: '❌ 거절', callback_data: `reject_deposit:${deposit.id}` },
    ],
    [
      { text: '👤 유저 상세', callback_data: `user_detail:${deposit.userEmail}` },
    ],
  ];

  await sendTelegramMessage(message, buttons, config);
}

/**
 * Provider 장애 알림
 */
export async function notifyProviderFailure(provider: {
  name: string;
  failureCount: number;
  cooldownMinutes: number;
  autoSwitched: boolean;
}): Promise<void> {
  const config = await getTelegramSettings();
  if (!config?.notify_provider_failure) return;

  const message = `⚠️ <b>Provider 장애 감지</b>
━━━━━━━━━━━━━━━
Provider: <b>${provider.name}</b>
연속 실패: ${provider.failureCount}회
상태: ${provider.cooldownMinutes}분 쿨다운${provider.autoSwitched ? '\n\n✅ 자동으로 대체 Provider로 전환됨' : ''}
`;

  await sendTelegramMessage(message, undefined, config);
}

/**
 * 잠자는 큰손 알림
 */
export async function notifySleepingWhale(user: {
  email: string;
  balance: number;
  daysInactive: number;
  autoCouponSent: boolean;
}): Promise<void> {
  const config = await getTelegramSettings();
  if (!config?.notify_sleeping_whale) return;

  const tier = user.balance >= 50000 ? '🐋 고래' : user.balance >= 20000 ? '🐬 돌고래' : '🐟 물고기';

  const message = `💤 <b>잠자는 큰손 감지</b>
━━━━━━━━━━━━━━━
등급: ${tier}
잔액: <b>₩${user.balance.toLocaleString()}</b>
미접속: ${user.daysInactive}일
${user.autoCouponSent ? '\n✅ 10% 쿠폰 자동 발송됨' : ''}
`;

  const buttons: InlineButton[][] = user.autoCouponSent ? [] : [
    [
      { text: '🎫 쿠폰 발송', callback_data: `send_coupon:${user.email}` },
      { text: '🎁 잔액 지급', callback_data: `gift_balance:${user.email}` },
    ],
  ];

  await sendTelegramMessage(message, buttons.length > 0 ? buttons : undefined, config);
}

/**
 * 신규 VIP 알림
 */
export async function notifyNewVip(user: {
  email: string;
  totalDeposits: number;
}): Promise<void> {
  const config = await getTelegramSettings();
  if (!config?.notify_new_vip) return;

  const message = `🌟 <b>신규 VIP 등극!</b>
━━━━━━━━━━━━━━━
유저: ${user.email}
누적 충전: <b>₩${user.totalDeposits.toLocaleString()}</b>

VIP 혜택 안내 메시지를 보내시겠습니까?
`;

  const buttons: InlineButton[][] = [
    [
      { text: '📨 VIP 환영 메시지', callback_data: `vip_welcome:${user.email}` },
    ],
  ];

  await sendTelegramMessage(message, buttons, config);
}

/**
 * 일일 브리핑
 */
export async function sendDailyBriefing(): Promise<void> {
  const config = await getTelegramSettings();
  if (!config?.enabled) return;

  // 오늘 통계 조회
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [ordersResult, depositsResult, usersResult, pendingResult] = await Promise.all([
    // 오늘 주문
    getSupabase()
      .from('orders')
      .select('charge')
      .gte('created_at', today.toISOString()),
    // 오늘 충전
    getSupabase()
      .from('deposits')
      .select('amount')
      .eq('status', 'approved')
      .gte('created_at', today.toISOString()),
    // 오늘 가입
    getSupabase()
      .from('profiles')
      .select('id')
      .gte('created_at', today.toISOString()),
    // 대기중 충전
    getSupabase()
      .from('deposits')
      .select('amount')
      .eq('status', 'pending'),
  ]);

  const todayRevenue = (ordersResult.data || []).reduce((sum, o) => sum + (o.charge || 0), 0);
  const todayDeposits = (depositsResult.data || []).reduce((sum, d) => sum + (d.amount || 0), 0);
  const newUsers = usersResult.data?.length || 0;
  const pendingDeposits = pendingResult.data || [];
  const pendingAmount = pendingDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);

  // 자동 처리 통계 (오늘)
  const { data: autoActions } = await getSupabase()
    .from('automation_logs')
    .select('action_type')
    .gte('created_at', today.toISOString());

  const autoApproved = (autoActions || []).filter(a => a.action_type === 'auto_approve_deposit').length;
  const autoCoupons = (autoActions || []).filter(a => a.action_type === 'auto_send_coupon').length;
  const autoRefunds = (autoActions || []).filter(a => a.action_type === 'auto_refund').length;

  const message = `📊 <b>일일 브리핑</b>
━━━━━━━━━━━━━━━

💰 <b>오늘 실적</b>
• 매출: ₩${todayRevenue.toLocaleString()}
• 충전: ₩${todayDeposits.toLocaleString()}
• 신규 가입: ${newUsers}명

🤖 <b>자동 처리</b>
• 충전 자동승인: ${autoApproved}건
• 쿠폰 자동발송: ${autoCoupons}건
• 자동 환불: ${autoRefunds}건

${pendingDeposits.length > 0 ? `\n⏳ <b>처리 필요</b>\n• 충전 대기: ${pendingDeposits.length}건 (₩${pendingAmount.toLocaleString()})` : '✅ 처리 대기 건 없음'}
`;

  const buttons: InlineButton[][] = pendingDeposits.length > 0 ? [
    [{ text: '📋 대기 목록 보기', callback_data: 'list_pending' }],
  ] : [];

  await sendTelegramMessage(message, buttons.length > 0 ? buttons : undefined, config);
}

// ============================================
// 명령어 처리
// ============================================

export async function handleCommand(command: string, chatId: string): Promise<string> {
  const cmd = command.toLowerCase().trim();

  if (cmd === '/today' || cmd === '/현황') {
    return await getTodayStats();
  }

  if (cmd === '/pending' || cmd === '/대기') {
    return await getPendingDeposits();
  }

  if (cmd === '/providers' || cmd === '/공급자') {
    return await getProviderStatus();
  }

  if (cmd === '/whale' || cmd === '/큰손') {
    return await getSleepingWhales();
  }

  if (cmd.startsWith('/approve ') || cmd.startsWith('/승인 ')) {
    const id = cmd.split(' ')[1];
    return await approveDeposit(id);
  }

  if (cmd === '/help' || cmd === '/도움말') {
    return `🤖 <b>INFLUX 봇 명령어</b>
━━━━━━━━━━━━━━━
/today - 오늘 현황
/pending - 대기중 충전
/providers - Provider 상태
/whale - 잠자는 큰손
/approve [ID] - 충전 승인
/help - 도움말
`;
  }

  return '알 수 없는 명령어입니다. /help 를 입력해주세요.';
}

async function getTodayStats(): Promise<string> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [orders, deposits, users] = await Promise.all([
    getSupabase().from('orders').select('charge, status').gte('created_at', today.toISOString()),
    getSupabase().from('deposits').select('amount, status').gte('created_at', today.toISOString()),
    getSupabase().from('profiles').select('id').gte('created_at', today.toISOString()),
  ]);

  const revenue = (orders.data || []).reduce((sum, o) => sum + (o.charge || 0), 0);
  const orderCount = orders.data?.length || 0;
  const completedOrders = (orders.data || []).filter(o => o.status === 'completed').length;
  const depositAmount = (deposits.data || []).filter(d => d.status === 'approved').reduce((sum, d) => sum + (d.amount || 0), 0);
  const pendingDeposits = (deposits.data || []).filter(d => d.status === 'pending');

  return `📊 <b>오늘 현황</b>
━━━━━━━━━━━━━━━
💰 매출: ₩${revenue.toLocaleString()}
📦 주문: ${orderCount}건 (완료: ${completedOrders})
💳 충전: ₩${depositAmount.toLocaleString()}
👥 신규: ${users.data?.length || 0}명
⏳ 대기: ${pendingDeposits.length}건
`;
}

async function getPendingDeposits(): Promise<string> {
  const { data: deposits } = await getSupabase()
    .from('deposits')
    .select('id, amount, user_id, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10);

  if (!deposits || deposits.length === 0) {
    return '✅ 대기중인 충전이 없습니다.';
  }

  let message = `⏳ <b>대기중 충전</b> (${deposits.length}건)\n━━━━━━━━━━━━━━━\n`;

  for (const d of deposits) {
    const { data: profile } = await getSupabase()
      .from('profiles')
      .select('email')
      .eq('id', d.user_id)
      .single();

    const email = profile?.email || 'unknown';
    message += `• ₩${d.amount.toLocaleString()} - ${email.substring(0, 10)}...\n  /approve ${d.id.substring(0, 8)}\n`;
  }

  return message;
}

async function getProviderStatus(): Promise<string> {
  const { data } = await getSupabase()
    .from('api_providers')
    .select('name, is_active, recent_failure_count, failure_cooldown_until')
    .order('priority', { ascending: false });

  if (!data || data.length === 0) {
    return '등록된 Provider가 없습니다.';
  }

  let message = `🔌 <b>Provider 상태</b>\n━━━━━━━━━━━━━━━\n`;

  for (const p of data) {
    let status = '🟢';
    if (!p.is_active) status = '⚫';
    else if (p.failure_cooldown_until && new Date(p.failure_cooldown_until) > new Date()) status = '🔴';
    else if (p.recent_failure_count >= 1) status = '🟡';

    message += `${status} ${p.name}`;
    if (p.recent_failure_count > 0) message += ` (실패: ${p.recent_failure_count})`;
    message += '\n';
  }

  return message;
}

async function getSleepingWhales(): Promise<string> {
  const { data } = await getSupabase()
    .from('sleeping_whales')
    .select('*')
    .limit(10);

  if (!data || data.length === 0) {
    return '✅ 잠자는 큰손이 없습니다.';
  }

  let message = `💤 <b>잠자는 큰손</b> (${data.length}명)\n━━━━━━━━━━━━━━━\n`;

  for (const u of data) {
    const tier = u.customer_tier === 'whale' ? '🐋' : u.customer_tier === 'dolphin' ? '🐬' : '🐟';
    message += `${tier} ₩${u.balance.toLocaleString()} - ${Math.round(u.days_inactive)}일\n`;
  }

  return message;
}

async function approveDeposit(idPrefix: string): Promise<string> {
  const { data: deposit } = await getSupabase()
    .from('deposits')
    .select('id, amount, user_id')
    .eq('status', 'pending')
    .ilike('id', `${idPrefix}%`)
    .single();

  if (!deposit) {
    return `❌ ID가 "${idPrefix}"로 시작하는 대기중 충전을 찾을 수 없습니다.`;
  }

  // 잔액 추가
  const { data: profile } = await getSupabase()
    .from('profiles')
    .select('balance')
    .eq('id', deposit.user_id)
    .single();

  if (!profile) {
    return '❌ 유저를 찾을 수 없습니다.';
  }

  const { error: updateError } = await getSupabase()
    .from('profiles')
    .update({ balance: profile.balance + deposit.amount } as never)
    .eq('id', deposit.user_id);

  if (updateError) {
    return `❌ 잔액 업데이트 실패: ${updateError.message}`;
  }

  // 충전 상태 변경
  await getSupabase()
    .from('deposits')
    .update({ status: 'approved' } as never)
    .eq('id', deposit.id);

  return `✅ 승인 완료!\n₩${deposit.amount.toLocaleString()} 충전됨`;
}

// ============================================
// Helper Functions
// ============================================

function isQuietHours(config: TelegramSettings): boolean {
  if (!config.quiet_hours_start && !config.quiet_hours_end) return false;

  const now = new Date();
  const hour = now.getHours();

  const start = config.quiet_hours_start || 23;
  const end = config.quiet_hours_end || 8;

  if (start < end) {
    return hour >= start && hour < end;
  } else {
    return hour >= start || hour < end;
  }
}

async function logTelegramMessage(
  direction: 'incoming' | 'outgoing',
  content: string,
  success: boolean
): Promise<void> {
  try {
    await getSupabase().from('telegram_logs').insert({
      direction,
      content: content.substring(0, 1000),
      success,
    } as never);
  } catch (error) {
    console.error('[Telegram] Log error:', error);
  }
}
