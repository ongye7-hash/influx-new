// ============================================
// Admin Services Management Page
// 관리자 서비스 관리 및 동기화 페이지
// ============================================

'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  Download,
  Package,
  Percent,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Filter,
  Edit2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { fetchProviderServices } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Service, Provider, Category } from '@/types/database';

// ============================================
// Types
// ============================================
interface ServiceWithDetails extends Service {
  category?: Category | null;
  provider?: Provider | null;
}

// ============================================
// Mock Data
// ============================================
const MOCK_SERVICES: ServiceWithDetails[] = [
  {
    id: 'svc-1',
    provider_id: 'prov-1',
    category_id: 'cat-1',
    provider_service_id: '1',
    name: 'Instagram 팔로워 [고품질]',
    description: '고품질 실제 팔로워',
    platform: 'instagram',
    price: 15,
    rate: 10,
    margin: 50,
    min_quantity: 100,
    max_quantity: 100000,
    is_active: true,
    average_time: '1-2시간',
    sort_order: 1,
    created_at: '',
    updated_at: '',
    category: { id: 'cat-1', name: 'Instagram 팔로워', slug: 'instagram-followers', platform: 'instagram', icon: null, description: null, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
    provider: { id: 'prov-1', name: 'MainProvider', api_url: '', api_key: '', balance: null, currency: 'KRW', rate_multiplier: 1, is_active: true, priority: 1, description: null, created_at: '', updated_at: '' },
  },
  {
    id: 'svc-2',
    provider_id: 'prov-1',
    category_id: 'cat-2',
    provider_service_id: '10',
    name: 'YouTube 조회수 [실시간]',
    description: '실시간 조회수',
    platform: 'youtube',
    price: 5,
    rate: 3,
    margin: 67,
    min_quantity: 500,
    max_quantity: 1000000,
    is_active: true,
    average_time: '0-6시간',
    sort_order: 2,
    created_at: '',
    updated_at: '',
    category: { id: 'cat-2', name: 'YouTube 조회수', slug: 'youtube-views', platform: 'youtube', icon: null, description: null, sort_order: 2, is_active: true, created_at: '', updated_at: '' },
  },
  {
    id: 'svc-3',
    provider_id: 'prov-1',
    category_id: 'cat-3',
    provider_service_id: '21',
    name: 'TikTok 좋아요',
    description: '실제 좋아요',
    platform: 'tiktok',
    price: 5,
    rate: 3,
    margin: 67,
    min_quantity: 100,
    max_quantity: 100000,
    is_active: false,
    average_time: '0-1시간',
    sort_order: 3,
    created_at: '',
    updated_at: '',
    category: { id: 'cat-3', name: 'TikTok 좋아요', slug: 'tiktok-likes', platform: 'tiktok', icon: null, description: null, sort_order: 3, is_active: true, created_at: '', updated_at: '' },
  },
];

const MOCK_PROVIDERS: Provider[] = [
  { id: 'prov-1', name: 'MainProvider', api_url: 'https://api.provider1.com', api_key: 'xxx', balance: 1500000, currency: 'KRW', rate_multiplier: 1, is_active: true, priority: 1, description: '주요 도매처', created_at: '', updated_at: '' },
];

// ============================================
// Main Admin Services Page
// ============================================
export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceWithDetails[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Margin settings
  const [showMarginDialog, setShowMarginDialog] = useState(false);
  const [globalMargin, setGlobalMargin] = useState(30);
  const [isApplyingMargin, setIsApplyingMargin] = useState(false);

  // Sync dialog
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });

  // Edit dialog
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceWithDetails | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: 0,
    margin: 0,
    min_quantity: 0,
    max_quantity: 0,
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch services with relations
      const { data: servicesData } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(*),
          provider:providers(*)
        `)
        .order('sort_order', { ascending: true });

      // Fetch providers
      const { data: providersData } = await supabase
        .from('providers')
        .select('*')
        .eq('is_active', true);

      // Categories are loaded via service.category relation, no need for separate fetch

      setServices((servicesData as ServiceWithDetails[]) || MOCK_SERVICES);
      setProviders(providersData || MOCK_PROVIDERS);
    } catch (error) {
      console.error('Error fetching data:', error);
      setServices(MOCK_SERVICES);
      setProviders(MOCK_PROVIDERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      !searchQuery ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.provider_service_id?.includes(searchQuery);

    const matchesPlatform = platformFilter === 'all' || service.platform === platformFilter;
    const matchesActive = !showActiveOnly || service.is_active;

    return matchesSearch && matchesPlatform && matchesActive;
  });

  // Stats
  const stats = {
    total: services.length,
    active: services.filter((s) => s.is_active).length,
    platforms: [...new Set(services.map((s) => s.platform).filter(Boolean))].length,
    avgMargin: services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + (s.margin || 0), 0) / services.length)
      : 0,
  };

  // Sync services from provider
  const handleSyncServices = async () => {
    if (!selectedProvider) {
      toast.error('도매처를 선택해주세요');
      return;
    }

    const provider = providers.find((p) => p.id === selectedProvider);
    if (!provider) {
      toast.error('도매처를 찾을 수 없습니다');
      return;
    }

    setIsSyncing(true);
    setSyncProgress({ current: 0, total: 0 });

    try {
      // Fetch services from provider API
      const providerServices = await fetchProviderServices({
        id: provider.id,
        name: provider.name,
        apiUrl: provider.api_url,
        apiKey: provider.api_key,
      });

      if (!providerServices || providerServices.length === 0) {
        toast.error('도매처에서 서비스를 가져올 수 없습니다');
        return;
      }

      setSyncProgress({ current: 0, total: providerServices.length });

      // Process each service
      let successCount = 0;
      for (let i = 0; i < providerServices.length; i++) {
        const ps = providerServices[i];
        setSyncProgress({ current: i + 1, total: providerServices.length });

        try {
          // Check if service already exists
          const { data: existingData } = await supabase
            .from('services')
            .select('id')
            .eq('provider_id', provider.id)
            .eq('provider_service_id', ps.providerServiceId)
            .single();
          const existing = existingData as { id: string } | null;

          // Calculate price with default margin
          const baseRate = ps.rate || 0;
          const priceWithMargin = Math.ceil(baseRate * (1 + globalMargin / 100));

          const serviceData = {
            provider_id: provider.id,
            provider_service_id: ps.providerServiceId,
            name: ps.name,
            description: ps.description || null,
            rate: baseRate,
            price: priceWithMargin,
            margin: globalMargin,
            min_quantity: ps.min,
            max_quantity: ps.max,
            average_time: ps.averageTime || null,
            is_active: false, // Default to inactive, admin activates manually
            is_refill: ps.hasRefill || false,
            is_cancel: ps.hasCancel || false,
            is_drip_feed: ps.hasDripfeed || false,
          };

          if (existing) {
            // Update existing service
            await supabase
              .from('services')
              .update(serviceData as never)
              .eq('id', existing.id);
          } else {
            // Insert new service
            await supabase
              .from('services')
              .insert(serviceData as never);
          }

          successCount++;
        } catch (err) {
          console.error('Error syncing service:', ps.providerServiceId, err);
        }
      }

      toast.success(`${successCount}개 서비스가 동기화되었습니다`);
      setShowSyncDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error syncing services:', error);
      toast.error('서비스 동기화 중 오류가 발생했습니다');
    } finally {
      setIsSyncing(false);
    }
  };

  // Apply global margin
  const handleApplyMargin = async () => {
    setIsApplyingMargin(true);
    try {
      // Update all services with new margin
      const updates = services.map((service) => {
        const baseRate = service.rate || 0;
        const newPrice = Math.ceil(baseRate * (1 + globalMargin / 100));
        return {
          id: service.id,
          margin: globalMargin,
          price: newPrice,
        };
      });

      for (const update of updates) {
        await supabase
          .from('services')
          .update({ margin: update.margin, price: update.price } as never)
          .eq('id', update.id);
      }

      toast.success(`${services.length}개 서비스에 ${globalMargin}% 마진이 적용되었습니다`);
      setShowMarginDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error applying margin:', error);
      toast.error('마진 적용 중 오류가 발생했습니다');
    } finally {
      setIsApplyingMargin(false);
    }
  };

  // Toggle service active status
  const handleToggleActive = async (serviceId: string, isActive: boolean) => {
    try {
      await supabase
        .from('services')
        .update({ is_active: isActive } as never)
        .eq('id', serviceId);

      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, is_active: isActive } : s))
      );

      toast.success(isActive ? '서비스가 활성화되었습니다' : '서비스가 비활성화되었습니다');
    } catch (error) {
      console.error('Error toggling service:', error);
      toast.error('처리 중 오류가 발생했습니다');
    }
  };

  // Open edit dialog
  const openEditDialog = (service: ServiceWithDetails) => {
    setSelectedService(service);
    setEditForm({
      name: service.name,
      price: service.price,
      margin: service.margin || 0,
      min_quantity: service.min_quantity,
      max_quantity: service.max_quantity,
    });
    setShowEditDialog(true);
  };

  // Handle edit service
  const handleEditService = async () => {
    if (!selectedService) return;

    setIsEditSubmitting(true);
    try {
      const { error } = await supabase
        .from('services')
        .update({
          name: editForm.name,
          price: editForm.price,
          margin: editForm.margin,
          min_quantity: editForm.min_quantity,
          max_quantity: editForm.max_quantity,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', selectedService.id);

      if (error) throw error;

      // Update local state
      setServices((prev) =>
        prev.map((s) =>
          s.id === selectedService.id
            ? { ...s, ...editForm }
            : s
        )
      );

      toast.success('서비스가 수정되었습니다');
      setShowEditDialog(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('서비스 수정에 실패했습니다');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">서비스 관리</h1>
          <p className="text-muted-foreground">
            도매처 서비스 동기화 및 마진 설정
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowMarginDialog(true)}>
            <Percent className="mr-2 h-4 w-4" />
            마진 일괄 설정
          </Button>
          <Button onClick={() => setShowSyncDialog(true)}>
            <Download className="mr-2 h-4 w-4" />
            서비스 동기화
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">전체 서비스</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">활성 서비스</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">플랫폼</p>
                <p className="text-2xl font-bold">{stats.platforms}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Percent className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">평균 마진</p>
                <p className="text-2xl font-bold">{stats.avgMargin}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="서비스명, ID로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="플랫폼" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 플랫폼</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                id="active-only"
                checked={showActiveOnly}
                onCheckedChange={setShowActiveOnly}
              />
              <Label htmlFor="active-only" className="text-sm">활성만</Label>
            </div>
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
              새로고침
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            서비스 목록
            {filteredServices.length > 0 && (
              <Badge variant="outline">{filteredServices.length}개</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="overflow-x-auto -mx-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 w-[50px]">ID</TableHead>
                    <TableHead>서비스명</TableHead>
                    <TableHead>플랫폼</TableHead>
                    <TableHead>원가</TableHead>
                    <TableHead>판매가</TableHead>
                    <TableHead>마진</TableHead>
                    <TableHead>수량</TableHead>
                    <TableHead className="text-center">상태</TableHead>
                    <TableHead className="pr-6 text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id} className={cn(!service.is_active && 'opacity-50')}>
                      <TableCell className="pl-6 font-mono text-xs">
                        {service.provider_service_id}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="font-medium truncate">{service.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {service.category?.name || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {service.platform || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {formatCurrency(service.rate || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(service.price)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={service.margin && service.margin >= 50 ? 'default' : 'secondary'}
                          className={cn(
                            service.margin && service.margin >= 50 && 'bg-emerald-100 text-emerald-700'
                          )}
                        >
                          {service.margin || 0}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {service.min_quantity.toLocaleString()} - {service.max_quantity.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={service.is_active}
                          onCheckedChange={(checked) => handleToggleActive(service.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(service)}
                          title="서비스 수정"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">서비스가 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                도매처에서 서비스를 동기화해주세요
              </p>
              <Button onClick={() => setShowSyncDialog(true)}>
                <Download className="mr-2 h-4 w-4" />
                서비스 동기화
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              도매처 서비스 동기화
            </DialogTitle>
            <DialogDescription>
              도매처 API에서 서비스 목록을 가져와 데이터베이스에 저장합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>도매처 선택</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="도매처를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                      {provider.balance && ` (잔액: ${formatCurrency(provider.balance)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>기본 마진율: {globalMargin}%</Label>
              <Slider
                value={[globalMargin]}
                onValueChange={(v) => setGlobalMargin(v[0])}
                min={0}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                새로 추가되는 서비스에 적용될 기본 마진율입니다.
              </p>
            </div>

            {isSyncing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>동기화 진행 중...</span>
                  <span>{syncProgress.current} / {syncProgress.total}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: syncProgress.total > 0
                        ? `${(syncProgress.current / syncProgress.total) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSyncDialog(false)} disabled={isSyncing}>
              취소
            </Button>
            <Button onClick={handleSyncServices} disabled={isSyncing || !selectedProvider}>
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  동기화 중...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  동기화 시작
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Margin Dialog */}
      <Dialog open={showMarginDialog} onOpenChange={setShowMarginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              마진율 일괄 설정
            </DialogTitle>
            <DialogDescription>
              모든 서비스에 동일한 마진율을 적용합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">주의사항</p>
                  <p>이 작업은 모든 서비스의 판매가격에 영향을 미칩니다.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>마진율: {globalMargin}%</Label>
              <Slider
                value={[globalMargin]}
                onValueChange={(v) => setGlobalMargin(v[0])}
                min={0}
                max={100}
                step={5}
              />
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">적용 대상</div>
                <div className="font-medium">{services.length}개 서비스</div>
                <div className="text-muted-foreground">예시 (원가 1,000원)</div>
                <div className="font-medium">
                  → 판매가 {formatCurrency(Math.ceil(1000 * (1 + globalMargin / 100)))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMarginDialog(false)} disabled={isApplyingMargin}>
              취소
            </Button>
            <Button onClick={handleApplyMargin} disabled={isApplyingMargin}>
              {isApplyingMargin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  적용 중...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  일괄 적용
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              서비스 수정
            </DialogTitle>
            <DialogDescription>
              서비스 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>서비스명</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="서비스명"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>판매가 (원)</Label>
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                  placeholder="판매가"
                />
              </div>
              <div className="space-y-2">
                <Label>마진율 (%)</Label>
                <Input
                  type="number"
                  value={editForm.margin}
                  onChange={(e) => setEditForm({ ...editForm, margin: parseInt(e.target.value) || 0 })}
                  placeholder="마진율"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>최소 수량</Label>
                <Input
                  type="number"
                  value={editForm.min_quantity}
                  onChange={(e) => setEditForm({ ...editForm, min_quantity: parseInt(e.target.value) || 0 })}
                  placeholder="최소 수량"
                />
              </div>
              <div className="space-y-2">
                <Label>최대 수량</Label>
                <Input
                  type="number"
                  value={editForm.max_quantity}
                  onChange={(e) => setEditForm({ ...editForm, max_quantity: parseInt(e.target.value) || 0 })}
                  placeholder="최대 수량"
                />
              </div>
            </div>

            {selectedService && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">서비스 ID</div>
                  <div className="font-mono">{selectedService.provider_service_id}</div>
                  <div className="text-muted-foreground">원가</div>
                  <div>{formatCurrency(selectedService.rate || 0)}</div>
                  <div className="text-muted-foreground">플랫폼</div>
                  <div className="capitalize">{selectedService.platform || '-'}</div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isEditSubmitting}>
              취소
            </Button>
            <Button onClick={handleEditService} disabled={isEditSubmitting}>
              {isEditSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  저장
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
