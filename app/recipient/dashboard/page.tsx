"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, LogOut, MapPin, Calendar, Package, RefreshCw } from "lucide-react"
import { MatchRequestDialog } from "@/components/recipient/match-request-dialog"
import { getDonationList } from "@/lib/api"
import { toast } from "sonner"

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "승인 대기", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
  ACCEPTED: { label: "승인 완료", color: "bg-green-500/10 text-green-700 border-green-500/20" },
  REJECTED: { label: "거절됨", color: "bg-red-500/10 text-red-700 border-red-500/20" },
}

interface Donation {
  donation_id: number
  restaurant_name: string
  restaurant_address: string
  distance?: string
  item_name: string
  category: string
  quantity: number
  expiration_date: string
}

export default function RecipientDashboard() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [myRequests, setMyRequests] = useState<any[]>([])
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadDonations = async () => {
    setIsLoading(true)
    try {
      const response = await getDonationList()

      if (response.status === "success") {
        setDonations(response.data.list)
        toast.success("기부 목록을 불러왔습니다")
      }
    } catch (error: any) {
      console.error("[v0] Load donations error:", error)
      if (error.message === "Network Error") {
        toast.error("서버에 연결할 수 없습니다. API 서버가 실행 중인지 확인해주세요.")
      } else {
        toast.error(error.response?.data?.message || "기부 목록을 불러오는데 실패했습니다")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestMatch = (donation: Donation) => {
    setSelectedDonation(donation)
    setIsDialogOpen(true)
  }

  const handleMatchRequested = (matchData: any) => {
    if (selectedDonation) {
      const newMatch = {
        match_id: matchData.match_id,
        donation_id: matchData.donation_id,
        restaurant_name: selectedDonation.restaurant_name,
        item_name: selectedDonation.item_name,
        quantity: selectedDonation.quantity,
        status: "PENDING",
      }
      
      setMyRequests(prev => [newMatch, ...prev])
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
            <Badge variant="outline" className="ml-2 bg-accent/10 text-accent border-accent/20">
              수혜처
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* My Requests Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">내 매칭 요청</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {myRequests.map((request) => (
              <Card key={request.match_id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{request.item_name}</h3>
                      <p className="text-sm text-muted-foreground">{request.restaurant_name}</p>
                    </div>
                    <Badge variant="outline" className={statusConfig[request.status].color}>
                      {statusConfig[request.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>수량: {request.quantity}개</span>
                    <span>요청일: {request.created_at}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Available Donations Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">기부 가능 품목</h1>
              <p className="text-muted-foreground">거리순으로 정렬된 기부 목록입니다</p>
            </div>
            <Button onClick={handleLoadDonations} disabled={isLoading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "조회 중..." : "기부처 조회"}
            </Button>
          </div>

          {/* Donations List */}
          {donations.length > 0 ? (
            <div className="space-y-4">
              {donations.map((donation) => (
                <Card key={donation.donation_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-semibold">{donation.item_name}</h3>
                              <Badge variant="outline">{donation.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{donation.restaurant_name}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{donation.restaurant_address}</span>
                              {donation.distance && (
                                <span className="ml-2 font-medium text-primary">{donation.distance}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">수량:</span>
                            <span className="font-medium">{donation.quantity}개</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">소비기한:</span>
                            <span className="font-medium">{donation.expiration_date}</span>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => handleRequestMatch(donation)} className="flex-shrink-0">
                        매칭 요청
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">기부 목록이 없습니다</h3>
                <p className="text-muted-foreground">상단의 조회 버튼을 눌러 기부 가능한 품목을 확인하세요</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {selectedDonation && (
        <MatchRequestDialog 
          donation={selectedDonation} 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen}
          onSuccess={handleMatchRequested}
        />
      )}
    </div>
  )
}
