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
  RefreshCw,
  Star,
  MoreHorizontal,
  Layers,
  Shield,
  Zap,
  Clock,
  Award,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import {
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaFacebook,
  FaTelegram,
  FaTwitter,
  FaTwitch,
  FaDiscord,
  FaBitcoin,
} from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
// Tabs 컴포넌트 미사용 - 플랫폼 탭으로 대체됨
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
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useServices, CATEGORY_COLORS } from '@/hooks/use-services';
import { orderKeys } from '@/hooks/use-orders';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatCompactNumber, cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================
// 고정 플랫폼 탭 정의
// ============================================
const PLATFORM_TABS = [
  { id: 'all', name: '전체보기', icon: Layers, color: 'from-slate-500 to-slate-600' },
  { id: 'favorites', name: '즐겨찾기', icon: Star, color: 'from-yellow-400 to-orange-500' },
  { id: 'instagram', name: '인스타그램', icon: FaInstagram, color: 'from-pink-500 to-purple-500' },
  { id: 'tiktok', name: '틱톡', icon: FaTiktok, color: 'from-gray-900 to-gray-700' },
  { id: 'youtube', name: '유튜브', icon: FaYoutube, color: 'from-red-500 to-red-600' },
  { id: 'facebook', name: '페이스북', icon: FaFacebook, color: 'from-blue-600 to-blue-700' },
  { id: 'twitter', name: '트위터', icon: FaTwitter, color: 'from-sky-400 to-sky-500' },
  { id: 'telegram', name: '텔레그램', icon: FaTelegram, color: 'from-sky-500 to-blue-500' },
  { id: 'twitch', name: '트위치', icon: FaTwitch, color: 'from-purple-500 to-purple-600' },
  { id: 'coinmarketcap', name: '코인마켓캡', icon: FaBitcoin, color: 'from-amber-500 to-yellow-500' },
  { id: 'other', name: '이 외 플랫폼', icon: MoreHorizontal, color: 'from-gray-500 to-gray-600' },
] as const;

