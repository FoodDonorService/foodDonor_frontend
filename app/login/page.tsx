"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { userManager } from "@/lib/auth"
import { toast } from "sonner"

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLoginRedirect = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await userManager.signinRedirect()
    } catch (error) {
      console.error("Login redirect error:", error)
      toast.error("로그인 페이지로 이동하는 중 오류가 발생했습니다")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/10 p-4">
      <Card className="w-full max-w-md">

        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary fill-primary" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">로그인</CardTitle>
            <CardDescription>FoodDonor에 오신 것을 환영합니다</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* 로그인 버튼 */}
          <div className="space-y-4">
            <Button 
              onClick={handleLoginRedirect}
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "이동 중..." : "FoodDonor 계정으로 로그인"}
            </Button>
          </div>

          {/* 회원가입 버튼 */}
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
