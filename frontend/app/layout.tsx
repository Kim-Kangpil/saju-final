import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "../components/header";
import Footer from "../components/footer";

export const metadata: Metadata = {
  title: "사주 프로젝트",
  description: "네오둥근모 폰트 적용",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#556b2f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased bg-gradient-to-b from-white via-[#fefae0] to-[#f8f4e6]">
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow pb-0">
            {children}
          </main>

          {/* 푸터 중앙 정렬 래퍼 */}
          <div style={{ width: "100%", background: "inherit" }}>
            <div style={{ maxWidth: 390, margin: "0 auto", padding: "0 20px" }}>
              <Footer />
            </div>
          </div>

        </div>
      </body>
    </html>
  );
}
