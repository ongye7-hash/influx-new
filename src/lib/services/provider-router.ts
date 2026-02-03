// ============================================
// 스마트 Provider 라우터
// 장애 감지 및 자동 Fallback
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

// ============================================
// Types
// ============================================
export interface ApiProvider {
  id: string;
  name: string;
  slug: string;
  api_url: string;
  api_key: string;
  is_active: boolean;
  recent_failure_count: number;
  last_failure_at: string | null;
  failure_cooldown_until: string | null;
}

export interface ProviderRoute {
  providerId: string;
  serviceId: string;
  priority: number; // 1 = primary, 2 = fallback1, 3 = fallback2
}

export interface ApiRequestLog {
  providerId: string;
  orderId?: string;
  action: string;
  serviceId?: string;
  requestData?: any;
  success: boolean;
  responseStatus?: number;
  responseTimeMs?: number;
  responseData?: any;
  errorMessage?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  orderId?: string;
  responseTimeMs?: number;
}

// ============================================
// Constants
// ============================================
const FAILURE_THRESHOLD = 3; // 3회 연속 실패 시 쿨다운
const COOLDOWN_MINUTES = 30; // 30분 쿨다운
const REQUEST_TIMEOUT_MS = 15000; // 15초 타임아웃

// ============================================
// Provider Health Check
// ============================================

/**
 * Provider가 사용 가능한지 확인
 */
export async function isProviderAvailable(providerId: string): Promise<boolean> {
  const { data: provider } = await getSupabase()
    .from('api_providers')
    .select('is_active, failure_cooldown_until')
    .eq('id', providerId)
    .single();

  if (!provider) return false;
  if (!provider.is_active) return false;

  // 쿨다운 체크
  if (provider.failure_cooldown_until) {
    const cooldownEnd = new Date(provider.failure_cooldown_until);
    if (cooldownEnd > new Date()) {
      console.log(`[ProviderRouter] Provider ${providerId} is in cooldown until ${cooldownEnd}`);
      return false;
    }
  }

  return true;
}

/**
 * 만료된 쿨다운 리셋
 */
export async function resetExpiredCooldowns(): Promise<number> {
  const { data, error } = await getSupabase()
    .from('api_providers')
    .update({
      failure_cooldown_until: null,
      recent_failure_count: 0,
    })
    .lt('failure_cooldown_until', new Date().toISOString())
    .not('failure_cooldown_until', 'is', null)
    .select('id');

  if (error) {
    console.error('[ProviderRouter] Failed to reset cooldowns:', error);
    return 0;
  }

  return data?.length || 0;
}

// ============================================
// Logging
// ============================================

/**
 * API 요청 로그 기록
 */
export async function logProviderRequest(log: ApiRequestLog): Promise<void> {
  try {
    await getSupabase().from('provider_logs').insert({
      provider_id: log.providerId,
      order_id: log.orderId || null,
      action: log.action,
      service_id: log.serviceId || null,
      request_data: log.requestData || null,
      success: log.success,
      response_status: log.responseStatus || null,
      response_time_ms: log.responseTimeMs || null,
      response_data: log.responseData || null,
      error_message: log.errorMessage || null,
    });
  } catch (error) {
    console.error('[ProviderRouter] Failed to log request:', error);
  }
}

/**
 * 실패 기록 및 쿨다운 처리
 */
export async function recordProviderFailure(providerId: string, errorMessage?: string): Promise<void> {
  const { data: provider } = await getSupabase()
    .from('api_providers')
    .select('recent_failure_count, total_failures')
    .eq('id', providerId)
    .single();

  if (!provider) return;

  const newFailureCount = (provider.recent_failure_count || 0) + 1;

  const updateData: any = {
    recent_failure_count: newFailureCount,
    last_failure_at: new Date().toISOString(),
    total_failures: (provider.total_failures || 0) + 1,
  };

  // 임계값 초과 시 쿨다운 설정
  if (newFailureCount >= FAILURE_THRESHOLD) {
    const cooldownEnd = new Date();
    cooldownEnd.setMinutes(cooldownEnd.getMinutes() + COOLDOWN_MINUTES);
    updateData.failure_cooldown_until = cooldownEnd.toISOString();

    console.warn(`[ProviderRouter] Provider ${providerId} entered ${COOLDOWN_MINUTES}min cooldown (${newFailureCount} consecutive failures)`);
  }

  await getSupabase()
    .from('api_providers')
    .update(updateData)
    .eq('id', providerId);
}

/**
 * 성공 기록 (실패 카운트 리셋)
 */
export async function recordProviderSuccess(providerId: string, responseTimeMs?: number): Promise<void> {
  const { data: provider } = await getSupabase()
    .from('api_providers')
    .select('avg_response_time_ms, total_requests')
    .eq('id', providerId)
    .single();

  const updateData: any = {
    recent_failure_count: 0,
    failure_cooldown_until: null,
    total_requests: (provider?.total_requests || 0) + 1,
  };

  // 평균 응답 시간 업데이트 (지수 이동 평균)
  if (responseTimeMs) {
    const currentAvg = provider?.avg_response_time_ms || responseTimeMs;
    updateData.avg_response_time_ms = Math.round(currentAvg * 0.9 + responseTimeMs * 0.1);
  }

  await getSupabase()
    .from('api_providers')
    .update(updateData)
    .eq('id', providerId);
}

