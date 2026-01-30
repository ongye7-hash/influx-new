// ============================================
// Design Preview v4.3
// 추가 반영:
// - CTA 버튼 pulse 애니메이션 (3초 주기 breathing)
// - 운영 기준 카드 hover: translateY(-4px) + border 강조
// - 푸터 사업자 정보 보강
// - font-smoothing (antialiased)
// ============================================

'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

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

// ─── System Log Terminal (히어로 우측) ───
function SystemTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);
  const { ref, isVisible } = useInView(0.3);

  const logs = [
    { time: '17:21:03', task: 'Instagram API Health Check', status: 'OK', statusColor: 'text-emerald-400' },
    { time: '17:21:05', task: 'Batch #12,847 → 좋아요 1,000', status: 'PROCESSING', statusColor: 'text-blue-400' },
    { time: '17:21:08', task: 'Rate Limiter: 안전 속도 유지', status: 'ACTIVE', statusColor: 'text-amber-400' },
    { time: '17:21:12', task: 'YouTube 조회수 5,000 완료', status: 'DONE', statusColor: 'text-emerald-400' },
    { time: '17:21:15', task: 'Auto-Refill Triggered #9,201', status: 'QUEUED', statusColor: 'text-[#71717a]' },
    { time: '17:21:18', task: 'TikTok 팔로워 분산 처리 시작', status: 'RUNNING', statusColor: 'text-blue-400' },
    { time: '17:21:22', task: 'Account Safety Score: 99.1', status: 'OK', statusColor: 'text-emerald-400' },
  ];

  useEffect(() => {
    if (!isVisible) return;
    const timer = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= logs.length) {
          // 다 보여줬으면 리셋하고 다시 시작
          return 0;
        }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(timer);
  }, [isVisible, logs.length]);

  return (
    <div ref={ref} className="bg-[#0c0c0e] border border-white/[0.08] rounded-xl overflow-hidden w-[420px]">
      {/* 터미널 탑바 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/60" />
        <span className="ml-2 text-[11px] font-mono text-[#71717a]">influx-system-monitor</span>
      </div>

      {/* 로그 라인 */}
      <div className="p-4 font-mono text-[11px] leading-[1.9] h-[220px] overflow-hidden"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 85%, transparent)' }}>
        {logs.slice(0, visibleLines).map((log, i) => (
          <div key={`${i}-${visibleLines}`}
            className="flex gap-2"
            style={{
              opacity: 1,
              animation: 'fadeInLine 0.3s ease',
            }}>
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

      {/* 하단 상태바 */}
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

// ─── Platform colors ───
const platforms = {
  instagram: { name: 'Instagram', color: '#E4405F' },
  youtube: { name: 'YouTube', color: '#FF0000' },
  tiktok: { name: 'TikTok', color: '#00F2EA' },
  facebook: { name: 'Facebook', color: '#1877F2' },
  telegram: { name: 'Telegram', color: '#26A5E4' },
  x: { name: 'X (Twitter)', color: '#fafafa' },
};

// ─── Landing Section ───
function LandingPreview() {
  return (
    <section className="text-[#fafafa] overflow-hidden relative antialiased">
      {/* Nav */}
      <nav className="sticky top-[41px] z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-[1120px] mx-auto flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <svg width="27" height="28" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <rect x="0" y="14" width="8" height="14" rx="1" fill="#4A5568" />
                <rect x="9.5" y="8" width="8" height="20" rx="1" fill="#64748B" />
                <rect x="19" y="0" width="8" height="28" rx="1" fill="#0EA5E9" />
              </svg>
              <span className="text-[15px] font-black text-white tracking-tight">INFLUX</span>
            </div>
            <div className="hidden md:flex items-center gap-5">
              {['서비스', '처리 방식', '가격'].map(t => (
                <span key={t} className="text-[13px] text-[#a1a1aa] hover:text-[#fafafa] cursor-pointer transition-colors">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#a1a1aa] hover:text-[#fafafa] cursor-pointer transition-colors">로그인</span>
            <button className="h-8 px-4 bg-[#0064FF] text-white text-[13px] font-semibold rounded-md hover:bg-[#0052d4] transition-colors">
              지금 시작하기
            </button>
          </div>
        </div>
      </nav>

      {/* ───────────── Hero ───────────── */}
      <div className="bg-[#09090b]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="relative pt-20 sm:pt-32 pb-20 sm:pb-28">
            {/* Subtle glow */}
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
                    <button className="h-11 px-6 bg-[#0064FF] text-white text-[14px] font-semibold rounded-lg hover:bg-[#0052d4] transition-all cta-pulse">
                      지금 무료 크레딧 받기
                    </button>
                    <button className="h-11 px-6 text-[14px] font-medium text-[#a1a1aa] hover:text-[#fafafa] border border-white/[0.08] rounded-lg hover:border-white/[0.15] transition-colors">
                      처리 방식 보기
                    </button>
                  </div>
                  <p className="mt-3 text-[12px] text-[#71717a]">인스타 좋아요 1,000개 무료 쿠폰 증정 · 가입 시 결제 정보 불필요</p>
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
      </div>

      {/* ─── Section Divider ─── */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)' }} />

      {/* ───────────── 왜 INFLUX인가 ───────────── */}
      <div className="bg-[#0f0f11]">
        <div className="max-w-[1120px] mx-auto px-6 py-20 sm:py-28">
          <FadeIn>
            <h2 className="text-[24px] sm:text-[28px] font-bold mb-3" style={{ letterSpacing: '-0.03em' }}>
              왜 INFLUX인가
            </h2>
            <p className="text-[14px] text-[#a1a1aa] mb-10" style={{ letterSpacing: '-0.01em' }}>
              우리의 기준은 최저가가 아닌, 계정의 생존입니다
            </p>
          </FadeIn>

          {/* 비대칭 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Hero metric — 크게 */}
            <FadeIn>
              <div className="md:row-span-2 p-8 bg-[#111113] border border-white/[0.06] rounded-xl flex flex-col justify-between min-h-[240px] hover:border-[#0064FF]/20 transition-colors">
                <div>
                  <div className="text-[11px] text-[#71717a] uppercase tracking-wider font-medium font-mono">최근 30일 기준</div>
                  <div className="text-[48px] font-extrabold text-white mt-2 font-mono" style={{ letterSpacing: '-0.04em' }}>
                    <Counter target={98} suffix="%" />
                  </div>
                  <div className="text-[14px] text-[#71717a] mt-1">자동 처리 완료율</div>
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
                  <Counter target={12400} suffix="+" />
                </div>
                <div className="text-[13px] text-[#a1a1aa] mt-1">활성 사용자</div>
                <p className="text-[12px] text-[#71717a] mt-3">크리에이터, 마케터, 에이전시가 사용 중.</p>
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
      </div>

      {/* ─── Section Divider ─── */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)' }} />

      {/* ───────────── 운영 기준 ───────────── */}
      <div className="bg-[#09090b]">
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
                  {/* 배경 넘버링 */}
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
      </div>

      {/* ─── Section Divider ─── */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)' }} />

      {/* ───────────── 3단계로 끝 ───────────── */}
      <div className="bg-[#0f0f11]">
        <div className="max-w-[1120px] mx-auto px-6 py-20 sm:py-28">
          <FadeIn>
            <h2 className="text-[24px] sm:text-[28px] font-bold" style={{ letterSpacing: '-0.03em' }}>3단계로 끝</h2>
            <p className="text-[14px] text-[#a1a1aa] mt-1 mb-10">복잡한 절차 없이, 바로 시작</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { step: '01', title: '가입', desc: '간편가입 / 구글로 3초 시작', detail: '가입 즉시 무료 쿠폰 증정' },
              { step: '02', title: '충전', desc: '실시간 계좌이체 (세금계산서 가능) 또는 USDT', detail: '최소 충전 금액 5,000원' },
              { step: '03', title: '주문', desc: '서비스 선택 → 링크 입력 → 수량 설정 → 완료', detail: 'API 자동 처리, 평균 30분 내 시작' },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.1}>
                <div className="p-6 sm:p-8 bg-[#111113] border border-white/[0.06] rounded-xl h-full hover:border-[#0064FF]/20 transition-colors">
                  <span className="text-[12px] font-mono font-bold text-[#0064FF]">{item.step}</span>
                  <h3 className="text-[18px] font-bold mt-3 mb-2" style={{ letterSpacing: '-0.02em' }}>{item.title}</h3>
                  <p className="text-[14px] leading-[1.7] text-[#71717a]">{item.desc}</p>
                  <p className="text-[12px] text-[#71717a] mt-3">{item.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Section Divider ─── */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)' }} />

      {/* ───────────── 지원 플랫폼 ───────────── */}
      <div className="bg-[#09090b]">
        <div className="max-w-[1120px] mx-auto px-6 py-20 sm:py-28">
          <FadeIn>
            <h2 className="text-[24px] sm:text-[28px] font-bold mb-3" style={{ letterSpacing: '-0.03em' }}>지원 플랫폼</h2>
            <p className="text-[14px] text-[#a1a1aa] mb-8">주요 SNS 전체 지원 · 팔로워, 좋아요, 조회수, 댓글 등</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {Object.values(platforms).map((p) => (
                <div key={p.name} className="group flex items-center gap-3 p-4 bg-[#111113] border border-white/[0.06] rounded-lg hover:border-white/[0.12] transition-all cursor-pointer">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-125" style={{ backgroundColor: p.color }} />
                  <span className="text-[13px] font-medium text-[#a1a1aa]">{p.name}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ─── Section Divider ─── */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)' }} />

      {/* ───────────── 가격 ───────────── */}
      <div className="bg-[#0f0f11]">
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
                    <span className="text-[13px] font-medium text-[#71717a]">{item.platform}</span>
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
        </div>
      </div>

      {/* ───────────── CTA ───────────── */}
      <div className="bg-[#09090b] border-t border-white/[0.06]">
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
              <button className="mt-8 h-12 px-8 bg-[#0064FF] text-white text-[15px] font-semibold rounded-lg hover:bg-[#0052d4] transition-all cta-pulse">
                무료 크레딧 받고 시작
              </button>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#09090b] border-t border-white/[0.04]">
        <div className="max-w-[1120px] mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <svg width="20" height="21" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <rect x="0" y="14" width="8" height="14" rx="1" fill="#4A5568" />
                <rect x="9.5" y="8" width="8" height="20" rx="1" fill="#64748B" />
                <rect x="19" y="0" width="8" height="28" rx="1" fill="#0EA5E9" />
              </svg>
              <span className="text-[13px] font-black text-white tracking-tight">INFLUX</span>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              {['이용약관', '개인정보처리방침'].map(t => (
                <span key={t} className="text-[12px] text-[#71717a] hover:text-[#d4d4d8] cursor-pointer transition-colors">{t}</span>
              ))}
              <span className="text-[12px] text-[#71717a]">support@influx-lab.com</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/[0.04]">
            <p className="text-[11px] text-[#52525b] leading-[1.8]">
              상호명: 인플럭스랩 | 대표: — | 사업자등록번호: —
              <br />
              주소: 서울특별시 — | 통신판매업신고: —
              <br />
              &copy; 2026 INFLUX. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Keyframes */}
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
    </section>
  );
}

// ─── Login Section ───
function LoginPreview() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <section className="min-h-screen bg-[#09090b] flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] bg-[#0f0f12] p-12 border-r border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <svg width="27" height="28" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <rect x="0" y="14" width="8" height="14" rx="1" fill="#4A5568" />
            <rect x="9.5" y="8" width="8" height="20" rx="1" fill="#64748B" />
            <rect x="19" y="0" width="8" height="28" rx="1" fill="#0EA5E9" />
          </svg>
          <span className="text-[16px] font-black text-white tracking-tight">INFLUX</span>
        </div>

        <div>
          <p className="text-[28px] font-bold text-white leading-[1.3]" style={{ letterSpacing: '-0.03em' }}>
            SNS 운영을
            <br />
            시스템으로
          </p>
          <div className="mt-8 space-y-0">
            {[
              { value: '98.2%', label: '최근 30일 처리 완료율' },
              { value: '30분', label: '평균 처리 시작' },
              { value: '24/7', label: '무중단 자동 처리' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-3.5 border-b border-white/[0.06]">
                <span className="text-[13px] text-[#a1a1aa]">{s.label}</span>
                <span className="text-[14px] font-bold text-white font-mono">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-[#52525b]">&copy; 2026 INFLUX</p>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <svg width="27" height="28" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <rect x="0" y="14" width="8" height="14" rx="1" fill="#4A5568" />
              <rect x="9.5" y="8" width="8" height="20" rx="1" fill="#64748B" />
              <rect x="19" y="0" width="8" height="28" rx="1" fill="#0EA5E9" />
            </svg>
            <span className="text-[16px] font-black text-white tracking-tight">INFLUX</span>
          </div>

          {/* Tab */}
          <div className="flex gap-1 p-1 bg-white/[0.03] rounded-lg mb-8">
            {(['login', 'register'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 h-9 text-[13px] font-medium rounded-md transition-all ${
                  activeTab === tab
                    ? 'bg-white/[0.08] text-white'
                    : 'text-[#a1a1aa] hover:text-[#71717a]'
                }`}
              >
                {tab === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {activeTab === 'register' && (
              <div>
                <label className="block text-[13px] font-medium text-[#a1a1aa] mb-1.5">사용자명</label>
                <input
                  type="text"
                  placeholder="username"
                  className="w-full h-11 px-3.5 text-[14px] bg-white/[0.03] border border-white/[0.06] rounded-lg outline-none focus:border-[#0064FF] transition-colors text-white placeholder:text-[#52525b]"
                  readOnly
                />
              </div>
            )}
            <div>
              <label className="block text-[13px] font-medium text-[#a1a1aa] mb-1.5">이메일</label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full h-11 px-3.5 text-[14px] bg-white/[0.03] border border-white/[0.06] rounded-lg outline-none focus:border-[#0064FF] transition-colors text-white placeholder:text-[#52525b]"
                readOnly
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-medium text-[#a1a1aa]">비밀번호</label>
                {activeTab === 'login' && (
                  <span className="text-[12px] text-[#71717a] hover:text-[#d4d4d8] cursor-pointer transition-colors">비밀번호 찾기</span>
                )}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-11 px-3.5 text-[14px] bg-white/[0.03] border border-white/[0.06] rounded-lg outline-none focus:border-[#0064FF] transition-colors text-white placeholder:text-[#52525b]"
                readOnly
              />
            </div>
            <button className="w-full h-11 bg-[#0064FF] text-white text-[14px] font-semibold rounded-lg hover:bg-[#0052d4] transition-colors">
              {activeTab === 'login' ? '로그인' : '가입하기'}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#09090b] px-3 text-[12px] text-[#71717a]">또는</span>
            </div>
          </div>

          <button className="w-full h-11 bg-white/[0.03] border border-white/[0.06] text-[14px] font-medium rounded-lg hover:border-white/[0.12] transition-colors text-white flex items-center justify-center gap-2.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            구글로 3초 시작
          </button>

          {activeTab === 'register' && (
            <p className="mt-4 text-[12px] text-[#71717a] text-center">
              가입 시 2,000원 크레딧이 즉시 지급됩니다
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard Section ───
function DashboardPreview() {
  return (
    <section className="min-h-screen bg-[#09090b]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-[240px] min-h-screen border-r border-white/[0.06] bg-[#0f0f12]">
          <div className="flex items-center gap-2.5 h-14 px-5 border-b border-white/[0.06]">
            <svg width="20" height="21" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <rect x="0" y="14" width="8" height="14" rx="1" fill="#4A5568" />
              <rect x="9.5" y="8" width="8" height="20" rx="1" fill="#64748B" />
              <rect x="19" y="0" width="8" height="28" rx="1" fill="#0EA5E9" />
            </svg>
            <span className="text-[14px] font-black text-white tracking-tight">INFLUX</span>
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            {[
              { name: '대시보드', active: true },
              { name: '새 주문', active: false },
              { name: '주문 내역', active: false },
              { name: '충전하기', active: false },
              { name: '무료 체험', active: false },
            ].map((item) => (
              <div
                key={item.name}
                className={`flex items-center h-9 px-3 rounded-md text-[13px] font-medium transition-colors ${
                  item.active
                    ? 'bg-white/[0.06] text-white'
                    : 'text-[#a1a1aa] hover:text-[#71717a] hover:bg-white/[0.03]'
                }`}
              >
                {item.name}
              </div>
            ))}

            <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-0.5">
              {['고객센터', '설정'].map((name) => (
                <div key={name} className="flex items-center h-9 px-3 rounded-md text-[13px] font-medium text-[#71717a] hover:text-[#d4d4d8] hover:bg-white/[0.03] transition-colors">
                  {name}
                </div>
              ))}
            </div>
          </nav>

          {/* Balance */}
          <div className="p-3">
            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <div className="text-[11px] text-[#71717a] font-medium uppercase tracking-wider">잔액</div>
              <div className="text-[22px] font-extrabold text-white mt-1 font-mono" style={{ letterSpacing: '-0.03em' }}>₩128,500</div>
              <button className="w-full h-8 mt-4 bg-[#0064FF] text-white text-[12px] font-semibold rounded-md hover:bg-[#0052d4] transition-colors">
                충전하기
              </button>
            </div>
          </div>

          {/* User */}
          <div className="p-3 pt-0">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[11px] font-bold text-[#a1a1aa]">
                U
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-white truncate">user@example.com</div>
                <div className="text-[11px] text-[#71717a]">일반 회원</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-h-screen">
          <header className="h-14 border-b border-white/[0.06] bg-[#0f0f12] flex items-center justify-between px-6">
            <h1 className="text-[14px] font-semibold text-white">대시보드</h1>
            <button className="h-8 px-4 bg-[#0064FF] text-white text-[13px] font-semibold rounded-md hover:bg-[#0052d4] transition-colors">
              새 주문
            </button>
          </header>

          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-[18px] font-bold text-white" style={{ letterSpacing: '-0.02em' }}>안녕하세요, user님</h2>
              <p className="text-[13px] text-[#71717a] mt-0.5">오늘의 현황입니다</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                { label: '이번 달 주문', value: '24건', sub: '지난 달 대비 +12%', highlight: true },
                { label: '총 지출', value: '₩485,000', sub: '' },
                { label: '진행중', value: '3건', sub: '' },
                { label: '처리 완료율', value: '98.2%', sub: '최근 30일 기준' },
              ].map((stat) => (
                <div key={stat.label} className={`p-4 border rounded-xl transition-colors ${
                  stat.highlight
                    ? 'bg-[#0064FF]/[0.04] border-[#0064FF]/20'
                    : 'bg-[#111113] border-white/[0.06] hover:border-white/[0.1]'
                }`}>
                  <div className="text-[12px] text-[#71717a] font-medium">{stat.label}</div>
                  <div className="text-[24px] font-extrabold text-white mt-1 font-mono" style={{ letterSpacing: '-0.03em' }}>{stat.value}</div>
                  {stat.sub && (
                    <div className="text-[12px] font-medium mt-1 text-[#a1a1aa]">{stat.sub}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Table + Side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2 bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <h3 className="text-[14px] font-semibold text-white">최근 주문</h3>
                  <span className="text-[12px] text-[#71717a] hover:text-[#d4d4d8] cursor-pointer transition-colors">전체 보기 →</span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      {['주문번호', '서비스', '수량', '상태', '금액'].map((h) => (
                        <th key={h} className="text-left text-[11px] font-medium text-[#71717a] uppercase tracking-wider px-5 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: '#24891', service: 'Instagram 좋아요', platform: '#E4405F', qty: '1,000', status: '완료', sc: 'emerald', amount: '₩1,200' },
                      { id: '#24890', service: 'YouTube 조회수', platform: '#FF0000', qty: '5,000', status: '진행중', sc: 'blue', amount: '₩12,500' },
                      { id: '#24889', service: 'TikTok 팔로워', platform: '#00F2EA', qty: '500', status: '완료', sc: 'emerald', amount: '₩8,400' },
                      { id: '#24888', service: 'YouTube 구독자', platform: '#FF0000', qty: '100', status: '대기', sc: 'amber', amount: '₩32,000' },
                    ].map((o) => (
                      <tr key={o.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3 text-[13px] font-mono text-[#71717a]">{o.id}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: o.platform }} />
                            <span className="text-[13px] text-[#a1a1aa]">{o.service}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[13px] font-mono text-[#a1a1aa]">{o.qty}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
                            o.sc === 'emerald' ? 'text-emerald-500' : o.sc === 'blue' ? 'text-blue-400' : 'text-amber-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              o.sc === 'emerald' ? 'bg-emerald-500' : o.sc === 'blue' ? 'bg-blue-400' : 'bg-amber-500'
                            }`} />
                            {o.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[13px] font-medium font-mono text-white">{o.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3">
                <div className="p-5 bg-[#111113] border border-white/[0.06] rounded-xl">
                  <h3 className="text-[13px] font-semibold text-white mb-4">인기 서비스</h3>
                  <div className="space-y-0">
                    {[
                      { name: 'Instagram 좋아요', price: '₩10~', color: '#E4405F' },
                      { name: 'YouTube 조회수', price: '₩0.5~', color: '#FF0000' },
                      { name: 'TikTok 팔로워', price: '₩1.5~', color: '#00F2EA' },
                    ].map((s) => (
                      <div key={s.name} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-[13px] text-[#71717a]">{s.name}</span>
                        </div>
                        <span className="text-[12px] font-semibold font-mono text-white">{s.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-[#111113] border border-white/[0.06] rounded-xl">
                  <div className="text-[11px] text-[#71717a] uppercase tracking-wider">이번 달 지출</div>
                  <div className="text-[20px] font-extrabold text-white mt-1 font-mono" style={{ letterSpacing: '-0.03em' }}>₩485,000</div>
                  <div className="text-[12px] text-[#a1a1aa] mt-0.5">지난 달 대비 +8%</div>
                  {/* Mini bar chart */}
                  <div className="flex items-end gap-1 mt-4 h-12">
                    {[35, 52, 45, 68, 42, 78, 55, 90, 65, 48, 72, 85].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-[#0064FF]/20 rounded-sm hover:bg-[#0064FF]/40 transition-colors"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-[#52525b] font-mono">1월</span>
                    <span className="text-[10px] text-[#52525b] font-mono">12월</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}

// ─── Main Page ───
export default function PreviewPage() {
  return (
    <div className="bg-[#09090b]">
      <div className="bg-[#0064FF] text-white py-2.5 px-6 text-center text-[13px] font-medium tracking-wide sticky top-0 z-[100]">
        DESIGN PREVIEW v4.3 — CTA pulse + 카드 hover lift + 푸터 보강 + antialiased (기능 없음)
        <Link href="/" className="ml-4 underline text-white/60 hover:text-white">현재 사이트로 돌아가기</Link>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-4 bg-[#0064FF] text-white text-[11px] font-mono px-3 py-1 rounded-r-md z-50">01 — LANDING</div>
        <LandingPreview />
      </div>

      <div className="relative border-t border-white/[0.06]">
        <div className="absolute left-0 top-4 bg-[#0064FF] text-white text-[11px] font-mono px-3 py-1 rounded-r-md z-50">02 — LOGIN</div>
        <LoginPreview />
      </div>

      <div className="relative border-t border-white/[0.06]">
        <div className="absolute left-0 top-4 bg-[#0064FF] text-white text-[11px] font-mono px-3 py-1 rounded-r-md z-50">03 — DASHBOARD</div>
        <DashboardPreview />
      </div>
    </div>
  );
}
