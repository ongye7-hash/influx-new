// ============================================
// Blog List Page (인사이트)
// SEO 최적화 블로그 목록
// ============================================

import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Tag, TrendingUp, Sparkles, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllPosts } from '@/lib/blog-posts';
import { cn } from '@/lib/utils';

// ============================================
// Metadata
// ============================================
export const metadata: Metadata = {
  title: '인사이트 | SNS 마케팅 & 유튜브 성장 전략 블로그',
  description: '유튜브 조회수 올리기, 인스타 팔로워 늘리기, SNS 마케팅 전략 등 크리에이터를 위한 실전 노하우를 공유합니다. INFLUX 마케팅 전문가가 알려드리는 성장 비법.',
  keywords: ['SNS 마케팅', '유튜브 성장', '인스타 마케팅', '크리에이터 팁', '소셜미디어 전략'],
  openGraph: {
    title: '인사이트 | INFLUX 마케팅 블로그',
    description: '크리에이터를 위한 실전 마케팅 노하우',
    type: 'website',
  },
};

// ============================================
// Logo Component
// ============================================
function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
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
// Blog Card Component
// ============================================
function BlogCard({ post, featured = false }: { post: ReturnType<typeof getAllPosts>[0]; featured?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <Card className={cn(
        'h-full overflow-hidden border-0 bg-white/5 backdrop-blur-sm transition-all duration-500',
        'hover:bg-white/10 hover:scale-[1.02]',
        'relative',
        featured && 'md:col-span-2'
      )}>
        {/* Neon Glow Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl" />
        </div>

        {/* Top Gradient Border */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardContent className={cn('relative p-6', featured && 'md:p-8')}>
          {/* Category & Reading Time */}
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Tag className="w-3 h-3 mr-1" />
              {post.category}
            </Badge>
            <span className="text-xs text-white/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readingTime}분
            </span>
          </div>

          {/* Title */}
          <h2 className={cn(
            'font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300 break-keep',
            featured ? 'text-2xl md:text-3xl' : 'text-xl'
          )}>
            {post.title}
          </h2>

          {/* Description */}
          <p className={cn(
            'text-white/60 leading-relaxed break-keep',
            featured ? 'text-base md:text-lg' : 'text-sm line-clamp-2'
          )}>
            {post.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Calendar className="w-3 h-3" />
              {new Date(post.publishedAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:translate-x-1 transition-transform duration-300">
              읽어보기
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ============================================
// Page Component
// ============================================
export default function BlogPage() {
  const posts = getAllPosts();
  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-white/60 hover:text-white transition-colors flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                홈
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium text-primary"
              >
                인사이트
              </Link>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full"
              >
                <Link href="/login">
                  시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/30 to-purple-950/20" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-white/80">INFLUX 인사이트</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight break-keep">
              크리에이터를 위한
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                실전 성장 전략
              </span>
            </h1>

            <p className="text-lg text-white/60 max-w-2xl mx-auto break-keep">
              유튜브, 인스타그램, 틱톡 마케팅의 모든 것.
              10년 노하우를 가진 전문가가 알려드리는 성장 비법.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {posts.length > 0 ? (
            <div className="space-y-8">
              {/* Featured Post */}
              {featuredPost && (
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-white/60">추천 아티클</span>
                  </div>
                  <BlogCard post={featuredPost} featured />
                </div>
              )}

              {/* Other Posts */}
              {otherPosts.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-sm font-medium text-white/60">최신 아티클</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherPosts.map((post) => (
                      <BlogCard key={post.slug} post={post} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-white/40">아직 등록된 글이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 break-keep">
            이론만으로는 부족합니다
          </h2>
          <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto break-keep">
            지금 바로 INFLUX와 함께 채널 성장을 시작하세요.
            50,000+ 크리에이터가 이미 선택했습니다.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-slate-900 hover:bg-white/90 rounded-full px-8 h-14 text-lg font-bold"
          >
            <Link href="/login">
              무료로 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="md" />
            <div className="flex items-center gap-6 text-sm text-white/40">
              <Link href="/terms" className="hover:text-white/80 transition-colors">이용약관</Link>
              <Link href="/privacy" className="hover:text-white/80 transition-colors">개인정보처리방침</Link>
              <Link href="/blog" className="hover:text-white/80 transition-colors">인사이트</Link>
            </div>
            <div className="text-sm text-white/30">
              &copy; {new Date().getFullYear()} INFLUX. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