// 주요 플랫폼 슬러그 (이 외 플랫폼 필터링용)
const MAIN_PLATFORM_SLUGS = ['instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'telegram', 'twitch', 'coinmarketcap'];

// ============================================
// 서비스 유형 정의 (2차 필터)
// ============================================
const SERVICE_TYPES = [
  { id: 'all', name: '전체', keywords: [] },
  { id: 'followers', name: '팔로워', keywords: ['팔로워', 'follower', 'followers'] },
  { id: 'likes', name: '좋아요', keywords: ['좋아요', 'like', 'likes', 'heart'] },
  { id: 'views', name: '조회수', keywords: ['조회수', 'view', 'views', 'watch'] },
  { id: 'subscribers', name: '구독자', keywords: ['구독자', 'subscriber', 'subscribers', 'subs'] },
  { id: 'comments', name: '댓글', keywords: ['댓글', 'comment', 'comments'] },
  { id: 'shares', name: '공유/리트윗', keywords: ['공유', 'share', 'shares', '리트윗', 'retweet', 'repost'] },
  { id: 'members', name: '그룹멤버', keywords: ['멤버', 'member', 'members', 'group'] },
  { id: 'saves', name: '저장', keywords: ['저장', 'save', 'saves', 'bookmark'] },
  { id: 'impressions', name: '노출', keywords: ['노출', 'impression', 'impressions', 'reach'] },
  { id: 'other', name: '기타', keywords: [] },
] as const;

function getServiceType(serviceName: string): string {
  const nameLower = serviceName.toLowerCase();
  for (const type of SERVICE_TYPES) {
    if (type.id === 'all' || type.id === 'other') continue;
    if (type.keywords.some(kw => nameLower.includes(kw))) {
      return type.id;
    }
  }
  return 'other';
}

// ============================================
// 서비스 정보 파싱 및 한국어화
// YTReseller 원본 name 형식: "TikTok Views [ Max Unlimited ] | Cancel Enable | No Refill ⚠️ | Instant Start | Day 10M 🚀"
// ============================================
interface ParsedServiceInfo {
  serviceType: string;        // 서비스 유형 (팔로워, 좋아요 등)
  quality: string;            // 품질 등급
  qualityBadge: 'premium' | 'high' | 'standard';
  region: string | null;      // 지역 (한국, 글로벌)
  startTime: string;          // 시작 시간
  dailySpeed: string;         // 일일 처리량
  maxQuantity: string;        // 최대 수량
  hasRefill: boolean;         // 리필 보장
  refillPeriod: string;       // 리필 기간 텍스트
  canCancel: boolean;         // 취소 가능 여부
  dropRate: string;           // 드롭률
  features: string[];         // 주요 특징
  warnings: string[];         // 주의사항
  originalDesc: string;       // 원본 설명 (디버깅용)
}

function parseServiceInfo(service: { name: string; description?: string | null; refill_days?: number; average_time?: string | null; max_quantity?: number }): ParsedServiceInfo {
  const name = service.name.toLowerCase();
  const desc = service.description || '';
  const descLower = desc.toLowerCase();

  // 서비스 유형 파싱
  let serviceType = '서비스';
  if (name.includes('팔로워') || descLower.includes('follower')) serviceType = '팔로워';
  else if (name.includes('좋아요') || descLower.includes('like')) serviceType = '좋아요';
  else if (name.includes('조회수') || descLower.includes('view')) serviceType = '조회수';
  else if (name.includes('구독자') || descLower.includes('subscriber')) serviceType = '구독자';
  else if (name.includes('댓글') || descLower.includes('comment')) serviceType = '댓글';
  else if (name.includes('리트윗') || descLower.includes('retweet')) serviceType = '리트윗';
  else if (name.includes('멤버') || descLower.includes('member')) serviceType = '그룹 멤버';
  else if (name.includes('노출') || descLower.includes('impression')) serviceType = '노출';
  else if (name.includes('공유') || descLower.includes('share')) serviceType = '공유';
  else if (name.includes('저장') || descLower.includes('save')) serviceType = '저장';
  else if (name.includes('시청') || descLower.includes('watch')) serviceType = '시청시간';

  // 품질 등급 파싱
  let quality = '표준';
  let qualityBadge: 'premium' | 'high' | 'standard' = 'standard';
  if (descLower.includes('high quality') || descLower.includes('hq') || descLower.includes('real') || descLower.includes('active')) {
    quality = '고품질';
    qualityBadge = 'high';
  }
  if (name.includes('[한국]') || descLower.includes('korea')) {
    quality = '프리미엄';
    qualityBadge = 'premium';
  }

  // 지역 파싱
  let region: string | null = null;
  if (name.includes('[한국]') || descLower.includes('korea') || descLower.includes('korean')) {
    region = '한국';
  } else if (descLower.includes('worldwide') || descLower.includes('global') || name.includes('[글로벌]')) {
    region = '전세계';
  }

  // 시작 시간 파싱 (원본 description에서)
  let startTime = service.average_time || '0-24시간';
  if (descLower.includes('instant start') || descLower.includes('instant')) startTime = '즉시 시작';
  else if (descLower.includes('0-1 hour')) startTime = '0-1시간';
  else if (descLower.includes('0-2 hour')) startTime = '0-2시간';
  else if (descLower.includes('0-6 hour')) startTime = '0-6시간';
  else if (descLower.includes('0-12 hour')) startTime = '0-12시간';
  else if (descLower.includes('0-24 hour')) startTime = '0-24시간';

  // 일일 처리량 파싱 (Day 10M, Day 500K 등)
  let dailySpeed = '';
  const speedMatch = desc.match(/day\s*(\d+[KMkm]?)/i);
  if (speedMatch) {
    const speedVal = speedMatch[1].toUpperCase();
    if (speedVal.includes('M')) {
      dailySpeed = `일 ${speedVal.replace('M', '')}00만`;
    } else if (speedVal.includes('K')) {
      dailySpeed = `일 ${speedVal.replace('K', '')}천`;
    } else {
      dailySpeed = `일 ${speedVal}`;
    }
  }

  // 최대 수량 파싱
  let maxQuantity = '';
  const maxMatch = desc.match(/max\s*(\d+[KMkm]?|unlimited)/i);
  if (maxMatch) {
    const maxVal = maxMatch[1].toUpperCase();
    if (maxVal === 'UNLIMITED') {
      maxQuantity = '무제한';
    } else if (maxVal.includes('M')) {
      maxQuantity = `${maxVal.replace('M', '')}00만`;
    } else if (maxVal.includes('K')) {
      maxQuantity = `${maxVal.replace('K', '')}천`;
    } else {
      maxQuantity = maxVal;
    }
  }

  // 리필 정보 파싱
  let hasRefill = (service.refill_days || 0) > 0;
  let refillPeriod = '리필 없음';
  if (descLower.includes('no refill') || desc.includes('⚠️')) {
    hasRefill = false;
    refillPeriod = '리필 없음';
  } else if (descLower.includes('lifetime') || descLower.includes('평생')) {
    hasRefill = true;
    refillPeriod = '평생 보장';
  } else if (descLower.includes('365 day')) {
    hasRefill = true;
    refillPeriod = '365일 보장';
  } else if (descLower.includes('30 day')) {
    hasRefill = true;
    refillPeriod = '30일 보장';
  } else if (descLower.includes('15 day')) {
    hasRefill = true;
    refillPeriod = '15일 보장';
  } else if (desc.includes('♻️')) {
    hasRefill = true;
    refillPeriod = service.refill_days ? `${service.refill_days}일 보장` : '리필 보장';
  }

  // 취소 가능 여부
  const canCancel = descLower.includes('cancel enable') || descLower.includes('cancel: yes');

  // 드롭률 파싱
  let dropRate = '';
  const dropMatch = desc.match(/drop\s*(\d+)%/i);
  if (dropMatch) {
    dropRate = `${dropMatch[1]}%`;
  } else if (descLower.includes('drop 0%') || descLower.includes('no drop')) {
    dropRate = '0%';
  }

  // 주요 특징
  const features: string[] = [];
  if (hasRefill) features.push(refillPeriod);
  if (canCancel) features.push('취소 가능');
  if (dropRate === '0%') features.push('드롭 0%');
  if (region === '한국') features.push('한국 타겟');
  if (descLower.includes('real') || descLower.includes('active')) features.push('실제 계정');
  if (dailySpeed) features.push(dailySpeed);

  // 주의사항
  const warnings: string[] = [];
  if (!hasRefill) warnings.push('리필 없음');
  if (descLower.includes('private')) warnings.push('공개 계정만');
  if (descLower.includes('no refund')) warnings.push('환불 불가');

  return {
    serviceType,
    quality,
    qualityBadge,
    region,
    startTime,
    dailySpeed,
    maxQuantity,
    hasRefill,
    refillPeriod,
    canCancel,
    dropRate,
    features,
    warnings,
    originalDesc: desc,
  };
}

// 품질 뱃지 색상
function getQualityBadgeStyle(badge: 'premium' | 'high' | 'standard') {
  switch (badge) {
    case 'premium':
      return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white';
    case 'high':
      return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    case 'standard':
      return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white';
  }
}

// ============================================
// 아이콘 매핑 (react-icons 브랜드 로고)
// ============================================
function getCategoryIcon(slug: string | null): React.ElementType {
  if (!slug) return Layers;
  const iconMap: Record<string, React.ElementType> = {
    all: Layers,
    instagram: FaInstagram,
    youtube: FaYoutube,
    tiktok: FaTiktok,
    twitter: FaTwitter,
    telegram: FaTelegram,
    facebook: FaFacebook,
    discord: FaDiscord,
    threads: SiThreads,
    twitch: FaTwitch,
    coinmarketcap: FaBitcoin,
    other: MoreHorizontal,
  };
  return iconMap[slug.toLowerCase()] || Layers;
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
  const [selectedPlatformTab, setSelectedPlatformTab] = useState<string>('all');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 재주문 데이터 처리
  useEffect(() => {
    const reorderData = localStorage.getItem('influx_reorder');
    if (reorderData && services.length > 0) {
      try {
        const { serviceId, link: reorderLink, quantity: reorderQty } = JSON.parse(reorderData);
        const service = services.find(s => s.id === serviceId);
        if (service) {
          // 해당 서비스의 카테고리 슬러그를 찾아서 탭 설정
          const category = categories.find(c => c.id === service.category_id);
          if (category?.slug && MAIN_PLATFORM_SLUGS.includes(category.slug.toLowerCase())) {
            setSelectedPlatformTab(category.slug.toLowerCase());
          } else {
            setSelectedPlatformTab('other');
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
  }, [services, categories]);

  // 현재 탭에 해당하는 서비스 목록 (플랫폼 필터)
  const platformFilteredServices = useMemo(() => {
    switch (selectedPlatformTab) {
      case 'all':
        return services;
      case 'favorites':
        return favoriteServices;
      case 'other':
        // 주요 플랫폼이 아닌 카테고리의 서비스들
        return services.filter(s => {
          const cat = categories.find(c => c.id === s.category_id);
          return !cat?.slug || !MAIN_PLATFORM_SLUGS.includes(cat.slug.toLowerCase());
        });
      default:
        // 특정 플랫폼 탭 - 카테고리 슬러그로 필터링
        return services.filter(s => {
          const cat = categories.find(c => c.id === s.category_id);
          return cat?.slug?.toLowerCase() === selectedPlatformTab;
        });
    }
  }, [services, favoriteServices, categories, selectedPlatformTab]);

  // 현재 플랫폼에서 사용 가능한 서비스 유형들
  const availableServiceTypes = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    platformFilteredServices.forEach(s => {
      const type = getServiceType(s.name);
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    return SERVICE_TYPES.filter(t => t.id === 'all' || typeCounts[t.id] > 0);
  }, [platformFilteredServices]);

  // 서비스 유형 필터 적용
  const tabServices = useMemo(() => {
    if (selectedServiceType === 'all') return platformFilteredServices;
    return platformFilteredServices.filter(s => getServiceType(s.name) === selectedServiceType);
  }, [platformFilteredServices, selectedServiceType]);

  // 검색 필터링된 서비스
  const filteredServices = useMemo(() => {
    if (!searchQuery) return tabServices;
    return tabServices.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tabServices, searchQuery]);

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

  // 플랫폼 탭 변경 시 서비스 초기화
  const handlePlatformTabChange = useCallback((tabId: string) => {
    setSelectedPlatformTab(tabId);
    setSelectedServiceType('all');
    setSelectedServiceId('');
    setQuantity(0);
    setSearchQuery('');
  }, []);

  // 서비스 유형 변경
  const handleServiceTypeChange = useCallback((typeId: string) => {
    setSelectedServiceType(typeId);
    setSelectedServiceId('');
    setQuantity(0);
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

      {/* 플랫폼 탭 */}
      <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-xl">
        {PLATFORM_TABS.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = selectedPlatformTab === tab.id;
          const count = tab.id === 'favorites'
            ? favoriteServices.length
            : tab.id === 'all'
              ? services.length
              : tabServices.length;

          return (
            <Button
              key={tab.id}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handlePlatformTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 h-10",
                isActive && `bg-gradient-to-r ${tab.color} text-white hover:opacity-90`,
                tab.id === 'favorites' && isActive && "!bg-gradient-to-r from-yellow-400 to-orange-500"
              )}
            >
              <IconComponent className={cn(
                "h-4 w-4",
                tab.id === 'favorites' && isActive && "fill-white"
              )} />
              <span className="hidden sm:inline">{tab.name}</span>
              {(tab.id === 'favorites' || tab.id === 'all') && count > 0 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-1 h-5 px-1.5 text-xs",
                    isActive ? "bg-white/20 text-white" : ""
                  )}
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 서비스 선택 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const currentTab = PLATFORM_TABS.find(t => t.id === selectedPlatformTab);
                  const IconComponent = currentTab?.icon || Layers;
                  return (
                    <>
                      <div className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br',
                        currentTab?.color || 'from-slate-500 to-slate-600'
                      )}>
                        <IconComponent className={cn(
                          "h-4 w-4",
                          selectedPlatformTab === 'favorites' && "fill-white"
                        )} />
                      </div>
                      {currentTab?.name || '전체보기'} 서비스
                    </>
                  );
                })()}
              </CardTitle>
              <CardDescription>
                {filteredServices.length}개의 서비스
                {selectedPlatformTab === 'favorites' && filteredServices.length === 0 && ' - 별 아이콘을 클릭해 즐겨찾기에 추가하세요'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 서비스 유형 필터 (2차 카테고리) */}
              {selectedPlatformTab !== 'favorites' && availableServiceTypes.length > 2 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                  <span className="text-xs text-muted-foreground self-center mr-2">유형:</span>
                  {availableServiceTypes.map((type) => {
                    const count = type.id === 'all'
                      ? platformFilteredServices.length
                      : platformFilteredServices.filter(s => getServiceType(s.name) === type.id).length;
                    const isActive = selectedServiceType === type.id;
                    return (
                      <Button
                        key={type.id}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleServiceTypeChange(type.id)}
                        className={cn(
                          "h-8 text-xs",
                          isActive && "bg-primary"
                        )}
                      >
                        {type.name}
                        <Badge variant="secondary" className={cn(
                          "ml-1.5 h-4 px-1 text-[10px]",
                          isActive ? "bg-white/20 text-white" : ""
                        )}>
                          {count}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* 서비스 검색 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="서비스 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              {/* 서비스 목록 */}
              {filteredServices.length === 0 ? (
                <div className="py-12 text-center">
                  {selectedPlatformTab === 'favorites' ? (
                    <>
                      <Star className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">즐겨찾기한 서비스가 없습니다</p>
                      <p className="text-sm text-muted-foreground">서비스 옆 별 아이콘을 클릭해 즐겨찾기에 추가하세요</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => handlePlatformTabChange('all')}
                      >
                        전체보기
                      </Button>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? '검색 결과가 없습니다' : '해당 플랫폼의 서비스가 없습니다'}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2">
                  {filteredServices.map((service) => {
                    const category = categories.find(c => c.id === service.category_id);
                    const IconComponent = getCategoryIcon(category?.slug || null);
                    const colorClass = getCategoryColor(category?.slug || null);
                    const isSelected = selectedServiceId === service.id;
                    const parsedInfo = parseServiceInfo(service);

                    return (
                      <div
                        key={service.id}
                        className={cn(
                          "p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "hover:border-primary/50"
                        )}
                        onClick={() => handleServiceChange(service.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={cn(
                              'h-10 w-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br shrink-0',
                              colorClass
                            )}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              {/* 서비스 번호 + 기본 정보 */}
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm truncate">{service.name}</h4>
                              </div>

                              {/* 원본 설명 (핵심 정보) */}
                              {parsedInfo.originalDesc && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {parsedInfo.originalDesc}
                                </p>
                              )}

                              {/* 핵심 스펙 뱃지들 */}
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {parsedInfo.maxQuantity && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                    최대 {parsedInfo.maxQuantity}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                                  {parsedInfo.startTime}
                                </Badge>
                                {parsedInfo.dailySpeed && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                    <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                                    {parsedInfo.dailySpeed}
                                  </Badge>
                                )}
                                {parsedInfo.hasRefill ? (
                                  <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0 h-5">
                                    <RefreshCw className="h-2.5 w-2.5 mr-0.5" />
                                    {parsedInfo.refillPeriod}
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0 h-5">
                                    리필없음
                                  </Badge>
                                )}
                                {parsedInfo.dropRate === '0%' && (
                                  <Badge className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0 h-5">
                                    드롭 0%
                                  </Badge>
                                )}
                                {parsedInfo.canCancel && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                    취소가능
                                  </Badge>
                                )}
                              </div>

                              {/* 가격 */}
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-bold text-primary">
                                  {formatCurrency(service.price)}<span className="text-xs font-normal text-muted-foreground">/1K</span>
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatCompactNumber(service.min_quantity)} ~ {formatCompactNumber(service.max_quantity)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              toggleFavorite(service.id, e);
                              toast.success(
                                favorites.includes(service.id)
                                  ? '즐겨찾기에서 제거되었습니다'
                                  : '즐겨찾기에 추가되었습니다',
                                { duration: 2000 }
                              );
                            }}
                            className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0"
                          >
                            <Star className={cn(
                              "h-5 w-5 transition-colors",
                              favorites.includes(service.id)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground hover:text-yellow-400"
                            )} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 선택된 서비스 상세 정보 */}
              {selectedService && (() => {
                const selectedParsedInfo = parseServiceInfo(selectedService);
                return (
                  <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden mt-4">
                    {/* 헤더 */}
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold">{selectedService.name}</h4>
                          {/* 원본 설명 */}
                          {selectedParsedInfo.originalDesc && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {selectedParsedInfo.originalDesc}
                            </p>
                          )}
                        </div>
                        {selectedParsedInfo.hasRefill ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0">
                            <Shield className="h-3 w-3 mr-1" />
                            {selectedParsedInfo.refillPeriod}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 shrink-0">
                            리필 없음
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 서비스 스펙 */}
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-lg bg-background/80 border">
                          <div className="text-xs text-muted-foreground mb-1">단가</div>
                          <div className="font-bold text-primary">{formatCurrency(selectedService.price)}<span className="text-xs font-normal">/1K</span></div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/80 border">
                          <div className="text-xs text-muted-foreground mb-1">시작 시간</div>
                          <div className="font-semibold flex items-center gap-1">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            {selectedParsedInfo.startTime}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/80 border">
                          <div className="text-xs text-muted-foreground mb-1">일일 처리량</div>
                          <div className="font-semibold flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-blue-500" />
                            {selectedParsedInfo.dailySpeed || '-'}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/80 border">
                          <div className="text-xs text-muted-foreground mb-1">드롭률</div>
                          <div className="font-semibold">{selectedParsedInfo.dropRate || '-'}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-background/80 border">
                          <div className="text-xs text-muted-foreground mb-1">최소 수량</div>
                          <div className="font-semibold">{formatCompactNumber(selectedService.min_quantity)}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/80 border">
                          <div className="text-xs text-muted-foreground mb-1">최대 수량</div>
                          <div className="font-semibold">{selectedParsedInfo.maxQuantity || formatCompactNumber(selectedService.max_quantity)}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/80 border">
                          <div className="text-xs text-muted-foreground mb-1">취소</div>
                          <div className="font-semibold">{selectedParsedInfo.canCancel ? '가능' : '불가'}</div>
                        </div>
                      </div>

                      {/* 주요 특징 */}
                      {selectedParsedInfo.features.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-2">주요 특징</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedParsedInfo.features.map((feature, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                                <CheckCircle className="h-3 w-3" />
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 주의사항 */}
                      {selectedParsedInfo.warnings.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-2">주의사항</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedParsedInfo.warnings.map((warning, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs">
                                <AlertCircle className="h-3 w-3" />
                                {warning}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 보장 정책 */}
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                        <div className="flex items-start gap-2">
                          <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                          <div>
                            <div className="font-semibold mb-1">INFLUX 품질 보장</div>
                            <ul className="text-xs space-y-0.5 text-blue-600">
                              <li>• 주문 완료 후 자동으로 처리가 시작됩니다</li>
                              {selectedParsedInfo.hasRefill && <li>• 드롭 발생 시 {selectedParsedInfo.refillPeriod} 무료 리필</li>}
                              <li>• 문제 발생 시 24시간 내 지원팀 응답</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
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
                      {/* 빠른 수량 선택 버튼 */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: formatCompactNumber(selectedService.min_quantity), value: selectedService.min_quantity },
                          { label: formatCompactNumber(Math.min(1000, selectedService.max_quantity)), value: Math.min(1000, selectedService.max_quantity) },
                          { label: formatCompactNumber(Math.min(5000, selectedService.max_quantity)), value: Math.min(5000, selectedService.max_quantity) },
                          { label: formatCompactNumber(Math.min(10000, selectedService.max_quantity)), value: Math.min(10000, selectedService.max_quantity) },
                        ].filter((opt, idx, arr) => idx === 0 || arr[idx - 1].value < opt.value).map((opt) => (
                          <Button
                            key={opt.value}
                            type="button"
                            variant={quantity === opt.value ? 'default' : 'outline'}
                            size="sm"
                            className={cn(
                              "h-10 text-sm",
                              quantity === opt.value && "btn-gradient"
                            )}
                            onClick={() => setQuantity(opt.value)}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>

                      {/* 수량 슬라이더 */}
                      <div className="space-y-3">
                        <Slider
                          value={[Math.max(selectedService.min_quantity, Math.min(quantity || selectedService.min_quantity, selectedService.max_quantity))]}
                          min={selectedService.min_quantity}
                          max={Math.min(selectedService.max_quantity, 100000)}
                          step={Math.max(1, Math.floor((selectedService.max_quantity - selectedService.min_quantity) / 100))}
                          onValueChange={([val]) => setQuantity(val)}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatCompactNumber(selectedService.min_quantity)}</span>
                          <span>{formatCompactNumber(Math.min(selectedService.max_quantity, 100000))}</span>
                        </div>
                      </div>

                      {/* 직접 입력 */}
                      <div className="relative">
                        <Input
                          id="quantity"
                          type="number"
                          min={selectedService.min_quantity}
                          max={selectedService.max_quantity}
                          value={quantity || ''}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                          className="h-12 pr-20"
                          placeholder="직접 입력"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          개
                        </span>
                      </div>
                      {quantity > 0 && (quantity < selectedService.min_quantity || quantity > selectedService.max_quantity) && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formatCompactNumber(selectedService.min_quantity)} ~ {formatCompactNumber(selectedService.max_quantity)} 범위 내에서 입력하세요
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

      {/* 신뢰 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">10,000+</div>
          <div className="text-xs text-muted-foreground">처리된 주문</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">99.2%</div>
          <div className="text-xs text-muted-foreground">완료율</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">24시간</div>
          <div className="text-xs text-muted-foreground">지원 응답</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">5.0</div>
          <div className="text-xs text-muted-foreground">고객 만족도</div>
        </div>
      </div>

      {/* FAQ 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            자주 묻는 질문
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">주문 후 얼마나 걸리나요?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                대부분의 서비스는 주문 후 0-1시간 이내에 시작됩니다. 서비스별 예상 소요 시간은
                서비스 상세 정보에서 확인할 수 있습니다. 대량 주문의 경우 점진적으로 진행되어
                더 자연스러운 성장을 보장합니다.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">리필 보장이 뭔가요?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                리필 보장 서비스는 구매 후 일정 기간(보통 30일) 내에 팔로워/좋아요가 감소할 경우
                무료로 다시 채워드립니다. 서비스 옆에 ♻️ 표시가 있으면 리필 보장 서비스입니다.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">계정에 안전한가요?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                네, 저희 서비스는 SNS 플랫폼의 정책을 준수하며 계정에 안전합니다.
                자연스러운 성장 패턴을 따르고, 급격한 변화를 피해 계정의 안전을 최우선으로 합니다.
                공개 계정에서만 서비스가 작동하니 계정을 공개로 설정해 주세요.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">결제는 어떻게 하나요?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                먼저 잔액을 충전한 후 서비스를 주문할 수 있습니다. 계좌이체, 암호화폐 등
                다양한 결제 방법을 지원합니다. 충전 페이지에서 원하는 결제 방법을 선택하세요.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">취소나 환불이 가능한가요?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                주문이 처리되기 전(대기 상태)에는 취소가 가능합니다.
                진행 중이거나 완료된 주문은 취소가 어렵습니다.
                문제가 있는 경우 고객지원으로 문의해 주세요.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

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
