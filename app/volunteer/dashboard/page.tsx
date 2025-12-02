"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, LogOut, Package, MapPin, Clock, CheckCircle2, Bike } from "lucide-react"
import { getVolunteerDonationList, getVolunteerHistory, completeVolunteerTask } from "@/lib/api"
import { signOut } from "@/lib/auth"
import { toast } from "sonner"
import { MatchingDialog } from "@/components/volunteer/matching-dialog"

export default function VolunteerDashboard() {
  const router = useRouter()
  const [availableDonations, setAvailableDonations] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // 매칭 다이얼로그 상태
  const [selectedDonation, setSelectedDonation] = useState<any>(null)
  const [isMatchingOpen, setIsMatchingOpen] = useState(false)

  // 데이터 불러오기
  const fetchData = async () => {
    setIsLoading(true)
    try {
      // 1. 봉사 가능한 목록
      const donationRes = await getVolunteerDonationList()
      if (donationRes.status === "success") {
        setAvailableDonations(donationRes.data.donation_list || [])
      }

      // 2. 내 봉사 내역 (진행중 + 완료됨)
      const historyRes = await getVolunteerHistory()
      if (historyRes.status === "success") {
        setHistory(historyRes.data.task_list || [])
      }
    } catch (error) {
      console.error("Fetch error:", error)
      // toast.error("데이터를 불러오는데 실패했습니다.") (CORS 에러 시 임시 주석 처리)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 배달 완료 처리
  const handleCompleteTask = async (taskId: string) => {
    if (!confirm("배달을 완료하시겠습니까?")) return
    try {
      await completeVolunteerTask(taskId)
      toast.success("배달 봉사가 완료되었습니다! 감사합니다.")
      fetchData() // 목록 새로고침
    } catch (error) {
      console.error("Complete task error:", error)
      toast.error("처리 중 오류가 발생했습니다.")
    }
  }

  // 로그아웃
  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("로그아웃되었습니다")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // 매칭 성공 시 콜백
  const handleMatchSuccess = () => {
    fetchData() // 목록 갱신 (봉사 가능한 목록에서 빠지고, 내역으로 이동됨)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="text-xl font-bold">FoodDonor</span>
            <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-700 border-green-500/20">
              자원봉사자
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">봉사 활동</h1>
          <p className="text-muted-foreground">이웃에게 따뜻한 마음을 배달해주세요</p>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available" className="gap-2">
              <Package className="h-4 w-4" />
              봉사 찾기 ({availableDonations.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Bike className="h-4 w-4" />
              나의 봉사 내역 ({history.length})
            </TabsTrigger>
          </TabsList>

          {/* 1. 봉사 찾기 탭 */}
          <TabsContent value="available" className="space-y-4">
            {availableDonations.length > 0 ? (
              availableDonations.map((donation) => (
                <Card key={donation.donation_id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{donation.donation_category}</Badge>
                        <h3 className="font-bold text-lg">{donation.donation_item_name}</h3>
                        <span className="text-sm text-muted-foreground">({donation.donation_quantity}개)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {donation.restaurant_name} ({donation.restaurant_address})
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        소비기한: {donation.donation_expiration_date}
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        setSelectedDonation(donation)
                        setIsMatchingOpen(true)
                      }}
                      className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                    >
                      봉사 신청하기
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                현재 배달을 기다리는 기부 물품이 없습니다.
              </div>
            )}
          </TabsContent>

          {/* 2. 나의 봉사 내역 탭 */}
          <TabsContent value="history" className="space-y-4">
            {history.length > 0 ? (
              history.map((task) => (
                <Card key={task.task_id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{task.donation_item_name} 배달</h3>
                        <p className="text-sm text-muted-foreground">{task.restaurant_name} ➜ {task.recipient_name}</p>
                      </div>
                      <Badge variant={task.status === "COMPLETED" ? "default" : "secondary"}>
                        {task.status === "COMPLETED" ? "완료됨" : "진행 중"}
                      </Badge>
                    </div>
                    
                    {/* 진행 중인 경우 완료 버튼 표시 */}
                    {task.status !== "COMPLETED" && (
                      <div className="mt-4 flex justify-end">
                        <Button onClick={() => handleCompleteTask(task.task_id)} className="gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          배달 완료 처리
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                아직 수행한 봉사 내역이 없습니다.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* 매칭 다이얼로그 */}
      <MatchingDialog 
        donation={selectedDonation}
        open={isMatchingOpen}
        onOpenChange={setIsMatchingOpen}
        onSuccess={handleMatchSuccess}
      />
    </div>
  )
}