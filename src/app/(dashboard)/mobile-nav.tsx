'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  LayoutDashboard,
  ShoppingCart,
  History,
  CreditCard,
  Settings,
  LogOut,
  Wallet,
  Crown,
  Zap,
  Loader2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  { name: '새 주문', href: '/order', icon: ShoppingCart },
  { name: '주문 내역', href: '/orders', icon: History },
  { name: '충전하기', href: '/deposit', icon: CreditCard },
];

const adminNavigation = [
  { name: '관리자', href: '/admin', icon: Settings },
];

const tierConfig = {
  basic: { label: '일반', color: 'text-muted-foreground', bg: 'bg-muted' },
  vip: { label: 'VIP', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  premium: { label: '프리미엄', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  enterprise: { label: '엔터프라이즈', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
};

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { profile, signOut } = useAuth();

  const tier = tierConfig[profile?.tier as keyof typeof tierConfig] || tierConfig.basic;
  const isAdmin = profile?.is_admin === true;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setOpen(false);
    toast.success('로그아웃 중...');
    await signOut();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
              <Zap className="w-7 h-7 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                INFLUX
              </span>
            </Link>
          </div>

          {/* Balance Card */}
          <div className="p-4">
            <div className="glass-balance text-white rounded-2xl p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm text-white/80">내 잔액</span>
                </div>
                <div className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", tier.bg, tier.color)}>
                  <div className="flex items-center gap-1">
                    {profile?.tier === "vip" && <Crown className="h-3 w-3" />}
                    {tier.label}
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(profile?.balance || 0)}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 overflow-y-auto">
            {/* 처음 오신 분들을 위한 가이드 - 특별 탭 */}
            <Link
              href="/guide"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-4 rounded-xl text-base font-bold transition-all duration-200 mb-3",
                "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20",
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

            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 mb-1",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            {/* Admin Navigation */}
            {isAdmin && (
              <>
                <Separator className="my-3" />
                {adminNavigation.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 mb-1",
                        isActive
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">
                  {profile?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{profile?.email || "user@example.com"}</p>
                <p className="text-sm text-muted-foreground">{tier.label} 회원</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              로그아웃
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
