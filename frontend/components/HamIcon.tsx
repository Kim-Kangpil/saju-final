"use client";

import Image from "next/image";

/**
 * 햄스터 아이콘 — next/image로 경로·크기 안정 표시 (public/images/ham_icon.png)
 */
interface HamIconProps {
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  /** 홈 히어로 등 첫 화면 아이콘일 때 true */
  priority?: boolean;
}

const SIZE = 40;

export function HamIcon({ alt = "햄스터", className, style, priority }: HamIconProps) {
  return (
    <Image
      src="/images/ham_icon.png"
      alt={alt}
      width={SIZE}
      height={SIZE}
      className={className}
      style={style}
      priority={!!priority}
      unoptimized
    />
  );
}
