"use client"

import { Amplify } from "aws-amplify"

// 팀장님이 주신 정보에서 추출한 설정값
const authConfig = {
  Auth: {
    Cognito: {
      userPoolId: "ap-northeast-2_6TS4hJ1Fk",
      userPoolClientId: "3oisr3emb68lr6obrpl07935g0",
    },
  },
}

// Amplify 초기화 (앱 실행 시 한 번만 실행되면 됨)
Amplify.configure(authConfig)

// 편의를 위해 Auth 함수들 export
export { 
  getCurrentUser, 
  signIn, 
  signUp, 
  signOut, 
  fetchAuthSession,
  confirmSignUp,
  resendSignUpCode
} from "aws-amplify/auth"