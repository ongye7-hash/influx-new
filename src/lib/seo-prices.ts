// ============================================
// SEO 랜딩 페이지용 가격 조회 유틸리티
// Server Component에서 사용
// ============================================

import { createClient } from '@supabase/supabase-js';

// Admin Supabase Client (서버 사이드 전용)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface ProductPrice {
  name: string;
  price_per_1000: number;
  min_quantity: number;
  max_quantity: number;
}

// 가격 포맷팅 (1000당 가격 -> 단위당 가격 표시)
export function formatPriceRange(pricePerK: number, quantity: number): string {
  const total = Math.round((pricePerK / 1000) * quantity);
  return `₩${total.toLocaleString()}`;
}

// 인스타그램 한국인 팔로워 가격 조회
export async function getInstagramKoreanFollowerPrices(): Promise<ProductPrice[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('admin_products')
      .select('name, price_per_1000, min_quantity, max_quantity')
      .ilike('name', '%한국인%팔로워%')
      .eq('is_active', true)
      .order('price_per_1000', { ascending: true })
      .limit(3);

    if (error || !data || data.length === 0) {
      // Fallback: 인스타그램 카테고리에서 팔로워 상품 조회
      const { data: fallbackData } = await supabase
        .from('admin_products')
        .select('name, price_per_1000, min_quantity, max_quantity')
        .ilike('name', '%팔로워%')
        .eq('is_active', true)
        .order('price_per_1000', { ascending: true })
        .limit(3);

      return fallbackData || [];
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch Instagram follower prices:', error);
    return [];
  }
}

// 인스타그램 좋아요 가격 조회
export async function getInstagramLikesPrices(): Promise<ProductPrice[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('admin_products')
      .select('name, price_per_1000, min_quantity, max_quantity')
      .or('name.ilike.%좋아요%,name.ilike.%likes%')
      .eq('is_active', true)
      .order('price_per_1000', { ascending: true })
      .limit(5);

    if (error || !data) {
      return [];
    }

    // 인스타그램 관련 상품만 필터
    return data.filter(p =>
      p.name.toLowerCase().includes('instagram') ||
      p.name.includes('인스타') ||
      p.name.includes('🇰🇷')
    ).slice(0, 3);
  } catch (error) {
    console.error('Failed to fetch Instagram likes prices:', error);
    return [];
  }
}

// 유튜브 조회수 가격 조회
export async function getYoutubeViewsPrices(): Promise<ProductPrice[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('admin_products')
      .select('name, price_per_1000, min_quantity, max_quantity')
      .or('name.ilike.%조회수%,name.ilike.%views%')
      .eq('is_active', true)
      .order('price_per_1000', { ascending: true })
      .limit(10);

    if (error || !data) {
      return [];
    }

    // 유튜브 관련 상품만 필터
    return data.filter(p =>
      p.name.toLowerCase().includes('youtube') ||
      p.name.includes('유튜브') ||
      p.name.includes('쇼츠')
    ).slice(0, 3);
  } catch (error) {
    console.error('Failed to fetch YouTube views prices:', error);
    return [];
  }
}

// 유튜브 구독자 가격 조회
export async function getYoutubeSubscriberPrices(): Promise<ProductPrice[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('admin_products')
      .select('name, price_per_1000, min_quantity, max_quantity')
      .or('name.ilike.%구독자%,name.ilike.%subscriber%')
      .eq('is_active', true)
      .order('price_per_1000', { ascending: true })
      .limit(5);

    if (error || !data) {
      return [];
    }

    // 유튜브 관련 상품만 필터
    return data.filter(p =>
      p.name.toLowerCase().includes('youtube') ||
      p.name.includes('유튜브')
    ).slice(0, 3);
  } catch (error) {
    console.error('Failed to fetch YouTube subscriber prices:', error);
    return [];
  }
}

// 최저가 계산
export function getLowestPrice(products: ProductPrice[]): number {
  if (products.length === 0) return 0;
  return Math.min(...products.map(p => p.price_per_1000));
}

// 가격대 생성 (100명, 500명, 1000명, 5000명 패키지)
export function generatePricePackages(pricePerK: number): Array<{ quantity: number; price: number }> {
  const packages = [100, 500, 1000, 5000];
  return packages.map(qty => ({
    quantity: qty,
    price: Math.round((pricePerK / 1000) * qty),
  }));
}
