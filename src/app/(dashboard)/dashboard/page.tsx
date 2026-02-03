"use client";

import { useMemo, useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaTelegram, FaTwitter } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

// 아이콘 매핑
const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: FaInstagram,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  facebook: FaFacebook,
  telegram: FaTelegram,
  twitter: FaTwitter,
};

// 플랫폼 색상 매핑
const PLATFORM_GRADIENT: Record<string, string> = {
  instagram: "from-[#E1306C] to-[#F77737]",
  youtube: "from-red-500 to-orange-500",
  tiktok: "from-gray-900 to-gray-700",
  facebook: "from-blue-600 to-blue-700",
  telegram: "from-sky-500 to-blue-500",
  twitter: "from-sky-400 to-sky-500",
};

const statusColors: Record<string, string> = {
  completed: "badge-success",
  processing: "badge-info",
  in_progress: "badge-warning",
  pending: "badge-warning",
  canceled: "badge-error",
};

const statusLabels: Record<string, string> = {
  completed: "완료",
  processing: "처리중",
  in_progress: "진행중",
  pending: "대기",
  canceled: "취소",
};

interface PopularService {
  id: string;
  name: string;
  price: number;
  platform: string;
  icon: React.ElementType;
  color: string;
}

// 월 시작/끝 날짜 유틸
function getMonthRange(offset: number = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

// 변화율 계산
function calcChange(current: number, previous: number): { label: string; trend: "up" | "down" | "neutral" } {
  if (previous === 0 && current === 0) return { label: "-", trend: "neutral" };
  if (previous === 0) return { label: `+${current}`, trend: "up" };
  const pct = ((current - previous) / previous) * 100;
  if (pct === 0) return { label: "0%", trend: "neutral" };
  const sign = pct > 0 ? "+" : "";
  return {
    label: `${sign}${pct.toFixed(0)}%`,
    trend: pct > 0 ? "up" : "down",
  };
}

interface MonthlyStats {
  thisMonthOrders: number;
  lastMonthOrders: number;
  thisMonthSpent: number;
  lastMonthSpent: number;
  processingCount: number;
  completedCount: number;
  totalCount: number;
  lastMonthCompletedRate: number;
}

export default function DashboardPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { data: orders = [], isLoading: ordersLoading } = useOrders({ limit: 5 });
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // 월별 통계 조회 (이번 달 + 지난 달)
  useEffect(() => {
    const fetchMonthlyStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const thisMonth = getMonthRange(0);
        const lastMonth = getMonthRange(-1);

        // 이번 달 주문
        const { data: thisData } = await supabase
          .from('orders')
          .select('status, amount')
          .gte('created_at', thisMonth.start)
          .lte('created_at', thisMonth.end);

        // 지난 달 주문
        const { data: lastData } = await supabase
          .from('orders')
          .select('status, amount')
          .gte('created_at', lastMonth.start)
          .lte('created_at', lastMonth.end);

        const thisOrders = (thisData || []) as { status: string; amount: number }[];
        const lastOrders = (lastData || []) as { status: string; amount: number }[];

        const lastCompleted = lastOrders.filter(o => o.status === 'completed').length;

        setMonthlyStats({
          thisMonthOrders: thisOrders.length,
          lastMonthOrders: lastOrders.length,
          thisMonthSpent: thisOrders.reduce((s, o) => s + (Number(o.amount) || 0), 0),
          lastMonthSpent: lastOrders.reduce((s, o) => s + (Number(o.amount) || 0), 0),
          processingCount: thisOrders.filter(o =>
            o.status === 'processing' || o.status === 'in_progress' || o.status === 'pending'
          ).length,
          completedCount: thisOrders.filter(o => o.status === 'completed').length,
          totalCount: thisOrders.length,
          lastMonthCompletedRate: lastOrders.length > 0
            ? (lastCompleted / lastOrders.length) * 100
            : 0,
        });
      } catch (error) {
        console.error('Error fetching monthly stats:', error);
        setStatsError('통계 데이터를 불러올 수 없습니다');
        // 기본값으로 초기화하여 UI가 깨지지 않도록
        setMonthlyStats({
          thisMonthOrders: 0,
          lastMonthOrders: 0,
          thisMonthSpent: 0,
          lastMonthSpent: 0,
          processingCount: 0,
          completedCount: 0,
          totalCount: 0,
          lastMonthCompletedRate: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchMonthlyStats();
  }, []);

  // 인기 서비스 조회 (admin_products 사용)
  useEffect(() => {
    const fetchPopularProducts = async () => {
      setProductsLoading(true);
      try {
        const mainPlatforms = ['instagram', 'youtube', 'tiktok', 'facebook'];
        const results: PopularService[] = [];

        for (const platform of mainPlatforms) {
          const { data } = await (supabase as any)
            .from('admin_products')
            .select('id, name, price_per_1000, category:admin_categories(platform)')
            .eq('is_active', true)
            .order('price_per_1000', { ascending: true })
            .limit(100);

          if (data) {
            const platformProduct = data.find((p: any) =>
              p.category?.platform?.toLowerCase() === platform
            );
            if (platformProduct) {
              results.push({
                id: platformProduct.id,
                name: platformProduct.name,
                price: platformProduct.price_per_1000,
                platform,
                icon: PLATFORM_ICONS[platform] || FaInstagram,
                color: PLATFORM_GRADIENT[platform] || "from-gray-500 to-gray-600",
              });
            }
          }
        }

        setPopularServices(results);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  // 통계 계산 (실제 전월 대비)
  const stats = useMemo(() => {
    if (!monthlyStats) return [];

    const {
      thisMonthOrders, lastMonthOrders,
      thisMonthSpent, lastMonthSpent,
      processingCount, completedCount, totalCount,
      lastMonthCompletedRate,
    } = monthlyStats;

    const completionRate = totalCount > 0
      ? (completedCount / totalCount) * 100
      : 0;

    const orderChange = calcChange(thisMonthOrders, lastMonthOrders);
    const spentChange = calcChange(thisMonthSpent, lastMonthSpent);
    const rateChange = calcChange(
      Math.round(completionRate),
      Math.round(lastMonthCompletedRate)
    );

    return [
      {
        title: "이번 달 주문",
        value: thisMonthOrders,
        change: orderChange.label,
        trend: orderChange.trend,
        subtitle: `지난 달 ${lastMonthOrders}건`,
        icon: ShoppingCart,
        color: "text-white",
        bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      },
      {
        title: "이번 달 지출",
        value: thisMonthSpent,
        change: spentChange.label,
        trend: spentChange.trend,
        subtitle: `지난 달 ${formatCurrency(lastMonthSpent)}`,
        icon: DollarSign,
        color: "text-white",
        bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
        isCurrency: true,
      },
      {
        title: "진행중 주문",
        value: processingCount,
        change: `${processingCount}건 대기`,
        trend: processingCount > 0 ? "down" as const : "neutral" as const,
        subtitle: "현재 처리 중",
        icon: Clock,
        color: "text-white",
        bg: "bg-gradient-to-br from-amber-500 to-orange-500",
      },
      {
        title: "완료율",
        value: `${completionRate.toFixed(1)}%`,
        change: rateChange.label,
        trend: rateChange.trend,
        subtitle: `${completedCount}/${totalCount}건 완료`,
        icon: TrendingUp,
        color: "text-white",
        bg: "bg-gradient-to-br from-[#00C896] to-emerald-500",
      },
    ];
  }, [monthlyStats]);

  const isLoading = authLoading || productsLoading || ordersLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Skeleton className="lg:col-span-2 h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground mt-1">
            안녕하세요{profile?.username ? `, ${profile.username}님` : ''}! 오늘도 성공적인 마케팅 되세요.
          </p>
        </div>
        <Button asChild className="btn-gradient">
          <Link href="/order">
            <ShoppingCart className="mr-2 h-4 w-4" />
            새 주문하기
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      {statsError && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-400 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {statsError} - 새로고침을 시도해주세요.
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-interactive">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl shadow-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} strokeWidth={2.5} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-emerald-400" : stat.trend === "down" ? "text-red-400" : "text-muted-foreground"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : stat.trend === "down" ? (
                    <ArrowDownRight className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-lg sm:text-2xl font-bold mt-1 font-mono">
                  {stat.isCurrency
                    ? formatCurrency(stat.value as number)
                    : stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>최근 주문</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/orders">전체보기</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>아직 주문 내역이 없습니다</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/order">첫 주문하기</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => {
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">
                            주문 #{order.order_number?.slice(-6) || order.id.slice(0, 6)}
                          </p>
                          <Badge
                            variant="outline"
                            className={statusColors[order.status]}
                          >
                            {statusLabels[order.status]}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span className="truncate max-w-[120px] sm:max-w-[200px]">{order.link}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{formatNumber(order.quantity)}개</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-xs sm:text-sm">{formatRelativeTime(order.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold">{formatCurrency(Number(order.amount))}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle>인기 서비스</CardTitle>
          </CardHeader>
          <CardContent>
            {popularServices.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin opacity-30" />
                <p>서비스를 불러오는 중...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {popularServices.map((service) => service && (
                  <Link
                    key={service.id}
                    href="/order"
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors group"
                  >
                    <div
                      className={`p-2.5 rounded-xl bg-gradient-to-br ${service.color} text-white`}
                    >
                      <service.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium group-hover:text-primary transition-colors truncate">
                        {service.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        1,000개당
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {formatCurrency(service.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Button className="w-full mt-4" variant="outline" asChild>
              <Link href="/order">모든 서비스 보기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Announcement Banner */}
      <Card className="bg-[#0064FF]/5 border-[#0064FF]/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {profile?.balance
                    ? `현재 잔액: ${formatCurrency(Number(profile.balance))}`
                    : 'VIP 등급 달성까지 50,000원!'
                  }
                </h3>
                <p className="text-sm text-muted-foreground">
                  충전하고 더 많은 서비스를 이용해보세요.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/deposit">지금 충전하기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
