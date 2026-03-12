"use client";

/**
 * 햄스터 아이콘 — WebP 우선 로드, PNG 폴백 (forest 배경과 동일 방식으로 로딩 개선)
 * public/images/ham_icon.webp 있으면 WebP 사용, 없으면 PNG만 로드
 */
interface HamIconProps {
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  /** 홈 히어로 등 첫 화면 아이콘일 때 true → fetchPriority="high" */
  priority?: boolean;
}

export function HamIcon({ alt = "햄스터", className, style, priority }: HamIconProps) {
  return (
    <picture>
      <source srcSet="/images/ham_icon.webp" type="image/webp" />
      <img
        src="/images/ham_icon.png"
        alt={alt}
        className={className}
        style={style}
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}
