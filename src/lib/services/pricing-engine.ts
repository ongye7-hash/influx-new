// ============================================
// 동적 마진 엔진 (Pricing Engine)
// 도매가 × 환율 × (1 + 마진율) + 고정수수료 = 판매가
// 역마진 방지 및 급등 감지 시스템
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Admin Supabase Client (lazy initialization)
let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabaseAdmin;
}

// ============================================
// Types
// ============================================
interface PanelService {
  service: string;
  rate: string;
  name: string;
  min: string;
  max: string;
}

interface Provider {
  id: string;
  name: string;
  slug: string;
  api_url: string;
  api_key: string;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  price_per_1000: number;
  primary_provider_id: string | null;
  primary_service_id: string | null;
  is_active: boolean;
}

interface PriceUpdateResult {
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  wholesaleUsd: number;
  priceChangePercent: number;
  action: 'updated' | 'disabled' | 'skipped';
  reason?: string;
}

interface SyncResult {
  success: boolean;
  exchangeRate: number;
  marginRate: number;
  fixedFee: number;
  timestamp: string;
  stats: {
    total: number;
    updated: number;
    disabled: number;
    skipped: number;
  };
  results: PriceUpdateResult[];
  errors: string[];
}

// ============================================
// Constants
// ============================================
const DEFAULT_MARGIN_RATE = 50; // 50%
const DEFAULT_FIXED_FEE = 0; // 고정 수수료 (원)
const PRICE_SPIKE_THRESHOLD = 50; // 50% 이상 급등 시 비활성화
const FALLBACK_EXCHANGE_RATE = 1450; // 환율 API 실패 시 기본값

// ============================================
// Utility Functions
// ============================================

/**
 * 실시간 USD/KRW 환율 조회
 */
export async function getExchangeRate(): Promise<number> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return data.rates?.KRW || FALLBACK_EXCHANGE_RATE;
    }
  } catch (error) {
    console.error('[PricingEngine] Exchange rate fetch error:', error);
  }
  return FALLBACK_EXCHANGE_RATE;
}

/**
 * 패널에서 서비스 목록 및 가격 조회
 */
async function fetchPanelServices(apiUrl: string, apiKey: string): Promise<PanelService[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const formData = new URLSearchParams();
    formData.append('key', apiKey);
    formData.append('action', 'services');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error('[PricingEngine] Panel fetch error:', error);
    return [];
  }
}

/**
 * 판매가 계산
 * 공식: (도매가 × 환율) × (1 + 마진율/100) + 고정수수료
 */
export function calculateSellingPrice(
  wholesaleUsd: number,
  exchangeRate: number,
  marginRate: number,
  fixedFee: number = 0
): number {
  const marginMultiplier = 1 + (marginRate / 100);
  const price = (wholesaleUsd * exchangeRate * marginMultiplier) + fixedFee;
  return Math.round(price);
}

/**
 * 가격 변동률 계산 (%)
 */
function calculatePriceChangePercent(oldPrice: number, newPrice: number): number {
  if (oldPrice === 0) return 100;
  return ((newPrice - oldPrice) / oldPrice) * 100;
}

// ============================================
// Price Sync Log
// ============================================

/**
 * 가격 동기화 로그 기록
 */
async function logPriceSync(result: SyncResult): Promise<void> {
  try {
    await getSupabaseAdmin().from('price_sync_logs').insert({
      exchange_rate: result.exchangeRate,
      margin_rate: result.marginRate,
      fixed_fee: result.fixedFee,
      total_products: result.stats.total,
      updated_count: result.stats.updated,
      disabled_count: result.stats.disabled,
      skipped_count: result.stats.skipped,
      results: result.results,
      errors: result.errors,
      created_at: result.timestamp,
    });
  } catch (error) {
    console.error('[PricingEngine] Failed to log price sync:', error);
  }
}

// ============================================
// Main Pricing Engine
// ============================================

/**
 * 전체 상품 가격 동기화
 * @param marginRate - 마진율 (기본 50%)
 * @param fixedFee - 고정 수수료 (기본 0원)
 * @param dryRun - true면 실제 업데이트 없이 시뮬레이션만
 */
