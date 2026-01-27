// ============================================
// 주문하기 페이지
// YTResellers 스타일 - 플랫폼탭 → 번호검색 → 카테고리 → 서비스 → 주문폼
// ============================================

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  TrendingUp,
  HelpCircle,
  MessageSquare,
  AtSign,
  Hash,
  FileText,
  Vote,
  CreditCard,
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
  FaSpotify,
  FaLinkedin,
  FaSoundcloud,
} from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
// 플랫폼 탭 정의
// ============================================
const PLATFORM_TABS = [
  { id: 'all', name: '전체', icon: Layers, color: 'from-slate-500 to-slate-600' },
  { id: 'recommended', name: '인플럭스 추천', icon: Sparkles, color: 'from-amber-400 to-orange-500' },
  { id: 'favorites', name: '즐겨찾기', icon: Star, color: 'from-yellow-400 to-orange-500' },
  { id: 'Instagram', name: '인스타그램', icon: FaInstagram, color: 'from-[#E1306C] to-[#F77737]' },
  { id: 'YouTube', name: '유튜브', icon: FaYoutube, color: 'from-red-500 to-red-600' },
  { id: 'TikTok', name: '틱톡', icon: FaTiktok, color: 'from-gray-900 to-gray-700' },
  { id: 'Facebook', name: '페이스북', icon: FaFacebook, color: 'from-blue-600 to-blue-700' },
  { id: 'Twitter/X', name: '트위터/X', icon: FaTwitter, color: 'from-sky-400 to-sky-500' },
  { id: 'Telegram', name: '텔레그램', icon: FaTelegram, color: 'from-sky-500 to-blue-500' },
  { id: 'Twitch', name: '트위치', icon: FaTwitch, color: 'from-purple-500 to-purple-600' },
  { id: 'Discord', name: '디스코드', icon: FaDiscord, color: 'from-indigo-500 to-indigo-600' },
  { id: 'other', name: '기타', icon: MoreHorizontal, color: 'from-gray-500 to-gray-600' },
] as const;

// 주요 플랫폼 목록 (기타 필터링용)
const MAIN_PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Facebook', 'Twitter/X', 'Telegram', 'Twitch', 'Discord'];

// 플랫폼별 링크 플레이스홀더
const PLATFORM_PLACEHOLDERS: Record<string, string> = {
  'all': '서비스 링크를 입력하세요',
  'recommended': '서비스 링크를 입력하세요',
  'favorites': '서비스 링크를 입력하세요',
  'Instagram': 'https://instagram.com/username 또는 게시물 링크',
  'YouTube': 'https://youtube.com/watch?v=... 또는 채널 링크',
  'TikTok': 'https://tiktok.com/@username/video/...',
  'Facebook': 'https://facebook.com/... 페이지 또는 게시물 링크',
  'Twitter/X': 'https://twitter.com/username 또는 트윗 링크',
  'Telegram': 'https://t.me/channel_name 또는 게시물 링크',
  'Twitch': 'https://twitch.tv/username',
  'Discord': 'https://discord.gg/invite_code',
  'other': '서비스 링크를 입력하세요',
};

// 입력 타입별 필드 정보
const INPUT_TYPE_FIELDS: Record<string, { label: string; placeholder: string; icon: React.ElementType }[]> = {
  'link': [],
  'link_comments': [
    { label: '커스텀 댓글', placeholder: '댓글 내용을 한 줄에 하나씩 입력하세요\n예:\n좋은 콘텐츠네요!\n최고입니다!', icon: MessageSquare }
  ],
  'link_usernames': [
    { label: '사용자명 목록', placeholder: '사용자명을 한 줄에 하나씩 입력하세요\n예:\nuser1\nuser2\nuser3', icon: AtSign }
  ],
  'link_hashtags': [
    { label: '해시태그', placeholder: '해시태그를 입력하세요 (# 없이)\n예: 마케팅,비즈니스,성공', icon: Hash }
  ],
  'link_keywords': [
    { label: '키워드', placeholder: '검색 키워드를 입력하세요\n예: 인스타그램 마케팅', icon: FileText }
  ],
  'link_usernames_hashtags': [
    { label: '사용자명 목록', placeholder: '사용자명을 한 줄에 하나씩 입력하세요', icon: AtSign },
    { label: '해시태그', placeholder: '해시태그를 입력하세요 (# 없이)', icon: Hash }
  ],
  'link_answer': [
    { label: '투표 답변', placeholder: '투표할 답변을 입력하세요', icon: Vote }
  ],
};

