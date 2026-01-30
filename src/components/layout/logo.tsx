"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  linkTo?: string;
}

const sizeMap = {
  sm: { barScale: 0.7, text: "text-base", gap: "gap-1.5" },
  md: { barScale: 1, text: "text-xl", gap: "gap-2" },
  lg: { barScale: 1.2, text: "text-2xl", gap: "gap-2.5" },
};

function LogoBars({ scale = 1 }: { scale?: number }) {
  const w = Math.round(8 * scale);
  const h1 = Math.round(14 * scale);
  const h2 = Math.round(20 * scale);
  const h3 = Math.round(28 * scale);
  const totalH = h3;
  const svgW = w * 3 + Math.round(3 * scale);

  return (
    <svg
      width={svgW}
      height={totalH}
      viewBox={`0 0 ${svgW} ${totalH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Bar 1 - shortest, dark */}
      <rect x={0} y={totalH - h1} width={w} height={h1} rx={1} fill="#4A5568" />
      {/* Bar 2 - medium, dark gray */}
      <rect x={w + Math.round(1.5 * scale)} y={totalH - h2} width={w} height={h2} rx={1} fill="#64748B" />
      {/* Bar 3 - tallest, blue */}
      <rect x={(w + Math.round(1.5 * scale)) * 2} y={0} width={w} height={h3} rx={1} fill="#0EA5E9" />
    </svg>
  );
}

export function Logo({
  className,
  size = "md",
  showText = true,
  linkTo = "/",
}: LogoProps) {
  const { barScale, text, gap } = sizeMap[size];

  const content = (
    <div className={cn("flex items-center", gap, className)}>
      <LogoBars scale={barScale} />
      {showText && (
        <span className={cn("font-black tracking-tight text-foreground", text)}>
          INFLUX
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link href={linkTo} className="flex items-center hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

export function LogoIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <div className={className}>
      <LogoBars scale={size / 28} />
    </div>
  );
}