export async function syncAllPrices(
  marginRate: number = DEFAULT_MARGIN_RATE,
  fixedFee: number = DEFAULT_FIXED_FEE,
  dryRun: boolean = false
): Promise<SyncResult> {
  const timestamp = new Date().toISOString();
  const errors: string[] = [];
  const results: PriceUpdateResult[] = [];

  console.log(`[PricingEngine] Starting price sync - Margin: ${marginRate}%, Fixed Fee: ${fixedFee}원, Dry Run: ${dryRun}`);

  // 1. 환율 조회
  const exchangeRate = await getExchangeRate();
  console.log(`[PricingEngine] Exchange rate: ${exchangeRate} KRW/USD`);

  // 2. 활성 API 공급자 조회
  const { data: providers, error: providerError } = await getSupabaseAdmin()
    .from('api_providers')
    .select('*')
    .eq('is_active', true);

  if (providerError || !providers || providers.length === 0) {
    errors.push('No active providers found');
    return {
      success: false,
      exchangeRate,
      marginRate,
      fixedFee,
      timestamp,
      stats: { total: 0, updated: 0, disabled: 0, skipped: 0 },
      results: [],
      errors,
    };
  }

  // 3. 각 공급자의 서비스 가격 목록 로드
  const panelServicesMap: Record<string, Record<string, PanelService>> = {};

  for (const provider of providers as Provider[]) {
    const services = await fetchPanelServices(provider.api_url, provider.api_key);
    panelServicesMap[provider.id] = {};
    services.forEach(s => {
      panelServicesMap[provider.id][String(s.service)] = s;
    });
    console.log(`[PricingEngine] [${provider.name}] Loaded ${services.length} services`);
  }

  // 4. 상품 목록 조회
  const { data: products, error: productError } = await getSupabaseAdmin()
    .from('admin_products')
    .select('*');

  if (productError || !products || products.length === 0) {
    errors.push('No products found');
    return {
      success: false,
      exchangeRate,
      marginRate,
      fixedFee,
      timestamp,
      stats: { total: 0, updated: 0, disabled: 0, skipped: 0 },
      results: [],
      errors,
    };
  }

  // 5. 각 상품 가격 계산 및 업데이트
  let updated = 0;
  let disabled = 0;
  let skipped = 0;

  for (const product of products as Product[]) {
    // API 연결이 없으면 스킵
    if (!product.primary_provider_id || !product.primary_service_id) {
      skipped++;
      results.push({
        productId: product.id,
        productName: product.name,
        oldPrice: product.price_per_1000,
        newPrice: product.price_per_1000,
        wholesaleUsd: 0,
        priceChangePercent: 0,
        action: 'skipped',
        reason: 'No API connection',
      });
      continue;
    }

    // 해당 공급자의 서비스 찾기
    const panelServices = panelServicesMap[product.primary_provider_id];
    if (!panelServices) {
      skipped++;
      results.push({
        productId: product.id,
        productName: product.name,
        oldPrice: product.price_per_1000,
        newPrice: product.price_per_1000,
        wholesaleUsd: 0,
        priceChangePercent: 0,
        action: 'skipped',
        reason: 'Provider not found in active list',
      });
      continue;
    }

    const service = panelServices[product.primary_service_id];
    if (!service) {
      skipped++;
      results.push({
        productId: product.id,
        productName: product.name,
        oldPrice: product.price_per_1000,
        newPrice: product.price_per_1000,
        wholesaleUsd: 0,
        priceChangePercent: 0,
        action: 'skipped',
        reason: 'Service not found in provider',
      });
      continue;
    }

    // 도매가 파싱
    const wholesaleUsd = parseFloat(service.rate);
    if (isNaN(wholesaleUsd) || wholesaleUsd <= 0) {
      skipped++;
      results.push({
        productId: product.id,
        productName: product.name,
        oldPrice: product.price_per_1000,
        newPrice: product.price_per_1000,
        wholesaleUsd: 0,
        priceChangePercent: 0,
        action: 'skipped',
        reason: 'Invalid wholesale price',
      });
      continue;
    }

    // 새 판매가 계산
    const newPrice = calculateSellingPrice(wholesaleUsd, exchangeRate, marginRate, fixedFee);
    const priceChangePercent = calculatePriceChangePercent(product.price_per_1000, newPrice);

    // 가격 급등 감지 (50% 이상)
    if (priceChangePercent >= PRICE_SPIKE_THRESHOLD) {
      if (!dryRun) {
        // 상품 비활성화
        const { error: disableError } = await getSupabaseAdmin()
          .from('admin_products')
          .update({ is_active: false })
          .eq('id', product.id);

        if (disableError) {
          errors.push(`Failed to disable product ${product.name}: ${disableError.message}`);
        }
      }

      disabled++;
      results.push({
        productId: product.id,
        productName: product.name,
        oldPrice: product.price_per_1000,
        newPrice,
        wholesaleUsd,
        priceChangePercent,
        action: 'disabled',
        reason: `Price spike ${priceChangePercent.toFixed(1)}% exceeds threshold ${PRICE_SPIKE_THRESHOLD}%`,
      });

      console.warn(`[PricingEngine] ALERT: ${product.name} price spike ${priceChangePercent.toFixed(1)}% - DISABLED`);
      continue;
    }

    // 가격 업데이트
    if (!dryRun) {
      const { error: updateError } = await getSupabaseAdmin()
        .from('admin_products')
        .update({ price_per_1000: newPrice })
        .eq('id', product.id);

      if (updateError) {
        errors.push(`Failed to update product ${product.name}: ${updateError.message}`);
        skipped++;
        continue;
      }
    }

    updated++;
    results.push({
      productId: product.id,
      productName: product.name,
      oldPrice: product.price_per_1000,
      newPrice,
      wholesaleUsd,
      priceChangePercent,
      action: 'updated',
    });
  }

  const syncResult: SyncResult = {
    success: errors.length === 0,
    exchangeRate,
    marginRate,
    fixedFee,
    timestamp,
    stats: {
      total: products.length,
      updated,
      disabled,
      skipped,
    },
    results,
    errors,
  };

  // 로그 기록 (dry run 아닐 때만)
  if (!dryRun) {
    await logPriceSync(syncResult);
  }

  console.log(`[PricingEngine] Sync complete - Updated: ${updated}, Disabled: ${disabled}, Skipped: ${skipped}`);

  return syncResult;
}

