'use client';

import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          뒤로가기
        </button>

        <h1 className="text-3xl font-bold mb-2">개인정보처리방침</h1>
        <p className="text-muted-foreground mb-10">최종 수정일: 2026년 1월 29일</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <p className="text-muted-foreground leading-relaxed">
              루프셀앤미디어(이하 &quot;회사&quot;)는 개인정보보호법에 따라 이용자의 개인정보를 보호하고
              이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제1조 (수집하는 개인정보 항목)</h2>
            <p className="text-muted-foreground mb-2">회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다.</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li><strong>필수항목:</strong> 이메일 주소, 비밀번호(암호화 저장)</li>
              <li><strong>소셜 로그인 시:</strong> 이메일 주소, 프로필 이름 (Google, Kakao 제공 정보)</li>
              <li><strong>결제 시:</strong> 입금자명, 거래내역</li>
              <li><strong>서비스 이용 시:</strong> 주문내역, 접속 로그, IP 주소, 브라우저 정보</li>
              <li><strong>자동 수집:</strong> 쿠키, 방문일시, 서비스 이용 기록</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제2조 (개인정보의 수집 및 이용 목적)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>회원 가입 및 관리: 본인 확인, 서비스 부정이용 방지, 고지사항 전달</li>
              <li>서비스 제공: 주문 처리, 잔액 관리, 결제 처리</li>
              <li>고객 지원: 문의 응대, 불만 처리, 공지사항 전달</li>
              <li>서비스 개선: 서비스 이용 통계, 신규 서비스 개발</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제3조 (개인정보의 보유 및 이용 기간)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다.</li>
              <li>단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>계약 또는 청약 철회에 관한 기록: 5년 (전자상거래법)</li>
                  <li>대금 결제 및 재화 공급에 관한 기록: 5년 (전자상거래법)</li>
                  <li>소비자 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래법)</li>
                  <li>접속에 관한 기록: 3개월 (통신비밀보호법)</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제4조 (개인정보의 제3자 제공)</h2>
            <p className="text-muted-foreground leading-relaxed">
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만, 이용자가 사전에 동의한 경우 또는 법령의 규정에 의한 경우는 예외로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제5조 (개인정보 처리 위탁)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li><strong>Supabase Inc.:</strong> 데이터 저장 및 인증 서비스 운영</li>
              <li><strong>Vercel Inc.:</strong> 웹 서비스 호스팅</li>
              <li><strong>Google LLC:</strong> 소셜 로그인, 웹 분석</li>
              <li>위탁 업체는 개인정보보호를 위해 관련 법령을 준수합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제6조 (개인정보의 파기)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 파기합니다.</li>
              <li>전자적 파일: 복구 불가능한 방법으로 영구 삭제합니다.</li>
              <li>종이 문서: 분쇄기로 분쇄하거나 소각합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제7조 (이용자의 권리와 행사 방법)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>이용자는 언제든지 자신의 개인정보를 조회·수정·삭제할 수 있습니다.</li>
              <li>회원 탈퇴를 통해 개인정보 처리 동의를 철회할 수 있습니다.</li>
              <li>개인정보 관련 요청은 이메일(support@influx-lab.com)로 접수하시면 지체 없이 처리합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제8조 (개인정보의 안전성 확보 조치)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>비밀번호 암호화 저장 (해시 처리)</li>
              <li>SSL/TLS를 이용한 데이터 전송 암호화</li>
              <li>데이터베이스 접근 제어 및 Row Level Security 적용</li>
              <li>개인정보 취급자 최소화</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제9조 (쿠키의 사용)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>회사는 이용자의 로그인 상태 유지 및 서비스 개선을 위해 쿠키를 사용합니다.</li>
              <li>이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제10조 (개인정보 보호 책임자)</h2>
            <ul className="list-none text-muted-foreground space-y-1">
              <li>성명: 박주현</li>
              <li>직책: 대표</li>
              <li>이메일: support@influx-lab.com</li>
            </ul>
          </section>

          <section className="border-t pt-6 mt-10">
            <p className="text-sm text-muted-foreground">
              본 방침은 2026년 1월 29일부터 시행됩니다.<br />
              개인정보 침해에 대한 신고·상담은 개인정보침해신고센터(privacy.kisa.or.kr, 118)로 문의하실 수 있습니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
