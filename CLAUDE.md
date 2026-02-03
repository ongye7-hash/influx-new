# INFLUX 프로젝트 컨텍스트

## 프로젝트 개요
- **서비스**: SNS 마케팅 자동화 플랫폼 (인스타 팔로워, 유튜브 조회수 등)
- **URL**: https://www.influx-lab.com
- **스택**: Next.js 16 + Supabase + Vercel
- **회사**: 루프셀앤미디어 (사업자등록번호: 420-50-00984)

## 핵심 기능 현황
- [x] 주문 시스템 (admin_products 기반)
- [x] 결제: 무통장입금 + USDT (Cryptomus 자동결제 연동 완료)
- [x] 구글 소셜 로그인
- [x] 리셀러 API
- [x] 무료체험
- [x] 블로그 (SEO용)

## 환경변수 (Vercel에 설정됨)
- CRYPTOMUS_API_KEY, CRYPTOMUS_MERCHANT_ID (USDT 결제)
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

## 현재 상태 (2026-02)
- 사이트 기능: 완성됨
- 문제: 고객 유입 부족 (방문자 거의 없음)
- 전환율 분석 완료: 기능보다 유입이 우선

## 유입 확보 전략 (우선순위)
1. 네이버 검색광고 (일 5,000원~)
2. 네이버 블로그 운영
3. 네이버 지식iN 답변
4. 티스토리 블로그
5. 블로그 체험단 (리뷰 작성 시 1만원 크레딧)

## 기술적 참고사항
- admin 페이지: /admin/* (슈퍼어드민 전용)
- deposits 테이블: Cryptomus webhook이 자동 승인
- 사이트맵: /sitemap.xml (자동 생성)

## 최근 주요 작업
- v4.3 디자인/텍스트 전면 수정
- Cryptomus USDT 자동결제 연동
- 사이트맵 누락 페이지 추가
- 전환율 분석 완료

## 하지 말 것
- 가짜 성공사례/후기 추가 (신뢰 깎음)
- 무거운 전술 추가 (쿠폰팝업, 가격비교표 등) - 유입 먼저
- 불필요한 기능 추가 - 마케팅이 우선
