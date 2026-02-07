// ============================================
// 무료 체험 API
// 실제 admin_products와 연동하여 주문 생성
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { processOrderWithFallback } from '@/lib/api-fallback';

// 서비스 ID → admin_product_id 매핑
// services 테이블의 무료체험용 서비스를 실제 판매 상품과 연결
const SERVICE_TO_PRODUCT_MAP: Record<string, string> = {
  // 한국인 팔로워 → 인스타 외국인 AS보장 팔로워
  'e9e7804e-e887-44a3-9cab-dfb5cb47da2f': '188ce35e-15d3-4762-b374-4c6c784c105a',
  // 인스타 좋아요 → 외국인 스피드 좋아요
  '7b104deb-8e89-4c3e-8b20-493ed8a37671': 'a8f9cd28-296d-4145-b547-696781a911c9',
  // 유튜브 조회수 → 빠른 유입
  '58b410b7-7323-44c0-b90f-a8fd6cbcc5db': 'b14ce729-f37e-448d-a886-5cf3ee3d5849',
  // 틱톡 팔로워 → 외국인 리얼 팔로워
  '1b0db207-8942-40bb-8e40-22629edae191': 'd4f6c24b-8f69-4c84-9aa1-617000a862c7',
};

// Service role client for order creation
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET: 무료 체험 서비스 목록 조회
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('available_free_trials')
      .select('*');

    if (error) {
      console.error('Fetch free trials error:', error);
      return NextResponse.json(
        { success: false, error: '무료 체험 서비스를 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Free trial API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 일회용 이메일 도메인 블랙리스트
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'guerrillamail.com', 'mailinator.com', '10minutemail.com',
  'throwaway.email', 'fakeinbox.com', 'temp-mail.org', 'dispostable.com',
  'yopmail.com', 'trashmail.com', 'sharklasers.com', 'guerrillamail.info',
  'grr.la', 'mailnesia.com', 'maildrop.cc', 'getairmail.com'
];

// POST: 무료 체험 신청
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 이메일 인증 확인 (정식 회원가입)
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        {
          success: false,
          error: '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
          code: 'EMAIL_NOT_VERIFIED'
        },
        { status: 403 }
      );
    }

    // 일회용 이메일 차단
    const emailDomain = user.email?.split('@')[1]?.toLowerCase();
    if (emailDomain && DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain)) {
      return NextResponse.json(
        {
          success: false,
          error: '일회용 이메일은 사용할 수 없습니다. 정식 이메일로 가입해주세요.',
          code: 'DISPOSABLE_EMAIL'
        },
        { status: 403 }
      );
    }

    // IP 주소 가져오기
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || '';

    // IP 유효성 검사 (비정상 IP 차단)
    if (ip === '0.0.0.0' || ip === '127.0.0.1' || ip.startsWith('10.') || ip.startsWith('192.168.')) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 네트워크에서의 접근입니다.',
          code: 'INVALID_IP'
        },
        { status: 403 }
      );
    }

    // 같은 IP에서 오늘 무료체험 사용 여부 확인
    const today = new Date().toISOString().split('T')[0];
    const { data: ipUsage } = await supabase
      .from('free_trials')
      .select('id')
      .eq('ip_address', ip)
      .gte('created_at', `${today}T00:00:00`)
      .limit(1);

    if (ipUsage && ipUsage.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: '해당 네트워크에서 오늘 이미 무료 체험을 사용하셨습니다. 내일 다시 시도해주세요.',
          code: 'IP_LIMIT_REACHED'
        },
        { status: 429 }
      );
    }

    // 1인당 하루 최대 2회 제한
    const USER_DAILY_LIMIT = 2;
    const { count: userTodayCount } = await supabase
      .from('free_trials')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00`);

    if (userTodayCount !== null && userTodayCount >= USER_DAILY_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: `오늘 무료 체험 한도(${USER_DAILY_LIMIT}회)를 모두 사용하셨습니다. 내일 다시 시도해주세요.`,
          code: 'USER_LIMIT_REACHED'
        },
        { status: 429 }
      );
    }

    // 전체 일일 한도 체크 (모든 서비스 통합)
    const GLOBAL_DAILY_LIMIT = 100;
    const { count: todayTotalCount } = await supabase
      .from('free_trials')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`);

    if (todayTotalCount !== null && todayTotalCount >= GLOBAL_DAILY_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: '오늘의 무료 체험 한도가 모두 소진되었습니다. 내일 다시 시도해주세요.',
          code: 'GLOBAL_LIMIT_REACHED'
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { service_id, link } = body;

    // 유효성 검사
    if (!service_id || !link) {
      return NextResponse.json(
        { success: false, error: '서비스 ID와 링크가 필요합니다.' },
        { status: 400 }
      );
    }

    // URL 유효성 검사 (http/https만 허용)
    try {
      const parsed = new URL(link);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { success: false, error: '유효한 URL을 입력해주세요. (http/https만 허용)' },
        { status: 400 }
      );
    }

    // 체험 가능 여부 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: availability, error: availError } = await (supabase.rpc as any)(
      'check_trial_availability',
      { p_user_id: user.id, p_service_id: service_id }
    );

    if (availError) {
      console.error('Check availability error:', availError);
      return NextResponse.json(
        { success: false, error: '체험 가능 여부를 확인할 수 없습니다.' },
        { status: 500 }
      );
    }

    if (!availability?.available) {
      return NextResponse.json(
        { success: false, error: availability?.message || '무료 체험을 사용할 수 없습니다.' },
        { status: 400 }
      );
    }

    // admin_product_id 매핑 확인
    const adminProductId = SERVICE_TO_PRODUCT_MAP[service_id];
    if (!adminProductId) {
      console.error('No product mapping for service:', service_id);
      return NextResponse.json(
        { success: false, error: '해당 서비스는 현재 무료 체험을 제공하지 않습니다.' },
        { status: 400 }
      );
    }

    // 무료 체험 기록 생성 (기존 로직)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: trialId, error: trialError } = await (supabase.rpc as any)(
      'request_free_trial',
      {
        p_user_id: user.id,
        p_service_id: service_id,
        p_link: link,
        p_ip_address: ip,
        p_user_agent: userAgent,
      }
    );

    if (trialError) {
      console.error('Request trial error:', trialError);
      return NextResponse.json(
        { success: false, error: trialError.message || '체험 신청 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 실제 주문 생성 및 원청 API 연동
    const serviceClient = getServiceClient();
    const quantity = availability.quantity;

    // 주문번호 생성
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `FREE-${dateStr}-${randomStr}`;

    // orders 테이블에 무료체험 주문 생성
    // 주의: charge > 0 제약조건이 있어서 1원으로 설정 (무료체험 표시용)
    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        service_id: adminProductId, // admin_products의 ID
        link: link,
        quantity: quantity,
        charge: 1, // 무료체험 (DB 제약조건 때문에 1원으로 설정)
        unit_price: 0.001,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      // 무료체험 기록은 이미 생성되었으므로 계속 진행
      // 하지만 실제 주문은 실패
      return NextResponse.json({
        success: true,
        data: {
          trial_id: trialId,
          quantity: quantity,
          message: '무료 체험이 신청되었습니다! 처리 중 일시적 오류가 발생했습니다. 관리자가 수동으로 처리할 예정입니다.',
          warning: 'ORDER_CREATION_FAILED',
        },
      });
    }

    // 원청 API로 주문 전송
    const apiResult = await processOrderWithFallback({
      product_id: adminProductId,
      link: link,
      quantity: quantity,
      user_id: user.id,
      order_id: order.id,
    });

    // 주문 상태 업데이트
    if (apiResult.success) {
      await serviceClient
        .from('orders')
        .update({
          status: 'processing',
          provider_order_id: apiResult.provider_order_id,
        })
        .eq('id', order.id);

      console.log(`[Free Trial] Order ${order.id} sent to provider: ${apiResult.provider_order_id}`);
    } else {
      await serviceClient
        .from('orders')
        .update({
          status: 'failed',
          error_message: apiResult.error,
        })
        .eq('id', order.id);

      console.error(`[Free Trial] Order ${order.id} failed: ${apiResult.error}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        trial_id: trialId,
        order_id: order.id,
        quantity: quantity,
        message: apiResult.success
          ? '무료 체험이 신청되었습니다! 곧 처리가 시작됩니다.'
          : '무료 체험이 신청되었습니다! 처리가 약간 지연될 수 있습니다.',
        provider_order_id: apiResult.provider_order_id,
      },
    });
  } catch (error) {
    console.error('Free trial request error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
