import type { Metadata, Viewport } from "next";
import Script from "next/script";
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

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<Record<string, string | string[]>>;
}>) {
  if (params) await params;
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#556b2f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased bg-gradient-to-b from-white via-[#fefae0] to-[#f8f4e6]">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KPH5HZM3"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KPH5HZM3');`,
          }}
        />
        <div className="flex flex-col min-h-screen relative" style={{ zIndex: 1 }}>
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
