"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  linkTo?: string;
}

const sizeMap = {
  sm: { icon: 24, text: "text-lg" },
  md: { icon: 32, text: "text-xl" },
  lg: { icon: 40, text: "text-2xl" },
};

export function Logo({
  className,
  size = "md",
  showText = true,
  linkTo = "/",
}: LogoProps) {
  const { icon, text } = sizeMap[size];

  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo Icon Image */}
      <Image
        src="/logo-sidebar.png"
        alt="INFLUX"
        width={icon}
        height={icon}
        priority
      />

      {/* Text Logo */}
      {showText && (
        <span className={cn("font-bold tracking-tight", text)}>
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            INFLUX
          </span>
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

export function LogoIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-sidebar.png"
      alt="INFLUX"
      width={32}
      height={32}
      className={className}
      priority
    />
  );
}
