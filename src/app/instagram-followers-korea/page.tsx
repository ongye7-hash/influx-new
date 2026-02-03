// ============================================
// 인스타그램 한국인 팔로워 - SEO 랜딩페이지
// 타겟 키워드: 인스타 팔로워 한국인, 인스타그램 한국인 팔로워
// ============================================

import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, Users, CheckCircle2, Shield, Zap,
  TrendingUp, Star, Clock, MessageCircle, Heart
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ============================================
// SEO Metadata
// ============================================
export const metadata: Metadata = {
  title: '인스타 팔로워 한국인 - 실제 한국 계정으로 팔로워 늘리기 | INFLUX',
  description: '인스타그램 한국인 팔로워를 안전하게 늘려보세요. 실제 한국 계정, 자연스러운 증가, 24시간 자동 처리. 500원부터 시작 가능한 인스타 팔로워 서비스.',
  keywords: [
    '인스타 팔로워 한국인',
    '인스타그램 한국인 팔로워',
    '인스타 한국인 팔로워 구매',
    '인스타그램 팔로워 늘리기',
    '인스타 팔로워 늘리는법',
    '한국인 팔로워',
    '인스타 팔로워 구매',
    '인스타그램 마케팅',
  ],
  openGraph: {
    title: '인스타 팔로워 한국인 - 실제 한국 계정 | INFLUX',
    description: '인스타그램 한국인 팔로워를 안전하게 늘려보세요. 실제 한국 계정, 자연스러운 증가.',
    type: 'website',
    url: 'https://www.influx-lab.com/instagram-followers-korea',
  },
  alternates: {
    canonical: 'https://www.influx-lab.com/instagram-followers-korea',
  },
};

// ============================================
// Page Component
// ============================================
export default function InstagramFollowersKoreaPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 via-transparent to-transparent" />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-sm text-white/50 mb-8">
            <Link href="/" className="hover:text-white">홈</Link>
            <span>/</span>
            <Link href="/services/instagram" className="hover:text-white">인스타그램</Link>
            <span>/</span>
            <span className="text-white">한국인 팔로워</span>
          </nav>

          <Badge className="mb-4 bg-pink-500/20 text-pink-400 border-pink-500/30">
            <FaInstagram className="w-3 h-3 mr-1" />
            인스타그램 공식 파트너
          </Badge>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            인스타 팔로워 <span className="text-pink-400">한국인</span>
            <br />
            실제 계정으로 자연스럽게
          </h1>

          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            외국인 팔로워는 의미 없습니다. <strong className="text-white">실제 한국인 계정</strong>으로
            팔로워를 늘려 인스타그램 알고리즘에 유리하게, 브랜드 신뢰도를 높이세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90" asChild>
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
            500원부터 시작 | 24시간 자동 처리 | 100% 안전 보장
          </p>
        </div>
      </section>

      {/* Why Korean Followers */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            왜 <span className="text-pink-400">한국인 팔로워</span>인가요?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">알고리즘 최적화</h3>
                <p className="text-white/60 text-sm">
                  한국인 팔로워는 한국 타겟 게시물 노출에 유리합니다.
                  탐색 탭, 릴스 추천에 더 잘 노출됩니다.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">실제 전환 가능</h3>
                <p className="text-white/60 text-sm">
                  외국인 팔로워는 구매로 이어지지 않습니다.
                  한국인 팔로워는 실제 고객이 될 수 있습니다.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">브랜드 신뢰도</h3>
                <p className="text-white/60 text-sm">
                  팔로워가 전부 외국인이면 의심받습니다.
                  한국인 팔로워로 자연스러운 계정을 만드세요.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            INFLUX 한국인 팔로워 서비스
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">100% 실제 한국 계정</h3>
                  <p className="text-white/60 text-sm">봇이나 가짜 계정이 아닌, 실제 활동하는 한국인 계정입니다.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">자연스러운 증가</h3>
                  <p className="text-white/60 text-sm">한 번에 몰아서가 아닌, 자연스럽게 분산되어 증가합니다.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">이탈률 최소화</h3>
                  <p className="text-white/60 text-sm">품질 높은 계정으로 팔로워 이탈을 최소화합니다.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">비밀번호 불필요</h3>
                  <p className="text-white/60 text-sm">계정 정보 없이 사용자명만으로 안전하게 진행됩니다.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">한국인 팔로워 패키지</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white">100명</span>
                  <span className="text-pink-400 font-bold">₩5,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white">500명</span>
                  <span className="text-pink-400 font-bold">₩20,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white">1,000명</span>
                  <span className="text-pink-400 font-bold">₩35,000</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-white">5,000명</span>
                  <span className="text-pink-400 font-bold">₩150,000</span>
                </div>
              </div>

              <Button className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600" asChild>
                <Link href="/order">주문하기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            자주 묻는 질문
          </h2>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">계정이 정지되지 않나요?</h3>
              <p className="text-white/60 text-sm">
                INFLUX는 인스타그램 정책을 준수하며, 자연스러운 방식으로 팔로워를 증가시킵니다.
                지금까지 계정 정지 사례가 없습니다.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">얼마나 빨리 팔로워가 늘어나나요?</h3>
              <p className="text-white/60 text-sm">
                주문 후 1~24시간 내에 시작되며, 자연스러운 증가를 위해
                주문량에 따라 1~7일에 걸쳐 분산 처리됩니다.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">팔로워가 빠지면 어떻게 하나요?</h3>
              <p className="text-white/60 text-sm">
                30일 이내 이탈 시 무료로 재충전해드립니다.
                다만 한국인 고품질 팔로워는 이탈률이 매우 낮습니다.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">비공개 계정도 가능한가요?</h3>
              <p className="text-white/60 text-sm">
                팔로워 서비스 이용 중에는 계정을 공개로 설정해주세요.
                서비스 완료 후 비공개로 변경 가능합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-white/60 mb-8">
            500원부터 테스트 가능. 만족하지 않으면 100% 환불.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600" asChild>
              <Link href="/order">
                한국인 팔로워 주문하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/free-trial">무료 체험</Link>
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
