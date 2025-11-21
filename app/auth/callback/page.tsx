"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { userManager } from "@/lib/auth"
import { toast } from "sonner"
import { getUserProfile } from "@/lib/api" // 👈 1. 우리 백엔드 API 임포트

// 2. Cognito가 돌려준 토큰을 처리하는 페이지
export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState("로그인 처리 중...")

  useEffect(() => {
    async function handleCallback() {
      try {
        // 3. URL에 담겨온 인증 코드로 실제 사용자 정보(토큰)를 받아옴
        const user = await userManager.signinCallback()

        if (user && !user.expired) {
          // 4. Cognito 로그인 성공!
          setStatus("로그인 성공! 사용자 정보를 확인합니다...")

          // 5. [중요] 우리 백엔드 API(/users/me)를 호출해 '역할(role)'을 가져옴
          const profileResponse = await getUserProfile()

          if (profileResponse.status === "success") {
            const role = profileResponse.data.role
            toast.success(`로그인되었습니다. (역할: ${role})`)

            // 6. 역할(role)에 따라 다른 대시보드로 이동시킴
            if (role === "DONOR") {
              router.push("/donor/dashboard")
            } else if (role === "RECIPIENT") {
              router.push("/recipient/dashboard")
            } else if (role === "FOOD_BANK") {
              router.push("/foodbank/dashboard")
            } else {
              console.warn("알 수 없는 역할:", role)
              router.push("/") // 기본 페이지로 이동
            }
          } else {
            throw new Error("백엔드에서 사용자 프로필을 가져오는 데 실패했습니다.")
          }
        } else {
          throw new Error("로그인 세션이 만료되었거나 유효하지 않습니다.")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        setStatus("로그인 처리 중 오류가 발생했습니다.")
        toast.error("로그인에 실패했습니다. 다시 시도해주세요.")
        router.push("/login") // 1초 후 로그인 페이지로 다시 이동
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* 7. 로딩 스피너와 메시지 표시 */}
        <div
          className="w-12 h-12 rounded-full animate-spin
          border-4 border-solid border-primary border-t-transparent"
        ></div>
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}