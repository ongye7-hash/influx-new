// ============================================
// 관리자 무료 체험 관리 API
// Service role key를 사용하여 RLS 우회
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

// GET: 무료 체험 서비스 목록 조회
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
    const type = searchParams.get('type') || 'services';

    if (type === 'services') {
      // 무료 체험 서비스 목록
      const { data, error } = await serviceClient
        .from('free_trial_services')
        .select(`
          *,
          service:services!service_id(id, name, price, is_active)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ success: true, data: data || [] });
    } else if (type === 'requests') {
      // 무료 체험 신청 내역
      const { data, error } = await serviceClient
        .from('free_trials')
        .select(`
          *,
          user:profiles(email),
          service:services(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return NextResponse.json({ success: true, data: data || [] });
    } else if (type === 'all-services') {
      // 전체 서비스 목록 (드롭다운용)
      const { data, error } = await serviceClient
        .from('services')
        .select('id, name, price, is_active')
        .eq('is_active', true)
        .order('name');

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

// POST: 무료 체험 서비스 추가
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
    const { service_id, trial_quantity, daily_limit, is_active } = body;

    if (!service_id) {
      return NextResponse.json(
        { success: false, error: '상품을 선택해주세요.' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();

    // 중복 체크
    const { data: existing } = await serviceClient
      .from('free_trial_services')
      .select('id')
      .eq('service_id', service_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: '이미 무료 체험이 설정된 상품입니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await serviceClient
      .from('free_trial_services')
      .insert({
        service_id,
        trial_quantity: trial_quantity || 50,
        daily_limit: daily_limit || 100,
        is_active: is_active ?? true,
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

// PATCH: 무료 체험 서비스 수정
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
        .from('free_trial_services')
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
      .from('free_trial_services')
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

// DELETE: 무료 체험 서비스 삭제
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
      .from('free_trial_services')
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
