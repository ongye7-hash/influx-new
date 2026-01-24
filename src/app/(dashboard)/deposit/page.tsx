// ============================================
// 충전하기 페이지 (리모델링)
// 무통장 입금 + USDT 실시간 시세 충전
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  Building2,
  Copy,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  CreditCard,
  RefreshCw,
  Bitcoin,
  AlertTriangle,
  ExternalLink,
  Calculator,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatRelativeTime, copyToClipboard, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Deposit, PaymentMethod } from '@/types/database';

// ============================================
// 설정값
// ============================================
const BANK_INFO = {
  bankName: '하나은행',
  accountNumber: '260-910802-69907',
  accountHolder: 'ㅂㅈㅎ',
};

// USDT TRC-20 지갑 주소 (환경변수 또는 상수)
const USDT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_USDT_WALLET_ADDRESS || 'TYourTRC20WalletAddressHere123456789';

const QUICK_AMOUNTS = [
  { value: 10000, label: '1만원' },
  { value: 30000, label: '3만원' },
  { value: 50000, label: '5만원', popular: true },
  { value: 100000, label: '10만원' },
  { value: 300000, label: '30만원' },
  { value: 500000, label: '50만원' },
];

// ============================================
// Types
// ============================================
interface ExchangeRate {
  marketRate: number;
  systemRate: number;
  spreadPercent: number;
  source: 'coingecko' | 'fallback';
  updatedAt: string;
}

