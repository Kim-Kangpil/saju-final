/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig = {
  // Render 정적 빌드 설정
  output: 'export',
  distDir: 'dist',
  
  // 빌드 속도 최적화
  typescript: {
    ignoreBuildErrors: true, // 타입 검사 스킵 (빌드 시)
  },
  eslint: {
    ignoreDuringBuilds: true, // ESLint 검사 스킵
  },
  
  // 소스맵 비활성화 (빌드 속도 향상)
  productionBrowserSourceMaps: false,
  
  // 이미지 최적화 비활성화 (정적 빌드 필요)
  images: {
    unoptimized: true,
  },
  
  // SWC 최소화 (빠른 컴파일)
  swcMinify: true,
  
  // 실험적 최적화
  experimental: {
    // 패키지 임포트 최적화
    optimizePackageImports: ['framer-motion', '@iconify/react', 'motion'],
  },
  
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;