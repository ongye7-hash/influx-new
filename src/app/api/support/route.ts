// ============================================
// 고객 문의 API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTelegramMessage } from '@/lib/services/telegram-bot';

const TICKET_TYPE_LABELS: Record<string, string> = {
  order: '주문 관련',
  payment: '결제/충전',
  refund: '환불 요청',
  account: '계정 문의',
  service: '서비스 이용',
  other: '기타',
};

// GET: 내 문의 목록 조회
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
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch tickets error:', error);
      return NextResponse.json(
        { success: false, error: '문의 목록을 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Support API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 문의 접수
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
    const { ticket_type, title, content } = body;

    // 유효성 검사
    if (!ticket_type || !title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { success: false, error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 유효한 문의 유형인지 확인
    if (!TICKET_TYPE_LABELS[ticket_type]) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 문의 유형입니다.' },
        { status: 400 }
      );
    }

    // 문의 저장
    const { data: ticket, error: insertError } = await (supabase as any)
      .from('support_tickets')
      .insert({
        user_id: user.id,
        user_email: user.email || '',
        ticket_type,
        title: title.trim(),
        content: content.trim(),
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert ticket error:', insertError);
      return NextResponse.json(
        { success: false, error: '문의 접수에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 텔레그램 알림 발송 (비동기, 실패해도 문의는 저장됨)
    try {
      const typeLabel = TICKET_TYPE_LABELS[ticket_type] || ticket_type;
      const message = `📩 <b>새 문의 접수</b>
━━━━━━━━━━━━━━━
유형: ${typeLabel}
제목: ${title.trim()}
유저: ${user.email}
시간: ${new Date().toLocaleString('ko-KR')}

<b>내용:</b>
${content.trim().substring(0, 300)}${content.length > 300 ? '...' : ''}

📌 어드민에서 확인하세요: /admin/tickets`;

      await sendTelegramMessage(message);
    } catch (telegramError) {
      console.error('Telegram notification failed:', telegramError);
      // 텔레그램 실패해도 문의는 저장되었으므로 에러 반환하지 않음
    }

    return NextResponse.json({
      success: true,
      data: ticket,
      message: '문의가 접수되었습니다. 빠른 시간 내에 답변 드리겠습니다.',
    });
  } catch (error) {
    console.error('Support API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
