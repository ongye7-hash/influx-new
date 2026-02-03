// ============================================
// 어드민 - 고객 문의 관리
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Loader2,
  User,
  Mail,
  Calendar,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatRelativeTime, cn } from '@/lib/utils';

// 문의 유형
const TICKET_TYPES: Record<string, string> = {
  order: '주문 관련',
  payment: '결제/충전',
  refund: '환불 요청',
  account: '계정 문의',
  service: '서비스 이용',
  other: '기타',
};

// 상태 설정
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: '대기중', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  in_progress: { label: '처리중', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  resolved: { label: '답변완료', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  closed: { label: '종료', color: 'bg-white/5 text-white/40 border-white/10' },
};

interface Ticket {
  id: string;
  user_id: string;
  user_email: string;
  ticket_type: string;
  title: string;
  content: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  // 답변 다이얼로그 상태
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 통계
  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  // 문의 목록 로드
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (typeFilter !== 'all') {
        query = query.eq('ticket_type', typeFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fetch tickets error:', error);
        toast.error('문의 목록 로드 실패');
      } else {
        let filtered = data || [];
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter((t: Ticket) =>
            t.title.toLowerCase().includes(searchLower) ||
            t.content.toLowerCase().includes(searchLower) ||
            t.user_email.toLowerCase().includes(searchLower)
          );
        }
        setTickets(filtered);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('문의 목록 로드 중 오류 발생');
      setTickets([]);
    }
    setLoading(false);
  }, [statusFilter, typeFilter, search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // 답변 제출
  const handleSubmitReply = async () => {
    if (!selectedTicket) return;

    setIsSubmitting(true);
    try {
      const updateData: any = {
        status: newStatus || selectedTicket.status,
      };

      if (replyContent.trim()) {
        updateData.admin_reply = replyContent.trim();
        updateData.replied_at = new Date().toISOString();
      }

      const { error } = await (supabase as any)
        .from('support_tickets')
        .update(updateData)
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast.success('답변이 저장되었습니다');
      setSelectedTicket(null);
      setReplyContent('');
      setNewStatus('');
      fetchTickets();
    } catch (error) {
      console.error('Reply error:', error);
      toast.error('답변 저장 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 티켓 열기
  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setReplyContent(ticket.admin_reply || '');
    setNewStatus(ticket.status);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">고객 문의 관리</h1>
          <p className="text-muted-foreground">접수된 문의를 확인하고 답변합니다.</p>
        </div>
        <Button onClick={fetchTickets} variant="outline" disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white/60" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">전체 문의</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">대기중</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">처리중</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
                <p className="text-xs text-muted-foreground">답변완료</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="제목, 내용, 이메일 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="pending">대기중</SelectItem>
                <SelectItem value="in_progress">처리중</SelectItem>
                <SelectItem value="resolved">답변완료</SelectItem>
                <SelectItem value="closed">종료</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 유형</SelectItem>
                {Object.entries(TICKET_TYPES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 문의 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>문의 목록</CardTitle>
          <CardDescription>
            {tickets.length}건의 문의가 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.pending;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => openTicket(ticket)}
                    className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline" className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {TICKET_TYPES[ticket.ticket_type] || ticket.ticket_type}
                          </Badge>
                          {!ticket.admin_reply && ticket.status === 'pending' && (
                            <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">
                              미답변
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {ticket.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {ticket.user_email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatRelativeTime(ticket.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>접수된 문의가 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 답변 다이얼로그 */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>문의 상세</DialogTitle>
            <DialogDescription>
              문의 내용을 확인하고 답변합니다.
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              {/* 문의 정보 */}
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className={STATUS_CONFIG[selectedTicket.status]?.color}>
                    {STATUS_CONFIG[selectedTicket.status]?.label}
                  </Badge>
                  <Badge variant="secondary">
                    {TICKET_TYPES[selectedTicket.ticket_type]}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2">{selectedTicket.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedTicket.user_email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedTicket.created_at).toLocaleString('ko-KR')}
                  </span>
                </div>
                <div className="p-3 rounded-md bg-background border">
                  <p className="whitespace-pre-wrap">{selectedTicket.content}</p>
                </div>
              </div>

              {/* 답변 폼 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>상태 변경</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">대기중</SelectItem>
                      <SelectItem value="in_progress">처리중</SelectItem>
                      <SelectItem value="resolved">답변완료</SelectItem>
                      <SelectItem value="closed">종료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>답변 내용</Label>
                  <Textarea
                    placeholder="답변을 입력하세요..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                    취소
                  </Button>
                  <Button onClick={handleSubmitReply} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        답변 저장
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