// ============================================
// 상태 뱃지 컴포넌트
// ============================================
function StatusBadge({ status }: { status: Deposit['status'] }) {
  const configs = {
    pending: {
      label: '대기중',
      icon: Clock,
      className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
    },
    approved: {
      label: '승인완료',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    },
    rejected: {
      label: '거절됨',
      icon: XCircle,
      className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
    },
    canceled: {
      label: '취소됨',
      icon: XCircle,
      className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400',
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1', config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// ============================================
// 결제수단 뱃지
// ============================================
function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  if (method === 'crypto') {
    return (
      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
        <Bitcoin className="h-3 w-3 mr-1" />
        USDT
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
      <Building2 className="h-3 w-3 mr-1" />
      무통장
    </Badge>
  );
}

// ============================================
// 충전하기 페이지 컴포넌트
// ============================================
export default function DepositPage() {
  const { profile, refreshProfile, isLoading: authLoading } = useAuth();
  const balance = profile?.balance || 0;

  // 공통 상태
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState(true);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [activeTab, setActiveTab] = useState<'bank' | 'crypto' | 'kakaopay'>('bank');

  // 무통장 입금 상태
  const [bankDepositorName, setBankDepositorName] = useState('');
  const [bankAmount, setBankAmount] = useState<number>(0);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [isBankSubmitting, setIsBankSubmitting] = useState(false);

  // USDT 충전 상태
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [cryptoKrwAmount, setCryptoKrwAmount] = useState<number>(0);
  const [cryptoTxId, setCryptoTxId] = useState('');
  const [isCryptoSubmitting, setIsCryptoSubmitting] = useState(false);

  // 카카오페이 상태
  const [isKakaopayLoading, setIsKakaopayLoading] = useState(false);

  // 계산된 USDT 수량
  const calculatedUsdtAmount = exchangeRate && cryptoKrwAmount > 0
    ? (cryptoKrwAmount / exchangeRate.systemRate).toFixed(2)
    : '0.00';

  // ============================================
  // 환율 API 호출
  // ============================================
  const fetchExchangeRate = useCallback(async () => {
    setIsLoadingRate(true);
    try {
      const response = await fetch('/api/crypto/exchange-rate');
      const result = await response.json();

      if (result.success) {
        setExchangeRate(result.data);
      } else {
        toast.error('환율 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('Exchange rate fetch error:', error);
      toast.error('환율 정보 로딩 실패');
    } finally {
      setIsLoadingRate(false);
    }
  }, []);

  // ============================================
  // 입금 내역 조회
  // ============================================
  const fetchDeposits = useCallback(async () => {
    if (!profile?.id) {
      setIsLoadingDeposits(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const depositsData = (data || []) as Deposit[];
      setDeposits(depositsData);

      // 이번 달 총 충전액
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const monthlyTotal = depositsData
        .filter(d => d.status === 'approved' && new Date(d.created_at) >= thisMonth)
        .reduce((sum, d) => sum + d.amount, 0);

      setTotalDeposited(monthlyTotal);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setIsLoadingDeposits(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchDeposits();
    fetchExchangeRate();

    // 60초마다 환율 갱신
    const rateInterval = setInterval(fetchExchangeRate, 60000);
    return () => clearInterval(rateInterval);
  }, [fetchDeposits, fetchExchangeRate]);

  // ============================================
  // 무통장 입금 핸들러
  // ============================================
  const handleQuickAmountSelect = (value: number) => {
    setSelectedQuickAmount(value);
    setBankAmount(value);
  };

  const handleBankAmountChange = (value: string) => {
    const numValue = parseInt(value.replace(/,/g, ''), 10) || 0;
    setBankAmount(numValue);
    setSelectedQuickAmount(null);
  };

  const handleCopyAccount = async () => {
    const success = await copyToClipboard(BANK_INFO.accountNumber);
    if (success) {
      toast.success('계좌번호가 복사되었습니다');
    }
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.id) {
      toast.error('로그인이 필요합니다');
      return;
    }

    if (!bankDepositorName.trim()) {
      toast.error('입금자명을 입력해주세요');
      return;
    }

    if (bankAmount < 10000) {
      toast.error('최소 충전 금액은 10,000원입니다');
      return;
    }

    setIsBankSubmitting(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('deposits') as any).insert({
        user_id: profile.id,
        amount: bankAmount,
        depositor_name: bankDepositorName.trim(),
        payment_method: 'bank_transfer',
        status: 'pending',
      });

      if (error) throw error;

      toast.success('충전 신청이 완료되었습니다!', {
        description: '입금 확인 후 자동으로 충전됩니다.',
      });

      setBankDepositorName('');
      setBankAmount(0);
      setSelectedQuickAmount(null);
      fetchDeposits();
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      toast.error('충전 신청 중 오류가 발생했습니다', { description: message });
    } finally {
      setIsBankSubmitting(false);
    }
  };

  // ============================================
  // 카카오페이 결제 핸들러
  // ============================================
  const handleKakaopayPayment = async () => {
    if (bankAmount < 1000) {
      toast.error('최소 1,000원 이상 결제 가능합니다.');
      return;
    }

    setIsKakaopayLoading(true);

    try {
      const response = await fetch('/api/kakaopay/ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: bankAmount }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || '결제 준비에 실패했습니다.');
        return;
      }

      // 모바일/PC 구분하여 리다이렉트
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const redirectUrl = isMobile
        ? data.data.next_redirect_mobile_url
        : data.data.next_redirect_pc_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        toast.error('결제 페이지 URL을 받지 못했습니다.');
      }
    } catch (error) {
      console.error('Kakaopay error:', error);
      toast.error('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsKakaopayLoading(false);
    }
  };

  // ============================================
  // USDT 충전 핸들러
  // ============================================
  const handleCopyWalletAddress = async () => {
    const success = await copyToClipboard(USDT_WALLET_ADDRESS);
    if (success) {
      toast.success('지갑 주소가 복사되었습니다');
    }
  };

  const handleCryptoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.id) {
      toast.error('로그인이 필요합니다');
      return;
    }

    if (!cryptoTxId.trim() || cryptoTxId.trim().length < 10) {
      toast.error('유효한 TXID(거래 해시)를 입력해주세요', {
        description: '최소 10자 이상이어야 합니다.',
      });
      return;
    }

    if (cryptoKrwAmount < 10000) {
      toast.error('최소 충전 금액은 10,000원입니다');
      return;
    }

    if (!exchangeRate) {
      toast.error('환율 정보가 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsCryptoSubmitting(true);

    try {
      const usdtAmount = parseFloat(calculatedUsdtAmount);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('deposits') as any).insert({
        user_id: profile.id,
        amount: cryptoKrwAmount,
        depositor_name: cryptoTxId.trim().substring(0, 20), // TXID 앞부분을 식별자로
        payment_method: 'crypto',
        tx_id: cryptoTxId.trim(),
        exchange_rate: exchangeRate.systemRate,
        crypto_amount: usdtAmount,
        crypto_currency: 'USDT',
        network: 'TRC-20',
        status: 'pending',
      });

      if (error) {
        if (error.message.includes('unique') || error.message.includes('duplicate')) {
          toast.error('이미 등록된 TXID입니다', {
            description: '동일한 거래 해시로 중복 신청할 수 없습니다.',
          });
          return;
        }
        throw error;
      }

      toast.success('USDT 충전 신청이 완료되었습니다!', {
        description: '블록체인 확인 후 충전됩니다. (보통 1-10분 소요)',
      });

      setCryptoTxId('');
      setCryptoKrwAmount(0);
      fetchDeposits();
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      toast.error('충전 신청 중 오류가 발생했습니다', { description: message });
    } finally {
      setIsCryptoSubmitting(false);
    }
  };

  // ============================================
  // 새로고침
  // ============================================
  const handleRefresh = async () => {
    setIsLoadingDeposits(true);
    await Promise.all([fetchDeposits(), fetchExchangeRate(), refreshProfile()]);
    toast.success('새로고침 완료');
  };

  // 로딩 상태
  if (authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-14 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">잔액 충전</h1>
          <p className="text-muted-foreground mt-1">
            원하는 방식으로 충전하세요
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* 현재 잔액 카드 */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-r from-primary via-primary to-accent p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <Wallet className="h-5 w-5" />
                <span className="text-sm font-medium">현재 보유 잔액</span>
              </div>
              <div className="text-4xl sm:text-5xl font-bold">
                {formatCurrency(balance)}
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
              <TrendingUp className="h-5 w-5" />
              <div className="text-sm">
                <p className="text-white/80">이번 달 충전</p>
                <p className="font-semibold">{formatCurrency(totalDeposited)}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 충전 방식 탭 */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'bank' | 'crypto' | 'kakaopay')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-14">
          <TabsTrigger value="bank" className="text-base gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Building2 className="h-5 w-5" />
            <span className="hidden sm:inline">무통장 입금</span>
            <span className="sm:hidden">무통장</span>
          </TabsTrigger>
          <TabsTrigger value="kakaopay" className="text-base gap-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
            <Wallet className="h-5 w-5" />
            <span className="hidden sm:inline">카카오페이</span>
            <span className="sm:hidden">카카오</span>
          </TabsTrigger>
          <TabsTrigger value="crypto" className="text-base gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Bitcoin className="h-5 w-5" />
            <span className="hidden sm:inline">USDT 충전</span>
            <span className="sm:hidden">USDT</span>
          </TabsTrigger>
        </TabsList>

        {/* ============================================ */}
        {/* Tab 1: 무통장 입금 */}
        {/* ============================================ */}
        <TabsContent value="bank" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 입금 계좌 정보 */}
            <Card className="border-2 border-primary/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  입금 계좌 정보
                </CardTitle>
                <CardDescription>
                  아래 계좌로 입금해 주시면 자동으로 충전됩니다
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">은행</span>
                      <span className="font-semibold text-lg">{BANK_INFO.bankName}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">계좌번호</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg sm:text-xl tracking-wider">
                          {BANK_INFO.accountNumber}
                        </span>
                        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopyAccount}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">예금주</span>
                      <span className="font-semibold text-lg">{BANK_INFO.accountHolder}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    입금자명을 아래 폼에 입력한 것과 <strong>동일하게</strong> 입력해 주세요.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 충전 신청 폼 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  충전 신청
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBankSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="bankDepositorName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      입금자명
                    </Label>
                    <Input
                      id="bankDepositorName"
                      placeholder="실제 입금하실 분의 이름"
                      value={bankDepositorName}
                      onChange={(e) => setBankDepositorName(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>빠른 금액 선택</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {QUICK_AMOUNTS.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => handleQuickAmountSelect(item.value)}
                          className={cn(
                            'relative p-3 rounded-xl border-2 transition-all text-center',
                            selectedQuickAmount === item.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          {item.popular && (
                            <Badge className="absolute -top-2 -right-2 bg-accent text-white text-[10px] px-1.5">
                              인기
                            </Badge>
                          )}
                          <span className="font-semibold">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAmount" className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      충전 금액
                    </Label>
                    <div className="relative">
                      <Input
                        id="bankAmount"
                        type="text"
                        placeholder="직접 입력"
                        value={bankAmount > 0 ? bankAmount.toLocaleString() : ''}
                        onChange={(e) => handleBankAmountChange(e.target.value)}
                        className="h-12 pr-12 text-lg font-semibold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">원</span>
                    </div>
                    <p className="text-xs text-muted-foreground">최소 충전 금액: 10,000원</p>
                  </div>

                  {bankAmount >= 10000 && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          충전 후 잔액
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency(balance + bankAmount)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isBankSubmitting || bankAmount < 10000 || !bankDepositorName.trim()}
                    className="w-full h-14 text-lg btn-gradient"
                  >
                    {isBankSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-5 w-5" />
                        {bankAmount >= 10000 ? `${formatCurrency(bankAmount)} 충전 신청` : '금액을 입력하세요'}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============================================ */}
        {/* Tab 2: 카카오페이 */}
        {/* ============================================ */}
        <TabsContent value="kakaopay" className="space-y-6">
          <Card className="border-2 border-yellow-400/50">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-yellow-600" />
                카카오페이 결제
              </CardTitle>
              <CardDescription>
                카카오페이로 빠르고 간편하게 충전하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* 카카오페이 혜택 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-medium">즉시 충전</div>
                  <div className="text-sm text-muted-foreground">결제 즉시 잔액 반영</div>
                </div>
                <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200">
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="font-medium">안전 결제</div>
                  <div className="text-sm text-muted-foreground">카카오 보안 시스템</div>
                </div>
              </div>

              {/* 금액 선택 */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  충전 금액 선택
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map((item) => (
                    <Button
                      key={item.value}
                      type="button"
                      variant={selectedQuickAmount === item.value ? 'default' : 'outline'}
                      className={cn(
                        'relative',
                        selectedQuickAmount === item.value && 'bg-yellow-500 hover:bg-yellow-600 text-black',
                        item.popular && 'ring-2 ring-yellow-400 ring-offset-2'
                      )}
                      onClick={() => handleQuickAmountSelect(item.value)}
                    >
                      {item.label}
                      {item.popular && (
                        <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-1 py-0">
                          인기
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 직접 입력 */}
              <div className="space-y-2">
                <Label htmlFor="kakaopayAmount">직접 입력 (최소 1,000원)</Label>
                <div className="relative">
                  <Input
                    id="kakaopayAmount"
                    type="number"
                    min={1000}
                    max={1000000}
                    placeholder="금액을 입력하세요"
                    value={bankAmount || ''}
                    onChange={(e) => handleBankAmountChange(e.target.value)}
                    className="h-12 text-lg pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">원</span>
                </div>
              </div>

              {/* 결제 금액 표시 */}
              {bankAmount >= 1000 && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">결제 금액</span>
                    <span className="text-2xl font-bold text-yellow-700">{formatCurrency(bankAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">충전 후 잔액</span>
                    <span className="font-medium">{formatCurrency(balance + bankAmount)}</span>
                  </div>
                </div>
              )}

              {/* 결제 버튼 */}
              <Button
                type="button"
                className="w-full h-14 text-lg bg-yellow-500 hover:bg-yellow-600 text-black"
                disabled={bankAmount < 1000 || isKakaopayLoading}
                onClick={handleKakaopayPayment}
              >
                {isKakaopayLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    결제 준비 중...
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5 mr-2" />
                    카카오페이로 결제하기
                  </>
                )}
              </Button>

              {/* 안내 */}
              <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  카카오페이로 결제하면 즉시 잔액에 반영됩니다. 첫 충전 시 20% 보너스!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================ */}
        {/* Tab 3: USDT 충전 */}
        {/* ============================================ */}
        <TabsContent value="crypto" className="space-y-6">
          {/* 실시간 환율 알림 */}
          <Card className={cn(
            "border-2",
            exchangeRate?.source === 'coingecko'
              ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
              : "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20"
          )}>
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center",
                    exchangeRate?.source === 'coingecko'
                      ? "bg-green-100 dark:bg-green-900/50"
                      : "bg-amber-100 dark:bg-amber-900/50"
                  )}>
                    {isLoadingRate ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <TrendingUp className={cn(
                        "h-5 w-5",
                        exchangeRate?.source === 'coingecko' ? "text-green-600" : "text-amber-600"
                      )} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">실시간 시세 적용 중</p>
                    <p className="text-2xl font-bold">
                      1 USDT = {exchangeRate ? formatCurrency(exchangeRate.systemRate) : '---'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {exchangeRate?.source === 'fallback' && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      기준 환율 적용
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={fetchExchangeRate} disabled={isLoadingRate}>
                    <RefreshCw className={cn("h-4 w-4", isLoadingRate && "animate-spin")} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 경고 문구 */}
          <Card className="border-2 border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-700 dark:text-red-400">
                    반드시 TRC-20 (Tron) 네트워크로 전송하세요!
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    다른 네트워크(ERC-20, BEP-20 등)로 전송 시 자산이 영구 소실됩니다. 복구 불가능합니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 지갑 주소 & 계산기 */}
            <Card className="border-2 border-orange-500/20">
              <CardHeader className="bg-gradient-to-r from-orange-500/5 to-amber-500/5">
                <CardTitle className="flex items-center gap-2">
                  <Bitcoin className="h-5 w-5 text-orange-500" />
                  USDT 입금 정보
                </CardTitle>
                <CardDescription>
                  TRC-20 네트워크 지갑 주소
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* QR 코드 영역 */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-2xl border-2 border-orange-200 shadow-lg">
                    <QRCodeSVG
                      value={USDT_WALLET_ADDRESS}
                      size={176}
                      level="H"
                      includeMargin={true}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  TRC-20 네트워크 전용 주소입니다
                </p>

                {/* 지갑 주소 */}
                <div className="space-y-2">
                  <Label>USDT (TRC-20) 지갑 주소</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={USDT_WALLET_ADDRESS}
                      className="font-mono text-sm bg-muted/50"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopyWalletAddress}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 자동 계산기 */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 space-y-4">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold">자동 계산기</span>
                  </div>

                  <div className="space-y-2">
                    <Label>충전할 원화 금액</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="예: 100,000"
                        value={cryptoKrwAmount > 0 ? cryptoKrwAmount.toLocaleString() : ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/,/g, ''), 10) || 0;
                          setCryptoKrwAmount(val);
                        }}
                        className="h-12 pr-12 text-lg font-semibold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">원</span>
                    </div>
                  </div>

                  <div className="text-center py-2">
                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                      <div className="h-px w-8 bg-border" />
                      <span className="text-xs">환산 결과</span>
                      <div className="h-px w-8 bg-border" />
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-orange-500/30">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">보내실 USDT</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {calculatedUsdtAmount} <span className="text-lg">USDT</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    * 1.5% 수수료가 포함된 환율입니다
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* USDT 충전 신청 폼 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  USDT 충전 신청
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCryptoSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label>빠른 금액 선택</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {QUICK_AMOUNTS.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setCryptoKrwAmount(item.value)}
                          className={cn(
                            'relative p-3 rounded-xl border-2 transition-all text-center',
                            cryptoKrwAmount === item.value
                              ? 'border-orange-500 bg-orange-500/10'
                              : 'border-border hover:border-orange-500/50'
                          )}
                        >
                          {item.popular && (
                            <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-1.5">
                              인기
                            </Badge>
                          )}
                          <span className="font-semibold">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cryptoTxId" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      TXID (거래 해시)
                    </Label>
                    <Input
                      id="cryptoTxId"
                      placeholder="예: a1b2c3d4e5f6..."
                      value={cryptoTxId}
                      onChange={(e) => setCryptoTxId(e.target.value)}
                      className="h-12 font-mono"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      USDT 전송 후 받은 거래 해시(TXID)를 입력하세요
                    </p>
                  </div>

                  {cryptoKrwAmount >= 10000 && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">충전 금액</span>
                        <span className="font-semibold">{formatCurrency(cryptoKrwAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">보내실 USDT</span>
                        <span className="font-semibold text-orange-600">{calculatedUsdtAmount} USDT</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">적용 환율</span>
                        <span className="font-semibold">{exchangeRate ? formatCurrency(exchangeRate.systemRate) : '---'}/USDT</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-orange-500" />
                          충전 후 잔액
                        </span>
                        <span className="text-xl font-bold text-orange-600">
                          {formatCurrency(balance + cryptoKrwAmount)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isCryptoSubmitting || cryptoKrwAmount < 10000 || cryptoTxId.trim().length < 10}
                    className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    {isCryptoSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <Bitcoin className="mr-2 h-5 w-5" />
                        {cryptoKrwAmount >= 10000 && cryptoTxId.trim().length >= 10
                          ? `${calculatedUsdtAmount} USDT로 ${formatCurrency(cryptoKrwAmount)} 충전`
                          : '정보를 입력하세요'}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 최근 충전 내역 (공통) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            최근 충전 신청 내역
          </CardTitle>
          <CardDescription>
            최근 10건의 충전 신청 내역입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDeposits ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : deposits.length > 0 ? (
            <div className="space-y-3">
              {deposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                      deposit.status === 'approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                      deposit.status === 'pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    )}>
                      {deposit.status === 'approved' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : deposit.status === 'pending' ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{formatCurrency(deposit.amount)}</p>
                        <PaymentMethodBadge method={deposit.payment_method || 'bank_transfer'} />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {deposit.payment_method === 'crypto' && deposit.tx_id
                          ? `TXID: ${deposit.tx_id.substring(0, 16)}...`
                          : deposit.depositor_name
                        }
                        {' · '}
                        {formatRelativeTime(deposit.created_at)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={deposit.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Wallet className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                아직 충전 내역이 없습니다
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 안내사항 */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                충전 안내
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>무통장 입금:</strong> 입금 후 1-5분 이내 자동 충전됩니다.</li>
                <li>• <strong>USDT 충전:</strong> 블록체인 확인 후 1-10분 이내 충전됩니다.</li>
                <li>• 영업시간 외(22시~09시)에는 처리가 지연될 수 있습니다.</li>
                <li>• 충전 후 환불은 불가능합니다.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
