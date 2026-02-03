// ============================================
// 인스타그램 좋아요 - SEO 랜딩페이지
// 타겟 키워드: 인스타 좋아요, 인스타그램 좋아요 늘리기, 인스타 좋아요 구매
// ============================================

import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, Heart, CheckCircle2, Shield, Zap,
  TrendingUp, Star, Eye, Sparkles, Target
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ============================================
// SEO Metadata
// ============================================
export const metadata: Metadata = {
  title: '인스타 좋아요 늘리기 - 게시물 인기도 상승 | INFLUX',
  description: '인스타그램 좋아요를 빠르고 안전하게 늘려보세요. 한국인 좋아요, 외국인 좋아요, 자동 좋아요 서비스. 게시물당 10원부터 시작.',
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
// Page Component
// ============================================
export default function InstagramLikesPage() {
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

          <p className="text-sm text-white/50 mt-4">
            좋아요 10개 ₩100부터 | 5분 내 시작
          </p>
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

      {/* Service Types */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            좋아요 서비스 종류
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <Badge className="mb-4 bg-emerald-500/20 text-emerald-400">저렴한</Badge>
                <h3 className="text-xl font-bold text-white mb-2">글로벌 좋아요</h3>
                <p className="text-white/60 text-sm mb-4">
                  전 세계 계정의 좋아요.
                  빠르고 저렴하게 좋아요 수를 늘리세요.
                </p>
                <p className="text-2xl font-bold text-pink-400 mb-4">
                  100개 <span className="text-lg">₩500</span>
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    5분 내 시작
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    대량 주문 가능
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/order">주문하기</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-500">
                추천
              </Badge>
              <CardContent className="p-6">
                <Badge className="mb-4 bg-pink-500/20 text-pink-400">한국인</Badge>
                <h3 className="text-xl font-bold text-white mb-2">한국인 좋아요</h3>
                <p className="text-white/60 text-sm mb-4">
                  실제 한국 계정의 좋아요.
                  타겟 고객에게 더 효과적입니다.
                </p>
                <p className="text-2xl font-bold text-pink-400 mb-4">
                  100개 <span className="text-lg">₩3,000</span>
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    실제 한국 계정
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    알고리즘 최적화
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600" asChild>
                  <Link href="/order">주문하기</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <Badge className="mb-4 bg-blue-500/20 text-blue-400">자동화</Badge>
                <h3 className="text-xl font-bold text-white mb-2">자동 좋아요</h3>
                <p className="text-white/60 text-sm mb-4">
                  새 게시물에 자동으로 좋아요.
                  매번 주문할 필요 없이 편리합니다.
                </p>
                <p className="text-2xl font-bold text-pink-400 mb-4">
                  월 <span className="text-lg">₩30,000~</span>
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    신규 게시물 자동 감지
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    설정한 수량만큼 자동
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

      {/* Pricing Table */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            좋아요 가격표
          </h2>

          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-6 text-center">한국인 좋아요</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white">50개</span>
                <span className="text-pink-400 font-bold">₩2,000</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white">100개</span>
                <span className="text-pink-400 font-bold">₩3,000</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white">500개</span>
                <span className="text-pink-400 font-bold">₩12,000</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-white">1,000개</span>
                <span className="text-pink-400 font-bold">₩20,000</span>
              </div>
            </div>
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
              <h3 className="font-bold text-white mb-2">좋아요가 줄어들 수 있나요?</h3>
              <p className="text-white/60 text-sm">
                인스타그램이 비정상 좋아요를 삭제할 수 있습니다.
                하지만 INFLUX의 좋아요는 실제 계정이므로 삭제율이 낮습니다.
                30일 내 이탈 시 무료 보충해드립니다.
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
            좋아요 10개 ₩100부터. 5분 내 시작.
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
