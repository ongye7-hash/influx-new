// ============================================
// 자동화 Cron API
// 매시간 실행: 잠자는 큰손 쿠폰, 실패 주문 환불, Provider 잔액 체크
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { runAllAutomations } from '@/lib/services/automation-engine';
import { sendDailyBriefing, getTelegramSettings } from '@/lib/services/telegram-bot';

// Vercel Cron 인증
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Cron 인증
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 자동화 실행
    const results = await runAllAutomations();

    // 일일 브리핑 시간 체크 (설정된 시간이면 브리핑 발송)
    const settings = await getTelegramSettings();
    if (settings?.daily_briefing_time) {
      const now = new Date();
      const [hour] = settings.daily_briefing_time.split(':').map(Number);

      if (now.getHours() === hour) {
        await sendDailyBriefing();
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('[Automation Cron] Error:', error);
    return NextResponse.json(
      { error: 'Automation failed', details: String(error) },
      { status: 500 }
    );
  }
}

// POST: 수동 실행
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'all';

    if (action === 'briefing') {
      await sendDailyBriefing();
      return NextResponse.json({ success: true, action: 'briefing' });
    }

    const results = await runAllAutomations();

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('[Automation Manual] Error:', error);
    return NextResponse.json(
      { error: 'Failed', details: String(error) },
      { status: 500 }
    );
  }
}
