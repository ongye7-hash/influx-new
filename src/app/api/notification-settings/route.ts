// ============================================
// 사용자 알림 설정 API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: 내 알림 설정 조회
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { data, error } = await (supabase as any)
      .from('user_notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116: row not found - 이건 OK
      console.error('Fetch notification settings error:', error);
      return NextResponse.json(
        { success: false, error: '알림 설정을 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    // 설정이 없으면 기본값 반환
    if (!data) {
      return NextResponse.json({
        success: true,
        data: {
          email_notifications: true,
          order_notifications: true,
          marketing_notifications: false,
          telegram_notifications: false,
          telegram_chat_id: '',
          balance_alert_enabled: false,
          balance_alert_threshold: 10000,
        },
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Notification settings API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 알림 설정 저장 (upsert)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      email_notifications,
      order_notifications,
      marketing_notifications,
      telegram_notifications,
      telegram_chat_id,
      balance_alert_enabled,
      balance_alert_threshold,
    } = body;

    // Upsert 설정
    const { data, error } = await (supabase as any)
      .from('user_notification_settings')
      .upsert({
        user_id: user.id,
        email_notifications: email_notifications ?? true,
        order_notifications: order_notifications ?? true,
        marketing_notifications: marketing_notifications ?? false,
        telegram_notifications: telegram_notifications ?? false,
        telegram_chat_id: telegram_chat_id || null,
        balance_alert_enabled: balance_alert_enabled ?? false,
        balance_alert_threshold: balance_alert_threshold ?? 10000,
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Upsert notification settings error:', error);
      return NextResponse.json(
        { success: false, error: '알림 설정 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: '알림 설정이 저장되었습니다.',
    });
  } catch (error) {
    console.error('Notification settings API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
