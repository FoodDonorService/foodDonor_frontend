"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Heart, LogOut, AlertCircle } from "lucide-react"
import { DonationDialog } from "@/components/donor/donation-dialog"
import { getMyDonationList } from "@/lib/api" // 👈 API 함수 임포트
import { signOut } from "@/lib/auth" // 👈 Amplify 로그아웃 임포트
import { toast } from "sonner"

// 상태별 배지 스타일
const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "승인 대기", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
  AVAILABLE: { label: "기부 가능", color: "bg-green-500/10 text-green-700 border-green-500/20" },
  REQUESTED: { label: "매칭 대기", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  CONFIRMED: { label: "매칭 완료", color: "bg-primary/10 text-primary border-primary/20" },
  REJECTED: { label: "거절됨", color: "bg-red-500/10 text-red-700 border-red-500/20" },
}

interface Donation {
  donation_id: number
  item_name: string
  category: string
  quantity: number
  expiration_date: string
  status: string
  created_at?: string
  message?: string
}

export default function DonorDashboard() {
  const router = useRouter()
  const [donations, setDonations] = useState<Donation[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 1. 내 기부 목록 불러오기
  const loadDonations = async () => {
    try {
      const response = await getMyDonationList()
      if (response.status === "success") {
        setDonations(response.data.donation_list || [])
      }
    } catch (error) {
      console.error("Load donations error:", error)
      toast.error("기부 목록을 불러오지 못했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDonations()
  }, [])

  const handleDonationCreated = () => {
    loadDonations() // 기부 등록 후 목록 새로고침
  }

  // 2. 로그아웃 처리 (Amplify)
  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("로그아웃되었습니다")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("로그아웃 중 오류가 발생했습니다")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="text-xl font-bold">FoodDonor</span>
            <Badge variant="outline" className="ml-2">
              기부자
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">기부 관리</h1>
            <p className="text-muted-foreground">등록한 기부 품목을 관리하세요</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : donations.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                기부 등록
              </Button>
            </div>
            {donations.map((donation, index) => (
              <Card key={donation.donation_id || index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{donation.item_name}</h3>
                        <Badge variant="outline" className={statusConfig[donation.status]?.color}>
                          {statusConfig[donation.status]?.label || donation.status}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">카테고리:</span>
                          <p className="font-medium">{donation.category}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">수량:</span>
                          <p className="font-medium">{donation.quantity}개</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">소비기한:</span>
                          <p className="font-medium">{donation.expiration_date}</p>
                        </div>
                        {donation.created_at && (
                          <div>
                            <span className="text-muted-foreground">등록일:</span>
                            <p className="font-medium">{donation.created_at}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">등록된 기부 품목이 없습니다</h3>
              <p className="text-muted-foreground mb-4">첫 기부를 등록해보세요</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                기부 등록
              </Button>
            </div>
          </Card>
        )}
      </div>

      <DonationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={handleDonationCreated} />
    </div>
  )
}