// ============================================
// 서비스 메타데이터 파싱
// ============================================
interface ServiceDetails {
  cancel: boolean;      // 취소 가능
  refill: boolean;      // 리필 가능
  refill_period?: string; // 리필 기간
  dripfeed: boolean;    // 점진적 배송
  speed?: string;       // 일일 속도
  start_time?: string;  // 시작 시간
  drop?: string;        // 드롭율
  quality?: string;     // 품질
  min: number;
  max: number;
}

interface ServiceMetadata {
  input_type: string;
  subcategory: string;
  platform: string;
  service_type: string;
  original_description?: string;
  original_category?: string; // YTResellers 원본 카테고리
  category_kr?: string; // 한국어 번역 카테고리
  details?: ServiceDetails; // 상세 정보
}

function parseServiceMetadata(description: string | null): ServiceMetadata | null {
  if (!description) return null;
  try {
    return JSON.parse(description);
  } catch {
    return null;
  }
}

// ============================================
// 서비스 정보 파싱
// ============================================
interface ParsedServiceInfo {
  startTime: string;
  hasRefill: boolean;
  refillPeriod: string;
  canCancel: boolean;
}

function parseServiceInfo(service: { name: string; description?: string | null; refill_days?: number; average_time?: string | null }): ParsedServiceInfo {
  const desc = service.description || '';
  const descLower = desc.toLowerCase();

  // 시작 시간
  let startTime = service.average_time || '0-24시간';
  if (descLower.includes('instant start') || descLower.includes('instant')) startTime = '즉시 시작';
  else if (descLower.includes('0-1 hour')) startTime = '0-1시간';
  else if (descLower.includes('0-6 hour')) startTime = '0-6시간';
  else if (descLower.includes('0-12 hour')) startTime = '0-12시간';
  else if (descLower.includes('0-24 hour')) startTime = '0-24시간';

  // 리필 정보
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
  } else if (service.refill_days && service.refill_days > 0) {
    hasRefill = true;
    refillPeriod = `${service.refill_days}일 보장`;
  }

  // 취소 가능 여부
  const canCancel = descLower.includes('cancel enable') || descLower.includes('cancel: yes');

  return { startTime, hasRefill, refillPeriod, canCancel };
}

// ============================================
// 주문하기 페이지 컴포넌트
// ============================================
// URL 플랫폼 파라미터 매핑
const PLATFORM_URL_MAP: Record<string, string> = {
  'all': '',
  'recommended': 'recommended',
  'favorites': 'favorites',
  'Instagram': 'instagram',
  'YouTube': 'youtube',
  'TikTok': 'tiktok',
  'Facebook': 'facebook',
  'Twitter/X': 'twitter',
  'Telegram': 'telegram',
  'Twitch': 'twitch',
  'Discord': 'discord',
  'other': 'other',
};

// URL에서 플랫폼 ID로 역매핑
const URL_TO_PLATFORM_MAP: Record<string, string> = Object.entries(PLATFORM_URL_MAP).reduce(
  (acc, [key, value]) => {
    if (value) acc[value] = key;
    return acc;
  },
  {} as Record<string, string>
);

