"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, User, Heart } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/10 p-4">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* 헤더 영역 */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary fill-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">환영합니다!</h1>
          <p className="text-muted-foreground text-lg">
            FoodDonor와 함께하기 위해 가입 유형을 선택해주세요
          </p>
        </div>

        {/* 역할 선택 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. 기부자 (음식점) */}
          <Link href="/signup/donor" className="group">
            <Card className="h-full transition-all hover:border-primary hover:shadow-lg cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="text-center pt-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">기부자</CardTitle>
                <CardDescription>음식점 사장님</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground pb-8">
                남은 음식을 기부하고<br />
                세제 혜택과 나눔의 기쁨을<br />
                함께하세요.
              </CardContent>
            </Card>
          </Link>

          {/* 2. 수혜자 (복지시설/개인) */}
          <Link href="/signup/recipient" className="group">
            <Card className="h-full transition-all hover:border-primary hover:shadow-lg cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="text-center pt-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">수혜자</CardTitle>
                <CardDescription>복지시설 및 이웃</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground pb-8">
                필요한 음식을 신청하고<br />
                따뜻한 한 끼를<br />
                지원받으세요.
              </CardContent>
            </Card>
          </Link>

          {/* 3. 자원봉사자 (배달) */}
          <Link href="/signup/volunteer" className="group">
            <Card className="h-full transition-all hover:border-primary hover:shadow-lg cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="text-center pt-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">자원봉사자</CardTitle>
                <CardDescription>나눔 배달부</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground pb-8">
                음식을 픽업하여<br />
                이웃에게 전달하는<br />
                다리가 되어주세요.
              </CardContent>
            </Card>
          </Link>

        </div>

        {/* 하단 로그인 링크 */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
          <Link href="/login" className="text-primary hover:underline font-medium">
            로그인
          </Link>
        </div>
      </div>
    </div>
  )
}