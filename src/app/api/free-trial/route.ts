// ============================================
// 무료 체험 API
// admin_products 기반 + 폴백 설정 자동 사용
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { processOrderWithFallback } from '@/lib/api-fallback';

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
    const serviceClient = getServiceClient();

    // 먼저 새 테이블 시도
    const { data: newData, error: newError } = await serviceClient
      .from('available_free_trial_products')
      .select('*');

    if (!newError && newData) {
      // 새 테이블 데이터 반환 (필드명 매핑)
      const mappedData = newData.map(item => ({
        trial_service_id: item.trial_id,
        service_id: item.admin_product_id,
        service_name: item.product_name,
        price: item.price_per_1000,
        trial_quantity: item.trial_quantity,
        daily_limit: item.daily_limit,
        today_used: item.today_used,
        remaining_today: item.remaining_today,
        is_active: item.is_active,
        category_name: item.category_name,
        category_slug: item.category_platform?.toLowerCase(),
      }));

      return NextResponse.json({
        success: true,
        data: mappedData,
      });
    }

    // 새 테이블이 없으면 레거시 테이블 사용
    const { data: legacyData, error: legacyError } = await serviceClient
      .from('available_free_trials')
      .select('*');

    if (legacyError) {
      console.error('Fetch free trials error:', legacyError);
      return NextResponse.json(
        { success: false, error: '무료 체험 서비스를 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    // 레거시 데이터 매핑 (뷰 컬럼명에 맞게)
    const mappedLegacy = (legacyData || []).map(item => ({
      trial_service_id: item.trial_service_id,
      service_id: item.service_id,
      service_name: item.service_name,
      price: item.price || 0,
      trial_quantity: item.trial_quantity,
      daily_limit: item.daily_limit,
      today_used: item.today_used,
      remaining_today: item.remaining_today,
      is_active: item.is_active,
      category_name: item.category_name,
      category_slug: item.category_slug,
    }));

    return NextResponse.json({
      success: true,
      data: mappedLegacy,
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

    // 이메일 인증 확인
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

    // 1인당 하루 최대 2회 제한
    const today = new Date().toISOString().split('T')[0];
    const serviceClient = getServiceClient();

    const USER_DAILY_LIMIT = 2;
    const { count: userTodayCount } = await serviceClient
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

    // 전체 일일 한도 체크
    const GLOBAL_DAILY_LIMIT = 100;
    const { count: todayTotalCount } = await serviceClient
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
    const { service_id, link } = body;  // service_id는 admin_product_id

    // 유효성 검사
    if (!service_id || !link) {
      return NextResponse.json(
        { success: false, error: '상품 ID와 링크가 필요합니다.' },
        { status: 400 }
      );
    }

    // URL 유효성 검사
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

    // admin_product 조회 (폴백 설정 포함)
    const { data: product, error: productError } = await serviceClient
      .from('admin_products')
      .select('*')
      .eq('id', service_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 무료체험 설정 조회
    const { data: trialProduct, error: trialError } = await serviceClient
      .from('free_trial_products')
      .select('*')
      .eq('admin_product_id', service_id)
      .eq('is_active', true)
      .single();

    if (trialError || !trialProduct) {
      return NextResponse.json(
        { success: false, error: '해당 상품은 현재 무료 체험을 제공하지 않습니다.' },
        { status: 400 }
      );
    }

    // 일일 한도 확인
    if (trialProduct.today_used >= trialProduct.daily_limit) {
      return NextResponse.json(
        {
          success: false,
          error: '이 상품의 오늘 무료 체험 한도가 소진되었습니다. 내일 다시 시도해주세요.',
          code: 'PRODUCT_LIMIT_REACHED'
        },
        { status: 429 }
      );
    }

    // 사용자가 오늘 이 상품 체험했는지 확인
    const { count: userProductCount } = await serviceClient
      .from('free_trials')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('admin_product_id', service_id)
      .gte('created_at', `${today}T00:00:00`);

    if (userProductCount && userProductCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: '오늘 이미 이 상품의 무료 체험을 사용하셨습니다.',
          code: 'PRODUCT_ALREADY_USED'
        },
        { status: 429 }
      );
    }

    const quantity = trialProduct.trial_quantity;

    // 주문번호 생성
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `FREE-${dateStr}-${randomStr}`;

    // 무료체험 일일 사용량 증가
    await serviceClient
      .from('free_trial_products')
      .update({ today_used: trialProduct.today_used + 1 })
      .eq('id', trialProduct.id);

    // 무료체험 기록 생성
    const { data: trialRecord, error: trialRecordError } = await serviceClient
      .from('free_trials')
      .insert({
        user_id: user.id,
        admin_product_id: service_id,
        link: link,
        quantity: quantity,
        status: 'pending',
        ip_address: ip,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (trialRecordError) {
      console.error('Trial record creation error:', trialRecordError);
    }

    // orders 테이블에 무료체험 주문 생성
    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        service_id: service_id, // admin_product_id
        link: link,
        quantity: quantity,
        charge: 1, // DB 제약조건 때문에 1원으로 설정
        unit_price: 0.001,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({
        success: true,
        data: {
          trial_id: trialRecord?.id,
          quantity: quantity,
          message: '무료 체험이 신청되었습니다! 처리 중 일시적 오류가 발생했습니다.',
          warning: 'ORDER_CREATION_FAILED',
        },
      });
    }

    // 원청 API로 주문 전송 (폴백 설정 자동 사용)
    const apiResult = await processOrderWithFallback({
      product_id: service_id,
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

      // 무료체험 기록도 업데이트
      if (trialRecord) {
        await serviceClient
          .from('free_trials')
          .update({ status: 'processing' })
          .eq('id', trialRecord.id);
      }

      console.log(`[Free Trial] Order ${order.id} sent to provider: ${apiResult.provider_order_id}`);
    } else {
      await serviceClient
        .from('orders')
        .update({
          status: 'failed',
          error_message: apiResult.error,
        })
        .eq('id', order.id);

      if (trialRecord) {
        await serviceClient
          .from('free_trials')
          .update({ status: 'failed' })
          .eq('id', trialRecord.id);
      }

      console.error(`[Free Trial] Order ${order.id} failed: ${apiResult.error}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        trial_id: trialRecord?.id,
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
