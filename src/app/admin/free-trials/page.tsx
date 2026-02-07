// ============================================
// 무료 체험 관리 페이지
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
  TrendingUp,
  Clock,
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

interface Service {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
}

interface FreeTrialService {
  id: string;
  service_id: string;
  trial_quantity: number;
  daily_limit: number;
  today_used: number;
  is_active: boolean;
  created_at: string;
  service?: Service;
}

interface FreeTrialRequest {
  id: string;
  user_id: string;
  service_id: string;
  link: string;
  quantity: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  user?: {
    email: string;
  };
  service?: {
    name: string;
  };
}

export default function FreeTrialsPage() {
  const [trialServices, setTrialServices] = useState<FreeTrialService[]>([]);
  const [trialRequests, setTrialRequests] = useState<FreeTrialRequest[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<FreeTrialService | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'services' | 'requests'>('services');

  // Form state
  const [formData, setFormData] = useState({
    service_id: '',
    trial_quantity: 50,
    daily_limit: 100,
    is_active: true,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      // Fetch all data in parallel using admin API
      const results = await Promise.allSettled([
        fetch('/api/admin/free-trials?type=services').then(r => r.json()),
        fetch('/api/admin/free-trials?type=requests').then(r => r.json()),
        fetch('/api/admin/free-trials?type=all-services').then(r => r.json()),
      ]);

      // Extract results with fallbacks
      const trialServicesRes = results[0].status === 'fulfilled' ? results[0].value : { success: false };
      const requestsRes = results[1].status === 'fulfilled' ? results[1].value : { success: false };
      const servicesListRes = results[2].status === 'fulfilled' ? results[2].value : { success: false };

      if (!trialServicesRes.success) {
        console.error('Trial services error:', trialServicesRes.error);
        setTrialServices([]);
      } else {
        setTrialServices(trialServicesRes.data || []);
      }

      if (!requestsRes.success) {
        console.error('Requests error:', requestsRes.error);
        setTrialRequests([]);
      } else {
        setTrialRequests(requestsRes.data || []);
      }

      if (!servicesListRes.success) {
        console.error('Services list error:', servicesListRes.error);
      } else {
        setServices(servicesListRes.data || []);
      }
    } catch (error) {
      console.error('Unexpected fetch error:', error);
      setTrialServices([]);
      setTrialRequests([]);
      setServices([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateDialog = () => {
    setSelectedService(null);
    setFormData({
      service_id: '',
      trial_quantity: 50,
      daily_limit: 100,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: FreeTrialService) => {
    setSelectedService(service);
    setFormData({
      service_id: service.service_id,
      trial_quantity: service.trial_quantity,
      daily_limit: service.daily_limit,
      is_active: service.is_active,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (service: FreeTrialService) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.service_id) {
      toast.error('상품을 선택해주세요');
      return;
    }

    setSaving(true);

    try {
      if (selectedService) {
        // Update existing
        const res = await fetch('/api/admin/free-trials', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedService.id,
            trial_quantity: formData.trial_quantity,
            daily_limit: formData.daily_limit,
            is_active: formData.is_active,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        toast.success('무료 체험 서비스가 수정되었습니다');
      } else {
        // Create new
        const res = await fetch('/api/admin/free-trials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: formData.service_id,
            trial_quantity: formData.trial_quantity,
            daily_limit: formData.daily_limit,
            is_active: formData.is_active,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        toast.success('무료 체험 서비스가 추가되었습니다');
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
    if (!selectedService) return;

    try {
      const res = await fetch(`/api/admin/free-trials?id=${selectedService.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success('무료 체험 서비스가 삭제되었습니다');
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '삭제 실패');
    }
  };

  const toggleActive = async (service: FreeTrialService) => {
    try {
      const res = await fetch('/api/admin/free-trials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: service.id,
          is_active: !service.is_active,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      fetchData();
      toast.success(service.is_active ? '비활성화됨' : '활성화됨');
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

  const filteredServices = trialServices.filter((trialService) =>
    trialService.service?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = trialRequests.filter(
    (request) =>
      request.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.link?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalServices = trialServices.length;
  const activeServices = trialServices.filter((s) => s.is_active).length;
  const todayUsed = trialServices.reduce((sum, s) => sum + s.today_used, 0);
  const todayRequests = trialRequests.filter(
    (r) => new Date(r.created_at).toDateString() === new Date().toDateString()
  ).length;

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
            무료 체험 서비스 및 신청 내역을 관리합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            체험 서비스 추가
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              전체 서비스
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{totalServices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              활성 서비스
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-400">
              {activeServices}
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
            <div className="text-lg sm:text-2xl font-bold text-blue-400">
              {todayRequests}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'services' ? 'default' : 'outline'}
          onClick={() => setActiveTab('services')}
        >
          <Gift className="mr-2 h-4 w-4" />
          체험 서비스 ({totalServices})
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
              placeholder={activeTab === 'services' ? '상품명 검색...' : '이메일, 상품명, 링크 검색...'}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <Card>
          <CardHeader>
            <CardTitle>체험 서비스 목록</CardTitle>
            <CardDescription>
              무료 체험이 가능한 서비스를 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">등록된 무료 체험 서비스가 없습니다</p>
                <Button className="mt-4" onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  첫 체험 서비스 추가하기
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:-mx-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>상태</TableHead>
                      <TableHead>상품명</TableHead>
                      <TableHead>체험 수량</TableHead>
                      <TableHead>일일 한도</TableHead>
                      <TableHead>오늘 사용</TableHead>
                      <TableHead>남은 수량</TableHead>
                      <TableHead className="text-right">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <Switch
                            checked={service.is_active}
                            onCheckedChange={() => toggleActive(service)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{service.service?.name || '알 수 없음'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{service.trial_quantity}개</Badge>
                        </TableCell>
                        <TableCell>{service.daily_limit}회/일</TableCell>
                        <TableCell>
                          <span className={service.today_used >= service.daily_limit ? 'text-red-500' : 'text-amber-400'}>
                            {service.today_used}회
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={service.daily_limit - service.today_used <= 0 ? 'text-red-500' : 'text-green-400'}>
                            {Math.max(0, service.daily_limit - service.today_used)}회
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(service)}
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
                          <div className="text-sm">{request.service?.name || '알 수 없음'}</div>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedService ? '체험 서비스 수정' : '새 체험 서비스 추가'}
            </DialogTitle>
            <DialogDescription>
              무료 체험으로 제공할 상품과 수량을 설정합니다
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="service_id">상품 선택 *</Label>
              <Select
                value={formData.service_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, service_id: value })
                }
                disabled={!!selectedService}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상품 선택" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((svc) => (
                    <SelectItem key={svc.id} value={svc.id}>
                      {svc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedService && (
                <p className="text-xs text-muted-foreground">
                  상품은 수정할 수 없습니다. 삭제 후 다시 추가해주세요.
                </p>
              )}
            </div>

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
              {selectedService ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>체험 서비스 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말 이 무료 체험 서비스를 삭제하시겠습니까?
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
