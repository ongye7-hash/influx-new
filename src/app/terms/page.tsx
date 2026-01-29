import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관 | INFLUX',
  description: 'INFLUX 서비스 이용약관',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">이용약관</h1>
        <p className="text-muted-foreground mb-10">최종 수정일: 2026년 1월 29일</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">제1조 (목적)</h2>
            <p className="text-muted-foreground leading-relaxed">
              본 약관은 루프셀앤미디어(이하 &quot;회사&quot;)가 운영하는 INFLUX(이하 &quot;서비스&quot;)의 이용과 관련하여
              회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제2조 (정의)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>&quot;서비스&quot;란 회사가 제공하는 소셜 미디어 마케팅 관련 일체의 서비스를 의미합니다.</li>
              <li>&quot;이용자&quot;란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
              <li>&quot;잔액&quot;이란 이용자가 서비스 이용을 위해 충전한 선불금을 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제3조 (약관의 효력 및 변경)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
              <li>회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 7일 전 공지합니다.</li>
              <li>변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제4조 (회원가입 및 계정)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>이용자는 회사가 정한 양식에 따라 정보를 기입하여 회원가입을 신청합니다.</li>
              <li>허위 정보를 기재한 경우 서비스 이용이 제한될 수 있습니다.</li>
              <li>계정 정보의 관리 책임은 이용자에게 있으며, 타인에게 양도·대여할 수 없습니다.</li>
              <li>이용자는 만 14세 이상이어야 서비스를 이용할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제5조 (서비스의 내용)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>회사는 소셜 미디어 채널의 성장을 돕기 위한 마케팅 서비스를 제공합니다.</li>
              <li>서비스의 구체적 내용, 가격, 처리 시간은 서비스 페이지에 명시된 바에 따릅니다.</li>
              <li>회사는 서비스 품질 유지를 위해 서비스 내용을 변경하거나 중단할 수 있습니다.</li>
              <li>서비스 결과는 대상 플랫폼의 정책 변경 등 외부 요인에 의해 영향을 받을 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제6조 (잔액 충전 및 결제)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>이용자는 무통장 입금 또는 암호화폐(USDT) 등 회사가 정한 결제 수단으로 잔액을 충전할 수 있습니다.</li>
              <li>충전된 잔액은 서비스 주문 시 자동으로 차감됩니다.</li>
              <li>충전 후 환불 규정은 제8조에 따릅니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제7조 (주문 및 처리)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>이용자가 주문을 접수하면 회사는 가능한 한 신속하게 서비스를 처리합니다.</li>
              <li>주문 처리 중인 건은 취소가 불가능합니다.</li>
              <li>잘못된 정보(URL, 사용자명 등)로 인한 주문 실패는 이용자의 책임입니다.</li>
              <li>비공개 계정, 삭제된 게시물 등으로 서비스가 불가능한 경우 잔액이 환불됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제8조 (환불 정책)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>서비스가 시작되지 않은 주문은 전액 환불 가능합니다.</li>
              <li>서비스 진행 중인 주문은 미처리 분에 대해서만 부분 환불이 가능합니다.</li>
              <li>서비스가 완료된 주문은 환불이 불가능합니다.</li>
              <li>충전 잔액의 환불은 미사용 금액에 한하여 가능하며, 회사에 문의해야 합니다.</li>
              <li>환불 처리에는 영업일 기준 3~5일이 소요될 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제9조 (이용자의 의무)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>이용자는 관계 법령, 본 약관, 서비스 이용안내를 준수해야 합니다.</li>
              <li>불법적이거나 부정한 목적으로 서비스를 이용할 수 없습니다.</li>
              <li>서비스를 이용하여 타인의 권리를 침해하거나 명예를 훼손하는 행위를 할 수 없습니다.</li>
              <li>시스템에 대한 부정 접근, 해킹, 악성 프로그램 유포 등의 행위를 할 수 없습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제10조 (서비스 제한 및 중지)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>회사는 시스템 점검, 장비 교체 등 불가피한 사유로 서비스를 일시 중지할 수 있습니다.</li>
              <li>약관을 위반한 이용자에 대해 서비스 이용을 제한하거나 계정을 정지할 수 있습니다.</li>
              <li>천재지변, 국가비상사태 등 불가항력으로 인한 서비스 중단에 대해 회사는 책임지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제11조 (면책조항)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>회사는 대상 플랫폼(유튜브, 인스타그램 등)의 정책 변경으로 인한 결과에 대해 책임지지 않습니다.</li>
              <li>이용자의 귀책 사유로 발생한 손해에 대해 회사는 책임지지 않습니다.</li>
              <li>서비스 이용으로 인한 이용자의 대상 플랫폼 계정 상태 변화에 대해 회사는 보장하지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">제12조 (분쟁 해결)</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>서비스 이용과 관련된 분쟁은 회사와 이용자 간 협의를 통해 해결합니다.</li>
              <li>협의가 이루어지지 않을 경우, 대한민국 법률을 적용하며 관할 법원에 소를 제기할 수 있습니다.</li>
            </ul>
          </section>

          <section className="border-t pt-6 mt-10">
            <p className="text-sm text-muted-foreground">
              상호: 루프셀앤미디어 | 대표: 박주현 | 사업자등록번호: 420-50-00984<br />
              통신판매업신고: 제2026-서울도봉-0097호<br />
              주소: 서울특별시 도봉구 도봉로 133길 41, 5층<br />
              이메일: support@influx-lab.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
