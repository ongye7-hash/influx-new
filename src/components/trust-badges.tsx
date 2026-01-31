'use client';

import { FaShieldAlt, FaUndo, FaHeadset, FaCheckCircle } from 'react-icons/fa';

export function TrustBadges() {
  const badges = [
    {
      icon: FaCheckCircle,
      text: 'SSL 보안 인증',
    },
    {
      icon: FaUndo,
      text: '30일 환불 보장',
    },
    {
      icon: FaShieldAlt,
      text: '99.8% 가동률',
    },
    {
      icon: FaHeadset,
      text: '24/7 고객 지원',
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
      {badges.map((badge, index) => (
        <div key={index} className="flex items-center gap-2 text-white/60">
          <badge.icon className="text-sm sm:text-base flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{badge.text}</span>
        </div>
      ))}
    </div>
  );
}
