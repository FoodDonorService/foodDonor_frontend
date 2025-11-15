import { UserManager } from "oidc-client-ts";

// 1. Cognito 도메인 변수화
const cognitoDomain = "https://ap-northeast-26ts4hj1fk.auth.ap-northeast-2.amazoncognito.com";
const cognitoAuthority = "https://cognito-idp.ap-northeast-2.amazonaws.com/ap-northeast-2_6TS4hJ1Fk";
const clientId = "3oisr3emb68lr6obrpl07935g0";

// 🛑 중요: 로컬 개발용 주소로 변경합니다.
const redirectUri = "http://localhost:3000/auth/callback"; // 👈 S3 주소 대신 로컬 주소로 변경
//const redirectUri = "https://food-donor-frontend-v1.s3-website.ap-northeast-2.amazonaws.com/"; // TODO: 👈 배포 후 실제 주소로 변경

// 2. 로그아웃 후 돌아올 URI (Cognito에 등록 필수)
const postLogoutRedirectUri = "http://localhost:3000/login"; // 👈 S3 주소 대신 로컬 로그인 페이지로 변경
//const postLogoutRedirectUri = "https://food-donor-frontend-v1.s3-website.ap-northeast-2.amazonaws.com/"; // TODO: 👈 배포 후 실제 주소로 변경

// 3. oidc-client-ts 표준 설정
const cognitoAuthConfig = {
    authority: cognitoAuthority,
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "phone openid email",

    // 4. 로그아웃 URI 추가
    post_logout_redirect_uri: postLogoutRedirectUri,

    // 5. (중요) Cognito는 표준 OIDC와 다른 엔드포인트를 사용하므로
    // metadata에 수동으로 지정해줘야 oidc-client-ts가 제대로 작동합니다.
    metadata: {
        issuer: cognitoAuthority,
        authorization_endpoint: `${cognitoDomain}/oauth2/authorize`,
        token_endpoint: `${cognitoDomain}/oauth2/token`,
        userinfo_endpoint: `${cognitoDomain}/oauth2/userInfo`,
        end_session_endpoint: `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(postLogoutRedirectUri)}`
    }
};

// UserManager 인스턴스 생성
export const userManager = new UserManager(cognitoAuthConfig);

// 6. (수정) 라이브러리의 표준 로그아웃 함수 사용
export async function signOutRedirect() {
    // 수동 URL 대신 라이브러리 기능 호출
    // 이 함수는 알아서 metadata의 end_session_endpoint로 리디렉션합니다.
    return userManager.signoutRedirect();
};

/*
[개발자 참고 사항]
- 로그인 시작: userManager.signinRedirect();
- 콜백 처리: redirect_uri (콜백 페이지)에서 
  userManager.signinCallback().then((user) => { ... });
  로직을 구현해야 합니다.
*/