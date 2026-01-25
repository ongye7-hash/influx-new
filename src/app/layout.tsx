import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1120" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "INFLUX(인플럭스) - 글로벌 1위 SNS 성장/마케팅 자동화 솔루션",
    template: "%s | INFLUX",
  },
  description:
    "유튜브 조회수, 인스타 팔로워, 틱톡 성장 등 크리에이터를 위한 올인원 마케팅 플랫폼. 24시간 자동화 시스템으로 가장 빠르고 안전하게 채널을 성장시키세요.",
  keywords: [
    "인플럭스",
    "SMM 패널",
    "유튜브 구독자 늘리기",
    "인스타 팔로워 구매",
    "SNS 마케팅",
    "유튜브 수익창출",
    "틱톡 조회수",
    "유튜브 트래픽 분석",
    "유튜브 트래픽 업체",
    "유튜브 조회수 늘리기",
    "소셜미디어 마케팅",
    "SMM Panel",
    "Social Media Marketing",
  ],
  verification: {
    google: "cZUHSTGI0c7z861Bjl-22lvjAQtuoTv64XdPsReKOcU",
    other: {
      "naver-site-verification": "4978d263a7ce773c9844990957aa62ed0264686e",
    },
  },
  authors: [{ name: "Loopcell & Media" }],
  creator: "Loopcell & Media",
  publisher: "INFLUX",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.influx-lab.com"),
  alternates: {
    canonical: "/",
    languages: {
      "ko-KR": "/ko",
      "en-US": "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.influx-lab.com",
    title: "INFLUX(인플럭스) - 글로벌 1위 SNS 성장/마케팅 자동화 솔루션",
    description:
      "유튜브 조회수, 인스타 팔로워, 틱톡 성장 등 크리에이터를 위한 올인원 마케팅 플랫폼. 24시간 자동화 시스템으로 가장 빠르고 안전하게 채널을 성장시키세요.",
    siteName: "INFLUX - 인플럭스",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "INFLUX - Global SNS Marketing Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "INFLUX(인플럭스) - 글로벌 1위 SNS 성장/마케팅 자동화 솔루션",
    description:
      "유튜브 조회수, 인스타 팔로워, 틱톡 성장 등 크리에이터를 위한 올인원 마케팅 플랫폼.",
    images: ["/og-image.png"],
    creator: "@influx_kr",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Preconnect for faster font loading */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
      </head>
      <body className="min-h-screen bg-background antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
          </QueryProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: "font-sans",
              style: {
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              },
            }}
          />
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
        )}
      </body>
    </html>
  );
}
