// ============================================
// Landing Page
// 구매 전환율 극대화 버전 v2.0
// ============================================

'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Zap,
  TrendingUp,
  Headphones,
  Check,
  Award,
  Play,
  Users,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================
// Platform Icons (SVG Components)
// ============================================
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

// ============================================
// Logo Component (Lucide + Text)
// ============================================
function Logo({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
  };
  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg width={s.icon} height={s.icon} viewBox="0 0 100 100" fill="none" className="drop-shadow-lg">
        <path d="M35 85V35H50V85H35Z" fill="url(#logoGrad)" />
        <path d="M25 35H60V50H25V35Z" fill="url(#logoGrad)" />
        <path d="M42 15L75 48L64 59L31 26L42 15Z" fill="url(#logoGrad)" />
        <path d="M60 20H80V35H65V50H50V35H60V20Z" fill="url(#logoGrad)" />
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
      </svg>
      <span className={cn(s.text, 'font-black tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent')}>
        INFLUX
      </span>
    </div>
  );
}

// ============================================
// Animated Counter Hook
// ============================================
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animateCount = () => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(end * easeOutQuart));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };

    if (!startOnView) {
      animateCount();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          animateCount();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasStarted, startOnView]);

  return { count, ref };
}

// ============================================
// Deep Navy Gradient Background
// ============================================
function GradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep Navy Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950" />

      {/* Aurora Blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] aurora-blob-1" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] aurora-blob-2" />
      <div className="absolute bottom-0 left-1/3 w-[700px] h-[400px] aurora-blob-3" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

// ============================================
// Hero Section
// ============================================
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <GradientBackground />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center break-keep">
          {/* 실시간 배지 */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm font-medium mb-10 animate-fade-in-up">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-white/80">지금 <span className="text-green-400 font-bold">2,431명</span>이 채널을 성장시키고 있습니다</span>
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.15] text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              유튜브 수익 창출,
            </span>
            <span className="block mt-2">이제 더 이상 꿈이 아닙니다</span>
          </h1>

          {/* 서브 헤드라인 */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            알고리즘이 좋아하는 <span className="text-white font-semibold">고밀도 트래픽</span>으로
            당신의 채널을 안전하고 빠르게 성장시키세요
          </p>

          {/* CTA 버튼 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="bg-white text-slate-900 hover:bg-white/90 text-lg px-10 h-16 rounded-full font-bold shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_80px_-15px_rgba(255,255,255,0.5)]"
            >
              <Link href="/login">
                무료로 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="border border-white/20 bg-white/5 text-white hover:bg-white/10 text-lg px-10 h-16 rounded-full backdrop-blur-sm font-semibold transition-all duration-300 hover:scale-105 hover:border-white/40"
            >
              <Link href="/order">
                <Play className="mr-2 h-5 w-5" />
                가격표 확인하기
              </Link>
            </Button>
          </div>

          {/* 신뢰 배지 */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-sm text-white/40 mb-6">전 세계 크리에이터가 신뢰하는 플랫폼</p>
            <div className="flex justify-center gap-10 items-center">
              <YoutubeIcon className="w-8 h-8 text-red-500 opacity-60 hover:opacity-100 transition-opacity" />
              <InstagramIcon className="w-8 h-8 text-pink-500 opacity-60 hover:opacity-100 transition-opacity" />
              <TiktokIcon className="w-8 h-8 text-white opacity-60 hover:opacity-100 transition-opacity" />
              <FacebookIcon className="w-8 h-8 text-blue-500 opacity-60 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// Stats Section
// ============================================
interface StatItemProps {
  end: number;
  suffix: string;
  label: string;
  prefix: string;
  decimals?: number;
}

function StatCard({ end, suffix, label, prefix, decimals }: StatItemProps) {
  const { count, ref } = useCountUp(end, 2500);
  const displayValue = decimals
    ? (count / 10).toFixed(decimals)
    : count.toLocaleString();

  return (
    <div ref={ref} className="relative group">
      <Card className="overflow-hidden border-0 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
        <CardContent className="p-6 text-center">
          <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            {prefix}{displayValue}{suffix}
          </div>
          <div className="text-white/60 font-medium break-keep">{label}</div>

          <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (count / end) * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
    </div>
  );
}

function StatsSection() {
  const stats: StatItemProps[] = [
    { end: 1000000, suffix: '+', label: '누적 처리 주문', prefix: '' },
    { end: 50000, suffix: '+', label: '활성 사용자', prefix: '' },
    { end: 999, suffix: '%', label: '성공률', prefix: '', decimals: 1 },
    { end: 24, suffix: '/7', label: '무중단 자동화', prefix: '' },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/50 to-slate-950" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14 break-keep">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-blue-500/30 text-blue-400 bg-blue-500/10">
            <TrendingUp className="w-4 h-4 mr-2" />
            실시간 통계
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            국내 <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">1위</span> SMM 플랫폼의 저력
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-10 text-sm text-white/40">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          지금 이 순간에도 처리 중
        </div>
      </div>
    </section>
  );
}

// ============================================
// Pricing Teaser
// ============================================
function PricingTeaser() {
  const prices = [
    { service: '인스타 좋아요', amount: '100개', price: '10원', icon: InstagramIcon, color: 'from-pink-500 to-rose-500' },
    { service: '유튜브 조회수', amount: '1,000회', price: '500원', icon: YoutubeIcon, color: 'from-red-500 to-orange-500' },
    { service: '틱톡 팔로워', amount: '100명', price: '150원', icon: TiktokIcon, color: 'from-slate-400 to-slate-600' },
    { service: '유튜브 구독자', amount: '100명', price: '3,000원', icon: YoutubeIcon, color: 'from-red-600 to-red-400' },
  ];

  return (
    <section className="py-24 bg-slate-900/50 border-y border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 break-keep">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            업계 최저가, 거품 없는 도매 가격
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            중간 마진 없이 원가 그대로 제공합니다
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {prices.map((item, i) => (
            <div
              key={i}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center text-center group hover:scale-105 hover:bg-white/10 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Gradient Glow */}
              <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br', item.color)} />

              <item.icon className="w-8 h-8 text-white/60 mb-3" />
              <div className="text-sm font-medium text-white/60 mb-2 break-keep">{item.service}</div>
              <div className="text-2xl font-bold text-white mb-1">{item.amount}</div>
              <div className="text-xs text-white/40">단돈</div>
              <div className={cn('text-3xl font-black bg-gradient-to-r bg-clip-text text-transparent', item.color)}>
                {item.price}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full px-8 h-14 font-semibold transition-all duration-300 hover:scale-105"
          >
            <Link href="/order">
              전체 가격표 보기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-xs text-white/30 mt-4">* 가격은 환율 및 서버 상태에 따라 소폭 변동될 수 있습니다</p>
        </div>
      </div>
    </section>
  );
}

// ============================================
// Features Section
// ============================================
function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: '24시간 자동화',
      description: '주문 즉시 처리가 시작됩니다. 잠든 사이에도 쉬지 않는 무중단 자동화 시스템.',
      color: 'from-amber-500 to-orange-500',
      benefits: ['주문 후 5분 내 시작', 'API 연동 지원', '실시간 진행 상황 확인'],
    },
    {
      icon: Shield,
      title: '100% 안전 보장',
      description: '플랫폼 정책을 준수하는 안전한 방식. 계정 보호가 최우선입니다.',
      color: 'from-emerald-500 to-teal-500',
      benefits: ['자연스러운 유입 패턴', '계정 제재 無', '비밀번호 불필요'],
    },
    {
      icon: Headphones,
      title: '완벽 A/S',
      description: '문제 발생 시 전액 환불 또는 100% 재처리. 고객 만족이 우리의 기준입니다.',
      color: 'from-blue-500 to-indigo-500',
      benefits: ['30일 무료 리필', '전액 환불 보장', '카카오톡 1:1 상담'],
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-blue-950/30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 break-keep">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-purple-500/30 text-purple-400 bg-purple-500/10">
            <Award className="w-4 h-4 mr-2" />
            왜 INFLUX인가요?
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            성공하는 크리에이터의 <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">비밀 무기</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            10년 이상의 노하우로 최고의 품질과 서비스를 약속드립니다
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden border-0 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-500"
            >
              <div className={cn('h-1 bg-gradient-to-r', feature.color)} />

              <CardContent className="p-8">
                <div className={cn(
                  'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3',
                  feature.color
                )}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 break-keep">{feature.title}</h3>
                <p className="text-white/60 mb-6 leading-relaxed break-keep">{feature.description}</p>

                <ul className="space-y-3">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <div className={cn('w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0', feature.color)}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white/80 break-keep">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <div className={cn(
                'absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br',
                feature.color
              )} />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CTA Section
// ============================================
function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-purple-950 to-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center break-keep">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm font-medium mb-8">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-white/80">이미 <span className="text-blue-400 font-bold">50,000+</span> 크리에이터가 선택했습니다</span>
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
          경쟁자는 이미 시작했습니다
        </h2>
        <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
          지금 이 순간에도 수천 개의 채널이 성장하고 있습니다. 더 이상 망설이지 마세요.
        </p>

        <div className="flex flex-col items-center gap-6">
          <Button
            size="lg"
            asChild
            className="bg-white text-slate-900 text-xl px-14 h-20 rounded-full font-bold hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-[0_0_80px_-20px_rgba(255,255,255,0.4)]"
          >
            <Link href="/login">
              지금 바로 시작하기
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </Button>
          <p className="text-sm text-white/40 flex items-center gap-4">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-400" /> 가입 30초</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-400" /> 카드 불필요</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-400" /> 즉시 환불</span>
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================
// Footer
// ============================================
function Footer() {
  return (
    <footer className="py-12 bg-slate-950 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="md" />

          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link href="/terms" className="hover:text-white/80 transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-white/80 transition-colors">개인정보처리방침</Link>
            <Link href="/blog" className="hover:text-white/80 transition-colors">인사이트</Link>
            <Link href="/support" className="hover:text-white/80 transition-colors">고객센터</Link>
          </div>

          <div className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} INFLUX. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// Main Landing Page
// ============================================
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-slate-950">
      {/* Global Styles */}
      <style jsx global>{`
        @keyframes aurora-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(30px, -50px) rotate(5deg) scale(1.1); }
          66% { transform: translate(-20px, 20px) rotate(-5deg) scale(0.9); }
        }
        @keyframes aurora-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(-40px, 30px) rotate(-5deg) scale(1.05); }
          66% { transform: translate(50px, -40px) rotate(5deg) scale(0.95); }
        }
        @keyframes aurora-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.1); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .aurora-blob-1 {
          background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.25) 0%, transparent 70%);
          animation: aurora-1 15s ease-in-out infinite;
        }
        .aurora-blob-2 {
          background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
          animation: aurora-2 20s ease-in-out infinite;
        }
        .aurora-blob-3 {
          background: radial-gradient(ellipse at center, rgba(236, 72, 153, 0.15) 0%, transparent 70%);
          animation: aurora-3 18s ease-in-out infinite;
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Logo size="md" />
            </Link>

            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="hidden sm:inline-flex text-white/70 hover:text-white hover:bg-white/10">
                <Link href="/blog">인사이트</Link>
              </Button>
              <Button variant="ghost" asChild className="hidden sm:inline-flex text-white/70 hover:text-white hover:bg-white/10">
                <Link href="/login">로그인</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full transition-all duration-300 hover:scale-105"
              >
                <Link href="/login">
                  시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sections */}
      <HeroSection />
      <StatsSection />
      <PricingTeaser />
      <section id="features">
        <FeaturesSection />
      </section>
      <CTASection />
      <Footer />
    </div>
  );
}
