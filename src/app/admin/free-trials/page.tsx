// ============================================
// 무료 체험 관리 페이지
// admin_products 기반 + API 연결 정보 표시
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Search,
  RefreshCw,
  Gift,
  Users,
  Clock,
  Server,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface Category {
  id: string;
  platform: string;
  name: string;
}

interface Provider {
  id: string;
  name: string;
  slug?: string;
}

interface AdminProduct {
  id: string;
  name: string;
  price_per_1000: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  primary_provider_id: string | null;
  primary_service_id: string | null;
  fallback1_provider_id: string | null;
  fallback1_service_id: string | null;
  fallback2_provider_id: string | null;
  fallback2_service_id: string | null;
  category?: Category;
  primary_provider?: Provider;
}

interface FreeTrialProduct {
  id: string;
  admin_product_id: string;
  trial_quantity: number;
  daily_limit: number;
  today_used: number;
  is_active: boolean;
  created_at: string;
  product?: AdminProduct;
}

interface FreeTrialRequest {
  id: string;
  user_id: string;
  admin_product_id: string;
  link: string;
  quantity: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  user?: { email: string };
  product?: { name: string };
}

export default function FreeTrialsPage() {
  const [trialProducts, setTrialProducts] = useState<FreeTrialProduct[]>([]);
  const [trialRequests, setTrialRequests] = useState<FreeTrialRequest[]>([]);
  const [availableProducts, setAvailableProducts] = useState<AdminProduct[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<FreeTrialProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'requests'>('products');
  const [isLegacyMode, setIsLegacyMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    admin_product_id: '',
    trial_quantity: 50,
    daily_limit: 100,
    is_active: true,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const results = await Promise.allSettled([
        fetch('/api/admin/free-trials?type=trials').then(r => r.json()),
        fetch('/api/admin/free-trials?type=requests').then(r => r.json()),
        fetch('/api/admin/free-trials?type=products').then(r => r.json()),
        fetch('/api/admin/free-trials?type=providers').then(r => r.json()),
      ]);

      const trialsRes = results[0].status === 'fulfilled' ? results[0].value : { success: false };
      const requestsRes = results[1].status === 'fulfilled' ? results[1].value : { success: false };
      const productsRes = results[2].status === 'fulfilled' ? results[2].value : { success: false };
      const providersRes = results[3].status === 'fulfilled' ? results[3].value : { success: false };

      if (trialsRes.success) {
        setTrialProducts(trialsRes.data || []);
        setIsLegacyMode(trialsRes.legacy || false);
      } else {
        console.error('Trials error:', trialsRes.error);
        setTrialProducts([]);
      }

      if (requestsRes.success) {
        setTrialRequests(requestsRes.data || []);
      } else {
        console.error('Requests error:', requestsRes.error);
        setTrialRequests([]);
      }

      if (productsRes.success) {
        setAvailableProducts(productsRes.data || []);
      } else {
        console.error('Products error:', productsRes.error);
        setAvailableProducts([]);
      }

      if (providersRes.success) {
        setProviders(providersRes.data || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setTrialProducts([]);
      setTrialRequests([]);
      setAvailableProducts([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateDialog = () => {
    setSelectedTrial(null);
    setFormData({
      admin_product_id: '',
      trial_quantity: 50,
      daily_limit: 100,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (trial: FreeTrialProduct) => {
    setSelectedTrial(trial);
    setFormData({
      admin_product_id: trial.admin_product_id,
      trial_quantity: trial.trial_quantity,
      daily_limit: trial.daily_limit,
      is_active: trial.is_active,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (trial: FreeTrialProduct) => {
    setSelectedTrial(trial);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.admin_product_id) {
      toast.error('상품을 선택해주세요');
      return;
    }

    setSaving(true);

    try {
      if (selectedTrial) {
        const res = await fetch('/api/admin/free-trials', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedTrial.id,
            trial_quantity: formData.trial_quantity,
            daily_limit: formData.daily_limit,
            is_active: formData.is_active,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        toast.success('무료 체험 설정이 수정되었습니다');
      } else {
        const res = await fetch('/api/admin/free-trials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            admin_product_id: formData.admin_product_id,
            trial_quantity: formData.trial_quantity,
            daily_limit: formData.daily_limit,
            is_active: formData.is_active,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        toast.success('무료 체험 상품이 추가되었습니다');
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTrial) return;

    try {
      const res = await fetch(`/api/admin/free-trials?id=${selectedTrial.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success('무료 체험 설정이 삭제되었습니다');
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '삭제 실패');
    }
  };

  const toggleActive = async (trial: FreeTrialProduct) => {
    try {
      const res = await fetch('/api/admin/free-trials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: trial.id,
          is_active: !trial.is_active,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      fetchData();
      toast.success(trial.is_active ? '비활성화됨' : '활성화됨');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '오류 발생');
    }
  };

  const resetDailyLimits = async () => {
    try {
      const res = await fetch('/api/admin/free-trials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_all_daily_limits',
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      fetchData();
      toast.success('일일 사용량이 초기화되었습니다');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '초기화 실패');
    }
  };

  const getProviderName = (providerId: string | null) => {
    if (!providerId) return '-';
    const provider = providers.find((p) => p.id === providerId);
    return provider?.name || providerId.slice(0, 8);
  };

  const filteredProducts = trialProducts.filter((trial) =>
    trial.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trial.product?.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = trialRequests.filter(
    (request) =>
      request.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.link?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalProducts = trialProducts.length;
  const activeProducts = trialProducts.filter((t) => t.is_active).length;
  const todayUsed = trialProducts.reduce((sum, t) => sum + t.today_used, 0);
  const todayRequests = trialRequests.filter(
    (r) => new Date(r.created_at).toDateString() === new Date().toDateString()
  ).length;
  const apiConnected = trialProducts.filter((t) => t.product?.primary_provider_id).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">대기중</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-blue-500 border-blue-500/50">처리중</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-500 border-green-500/50">완료</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-500 border-red-500/50">실패</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 이미 무료체험 설정된 상품 제외
  const unusedProducts = availableProducts.filter(
    (product) => !trialProducts.some((trial) => trial.admin_product_id === product.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400" />
            무료 체험 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            admin_products 기반 무료 체험 설정 (API 연결 포함)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            체험 상품 추가
          </Button>
        </div>
      </div>

      {/* Legacy Mode Warning */}
      {isLegacyMode && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium text-amber-500">레거시 모드</p>
                <p className="text-sm text-muted-foreground">
                  free_trial_products 테이블이 없습니다. DB 마이그레이션이 필요합니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              전체 상품
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              활성 상품
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-400">
              {activeProducts}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              API 연결됨
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-blue-400">
              {apiConnected}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              오늘 사용량
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-amber-400">
              {todayUsed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              오늘 신청
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-purple-400">
              {todayRequests}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'products' ? 'default' : 'outline'}
          onClick={() => setActiveTab('products')}
        >
          <Gift className="mr-2 h-4 w-4" />
          체험 상품 ({totalProducts})
        </Button>
        <Button
          variant={activeTab === 'requests' ? 'default' : 'outline'}
          onClick={() => setActiveTab('requests')}
        >
          <Users className="mr-2 h-4 w-4" />
          신청 내역 ({trialRequests.length})
        </Button>
        <Button variant="outline" onClick={resetDailyLimits} className="ml-auto">
          <Clock className="mr-2 h-4 w-4" />
          일일 한도 초기화
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === 'products' ? '상품명, 카테고리 검색...' : '이메일, 상품명, 링크 검색...'}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              체험 상품 목록
            </CardTitle>
            <CardDescription>
              무료 체험이 가능한 상품 (API 연결 + 폴백 설정 자동 사용)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">등록된 무료 체험 상품이 없습니다</p>
                <Button className="mt-4" onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  첫 체험 상품 추가하기
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:-mx-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>상태</TableHead>
                      <TableHead>상품명</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>체험 수량</TableHead>
                      <TableHead>일일 한도</TableHead>
                      <TableHead>오늘 사용</TableHead>
                      <TableHead>API 연결</TableHead>
                      <TableHead className="text-right">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((trial) => (
                      <TableRow key={trial.id}>
                        <TableCell>
                          <Switch
                            checked={trial.is_active}
                            onCheckedChange={() => toggleActive(trial)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{trial.product?.name || '알 수 없음'}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(trial.product?.price_per_1000 || 0)}/1K
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {trial.product?.category?.platform} / {trial.product?.category?.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{trial.trial_quantity}개</Badge>
                        </TableCell>
                        <TableCell>{trial.daily_limit}회/일</TableCell>
                        <TableCell>
                          <span className={trial.today_used >= trial.daily_limit ? 'text-red-500' : 'text-amber-400'}>
                            {trial.today_used}회
                          </span>
                          <span className="text-muted-foreground text-xs ml-1">
                            ({Math.max(0, trial.daily_limit - trial.today_used)} 남음)
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            {trial.product?.primary_provider_id ? (
                              <>
                                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                                  {getProviderName(trial.product.primary_provider_id)}
                                </Badge>
                                {trial.product.fallback1_provider_id && (
                                  <>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                    <Badge variant="outline" className="text-xs">
                                      {getProviderName(trial.product.fallback1_provider_id)}
                                    </Badge>
                                  </>
                                )}
                                {trial.product.fallback2_provider_id && (
                                  <>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                    <Badge variant="outline" className="text-xs">
                                      {getProviderName(trial.product.fallback2_provider_id)}
                                    </Badge>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="text-red-400">미연결</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(trial)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(trial)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <Card>
          <CardHeader>
            <CardTitle>신청 내역</CardTitle>
            <CardDescription>
              최근 100건의 무료 체험 신청 내역
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">무료 체험 신청 내역이 없습니다</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:-mx-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>신청자</TableHead>
                      <TableHead>상품</TableHead>
                      <TableHead>링크</TableHead>
                      <TableHead>수량</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>신청일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">{request.user?.email || '알 수 없음'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{request.product?.name || '알 수 없음'}</div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={request.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline text-sm truncate max-w-[200px] block"
                          >
                            {request.link}
                          </a>
                        </TableCell>
                        <TableCell>{request.quantity}개</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleString('ko-KR')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              {selectedTrial ? '체험 설정 수정' : '새 체험 상품 추가'}
            </DialogTitle>
            <DialogDescription>
              admin_products에서 상품을 선택하면 해당 상품의 API 설정(폴백 포함)이 자동으로 사용됩니다
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 상품 선택 */}
            <div className="space-y-2">
              <Label htmlFor="admin_product_id">상품 선택 *</Label>
              <Select
                value={formData.admin_product_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, admin_product_id: value })
                }
                disabled={!!selectedTrial}
              >
                <SelectTrigger>
                  <SelectValue placeholder="무료 체험할 상품 선택" />
                </SelectTrigger>
                <SelectContent>
                  {(selectedTrial ? availableProducts : unusedProducts).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <span>[{product.category?.platform}]</span>
                        <span>{product.name}</span>
                        <span className="text-muted-foreground">
                          ({formatCurrency(product.price_per_1000)}/1K)
                        </span>
                        {product.primary_provider_id && (
                          <Badge variant="secondary" className="text-[10px] ml-1">
                            API
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTrial && (
                <p className="text-xs text-muted-foreground">
                  상품은 수정할 수 없습니다. 삭제 후 다시 추가해주세요.
                </p>
              )}
            </div>

            {/* 선택된 상품 API 정보 표시 */}
            {formData.admin_product_id && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    API 연결 정보 (자동 사용)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(() => {
                    const product = availableProducts.find(p => p.id === formData.admin_product_id);
                    if (!product) return <p className="text-sm text-muted-foreground">상품 정보 없음</p>;

                    return (
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.primary_provider_id ? (
                          <>
                            <Badge className="bg-green-600">
                              1순위: {getProviderName(product.primary_provider_id)}
                              {product.primary_service_id && ` (${product.primary_service_id})`}
                            </Badge>
                            {product.fallback1_provider_id && (
                              <>
                                <ArrowRight className="h-4 w-4" />
                                <Badge className="bg-amber-600">
                                  2순위: {getProviderName(product.fallback1_provider_id)}
                                </Badge>
                              </>
                            )}
                            {product.fallback2_provider_id && (
                              <>
                                <ArrowRight className="h-4 w-4" />
                                <Badge className="bg-red-600">
                                  3순위: {getProviderName(product.fallback2_provider_id)}
                                </Badge>
                              </>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-amber-400">
                            ⚠️ API 미연결 상품입니다. /admin/products에서 API를 연결해주세요.
                          </p>
                        )}
                      </div>
                    );
                  })()}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    1순위 API 실패 시 자동으로 2순위 → 3순위 순으로 시도합니다
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 수량 설정 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trial_quantity">체험 수량</Label>
                <Input
                  id="trial_quantity"
                  type="number"
                  placeholder="50"
                  value={formData.trial_quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trial_quantity: parseInt(e.target.value) || 50,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  1회 체험 시 제공되는 수량
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily_limit">일일 한도</Label>
                <Input
                  id="daily_limit"
                  type="number"
                  placeholder="100"
                  value={formData.daily_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      daily_limit: parseInt(e.target.value) || 100,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  하루 최대 제공 횟수
                </p>
              </div>
            </div>

            {/* 활성화 */}
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active">활성화</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedTrial ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>체험 설정 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말 &quot;{selectedTrial?.product?.name}&quot; 무료 체험 설정을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
