"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { signUp, signIn } from "@/lib/auth"
import { createDonorProfile } from "@/lib/api"

export default function DonorSignupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "", 
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
      await signUp({
        username: formData.email,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
          },
        },
      })

      await signIn({
        username: formData.email,
        password: formData.password,
      })

      await createDonorProfile({ name: formData.name })

      toast.success("회원가입이 완료되었습니다!")
      router.push("/donor/dashboard")

    } catch (error: any) {
      console.error("Donor Signup Error:", error)
      
      if (error.name === "UsernameExistsException") {
        toast.error("이미 가입된 이메일입니다.")
      } else if (error.name === "CodeDeliveryFailureException") {
        toast.error("인증 코드를 보낼 수 없습니다. 이메일을 확인해주세요.")
      } else {
        toast.error(error.message || "회원가입 중 오류가 발생했습니다.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          {/* 👇 여기 className 수정됨: hover:text-gray-900 추가 */}
          <Button 
            variant="ghost" 
            className="w-fit p-0 hover:bg-transparent hover:text-gray-900" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">기부자 회원가입</CardTitle>
            <CardDescription>운영 중인 음식점 정보를 입력해주세요</CardDescription>
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
              <Label htmlFor="name">상호명 (음식점 이름)</Label>
              <Input
                id="name"
                placeholder="예: 맛있는 김밥"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                * 정확한 상호명을 입력하시면 주소 정보를 자동으로 찾아 등록합니다.
              </p>
            </div>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
              {isSubmitting ? "가입 처리 중..." : "가입 완료"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}