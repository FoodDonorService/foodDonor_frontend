"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Heart, Building2, Users, Warehouse, Search } from "lucide-react"
import { signup, searchUsersByRole } from "@/lib/api"
import { SearchResultDialog } from "@/components/ui/search-result-dialog"
import { toast } from "sonner"

type UserRole = "DONOR" | "RECIPIENT" | "FOOD_BANK"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "DONOR" as UserRole,
    address: "",
    latitude: 0,
    longitude: 0,
    phone_number: "",
  })
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)

  const handleSearchInfo = async () => {
    if (!formData.name.trim()) {
      toast.error("이름(기관/업체명)을 입력해주세요")
      return
    }

    setIsSearching(true)
    try {
      const response = await searchUsersByRole(formData.role, formData.name)

      if (response.status === "success" && response.data.list.length > 0) {
        if (response.data.list.length === 1) {
          // 결과가 1개면 바로 적용
          const info = response.data.list[0]
          setFormData({
            ...formData,
            id: info.id,
            name: info.name, // 검색 결과의 name을 그대로 사용
            address: info.address,
            latitude: info.latitude,
            longitude: info.longitude,
            phone_number: info.phone_number,
          })
          toast.success("정보를 불러왔습니다")
        } else {
          // 결과가 여러 개면 선택 팝업 표시
          setSearchResults(response.data.list)
          setIsSearchDialogOpen(true)
        }
      } else {
        toast.error("해당 이름으로 정보를 찾을 수 없습니다")
      }
    } catch (error) {
      console.error("[v0] Search info error:", error)
      toast.error("정보 조회 중 오류가 발생했습니다")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectSearchResult = (result: any) => {
    setFormData({
      ...formData,
      id: result.id,
      name: result.name, // 검색 결과의 name을 그대로 사용
      address: result.address,
      latitude: result.latitude,
      longitude: result.longitude,
      phone_number: result.phone_number,
    })
    toast.success("정보를 불러왔습니다")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await signup({
        id: formData.id,
        username: formData.username,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        phone_number: formData.phone_number,
      })

      if (response.status === "success") {
        toast.success("회원가입이 완료되었습니다")
        router.push("/login")
      }
    } catch (error) {
      console.error("[v0] Signup error:", error)
      toast.error("회원가입 중 오류가 발생했습니다")
    } finally {
      setIsSubmitting(false)
    }
  }

  const roleOptions = [
    {
      value: "DONOR",
      label: "기부자",
      description: "음식점 운영자",
      icon: Building2,
    },
    {
      value: "RECIPIENT",
      label: "수혜처",
      description: "복지시설",
      icon: Users,
    },
    {
      value: "FOOD_BANK",
      label: "푸드뱅크",
      description: "중개 기관",
      icon: Warehouse,
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary fill-primary" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">회원가입</CardTitle>
            <CardDescription>FoodDonor와 함께 나눔을 시작하세요</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label>역할 선택</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                className="grid grid-cols-3 gap-4"
              >
                {roleOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <div key={option.value}>
                      <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                      <Label
                        htmlFor={option.value}
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                      >
                        <Icon className="h-6 w-6 mb-2" />
                        <div className="text-center">
                          <div className="font-semibold">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">이메일</Label>
                <Input
                  id="username"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">이름(기관/업체명)</Label>
                <div className="flex gap-2">
                  <Input
                    id="name"
                    placeholder="나눔카페"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSearchInfo}
                    disabled={isSearching}
                    className="flex-shrink-0 bg-transparent"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">이름 입력 후 검색 버튼을 눌러 정보를 불러오세요</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">주소</Label>
              <Input
                id="address"
                placeholder="검색 버튼으로 자동 입력되거나 직접 입력하세요"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="검색 버튼으로 자동 입력되거나 직접 입력하세요"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "처리 중..." : "회원가입"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
            <Link href="/login" className="text-primary hover:underline">
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>

      <SearchResultDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
        results={searchResults}
        onSelect={handleSelectSearchResult}
        role={formData.role}
      />
    </div>
  )
}
