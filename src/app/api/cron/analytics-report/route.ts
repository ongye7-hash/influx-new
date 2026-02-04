// ============================================
// 방문자 분석 텔레그램 리포트 (3시간마다)
// Vercel Cron에서 호출
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '@/lib/services/telegram-bot';

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

// Cron 보안 검증
function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true;
  if (process.env.NODE_ENV === 'development') return true;
  return false;
}

interface VisitorLog {
  ip_hash: string;
  page_path: string;
  device_type: string;
  browser: string;
  country: string;
  referrer: string | null;
  is_new_visitor: boolean;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyCronRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 최근 3시간 데이터 조회
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    const { data: logs, error } = await getSupabase()
      .from('visitor_logs')
      .select('ip_hash, page_path, device_type, browser, country, referrer, is_new_visitor, created_at')
      .gte('created_at', threeHoursAgo)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AnalyticsReport] Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const visitorLogs = (logs || []) as VisitorLog[];

    // 방문자가 없으면 리포트 생략
    if (visitorLogs.length === 0) {
      console.log('[AnalyticsReport] No visitors in last 3 hours, skipping report');
      return NextResponse.json({ success: true, message: 'No visitors' });
    }

    // === 분석 ===

    // 총 페이지뷰
    const totalPageViews = visitorLogs.length;

    // 순방문자 (고유 IP)
    const uniqueIPs = new Set(visitorLogs.map(l => l.ip_hash));
    const uniqueVisitors = uniqueIPs.size;

    // 신규 방문자
    const newVisitors = visitorLogs.filter(l => l.is_new_visitor).length;

    // 재방문자 (같은 IP로 여러 페이지)
    const returningVisitors = uniqueVisitors - new Set(visitorLogs.filter(l => l.is_new_visitor).map(l => l.ip_hash)).size;

    // 인기 페이지 TOP 5
    const pageCounts: Record<string, number> = {};
    visitorLogs.forEach(l => {
      pageCounts[l.page_path] = (pageCounts[l.page_path] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, count]) => `${path} (${count})`);

    // 기기 비율
    const deviceCounts: Record<string, number> = {};
    visitorLogs.forEach(l => {
      const device = l.device_type || 'unknown';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });
    const deviceStats = Object.entries(deviceCounts)
      .map(([device, count]) => {
        const percent = Math.round((count / totalPageViews) * 100);
        const emoji = device === 'mobile' ? '📱' : device === 'desktop' ? '💻' : '📟';
        return `${emoji} ${device}: ${percent}%`;
      })
      .join(' | ');

    // 국가별
    const countryCounts: Record<string, number> = {};
    visitorLogs.forEach(l => {
      const country = l.country || 'XX';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, count]) => {
        const flag = countryFlag(country);
        return `${flag} ${country}: ${count}`;
      })
      .join(' | ');

    // 유입 경로 TOP 3
    const referrerCounts: Record<string, number> = {};
    visitorLogs.forEach(l => {
      if (l.referrer) {
        try {
          const host = new URL(l.referrer).hostname.replace('www.', '');
          referrerCounts[host] = (referrerCounts[host] || 0) + 1;
        } catch {
          // invalid URL
        }
      } else {
        referrerCounts['직접 접속'] = (referrerCounts['직접 접속'] || 0) + 1;
      }
    });
    const topReferrers = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([ref, count]) => `${ref} (${count})`)
      .join(', ');

    // 시간대별 분포 (3시간을 6개 30분 단위로)
    const hourlyPattern = getHourlyPattern(visitorLogs);

    // 중복 방문 분석 (같은 IP가 여러 페이지)
    const ipPageCounts: Record<string, number> = {};
    visitorLogs.forEach(l => {
      ipPageCounts[l.ip_hash] = (ipPageCounts[l.ip_hash] || 0) + 1;
    });
    const multiPageVisitors = Object.values(ipPageCounts).filter(c => c > 1).length;
    const avgPagesPerVisitor = (totalPageViews / uniqueVisitors).toFixed(1);

    // === 텔레그램 메시지 생성 ===
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const message = `📊 <b>방문자 리포트</b> (최근 3시간)
━━━━━━━━━━━━━━━

👥 <b>방문자 요약</b>
• 순방문자: <b>${uniqueVisitors}명</b>
• 총 페이지뷰: <b>${totalPageViews}회</b>
• 신규 방문자: ${newVisitors}명
• 재방문자: ${returningVisitors}명
• 평균 페이지/방문: ${avgPagesPerVisitor}

📱 <b>기기</b>
${deviceStats}

🌍 <b>국가</b>
${topCountries}

📄 <b>인기 페이지 TOP 5</b>
${topPages.map((p, i) => `${i + 1}. ${p}`).join('\n')}

🔗 <b>유입 경로</b>
${topReferrers || '데이터 없음'}

📈 <b>시간대 패턴</b>
${hourlyPattern}

🔄 <b>중복 방문</b>
• 2페이지 이상 본 방문자: ${multiPageVisitors}명
• 중복 IP 비율: ${Math.round((multiPageVisitors / uniqueVisitors) * 100)}%

⏰ ${now}`;

    await sendTelegramMessage(message);

    console.log(`[AnalyticsReport] Sent report: ${uniqueVisitors} visitors, ${totalPageViews} pageviews`);

    return NextResponse.json({
      success: true,
      stats: {
        uniqueVisitors,
        totalPageViews,
        newVisitors,
        topPages: topPages.slice(0, 3),
      },
    });

  } catch (error: any) {
    console.error('[AnalyticsReport] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 국가 플래그 이모지
function countryFlag(code: string): string {
  if (!code || code === 'XX') return '🌐';
  try {
    const codePoints = [...code.toUpperCase()].map(
      char => 0x1F1E6 - 65 + char.charCodeAt(0)
    );
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
}

// 시간대별 패턴 (막대 그래프)
function getHourlyPattern(logs: VisitorLog[]): string {
  const slots: number[] = [0, 0, 0, 0, 0, 0]; // 30분 단위 6개
  const now = Date.now();

  logs.forEach(log => {
    const logTime = new Date(log.created_at).getTime();
    const minutesAgo = (now - logTime) / (1000 * 60);
    const slotIndex = Math.min(5, Math.floor(minutesAgo / 30));
    slots[5 - slotIndex]++; // 최신이 오른쪽
  });

  const max = Math.max(...slots, 1);
  const bars = slots.map(count => {
    const height = Math.round((count / max) * 4);
    return ['▁', '▂', '▃', '▄', '█'][height] || '▁';
  });

  return bars.join('') + ` (${Math.min(...slots)}~${Math.max(...slots)}명/30분)`;
}
