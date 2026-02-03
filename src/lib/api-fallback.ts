// ============================================
// API Fallback 주문 처리 로직 (스마트 라우팅 v2)
// Primary → Fallback1 → Fallback2 순으로 시도
// 장애 감지 및 자동 우회 기능 포함
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  getAvailableRoutes,
  sendProviderRequest,
  logProviderRequest,
  recordProviderFailure,
  recordProviderSuccess,
  resetExpiredCooldowns,
  ApiProvider,
  ProviderRoute,
} from '@/lib/services/provider-router';

// Service role client (lazy initialization)
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

interface Product {
  id: string;
  name: string;
  primary_provider_id: string | null;
  primary_service_id: string | null;
  fallback1_provider_id: string | null;
  fallback1_service_id: string | null;
  fallback2_provider_id: string | null;
  fallback2_service_id: string | null;
}

interface OrderRequest {
  product_id: string;
  link: string;
  quantity: number;
  user_id: string;
  order_id: string;
  comments?: string;
  usernames?: string;
}

interface ApiOrderResult {
  success: boolean;
  provider_order_id?: string;
  error?: string;
  provider_id?: string;
  attempt_number?: number;
  response_time_ms?: number;
}

// 주문 로그 기록 (order_api_logs 테이블용)
async function logOrderAttempt(
  orderId: string,
  productId: string,
  providerId: string,
  serviceId: string,
  attemptNumber: number,
  status: 'pending' | 'success' | 'failed',
  providerOrderId?: string,
  errorMessage?: string,
  responseData?: any,
  responseTimeMs?: number
) {
  await getSupabase().from('order_api_logs').insert({
    order_id: orderId,
    product_id: productId,
    provider_id: providerId,
    provider_service_id: serviceId,
    provider_order_id: providerOrderId || null,
    attempt_number: attemptNumber,
    status,
    error_message: errorMessage || null,
    response_data: responseData || null,
    response_time_ms: responseTimeMs || null,
  });
}

// Fallback 로직으로 주문 처리 (스마트 라우팅 적용)
export async function processOrderWithFallback(
  request: OrderRequest
): Promise<ApiOrderResult> {
  // 0. 만료된 쿨다운 리셋
  await resetExpiredCooldowns();

  // 1. 상품 정보 조회
  const { data: product, error: productError } = await getSupabase()
    .from('admin_products')
    .select('*')
    .eq('id', request.product_id)
    .single();

  if (productError || !product) {
    return { success: false, error: '상품을 찾을 수 없습니다' };
  }

  // 2. 사용 가능한 라우트 조회 (장애 상태 Provider 제외)
  const availableRoutes = await getAvailableRoutes(
    product.primary_provider_id,
    product.primary_service_id,
    product.fallback1_provider_id,
    product.fallback1_service_id,
    product.fallback2_provider_id,
    product.fallback2_service_id
  );

  if (availableRoutes.length === 0) {
    console.error(`[Order ${request.order_id}] No available providers (all in cooldown or disabled)`);
    return { success: false, error: '현재 사용 가능한 API 공급자가 없습니다. 잠시 후 다시 시도해주세요.' };
  }

  // 3. Provider 정보 조회
  const providerIds = availableRoutes.map(r => r.providerId);
  const { data: providers } = await getSupabase()
    .from('api_providers')
    .select('*')
    .in('id', providerIds)
    .eq('is_active', true);

  if (!providers || providers.length === 0) {
    return { success: false, error: '활성화된 API 공급자가 없습니다' };
  }

  const providerMap = new Map<string, ApiProvider>(providers.map((p: any) => [p.id, p]));

  // 4. 우선순위 순으로 시도
  for (const route of availableRoutes) {
    const provider = providerMap.get(route.providerId);
    if (!provider) continue;

    console.log(
      `[Order ${request.order_id}] Attempt ${route.priority}: ${provider.name} (Service: ${route.serviceId})`
    );

    // 요청 파라미터 구성
    const params: Record<string, string> = {
      service: route.serviceId,
      link: request.link,
      quantity: request.quantity.toString(),
    };

    if (request.comments) {
      params.comments = request.comments;
    }
    if (request.usernames) {
      params.usernames = request.usernames;
    }

    // API 요청 전송
    const result = await sendProviderRequest(provider, 'add', params);

    // 로그 기록 (provider_logs)
    await logProviderRequest({
      providerId: route.providerId,
      orderId: request.order_id,
      action: 'add',
      serviceId: route.serviceId,
      requestData: { link: request.link, quantity: request.quantity },
      success: result.success,
      responseTimeMs: result.responseTimeMs,
      responseData: result.data,
      errorMessage: result.error,
    });

    if (result.success && result.orderId) {
      // 성공 기록
      await recordProviderSuccess(route.providerId, result.responseTimeMs);

      // 주문 로그 기록
      await logOrderAttempt(
        request.order_id,
        request.product_id,
        route.providerId,
        route.serviceId,
        route.priority,
        'success',
        result.orderId,
        undefined,
        result.data,
        result.responseTimeMs
      );

      console.log(
        `[Order ${request.order_id}] SUCCESS with ${provider.name} - Provider Order: ${result.orderId} (${result.responseTimeMs}ms)`
      );

      return {
        success: true,
        provider_order_id: result.orderId,
        provider_id: route.providerId,
        attempt_number: route.priority,
        response_time_ms: result.responseTimeMs,
      };
    }

    // 실패 기록
    await recordProviderFailure(route.providerId, result.error);

    // 주문 로그 기록
    await logOrderAttempt(
      request.order_id,
      request.product_id,
      route.providerId,
      route.serviceId,
      route.priority,
      'failed',
      undefined,
      result.error,
      result.data,
      result.responseTimeMs
    );

    console.warn(
      `[Order ${request.order_id}] FAILED with ${provider.name}: ${result.error} (${result.responseTimeMs}ms)`
    );

    // 다음 Fallback 시도
  }

  return {
    success: false,
    error: '모든 API 공급자 시도 실패',
  };
}