/**
 * 단일 상품 가격 동기화
 */
export async function syncProductPrice(
  productId: string,
  marginRate: number = DEFAULT_MARGIN_RATE,
  fixedFee: number = DEFAULT_FIXED_FEE
): Promise<PriceUpdateResult | null> {
  const exchangeRate = await getExchangeRate();

  // 상품 조회
  const { data: product, error: productError } = await getSupabaseAdmin()
    .from('admin_products')
    .select('*')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    console.error('[PricingEngine] Product not found:', productId);
    return null;
  }

  if (!product.primary_provider_id || !product.primary_service_id) {
    return {
      productId: product.id,
      productName: product.name,
      oldPrice: product.price_per_1000,
      newPrice: product.price_per_1000,
      wholesaleUsd: 0,
      priceChangePercent: 0,
      action: 'skipped',
      reason: 'No API connection',
    };
  }

  // 공급자 조회
  const { data: provider } = await getSupabaseAdmin()
    .from('api_providers')
    .select('*')
    .eq('id', product.primary_provider_id)
    .single();

  if (!provider) {
    return {
      productId: product.id,
      productName: product.name,
      oldPrice: product.price_per_1000,
      newPrice: product.price_per_1000,
      wholesaleUsd: 0,
      priceChangePercent: 0,
      action: 'skipped',
      reason: 'Provider not found',
    };
  }

  // 서비스 가격 조회
  const services = await fetchPanelServices(provider.api_url, provider.api_key);
  const service = services.find(s => String(s.service) === product.primary_service_id);

  if (!service) {
    return {
      productId: product.id,
      productName: product.name,
      oldPrice: product.price_per_1000,
      newPrice: product.price_per_1000,
      wholesaleUsd: 0,
      priceChangePercent: 0,
      action: 'skipped',
      reason: 'Service not found',
    };
  }

  const wholesaleUsd = parseFloat(service.rate);
  if (isNaN(wholesaleUsd) || wholesaleUsd <= 0) {
    return {
      productId: product.id,
      productName: product.name,
      oldPrice: product.price_per_1000,
      newPrice: product.price_per_1000,
      wholesaleUsd: 0,
      priceChangePercent: 0,
      action: 'skipped',
      reason: 'Invalid wholesale price',
    };
  }

  const newPrice = calculateSellingPrice(wholesaleUsd, exchangeRate, marginRate, fixedFee);
  const priceChangePercent = calculatePriceChangePercent(product.price_per_1000, newPrice);

  // 가격 급등 감지
  if (priceChangePercent >= PRICE_SPIKE_THRESHOLD) {
    await getSupabaseAdmin()
      .from('admin_products')
      .update({ is_active: false })
      .eq('id', product.id);

    return {
      productId: product.id,
      productName: product.name,
      oldPrice: product.price_per_1000,
      newPrice,
      wholesaleUsd,
      priceChangePercent,
      action: 'disabled',
      reason: `Price spike ${priceChangePercent.toFixed(1)}%`,
    };
  }

  // 업데이트
  await getSupabaseAdmin()
    .from('admin_products')
    .update({ price_per_1000: newPrice })
    .eq('id', product.id);

  return {
    productId: product.id,
    productName: product.name,
    oldPrice: product.price_per_1000,
    newPrice,
    wholesaleUsd,
    priceChangePercent,
    action: 'updated',
  };
}

/**
 * 마진 설정 조회 (admin_settings 테이블에서)
 */
export async function getMarginSettings(): Promise<{ marginRate: number; fixedFee: number }> {
  try {
    const { data } = await getSupabaseAdmin()
      .from('admin_settings')
      .select('value')
      .eq('key', 'pricing_config')
      .single();

    if (data?.value) {
      return {
        marginRate: data.value.margin_rate || DEFAULT_MARGIN_RATE,
        fixedFee: data.value.fixed_fee || DEFAULT_FIXED_FEE,
      };
    }
  } catch (error) {
    console.error('[PricingEngine] Failed to get margin settings:', error);
  }

  return {
    marginRate: DEFAULT_MARGIN_RATE,
    fixedFee: DEFAULT_FIXED_FEE,
  };
}
