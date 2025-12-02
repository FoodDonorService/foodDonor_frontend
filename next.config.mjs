/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 정적 빌드를 위한 설정
  trailingSlash: true, // S3 호환성을 위한 설정
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // 정적 빌드에서 이미지 최적화 비활성화
  },
  // 개발 환경에서 프록시 설정 (정적 빌드에서는 작동하지 않음)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://bb41l61a31.execute-api.ap-northeast-2.amazonaws.com/v0/:path*',
      },
    ]
  },
}

export default nextConfig
