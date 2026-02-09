// ============================================
// 유튜브 조회수 늘리기 - SEO 랜딩페이지
// 타겟 키워드: 유튜브 조회수, 유튜브 트래픽, 유튜브 조회수 구매
// Server Component - DB에서 실제 가격 조회
// ============================================

import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle2,
  TrendingUp, BarChart3, Target,
} from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getYoutubeViewsPrices,
  getLowestPrice,
} from '@/lib/seo-prices';

// ============================================
// SEO Metadata
// ============================================
export const metadata: Metadata = {
  title: '유튜브 조회수 늘리기 - 트래픽으로 조회수 증가 | INFLUX',
  description: '유튜브 조회수를 빠르게 늘려보세요. 트래픽 기반 조회수 증가, 24시간 자동 처리. 유튜브 조회수 서비스.',
  keywords: [
    '유튜브 조회수',
    '유튜브 조회수 늘리기',
    '유튜브 조회수 서비스',
    '유튜브 트래픽',
    '유튜브 트래픽 업체',
    '유튜브 조회수 올리기',
    '유튜브 영상 조회수',
    'YouTube views',
  ],
  openGraph: {
    title: '유튜브 조회수 늘리기 | INFLUX',
    description: '유튜브 조회수를 빠르게 늘려보세요. 트래픽 기반 조회수 증가.',
    type: 'website',
    url: 'https://www.influx-lab.com/youtube-views',
  },
  alternates: {
    canonical: 'https://www.influx-lab.com/youtube-views',
  },
};

// ============================================
// Page Component (Server Component)
// ============================================
export default async function YouTubeViewsPage() {
  // 실제 가격 조회
  const products = await getYoutubeViewsPrices();
  const lowestPrice = getLowestPrice(products);

  // 대량 주문 가격 (1000, 10000, 50000, 100000 조회수)
  const viewsPackages = lowestPrice > 0
    ? [
        { quantity: 1000, price: Math.round(lowestPrice) },
        { quantity: 10000, price: Math.round(lowestPrice * 10) },
        { quantity: 50000, price: Math.round(lowestPrice * 50) },
        { quantity: 100000, price: Math.round(lowestPrice * 100) },
      ]
    : [];

  // 최저 시작 가격 (1000 조회수 기준)
  const minStartPrice = lowestPrice > 0 ? Math.round(lowestPrice) : null;

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
            <Link href="/order" className="hover:text-white">주문</Link>
            <span>/</span>
            <span className="text-white">조회수</span>
          </nav>

          <Badge className="mb-4 bg-red-500/20 text-red-400 border-red-500/30">
            <FaYoutube className="w-3 h-3 mr-1" />
            유튜브 조회수 서비스
          </Badge>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            유튜브 조회수 <span className="text-red-500">늘리기</span>
            <br />
            트래픽 기반 증가
          </h1>

          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            조회수가 높은 영상은 <strong className="text-white">유튜브 추천 알고리즘</strong>에 유리합니다.
            트래픽 기반 조회수로 영상 노출을 높이세요.
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

          {minStartPrice && (
            <p className="text-sm text-white/50 mt-4">
              1,000 조회수 {minStartPrice.toLocaleString()}원부터 | 24시간 자동 처리
            </p>
          )}
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

      {/* Service Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            INFLUX 조회수 서비스
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">다양한 조회수 옵션</h3>
                  <p className="text-white/60 text-sm">일반 조회수, 고품질 조회수, 쇼츠 조회수 등 다양한 상품.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">자연스러운 분산 처리</h3>
                  <p className="text-white/60 text-sm">한 번에 몰아서가 아닌, 자연스럽게 분산되어 증가합니다.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">24시간 자동 처리</h3>
                  <p className="text-white/60 text-sm">주문 후 자동으로 처리되며 진행 상황을 확인할 수 있습니다.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">대량 주문 가능</h3>
                  <p className="text-white/60 text-sm">최대 수백만 조회수까지 대량 주문이 가능합니다.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">조회수 가격</h3>

              {viewsPackages.length > 0 ? (
                <div className="space-y-4">
                  {viewsPackages.map((pkg, idx) => (
                    <div
                      key={pkg.quantity}
                      className={`flex justify-between items-center py-3 ${
                        idx < viewsPackages.length - 1 ? 'border-b border-white/10' : ''
                      }`}
                    >
                      <span className="text-white">{pkg.quantity.toLocaleString()} 조회수</span>
                      <span className="text-red-400 font-bold">₩{pkg.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-sm mb-4">
                  실시간 가격은 주문 페이지에서 확인하세요.
                </p>
              )}

              <p className="text-center text-white/40 text-sm mt-4">
                * 상품별 가격이 다를 수 있습니다
              </p>

              <Button className="w-full mt-6 bg-red-600 hover:bg-red-700" asChild>
                <Link href="/order">서비스 시작</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            자주 묻는 질문
          </h2>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">조회수가 줄어들 수 있나요?</h3>
              <p className="text-white/60 text-sm">
                유튜브는 주기적으로 비정상 조회수를 점검합니다.
                상품별로 리필 정책이 다르니 주문 페이지에서 확인해주세요.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">비공개 영상도 가능한가요?</h3>
              <p className="text-white/60 text-sm">
                아니요, 조회수 서비스는 공개 또는 미등록 영상만 가능합니다.
                비공개 영상에는 조회수를 추가할 수 없습니다.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">쇼츠 영상도 가능한가요?</h3>
              <p className="text-white/60 text-sm">
                네, 쇼츠 전용 조회수 상품도 있습니다.
                주문 페이지에서 쇼츠 조회수 상품을 선택해주세요.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">결제는 어떻게 하나요?</h3>
              <p className="text-white/60 text-sm">
                무통장입금 또는 USDT 암호화폐 결제를 지원합니다.
                충전 후 잔액으로 주문하는 방식입니다.
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
            무료 체험으로 먼저 테스트해보세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-red-600 hover:bg-red-700" asChild>
              <Link href="/order">
                조회수 서비스 시작
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/youtube-subscribers">구독자도 함께</Link>
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
