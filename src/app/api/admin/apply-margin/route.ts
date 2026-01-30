// ============================================
// 마진 일괄 적용 API
// 원청 도매가 × 환율 × (1 + 마진%) = 판매가
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseRouteClient } from '@/lib/supabase/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function requireAdmin() {
  const supabase = await getSupabaseRouteClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ success: false, error: '인증이 필요합니다' }, { status: 401 }) };
  }
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single() as any;
  if (!profile?.is_admin) {
    return { error: NextResponse.json({ success: false, error: '관리자 권한이 필요합니다' }, { status: 403 }) };
  }
  return { user };
}

interface PanelService {
  service: string;
  rate: string;
  name: string;
  min: string;
  max: string;
}

// 패널에서 서비스 목록 가져오기
async function fetchPanelServices(apiUrl: string, apiKey: string): Promise<PanelService[]> {
  try {
    const formData = new URLSearchParams();
    formData.append('key', apiKey);
    formData.append('action', 'services');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error('Panel fetch error:', error);
    return [];
  }
}

// 환율 가져오기
async function getExchangeRate(): Promise<number> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (response.ok) {
      const data = await response.json();
      return data.rates?.KRW || 1450;
    }
  } catch (error) {
    console.error('Exchange rate error:', error);
  }
  return 1450; // 기본값
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const { margin } = await request.json();

    if (typeof margin !== 'number' || margin < 0 || margin > 1000) {
      return NextResponse.json(
        { success: false, error: '마진은 0~1000% 사이여야 합니다' },
        { status: 400 }
      );
    }

    // 1. 현재 환율 가져오기
    const exchangeRate = await getExchangeRate();
    console.log('현재 환율:', exchangeRate);

    // 2. 활성 패널 목록 가져오기
    const { data: providers } = await supabaseAdmin
      .from('api_providers')
      .select('*')
      .eq('is_active', true);

    if (!providers || providers.length === 0) {
      return NextResponse.json(
        { success: false, error: '활성 패널이 없습니다' },
        { status: 400 }
      );
    }

    // 3. 각 패널의 서비스 목록 가져오기
    const panelServicesMap: Record<string, Record<string, PanelService>> = {};

    for (const provider of providers) {
      const services = await fetchPanelServices(provider.api_url, provider.api_key);
      panelServicesMap[provider.id] = {};
      services.forEach(s => {
        panelServicesMap[provider.id][String(s.service)] = s;
      });
      console.log(`[${provider.name}] ${services.length}개 서비스 로드`);
    }

    // 4. 상품 목록 가져오기
    const { data: products } = await supabaseAdmin
      .from('admin_products')
      .select('*');

    if (!products || products.length === 0) {
      return NextResponse.json(
        { success: false, error: '상품이 없습니다' },
        { status: 400 }
      );
    }

    // 5. 각 상품의 가격 계산 및 업데이트
    let updated = 0;
    let skipped = 0;
    const results: Array<{
      name: string;
      oldPrice: number;
      newPrice: number;
      wholesaleUsd: number;
    }> = [];

    for (const product of products) {
      // primary_provider_id와 primary_service_id가 있어야 함
      if (!product.primary_provider_id || !product.primary_service_id) {
        skipped++;
        continue;
      }

      // 해당 패널의 서비스 찾기
      const panelServices = panelServicesMap[product.primary_provider_id];
      if (!panelServices) {
        skipped++;
        continue;
      }

      const service = panelServices[product.primary_service_id];
      if (!service) {
        skipped++;
        continue;
      }

      // 도매가 (USD/1K)
      const wholesaleUsd = parseFloat(service.rate);
      if (isNaN(wholesaleUsd) || wholesaleUsd <= 0) {
        skipped++;
        continue;
      }

      // 판매가 계산: 도매가(USD) × 환율 × (1 + 마진%)
      const marginMultiplier = 1 + (margin / 100);
      const newPrice = Math.round(wholesaleUsd * exchangeRate * marginMultiplier);

      // 업데이트
      const { error } = await supabaseAdmin
        .from('admin_products')
        .update({ price_per_1000: newPrice })
        .eq('id', product.id);

      if (!error) {
        results.push({
          name: product.name,
          oldPrice: product.price_per_1000,
          newPrice,
          wholesaleUsd,
        });
        updated++;
      }
    }

    return NextResponse.json({
      success: true,
      exchangeRate,
      margin,
      updated,
      skipped,
      results: results.slice(0, 20), // 처음 20개만 반환
    });

  } catch (error: any) {
    console.error('Apply margin error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '마진 적용 실패' },
      { status: 500 }
    );
  }
}

// GET: 현재 환율 및 예상 가격 미리보기
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const margin = parseFloat(searchParams.get('margin') || '50');

    const exchangeRate = await getExchangeRate();

    return NextResponse.json({
      success: true,
      exchangeRate,
      margin,
      formula: `판매가 = 도매가(USD) × ${exchangeRate} × ${(1 + margin/100).toFixed(2)}`,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
