"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useGuestStore } from "@/stores/guest-store";
import { toast } from "sonner";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const refCode = searchParams.get('ref') || '';

  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const enterGuestMode = useGuestStore((state) => state.enterGuestMode);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");

  const clearGuestModeCookie = () => {
    // httpOnly 쿠키는 서버에서 삭제
    fetch('/api/guest-mode', { method: 'DELETE' }).catch(() => {});
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await signInWithEmail(loginEmail, loginPassword);

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      clearGuestModeCookie();
      toast.success('로그인 성공!');
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (registerPassword.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      setIsLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await signUpWithEmail(
        registerEmail,
        registerPassword,
        registerUsername || registerEmail.split('@')[0],
        refCode || undefined
      );

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('이미 등록된 이메일입니다.');
        } else if (signUpError.message.includes('valid email')) {
          setError('유효한 이메일 주소를 입력해주세요.');
        } else if (signUpError.message.includes('Password')) {
          setError('비밀번호가 보안 요구사항을 충족하지 않습니다.');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      toast.success('회원가입 성공!', {
        description: '이메일 인증 후 로그인해주세요.',
      });

      setActiveTab('login');
      setLoginEmail(registerEmail);
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    clearGuestModeCookie();
    if (refCode) {
      localStorage.setItem('influx_ref_code', refCode);
    }
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setError('Google 로그인에 실패했습니다.');
    }
  };

  const handleGuestMode = () => {
    enterGuestMode();
    toast.success('비회원 모드로 둘러보기를 시작합니다!', {
      description: '모든 기능을 체험해보고 회원가입하세요.',
    });

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/guest-mode';
    document.body.appendChild(form);
    form.submit();
  };

  const inputClass = "w-full h-12 px-4 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-white/30 focus:outline-none focus:border-[#0064FF]/50 focus:ring-1 focus:ring-[#0064FF]/30 transition-colors";
  const inputWithIconClass = `${inputClass} pl-11`;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0f0f11]">
        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        {/* Subtle glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0064FF]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#0064FF]/5 rounded-full blur-[80px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <svg width="27" height="28" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <rect x="0" y="14" width="8" height="14" rx="1" fill="#4A5568" />
              <rect x="9.5" y="8" width="8" height="20" rx="1" fill="#64748B" />
              <rect x="19" y="0" width="8" height="28" rx="1" fill="#0EA5E9" />
            </svg>
            <span className="text-3xl font-black text-white tracking-tight">INFLUX</span>
          </Link>

          {/* Main Message */}
          <div className="space-y-6">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
              SNS 채널 성장의
              <br />
              <span className="text-[#0064FF]">새로운 기준</span>
            </h1>
            <p className="text-lg text-white/50 max-w-md">
              유튜브, 인스타그램, 틱톡 등 모든 소셜 미디어 채널의
              성장을 24시간 자동화 시스템으로 지원합니다.
            </p>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              {[
                { value: '840K+', label: '처리된 주문' },
                { value: '99.8%', label: '성공률' },
                { value: '24/7', label: '자동 운영' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold font-mono">{stat.value}</div>
                  <div className="text-white/40 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-white/30 text-sm">
            © 2026 INFLUX by Loopcell & Media
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col p-6 sm:p-12 bg-[#09090b]">
        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white/70 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            홈으로
          </Link>
          <div className="lg:hidden flex items-center gap-2">
            <svg width="27" height="28" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <rect x="0" y="14" width="8" height="14" rx="1" fill="#4A5568" />
              <rect x="9.5" y="8" width="8" height="20" rx="1" fill="#64748B" />
              <rect x="19" y="0" width="8" height="28" rx="1" fill="#0EA5E9" />
            </svg>
            <span className="text-lg font-black text-white tracking-tight">INFLUX</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md space-y-7">
            {/* Welcome Text */}
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-white">
                {activeTab === "login" ? "다시 만나서 반갑습니다!" : "INFLUX 시작하기"}
              </h2>
              <p className="text-white/40 mt-2">
                {activeTab === "login"
                  ? "계정에 로그인하여 서비스를 이용하세요"
                  : "무료로 가입하고 SNS 마케팅을 시작하세요"}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex rounded-lg bg-white/[0.03] border border-white/[0.06] p-1">
              {(["login", "register"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setError(null); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab
                      ? 'bg-[#0064FF] text-white'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {tab === "login" ? "로그인" : "회원가입"}
                </button>
              ))}
            </div>

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-white/70">이메일</label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className={inputWithIconClass}
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-white/70">비밀번호</label>
                    <Link href="/forgot-password" className="text-sm text-[#0064FF] hover:text-[#0054DD] transition-colors">
                      비밀번호 찾기
                    </Link>
                  </div>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`${inputWithIconClass} pr-11`}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-lg bg-[#0064FF] text-white font-semibold hover:bg-[#0054DD] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      로그인 중...
                    </>
                  ) : (
                    <>
                      로그인
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="reg-username" className="text-sm font-medium text-white/70">사용자 이름 (선택)</label>
                  <input
                    id="reg-username"
                    type="text"
                    placeholder="사용자 이름"
                    className={inputClass}
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="reg-email" className="text-sm font-medium text-white/70">이메일</label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="name@example.com"
                      className={inputWithIconClass}
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="reg-password" className="text-sm font-medium text-white/70">비밀번호</label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="최소 8자 이상"
                      className={`${inputWithIconClass} pr-11`}
                      required
                      minLength={8}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-white/[0.03] accent-[#0064FF]"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-white/40">
                    <Link href="/terms" className="text-[#0064FF] hover:text-[#0054DD]">
                      이용약관
                    </Link>
                    {" "}및{" "}
                    <Link href="/privacy" className="text-[#0064FF] hover:text-[#0054DD]">
                      개인정보처리방침
                    </Link>
                    에 동의합니다
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-lg bg-[#0064FF] text-white font-semibold hover:bg-[#0054DD] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      가입 중...
                    </>
                  ) : (
                    <>
                      무료로 시작하기
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#09090b] px-3 text-white/30">
                  또는
                </span>
              </div>
            </div>

            {/* Social Login */}
            <button
              className="w-full h-12 rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <GoogleIcon className="h-5 w-5" />
              구글로 3초 시작
            </button>

            {/* 비회원 둘러보기 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#09090b] px-3 text-white/30">
                  가입 전 둘러보기
                </span>
              </div>
            </div>

            <button
              className="w-full h-12 rounded-lg border border-dashed border-white/[0.1] text-white/40 hover:text-white/60 hover:border-[#0064FF]/30 hover:bg-[#0064FF]/5 transition-all flex items-center justify-center gap-2 text-sm"
              type="button"
              onClick={handleGuestMode}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              비회원으로 둘러보기
            </button>

            {/* 가입 혜택 미리보기 */}
            <div className="rounded-xl p-4 border border-[#0064FF]/20 bg-[#0064FF]/5">
              <p className="text-sm font-medium text-center mb-3 text-white/70">
                지금 가입하면 받는 혜택
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <span className="text-yellow-400 text-sm">🎁</span>
                  </div>
                  <span className="text-xs font-bold text-yellow-400 font-mono">2,000P</span>
                  <span className="text-[10px] text-white/30">가입 즉시</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 text-sm">⚡</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">+20%</span>
                  <span className="text-[10px] text-white/30">첫충전 보너스</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 text-sm">🛡️</span>
                  </div>
                  <span className="text-xs font-bold text-blue-400 font-mono">무료</span>
                  <span className="text-[10px] text-white/30">체험 서비스</span>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <p className="text-center text-sm text-white/30">
              문제가 있으신가요?{" "}
              <Link href="/support" className="text-[#0064FF] hover:text-[#0054DD]">
                고객센터
              </Link>
              로 문의해주세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
      <div className="h-8 w-8 border-2 border-white/10 border-t-[#0064FF] rounded-full animate-spin" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
