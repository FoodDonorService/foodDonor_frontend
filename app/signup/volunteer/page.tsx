"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { signUp, signIn, signOut } from "@/lib/auth" 
import { createVolunteerProfile } from "@/lib/api"
import { VerificationDialog } from "@/components/auth/VerificationDialog" // 👈 추가

export default function VolunteerSignupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showVerification, setShowVerification] = useState(false) // 👈 추가
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "", 
    phone_number: "", 
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다")
      return
    }

    setIsSubmitting(true)
    try {
      // 1. [Cognito] 회원가입
      await signUp({
        username: formData.email,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
          },
        },
      })

      // 성공 시 인증 다이얼로그 열기
      toast.info("인증 코드가 메일로 발송되었습니다.")
      setShowVerification(true)

    } catch (error: any) {
      console.error("Signup Error:", error)
      if (error.name === "UsernameExistsException") {
        toast.error("이미 가입된 이메일입니다.")
      } else {
        toast.error(error.message || "회원가입 중 오류가 발생했습니다.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 2단계: 인증 성공 후
  const handleVerificationSuccess = async () => {
    setIsSubmitting(true)
    try {
      try {
        await signOut() 
      } catch (e) {
        // 로그아웃 에러는 무시 (로그인 안 된 상태일 수도 있으므로)
      }
      // [Cognito] 로그인
      await signIn({
        username: formData.email,
        password: formData.password,
      })

      // [Backend] 자원봉사자 프로필 생성
      await createVolunteerProfile({ 
        name: formData.name,
        phone_number: formData.phone_number
      })

      toast.success("봉사자 회원가입이 완료되었습니다!")
      router.push("/volunteer/dashboard")

    } catch (error) {
      console.error("Post-Verification Error:", error)
      toast.error("인증은 성공했으나 로그인/프로필 생성 중 오류가 발생했습니다.")
      router.push("/login")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <Button 
            variant="ghost" 
            className="w-fit p-0 hover:bg-transparent hover:text-foreground" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">자원봉사자 회원가입</CardTitle>
            <CardDescription>봉사 활동에 필요한 정보를 입력해주세요</CardDescription>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone_number">연락처</Label>
              <Input
                id="phone_number"
                placeholder="010-0000-0000"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
              {isSubmitting ? "인증 코드 받기" : "가입하기"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 👈 인증 다이얼로그 연결 */}
      <VerificationDialog 
        open={showVerification} 
        onOpenChange={setShowVerification}
        email={formData.email}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </div>
  )
}