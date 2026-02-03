"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Save,
  Loader2,
  Send,
  Bell,
  Zap,
  Moon,
  Clock,
  DollarSign,
  Users,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Settings,
  TestTube,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface TelegramSettings {
  bot_token: string;
  chat_id: string;
  enabled: boolean;
  quiet_hours_start: number;
  quiet_hours_end: number;
  daily_briefing_time: string;
  notify_large_deposit: boolean;
  notify_provider_failure: boolean;
  notify_sleeping_whale: boolean;
  notify_new_vip: boolean;
  large_deposit_threshold: number;
}

interface AutomationSettings {
  auto_approve_deposit: boolean;
  auto_approve_max_amount: number;
  auto_approve_existing_only: boolean;
  auto_coupon_sleeping_whale: boolean;
  auto_coupon_days_inactive: number;
  auto_coupon_min_balance: number;
  auto_coupon_discount_percent: number;
  auto_refund_failed_orders: boolean;
  provider_balance_alert: boolean;
  provider_balance_threshold: number;
}

const defaultTelegram: TelegramSettings = {
  bot_token: "",
  chat_id: "",
  enabled: false,
  quiet_hours_start: 23,
  quiet_hours_end: 8,
  daily_briefing_time: "21:00",
  notify_large_deposit: true,
  notify_provider_failure: true,
  notify_sleeping_whale: true,
  notify_new_vip: true,
  large_deposit_threshold: 50000,
};

const defaultAutomation: AutomationSettings = {
  auto_approve_deposit: false,
  auto_approve_max_amount: 50000,
  auto_approve_existing_only: true,
  auto_coupon_sleeping_whale: false,
  auto_coupon_days_inactive: 14,
  auto_coupon_min_balance: 20000,
  auto_coupon_discount_percent: 10,
  auto_refund_failed_orders: false,
  provider_balance_alert: true,
  provider_balance_threshold: 100,
};

