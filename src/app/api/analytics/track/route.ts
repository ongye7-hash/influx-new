// ============================================
// 방문자 추적 API
// 프론트엔드에서 호출하여 방문 로그 저장
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase Admin Client (lazy initialization)
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

// User-Agent 파싱
function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  const device = /Mobile|Android|iPhone|iPad/i.test(ua)
    ? (/iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile')
    : 'desktop';

  let browser = 'unknown';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/MSIE|Trident/i.test(ua)) browser = 'IE';

  let os = 'unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { device, browser, os };
}

// IP 해시 생성 (프라이버시)
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.SUPABASE_SERVICE_ROLE_KEY).digest('hex').slice(0, 16);
}

// UTM 파라미터 추출
function extractUTM(url: string): { source?: string; medium?: string; campaign?: string } {
  try {
    const params = new URL(url).searchParams;
    return {
      source: params.get('utm_source') || undefined,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
    };
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, title, referrer, sessionId, fullUrl } = body;

    // IP 주소 가져오기
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() :
               request.headers.get('x-real-ip') ||
               'unknown';

    // User-Agent 파싱
    const userAgent = request.headers.get('user-agent') || '';
    const { device, browser, os } = parseUserAgent(userAgent);

    // 국가 (Vercel에서 제공)
    const country = request.headers.get('x-vercel-ip-country') ||
                    request.headers.get('cf-ipcountry') ||
                    'XX';

    // 도시
    const city = request.headers.get('x-vercel-ip-city') || undefined;

    // UTM 파라미터
    const utm = extractUTM(fullUrl || '');

    // IP 해시 생성
    const ipHash = hashIP(ip);

    // 오늘 같은 IP로 방문한 적 있는지 확인
    const today = new Date().toISOString().split('T')[0];
    const { data: existingVisit } = await getSupabase()
      .from('visitor_logs')
      .select('id')
      .eq('ip_hash', ipHash)
      .eq('visit_date', today)
      .limit(1);

    const isNewVisitor = !existingVisit || existingVisit.length === 0;

    // 로그 저장
    const { error } = await getSupabase().from('visitor_logs').insert({
      ip_address: ip.slice(0, 45),  // 길이 제한
      ip_hash: ipHash,
      page_path: path || '/',
      page_title: title,
      referrer: referrer || null,
      utm_source: utm.source,
      utm_medium: utm.medium,
      utm_campaign: utm.campaign,
      user_agent: userAgent.slice(0, 500),
      device_type: device,
      browser,
      os,
      country,
      city,
      session_id: sessionId,
      is_new_visitor: isNewVisitor,
      visit_date: today,
    });

    if (error) {
      console.error('[Analytics] Track error:', error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, isNew: isNewVisitor });

  } catch (error) {
    console.error('[Analytics] Track error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
