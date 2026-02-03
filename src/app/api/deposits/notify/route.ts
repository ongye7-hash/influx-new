// ============================================
// 충전 요청 알림 API
// 새 충전 요청 시 텔레그램 알림 + 자동승인 체크
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { processDeposit } from '@/lib/services/automation-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deposit_id, amount, user_id, method } = body;

    if (!deposit_id || !amount || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 자동화 처리 (자동승인 체크 + 알림)
    const result = await processDeposit({
      id: deposit_id,
      amount,
      user_id,
      method: method || 'bank_transfer',
    });

    return NextResponse.json({
      success: true,
      auto_approved: result.autoApproved,
      notified: result.notified,
    });
  } catch (error) {
    console.error('[Deposit Notify] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
