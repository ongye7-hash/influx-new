// ============================================
// 주문하기 페이지
// 카테고리 탭 -> 서비스 선택 -> 링크/수량 입력
// DB 연동 버전
// ============================================

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ShoppingCart,
  Search,
  Link as LinkIcon,
  Calculator,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Users,
  Play,
  Heart,
  Eye,
  MessageCircle,
  ThumbsUp,
  MessageSquare,
  AtSign,
  RefreshCw,
  Star,
  TrendingUp,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useServices, CATEGORY_COLORS } from '@/hooks/use-services';
import { orderKeys } from '@/hooks/use-orders';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatCompactNumber, cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================
// 아이콘 매핑
// ============================================
const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  Play,
  Heart,
  Eye,
  MessageCircle,
  ThumbsUp,
  MessageSquare,
  AtSign,
  Sparkles,
  TrendingUp,
  MoreHorizontal,
};

function getCategoryIcon(slug: string | null): React.ElementType {
  if (!slug) return Sparkles;
  const iconName = {
    all: 'Sparkles',
    instagram: 'Users',
    youtube: 'Play',
    tiktok: 'Heart',
    twitter: 'Eye',
    telegram: 'MessageCircle',
    facebook: 'ThumbsUp',
    discord: 'MessageSquare',
    threads: 'AtSign',
    twitch: 'Play',
    coinmarketcap: 'TrendingUp',
    other: 'MoreHorizontal',
  }[slug.toLowerCase()] || 'Sparkles';
  return ICON_MAP[iconName] || Sparkles;
}

function getCategoryColor(slug: string | null): string {
  if (!slug) return CATEGORY_COLORS.default;
  return CATEGORY_COLORS[slug.toLowerCase()] || CATEGORY_COLORS.default;
}

