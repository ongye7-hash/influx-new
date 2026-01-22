'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, formatCurrency } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  History,
  Settings,
  LogOut,
  CreditCard,
  Crown,
  TrendingUp,
  ChevronRight,
  Loader2,
  Receipt,
  Headphones,
  Shield,
  Layers,
  Gift,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

// 메인 네비게이션
const routes = [
  { label: '대시보드', icon: LayoutDashboard, href: '/dashboard' },
  { label: '새 주문', icon: ShoppingCart, href: '/order' },
  { label: '대량 주문', icon: Layers, href: '/mass-order' },
  { label: '주문내역', icon: History, href: '/orders' },
  { label: '포인트 충전', icon: CreditCard, href: '/deposit' },
  { label: '잔액 내역', icon: Receipt, href: '/transactions' },
  { label: '친구 추천', icon: Gift, href: '/referral' },
  { label: '고객센터', icon: Headphones, href: '/support' },
  { label: '설정', icon: Settings, href: '/settings' },
];

// 관리자 네비게이션
const adminRoutes = [
  { label: '관리자', icon: Shield, href: '/admin' },
];

// 티어 설정
const tierConfig = {
  basic: { label: '일반', color: 'text-muted-foreground', bg: 'bg-muted' },
  vip: { label: 'VIP', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  premium: { label: '프리미엄', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  enterprise: { label: '엔터프라이즈', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
};

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const balance = profile?.balance || 0;
  const tier = tierConfig[profile?.tier as keyof typeof tierConfig] || tierConfig.basic;
  const isAdmin = profile?.is_admin === true;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    toast.success('로그아웃 중...');
    await signOut();
  };

  return (
    <aside className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo & Theme Toggle */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-border">
        <Logo size="md" linkTo="/dashboard" />
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {/* 처음 오신 분들을 위한 가이드 - 특별 탭 */}
        <Link
          href="/guide"
          className={cn(
            "flex items-center gap-3 px-4 py-4 rounded-xl text-base font-bold transition-all duration-200 mb-3",
            "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20",
            "hover:from-blue-500/20 hover:to-purple-500/20 hover:border-blue-500/30",
            pathname === "/guide"
              ? "from-blue-500/20 to-purple-500/20 border-blue-500/40 text-blue-600 dark:text-blue-400"
              : "text-blue-600 dark:text-blue-400"
          )}
        >
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="flex items-center gap-2">
            처음 오신 분들을 위한 가이드
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </span>
        </Link>

        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <route.icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
              {route.label}
              {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          );
        })}

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <Separator className="my-4" />
            {adminRoutes.map((route) => {
              const isActive = pathname.startsWith(route.href);
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <route.icon className="h-5 w-5" />
                  {route.label}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Balance Card */}
      <div className="p-4">
        <div className="glass-balance text-white rounded-2xl p-5 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-4 border-white" />
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full border-4 border-white" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                <span className="text-sm font-medium text-white/80">내 잔액</span>
              </div>
              <div className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", tier.bg, tier.color)}>
                <div className="flex items-center gap-1">
                  {profile?.tier === "vip" && <Crown className="h-3 w-3" />}
                  {tier.label}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-bold">
                {formatCurrency(balance)}
              </div>
              <div className="flex items-center gap-1 text-white/60 text-sm mt-1">
                <TrendingUp className="h-4 w-4" />
                충전하고 서비스 이용하기
              </div>
            </div>

            <Button
              asChild
              variant="secondary"
              className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <Link href="/deposit">
                <CreditCard className="mr-2 h-4 w-4" />
                충전하기
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">
              {profile?.email?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.email || "user@example.com"}</p>
            <p className="text-xs text-muted-foreground">{tier.label} 회원</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
