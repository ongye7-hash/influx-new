// ============================================
// 유튜브 조회수 늘리기 - SEO 랜딩페이지
// 타겟 키워드: 유튜브 조회수, 유튜브 트래픽, 유튜브 조회수 구매
// ============================================

import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, Eye, CheckCircle2, Shield, Zap,
  TrendingUp, Clock, Play, BarChart3, Target
} from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ============================================
// SEO Metadata
// ============================================
export const metadata: Metadata = {
  title: '유튜브 조회수 늘리기 - 실제 트래픽으로 조회수 증가 | INFLUX',
  description: '유튜브 조회수를 안전하고 빠르게 늘려보세요. 실제 시청 트래픽, 알고리즘 최적화, 수익창출 조건 달성. 100원부터 시작 가능한 유튜브 조회수 서비스.',
  keywords: [
    '유튜브 조회수',
    '유튜브 조회수 늘리기',
    '유튜브 조회수 구매',
    '유튜브 트래픽',
    '유튜브 트래픽 업체',
    '유튜브 조회수 올리기',
    '유튜브 영상 조회수',
    'YouTube views',
  ],
  openGraph: {
    title: '유튜브 조회수 늘리기 - 실제 트래픽 | INFLUX',
    description: '유튜브 조회수를 안전하고 빠르게 늘려보세요. 실제 시청 트래픽으로 알고리즘 최적화.',
    type: 'website',
    url: 'https://www.influx-lab.com/youtube-views',
  },
  alternates: {
    canonical: 'https://www.influx-lab.com/youtube-views',
  },
};

// ============================================
// Page Component
// ============================================
export default function YouTubeViewsPage() {
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
            <span className="text-white">조회수</span>
          </nav>

          <Badge className="mb-4 bg-red-500/20 text-red-400 border-red-500/30">
            <FaYoutube className="w-3 h-3 mr-1" />
            유튜브 공식 가이드라인 준수
          </Badge>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            유튜브 조회수 <span className="text-red-500">늘리기</span>
            <br />
            실제 트래픽으로 안전하게
          </h1>

          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            가짜 조회수는 의미 없습니다. <strong className="text-white">실제 시청 트래픽</strong>으로
            유튜브 알고리즘에 긍정적인 신호를 보내고, 추천 영상에 노출되세요.
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
            100원부터 시작 | 24시간 자동 처리 | 수익창출 안전
          </p>
        </div>
      </section>

      {/* Why Views Matter */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            왜 <span className="text-red-500">조회수</span>가 중요한가요?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">알고리즘 부스트</h3>
                <p className="text-white/60 text-sm">
                  조회수가 높은 영상은 유튜브가 더 많이 추천합니다.
                  홈, 추천 영상, 검색 결과에 노출됩니다.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">수익창출 조건</h3>
                <p className="text-white/60 text-sm">
                  유튜브 파트너 프로그램 가입을 위해
                  공개 영상 조회수 4,000시간이 필요합니다.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">사회적 증거</h3>
                <p className="text-white/60 text-sm">
                  조회수 100 vs 10만. 어떤 영상을 클릭하시겠습니까?
                  높은 조회수는 신뢰를 만듭니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Types */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            조회수 서비스 종류
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-white/10">
              <CardContent className="p-8">
                <Badge className="mb-4 bg-red-500/20 text-red-400">인기</Badge>
                <h3 className="text-2xl font-bold text-white mb-4">일반 조회수</h3>
                <p className="text-white/60 mb-6">
                  빠른 조회수 증가가 필요할 때. 글로벌 트래픽으로
                  비용 대비 효율적인 조회수를 얻으세요.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-white/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    1,000 조회수 ₩1,000~
                  </li>
                  <li className="flex items-center gap-2 text-white/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    1~24시간 내 시작
                  </li>
                  <li className="flex items-center gap-2 text-white/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    자연스러운 분산 처리
                  </li>
                </ul>
                <Button className="w-full bg-red-600 hover:bg-red-700" asChild>
                  <Link href="/order">주문하기</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/10">
              <CardContent className="p-8">
                <Badge className="mb-4 bg-blue-500/20 text-blue-400">프리미엄</Badge>
                <h3 className="text-2xl font-bold text-white mb-4">고품질 조회수</h3>
                <p className="text-white/60 mb-6">
                  시청 지속시간이 중요할 때. 실제 시청 패턴으로
                  알고리즘에 최적화된 조회수를 얻으세요.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-white/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    높은 시청 지속시간
                  </li>
                  <li className="flex items-center gap-2 text-white/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    실제 시청 패턴
                  </li>
                  <li className="flex items-center gap-2 text-white/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    수익창출 안전
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/order">주문하기</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            조회수 가격표
          </h2>

          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-4 border-b border-white/10">
                <div>
                  <span className="text-white font-medium">1,000 조회수</span>
                  <span className="text-white/40 text-sm ml-2">테스트용</span>
                </div>
                <span className="text-red-400 font-bold text-lg">₩1,000</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-white/10">
                <div>
                  <span className="text-white font-medium">10,000 조회수</span>
                  <span className="text-white/40 text-sm ml-2">소규모 채널</span>
                </div>
                <span className="text-red-400 font-bold text-lg">₩8,000</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-white/10">
                <div>
                  <span className="text-white font-medium">50,000 조회수</span>
                  <Badge className="ml-2 bg-amber-500/20 text-amber-400 text-xs">인기</Badge>
                </div>
                <span className="text-red-400 font-bold text-lg">₩35,000</span>
              </div>
              <div className="flex justify-between items-center py-4">
                <div>
                  <span className="text-white font-medium">100,000 조회수</span>
                  <span className="text-white/40 text-sm ml-2">바이럴용</span>
                </div>
                <span className="text-red-400 font-bold text-lg">₩60,000</span>
              </div>
            </div>

            <p className="text-center text-white/40 text-sm mt-6">
              * 가격은 서비스 종류에 따라 달라질 수 있습니다
            </p>
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
              <h3 className="font-bold text-white mb-2">조회수 구매하면 채널이 정지되나요?</h3>
              <p className="text-white/60 text-sm">
                INFLUX는 실제 트래픽을 사용하며 유튜브 가이드라인을 준수합니다.
                현재까지 조회수로 인한 채널 정지 사례는 없습니다.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">수익창출 심사에 영향이 있나요?</h3>
              <p className="text-white/60 text-sm">
                고품질 조회수 서비스는 실제 시청 패턴을 따르므로 수익창출에 안전합니다.
                단, 시청시간 서비스와 함께 사용하시면 더 효과적입니다.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">조회수가 줄어들 수 있나요?</h3>
              <p className="text-white/60 text-sm">
                유튜브는 주기적으로 비정상 조회수를 삭제합니다.
                INFLUX 조회수는 실제 트래픽이므로 삭제율이 매우 낮습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-t from-red-500/10 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            영상 조회수, 지금 바로 늘려보세요
          </h2>
          <p className="text-white/60 mb-8">
            100원부터 테스트 가능. 24시간 자동 처리.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-red-600 hover:bg-red-700" asChild>
              <Link href="/order">
                조회수 주문하기
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
