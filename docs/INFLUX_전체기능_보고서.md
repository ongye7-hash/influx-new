# INFLUX SNS 마케팅 자동화 플랫폼 - 전체 기능 보고서

**작성일**: 2026-02-03
**버전**: v4.3+
**URL**: https://www.influx-lab.com
**회사**: 루프셀앤미디어 (사업자등록번호: 420-50-00984)

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [폴더 구조](#3-폴더-구조)
4. [데이터베이스 구조](#4-데이터베이스-구조)
5. [사용자 기능 (고객)](#5-사용자-기능-고객)
6. [관리자 기능 (어드민)](#6-관리자-기능-어드민)
7. [API 엔드포인트](#7-api-엔드포인트)
8. [결제 시스템](#8-결제-시스템)
9. [보안 기능](#9-보안-기능)
10. [환경변수](#10-환경변수)

---

## 1. 프로젝트 개요

INFLUX는 SNS 마케팅 자동화 플랫폼입니다. 인스타그램 팔로워, 유튜브 조회수, 틱톡 좋아요 등 다양한 SNS 서비스를 판매하는 리셀러 플랫폼입니다.

### 핵심 비즈니스 로직
1. 사용자가 잔액 충전 (무통장/USDT)
2. 원하는 서비스 선택 후 주문
3. 시스템이 자동으로 도매처 API 호출
4. 주문 처리 완료 후 결과 확인

### 수익 모델
- 도매처 가격 + 마진 = 소매 가격
- 마진 일괄 설정 기능 (어드민)

---

## 2. 기술 스택

### Frontend
| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| Next.js | 16.1.1 | 프레임워크 |
| React | 19.2.3 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 4.x | 스타일링 |
| Radix UI | - | UI 컴포넌트 |
| Zustand | - | 전역 상태관리 |
| React Query | 5.90.18 | 서버 상태관리 |
| React Hook Form | - | 폼 처리 |
| Zod | - | 유효성 검증 |
| Framer Motion | - | 애니메이션 |
| Lucide React | - | 아이콘 |
| Sonner | - | 토스트 알림 |

### Backend
| 기술 | 용도 |
|------|------|
| Next.js API Routes | API 서버 |
| Supabase | 데이터베이스 (PostgreSQL) |
| Supabase Auth | 인증 (OAuth2) |
| Supabase Storage | 파일 저장 |
| Supabase Realtime | 실시간 구독 |

### 외부 서비스
| 서비스 | 용도 |
|--------|------|
| Cryptomus | USDT 결제 |
| CoinGecko API | 환율 조회 |
| Vercel | 호스팅/배포 |

---

## 3. 폴더 구조

```
influx/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # 인증 페이지 그룹
│   │   │   ├── login/            # 로그인
│   │   │   ├── register/         # 회원가입
│   │   │   └── forgot-password/  # 비밀번호 찾기
│   │   ├── (dashboard)/          # 대시보드 레이아웃 그룹
│   │   │   ├── dashboard/        # 메인 대시보드
│   │   │   ├── order/            # 새 주문
│   │   │   ├── orders/           # 주문 내역
│   │   │   ├── deposit/          # 충전
│   │   │   ├── transactions/     # 잔액 내역
│   │   │   ├── free-trial/       # 무료체험
│   │   │   ├── referral/         # 친구 추천
│   │   │   ├── support/          # 고객센터
│   │   │   ├── settings/         # 설정
│   │   │   └── guide/            # 이용 가이드
│   │   ├── admin/                # 관리자 페이지
│   │   │   ├── page.tsx          # 어드민 대시보드
│   │   │   ├── products/         # 상품 관리
│   │   │   ├── categories/       # 카테고리 관리
│   │   │   ├── deposits/         # 입금 관리
│   │   │   ├── orders/           # 주문 관리
│   │   │   ├── providers/        # API 제공자 관리
│   │   │   ├── users/            # 사용자 관리
│   │   │   ├── announcements/    # 공지사항 관리
│   │   │   └── settings/         # 시스템 설정
│   │   ├── api/                  # API 라우트
│   │   │   ├── orders/           # 주문 API
│   │   │   ├── crypto/           # 암호화폐 결제 API
│   │   │   ├── coupons/          # 쿠폰 API
│   │   │   ├── free-trial/       # 무료체험 API
│   │   │   ├── referral/         # 추천 API
│   │   │   ├── reviews/          # 리뷰 API
│   │   │   ├── admin/            # 관리자 API
│   │   │   ├── auth/             # 인증 API
│   │   │   └── v2/               # 리셀러 API v2
│   │   ├── auth/                 # OAuth 콜백
│   │   ├── blog/                 # 블로그 (SEO)
│   │   ├── services/             # 서비스 소개 페이지
│   │   ├── terms/                # 이용약관
│   │   ├── privacy/              # 개인정보처리방침
│   │   ├── reseller/             # 리셀러 안내
│   │   └── page.tsx              # 랜딩페이지
│   ├── components/               # 재사용 컴포넌트
│   │   ├── ui/                   # 기본 UI (Button, Card, Input 등)
│   │   ├── layout/               # 레이아웃 (Sidebar, Header 등)
│   │   ├── landing/              # 랜딩페이지 전용
│   │   └── dashboard/            # 대시보드 전용
│   ├── hooks/                    # 커스텀 훅
│   │   ├── use-auth.ts           # 인증 훅
│   │   ├── use-products.ts       # 상품 데이터 훅
│   │   └── ...
│   ├── lib/                      # 유틸리티
│   │   ├── supabase/             # Supabase 클라이언트
│   │   ├── utils.ts              # 공통 유틸
│   │   └── guest-mode.ts         # 비회원 모드
│   ├── stores/                   # Zustand 스토어
│   │   └── guest-store.ts        # 비회원 상태
│   └── types/                    # TypeScript 타입
│       └── database.ts           # DB 타입 정의
├── public/                       # 정적 파일
├── docs/                         # 문서
├── 네이버블로그/                  # 블로그 콘텐츠
├── 커뮤니티/                      # 커뮤니티 콘텐츠
└── package.json
```

---

## 4. 데이터베이스 구조

### 4.1 profiles (사용자 프로필)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK, auth.users.id 연동 |
| email | text | 이메일 |
| username | text | 사용자명 |
| full_name | text | 실명 |
| phone | text | 전화번호 |
| balance | numeric | 현재 잔액 |
| total_spent | numeric | 누적 지출 |
| total_orders | integer | 누적 주문수 |
| tier | text | 등급 (basic/vip/premium/enterprise) |
| referral_code | text | 내 추천 코드 |
| referred_by | text | 추천인 코드 |
| is_admin | boolean | 관리자 여부 |
| is_active | boolean | 활성화 여부 |
| avatar_url | text | 프로필 이미지 |
| created_at | timestamp | 가입일 |
| updated_at | timestamp | 수정일 |

**티어별 혜택**:
- basic: 일반 (0원~)
- vip: VIP (50만원+) - 할인율 적용
- premium: 프리미엄 (200만원+)
- enterprise: 엔터프라이즈 (500만원+)

### 4.2 admin_products (상품)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| category_id | uuid | FK → admin_categories |
| name | text | 상품명 |
| description | text | 설명 |
| price_per_1000 | numeric | 1,000개당 가격 (KRW) |
| min_quantity | integer | 최소 주문 수량 |
| max_quantity | integer | 최대 주문 수량 |
| primary_provider_id | uuid | FK → api_providers (1순위) |
| primary_service_id | text | 1순위 도매처 서비스 ID |
| fallback1_provider_id | uuid | 2순위 도매처 |
| fallback1_service_id | text | 2순위 서비스 ID |
| fallback2_provider_id | uuid | 3순위 도매처 |
| fallback2_service_id | text | 3순위 서비스 ID |
| input_type | text | 입력 타입 (link/username/custom) |
| refill_days | integer | 리필 보증 일수 |
| avg_speed | text | 평균 처리 속도 |
| sort_order | integer | 정렬 순서 |
| is_active | boolean | 활성화 |
| is_recommended | boolean | 추천 상품 |
| created_at | timestamp | 생성일 |

**input_type 종류**:
- `link`: 게시물/프로필 링크
- `link_quantity`: 링크 + 수량
- `link_comments`: 링크 + 댓글 목록
- `link_usernames`: 링크 + 사용자명 목록
- `username`: 사용자명만
- `custom`: 커스텀

### 4.3 admin_categories (카테고리)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| platform | text | 플랫폼 (instagram/youtube/tiktok 등) |
| name | text | 카테고리명 |
| slug | text | URL 슬러그 |
| is_active | boolean | 활성화 |
| sort_order | integer | 정렬 순서 |

### 4.4 api_providers (도매처/API 제공자)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| name | text | 제공자명 |
| slug | text | 식별자 |
| api_url | text | API 엔드포인트 |
| api_key | text | API 키 |
| is_active | boolean | 활성화 |
| priority | integer | 우선순위 |
| balance | numeric | 잔액 (조회용) |
| currency | text | 통화 |
| description | text | 설명 |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |

### 4.5 orders (주문)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| order_number | text | 주문번호 (INF-YYYYMMDD-XXXX) |
| user_id | uuid | FK → profiles |
| service_id | uuid | FK → admin_products |
| link | text | 대상 링크 |
| quantity | integer | 주문 수량 |
| amount | numeric | 결제 금액 |
| charge | numeric | 원가 |
| unit_price | numeric | 단가 |
| status | text | 상태 |
| provider_order_id | text | 도매처 주문 ID |
| provider_id | uuid | 사용한 API 제공자 |
| start_count | integer | 시작 카운트 |
| remains | integer | 남은 수량 |
| error_message | text | 에러 메시지 |
| created_at | timestamp | 주문일 |
| updated_at | timestamp | 수정일 |
| completed_at | timestamp | 완료일 |

**주문 상태 (status)**:
- `pending`: 대기중 (결제 완료, API 전송 전)
- `processing`: 처리중 (API 전송 완료)
- `in_progress`: 진행중
- `completed`: 완료
- `partial`: 부분완료
- `canceled`: 취소됨
- `refunded`: 환불됨
- `failed`: 실패

### 4.6 deposits (입금/충전)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| amount | numeric | 금액 (KRW) |
| depositor_name | text | 입금자명 |
| bank_name | text | 은행명 |
| account_number | text | 계좌번호 |
| receipt_url | text | 영수증 URL |
| status | text | 상태 (pending/approved/rejected) |
| admin_note | text | 관리자 메모 |
| approved_by | uuid | 승인자 |
| approved_at | timestamp | 승인일 |
| payment_method | text | 결제수단 (bank_transfer/crypto) |
| tx_id | text | 블록체인 TX 해시 |
| exchange_rate | numeric | 적용 환율 |
| crypto_amount | numeric | USDT 수량 |
| crypto_currency | text | 암호화폐 종류 |
| network | text | 네트워크 (TRC-20) |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |

### 4.7 transactions (거래 내역)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| type | text | 유형 (deposit/refund/order/bonus/adjustment) |
| amount | numeric | 금액 (음수 가능) |
| balance_before | numeric | 거래 전 잔액 |
| balance_after | numeric | 거래 후 잔액 |
| description | text | 설명 |
| reference_id | text | 참조 ID (주문/입금 ID) |
| reference_type | text | 참조 타입 |
| status | text | 상태 |
| metadata | jsonb | 추가 데이터 |
| created_at | timestamp | 생성일 |

### 4.8 coupons (쿠폰)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| code | text | 쿠폰 코드 (예: INFLUX2026) |
| type | text | 타입 (fixed/percent) |
| value | numeric | 값 (금액 또는 %) |
| min_amount | numeric | 최소 충전액 |
| max_uses | integer | 최대 사용 횟수 |
| used_count | integer | 사용된 횟수 |
| expires_at | timestamp | 만료일 |
| is_active | boolean | 활성화 |
| created_at | timestamp | 생성일 |

### 4.9 api_keys (리셀러 API 키)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| api_key | text | API 키 (고유) |
| is_active | boolean | 활성화 |
| rate_limit | integer | 요청 제한 |
| allowed_ips | text[] | IP 화이트리스트 |
| expires_at | timestamp | 만료일 |
| total_requests | integer | 총 요청 수 |
| total_orders | integer | 총 주문 수 |
| last_used_at | timestamp | 마지막 사용일 |
| created_at | timestamp | 생성일 |

### 4.10 announcements (공지사항)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| title | text | 제목 |
| content | text | 내용 |
| type | text | 유형 (info/warning/important) |
| is_pinned | boolean | 고정 여부 |
| is_active | boolean | 활성화 |
| created_by | uuid | 작성자 |
| created_at | timestamp | 작성일 |
| updated_at | timestamp | 수정일 |

### 4.11 available_free_trials (무료체험 - 뷰/테이블)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| trial_service_id | uuid | 무료체험 서비스 ID |
| service_id | uuid | FK → admin_products |
| service_name | text | 서비스명 |
| price | numeric | 원가 |
| trial_quantity | integer | 무료 제공량 |
| daily_limit | integer | 일일 제공 한도 |
| today_used | integer | 오늘 사용량 |
| remaining_today | integer | 오늘 남은 양 |
| is_active | boolean | 활성화 |
| category_name | text | 카테고리명 |
| category_slug | text | 카테고리 슬러그 |

### 4.12 RPC 함수 (PostgreSQL Functions)

#### add_balance
```sql
add_balance(
  p_user_id uuid,
  p_amount numeric,
  p_type text DEFAULT 'deposit',
  p_description text DEFAULT NULL,
  p_reference_id text DEFAULT NULL,
  p_reference_type text DEFAULT NULL
)
```
- 잔액 추가 (원자적 트랜잭션)
- transactions 기록 자동 생성
- 사용처: 입금 승인, 쿠폰 보너스, 리퍼럴 보상

#### check_trial_availability
```sql
check_trial_availability(
  p_user_id uuid,
  p_service_id uuid
) RETURNS jsonb
```
- 무료체험 가능 여부 확인
- 반환: `{ available: boolean, quantity: number, message: string }`

#### request_free_trial
```sql
request_free_trial(
  p_user_id uuid,
  p_service_id uuid,
  p_link text,
  p_ip_address text,
  p_user_agent text
) RETURNS uuid
```
- 무료체험 신청 처리
- 반환: trial_id

---

## 5. 사용자 기능 (고객)

### 5.1 인증 시스템

**파일**: `src/app/(auth)/login/page.tsx`, `src/hooks/use-auth.ts`

#### 로그인 방법
1. **Google 소셜 로그인** (기본)
   - Supabase OAuth2
   - `/auth/callback`에서 처리

2. **이메일/비밀번호 로그인**
   - Supabase Auth
   - 비밀번호 찾기 지원

#### 회원가입 흐름
1. 로그인 페이지 → 회원가입 탭
2. 이메일, 비밀번호, 닉네임 입력
3. 가입 완료 → 자동 로그인
4. 웰컴 크레딧 2,000원 자동 지급
5. 대시보드로 리다이렉트

#### 웰컴 보너스
**파일**: `src/app/api/auth/welcome-bonus/route.ts`, `src/app/auth/callback/route.ts`

- 신규 가입자에게 2,000원 크레딧 자동 지급
- 중복 지급 방지 (transactions 테이블 체크)
- OAuth 콜백에서 자동 호출

### 5.2 비회원 모드

**파일**: `src/lib/guest-mode.ts`, `src/stores/guest-store.ts`, `src/app/api/guest-mode/route.ts`

#### 기능
- 로그인 없이 서비스 둘러보기
- httpOnly 쿠키 기반 인증
- 서명된 토큰 사용 (HMAC-SHA256)

#### 제한
- 실제 주문 불가
- 충전 불가
- 연습 주문만 가능 (로컬 저장)

### 5.3 메인 대시보드

**파일**: `src/app/(dashboard)/dashboard/page.tsx`

#### 표시 정보
- 현재 잔액
- 이번 달 총 사용 금액
- 처리 중인 주문 수
- 완료된 주문 수
- 최근 주문 5건
- 무료체험 안내

#### 빠른 액션
- 새 주문하기
- 잔액 충전
- 주문 내역 보기

### 5.4 주문 시스템

**파일**: `src/app/(dashboard)/order/page.tsx`, `src/app/api/orders/process/route.ts`

#### 주문 프로세스
1. **플랫폼 선택**: Instagram, YouTube, TikTok, Facebook, Telegram 등
2. **카테고리 선택**: 팔로워, 좋아요, 조회수, 댓글 등
3. **상품 선택**: 품질/속도/가격별 다양한 옵션
4. **정보 입력**: 링크, 수량
5. **가격 확인**: `(price_per_1000 / 1000) × quantity`
6. **주문 완료**: 잔액 차감 → API 호출

#### API Fallback 시스템
```
1순위 API 호출 → 실패 시
2순위 API 호출 → 실패 시
3순위 API 호출 → 실패 시
잔액 환불 + 에러 표시
```

#### 주문 처리 API 로직
1. 사용자 인증 확인
2. 상품 정보 조회
3. 수량 검증 (min ≤ quantity ≤ max)
4. 가격 계산
5. 잔액 확인 (balance ≥ totalPrice)
6. 잔액 차감 (원자적 UPDATE)
7. 주문 생성 (status: 'pending')
8. API 호출 (Fallback 순서대로)
9. 성공: status → 'processing', provider_order_id 저장
10. 실패: 잔액 환불, status → 'failed'

### 5.5 주문 내역

**파일**: `src/app/(dashboard)/orders/page.tsx`

#### 기능
- 전체 주문 목록
- 상태별 필터링
- 날짜별 검색
- 주문 상세 보기
- 실시간 상태 업데이트

#### 주문 상태 표시
| 상태 | 색상 | 설명 |
|------|------|------|
| pending | 노란색 | 대기중 |
| processing | 파란색 | 처리중 |
| in_progress | 파란색 | 진행중 |
| completed | 초록색 | 완료 |
| partial | 주황색 | 부분완료 |
| canceled | 회색 | 취소됨 |
| failed | 빨간색 | 실패 |

### 5.6 충전 시스템

**파일**: `src/app/(dashboard)/deposit/page.tsx`

#### 무통장 입금

**은행 정보**:
- 은행: 하나은행
- 계좌: 260-910802-69907
- 예금주: ㅂㅈㅎ

**프로세스**:
1. 입금자명 입력
2. 금액 선택 (빠른 선택: 1만/3만/5만/10만/30만/50만)
3. 쿠폰 적용 (선택)
4. 충전 신청
5. 실제 입금
6. 어드민 승인 → 잔액 충전

#### USDT 결제 (Cryptomus)

**파일**: `src/app/api/crypto/create-payment/route.ts`, `src/app/api/crypto/webhook/route.ts`

**프로세스**:
1. 충전 금액 입력 (원화)
2. USDT 수량 자동 계산 (실시간 환율)
3. 결제하기 버튼 → Cryptomus 페이지로 이동
4. USDT 전송 (TRC-20 네트워크)
5. 웹훅으로 자동 승인 → 잔액 충전

**환율 계산**:
```
시스템 환율 = CoinGecko 시세 × (1 + 스프레드%)
USDT 수량 = 충전금액(KRW) / 시스템 환율
```

#### 쿠폰 시스템

**파일**: `src/app/api/coupons/validate/route.ts`

**사용 방법**:
1. 쿠폰 코드 입력
2. 적용 버튼 → 검증
3. 충전 신청 시 보너스 자동 지급

**쿠폰 타입**:
- Fixed: 고정액 보너스 (예: +10,000원)
- Percent: 비율 보너스 (예: +20%)

**현재 쿠폰**:
- `INFLUX2026`: 첫 충전 20% 보너스

### 5.7 잔액 내역

**파일**: `src/app/(dashboard)/transactions/page.tsx`

#### 표시 내용
- 거래 유형 (충전/주문/환불/보너스)
- 금액 (+ 또는 -)
- 거래 전후 잔액
- 상세 설명
- 날짜

### 5.8 무료체험

**파일**: `src/app/(dashboard)/free-trial/page.tsx`, `src/app/api/free-trial/route.ts`

#### 기능
- 무료 서비스 목록 표시
- 일일 제한 확인
- 서비스 신청

#### 프로세스
1. 서비스 선택
2. 대상 링크 입력
3. 신청 → check_trial_availability 확인
4. 가능 시 → request_free_trial 실행

#### 제한
- 계정당 서비스당 1일 1회
- 일일 전체 한도 존재

### 5.9 친구 추천

**파일**: `src/app/(dashboard)/referral/page.tsx`, `src/app/api/referral/`

#### 기능
- 내 추천 코드 표시
- 추천 링크 복사
- 추천 통계 (가입자 수, 보상 금액)
- 보상 내역

#### 보상 시스템
- 추천받은 사용자가 첫 충전 시
- 추천인에게 보상 지급 (설정된 비율)

### 5.10 고객센터

**파일**: `src/app/(dashboard)/support/page.tsx`

#### 탭 구성
1. **1:1 문의**: 문의 유형, 제목, 내용 입력
2. **FAQ**: 자주 묻는 질문
3. **공지사항**: announcements 테이블 연동

#### 빠른 연락처
- 카카오톡 상담: https://pf.kakao.com/_xgpUAX
- 이메일: support@influx-lab.com

### 5.11 설정

**파일**: `src/app/(dashboard)/settings/page.tsx`

#### 기능
- 프로필 편집 (닉네임, 전화번호)
- 비밀번호 변경
- API 키 관리 (리셀러용)

### 5.12 사이드바 & 네비게이션

**파일**: `src/components/layout/sidebar.tsx`, `src/app/(dashboard)/mobile-nav.tsx`

#### 메뉴 구성
- 홈 (랜딩페이지)
- 대시보드
- 새 주문
- 주문내역
- 포인트 충전
- 잔액 내역
- 친구 추천
- 고객센터
- 설정
- (관리자) 관리자 페이지

#### 표시 정보
- 현재 잔액
- 회원 등급
- 사용자 이메일

---

## 6. 관리자 기능 (어드민)

### 6.1 어드민 대시보드

**파일**: `src/app/admin/page.tsx`

#### 통계 카드
- 오늘 매출 (완료 주문 합계)
- 어제 대비 증감률
- 전체 회원수
- 오늘 신규 가입자
- 대기 중 입금 (건수 + 금액)
- 처리 중 주문 (건수)

#### 빠른 액션
- 최근 대기 입금 5건 → 빠른 승인
- 최근 주문 5건 → 상태 확인

### 6.2 상품 관리

**파일**: `src/app/admin/products/page.tsx`

#### 기능
1. **상품 목록**
   - 검색 (상품명, 카테고리)
   - 필터링 (카테고리별, 활성화 상태)
   - 정렬 (sort_order)

2. **상품 추가/수정**
   - 기본 정보: 카테고리, 상품명, 설명
   - 가격: price_per_1000 (1,000개당 가격)
   - 수량: min_quantity, max_quantity
   - API 연결: 3단계 Fallback
     - 1순위: primary_provider_id + primary_service_id
     - 2순위: fallback1_provider_id + fallback1_service_id
     - 3순위: fallback2_provider_id + fallback2_service_id
   - 입력 타입: link, username, custom 등
   - 옵션: 활성화, 추천 상품, 리필 보증

3. **상품 삭제**
   - 확인 대화상자 후 삭제

4. **일괄 작업**
   - 활성화/비활성화 토글
   - 추천 상품 토글

5. **마진 일괄 설정**
   - API: `POST /api/admin/apply-margin`
   - 도매가 × 환율 × (1 + 마진%) = 소매가

### 6.3 카테고리 관리

**파일**: `src/app/admin/categories/page.tsx`

#### 기능
- 카테고리 추가/수정/삭제
- 플랫폼별 분류
- 정렬 순서 설정
- 활성화 관리

### 6.4 입금 관리

**파일**: `src/app/admin/deposits/page.tsx`

#### 기능
1. **입금 목록**
   - 상태별 필터 (pending/approved/rejected)
   - 검색 (입금자명, 이메일, TXID)
   - 날짜 필터

2. **입금 승인**
   - 승인 버튼 클릭
   - add_balance RPC 호출 → 잔액 충전
   - 리퍼럴 보상 자동 확인

3. **입금 거절**
   - 거절 사유 입력 (선택)
   - admin_note에 저장

4. **결제 수단별 정보**
   - 무통장: 은행명, 입금자명
   - USDT: TX ID, 네트워크, USDT 수량, 환율

### 6.5 주문 관리

**파일**: `src/app/admin/orders/page.tsx`

#### 기능
- 주문 목록 (전체/상태별)
- 검색 (주문번호, 사용자)
- 주문 상세 보기
- 상태 수동 변경 (필요시)

### 6.6 API 제공자 관리

**파일**: `src/app/admin/providers/page.tsx`

#### 기능
1. **제공자 목록**
   - 이름, API URL, 활성화 상태
   - 잔액 표시 (조회 가능한 경우)

2. **제공자 추가/수정**
   - 이름, 슬러그
   - API URL, API 키
   - 우선순위
   - 활성화 여부

3. **서비스 조회**
   - 제공자 API에서 서비스 목록 조회
   - URL: `/admin/providers/[id]/services`

4. **서비스 동기화**
   - API: `POST /api/admin/providers/[id]/sync-services`

### 6.7 사용자 관리

**파일**: `src/app/admin/users/page.tsx`

#### 기능
- 사용자 목록
- 검색 (이메일, 이름)
- 잔액 직접 수정
- 회원 등급 변경
- 계정 활성화/비활성화

### 6.8 공지사항 관리

**파일**: `src/app/admin/announcements/page.tsx`

#### 기능
- 공지사항 추가/수정/삭제
- 유형 설정 (안내/주의/중요)
- 고정 설정
- 활성화 관리

### 6.9 시스템 설정

**파일**: `src/app/admin/settings/page.tsx`

#### 설정 항목
- 사이트 기본 설정
- 환율 설정
- API 설정

---

## 7. API 엔드포인트

### 7.1 인증 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/auth/welcome-bonus` | POST | 웰컴 크레딧 지급 |
| `/auth/callback` | GET | OAuth 콜백 처리 |

### 7.2 주문 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/orders/process` | POST | 주문 생성 |

**요청 예시**:
```json
{
  "service_id": "uuid",
  "link": "https://instagram.com/p/xxx",
  "quantity": 100
}
```

### 7.3 결제 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/crypto/exchange-rate` | GET | USDT/KRW 환율 |
| `/api/crypto/create-payment` | POST | Cryptomus 결제 생성 |
| `/api/crypto/webhook` | POST | Cryptomus 웹훅 수신 |
| `/api/exchange-rate` | GET | 일반 환율 조회 |

### 7.4 쿠폰 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/coupons/validate` | GET | 쿠폰 검증 |
| `/api/coupons/validate` | POST | 쿠폰 적용 |

**검증 요청**: `GET /api/coupons/validate?code=INFLUX2026`

**적용 요청**:
```json
{
  "code": "INFLUX2026",
  "deposit_amount": 50000
}
```

### 7.5 무료체험 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/free-trial` | GET | 무료체험 서비스 목록 |
| `/api/free-trial` | POST | 무료체험 신청 |

### 7.6 추천 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/referral/check-reward` | POST | 추천 보상 확인 |
| `/api/referral/set-referrer` | POST | 추천인 설정 |

### 7.7 리뷰 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/reviews` | GET | 리뷰 목록 |
| `/api/reviews` | POST | 리뷰 작성 |
| `/api/reviews/helpful` | POST | 도움됨 표시 |

### 7.8 관리자 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/admin/apply-margin` | POST | 마진 일괄 적용 |
| `/api/admin/check-provider-balance` | GET | 도매처 잔액 확인 |
| `/api/admin/providers/[id]/services` | GET | 도매처 서비스 조회 |
| `/api/admin/providers/[id]/sync-services` | POST | 서비스 동기화 |
| `/api/admin/providers/[id]/import-services` | POST | 서비스 가져오기 |

### 7.9 리셀러 API (v2)

**파일**: `src/app/api/v2/route.ts`

**인증**: API 키 기반 (`api_keys` 테이블)

**요청 형식**: `application/x-www-form-urlencoded`

| Action | 파라미터 | 설명 |
|--------|---------|------|
| `services` | - | 서비스 목록 |
| `balance` | - | 잔액 조회 |
| `add` | service, link, quantity | 주문 생성 |
| `status` | order 또는 orders | 주문 상태 |
| `refill` | order | 리필 요청 |
| `cancel` | orders | 주문 취소 |

**예시**:
```bash
# 서비스 목록
curl -X POST https://influx-lab.com/api/v2 \
  -d "key=YOUR_API_KEY&action=services"

# 주문 생성
curl -X POST https://influx-lab.com/api/v2 \
  -d "key=YOUR_API_KEY&action=add&service=1&link=https://...&quantity=100"

# 주문 상태
curl -X POST https://influx-lab.com/api/v2 \
  -d "key=YOUR_API_KEY&action=status&order=ORDER_ID"
```

---

## 8. 결제 시스템

### 8.1 무통장 입금 흐름

```
[사용자]
    ↓
입금자명 + 금액 입력
    ↓
INSERT deposits (status='pending')
    ↓
실제 은행 입금
    ↓
[어드민]
    ↓
입금 확인 → 승인 버튼
    ↓
UPDATE deposits (status='approved')
CALL add_balance()
    ↓
[사용자]
    ↓
잔액 충전 완료
```

### 8.2 USDT 결제 흐름 (Cryptomus)

```
[사용자]
    ↓
충전 금액 입력 (KRW)
    ↓
POST /api/crypto/create-payment
├─ 환율 조회 (CoinGecko)
├─ USDT 수량 계산
├─ INSERT deposits (status='pending')
└─ Cryptomus API → payment_url
    ↓
Cryptomus 결제 페이지
    ↓
USDT 전송 (TRC-20)
    ↓
[블록체인 확인]
    ↓
Cryptomus → POST /api/crypto/webhook
├─ IP 검증 (91.227.144.54)
├─ 서명 검증 (MD5)
├─ UPDATE deposits (status='approved')
└─ CALL add_balance()
    ↓
[사용자]
    ↓
잔액 자동 충전 완료
```

### 8.3 Cryptomus 웹훅 보안

```javascript
// IP 화이트리스트
const CRYPTOMUS_IPS = ['91.227.144.54'];

// 서명 검증
const dataBase64 = Buffer.from(JSON.stringify(body)).toString('base64');
const expectedSign = crypto
  .createHash('md5')
  .update(dataBase64 + CRYPTOMUS_API_KEY)
  .digest('hex');
```

---

## 9. 보안 기능

### 9.1 인증
- Supabase Auth (OAuth2)
- Row Level Security (RLS)
- httpOnly 쿠키 (비회원 모드)

### 9.2 API 보안
- API 키 인증 (리셀러)
- IP 화이트리스트 (Cryptomus)
- MD5 서명 검증 (웹훅)

### 9.3 데이터 검증
- 수량 범위 검증
- URL 프로토콜 검증 (http/https)
- 중복 처리 방지
- 쿠폰 중복 사용 방지

### 9.4 잔액 보호
- 원자적 트랜잭션 (UPDATE ... WHERE balance >= amount)
- Race Condition 방지

---

## 10. 환경변수

### Vercel에 설정된 환경변수

| 변수명 | 용도 |
|--------|------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase 프로젝트 URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase 익명 키 |
| SUPABASE_SERVICE_ROLE_KEY | Supabase 서비스 키 (백엔드) |
| CRYPTOMUS_API_KEY | Cryptomus API 키 |
| CRYPTOMUS_MERCHANT_ID | Cryptomus 판매자 ID |

---

## 부록: 주요 파일 위치 요약

| 기능 | 파일 |
|------|------|
| 랜딩페이지 | `src/app/page.tsx` |
| 로그인 | `src/app/(auth)/login/page.tsx` |
| 대시보드 | `src/app/(dashboard)/dashboard/page.tsx` |
| 주문 | `src/app/(dashboard)/order/page.tsx` |
| 충전 | `src/app/(dashboard)/deposit/page.tsx` |
| 무료체험 | `src/app/(dashboard)/free-trial/page.tsx` |
| 어드민 홈 | `src/app/admin/page.tsx` |
| 상품관리 | `src/app/admin/products/page.tsx` |
| 입금관리 | `src/app/admin/deposits/page.tsx` |
| 주문 API | `src/app/api/orders/process/route.ts` |
| 결제 API | `src/app/api/crypto/` |
| 쿠폰 API | `src/app/api/coupons/validate/route.ts` |
| 리셀러 API | `src/app/api/v2/route.ts` |
| 인증 훅 | `src/hooks/use-auth.ts` |
| 사이드바 | `src/components/layout/sidebar.tsx` |
