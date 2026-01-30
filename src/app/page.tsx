// ============================================
// Landing Page v5.0
// v4.3 디자인 + 매출 극대화 기능 합병
// ============================================

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { FaYoutube, FaInstagram, FaTiktok, FaFacebook, FaTelegram, FaTwitter } from 'react-icons/fa';
import { KakaoChatButton } from '@/components/kakao-chat-button';

// ─── Scroll Fade In Hook ───
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Animated Counter ───
function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useInView();

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, target]);

  return <span ref={ref} className="font-mono">{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── IP-based Countdown Timer (12h) ───
function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const STORAGE_KEY = 'influx_timer_start';
    let startTime = localStorage.getItem(STORAGE_KEY);
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem(STORAGE_KEY, startTime);
    }

    const deadline = parseInt(startTime) + 12 * 60 * 60 * 1000; // 12시간

    const tick = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const display = isClient ? `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}` : '--:--:--';
  const isExpired = isClient && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return { display, isExpired, isClient };
}

// ─── System Log Terminal (히어로 우측) + 가짜 주문 로그 주입 ───
function SystemTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [logs, setLogs] = useState<{ time: string; task: string; status: string; statusColor: string }[]>([]);
  const { ref, isVisible } = useInView(0.3);

  useEffect(() => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    // 한국 시간(KST, UTC+9) 기준 — 사용자 로컬 시간 조작 방지
    const kstNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const base = kstNow.getTime();
    const templates = [
      { task: 'Instagram API Health Check', status: 'OK', statusColor: 'text-emerald-400' },
      { task: `Order #${(24000 + Math.floor(Math.random() * 900)).toLocaleString()} → 좋아요 1,000`, status: 'PROCESSING', statusColor: 'text-blue-400' },
      { task: 'Rate Limiter: 안전 속도 유지', status: 'ACTIVE', statusColor: 'text-amber-400' },
      { task: 'YouTube 조회수 5,000 완료', status: 'DONE', statusColor: 'text-emerald-400' },
      { task: `User_${Math.floor(1000 + Math.random() * 9000)} → 구독자 10,000 주문`, status: 'QUEUED', statusColor: 'text-[#71717a]' },
      { task: 'TikTok 팔로워 분산 처리 시작', status: 'RUNNING', statusColor: 'text-blue-400' },
      { task: 'Account Safety Score: 99.1', status: 'OK', statusColor: 'text-emerald-400' },
    ];
    setLogs(templates.map((t, i) => {
      const d = new Date(base - (templates.length - 1 - i) * 3000);
      return { ...t, time: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` };
    }));
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setInterval(() => {
      setVisibleLines(prev => prev >= logs.length ? 0 : prev + 1);
    }, 800);
    return () => clearInterval(timer);
  }, [isVisible, logs.length]);

  return (
    <div ref={ref} className="bg-[#0c0c0e] border border-white/[0.08] rounded-xl overflow-hidden w-[420px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/60" />
        <span className="ml-2 text-[11px] font-mono text-[#71717a]">influx-system-monitor</span>
      </div>
      <div className="p-4 font-mono text-[11px] leading-[1.9] h-[220px] overflow-hidden"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 85%, transparent)' }}>
        {logs.slice(0, visibleLines).map((log, i) => (
          <div key={`${i}-${visibleLines}`} className="flex gap-2" style={{ animation: 'fadeInLine 0.3s ease' }}>
            <span className="text-[#71717a] shrink-0">[{log.time}]</span>
            <span className="text-[#a1a1aa] truncate">{log.task}</span>
            <span className={`${log.statusColor} shrink-0 ml-auto`}>{log.status}</span>
          </div>
        ))}
        {visibleLines > 0 && visibleLines <= logs.length && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[#0064FF]">▍</span>
            <span className="text-[#71717a] animate-pulse">System active...</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-mono text-[#a1a1aa]">ALL SYSTEMS OPERATIONAL</span>
        </div>
        <span className="text-[10px] font-mono text-[#71717a]">uptime 99.8%</span>
      </div>
    </div>
  );
}

// ─── Platform data ───
const platforms = [
  { name: 'Instagram', icon: FaInstagram, color: '#E4405F' },
  { name: 'YouTube', icon: FaYoutube, color: '#FF0000' },
  { name: 'TikTok', icon: FaTiktok, color: '#00F2EA' },
  { name: 'Facebook', icon: FaFacebook, color: '#1877F2' },
  { name: 'Telegram', icon: FaTelegram, color: '#26A5E4' },
  { name: 'X (Twitter)', icon: FaTwitter, color: '#fafafa' },
];

// ─── Success Cases (가짜 리뷰 → 성공 사례 카드) ───
const successCases = [
  { user: '유튜버 김OO님', result: '구독자 0 → 1,000명 달성', detail: '수익창출 조건 충족 · 3일 소요', platform: 'YouTube', color: '#FF0000' },
  { user: '쇼핑몰 A사', result: '틱톡 조회수 50만 돌파', detail: '자연 유입 패턴 · 추천 노출 증가', platform: 'TikTok', color: '#00F2EA' },
  { user: '마케팅 대행사 B', result: '팔로워 10K 달성', detail: '광고 문의 3배 증가', platform: 'Instagram', color: '#E4405F' },
  { user: '크리에이터 박OO님', result: '조회수 100만 달성', detail: '알고리즘 추천 진입 · 2주 소요', platform: 'YouTube', color: '#FF0000' },
  { user: '브랜드 C사', result: '팔로워 5K → 20K', detail: '매출 200% 성장', platform: 'Instagram', color: '#E4405F' },
  { user: '인플루언서 이OO님', result: '좋아요 평균 3배 증가', detail: '노출 알고리즘 가속', platform: 'TikTok', color: '#00F2EA' },
];

// ─── Company Info ───
const companyInfo = {
  name: "루프셀앤미디어",
  ceo: "박주현",
  businessNumber: "420-50-00984",
  salesRegistration: "제2026-서울도봉-0097호",
  address: "서울특별시 도봉구 도봉로 133길 41, 5층",
  email: "support@influx-lab.com",
};

// ─── Section Divider ───
function SectionDivider() {
  return <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)' }} />;
}

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════
export default function LandingPage() {
  const timer = useCountdown();

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] antialiased overflow-x-hidden">

      {/* ─── Sticky Top Banner (닫기 없음) ─── */}
      <div className="sticky top-0 z-[60] bg-[#0064FF] text-white py-2.5 px-4 sm:px-6 text-center text-[13px] font-medium">
        <span className="mr-1">⚡</span>
        신규 가입 즉시 <span className="font-bold">2,000원 크레딧 지급</span>
        <span className="mx-2 text-white/40">|</span>
        <Link href="/login" className="underline underline-offset-2 hover:text-white/80 transition-colors">
          지금 받기 →
        </Link>
      </div>

      {/* ─── Nav ─── */}
      <nav className="sticky top-[41px] z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-[1120px] mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <svg width="27" height="28" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <rect x="0" y="14" width="8" height="14" rx="1" fill="#4A5568" />
                <rect x="9.5" y="8" width="8" height="20" rx="1" fill="#64748B" />
                <rect x="19" y="0" width="8" height="28" rx="1" fill="#0EA5E9" />
              </svg>
              <span className="text-[15px] font-black text-white tracking-tight">INFLUX</span>
            </Link>
            <div className="hidden md:flex items-center gap-5">
              {[
                { label: '서비스', href: '#services' },
                { label: '처리 방식', href: '#how' },
                { label: '가격', href: '#pricing' },
              ].map(t => (
                <a key={t.label} href={t.href} className="text-[13px] text-[#a1a1aa] hover:text-[#fafafa] cursor-pointer transition-colors">{t.label}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] text-[#a1a1aa] hover:text-[#fafafa] transition-colors">로그인</Link>
            <Link href="/login" className="h-10 sm:h-8 px-4 bg-[#0064FF] text-white text-[13px] font-semibold rounded-md hover:bg-[#0052d4] transition-colors inline-flex items-center">
              지금 시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════ Hero ═══════════ */}
      <section className="bg-[#09090b]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="relative pt-20 sm:pt-32 pb-20 sm:pb-28">
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#0064FF]/[0.03] rounded-full blur-[120px] pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left - Copy */}
              <div>
                <FadeIn>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[12px] text-[#a1a1aa] mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    국내 운영 · 한국어 CS · 원화 결제
                  </div>
                </FadeIn>

                <FadeIn delay={0.1}>
                  <h1 className="text-[clamp(32px,5vw,52px)] font-extrabold leading-[1.1]" style={{ letterSpacing: '-0.035em' }}>
                    SNS 운영을
                    <br />
                    <span className="text-[#0064FF]">시스템</span>으로 관리하세요
                  </h1>
                </FadeIn>

                <FadeIn delay={0.2}>
                  <p className="mt-5 text-[16px] leading-[1.8] text-[#a1a1aa] max-w-[480px]" style={{ letterSpacing: '-0.01em' }}>
                    플랫폼 알고리즘을 이해합니다.
                    <br />
                    인위적인 숫자가 아닌, 시스템이 설계한 자연스러운 성장.
                  </p>
                </FadeIn>

                <FadeIn delay={0.3}>
                  <div className="flex items-center gap-3 mt-8">
                    <Link href="/login" className="h-11 px-6 bg-[#0064FF] text-white text-[14px] font-semibold rounded-lg hover:bg-[#0052d4] transition-all inline-flex items-center cta-pulse">
                      지금 무료 크레딧 받기
                    </Link>
                    <a href="#how" className="h-11 px-6 text-[14px] font-medium text-[#a1a1aa] hover:text-[#fafafa] border border-white/[0.08] rounded-lg hover:border-white/[0.15] transition-colors inline-flex items-center">
                      내 계정 진단받기
                    </a>
                  </div>
                  <p className="mt-3 text-[12px] text-[#a1a1aa]">인스타 좋아요 1,000개 무료 쿠폰 증정 · 가입 시 결제 정보 불필요</p>

                  {/* IP Timer */}
                  {!timer.isExpired && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0064FF]/20 bg-[#0064FF]/[0.05] text-[12px]">
                      <span className="text-[#a1a1aa]">🔥 신규 혜택 종료까지</span>
                      <span className="font-mono font-bold text-[#0064FF]">{timer.display}</span>
                    </div>
                  )}
                </FadeIn>
              </div>

              {/* Right - System Terminal */}
              <FadeIn delay={0.3}>
                <div className="hidden lg:flex justify-end">
                  <SystemTerminal />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════ 왜 INFLUX인가 ═══════════ */}
      <section className="bg-[#0f0f11]">
        <div className="max-w-[1120px] mx-auto px-6 py-20 sm:py-28">
          <FadeIn>
            <h2 className="text-[24px] sm:text-[28px] font-bold mb-3" style={{ letterSpacing: '-0.03em' }}>
              왜 INFLUX인가
            </h2>
            <p className="text-[14px] text-[#a1a1aa] mb-10" style={{ letterSpacing: '-0.01em' }}>
              우리의 기준은 최저가가 아닌, 계정의 생존입니다
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <FadeIn>
              <div className="md:row-span-2 p-8 bg-[#111113] border border-white/[0.06] rounded-xl flex flex-col justify-between min-h-[240px] hover:border-[#0064FF]/20 transition-colors">
                <div>
                  <div className="text-[11px] text-[#71717a] uppercase tracking-wider font-medium font-mono">최근 30일 기준</div>
                  <div className="text-[48px] font-extrabold text-white mt-2 font-mono" style={{ letterSpacing: '-0.04em' }}>
                    <Counter target={98} suffix="%" />
                  </div>
                  <div className="text-[14px] text-[#a1a1aa] mt-1">자동 처리 완료율</div>
                </div>
                <p className="text-[13px] text-[#71717a] leading-[1.6] mt-6">
                  API 자동화 기반. 잔여 수량은 별도 요청 없이 자동 환불됩니다.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="p-6 bg-[#111113] border border-white/[0.06] rounded-xl hover:border-[#0064FF]/20 transition-colors">
                <div className="text-[28px] font-extrabold text-white font-mono" style={{ letterSpacing: '-0.03em' }}>
                  <Counter target={30} suffix="분" />
                </div>
                <div className="text-[13px] text-[#a1a1aa] mt-1">평균 처리 시작 시간</div>
                <p className="text-[12px] text-[#71717a] mt-3">새벽 주문도 즉시 처리. 24시간 무중단.</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="p-6 bg-[#111113] border border-white/[0.06] rounded-xl hover:border-[#0064FF]/20 transition-colors">
                <div className="text-[28px] font-extrabold text-white font-mono" style={{ letterSpacing: '-0.03em' }}>
                  <Counter target={840000} suffix="+" />
                </div>
                <div className="text-[13px] text-[#a1a1aa] mt-1">누적 처리 주문</div>
                <p className="text-[12px] text-[#71717a] mt-3">크리에이터, 마케터, 에이전시가 이용 중.</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="p-6 bg-[#111113] border border-white/[0.06] rounded-xl hover:border-[#0064FF]/20 transition-colors">
                <div className="text-[28px] font-extrabold text-[#0064FF]" style={{ letterSpacing: '-0.03em' }}>자동 환불</div>
                <div className="text-[13px] text-[#a1a1aa] mt-1">잔여 수량 100% 환불</div>
                <p className="text-[12px] text-[#71717a] mt-3">별도 문의 없이 잔액으로 자동 복구.</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.25}>
              <div className="p-6 bg-[#111113] border border-white/[0.06] rounded-xl hover:border-[#0064FF]/20 transition-colors">
                <div className="text-[28px] font-extrabold text-white" style={{ letterSpacing: '-0.03em' }}>계정 보호</div>
                <div className="text-[13px] text-[#a1a1aa] mt-1">플랫폼 정책 준수 설계</div>
                <p className="text-[12px] text-[#71717a] mt-3">속도 제한 · 자연 유입 패턴 · 분산 처리.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════ 운영 기준 ═══════════ */}
      <section id="how" className="bg-[#09090b]">
        <div className="max-w-[1120px] mx-auto px-6 py-20 sm:py-28">
          <FadeIn>
            <h2 className="text-[24px] sm:text-[28px] font-bold mb-3" style={{ letterSpacing: '-0.03em' }}>
              운영 기준
            </h2>
            <p className="text-[14px] text-[#a1a1aa] mb-10" style={{ letterSpacing: '-0.01em' }}>
              자동화이지만, 사람이 설계한 기준으로 동작합니다
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { num: '01', title: '속도 제한', desc: '플랫폼별 안전 속도 이내로만 처리합니다.\n급격한 증가를 방지합니다.' },
              { num: '02', title: 'A/S (이탈 복구)', desc: '30일 이내 감소분 자동 복구.\n서비스별 기준이 명시되어 있습니다.' },
              { num: '03', title: '중단 조건', desc: '계정 비공개 전환, 링크 오류 시 자동 중단.\n잔여분은 환불됩니다.' },
              { num: '04', title: '한국어 CS', desc: '평일 10:00–22:00 실시간 응답.\n평균 응답 시간 15분 이내.' },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <div className="group/card relative p-6 bg-[#111113] border border-white/[0.06] rounded-xl h-full overflow-hidden hover:border-[#0064FF]/30 hover:-translate-y-1 transition-all duration-300">
                  <span className="absolute top-3 right-4 text-[64px] font-black font-mono text-white/[0.02] leading-none select-none pointer-events-none transition-opacity group-hover/card:text-white/[0.04]">{item.num}</span>
                  <div className="relative">
                    <span className="text-[11px] font-mono font-bold text-[#0064FF] tracking-wider">{item.num}</span>
                    <h3 className="text-[15px] font-bold text-white mt-2 mb-2" style={{ letterSpacing: '-0.02em' }}>{item.title}</h3>
                    <p className="text-[13px] leading-[1.7] text-[#a1a1aa] whitespace-pre-line">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <p className="text-[12px] text-[#71717a] mt-6 text-center font-mono">
              규정 위반 시 잔여 수량 100% 자동 환불 적용 중
            </p>
          </FadeIn>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════ 성공 사례 (가짜 리뷰 → 카드형) ═══════════ */}
      <section className="bg-[#0f0f11]">
        <div className="max-w-[1120px] mx-auto px-6 py-20 sm:py-28">
          <FadeIn>
            <h2 className="text-[24px] sm:text-[28px] font-bold mb-3" style={{ letterSpacing: '-0.03em' }}>
              최근 성공 케이스
            </h2>
            <p className="text-[14px] text-[#a1a1aa] mb-10">시스템을 통해 달성한 실제 결과</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {successCases.map((c, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="p-5 bg-[#111113] border border-white/[0.06] rounded-xl hover:border-[#0064FF]/20 transition-colors">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-[12px] text-[#a1a1aa]">{c.platform}</span>
                    <span className="ml-auto text-[11px] font-mono text-[#71717a]">{c.user}</span>
                  </div>
                  <div className="text-[15px] font-bold text-white mb-1" style={{ letterSpacing: '-0.02em' }}>{c.result}</div>
                  <p className="text-[12px] text-[#71717a]">{c.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════ 3단계로 끝 ═══════════ */}
      <section className="bg-[#09090b]">
        <div className="max-w-[1120px] mx-auto px-6 py-20 sm:py-28">
          <FadeIn>
            <h2 className="text-[24px] sm:text-[28px] font-bold" style={{ letterSpacing: '-0.03em' }}>3단계로 끝</h2>
            <p className="text-[14px] text-[#a1a1aa] mt-1 mb-10">복잡한 절차 없이, 바로 시작</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { step: '01', title: '가입', desc: '간편가입 / 구글로 3초 시작', detail: '가입 즉시 무료 쿠폰 증정' },
              { step: '02', title: '충전', desc: '실시간 계좌이체 (세금계산서 가능) 또는 USDT', detail: '최소 충전 금액 5,000원' },
              { step: '03', title: '주문', desc: '서비스 선택 → 링크 입력 → 수량 설정 → 완료', detail: 'API 자동 처리, 평균 30분 내 시작' },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.1}>
                <div className="p-6 sm:p-8 bg-[#111113] border border-white/[0.06] rounded-xl h-full hover:border-[#0064FF]/20 transition-colors">
                  <span className="text-[12px] font-mono font-bold text-[#0064FF]">{item.step}</span>
                  <h3 className="text-[18px] font-bold mt-3 mb-2" style={{ letterSpacing: '-0.02em' }}>{item.title}</h3>
                  <p className="text-[14px] leading-[1.7] text-[#a1a1aa]">{item.desc}</p>
                  <p className="text-[12px] text-[#71717a] mt-3">{item.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════ 지원 플랫폼 ═══════════ */}
      <section id="services" className="bg-[#0f0f11]">
        <div className="max-w-[1120px] mx-auto px-6 py-20 sm:py-28">
          <FadeIn>
            <h2 className="text-[24px] sm:text-[28px] font-bold mb-3" style={{ letterSpacing: '-0.03em' }}>지원 플랫폼</h2>
            <p className="text-[14px] text-[#a1a1aa] mb-8">주요 SNS 전체 지원 · 팔로워, 좋아요, 조회수, 댓글 등</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {platforms.map((p) => (
                <Link key={p.name} href={`/services/${p.name.toLowerCase().replace(/\s*\(.*\)/, '')}`}
                  className="group flex items-center gap-3 p-4 bg-[#111113] border border-white/[0.06] rounded-lg hover:border-white/[0.12] transition-all cursor-pointer">
                  <p.icon className="w-4 h-4 text-[#a1a1aa] group-hover:scale-110 transition-transform" style={{ color: undefined }} />
                  <span className="text-[13px] font-medium text-[#a1a1aa]">{p.name}</span>
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════ 가격 ═══════════ */}
      <section id="pricing" className="bg-[#09090b]">
        <div className="max-w-[1120px] mx-auto px-6 py-20 sm:py-28">
          <FadeIn>
            <h2 className="text-[24px] sm:text-[28px] font-bold" style={{ letterSpacing: '-0.03em' }}>가격</h2>
            <p className="text-[14px] text-[#a1a1aa] mt-1 mb-10">VAT 포함 · 합리적인 단가 · 서비스별 리필 기준 명시</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { platform: 'Instagram', service: '좋아요', amount: '100개', price: '100', color: '#E4405F', desc: '즉시 시작 · 고품질', highlight: true },
              { platform: 'YouTube', service: '조회수', amount: '1,000회', price: '500', color: '#FF0000', desc: '리텐션 보장 · 리필 지원' },
              { platform: 'TikTok', service: '팔로워', amount: '100명', price: '150', color: '#00F2EA', desc: '실계정 · 자연 유입 패턴' },
              { platform: 'YouTube', service: '구독자', amount: '100명', price: '3,000', color: '#FF0000', desc: '30일 감소 보상' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className={`group p-5 border rounded-xl transition-all cursor-pointer ${
                  item.highlight
                    ? 'bg-[#0064FF]/[0.04] border-[#0064FF]/20 hover:border-[#0064FF]/40'
                    : 'bg-[#111113] border-white/[0.06] hover:border-[#0064FF]/20'
                }`}>
                  {item.highlight && (
                    <div className="text-[10px] font-bold text-[#0064FF] uppercase tracking-wider mb-3 font-mono">BEST</div>
                  )}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }} />
                    <span className="text-[13px] font-medium text-[#a1a1aa]">{item.platform}</span>
                  </div>
                  <div className="text-[14px] text-[#a1a1aa]">{item.service} {item.amount}</div>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className="text-[32px] font-extrabold font-mono" style={{ letterSpacing: '-0.04em' }}>{item.price}</span>
                    <span className="text-[14px] text-[#a1a1aa] font-medium">원</span>
                  </div>
                  <div className="text-[12px] text-[#71717a] mt-3">{item.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <div className="text-center mt-8">
              <Link href="/order" className="inline-flex items-center h-10 px-6 text-[13px] text-[#0064FF] font-semibold border border-[#0064FF]/30 rounded-lg hover:bg-[#0064FF]/10 transition-colors">
                전체 단가표 확인하기
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════ CTA ═══════════ */}
      <section className="bg-[#0f0f11] border-t border-white/[0.06]">
        <div className="max-w-[1120px] mx-auto px-6 py-20 sm:py-28">
          <FadeIn>
            <div className="max-w-[480px]">
              <h2 className="text-[28px] sm:text-[36px] font-extrabold leading-[1.1]" style={{ letterSpacing: '-0.035em' }}>
                내 계정에 안전한지
                <br />
                먼저 확인해보세요
              </h2>
              <p className="mt-4 text-[15px] text-[#a1a1aa] leading-[1.7]">
                가입 30초 · 결제 정보 불필요 · 인스타 좋아요 1,000개 무료 쿠폰
              </p>
              <Link href="/login" className="mt-8 h-12 px-8 bg-[#0064FF] text-white text-[15px] font-semibold rounded-lg hover:bg-[#0052d4] transition-all inline-flex items-center cta-pulse">
                무료 크레딧 받고 시작
              </Link>

              {/* Timer repeat */}
              {!timer.isExpired && (
                <div className="mt-4">
                  <span className="text-[12px] text-[#71717a] font-mono">
                    🔥 신규 30% 추가 충전 혜택 종료까지 <span className="text-[#0064FF] font-bold">{timer.display}</span>
                  </span>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════ Footer ═══════════ */}
      <footer className="bg-[#09090b] border-t border-white/[0.04]">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <svg width="20" height="21" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <rect x="0" y="14" width="8" height="14" rx="1" fill="#4A5568" />
                <rect x="9.5" y="8" width="8" height="20" rx="1" fill="#64748B" />
                <rect x="19" y="0" width="8" height="28" rx="1" fill="#0EA5E9" />
              </svg>
              <span className="text-[13px] font-black text-white tracking-tight">INFLUX</span>
            </Link>
            <div className="flex flex-wrap items-center gap-5">
              {[
                { label: '이용약관', href: '/terms' },
                { label: '개인정보처리방침', href: '/privacy' },
                { label: '인사이트', href: '/blog' },
              ].map(t => (
                <Link key={t.label} href={t.href} className="text-[12px] text-[#71717a] hover:text-[#d4d4d8] transition-colors">{t.label}</Link>
              ))}
              <span className="text-[12px] text-[#71717a]">{companyInfo.email}</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/[0.04]">
            <p className="text-[11px] text-[#52525b] leading-[1.8]">
              상호: {companyInfo.name} | 대표: {companyInfo.ceo} | 사업자등록번호: {companyInfo.businessNumber}
              <br />
              통신판매업신고: {companyInfo.salesRegistration} | 주소: {companyInfo.address}
              <br />
              이메일: {companyInfo.email} | 운영시간: 평일 10:00 - 22:00 (주말/공휴일 탄력 운영)
              <br />
              &copy; 2026 {companyInfo.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ─── Floating: Kakao Chat ─── */}
      <KakaoChatButton />

      {/* ─── Keyframes ─── */}
      <style jsx>{`
        @keyframes fadeInLine {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ctaPulse {
          0% { box-shadow: 0 0 10px rgba(0, 100, 255, 0.2), 0 0 40px rgba(0, 100, 255, 0.05); }
          50% { box-shadow: 0 0 25px rgba(0, 100, 255, 0.5), 0 0 60px rgba(0, 100, 255, 0.15); }
          100% { box-shadow: 0 0 10px rgba(0, 100, 255, 0.2), 0 0 40px rgba(0, 100, 255, 0.05); }
        }
        .cta-pulse {
          animation: ctaPulse 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
