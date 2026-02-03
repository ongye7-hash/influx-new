// ============================================
// 가격 동기화 API (Vercel Cron 지원)
// GET: Cron에서 호출 (Authorization 헤더로 보안)
// POST: 관리자가 수동 호출
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';
import { syncAllPrices, getMarginSettings, getExchangeRate } from '@/lib/services/pricing-engine';

// Vercel Cron 보안 검증
function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');

  // Vercel Cron은 CRON_SECRET을 Bearer 토큰으로 전송
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return true;
  }

  // 로컬 개발 환경 허용
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return false;
}

// 관리자 권한 확인
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

/**
 * GET: Vercel Cron에서 자동 호출
 *
 * vercel.json에 다음 설정 필요:
 * {
 *   "crons": [{
 *     "path": "/api/admin/system/sync-prices",
 *     "schedule": "0 * * * *"  // 매시 정각
 *   }]
 * }
 *
 * 환경변수:
 * - CRON_SECRET: Vercel에서 자동 생성
 */
export async function GET(request: NextRequest) {
  try {
    // Cron 요청 검증
    if (!verifyCronRequest(request)) {
      console.warn('[SyncPrices] Unauthorized cron request');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[SyncPrices] Cron job started');

    // 마진 설정 가져오기
    const { marginRate, fixedFee } = await getMarginSettings();

    // 가격 동기화 실행
    const result = await syncAllPrices(marginRate, fixedFee, false);

    console.log(`[SyncPrices] Cron job completed - Updated: ${result.stats.updated}, Disabled: ${result.stats.disabled}`);

    // 비활성화된 상품이 있으면 알림 (나중에 Slack/Discord webhook 연동 가능)
    if (result.stats.disabled > 0) {
      console.warn(`[SyncPrices] ALERT: ${result.stats.disabled} products disabled due to price spike!`);
      // TODO: Send notification to admin
    }

    return NextResponse.json({
      success: result.success,
      message: `Price sync completed`,
      stats: result.stats,
      exchangeRate: result.exchangeRate,
      timestamp: result.timestamp,
    });

  } catch (error: any) {
    console.error('[SyncPrices] Cron job error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Price sync failed' },
      { status: 500 }
    );
  }
}

/**
 * POST: 관리자 수동 호출
 *
 * Body:
 * {
 *   "marginRate": 50,     // 마진율 (%)
 *   "fixedFee": 0,        // 고정 수수료 (원)
 *   "dryRun": false       // true면 시뮬레이션만
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const marginRate = typeof body.marginRate === 'number' ? body.marginRate : 50;
    const fixedFee = typeof body.fixedFee === 'number' ? body.fixedFee : 0;
    const dryRun = body.dryRun === true;

    // 마진율 유효성 검사
    if (marginRate < 0 || marginRate > 1000) {
      return NextResponse.json(
        { success: false, error: '마진율은 0~1000% 사이여야 합니다' },
        { status: 400 }
      );
    }

    console.log(`[SyncPrices] Manual sync - Margin: ${marginRate}%, Fixed Fee: ${fixedFee}원, Dry Run: ${dryRun}`);

    // 가격 동기화 실행
    const result = await syncAllPrices(marginRate, fixedFee, dryRun);

    return NextResponse.json({
      success: result.success,
      dryRun,
      exchangeRate: result.exchangeRate,
      marginRate: result.marginRate,
      fixedFee: result.fixedFee,
      stats: result.stats,
      results: result.results.slice(0, 50), // 최대 50개만 반환
      errors: result.errors,
      timestamp: result.timestamp,
    });

  } catch (error: any) {
    console.error('[SyncPrices] Manual sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Price sync failed' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS: CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
