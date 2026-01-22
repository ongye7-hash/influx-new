// ============================================
// 설정 페이지
// 프로필 수정, 비밀번호 변경, API 키 관리
// ============================================

'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Shield,
  Key,
  Bell,
  Crown,
  CheckCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  Code,
  Trash2,
  Plus,
  ExternalLink,
  AlertTriangle,
  Wallet,
  Send,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { formatCurrency, cn } from '@/lib/utils';

// ============================================
// 등급 설정
// ============================================
const TIER_CONFIG = {
  basic: {
    label: '일반',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    discount: 0,
    nextTier: 'vip',
    requirement: 500000,
  },
  vip: {
    label: 'VIP',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    discount: 5,
    nextTier: 'premium',
    requirement: 2000000,
  },
  premium: {
    label: '프리미엄',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    discount: 10,
    nextTier: 'enterprise',
    requirement: 5000000,
  },
  enterprise: {
    label: '엔터프라이즈',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    discount: 15,
    nextTier: null,
    requirement: null,
  },
};

// ============================================
// API 키 생성 함수
// ============================================
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'influx_';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + key;
}

// ============================================
// 메인 컴포넌트
// ============================================
export default function SettingsPage() {
  const { profile, refreshProfile, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // 프로필 수정 상태
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // 비밀번호 변경 상태
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 알림 설정 상태
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);
  const [balanceAlertEnabled, setBalanceAlertEnabled] = useState(false);
  const [balanceAlertThreshold, setBalanceAlertThreshold] = useState(10000);
  const [telegramNotifications, setTelegramNotifications] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState('');

  // API 키 상태
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [apiKeyCreatedAt, setApiKeyCreatedAt] = useState<string | null>(null);

  // 추천 코드 생성 함수
  const generateReferralCode = async (userId: string) => {
    const code = 'INF' + Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ referral_code: code } as never)
        .eq('id', userId);

      if (!error) {
        await refreshProfile();
        toast.success('추천 코드가 생성되었습니다!');
      }
    } catch (err) {
      console.error('Failed to generate referral code:', err);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || profile.full_name || '');
      setPhone(profile.phone || '');
      // API 키 로드 (로컬 스토리지에서)
      const savedKey = localStorage.getItem(`api_key_${profile.id}`);
      const savedKeyDate = localStorage.getItem(`api_key_date_${profile.id}`);
      if (savedKey) {
        setApiKey(savedKey);
        setApiKeyCreatedAt(savedKeyDate);
      }

      // 추천 코드가 없으면 자동 생성
      if (!profile.referral_code) {
        generateReferralCode(profile.id);
      }
    }
  }, [profile]);

  // 프로필 업데이트
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.id) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setIsUpdatingProfile(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim() || null,
          full_name: username.trim() || null,
          phone: phone.trim() || null,
        } as never)
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('프로필이 업데이트되었습니다');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('프로필 업데이트에 실패했습니다');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다');
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('비밀번호가 변경되었습니다');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('비밀번호 변경에 실패했습니다');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // API 키 생성
  const handleGenerateApiKey = async () => {
    if (!profile?.id) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setIsGeneratingKey(true);

    try {
      const newKey = generateApiKey();
      const now = new Date().toISOString();

      // 로컬 스토리지에 저장 (실제 서비스에서는 서버에 저장)
      localStorage.setItem(`api_key_${profile.id}`, newKey);
      localStorage.setItem(`api_key_date_${profile.id}`, now);

      setApiKey(newKey);
      setApiKeyCreatedAt(now);
      setShowApiKey(true);

      toast.success('API 키가 생성되었습니다', {
        description: '키를 안전한 곳에 저장하세요. 다시 확인할 수 없습니다.',
      });
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error('API 키 생성에 실패했습니다');
    } finally {
      setIsGeneratingKey(false);
    }
  };

  // API 키 삭제
  const handleDeleteApiKey = () => {
    if (!profile?.id) return;

    localStorage.removeItem(`api_key_${profile.id}`);
    localStorage.removeItem(`api_key_date_${profile.id}`);
    setApiKey(null);
    setApiKeyCreatedAt(null);
    setShowDeleteDialog(false);
    toast.success('API 키가 삭제되었습니다');
  };

  // API 키 복사
  const handleCopyApiKey = async () => {
    if (!apiKey) return;

    try {
      await navigator.clipboard.writeText(apiKey);
      toast.success('API 키가 복사되었습니다');
    } catch {
      toast.error('복사에 실패했습니다');
    }
  };

  const tier = TIER_CONFIG[profile?.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.basic;
  const totalSpent = profile?.total_spent || 0;
  const progressToNextTier = tier.requirement
    ? Math.min(100, (totalSpent / tier.requirement) * 100)
    : 100;

  // API 키 마스킹
  const maskedApiKey = apiKey
    ? showApiKey
      ? apiKey
      : apiKey.substring(0, 12) + '•'.repeat(20) + apiKey.substring(apiKey.length - 4)
    : null;

  // 로딩 상태
  if (authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground mt-1">
          계정 설정 및 환경설정을 관리합니다
        </p>
      </div>

      {/* 회원 등급 카드 */}
      <Card className="overflow-hidden">
        <div className={cn("p-6", tier.bg)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center",
                "bg-white/80 shadow-lg"
              )}>
                <Crown className={cn("h-8 w-8", tier.color)} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={cn(tier.bg, tier.color, "border-0 text-sm px-3 py-1")}>
                    {tier.label}
                  </Badge>
                  {tier.discount > 0 && (
                    <Badge variant="secondary" className="bg-white/80">
                      {tier.discount}% 할인
                    </Badge>
                  )}
                </div>
                <p className={cn("text-sm mt-1", tier.color)}>
                  누적 충전: {formatCurrency(totalSpent)}
                </p>
              </div>
            </div>
          </div>

          {/* 다음 등급 진행바 */}
          {tier.nextTier && tier.requirement && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className={tier.color}>다음 등급까지</span>
                <span className={tier.color}>
                  {formatCurrency(Math.max(0, tier.requirement - totalSpent))} 남음
                </span>
              </div>
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressToNextTier}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 탭 콘텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">프로필</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">보안</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">알림</span>
          </TabsTrigger>
        </TabsList>

        {/* 프로필 탭 */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>프로필 정보</CardTitle>
              <CardDescription>
                기본 프로필 정보를 수정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    이메일
                  </Label>
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    이메일은 변경할 수 없습니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    이름 / 닉네임
                  </Label>
                  <Input
                    id="username"
                    placeholder="이름 또는 닉네임을 입력하세요"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    연락처
                  </Label>
                  <Input
                    id="phone"
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    추천인 코드
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={profile?.referral_code || '생성되지 않음'}
                      disabled
                      className="bg-muted font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (profile?.referral_code) {
                          navigator.clipboard.writeText(profile.referral_code);
                          toast.success('추천인 코드가 복사되었습니다');
                        }
                      }}
                    >
                      복사
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    친구에게 이 코드를 공유하면 혜택을 받을 수 있습니다.
                  </p>
                </div>

                <Button type="submit" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      변경사항 저장
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 보안 탭 */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>비밀번호 변경</CardTitle>
              <CardDescription>
                계정 보안을 위해 주기적으로 비밀번호를 변경하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">새 비밀번호</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="새 비밀번호 (6자 이상)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="새 비밀번호 다시 입력"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      비밀번호가 일치하지 않습니다
                    </p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      비밀번호가 일치합니다
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isChangingPassword || !newPassword || newPassword !== confirmPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      변경 중...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      비밀번호 변경
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 계정 정보 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>계정 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">가입일</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">총 주문 건수</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.total_orders || 0}건
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">현재 잔액</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(profile?.balance || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API 탭 */}
        <TabsContent value="api" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                API 키 관리
              </CardTitle>
              <CardDescription>
                외부 시스템과 연동하기 위한 API 키를 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {apiKey ? (
                <>
                  {/* 기존 API 키 표시 */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-primary" />
                          <span className="font-medium">API 키</span>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          활성
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-background rounded-lg font-mono text-sm break-all">
                          {maskedApiKey}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowApiKey(!showApiKey)}
                          title={showApiKey ? '숨기기' : '보기'}
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopyApiKey}
                          title="복사"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      {apiKeyCreatedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          생성일: {new Date(apiKeyCreatedAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleGenerateApiKey}
                        disabled={isGeneratingKey}
                      >
                        <RefreshCw className={cn("mr-2 h-4 w-4", isGeneratingKey && "animate-spin")} />
                        키 재발급
                      </Button>
                      <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        키 삭제
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* API 키 없음 */}
                  <div className="text-center py-8">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Key className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-2">API 키가 없습니다</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      API 키를 생성하여 외부 시스템과 연동하세요.
                    </p>
                    <Button onClick={handleGenerateApiKey} disabled={isGeneratingKey}>
                      {isGeneratingKey ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          생성 중...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          API 키 생성
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}

              <Separator />

              {/* 주의사항 */}
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-amber-800">API 키 보안 안내</p>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• API 키는 비밀번호처럼 안전하게 보관하세요.</li>
                      <li>• 키가 노출된 경우 즉시 재발급하세요.</li>
                      <li>• 키를 코드에 직접 포함하지 마세요.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API 문서 */}
          <Card>
            <CardHeader>
              <CardTitle>API 사용 가이드</CardTitle>
              <CardDescription>
                INFLUX API를 사용하여 주문을 자동화하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Base URL</h4>
                <code className="block p-3 bg-muted rounded-lg font-mono text-sm">
                  https://www.influx-lab.com/api/v1
                </code>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">인증 방법</h4>
                <p className="text-sm text-muted-foreground">
                  모든 API 요청에 헤더로 API 키를 포함해야 합니다.
                </p>
                <code className="block p-3 bg-muted rounded-lg font-mono text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">주요 엔드포인트</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-green-50 text-green-700">GET</Badge>
                      <code className="font-mono text-sm">/services</code>
                    </div>
                    <p className="text-sm text-muted-foreground">서비스 목록 조회</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">POST</Badge>
                      <code className="font-mono text-sm">/orders</code>
                    </div>
                    <p className="text-sm text-muted-foreground">새 주문 생성</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-green-50 text-green-700">GET</Badge>
                      <code className="font-mono text-sm">/orders/:id</code>
                    </div>
                    <p className="text-sm text-muted-foreground">주문 상태 조회</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-green-50 text-green-700">GET</Badge>
                      <code className="font-mono text-sm">/balance</code>
                    </div>
                    <p className="text-sm text-muted-foreground">잔액 조회</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">주문 생성 예시</h4>
                <pre className="p-4 bg-muted rounded-lg font-mono text-sm overflow-x-auto">
{`curl -X POST https://www.influx-lab.com/api/v1/orders \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service_id": "SERVICE_ID",
    "link": "https://youtube.com/watch?v=VIDEO_ID",
    "quantity": 1000
  }'`}
                </pre>
              </div>

              <Button variant="outline" className="w-full" onClick={() => window.open('/api-docs', '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                전체 API 문서 보기
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 알림 탭 */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          {/* 이메일 알림 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                이메일 알림
              </CardTitle>
              <CardDescription>
                이메일로 받고 싶은 알림을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>이메일 알림 활성화</Label>
                  <p className="text-sm text-muted-foreground">
                    중요 알림을 이메일로 받습니다.
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>주문 상태 알림</Label>
                  <p className="text-sm text-muted-foreground">
                    주문 처리 상태 변경 시 알림을 받습니다.
                  </p>
                </div>
                <Switch
                  checked={orderNotifications}
                  onCheckedChange={setOrderNotifications}
                  disabled={!emailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>마케팅 알림</Label>
                  <p className="text-sm text-muted-foreground">
                    이벤트 및 프로모션 정보를 받습니다.
                  </p>
                </div>
                <Switch
                  checked={marketingNotifications}
                  onCheckedChange={setMarketingNotifications}
                  disabled={!emailNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* 텔레그램 알림 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                텔레그램 알림
              </CardTitle>
              <CardDescription>
                텔레그램으로 실시간 알림을 받습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>텔레그램 알림 활성화</Label>
                  <p className="text-sm text-muted-foreground">
                    텔레그램으로 주문 상태 알림을 받습니다.
                  </p>
                </div>
                <Switch
                  checked={telegramNotifications}
                  onCheckedChange={setTelegramNotifications}
                />
              </div>

              {telegramNotifications && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="telegramChatId">텔레그램 Chat ID</Label>
                    <Input
                      id="telegramChatId"
                      placeholder="@username 또는 Chat ID"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      텔레그램에서 @influx_bot을 찾아 /start를 보내면 Chat ID를 받을 수 있습니다.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 잔액 부족 알림 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                잔액 부족 알림
              </CardTitle>
              <CardDescription>
                잔액이 설정 금액 이하로 떨어지면 알림을 받습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>잔액 부족 알림 활성화</Label>
                  <p className="text-sm text-muted-foreground">
                    잔액이 부족해지면 알림을 받습니다.
                  </p>
                </div>
                <Switch
                  checked={balanceAlertEnabled}
                  onCheckedChange={setBalanceAlertEnabled}
                />
              </div>

              {balanceAlertEnabled && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="balanceThreshold" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      알림 기준 금액
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="balanceThreshold"
                        type="number"
                        min={0}
                        step={1000}
                        placeholder="10000"
                        value={balanceAlertThreshold}
                        onChange={(e) => setBalanceAlertThreshold(parseInt(e.target.value) || 0)}
                        className="flex-1"
                      />
                      <span className="flex items-center text-muted-foreground">원</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      잔액이 {formatCurrency(balanceAlertThreshold)} 이하로 떨어지면 알림을 보내드립니다.
                    </p>
                  </div>

                  {/* 빠른 설정 버튼 */}
                  <div className="flex flex-wrap gap-2">
                    {[5000, 10000, 30000, 50000, 100000].map((amount) => (
                      <Button
                        key={amount}
                        variant={balanceAlertThreshold === amount ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBalanceAlertThreshold(amount)}
                      >
                        {formatCurrency(amount)}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <Button
            onClick={() => {
              // 로컬 스토리지에 알림 설정 저장
              if (profile?.id) {
                const settings = {
                  emailNotifications,
                  orderNotifications,
                  marketingNotifications,
                  telegramNotifications,
                  telegramChatId,
                  balanceAlertEnabled,
                  balanceAlertThreshold,
                };
                localStorage.setItem(`notification_settings_${profile.id}`, JSON.stringify(settings));
              }
              toast.success('알림 설정이 저장되었습니다');
            }}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            모든 알림 설정 저장
          </Button>
        </TabsContent>
      </Tabs>

      {/* API 키 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>API 키를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 삭제된 API 키로는 더 이상 API에 접근할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApiKey}
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
