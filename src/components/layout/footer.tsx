"use client";

import Link from "next/link";
import { Logo } from "./logo";
import {
  Instagram,
  Youtube,
  Twitter,
  Mail,
  Globe
} from "lucide-react";

const footerLinks = {
  services: [
    { name: "유튜브 서비스", href: "/services/youtube" },
    { name: "인스타그램 서비스", href: "/services/instagram" },
    { name: "틱톡 서비스", href: "/services/tiktok" },
    { name: "트위터 서비스", href: "/services/twitter" },
  ],
  support: [
    { name: "자주 묻는 질문", href: "/faq" },
    { name: "이용 가이드", href: "/guide" },
    { name: "API 문서", href: "/api-docs" },
    { name: "고객센터", href: "/support" },
  ],
  legal: [
    { name: "이용약관", href: "/terms" },
    { name: "개인정보처리방침", href: "/privacy" },
    { name: "환불정책", href: "/refund" },
  ],
};

const socialLinks = [
  { name: "Instagram", href: "#", icon: Instagram },
  { name: "Youtube", href: "#", icon: Youtube },
  { name: "Twitter", href: "#", icon: Twitter },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Logo size="lg" linkTo="/" />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              Global Social Media Marketing Platform powered by Loopcell.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              유튜브, 인스타그램, 틱톡 등 모든 SNS 채널의 성장을 위한
              최고의 마케팅 솔루션을 제공합니다.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">서비스</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">고객지원</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">법적 고지</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mt-12 pt-8">
          {/* Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p className="font-medium text-foreground">루프셀앤미디어 (Loopcell & Media)</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>책임자: -</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@influx.kr</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>www.influx.kr</span>
              </div>
            </div>

            <div className="flex flex-col md:items-end justify-end">
              <p className="text-xs text-muted-foreground">
                본 서비스는 마케팅 목적으로만 사용되어야 하며,
                <br className="hidden sm:block" />
                불법적인 용도로의 사용을 금지합니다.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 INFLUX by Loopcell & Media. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
