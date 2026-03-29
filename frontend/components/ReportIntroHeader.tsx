"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

type Props = {
  /** 상단 한 줄 제목 (예: 재물운 리포트) */
  title: string;
};

export function ReportIntroHeader({ title }: Props) {
  const router = useRouter();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "8px 0 16px",
        borderBottom: "1px solid rgba(61, 53, 48, 0.08)",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0, flex: 1 }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            border: "none",
            background: "transparent",
            color: "#3D3530",
            padding: 4,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          aria-label="뒤로"
        >
          <Icon icon="mdi:chevron-left" width={26} />
        </button>
        <h1
          style={{
            fontSize: 17,
            fontWeight: 700,
            margin: 0,
            color: "#3D3530",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </h1>
      </div>
      <button
        type="button"
        onClick={() => router.push("/saju-mypage")}
        style={{
          border: "none",
          background: "transparent",
          padding: 6,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          flexShrink: 0,
        }}
        aria-label="메뉴"
      >
        <Icon icon="mdi:menu" width={22} color="#3D3530" />
      </button>
    </header>
  );
}