// ============================================
// 주문하기 페이지 컴포넌트
// ============================================
export default function OrderPage() {
  const queryClient = useQueryClient();
  const { profile, refreshProfile, isLoading: authLoading } = useAuth();
  const { services, categories, isLoading: servicesLoading, error: servicesError, refetch } = useServices();
  const isPageLoading = authLoading || servicesLoading;
  const balance = Number(profile?.balance) || 0;

  // 즐겨찾기 상태 (localStorage)
  const [favorites, setFavorites] = useState<string[]>([]);

  // 즐겨찾기 로드
  useEffect(() => {
    const saved = localStorage.getItem('influx_favorite_services');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  // 즐겨찾기 토글
  const toggleFavorite = useCallback((serviceId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev => {
      const newFavorites = prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      localStorage.setItem('influx_favorite_services', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // 즐겨찾기 서비스 목록
  const favoriteServices = useMemo(() =>
    services.filter(s => favorites.includes(s.id)),
    [services, favorites]
  );

  // 상태
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 첫 번째 카테고리 자동 선택
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // 재주문 데이터 처리
  useEffect(() => {
    const reorderData = localStorage.getItem('influx_reorder');
    if (reorderData && services.length > 0) {
      try {
        const { serviceId, link: reorderLink, quantity: reorderQty } = JSON.parse(reorderData);
        const service = services.find(s => s.id === serviceId);
        if (service) {
          if (service.category_id) {
            setSelectedCategoryId(service.category_id);
          }
          setSelectedServiceId(serviceId);
          setLink(reorderLink || '');
          setQuantity(reorderQty || service.min_quantity);
        }
        localStorage.removeItem('influx_reorder');
      } catch {
        localStorage.removeItem('influx_reorder');
      }
    }
  }, [services]);

  // 현재 카테고리의 서비스 목록
  const categoryServices = useMemo(() =>
    services.filter(s => s.category_id === selectedCategoryId),
    [services, selectedCategoryId]
  );

  // 검색 필터링된 서비스
  const filteredServices = useMemo(() => {
    if (!searchQuery) return categoryServices;
    return categoryServices.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categoryServices, searchQuery]);

  // 선택된 서비스
  const selectedService = useMemo(() =>
    services.find(s => s.id === selectedServiceId),
    [services, selectedServiceId]
  );

  // 예상 금액 계산 (실시간)
  const estimatedPrice = useMemo(() => {
    if (!selectedService || quantity <= 0) return 0;
    // price는 1000개당 가격
    return Math.ceil((selectedService.price / 1000) * quantity);
  }, [selectedService, quantity]);

  // 유효성 검사
  const isValidOrder = useMemo(() => {
    if (!selectedService) return false;
    if (!link.trim()) return false;
    if (quantity < selectedService.min_quantity || quantity > selectedService.max_quantity) return false;
    if (estimatedPrice > balance) return false;
    return true;
  }, [selectedService, link, quantity, estimatedPrice, balance]);

  // 카테고리 변경 시 서비스 초기화
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedServiceId('');
    setQuantity(0);
    setSearchQuery('');
  }, []);

  // 서비스 변경 시 수량 초기화
  const handleServiceChange = useCallback((serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setQuantity(service.min_quantity);
    }
  }, [services]);

  // 주문 제출 - process_order RPC 사용 (원자성 보장)
  const handleSubmit = async () => {
    if (!isValidOrder || isSubmitting || !profile || !selectedService) return;

    setIsSubmitting(true);

    try {
      // RPC 함수 호출 - 잔액 차감 + 주문 생성 + 트랜잭션 기록을 원자적으로 처리
      // 보안: 가격은 서버에서 직접 계산 (p_amount 제거됨)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.rpc as any)('process_order', {
        p_user_id: profile.id,
        p_service_id: selectedService.id,
        p_link: link.trim(),
        p_quantity: quantity,
      });

      if (error) {
        // 에러 메시지 한글화
        if (error.message.includes('Insufficient balance')) {
          toast.error('잔액이 부족합니다.', {
            description: '충전 후 다시 시도해주세요.',
          });
        } else {
          toast.error('주문 처리 중 오류가 발생했습니다.', {
            description: error.message,
          });
        }
        return;
      }

      toast.success('주문이 성공적으로 완료되었습니다!', {
        description: `${selectedService.name} ${formatCompactNumber(quantity)}개`,
      });

      // 🎉 Dopamine UX: Confetti Effect
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
        zIndex: 9999,
      });

      // 프로필 새로고침 (잔액 업데이트)
      await refreshProfile();

      // 주문 내역 캐시 무효화
      queryClient.invalidateQueries({ queryKey: orderKeys.all });

      // 폼 초기화
      setLink('');
      setQuantity(selectedService.min_quantity);
      setShowConfirmDialog(false);
    } catch (err) {
      console.error('Order error:', err);
      toast.error('주문 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 상태
  if (isPageLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-12 w-full mb-6" />
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div>
            <Skeleton className="h-[500px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (servicesError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-xl font-semibold">서비스를 불러올 수 없습니다</h2>
        <p className="text-muted-foreground">{servicesError}</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          다시 시도
        </Button>
      </div>
    );
  }

  // 서비스가 없는 경우
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <ShoppingCart className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">등록된 서비스가 없습니다</h2>
        <p className="text-muted-foreground">관리자에게 문의해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">새 주문</h1>
          <p className="text-muted-foreground mt-1">
            원하는 서비스를 선택하고 주문하세요
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10">
          <span className="text-sm text-muted-foreground">보유 잔액</span>
          <span className="font-bold text-primary">{formatCurrency(balance)}</span>
        </div>
      </div>

      {/* 즐겨찾기 서비스 (빠른 선택) */}
      {favoriteServices.length > 0 && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              즐겨찾기 서비스
              <Badge variant="secondary" className="ml-2">{favoriteServices.length}</Badge>
            </CardTitle>
            <CardDescription>자주 사용하는 서비스를 빠르게 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {favoriteServices.map((service) => {
                const category = categories.find(c => c.id === service.category_id);
                const IconComponent = getCategoryIcon(category?.slug || null);
                const colorClass = getCategoryColor(category?.slug || null);
                return (
                  <Button
                    key={service.id}
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 px-3 flex items-center gap-2 hover:bg-primary/5 group"
                    onClick={() => {
                      if (service.category_id) {
                        setSelectedCategoryId(service.category_id);
                      }
                      handleServiceChange(service.id);
                    }}
                  >
                    <div className={cn(
                      'h-5 w-5 rounded flex items-center justify-center text-white bg-gradient-to-br',
                      colorClass
                    )}>
                      <IconComponent className="h-3 w-3" />
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-xs block">{service.name}</span>
                      <span className="text-xs text-muted-foreground">{formatCurrency(service.price)}/1K</span>
                    </div>
                    <button
                      onClick={(e) => toggleFavorite(service.id, e)}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 hover:fill-yellow-500" />
                    </button>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 카테고리 & 서비스 선택 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 카테고리 탭 */}
          <Tabs value={selectedCategoryId} onValueChange={handleCategoryChange}>
            <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/50 p-1">
              {categories.map((category) => {
                const IconComponent = getCategoryIcon(category.slug);
                const colorClass = getCategoryColor(category.slug);
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <div className={cn(
                      'h-6 w-6 rounded-md flex items-center justify-center text-white bg-gradient-to-br',
                      colorClass
                    )}>
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.slug);
              const colorClass = getCategoryColor(category.slug);
              const catServices = services.filter(s => s.category_id === category.id);

              return (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className={cn(
                          'h-8 w-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br',
                          colorClass
                        )}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        {category.name} 서비스
                      </CardTitle>
                      <CardDescription>
                        {catServices.length}개의 서비스 중 원하는 서비스를 선택하세요
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 서비스 검색 & 선택 */}
                      <div className="space-y-2">
                        <Label>서비스 선택</Label>
                        <Select value={selectedServiceId} onValueChange={handleServiceChange}>
                          <SelectTrigger className="w-full h-12">
                            <SelectValue placeholder="서비스를 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="서비스 검색..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="pl-8 h-9"
                                />
                              </div>
                            </div>
                            <SelectGroup>
                              <SelectLabel>{category.name}</SelectLabel>
                              {filteredServices.map((service) => (
                                <SelectItem
                                  key={service.id}
                                  value={service.id}
                                  className="py-3"
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    <button
                                      onClick={(e) => toggleFavorite(service.id, e)}
                                      className="shrink-0 hover:scale-110 transition-transform"
                                    >
                                      <Star
                                        className={cn(
                                          "h-4 w-4 transition-colors",
                                          favorites.includes(service.id)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-muted-foreground/40 hover:text-yellow-400"
                                        )}
                                      />
                                    </button>
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <span className="font-medium truncate">{service.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatCurrency(service.price)}/1K · {service.average_time || '0-1시간'}
                                        {service.is_refill && ' · 리필보장'}
                                      </span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                              {filteredServices.length === 0 && (
                                <div className="py-6 text-center text-muted-foreground">
                                  검색 결과가 없습니다
                                </div>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 선택된 서비스 정보 */}
                      {selectedService && selectedService.category_id === category.id && (
                        <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <button
                                onClick={(e) => {
                                  toggleFavorite(selectedService.id, e);
                                  toast.success(
                                    favorites.includes(selectedService.id)
                                      ? '즐겨찾기에서 제거되었습니다'
                                      : '즐겨찾기에 추가되었습니다',
                                    { duration: 2000 }
                                  );
                                }}
                                className="mt-0.5 hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={cn(
                                    "h-5 w-5 transition-colors",
                                    favorites.includes(selectedService.id)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground hover:text-yellow-400"
                                  )}
                                />
                              </button>
                              <div>
                                <h4 className="font-semibold">{selectedService.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {selectedService.description || '고품질 서비스'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedService.is_refill && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  리필보장
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">단가:</span>
                              <span className="ml-1 font-medium">{formatCurrency(selectedService.price)}/1K</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">최소:</span>
                              <span className="ml-1 font-medium">{formatCompactNumber(selectedService.min_quantity)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">최대:</span>
                              <span className="ml-1 font-medium">{formatCompactNumber(selectedService.max_quantity)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">소요시간:</span>
                              <span className="ml-1 font-medium">{selectedService.average_time || '0-1시간'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>

        {/* 오른쪽: 주문서 */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  주문서
                </CardTitle>
                <CardDescription>
                  {selectedService ? selectedService.name : '서비스를 선택하세요'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {selectedService ? (
                  <>
                    {/* 링크 입력 */}
                    <div className="space-y-2">
                      <Label htmlFor="link" className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        링크
                      </Label>
                      <Input
                        id="link"
                        type="url"
                        placeholder="https://instagram.com/username"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="h-12"
                      />
                    </div>

                    {/* 수량 입력 */}
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        수량
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="quantity"
                          type="number"
                          min={selectedService.min_quantity}
                          max={selectedService.max_quantity}
                          value={quantity || ''}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                          className="h-12 flex-1"
                          placeholder={`${formatCompactNumber(selectedService.min_quantity)} ~ ${formatCompactNumber(selectedService.max_quantity)}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-12 px-3"
                          onClick={() => setQuantity(selectedService.min_quantity)}
                        >
                          최소
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-12 px-3"
                          onClick={() => setQuantity(selectedService.max_quantity)}
                        >
                          최대
                        </Button>
                      </div>
                      {quantity > 0 && (quantity < selectedService.min_quantity || quantity > selectedService.max_quantity) && (
                        <p className="text-xs text-destructive">
                          수량은 {formatCompactNumber(selectedService.min_quantity)} ~ {formatCompactNumber(selectedService.max_quantity)} 사이여야 합니다
                        </p>
                      )}
                    </div>

                    {/* 예상 금액 (핵심!) */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          예상 금액
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(estimatedPrice)}
                        </span>
                      </div>
                      {estimatedPrice > balance && (
                        <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          잔액이 부족합니다. 충전이 필요합니다.
                        </p>
                      )}
                    </div>

                    {/* 결제 후 잔액 */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">결제 후 잔액</span>
                      <span className={cn(
                        'font-medium',
                        estimatedPrice > balance && 'text-destructive'
                      )}>
                        {formatCurrency(Math.max(0, balance - estimatedPrice))}
                      </span>
                    </div>

                    {/* 주문하기 버튼 */}
                    <Button
                      onClick={() => setShowConfirmDialog(true)}
                      disabled={!isValidOrder || isSubmitting}
                      className="w-full h-14 text-lg btn-gradient"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          주문 처리 중...
                        </>
                      ) : !isValidOrder ? (
                        estimatedPrice > balance ? (
                          '잔액 부족'
                        ) : (
                          '정보를 입력하세요'
                        )
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          {formatCurrency(estimatedPrice)} 주문하기
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      왼쪽에서 카테고리와<br />서비스를 선택하세요
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 주문 확인 다이얼로그 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              주문 확인
            </DialogTitle>
            <DialogDescription>
              아래 내용으로 주문하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">서비스</span>
                  <span className="font-medium text-right max-w-[200px]">
                    {selectedService.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">링크</span>
                  <span className="font-medium truncate max-w-[200px]">{link}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">수량</span>
                  <span className="font-medium">{formatCompactNumber(quantity)}개</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">결제 금액</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(estimatedPrice)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-gradient min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                '주문 확정'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
