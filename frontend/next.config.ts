/** @type {import('next').NextConfig} */
const nextConfig = {
  // 빌드 출력 디렉토리
  distDir: 'dist',

  // 타입 검사 스킵 (빌드 속도)
  typescript: {
    ignoreBuildErrors: true,
  },

  // 소스맵 비활성화
  productionBrowserSourceMaps: false,

  // 이미지 최적화 비활성화
  images: {
    unoptimized: true,
  },

  // 빌드 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 패키지 임포트 최적화
  experimental: {
    optimizePackageImports: ['framer-motion', '@iconify/react'],
  },
};

export default nextConfig;