export default function AdminAutomationPage() {
  const [telegram, setTelegram] = useState<TelegramSettings>(defaultTelegram);
  const [automation, setAutomation] = useState<AutomationSettings>(defaultAutomation);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [automationLogs, setAutomationLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchLogs();
  }, []);

  const fetchSettings = async () => {
    try {
      const results = await Promise.allSettled([
        supabase.from("admin_settings").select("value").eq("key", "telegram").single(),
        supabase.from("admin_settings").select("value").eq("key", "automation").single(),
      ]);

      const telegramRes = results[0].status === 'fulfilled' ? results[0].value : { data: null };
      const automationRes = results[1].status === 'fulfilled' ? results[1].value : { data: null };

      const telegramData = telegramRes.data as { value: TelegramSettings } | null;
      const automationData = automationRes.data as { value: AutomationSettings } | null;

      if (telegramData?.value) {
        setTelegram({ ...defaultTelegram, ...telegramData.value });
      }
      if (automationData?.value) {
        setAutomation({ ...defaultAutomation, ...automationData.value });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Use defaults on error
      setTelegram(defaultTelegram);
      setAutomation(defaultAutomation);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data } = await supabase
        .from("automation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      setAutomationLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setAutomationLogs([]);
    }
  };

  const saveTelegramSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("admin_settings")
        .upsert({ key: "telegram", value: telegram, updated_at: new Date().toISOString() } as never);

      if (error) throw error;
      toast.success("텔레그램 설정이 저장되었습니다");
    } catch (error) {
      console.error("Error saving telegram settings:", error);
      toast.error("저장에 실패했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  const saveAutomationSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("admin_settings")
        .upsert({ key: "automation", value: automation, updated_at: new Date().toISOString() } as never);

      if (error) throw error;
      toast.success("자동화 설정이 저장되었습니다");
    } catch (error) {
      console.error("Error saving automation settings:", error);
      toast.error("저장에 실패했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  const testTelegram = async () => {
    if (!telegram.bot_token || !telegram.chat_id) {
      toast.error("봇 토큰과 Chat ID를 먼저 입력해주세요");
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot_token: telegram.bot_token,
          chat_id: telegram.chat_id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("테스트 메시지 전송 성공! 텔레그램을 확인해주세요");
      } else {
        toast.error(`전송 실패: ${result.error}`);
      }
    } catch (error) {
      toast.error("테스트 실패: 서버 오류");
    } finally {
      setIsTesting(false);
    }
  };

  const runManualAutomation = async () => {
    setIsTesting(true);
    try {
      const response = await fetch("/api/cron/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "all" }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `자동화 실행 완료! 쿠폰: ${result.results?.sleepingWhales?.couponsSent || 0}건, 환불: ${result.results?.failedOrders?.refunded || 0}건`
        );
        fetchLogs();
      } else {
        toast.error("실행 실패");
      }
    } catch (error) {
      toast.error("실행 실패");
    } finally {
      setIsTesting(false);
    }
  };

  const sendBriefing = async () => {
    setIsTesting(true);
    try {
      const response = await fetch("/api/cron/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "briefing" }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("브리핑 전송 완료! 텔레그램을 확인해주세요");
      } else {
        toast.error("전송 실패");
      }
    } catch (error) {
      toast.error("전송 실패");
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">자동화 설정</h1>
        <p className="text-muted-foreground">텔레그램 알림 및 자동화 규칙을 설정합니다</p>
      </div>

      <Tabs defaultValue="telegram" className="space-y-4">
        <TabsList>
          <TabsTrigger value="telegram" className="gap-2">
            <Bot className="h-4 w-4" />
            텔레그램
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Zap className="h-4 w-4" />
            자동화 규칙
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            실행 로그
          </TabsTrigger>
        </TabsList>

        {/* 텔레그램 설정 */}
        <TabsContent value="telegram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                텔레그램 봇 연결
              </CardTitle>
              <CardDescription>
                @BotFather에서 봇을 생성하고 토큰을 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>봇 토큰</Label>
                  <Input
                    type="password"
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={telegram.bot_token}
                    onChange={(e) => setTelegram({ ...telegram, bot_token: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">@BotFather → /newbot → 토큰 복사</p>
                </div>
                <div className="space-y-2">
                  <Label>Chat ID</Label>
                  <Input
                    placeholder="-1001234567890"
                    value={telegram.chat_id}
                    onChange={(e) => setTelegram({ ...telegram, chat_id: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">@userinfobot에게 메시지 → ID 확인</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={telegram.enabled}
                    onCheckedChange={(checked) => setTelegram({ ...telegram, enabled: checked })}
                  />
                  <Label>텔레그램 알림 활성화</Label>
                </div>
                <Button variant="outline" onClick={testTelegram} disabled={isTesting}>
                  {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TestTube className="h-4 w-4 mr-2" />}
                  테스트 메시지
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                알림 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>대형 충전 요청 알림</Label>
                    <p className="text-xs text-muted-foreground">설정 금액 이상 충전 시 알림</p>
                  </div>
                  <Switch
                    checked={telegram.notify_large_deposit}
                    onCheckedChange={(checked) => setTelegram({ ...telegram, notify_large_deposit: checked })}
                  />
                </div>

                {telegram.notify_large_deposit && (
                  <div className="ml-4 space-y-2">
                    <Label>최소 금액</Label>
                    <Input
                      type="number"
                      value={telegram.large_deposit_threshold}
                      onChange={(e) => setTelegram({ ...telegram, large_deposit_threshold: parseInt(e.target.value) || 0 })}
                      className="w-40"
                    />
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Provider 장애 알림</Label>
                    <p className="text-xs text-muted-foreground">연속 실패 및 쿨다운 진입 시</p>
                  </div>
                  <Switch
                    checked={telegram.notify_provider_failure}
                    onCheckedChange={(checked) => setTelegram({ ...telegram, notify_provider_failure: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>잠자는 큰손 알림</Label>
                    <p className="text-xs text-muted-foreground">고잔액 장기 미접속 유저 감지</p>
                  </div>
                  <Switch
                    checked={telegram.notify_sleeping_whale}
                    onCheckedChange={(checked) => setTelegram({ ...telegram, notify_sleeping_whale: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>신규 VIP 알림</Label>
                    <p className="text-xs text-muted-foreground">누적 충전 100만원 달성 시</p>
                  </div>
                  <Switch
                    checked={telegram.notify_new_vip}
                    onCheckedChange={(checked) => setTelegram({ ...telegram, notify_new_vip: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                야간 모드 & 브리핑
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>야간 시작 (시)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={telegram.quiet_hours_start}
                    onChange={(e) => setTelegram({ ...telegram, quiet_hours_start: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>야간 종료 (시)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={telegram.quiet_hours_end}
                    onChange={(e) => setTelegram({ ...telegram, quiet_hours_end: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>일일 브리핑 시간</Label>
                  <Input
                    type="time"
                    value={telegram.daily_briefing_time}
                    onChange={(e) => setTelegram({ ...telegram, daily_briefing_time: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                야간 시간에는 알림이 발송되지 않습니다 (현재: {telegram.quiet_hours_start}시 ~ {telegram.quiet_hours_end}시)
              </p>

              <div className="flex gap-2">
                <Button variant="outline" onClick={sendBriefing} disabled={isTesting}>
                  {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  지금 브리핑 보내기
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveTelegramSettings} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              텔레그램 설정 저장
            </Button>
          </div>
        </TabsContent>

        {/* 자동화 규칙 */}
        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                충전 자동 승인
              </CardTitle>
              <CardDescription>조건에 맞는 충전 요청을 자동으로 승인합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>자동 승인 활성화</Label>
                  <p className="text-xs text-muted-foreground">조건에 맞으면 즉시 승인</p>
                </div>
                <Switch
                  checked={automation.auto_approve_deposit}
                  onCheckedChange={(checked) => setAutomation({ ...automation, auto_approve_deposit: checked })}
                />
              </div>

              {automation.auto_approve_deposit && (
                <div className="ml-4 space-y-4 border-l-2 pl-4">
                  <div className="space-y-2">
                    <Label>최대 자동승인 금액</Label>
                    <Input
                      type="number"
                      value={automation.auto_approve_max_amount}
                      onChange={(e) => setAutomation({ ...automation, auto_approve_max_amount: parseInt(e.target.value) || 0 })}
                      className="w-40"
                    />
                    <p className="text-xs text-muted-foreground">이 금액 이하만 자동 승인</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={automation.auto_approve_existing_only}
                      onCheckedChange={(checked) => setAutomation({ ...automation, auto_approve_existing_only: checked })}
                    />
                    <Label>기존 고객만 자동 승인</Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                잠자는 큰손 자동 쿠폰
              </CardTitle>
              <CardDescription>장기 미접속 고잔액 유저에게 자동으로 쿠폰 발송</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>자동 쿠폰 발송</Label>
                  <p className="text-xs text-muted-foreground">조건 충족 시 자동 발송</p>
                </div>
                <Switch
                  checked={automation.auto_coupon_sleeping_whale}
                  onCheckedChange={(checked) => setAutomation({ ...automation, auto_coupon_sleeping_whale: checked })}
                />
              </div>

              {automation.auto_coupon_sleeping_whale && (
                <div className="ml-4 space-y-4 border-l-2 pl-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>미접속 일수</Label>
                      <Input
                        type="number"
                        value={automation.auto_coupon_days_inactive}
                        onChange={(e) => setAutomation({ ...automation, auto_coupon_days_inactive: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>최소 잔액</Label>
                      <Input
                        type="number"
                        value={automation.auto_coupon_min_balance}
                        onChange={(e) => setAutomation({ ...automation, auto_coupon_min_balance: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>할인율 (%)</Label>
                      <Input
                        type="number"
                        value={automation.auto_coupon_discount_percent}
                        onChange={(e) => setAutomation({ ...automation, auto_coupon_discount_percent: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                기타 자동화
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>실패 주문 자동 환불</Label>
                  <p className="text-xs text-muted-foreground">주문 실패 시 자동으로 잔액 복구</p>
                </div>
                <Switch
                  checked={automation.auto_refund_failed_orders}
                  onCheckedChange={(checked) => setAutomation({ ...automation, auto_refund_failed_orders: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Provider 잔액 부족 알림</Label>
                  <p className="text-xs text-muted-foreground">임계값 이하 시 텔레그램 알림</p>
                </div>
                <Switch
                  checked={automation.provider_balance_alert}
                  onCheckedChange={(checked) => setAutomation({ ...automation, provider_balance_alert: checked })}
                />
              </div>

              {automation.provider_balance_alert && (
                <div className="ml-4 space-y-2">
                  <Label>임계값 (USD)</Label>
                  <Input
                    type="number"
                    value={automation.provider_balance_threshold}
                    onChange={(e) => setAutomation({ ...automation, provider_balance_threshold: parseInt(e.target.value) || 0 })}
                    className="w-40"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={runManualAutomation} disabled={isTesting}>
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
              지금 자동화 실행
            </Button>
            <Button onClick={saveAutomationSettings} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              자동화 설정 저장
            </Button>
          </div>
        </TabsContent>

        {/* 실행 로그 */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>자동화 실행 로그</CardTitle>
                  <CardDescription>최근 20건의 자동화 실행 기록</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchLogs}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  새로고침
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {automationLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">실행 기록이 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {automationLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        {log.action_type === "auto_approve_deposit" && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {log.action_type === "auto_send_coupon" && <Users className="h-5 w-5 text-blue-500" />}
                        {log.action_type === "auto_refund" && <RefreshCw className="h-5 w-5 text-orange-500" />}
                        {log.action_type === "provider_failure" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        <div>
                          <p className="font-medium">
                            {log.action_type === "auto_approve_deposit" && "충전 자동 승인"}
                            {log.action_type === "auto_send_coupon" && "쿠폰 자동 발송"}
                            {log.action_type === "auto_refund" && "자동 환불"}
                            {log.action_type === "provider_failure" && "Provider 장애"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.action_data?.user_email || log.action_data?.provider_name || ""}
                            {log.action_data?.amount && ` - ₩${log.action_data.amount.toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("ko-KR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
