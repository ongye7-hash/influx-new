// ============================================
// 텔레그램 연결 테스트 API
// ============================================

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { bot_token, chat_id } = await request.json();

    if (!bot_token || !chat_id) {
      return NextResponse.json({ error: '봇 토큰과 Chat ID를 입력해주세요' }, { status: 400 });
    }

    const response = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat_id,
        text: `🤖 <b>INFLUX 봇 연결 테스트 성공!</b>\n\n이제 알림을 받을 준비가 되었습니다.\n\n시간: ${new Date().toLocaleString('ko-KR')}`,
        parse_mode: 'HTML',
      }),
    });

    const result = await response.json();

    if (result.ok) {
      return NextResponse.json({ success: true, message: '테스트 메시지 전송 성공!' });
    } else {
      return NextResponse.json({
        success: false,
        error: result.description || '전송 실패',
        code: result.error_code
      }, { status: 400 });
    }
  } catch (error) {
    console.error('[Telegram Test] Error:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
