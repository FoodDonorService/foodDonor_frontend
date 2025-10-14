# CORS 문제 해결 가이드

## 1. Next.js 설정 (완료)
- next.config.mjs에 CORS 헤더 추가
- lib/api.ts에 CORS 헤더 추가

## 2. S3 버킷 CORS 설정
```bash
# AWS CLI로 S3 버킷에 CORS 설정 적용
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://s3-cors-config.json
```

## 3. CloudFront 설정 (선택사항)
- CloudFront를 사용하는 경우 추가 CORS 설정 필요
- Origin Request Policy에서 CORS 헤더 허용

## 4. 백엔드 서버 CORS 설정
백엔드 서버에서도 CORS를 허용해야 합니다:

```javascript
// Express.js 예시 - 도메인 명시 설정
const cors = require('cors');

app.use(cors({
  origin: [
    'http://fooddonor.kro.kr:3000',
    'https://fooddonor.kro.kr',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin', 
    'Cache-Control', 
    'Pragma',
    'X-CSRF-Token'
  ],
  exposedHeaders: [
    'Content-Length', 
    'Content-Type', 
    'Date', 
    'Server', 
    'Transfer-Encoding'
  ],
  maxAge: 86400, // 24시간 캐시
  preflightContinue: false,
  optionsSuccessStatus: 200
}));
```

## 5. 브라우저 개발자 도구에서 확인
- Network 탭에서 OPTIONS 요청 확인
- Response Headers에 CORS 헤더가 포함되어 있는지 확인

## 6. 문제 해결 체크리스트
- [ ] Next.js 빌드 시 CORS 헤더 포함
- [ ] S3 버킷 CORS 설정 적용
- [ ] 백엔드 서버 CORS 설정
- [ ] 브라우저 캐시 클리어
- [ ] HTTPS 사용 시 Mixed Content 문제 확인