// 주문 상태 확인 (Provider API) - 스마트 라우팅 적용
export async function checkOrderStatus(
  providerId: string,
  providerOrderId: string
): Promise<{
  status: string;
  start_count?: number;
  remains?: number;
  error?: string;
}> {
  const { data: provider } = await getSupabase()
    .from('api_providers')
    .select('*')
    .eq('id', providerId)
    .single();

  if (!provider) {
    return { status: 'error', error: 'Provider not found' };
  }

  const result = await sendProviderRequest(provider, 'status', {
    order: providerOrderId,
  });

  // 로그 기록
  await logProviderRequest({
    providerId,
    action: 'status',
    requestData: { order: providerOrderId },
    success: result.success,
    responseTimeMs: result.responseTimeMs,
    responseData: result.data,
    errorMessage: result.error,
  });

  if (result.success && result.data) {
    if (result.data.status) {
      await recordProviderSuccess(providerId, result.responseTimeMs);
      return {
        status: result.data.status,
        start_count: result.data.start_count ? parseInt(result.data.start_count) : undefined,
        remains: result.data.remains ? parseInt(result.data.remains) : undefined,
      };
    }
  }

  await recordProviderFailure(providerId, result.error);
  return { status: 'error', error: result.error || 'Unknown error' };
}

// 주문 취소 (Provider API)
export async function cancelOrder(
  providerId: string,
  providerOrderId: string
): Promise<{ success: boolean; error?: string }> {
  const { data: provider } = await getSupabase()
    .from('api_providers')
    .select('*')
    .eq('id', providerId)
    .single();

  if (!provider) {
    return { success: false, error: 'Provider not found' };
  }

  const result = await sendProviderRequest(provider, 'cancel', {
    order: providerOrderId,
  });

  // 로그 기록
  await logProviderRequest({
    providerId,
    action: 'cancel',
    requestData: { order: providerOrderId },
    success: result.success,
    responseTimeMs: result.responseTimeMs,
    responseData: result.data,
    errorMessage: result.error,
  });

  if (result.success && result.data?.cancel) {
    await recordProviderSuccess(providerId, result.responseTimeMs);
    return { success: true };
  }

  await recordProviderFailure(providerId, result.error);
  return { success: false, error: result.error || 'Cancel failed' };
}

// 주문 리필 요청 (Provider API)
export async function refillOrder(
  providerId: string,
  providerOrderId: string
): Promise<{ success: boolean; refill_id?: string; error?: string }> {
  const { data: provider } = await getSupabase()
    .from('api_providers')
    .select('*')
    .eq('id', providerId)
    .single();

  if (!provider) {
    return { success: false, error: 'Provider not found' };
  }

  const result = await sendProviderRequest(provider, 'refill', {
    order: providerOrderId,
  });

  // 로그 기록
  await logProviderRequest({
    providerId,
    action: 'refill',
    requestData: { order: providerOrderId },
    success: result.success,
    responseTimeMs: result.responseTimeMs,
    responseData: result.data,
    errorMessage: result.error,
  });

  if (result.success && result.data?.refill) {
    await recordProviderSuccess(providerId, result.responseTimeMs);
    return { success: true, refill_id: result.data.refill.toString() };
  }

  await recordProviderFailure(providerId, result.error);
  return { success: false, error: result.error || 'Refill failed' };
}
