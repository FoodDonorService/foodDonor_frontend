"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { signUp, signIn } from "@/lib/auth"
import { createRecipientProfile } from "@/lib/api"
import { VerificationDialog } from "@/components/auth/VerificationDialog"
import { AddressSearchDialog } from "@/components/ui/address-search-dialog" // 👈 추가됨

export default function RecipientSignupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [showAddressSearch, setShowAddressSearch] = useState(false) // 👈 주소 검색창 상태
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "", 
    phone_number: "",
    address: "", // 기본 주소 (검색으로 입력)
    post_number: "", // 우편번호 (검색으로 입력)
    notes: "",
  })

  // 상세 주소는 별도 관리 (백엔드 보낼 때 합침)
  const [detailAddress, setDetailAddress] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  // 주소 검색 완료 핸들러
  const handleAddressComplete = (data: { zonecode: string; address: string }) => {
    setFormData((prev) => ({
      ...prev,
      post_number: data.zonecode,
      address: data.address,
    }))
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
          userAttributes: { email: formData.email },
        },
      })
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

  const handleVerificationSuccess = async () => {
    setIsSubmitting(true)
    try {
      await signIn({
        username: formData.email,
        password: formData.password,
      })

      // [중요] 주소 합치기: 기본주소 + 상세주소
      const finalAddress = `${formData.address} ${detailAddress}`.trim()

      await createRecipientProfile({
        name: formData.name,
        phone_number: formData.phone_number,
        address: finalAddress, // 합쳐진 주소 전송
        post_number: formData.post_number,
        notes: formData.notes,
        latitude: 37.5665, // 임시 좌표
        longitude: 126.9780, // 임시 좌표
      })

      toast.success("회원가입이 완료되었습니다!")
      router.push("/recipient/dashboard")

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
      <Card className="w-full max-w-md my-8">
        <CardHeader className="space-y-4">
          <Button 
            variant="ghost" 
            className="w-fit hover:bg-transparent hover:text-blue-600 cursor-pointer" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">수혜자 회원가입</CardTitle>
            <CardDescription>복지시설 또는 개인 정보를 입력해주세요</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 계정 정보 섹션 */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-medium text-sm text-muted-foreground">계정 정보</h3>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" placeholder="user@example.com" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            {/* 상세 정보 섹션 */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">상세 정보</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">이름 (또는 시설명)</Label>
                <Input id="name" placeholder="이름을 입력하세요" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">연락처</Label>
                <Input id="phone_number" placeholder="010-0000-0000" value={formData.phone_number} onChange={handleChange} required />
              </div>

              {/* 주소 검색 영역 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="post_number">우편번호</Label>
                  <Input 
                    id="post_number" 
                    placeholder="00000" 
                    value={formData.post_number} 
                    readOnly 
                    onClick={() => setShowAddressSearch(true)}
                    className="cursor-pointer bg-muted/50"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address">주소</Label>
                  <Input 
                    id="address" 
                    placeholder="주소 검색" 
                    value={formData.address} 
                    readOnly 
                    onClick={() => setShowAddressSearch(true)}
                    className="cursor-pointer bg-muted/50"
                  />
                </div>
              </div>

              {/* 상세 주소 입력 */}
              <div className="space-y-2">
                <Label htmlFor="detailAddress">상세 주소</Label>
                <Input 
                  id="detailAddress" 
                  placeholder="동/호수, 층수 등을 입력하세요" 
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  readOnly={true} 
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">특이사항 (선택)</Label>
                <Input id="notes" placeholder="알레르기, 피해야 할 음식 등" value={formData.notes} onChange={handleChange} />
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-6 cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? "인증 코드 받기" : "가입하기"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 주소 검색 다이얼로그 */}
      <AddressSearchDialog 
        open={showAddressSearch} 
        onOpenChange={setShowAddressSearch}
        onComplete={handleAddressComplete}
      />

      {/* 인증 다이얼로그 */}
      <VerificationDialog 
        open={showVerification} 
        onOpenChange={setShowVerification}
        email={formData.email}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </div>
  )
}