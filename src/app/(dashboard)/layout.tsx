// ============================================
// Dashboard Layout
// 서버사이드 인증 + 사이드바 + 헤더
// ============================================

import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { ClientSidebar } from './client-sidebar';
import { MobileNav } from './mobile-nav';
import { User, Bell } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-full min-h-screen bg-background">
      {/* PC 사이드바 */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <Suspense fallback={<SidebarSkeleton />}>
          <ClientSidebar />
        </Suspense>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="md:pl-72 flex-1 h-full relative">
        {/* 상단 헤더 */}
        <header className="h-16 border-b border-border flex items-center px-4 md:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          {/* 모바일 네비게이션 */}
          <div className="md:hidden">
            <Suspense fallback={null}>
              <MobileNav />
            </Suspense>
          </div>

          {/* 모바일 로고 */}
          <span className="font-bold text-xl md:hidden bg-gradient-to-r from-[#0064FF] to-[#00C896] bg-clip-text text-transparent ml-3">
            INFLUX
          </span>

          {/* 우측 영역 */}
          <div className="ml-auto flex items-center gap-3">
            {/* 알림 */}
            <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>

            {/* 사용자 정보 */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-muted-foreground truncate max-w-[150px]">
                {user.email}
              </span>
            </div>
          </div>
        </header>

        {/* 페이지 내용 */}
        <div className="p-4 md:p-6 lg:p-8 animate-in fade-in-10 slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

// 사이드바 로딩 스켈레톤
function SidebarSkeleton() {
  return (
    <aside className="flex flex-col h-full bg-card border-r border-border animate-pulse">
      <div className="h-16 px-6 border-b border-border flex items-center">
        <div className="h-8 w-32 bg-muted rounded" />
      </div>
      <div className="flex-1 p-4 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="p-4">
        <div className="h-40 bg-muted rounded-2xl" />
      </div>
    </aside>
  );
}
