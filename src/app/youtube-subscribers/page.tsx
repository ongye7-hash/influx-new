// ============================================
// 유튜브 구독자 늘리기 - SEO 랜딩페이지
// 타겟 키워드: 유튜브 구독자, 유튜브 구독자 구매, 유튜브 구독자 늘리기
// Server Component - DB에서 실제 가격 조회
// ============================================

import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, Users, CheckCircle2,
  TrendingUp, Award, Bell, Play,
} from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getYoutubeSubscriberPrices,
  getLowestPrice,
} from '@/lib/seo-prices';

// ============================================
// SEO Metadata
// ============================================
export const metadata: Metadata = {
  title: '유튜브 구독자 늘리기 - 채널 성장 | INFLUX',
  description: '유튜브 구독자를 늘려보세요. 수익창출 1000명 달성, 24시간 자동 처리. 유튜브 채널 성장 서비스.',
  keywords: [
    '유튜브 구독자',
    '유튜브 구독자 늘리기',
    '유튜브 구독자 서비스',
    '유튜브 구독자 1000명',
    '유튜브 수익창출',
    '유튜브 채널 성장',
    'YouTube subscribers',
    '구독자 늘리는법',
  ],
  openGraph: {
    title: '유튜브 구독자 늘리기 | INFLUX',
    description: '유튜브 구독자를 늘려보세요. 수익창출 1000명 달성.',
    type: 'website',
    url: 'https://www.influx-lab.com/youtube-subscribers',
  },
  alternates: {
    canonical: 'https://www.influx-lab.com/youtube-subscribers',
  },
};

// ============================================
// Page Component (Server Component)
// ============================================
export default async function YouTubeSubscribersPage() {
  // 실제 가격 조회
  const products = await getYoutubeSubscriberPrices();
  const lowestPrice = getLowestPrice(products);

  // 구독자 패키지 가격 (100, 500, 1000, 5000 구독자)
  const subsPackages = lowestPrice > 0
    ? [
        { quantity: 100, price: Math.round((lowestPrice / 1000) * 100) },
        { quantity: 500, price: Math.round((lowestPrice / 1000) * 500) },
        { quantity: 1000, price: Math.round(lowestPrice) },
        { quantity: 5000, price: Math.round(lowestPrice * 5) },
      ]
    : [];

  // 최저 시작 가격 (10명 기준)
  const minStartPrice = lowestPrice > 0 ? Math.round((lowestPrice / 1000) * 10) : null;

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
            <span className="text-white">구독자</span>
          </nav>

          <Badge className="mb-4 bg-red-500/20 text-red-400 border-red-500/30">
            <FaYoutube className="w-3 h-3 mr-1" />
            유튜브 구독자 서비스
          </Badge>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            유튜브 구독자 <span className="text-red-500">늘리기</span>
            <br />
            채널 성장의 시작
          </h1>

          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            구독자 1,000명은 수익창출의 첫 관문입니다.
            <strong className="text-white"> 구독자를 늘려</strong> 빠르게 달성하세요.
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
              구독자 10명 {minStartPrice.toLocaleString()}원부터 | 24시간 자동 처리
            </p>
          )}
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
            구독자 가격
          </h2>

          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl p-8 border border-white/10 max-w-md mx-auto">
            {subsPackages.length > 0 ? (
              <div className="space-y-4">
                {subsPackages.map((pkg, idx) => (
                  <div
                    key={pkg.quantity}
                    className={`flex justify-between items-center py-3 ${
                      idx < subsPackages.length - 1 ? 'border-b border-white/10' : ''
                    }`}
                  >
                    <span className="text-white">{pkg.quantity.toLocaleString()}명</span>
                    <span className="text-red-400 font-bold">₩{pkg.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-sm mb-4 text-center">
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
      </section>

      {/* Service Features */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            INFLUX 구독자 서비스
          </h2>

          <div className="space-y-6">
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
                <h3 className="font-bold text-white mb-1">24시간 자동 처리</h3>
                <p className="text-white/60 text-sm">주문 후 자동으로 처리되며 진행 상황을 확인할 수 있습니다.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-1">다양한 상품 옵션</h3>
                <p className="text-white/60 text-sm">저가형부터 고품질까지 다양한 구독자 상품이 있습니다.</p>
              </div>
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
              <h3 className="font-bold text-white mb-2">구독자가 빠지면 어떻게 하나요?</h3>
              <p className="text-white/60 text-sm">
                상품별로 리필 정책이 다릅니다. 주문 페이지에서 각 상품의 리필 기간을 확인해주세요.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">구독자를 늘리면 수익창출 심사 통과되나요?</h3>
              <p className="text-white/60 text-sm">
                구독자 수는 조건 중 하나일 뿐입니다. 시청시간 4,000시간도 함께 충족해야 합니다.
                조회수/시청시간 서비스도 함께 이용해보세요.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-2">채널 URL만 있으면 되나요?</h3>
              <p className="text-white/60 text-sm">
                네, 채널 URL만 입력하면 됩니다. 비밀번호나 계정 정보는 필요 없습니다.
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
            채널 성장, 지금 시작하세요
          </h2>
          <p className="text-white/60 mb-8">
            무료 체험으로 먼저 테스트해보세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-red-600 hover:bg-red-700" asChild>
              <Link href="/order">
                구독자 서비스 시작
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
