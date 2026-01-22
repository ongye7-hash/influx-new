"use client";

import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Users,
  Heart,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import Link from "next/link";

// Mock 데이터
const stats = [
  {
    title: "이번 달 주문",
    value: 47,
    change: "+12%",
    trend: "up",
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "총 지출",
    value: 1250000,
    change: "+8%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-100",
    isCurrency: true,
  },
  {
    title: "진행중 주문",
    value: 3,
    change: "-2",
    trend: "down",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  {
    title: "완료율",
    value: "98.5%",
    change: "+0.5%",
    trend: "up",
    icon: TrendingUp,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
];

const recentOrders = [
  {
    id: "INF-20260117-A1B2C3",
    service: "Instagram 팔로워 (고품질)",
    quantity: 1000,
    status: "completed",
    charge: 15000,
    createdAt: "10분 전",
  },
  {
    id: "INF-20260117-D4E5F6",
    service: "YouTube 조회수 (실시간)",
    quantity: 5000,
    status: "processing",
    charge: 25000,
    createdAt: "1시간 전",
  },
  {
    id: "INF-20260116-G7H8I9",
    service: "TikTok 좋아요",
    quantity: 2000,
    status: "in_progress",
    charge: 8000,
    createdAt: "3시간 전",
  },
];

const popularServices = [
  {
    name: "Instagram 팔로워",
    icon: Users,
    price: 15,
    unit: "1,000개당",
    color: "from-pink-500 to-purple-500",
  },
  {
    name: "YouTube 조회수",
    icon: Play,
    price: 5,
    unit: "1,000회당",
    color: "from-red-500 to-orange-500",
  },
  {
    name: "TikTok 좋아요",
    icon: Heart,
    price: 4,
    unit: "1,000개당",
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "YouTube 시청시간",
    icon: Eye,
    price: 50,
    unit: "1,000시간당",
    color: "from-green-500 to-emerald-500",
  },
];

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

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground mt-1">
            안녕하세요! 오늘도 성공적인 마케팅 되세요.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-interactive">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">
                  {stat.isCurrency
                    ? formatCurrency(stat.value as number)
                    : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>최근 주문</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/orders">전체보기</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{order.service}</p>
                      <Badge
                        variant="outline"
                        className={statusColors[order.status]}
                      >
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{order.id}</span>
                      <span>•</span>
                      <span>{formatNumber(order.quantity)}개</span>
                      <span>•</span>
                      <span>{order.createdAt}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold">{formatCurrency(order.charge)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle>인기 서비스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularServices.map((service) => (
                <Link
                  key={service.name}
                  href="/order"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors group"
                >
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${service.color} text-white`}
                  >
                    <service.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {service.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {service.unit}
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
            <Button className="w-full mt-4" variant="outline" asChild>
              <Link href="/order">모든 서비스 보기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Announcement Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">VIP 등급 달성까지 50,000원!</h3>
                <p className="text-sm text-muted-foreground">
                  VIP 등급이 되면 모든 서비스 5% 할인 혜택을 받으실 수 있습니다.
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
