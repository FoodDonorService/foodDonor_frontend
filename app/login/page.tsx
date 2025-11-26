"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart } from "lucide-react"
import { signIn, signOut } from "@/lib/auth" // 👈 Amplify의 로그인 함수
import { getUserProfile } from "@/lib/api" // 👈 역할 확인용 API
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      try {
        await signOut()
      } catch (err) {
        // 로그아웃 에러는 무시 (로그인 안 된 상태일 수도 있으므로)
      }

      // 1. [Cognito] 로그인 시도
      const { isSignedIn } = await signIn({
        username: formData.email,
        password: formData.password,
      })

      if (isSignedIn) {
        toast.success("로그인되었습니다")
        
        // 2. [Backend] 사용자 역할(Role) 확인 및 대시보드 이동
        try {
          const profileResponse = await getUserProfile()
          if (profileResponse.status === "success") {
            const role = profileResponse.data.role // 백엔드 응답 구조에 따라 수정 필요할 수 있음
            
            if (role === "DONOR") {
              router.push("/donor/dashboard")
            } else if (role === "RECIPIENT") {
              router.push("/recipient/dashboard")
            } else if (role === "FOOD_BANK") {
              router.push("/foodbank/dashboard")
            } else {
              // 역할이 없거나 알 수 없는 경우 (신규 가입자 등)
              // router.push("/onboarding") // 필요하다면 이쪽으로
              router.push("/")
            }
          }
        } catch (profileError) {
          // console.error("Profile fetch error:", profileError)
          // toast.error("프로필 정보를 불러오지 못했습니다.")
          // router.push("/")

          // todo : 아직 users/me 요청에 대해 CORS 설정이 안되어 있어서 에러가 나므로 일단 임시로 대시보드 갈 수 있도록 처리함
          console.error("Profile fetch error:", profileError)
          // 👇 [임시 수정] 에러 나도 일단 기부자 대시보드로 보내버리기 (테스트용)
          toast.warning("프로필 조회 실패 (CORS). 임시로 이동합니다.")
          router.push("/donor/dashboard")
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.name === "NotAuthorizedException") {
        toast.error("이메일 또는 비밀번호가 올바르지 않습니다.")
      } else if (error.name === "UserNotConfirmedException") {
        toast.error("이메일 인증이 완료되지 않았습니다.")
      } else {
        toast.error("로그인 중 오류가 발생했습니다.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <Link href="/" className="cursor-pointer block">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary fill-primary" />
              </div>
            </div>
          </Link>
          <div className="text-center">
            <CardTitle className="text-2xl">로그인</CardTitle>
            <CardDescription>FoodDonor에 오신 것을 환영합니다</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "로그인 중..." : "로그인"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">계정이 없으신가요? </span>
            <Link href="/signup" className="text-primary hover:underline">
              회원가입
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}