export default function OrderPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, refreshProfile, isLoading: authLoading } = useAuth();
  const { services, categories, isLoading: servicesLoading, error: servicesError, refetch } = useServices();
  const isPageLoading = authLoading || servicesLoading;
  const balance = Number(profile?.balance) || 0;

  // URL에서 플랫폼 파라미터 가져오기
  const platformFromUrl = searchParams.get('platform');
  const initialPlatform = platformFromUrl ? (URL_TO_PLATFORM_MAP[platformFromUrl] || 'all') : 'all';

  // 즐겨찾기 상태
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('influx_favorite_services');
    if (saved) {
      try { setFavorites(JSON.parse(saved)); } catch { setFavorites([]); }
    }
  }, []);

  const toggleFavorite = useCallback((serviceId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      localStorage.setItem('influx_favorite_services', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // 상태 - URL 파라미터에서 초기값 가져오기
  const [selectedPlatform, setSelectedPlatform] = useState<string>(initialPlatform);

  // URL 변경 시 상태 동기화 (브라우저 뒤로가기/앞으로가기 지원)
  useEffect(() => {
    const newPlatform = platformFromUrl ? (URL_TO_PLATFORM_MAP[platformFromUrl] || 'all') : 'all';
    if (newPlatform !== selectedPlatform) {
      setSelectedPlatform(newPlatform);
      setSelectedCategory('');
      setSelectedServiceId('');
      setServiceIdSearch('');
      setQuantity(0);
      setExtraFields({});
    }
  }, [platformFromUrl]);

  const [serviceIdSearch, setServiceIdSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 서비스별 메타데이터 매핑
  const servicesWithMeta = useMemo(() => {
    return services.map(s => ({
      ...s,
      metadata: parseServiceMetadata(s.description),
    }));
  }, [services]);

  // 플랫폼별 서비스 필터링
  const platformServices = useMemo(() => {
    if (selectedPlatform === 'all') return servicesWithMeta;
    if (selectedPlatform === 'recommended') {
      // is_featured가 true인 서비스만 표시
      return servicesWithMeta.filter(s => s.is_featured);
    }
    if (selectedPlatform === 'favorites') {
      return servicesWithMeta.filter(s => favorites.includes(s.id));
    }
    if (selectedPlatform === 'other') {
      return servicesWithMeta.filter(s => {
        const platform = s.metadata?.platform || '기타';
        return !MAIN_PLATFORMS.includes(platform);
      });
    }
    return servicesWithMeta.filter(s => s.metadata?.platform === selectedPlatform);
  }, [servicesWithMeta, selectedPlatform, favorites]);

  // 서비스 ID로 실시간 필터링 (입력값으로 시작하는 서비스들)
  const filteredServicesBySearch = useMemo(() => {
    if (!serviceIdSearch.trim()) return [];
    const searchTerm = serviceIdSearch.trim();
    return servicesWithMeta
      .filter(s => s.provider_service_id?.toString().startsWith(searchTerm))
      .slice(0, 15); // 최대 15개
  }, [servicesWithMeta, serviceIdSearch]);

  // 카테고리 목록 (선택된 플랫폼 내에서 - 한국어 카테고리 사용)
  const categoryList = useMemo(() => {
    const cats = new Map<string, { count: number; services: typeof platformServices }>();

    platformServices.forEach(s => {
      // 한국어 카테고리 사용 (없으면 원본)
      const catName = s.metadata?.category_kr || s.metadata?.original_category || '기타';

      if (!cats.has(catName)) {
        cats.set(catName, { count: 0, services: [] });
      }
      const catData = cats.get(catName)!;
      catData.count++;
      catData.services.push(s);
    });

    return Array.from(cats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({ name, ...data }));
  }, [platformServices]);

  // 선택된 카테고리의 서비스들
  const categoryServices = useMemo(() => {
    if (!selectedCategory) return [];
    const cat = categoryList.find(c => c.name === selectedCategory);
    return cat?.services || [];
  }, [selectedCategory, categoryList]);

  // 선택된 서비스
  const selectedService = useMemo(() => {
    return servicesWithMeta.find(s => s.id === selectedServiceId);
  }, [servicesWithMeta, selectedServiceId]);

  // 입력 타입 및 추가 필드
  const inputType = selectedService?.metadata?.input_type || 'link';
  const extraFieldDefs = INPUT_TYPE_FIELDS[inputType] || [];

  // 예상 금액
  const estimatedPrice = useMemo(() => {
    if (!selectedService || quantity <= 0) return 0;
    return Math.ceil((selectedService.price / 1000) * quantity);
  }, [selectedService, quantity]);

  // 유효성 검사
  const isValidOrder = useMemo(() => {
    if (!selectedService) return false;
    if (!link.trim()) return false;
    if (quantity < selectedService.min_quantity || quantity > selectedService.max_quantity) return false;
    if (estimatedPrice > balance) return false;
    for (const field of extraFieldDefs) {
      if (!extraFields[field.label]?.trim()) return false;
    }
    return true;
  }, [selectedService, link, quantity, estimatedPrice, balance, extraFieldDefs, extraFields]);

  // 플랫폼 변경 핸들러 - URL도 함께 업데이트
  const handlePlatformChange = useCallback((platform: string) => {
    console.log('[INFLUX] Platform changed:', platform);
    setSelectedPlatform(platform);
    setSelectedCategory('');
    setSelectedServiceId('');
    setServiceIdSearch('');
    setQuantity(0);
    setExtraFields({});

    // URL 업데이트
    const urlPlatform = PLATFORM_URL_MAP[platform];
    console.log('[INFLUX] URL platform:', urlPlatform);
    if (urlPlatform) {
      const newUrl = `/order?platform=${urlPlatform}`;
      console.log('[INFLUX] Pushing URL:', newUrl);
      router.push(newUrl, { scroll: false });
    } else {
      console.log('[INFLUX] Pushing URL: /order');
      router.push('/order', { scroll: false });
    }
  }, [router]);

  // 서비스 ID 검색 입력 핸들러
  const handleServiceIdSearch = useCallback((value: string) => {
    setServiceIdSearch(value);
  }, []);

  // 검색 결과에서 서비스 선택
  const handleSelectSearchResult = useCallback((service: typeof servicesWithMeta[0]) => {
    // 1. 해당 서비스의 플랫폼으로 이동
    const platform = service.metadata?.platform || '기타';
    if (MAIN_PLATFORMS.includes(platform)) {
      setSelectedPlatform(platform);
    } else {
      setSelectedPlatform('other');
    }

    // 2. 해당 서비스의 카테고리 선택
    const category = service.metadata?.category_kr || service.metadata?.original_category || '기타';

    // 플랫폼 변경 후 카테고리 목록이 업데이트된 다음 선택
    setTimeout(() => {
      setSelectedCategory(category);
      setSelectedServiceId(service.id);
      setQuantity(service.min_quantity);
      setExtraFields({});
      setServiceIdSearch(''); // 검색창 클리어
    }, 0);
  }, [servicesWithMeta]);

  // 카테고리 변경 핸들러
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setSelectedServiceId('');
    setServiceIdSearch('');
    setQuantity(0);
    setExtraFields({});
  }, []);

  // 서비스 변경 핸들러
  const handleServiceChange = useCallback((serviceId: string) => {
    setSelectedServiceId(serviceId);
    setServiceIdSearch('');
    const service = servicesWithMeta.find(s => s.id === serviceId);
    if (service) {
      setQuantity(service.min_quantity);
      setExtraFields({});
    }
  }, [servicesWithMeta]);


  // 주문 제출
  const handleSubmit = async () => {
    if (!isValidOrder || isSubmitting || !profile || !selectedService) return;

    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.rpc as any)('process_order', {
        p_user_id: profile.id,
        p_service_id: selectedService.id,
        p_link: link.trim(),
        p_quantity: quantity,
      });

      if (error) {
        if (error.message.includes('Insufficient balance')) {
          toast.error('잔액이 부족합니다.');
        } else {
          toast.error('주문 처리 중 오류가 발생했습니다.', { description: error.message });
        }
        return;
      }

      toast.success('주문이 완료되었습니다!', {
        description: `${selectedService.name} ${formatCompactNumber(quantity)}개`,
      });

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42'],
        zIndex: 9999,
      });

      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: orderKeys.all });

      setLink('');
      setQuantity(selectedService.min_quantity);
      setExtraFields({});
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  // 에러 상태
  if (servicesError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-xl font-semibold">서비스를 불러올 수 없습니다</h2>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          다시 시도
        </Button>
      </div>
    );
  }

  const parsedInfo = selectedService ? parseServiceInfo(selectedService) : null;

  return (
    <div className="space-y-6 min-w-0 w-full">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">새 주문</h1>
          <p className="text-muted-foreground mt-1">서비스를 선택하고 주문하세요</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10">
          <span className="text-sm text-muted-foreground">보유 잔액</span>
          <span className="font-bold text-primary">{formatCurrency(balance)}</span>
        </div>
      </div>

      {/* 플랫폼 탭 */}
      <div className="flex gap-2 p-2 bg-muted/30 rounded-xl overflow-x-auto scrollbar-hide">
        {PLATFORM_TABS.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = selectedPlatform === tab.id;

          return (
            <Button
              key={tab.id}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handlePlatformChange(tab.id)}
              className={cn(
                "flex items-center gap-2 h-10 flex-shrink-0 whitespace-nowrap",
                isActive && `bg-gradient-to-r ${tab.color} text-white hover:opacity-90`
              )}
            >
              <IconComponent className={cn("h-4 w-4", tab.id === 'favorites' && isActive && "fill-white")} />
              <span className="hidden sm:inline">{tab.name}</span>
            </Button>
          );
        })}
      </div>

      {/* 메인 주문 폼 */}
      <Card className="border-2">
        <CardContent className="pt-6 space-y-6">
          {/* 서비스 번호 검색 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              서비스 번호로 검색 (선택사항)
            </Label>
            <Input
              type="text"
              placeholder="서비스 ID 입력 (예: 8142)"
              value={serviceIdSearch}
              onChange={(e) => handleServiceIdSearch(e.target.value)}
              className="h-11 w-full"
            />

            {/* 검색 결과 목록 */}
            {filteredServicesBySearch.length > 0 && (
              <div className="border rounded-lg max-h-[300px] overflow-y-auto bg-background shadow-lg">
                {filteredServicesBySearch.map(service => (
                  <div
                    key={service.id}
                    onClick={() => handleSelectSearchResult(service)}
                    className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-xs leading-relaxed">
                        {service.name}
                      </span>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {formatCurrency(service.price)}/1K
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {serviceIdSearch.trim() && filteredServicesBySearch.length === 0 && (
              <p className="text-sm text-muted-foreground">해당 번호로 시작하는 서비스가 없습니다</p>
            )}
          </div>

          {/* 카테고리 선택 */}
          <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Category
              </Label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {categoryList.map(cat => (
                    <SelectItem key={cat.name} value={cat.name}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span className="truncate">{cat.name}</span>
                        <Badge variant="secondary" className="shrink-0">{cat.count}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>

          {/* 서비스 선택 */}
          {selectedCategory && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Service
              </Label>
              <Select value={selectedServiceId} onValueChange={handleServiceChange}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="서비스를 선택하세요" />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  {categoryServices.map(service => (
                    <SelectItem key={service.id} value={service.id} className="py-2">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="font-medium text-xs leading-relaxed">
                          {service.name}
                        </span>
                        <span className="text-primary font-bold shrink-0 text-xs">
                          {formatCurrency(service.price)}/1K
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 선택된 서비스가 있을 때 주문 폼 표시 */}
          {selectedService && (
            <>
              {/* 선택된 서비스 표시 */}
              <div className="p-4 rounded-xl bg-muted/50 border">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-sm leading-relaxed">{selectedService.name}</span>
                  <button onClick={() => toggleFavorite(selectedService.id)} className="shrink-0">
                    <Star className={cn(
                      "h-5 w-5",
                      favorites.includes(selectedService.id)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )} />
                  </button>
                </div>
              </div>

              {/* Link 입력 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Link
                </Label>
                <Input
                  type="url"
                  placeholder={PLATFORM_PLACEHOLDERS[selectedPlatform] || PLATFORM_PLACEHOLDERS.other}
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="h-11 w-full"
                />
              </div>

              {/* 추가 필드 (서비스 타입에 따라) */}
              {extraFieldDefs.length > 0 && (
                <div className="space-y-4 p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                  <p className="text-sm font-medium text-blue-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    이 서비스는 추가 정보가 필요합니다
                  </p>
                  {extraFieldDefs.map((field, idx) => {
                    const FieldIcon = field.icon;
                    return (
                      <div key={idx} className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <FieldIcon className="h-4 w-4" />
                          {field.label}
                        </Label>
                        <textarea
                          placeholder={field.placeholder}
                          value={extraFields[field.label] || ''}
                          onChange={(e) => setExtraFields(prev => ({ ...prev, [field.label]: e.target.value }))}
                          className="w-full min-h-[100px] p-3 rounded-lg border bg-background text-sm resize-y"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quantity 입력 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Quantity
                </Label>
                <Input
                  type="number"
                  min={selectedService.min_quantity}
                  max={selectedService.max_quantity}
                  value={quantity || ''}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  placeholder={`${formatCompactNumber(selectedService.min_quantity)} - ${formatCompactNumber(selectedService.max_quantity)}`}
                  className="h-11 w-full"
                />
                {quantity > 0 && (quantity < selectedService.min_quantity || quantity > selectedService.max_quantity) && (
                  <p className="text-xs text-destructive">
                    {formatCompactNumber(selectedService.min_quantity)} ~ {formatCompactNumber(selectedService.max_quantity)} 범위
                  </p>
                )}
              </div>

              {/* 고급 옵션 (Drip-feed 지원 서비스만) */}
              {selectedService.metadata?.details?.dripfeed && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">점진적 배송 (Drip-feed)</span>
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">선택</Badge>
                  </div>
                  <p className="text-xs text-blue-700">
                    자연스러운 성장을 위해 주문량을 여러 번에 나눠 배송합니다.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-blue-700">배송 횟수</Label>
                      <Select defaultValue="1">
                        <SelectTrigger className="h-9 bg-white border-blue-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1회 (일괄 배송)</SelectItem>
                          <SelectItem value="2">2회 나눠 배송</SelectItem>
                          <SelectItem value="3">3회 나눠 배송</SelectItem>
                          <SelectItem value="5">5회 나눠 배송</SelectItem>
                          <SelectItem value="7">7회 나눠 배송</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-blue-700">배송 간격</Label>
                      <Select defaultValue="60">
                        <SelectTrigger className="h-9 bg-white border-blue-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30분마다</SelectItem>
                          <SelectItem value="60">1시간마다</SelectItem>
                          <SelectItem value="120">2시간마다</SelectItem>
                          <SelectItem value="360">6시간마다</SelectItem>
                          <SelectItem value="720">12시간마다</SelectItem>
                          <SelectItem value="1440">24시간마다</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* 실시간 가격 계산기 */}
              {quantity > 0 && quantity >= selectedService.min_quantity && quantity <= selectedService.max_quantity && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium text-emerald-900">가격 계산</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-emerald-700">
                      <span>단가 (1,000개당)</span>
                      <span>{formatCurrency(selectedService.price)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>주문 수량</span>
                      <span>{quantity.toLocaleString()}개</span>
                    </div>
                    <div className="border-t border-emerald-200 pt-2 flex justify-between font-bold text-emerald-900">
                      <span>총 결제 금액</span>
                      <span className="text-lg">{formatCurrency(estimatedPrice)}</span>
                    </div>
                    {estimatedPrice >= 50000 && (
                      <div className="flex justify-between text-amber-700 bg-amber-50 p-2 rounded-lg">
                        <span>🎁 5만원 이상 적립금</span>
                        <span className="font-medium">+{formatCurrency(Math.floor(estimatedPrice * 0.05))}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Average time */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Average time
                </span>
                <span className="font-medium">{parsedInfo?.startTime}</span>
              </div>

              {/* Charge (가격) */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <span className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Charge
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(estimatedPrice)}
                </span>
              </div>

              {/* 잔액 부족 경고 */}
              {estimatedPrice > balance && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  잔액이 부족합니다. 충전이 필요합니다.
                </p>
              )}

              {/* 주문 버튼 */}
              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={!isValidOrder || isSubmitting}
                className="w-full h-14 text-lg btn-gradient"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    주문하기
                  </>
                )}
              </Button>
            </>
          )}

          {/* 서비스 미선택 상태 */}
          {!selectedService && (
            <div className="py-12 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {selectedPlatform === 'recommended' && platformServices.length === 0
                  ? '추천 서비스가 아직 없습니다'
                  : selectedPlatform === 'favorites' && favorites.length === 0
                  ? '즐겨찾기한 서비스가 없습니다'
                  : '카테고리와 서비스를 선택하세요'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            자주 묻는 질문
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>주문 후 얼마나 걸리나요?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                대부분의 서비스는 0-24시간 내에 시작됩니다. 서비스별 예상 시간을 확인하세요.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>리필 보장이 뭔가요?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                리필 보장 서비스는 감소 시 무료로 다시 채워드립니다.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>계정에 안전한가요?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                네, 플랫폼 정책을 준수하며 안전합니다. 공개 계정에서만 작동합니다.
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
            <DialogDescription>아래 내용으로 주문하시겠습니까?</DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">서비스</span>
                  <span className="font-medium text-right max-w-[200px]">{selectedService.name}</span>
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
                  <span className="text-xl font-bold text-primary">{formatCurrency(estimatedPrice)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isSubmitting}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="btn-gradient min-w-[120px]">
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
