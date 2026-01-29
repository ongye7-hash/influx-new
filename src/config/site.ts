// ============================================
// Site Configuration
// 사이트 전역 설정 및 법적 정보
// ============================================

export const siteConfig = {
  // 기본 정보
  name: "INFLUX",
  nameKorean: "인플럭스",
  url: "https://www.influx-lab.com",

  // 회사 정보 (전자상거래법 필수 표기)
  company: {
    name: "루프셀앤미디어",
    ceo: "박주현",
    businessNumber: "420-50-00984",
    salesRegistration: "제2026-서울도봉-0097호",
    address: "서울특별시 도봉구 도봉로 133길 41, 5층",
    email: "support@influx-lab.com",
    phone: "", // 고객센터 번호 없음
    kakaoChannel: "@influx",
  },

  // 서비스 운영 시간
  serviceHours: {
    support: "평일 10:00 - 18:00",
    system: "24시간 자동화 운영",
  },

  // 소셜 링크
  social: {
    kakao: "https://pf.kakao.com/_xgpUAX",
    instagram: "https://instagram.com/influx_kr",
    youtube: "https://youtube.com/@influx_kr",
  },

  // 법적 페이지 링크
  legal: {
    terms: "/terms",
    privacy: "/privacy",
  },

  // 서비스 카테고리
  services: [
    { name: "유튜브", href: "/services/youtube" },
    { name: "인스타그램", href: "/services/instagram" },
    { name: "틱톡", href: "/services/tiktok" },
    { name: "페이스북", href: "/services/facebook" },
    { name: "텔레그램", href: "/services/telegram" },
  ],

  // 메뉴 링크
  navigation: {
    main: [
      { name: "서비스", href: "/order" },
      { name: "가격표", href: "/order" },
      { name: "인사이트", href: "/blog" },
      { name: "고객센터", href: "/support" },
    ],
    footer: [
      { name: "이용약관", href: "/terms" },
      { name: "개인정보처리방침", href: "/privacy" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
