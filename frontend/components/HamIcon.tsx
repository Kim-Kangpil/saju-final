"use client";

import Image from "next/image";

/**
 * 로고 아이콘 (음양 이미지) — 사용자 제공 시안
 */
interface HamIconProps {
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  /** 홈 히어로 등 첫 화면 아이콘일 때 true */
  priority?: boolean;
}

const SIZE = 40;

export function HamIcon({ alt = "로고", className, style, priority }: HamIconProps) {
  return (
    <span
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        width: SIZE,
        height: SIZE,
        ...style,
      }}
    >
      <Image
        src="/images/yin-yang-logo.png"
        alt={alt}
        fill
        priority={!!priority}
        unoptimized
        style={{ objectFit: "contain" }}
      />
    </span>
  );
}
