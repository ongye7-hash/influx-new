"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (resetError) throw resetError;
      setIsSuccess(true);
    } catch (err) {
      setError("비밀번호 재설정 이메일 전송에 실패했습니다.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">이메일을 확인하세요</h2>
            <p className="text-white/50 mt-2">
              <strong className="text-white/70">{email}</strong>로 비밀번호 재설정 링크를 보냈습니다.
              <br />
              이메일을 확인하고 링크를 클릭하세요.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <svg width="27" height="28" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <rect x="0" y="14" width="8" height="14" rx="1" fill="#4A5568" />
              <rect x="9.5" y="8" width="8" height="20" rx="1" fill="#64748B" />
              <rect x="19" y="0" width="8" height="28" rx="1" fill="#0EA5E9" />
            </svg>
            <span className="text-xl font-black text-white tracking-tight">INFLUX</span>
          </Link>
          <h2 className="text-2xl font-bold text-white">비밀번호 찾기</h2>
          <p className="text-white/50 mt-2">
            가입한 이메일 주소를 입력하면 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white/70">이메일</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="w-full h-12 px-4 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-white/30 focus:outline-none focus:border-[#0064FF]/50 focus:ring-1 focus:ring-[#0064FF]/30 transition-colors"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            className="w-full h-12 rounded-lg bg-[#0064FF] text-white font-semibold hover:bg-[#0054DD] transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                전송 중...
              </span>
            ) : (
              "재설정 링크 보내기"
            )}
          </button>
        </form>

        <div className="text-center">
          <Link href="/login" className="text-sm text-[#0064FF] hover:text-[#0054DD] inline-flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
