# 결제 시스템 설정 가이드

## 1. 카카오페이 설정

### 가맹점 신청
1. [카카오페이 비즈니스](https://business.kakaopay.com) 접속
2. 온라인 결제 가맹 신청
3. 사업자 등록증, 통장 사본 제출
4. 심사 완료 후 CID 발급 (약 3-5일 소요)

### 환경변수 설정 (.env.local)
```env
# 카카오페이
KAKAOPAY_CID=YOUR_REAL_CID          # 발급받은 CID (테스트: TC0ONETIME)
KAKAOPAY_SECRET_KEY=YOUR_SECRET_KEY  # Admin Key
```

### 테스트 모드
- 테스트 CID: `TC0ONETIME` (현재 설정됨)
- 테스트 모드에서는 실제 결제되지 않음
- 실서비스 전환 시 발급받은 CID로 변경

---

## 2. USDT (TRC-20) 설정

### 지갑 주소 준비
1. 바이낸스, OKX, 업비트 등에서 USDT 입금 주소 생성
2. **반드시 TRC-20 (Tron) 네트워크** 선택
3. 주소 형식: `T`로 시작 (예: `TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9`)

### 환경변수 설정 (.env.local)
```env
# USDT TRC-20
NEXT_PUBLIC_USDT_WALLET_ADDRESS=YOUR_TRC20_WALLET_ADDRESS
```

### 주의사항
- ERC-20, BEP-20 등 다른 네트워크 주소 사용 금지
- 잘못된 네트워크로 전송 시 자산 영구 소실

---

## 3. 무통장 입금 설정

### 현재 설정 위치
`src/app/(dashboard)/deposit/page.tsx`

```typescript
const BANK_INFO = {
  bankName: '하나은행',
  accountNumber: '260-910802-69907',
  accountHolder: 'ㅂㅈㅎ',  // 의도적 마스킹
};
```

### 자동 입금 확인 (선택)
- 은행 API 연동 또는 스크래핑 서비스 필요
- 현재는 수동 확인 후 어드민에서 승인

---

## 4. 환경변수 전체 목록

```env
# ===================
# 결제 시스템
# ===================

# 카카오페이
KAKAOPAY_CID=TC0ONETIME
KAKAOPAY_SECRET_KEY=

# USDT
NEXT_PUBLIC_USDT_WALLET_ADDRESS=

# ===================
# Supabase
# ===================
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ===================
# 도메인
# ===================
NEXT_PUBLIC_SITE_URL=https://www.influx-lab.com
```

---

## 5. Vercel 환경변수 설정

1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Environment Variables
3. 각 환경변수 추가 (Production, Preview, Development)
4. 재배포 필요

---

## 체크리스트

- [ ] 카카오페이 가맹 신청
- [ ] 카카오페이 CID 발급
- [ ] USDT TRC-20 지갑 주소 생성
- [ ] Vercel 환경변수 설정
- [ ] 테스트 결제 진행
- [ ] 실서비스 전환
