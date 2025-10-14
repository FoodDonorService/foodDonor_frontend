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
        destination: 'http://fooddonor.kro.kr:3000/:path*',
      },
    ]
  },
  // CORS 문제 해결을 위한 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://fooddonor.kro.kr:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma, X-CSRF-Token',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'Content-Length, Content-Type, Date, Server, Transfer-Encoding',
          },
        ],
      },
    ]
  },
}

export default nextConfig
