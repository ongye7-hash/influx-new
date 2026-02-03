// ============================================
// 유튜브 구독자 늘리기 - SEO 랜딩페이지
// 타겟 키워드: 유튜브 구독자, 유튜브 구독자 구매, 유튜브 구독자 늘리기
// ============================================

import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, Users, CheckCircle2, Shield, Zap,
  TrendingUp, Award, Bell, Play, Target
} from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ============================================
// SEO Metadata
// ============================================
export const metadata: Metadata = {
  title: '유튜브 구독자 늘리기 - 실제 구독자로 채널 성장 | INFLUX',
  description: '유튜브 구독자를 안전하게 늘려보세요. 실제 계정 구독자, 수익창출 1000명 달성, 24시간 자동 처리. 유튜브 채널 성장의 첫 걸음.',
  keywords: [
    '유튜브 구독자',
    '유튜브 구독자 늘리기',
    '유튜브 구독자 구매',
    '유튜브 구독자 1000명',
    '유튜브 수익창출',
    '유튜브 채널 성장',
    'YouTube subscribers',
    '구독자 늘리는법',
  ],
  openGraph: {
    title: '유튜브 구독자 늘리기 - 실제 구독자 | INFLUX',
    description: '유튜브 구독자를 안전하게 늘려보세요. 수익창출 1000명 달성.',
    type: 'website',
    url: 'https://www.influx-lab.com/youtube-subscribers',
  },
  alternates: {
    canonical: 'https://www.influx-lab.com/youtube-subscribers',
  },
};

// ============================================
// Page Component
// ============================================
export default function YouTubeSubscribersPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-transparent" />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-sm text-white/50 mb-8">
            <Link href="/" className="hover:text-white">홈</Link>
            <span>/</span>
            <Link href="/services/youtube" className="hover:text-white">유튜브</Link>
            <span>/</span>
            <span className="text-white">구독자</span>
          </nav>

          <Badge className="mb-4 bg-red-500/20 text-red-400 border-red-500/30">
            <FaYoutube className="w-3 h-3 mr-1" />
            수익창출 1000명 달성
          </Badge>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            유튜브 구독자 <span className="text-red-500">늘리기</span>
            <br />
            채널 성장의 시작
          </h1>

          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            구독자 1,000명은 수익창출의 첫 관문입니다.
            <strong className="text-white"> 실제 계정 구독자</strong>로 빠르고 안전하게 달성하세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-red-600 hover:bg-red-700" asChild>
              <Link href="/order">
                지금 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/free-trial">
                무료 체험하기
              </Link>
            </Button>
          </div>

          <p className="text-sm text-white/50 mt-4">
            구독자 10명 ₩500부터 | 24시간 자동 처리
          </p>
        </div>
      </section>

      {/* Monetization Info */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            유튜브 수익창출 조건
          </h2>
          <p className="text-white/60 text-center mb-12">
            유튜브 파트너 프로그램(YPP) 가입 요건
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-white/10">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-4xl font-black text-white mb-2">1,000명</h3>
                <p className="text-white/60">구독자 수</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/10">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-4xl font-black text-white mb-2">4,000시간</h3>
                <p className="text-white/60">시청 시간 (12개월)</p>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-white/40 text-sm mt-8">
            INFLUX에서 구독자와 시청시간 모두 해결할 수 있습니다
          </p>
        </div>
      </section>

      {/* Why Subscribers */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            구독자가 <span className="text-red-500">많아야 하는 이유</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">알림 시청자</h3>
                <p className="text-white/60 text-sm">
                  새 영상 업로드 시 구독자에게 알림이 갑니다.
                  초기 조회수를 확보하는 핵심입니다.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">알고리즘 신뢰</h3>
                <p className="text-white/60 text-sm">
                  구독자가 많은 채널은 유튜브가 신뢰합니다.
                  추천 영상에 더 자주 노출됩니다.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">채널 권위</h3>
                <p className="text-white/60 text-sm">
                  구독자 100 vs 10,000. 어떤 채널이 신뢰가 가나요?
                  스폰서십, 협찬의 기준이 됩니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            구독자 패키지
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-2">스타터</h3>
                <p className="text-3xl font-black text-red-400 mb-4">100명</p>
                <p className="text-2xl font-bold text-white mb-6">₩15,000</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    실제 계정
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    1~3일 처리
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    30일 보충
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/order">주문하기</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500">
                인기
              </Badge>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-2">수익창출</h3>
                <p className="text-3xl font-black text-red-400 mb-4">1,000명</p>
                <p className="text-2xl font-bold text-white mb-6">₩120,000</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    수익창출 달성
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    7~14일 자연 증가
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    60일 보충
                  </li>
                </ul>
                <Button className="w-full bg-red-600 hover:bg-red-700" asChild>
                  <Link href="/order">주문하기</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-2">그로스</h3>
                <p className="text-3xl font-black text-red-400 mb-4">5,000명</p>
                <p className="text-2xl font-bold text-white mb-6">₩500,000</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    채널 권위 확보
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    30일 자연 증가
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    90일 보충
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/order">주문하기</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            자주 묻는 질문
          </h2>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">구독자가 빠지면 어떻게 하나요?</h3>
              <p className="text-white/60 text-sm">
                30~90일 보충 정책이 있습니다. 이탈한 구독자 수만큼 무료로 재충전해드립니다.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">구독자 구매하면 수익창출 심사 통과되나요?</h3>
              <p className="text-white/60 text-sm">
                구독자 수는 조건 중 하나일 뿐입니다. 시청시간 4,000시간도 함께 충족해야 합니다.
                INFLUX에서 시청시간 서비스도 제공합니다.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">채널이 정지되지 않나요?</h3>
              <p className="text-white/60 text-sm">
                INFLUX는 실제 계정을 사용하며 자연스러운 증가 패턴을 따릅니다.
                지금까지 구독자 서비스로 인한 채널 정지 사례는 없습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-t from-red-500/10 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            수익창출, 지금 시작하세요
          </h2>
          <p className="text-white/60 mb-8">
            구독자 1,000명 달성. 유튜버의 첫 걸음.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-red-600 hover:bg-red-700" asChild>
              <Link href="/order">
                구독자 주문하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/youtube-views">조회수도 함께</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-5xl mx-auto text-center text-white/40 text-sm">
          <p>INFLUX - SNS 마케팅 자동화 플랫폼</p>
          <p className="mt-2">
            <Link href="/terms" className="hover:text-white">이용약관</Link>
            {' | '}
            <Link href="/privacy" className="hover:text-white">개인정보처리방침</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