// ============================================
// Smart Routing
// ============================================

/**
 * 사용 가능한 Provider 라우트 반환 (우선순위 순)
 */
export async function getAvailableRoutes(
  primaryProviderId: string | null,
  primaryServiceId: string | null,
  fallback1ProviderId: string | null,
  fallback1ServiceId: string | null,
  fallback2ProviderId: string | null,
  fallback2ServiceId: string | null
): Promise<ProviderRoute[]> {
  const routes: ProviderRoute[] = [];

  // 모든 provider ID 수집
  const providerIds = [primaryProviderId, fallback1ProviderId, fallback2ProviderId].filter(Boolean) as string[];

  if (providerIds.length === 0) {
    return routes;
  }

  // 한 번에 모든 provider 상태 조회
  const { data: providers } = await getSupabase()
    .from('api_providers')
    .select('id, is_active, failure_cooldown_until')
    .in('id', providerIds);

  if (!providers) return routes;

  const providerStatusMap = new Map(providers.map(p => [p.id, p]));

  // Primary
  if (primaryProviderId && primaryServiceId) {
    const provider = providerStatusMap.get(primaryProviderId);
    if (provider && isProviderHealthy(provider)) {
      routes.push({ providerId: primaryProviderId, serviceId: primaryServiceId, priority: 1 });
    }
  }

  // Fallback 1
  if (fallback1ProviderId && fallback1ServiceId) {
    const provider = providerStatusMap.get(fallback1ProviderId);
    if (provider && isProviderHealthy(provider)) {
      routes.push({ providerId: fallback1ProviderId, serviceId: fallback1ServiceId, priority: 2 });
    }
  }

  // Fallback 2
  if (fallback2ProviderId && fallback2ServiceId) {
    const provider = providerStatusMap.get(fallback2ProviderId);
    if (provider && isProviderHealthy(provider)) {
      routes.push({ providerId: fallback2ProviderId, serviceId: fallback2ServiceId, priority: 3 });
    }
  }

  return routes;
}

/**
 * Provider 건강 상태 체크 (내부용)
 */
function isProviderHealthy(provider: { is_active: boolean; failure_cooldown_until: string | null }): boolean {
  if (!provider.is_active) return false;

  if (provider.failure_cooldown_until) {
    const cooldownEnd = new Date(provider.failure_cooldown_until);
    if (cooldownEnd > new Date()) return false;
  }

  return true;
}

// ============================================
// API Request with Timeout
// ============================================

/**
 * 타임아웃 적용된 API 요청
 */
export async function sendProviderRequest(
  provider: ApiProvider,
  action: string,
  params: Record<string, string>
): Promise<ApiResponse> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const formData = new URLSearchParams();
    formData.append('key', provider.api_key);
    formData.append('action', action);

    for (const [key, value] of Object.entries(params)) {
      formData.append(key, value);
    }

    const response = await fetch(provider.api_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseTimeMs = Date.now() - startTime;
    const data = await response.json();

    // SMM Panel 표준: { order: 12345 } or { error: "..." }
    if (action === 'add' && data.order) {
      return {
        success: true,
        orderId: data.order.toString(),
        data,
        responseTimeMs,
      };
    }

    // 에러 응답
    if (data.error) {
      return {
        success: false,
        error: data.error,
        data,
        responseTimeMs,
      };
    }

    // 기타 성공 응답 (status, services 등)
    return {
      success: true,
      data,
      responseTimeMs,
    };
  } catch (error: any) {
    const responseTimeMs = Date.now() - startTime;

    if (error.name === 'AbortError') {
      return {
        success: false,
        error: `Request timeout (${REQUEST_TIMEOUT_MS}ms)`,
        responseTimeMs,
      };
    }

    return {
      success: false,
      error: error.message || 'Network error',
      responseTimeMs,
    };
  }
}

// ============================================
// Provider Health Stats
// ============================================

/**
 * 모든 Provider의 건강 상태 조회
 */
export async function getProviderHealthStats(): Promise<any[]> {
  const { data, error } = await getSupabase()
    .from('api_providers')
    .select(`
      id,
      name,
      slug,
      is_active,
      recent_failure_count,
      last_failure_at,
      failure_cooldown_until,
      total_requests,
      total_failures,
      avg_response_time_ms
    `)
    .order('priority', { ascending: false });

  if (error) {
    console.error('[ProviderRouter] Failed to get health stats:', error);
    return [];
  }

  return (data || []).map(provider => ({
    ...provider,
    health_status: getHealthStatus(provider),
    success_rate: provider.total_requests > 0
      ? ((provider.total_requests - provider.total_failures) / provider.total_requests * 100).toFixed(1)
      : '100.0',
  }));
}

/**
 * 건강 상태 문자열 반환
 */
function getHealthStatus(provider: {
  is_active: boolean;
  failure_cooldown_until: string | null;
  recent_failure_count: number;
}): string {
  if (!provider.is_active) return 'disabled';

  if (provider.failure_cooldown_until) {
    const cooldownEnd = new Date(provider.failure_cooldown_until);
    if (cooldownEnd > new Date()) return 'cooldown';
  }

  if (provider.recent_failure_count >= FAILURE_THRESHOLD) return 'unhealthy';
  if (provider.recent_failure_count >= 1) return 'degraded';

  return 'healthy';
}
