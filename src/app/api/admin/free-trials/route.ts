// ============================================
// 관리자 무료 체험 관리 API
// admin_products 기반 + Fallback 설정 사용
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

// Service role client for admin operations
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Admin check middleware
async function isAdmin(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const serviceClient = getServiceClient();
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return profile?.is_admin === true;
}

// GET: 무료 체험 설정 및 상품 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const serviceClient = getServiceClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'trials';

    if (type === 'trials') {
      // 무료 체험 설정 목록 (admin_products JOIN)
      const { data, error } = await serviceClient
        .from('free_trial_products')
        .select(`
          *,
          product:admin_products(
            id,
            name,
            price_per_1000,
            min_quantity,
            max_quantity,
            is_active,
            primary_provider_id,
            primary_service_id,
            fallback1_provider_id,
            fallback1_service_id,
            fallback2_provider_id,
            fallback2_service_id,
            category:admin_categories(id, platform, name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // 테이블이 없으면 레거시 테이블 사용
        if (error.code === '42P01') {
          const { data: legacyData, error: legacyError } = await serviceClient
            .from('free_trial_services')
            .select(`
              *,
              service:services(id, name, price, is_active)
            `)
            .order('created_at', { ascending: false });

          if (legacyError) throw legacyError;
          return NextResponse.json({ success: true, data: legacyData || [], legacy: true });
        }
        throw error;
      }

      return NextResponse.json({ success: true, data: data || [] });
    } else if (type === 'requests') {
      // 무료 체험 신청 내역
      const { data, error } = await serviceClient
        .from('free_trials')
        .select(`
          *,
          user:profiles(email),
          product:admin_products(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return NextResponse.json({ success: true, data: data || [] });
    } else if (type === 'products') {
      // 전체 admin_products 목록 (무료체험 설정 가능한 상품)
      const { data, error } = await serviceClient
        .from('admin_products')
        .select(`
          id,
          name,
          price_per_1000,
          min_quantity,
          max_quantity,
          is_active,
          primary_provider_id,
          primary_service_id,
          fallback1_provider_id,
          fallback1_service_id,
          fallback2_provider_id,
          fallback2_service_id,
          category:admin_categories(id, platform, name),
          primary_provider:api_providers!admin_products_primary_provider_id_fkey(id, name)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return NextResponse.json({ success: true, data: data || [] });
    } else if (type === 'providers') {
      // API 공급자 목록
      const { data, error } = await serviceClient
        .from('api_providers')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ success: true, data: data || [] });
    }

    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Admin free trials GET error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 무료 체험 설정 추가
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { admin_product_id, trial_quantity, daily_limit, is_active } = body;

    if (!admin_product_id) {
      return NextResponse.json(
        { success: false, error: '상품을 선택해주세요.' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();

    // 중복 체크
    const { data: existing } = await serviceClient
      .from('free_trial_products')
      .select('id')
      .eq('admin_product_id', admin_product_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: '이미 무료 체험이 설정된 상품입니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await serviceClient
      .from('free_trial_products')
      .insert({
        admin_product_id,
        trial_quantity: trial_quantity || 50,
        daily_limit: daily_limit || 100,
        is_active: is_active ?? true,
        today_used: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Admin free trials POST error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PATCH: 무료 체험 설정 수정
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, trial_quantity, daily_limit, is_active, today_used, action } = body;

    const serviceClient = getServiceClient();

    // Special action: reset all daily limits
    if (action === 'reset_all_daily_limits') {
      const { error } = await serviceClient
        .from('free_trial_products')
        .update({ today_used: 0 })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (trial_quantity !== undefined) updateData.trial_quantity = trial_quantity;
    if (daily_limit !== undefined) updateData.daily_limit = daily_limit;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (today_used !== undefined) updateData.today_used = today_used;

    const { data, error } = await serviceClient
      .from('free_trial_products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Admin free trials PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 무료 체험 설정 삭제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!(await isAdmin(supabase))) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();

    const { error } = await serviceClient
      .from('free_trial_products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Admin free trials DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
