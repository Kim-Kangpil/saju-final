import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "사주 프로젝트",
  description: "네오둥근모 폰트 적용",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* 여기서 bg-transparent를 추가해서 globals.css의 배경이 보이게 합니다 */}
      <body className="antialiased bg-transparent">
        {children}
      </body>
    </html>
  );
}