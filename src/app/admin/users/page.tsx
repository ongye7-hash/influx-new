"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  MoreVertical,
  Loader2,
  Shield,
  ShieldOff,
  Wallet,
  RefreshCw,
  CheckCircle,
  Filter,
  Gift,
  Ticket,
  Clock,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  tier: string;
  is_admin: boolean;
  created_at: string;
  last_order_at: string | null;
  total_orders: number;
  total_spent: number;
}

type FilterType = "all" | "sleeping_whales" | "high_balance" | "new_users" | "admins";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceAction, setBalanceAction] = useState<"add" | "subtract">("add");
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [newTier, setNewTier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk action dialogs
  const [bulkCouponDialogOpen, setBulkCouponDialogOpen] = useState(false);
  const [bulkBalanceDialogOpen, setBulkBalanceDialogOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("RETENTION");
  const [couponDiscount, setCouponDiscount] = useState("20");
  const [couponType, setCouponType] = useState("percentage");
  const [couponExpireDays, setCouponExpireDays] = useState("30");
  const [giftAmount, setGiftAmount] = useState("1000");
  const [giftReason, setGiftReason] = useState("리텐션 마케팅");

  // Stats
  const [retentionStats, setRetentionStats] = useState({
    total_count: 0,
    total_balance: 0,
    whale_count: 0,
    dolphin_count: 0,
    fish_count: 0,
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("회원 목록을 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRetentionStats = useCallback(async () => {
    try {
      // sleeping_whales 뷰가 없을 경우를 대비한 클라이언트 사이드 계산
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, balance, last_order_at, created_at")
        .gt("balance", 5000)
        .eq("is_admin", false);

      if (error) throw error;

      // 타입 어설션: last_order_at은 마이그레이션 적용 전까지 undefined일 수 있음
      type RetentionUser = { id: string; balance: number; last_order_at?: string | null; created_at: string };
      const sleepingUsers = ((data || []) as RetentionUser[]).filter(u => {
        const lastActivity = u.last_order_at || u.created_at;
        return new Date(lastActivity) < fourteenDaysAgo;
      });

      setRetentionStats({
        total_count: sleepingUsers.length,
        total_balance: sleepingUsers.reduce((sum, u) => sum + u.balance, 0),
        whale_count: sleepingUsers.filter(u => u.balance >= 50000).length,
        dolphin_count: sleepingUsers.filter(u => u.balance >= 20000 && u.balance < 50000).length,
        fish_count: sleepingUsers.filter(u => u.balance >= 5000 && u.balance < 20000).length,
      });
    } catch (error) {
      console.error("Error fetching retention stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRetentionStats();
  }, [fetchUsers, fetchRetentionStats]);

  const handleToggleAdmin = async (user: User) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !user.is_admin } as never)
        .eq("id", user.id);

      if (error) throw error;

      setUsers(users.map(u =>
        u.id === user.id ? { ...u, is_admin: !u.is_admin } : u
      ));

      toast.success(user.is_admin ? "관리자 권한이 해제되었습니다" : "관리자 권한이 부여되었습니다");
    } catch (error) {
      console.error("Error toggling admin:", error);
      toast.error("권한 변경에 실패했습니다");
    }
  };

  const handleBalanceSubmit = async () => {
    if (!selectedUser || !balanceAmount) return;

    setIsSubmitting(true);
    try {
      const amount = parseInt(balanceAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("올바른 금액을 입력하세요");
        return;
      }

      const newBalance = balanceAction === "add"
        ? selectedUser.balance + amount
        : Math.max(0, selectedUser.balance - amount);

      const { error } = await supabase
        .from("profiles")
        .update({ balance: newBalance } as never)
        .eq("id", selectedUser.id);

      if (error) throw error;

      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, balance: newBalance } : u
      ));

      toast.success(`잔액이 ${balanceAction === "add" ? "추가" : "차감"}되었습니다`);
      setBalanceDialogOpen(false);
      setBalanceAmount("");
    } catch (error) {
      console.error("Error updating balance:", error);
      toast.error("잔액 변경에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTierSubmit = async () => {
    if (!selectedUser || !newTier) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ tier: newTier } as never)
        .eq("id", selectedUser.id);

      if (error) throw error;

      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, tier: newTier } : u
      ));

      toast.success("등급이 변경되었습니다");
      setTierDialogOpen(false);
    } catch (error) {
      console.error("Error updating tier:", error);
      toast.error("등급 변경에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk actions
  const handleBulkCouponIssue = async () => {
    if (selectedUsers.size === 0) {
      toast.error("선택된 회원이 없습니다");
      return;
    }

    setIsSubmitting(true);
    try {
      // 개별 쿠폰 발급 (user_coupons 테이블에)
      const userIds = Array.from(selectedUsers);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(couponExpireDays));

      let successCount = 0;
      let failCount = 0;

      for (const userId of userIds) {
        // user_coupons 테이블은 마이그레이션 적용 후 사용 가능
        const { error } = await supabase.from("user_coupons").insert({
          user_id: userId,
          coupon_code: `${couponCode}-${userId.substring(0, 4).toUpperCase()}`,
          coupon_type: couponType,
          discount_value: parseFloat(couponDiscount),
          expires_at: expiresAt.toISOString(),
          issue_reason: "리텐션 마케팅",
        } as never);

        if (error) {
          failCount++;
        } else {
          successCount++;
        }
      }

      toast.success(`쿠폰 발급 완료: 성공 ${successCount}건, 실패 ${failCount}건`);
      setBulkCouponDialogOpen(false);
      setSelectedUsers(new Set());
    } catch (error) {
      console.error("Error issuing coupons:", error);
      toast.error("쿠폰 발급에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkBalanceGift = async () => {
    if (selectedUsers.size === 0) {
      toast.error("선택된 회원이 없습니다");
      return;
    }

    setIsSubmitting(true);
    try {
      const userIds = Array.from(selectedUsers);
      const amount = parseInt(giftAmount);

      let successCount = 0;
      let failCount = 0;

      for (const userId of userIds) {
        const user = users.find(u => u.id === userId);
        if (!user) continue;

        const { error } = await supabase
          .from("profiles")
          .update({ balance: user.balance + amount } as never)
          .eq("id", userId);

        if (error) {
          failCount++;
        } else {
          successCount++;
        }
      }

      toast.success(`잔액 지급 완료: 성공 ${successCount}건, 실패 ${failCount}건`);
      setBulkBalanceDialogOpen(false);
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error) {
      console.error("Error gifting balance:", error);
      toast.error("잔액 지급에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter logic
  const getFilteredUsers = () => {
    let filtered = users;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(search.toLowerCase()) ||
          user.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    switch (filter) {
      case "sleeping_whales":
        filtered = filtered.filter(u => {
          if (u.is_admin) return false;
          if (u.balance <= 5000) return false;
          const lastActivity = u.last_order_at || u.created_at;
          return new Date(lastActivity) < fourteenDaysAgo;
        });
        break;
      case "high_balance":
        filtered = filtered.filter(u => u.balance >= 10000);
        break;
      case "new_users":
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filtered = filtered.filter(u => new Date(u.created_at) > sevenDaysAgo);
        break;
      case "admins":
        filtered = filtered.filter(u => u.is_admin);
        break;
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const getDaysInactive = (user: User) => {
    const lastActivity = user.last_order_at || user.created_at;
    const days = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "enterprise": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "premium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "standard": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">회원 관리</h1>
          <p className="text-muted-foreground">전체 회원: {users.length}명</p>
        </div>
        <Button variant="outline" onClick={() => { fetchUsers(); fetchRetentionStats(); }} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {/* Retention Stats Card */}
      <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            리텐션 타겟 (잠자는 큰손)
          </CardTitle>
          <CardDescription>
            잔액 5,000원 이상, 14일 이상 미주문 회원
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-amber-400">{retentionStats.total_count}</div>
              <div className="text-xs text-muted-foreground">총 타겟</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-green-400">{formatCurrency(retentionStats.total_balance)}</div>
              <div className="text-xs text-muted-foreground">총 잔액</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-blue-400">{retentionStats.whale_count}</div>
              <div className="text-xs text-muted-foreground">5만원+</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-purple-400">{retentionStats.dolphin_count}</div>
              <div className="text-xs text-muted-foreground">2-5만원</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-cyan-400">{retentionStats.fish_count}</div>
              <div className="text-xs text-muted-foreground">5천-2만원</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Bulk Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름 또는 이메일로 검색..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 회원</SelectItem>
                <SelectItem value="sleeping_whales">잠자는 큰손 ({retentionStats.total_count})</SelectItem>
                <SelectItem value="high_balance">고잔액 (1만원+)</SelectItem>
                <SelectItem value="new_users">신규 가입 (7일)</SelectItem>
                <SelectItem value="admins">관리자</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {/* Bulk Action Buttons */}
        {selectedUsers.size > 0 && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <span className="text-sm font-medium">{selectedUsers.size}명 선택됨</span>
              <div className="flex-1" />
              <Button size="sm" variant="outline" onClick={() => setBulkCouponDialogOpen(true)}>
                <Ticket className="h-4 w-4 mr-1" />
                쿠폰 발급
              </Button>
              <Button size="sm" variant="outline" onClick={() => setBulkBalanceDialogOpen(true)}>
                <Gift className="h-4 w-4 mr-1" />
                잔액 지급
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedUsers(new Set())}>
                취소
              </Button>
            </div>
          </div>
        )}

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {/* Select All Header */}
              <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span>전체 선택 ({filteredUsers.length}명)</span>
              </div>

              {filteredUsers.map((user) => {
                const daysInactive = getDaysInactive(user);
                const isSleepingWhale = user.balance > 5000 && daysInactive >= 14 && !user.is_admin;

                return (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors",
                      isSleepingWhale && "border-amber-500/30 bg-amber-500/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedUsers.has(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                      />
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{user.username || "이름 없음"}</p>
                          {user.is_admin && (
                            <Badge variant="destructive" className="text-xs">관리자</Badge>
                          )}
                          <Badge variant="outline" className={`text-xs ${getTierColor(user.tier)}`}>
                            {user.tier}
                          </Badge>
                          {isSleepingWhale && (
                            <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                              <Clock className="h-3 w-3 mr-1" />
                              {daysInactive}일 미활동
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="font-medium">{formatCurrency(user.balance)}</p>
                        <p className="text-xs text-muted-foreground">
                          주문 {user.total_orders || 0}건
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>회원 관리</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setBalanceDialogOpen(true);
                          }}>
                            <Wallet className="h-4 w-4 mr-2" />
                            잔액 조정
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setNewTier(user.tier);
                            setTierDialogOpen(true);
                          }}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            등급 변경
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleAdmin(user)}>
                            {user.is_admin ? (
                              <>
                                <ShieldOff className="h-4 w-4 mr-2" />
                                관리자 해제
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4 mr-2" />
                                관리자 지정
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance Adjustment Dialog */}
      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>잔액 조정</DialogTitle>
            <DialogDescription>
              {selectedUser?.username || selectedUser?.email}님의 잔액을 조정합니다.
              <br />
              현재 잔액: {formatCurrency(selectedUser?.balance || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>조정 유형</Label>
              <Select value={balanceAction} onValueChange={(v) => setBalanceAction(v as "add" | "subtract")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">잔액 추가</SelectItem>
                  <SelectItem value="subtract">잔액 차감</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>금액 (원)</Label>
              <Input
                type="number"
                placeholder="금액 입력"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleBalanceSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tier Change Dialog */}
      <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>등급 변경</DialogTitle>
            <DialogDescription>
              {selectedUser?.username || selectedUser?.email}님의 등급을 변경합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>등급 선택</Label>
              <Select value={newTier} onValueChange={setNewTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTierDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleTierSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Coupon Dialog */}
      <Dialog open={bulkCouponDialogOpen} onOpenChange={setBulkCouponDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>쿠폰 일괄 발급</DialogTitle>
            <DialogDescription>
              선택한 {selectedUsers.size}명에게 쿠폰을 발급합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>쿠폰 코드 접두사</Label>
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="RETENTION"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>할인 유형</Label>
                <Select value={couponType} onValueChange={setCouponType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">% 할인</SelectItem>
                    <SelectItem value="fixed">원 할인</SelectItem>
                    <SelectItem value="bonus">충전 보너스</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>할인율/금액</Label>
                <Input
                  type="number"
                  value={couponDiscount}
                  onChange={(e) => setCouponDiscount(e.target.value)}
                  placeholder="20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>유효 기간 (일)</Label>
              <Input
                type="number"
                value={couponExpireDays}
                onChange={(e) => setCouponExpireDays(e.target.value)}
                placeholder="30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkCouponDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleBulkCouponIssue} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              발급하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Balance Gift Dialog */}
      <Dialog open={bulkBalanceDialogOpen} onOpenChange={setBulkBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>잔액 일괄 지급</DialogTitle>
            <DialogDescription>
              선택한 {selectedUsers.size}명에게 잔액을 지급합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>지급 금액 (원)</Label>
              <Input
                type="number"
                value={giftAmount}
                onChange={(e) => setGiftAmount(e.target.value)}
                placeholder="1000"
              />
            </div>
            <div className="space-y-2">
              <Label>지급 사유</Label>
              <Input
                value={giftReason}
                onChange={(e) => setGiftReason(e.target.value)}
                placeholder="리텐션 마케팅"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkBalanceDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleBulkBalanceGift} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              지급하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
