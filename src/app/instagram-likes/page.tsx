// ============================================
// 인스타그램 좋아요 - SEO 랜딩페이지
// 타겟 키워드: 인스타 좋아요, 인스타그램 좋아요 늘리기, 인스타 좋아요 구매
// Server Component - DB에서 실제 가격 조회
// ============================================

import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, Heart, CheckCircle2,
  TrendingUp, Eye, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getInstagramLikesPrices,
  generatePricePackages,
  getLowestPrice,
} from '@/lib/seo-prices';

// ============================================
// SEO Metadata
// ============================================
export const metadata: Metadata = {
  title: '인스타 좋아요 늘리기 - 게시물 인기도 상승 | INFLUX',
  description: '인스타그램 좋아요를 빠르고 안전하게 늘려보세요. 한국인 좋아요, 자동 좋아요 서비스. 게시물 인기도를 높이세요.',
  keywords: [
    '인스타 좋아요',
    '인스타그램 좋아요',
    '인스타 좋아요 늘리기',
    '인스타 좋아요 구매',
    '인스타그램 좋아요 늘리기',
    '인스타 한국인 좋아요',
    '인스타 자동 좋아요',
    'Instagram likes',
  ],
  openGraph: {
    title: '인스타 좋아요 늘리기 | INFLUX',
    description: '인스타그램 좋아요를 빠르고 안전하게 늘려보세요.',
    type: 'website',
    url: 'https://www.influx-lab.com/instagram-likes',
  },
  alternates: {
    canonical: 'https://www.influx-lab.com/instagram-likes',
  },
};

// ============================================
// Page Component (Server Component)
// ============================================
export default async function InstagramLikesPage() {
  // 실제 가격 조회
  const products = await getInstagramLikesPrices();
  const lowestPrice = getLowestPrice(products);
  const packages = lowestPrice > 0 ? generatePricePackages(lowestPrice) : [];

  // 최저 시작 가격 (10개 기준)
  const minStartPrice = lowestPrice > 0 ? Math.round((lowestPrice / 1000) * 10) : null;

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
            <Link href="/order" className="hover:text-white">주문</Link>
            <span>/</span>
            <span className="text-white">좋아요</span>
          </nav>

          <Badge className="mb-4 bg-pink-500/20 text-pink-400 border-pink-500/30">
            <Heart className="w-3 h-3 mr-1 fill-current" />
            즉시 처리 가능
          </Badge>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            인스타 좋아요 <span className="text-pink-400">늘리기</span>
            <br />
            게시물 인기도 상승
          </h1>

          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            좋아요가 많은 게시물은 <strong className="text-white">탐색 탭에 노출</strong>됩니다.
            자연스러운 좋아요 증가로 인스타그램 알고리즘을 공략하세요.
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

          {minStartPrice && (
            <p className="text-sm text-white/50 mt-4">
              10개 {minStartPrice.toLocaleString()}원부터 | 빠른 처리
            </p>
          )}
        </div>
      </section>

      {/* Why Likes Matter */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            좋아요가 <span className="text-pink-400">중요한 이유</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">탐색 탭 노출</h3>
                <p className="text-white/60 text-sm">
                  좋아요가 많은 게시물은 탐색 탭에 노출됩니다.
                  팔로워가 아닌 사람들에게도 도달할 수 있습니다.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">참여율 상승</h3>
                <p className="text-white/60 text-sm">
                  좋아요가 많으면 다른 사람들도 좋아요를 누릅니다.
                  사회적 증거 효과로 참여율이 올라갑니다.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">브랜드 이미지</h3>
                <p className="text-white/60 text-sm">
                  좋아요 3개 vs 3,000개. 어떤 계정이 더 신뢰가 가나요?
                  좋아요는 계정의 인기도를 보여줍니다.
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
            INFLUX 좋아요 서비스
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">한국인/글로벌 선택</h3>
                  <p className="text-white/60 text-sm">타겟에 맞는 좋아요를 선택할 수 있습니다.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">빠른 시작</h3>
                  <p className="text-white/60 text-sm">주문 후 빠르게 좋아요가 시작됩니다.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">모든 콘텐츠 지원</h3>
                  <p className="text-white/60 text-sm">일반 게시물, 릴스, IGTV 모두 가능합니다.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white mb-1">24시간 자동 처리</h3>
                  <p className="text-white/60 text-sm">주문 후 자동으로 처리됩니다.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">좋아요 가격</h3>

              {packages.length > 0 ? (
                <div className="space-y-4">
                  {packages.map((pkg, idx) => (
                    <div
                      key={pkg.quantity}
                      className={`flex justify-between items-center py-3 ${
                        idx < packages.length - 1 ? 'border-b border-white/10' : ''
                      }`}
                    >
                      <span className="text-white">{pkg.quantity.toLocaleString()}개</span>
                      <span className="text-pink-400 font-bold">₩{pkg.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-sm mb-4">
                  실시간 가격은 주문 페이지에서 확인하세요.
                </p>
              )}

              <Button className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600" asChild>
                <Link href="/order">주문하기</Link>
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
              <h3 className="font-bold text-white mb-2">좋아요가 줄어들 수 있나요?</h3>
              <p className="text-white/60 text-sm">
                인스타그램 정책에 따라 일부 감소할 수 있습니다.
                상품별로 리필 정책이 다르니 주문 페이지에서 확인해주세요.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">비공개 계정도 가능한가요?</h3>
              <p className="text-white/60 text-sm">
                아니요, 좋아요 서비스는 공개 계정만 가능합니다.
                게시물이 공개되어 있어야 좋아요를 받을 수 있습니다.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">릴스에도 좋아요를 받을 수 있나요?</h3>
              <p className="text-white/60 text-sm">
                네, 일반 게시물, 릴스, IGTV 모두 좋아요 서비스 이용 가능합니다.
                게시물 URL만 있으면 됩니다.
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
      <section className="py-20 px-4 bg-gradient-to-t from-pink-500/10 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            게시물 인기도, 지금 올려보세요
          </h2>
          <p className="text-white/60 mb-8">
            무료 체험으로 먼저 테스트해보세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600" asChild>
              <Link href="/order">
                좋아요 주문하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/instagram-followers-korea">팔로워도 함께</Link>
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
