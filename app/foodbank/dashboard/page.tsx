"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, LogOut, Clock, CheckCircle2, XCircle, Package } from "lucide-react"
import { MatchDetailDialog } from "@/components/foodbank/match-detail-dialog"
import { MatchActionDialog } from "@/components/foodbank/match-action-dialog"
import { getMatchList } from "@/lib/api"
import { logout } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function FoodBankDashboard() {
  const router = useRouter()
  const [pendingMatches, setPendingMatches] = useState<any[]>([])
  const [acceptedMatches, setAcceptedMatches] = useState<any[]>([])
  const [rejectedMatches, setRejectedMatches] = useState<any[]>([])
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"accept" | "reject">("accept")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setIsLoading(true)
    try {
      const response = await getMatchList()
      
      if (response.status === "success") {
        const matches = response.data.match_list
        setPendingMatches(matches.filter((m: any) => m.status === "PENDING"))
        setAcceptedMatches(matches.filter((m: any) => m.status === "ACCEPTED"))
        setRejectedMatches(matches.filter((m: any) => m.status === "REJECTED"))
      }

    } catch (error) {
      console.error("[v0] Fetch matches error:", error)
      toast.error("매칭 목록을 불러오는데 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenActionDialog = (match: any, type: "accept" | "reject") => {
    setSelectedMatch(match)
    setActionType(type)
    setIsActionDialogOpen(true)
  }

  const handleLogout = async () => {
    try {
      const response = await logout()
      if (response.status === "success") {
        toast.success("로그아웃되었습니다")
        router.push("/login")
      }
    } catch (error) {
      console.error("[v0] Logout error:", error)
      toast.error("로그아웃 중 오류가 발생했습니다")
    }
  }

  const handleViewDetail = (match: any) => {
    setSelectedMatch(match)
    setIsDetailDialogOpen(true)
  }

  const handleActionSuccess = () => {
    fetchMatches()
  }

  const stats = {
    pending: pendingMatches.length,
    accepted: acceptedMatches.length,
    rejected: rejectedMatches.length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="text-xl font-bold">FoodDonor</span>
            <Badge variant="outline" className="ml-2 bg-chart-2/10 text-chart-2 border-chart-2/20">
              푸드뱅크
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
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">승인 대기</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">승인 완료</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.accepted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">거절됨</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div>
          <h1 className="text-3xl font-bold mb-6">매칭 관리</h1>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                승인 대기 ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="accepted" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                승인 완료 ({stats.accepted})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <XCircle className="h-4 w-4" />
                거절됨 ({stats.rejected})
              </TabsTrigger>
            </TabsList>

            {/* Pending Matches */}
            <TabsContent value="pending" className="space-y-4">
              {pendingMatches.map((match) => (
                <Card key={match.match_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                            승인 대기
                          </Badge>
                          <span className="text-sm text-muted-foreground">요청일: {match.created_at}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold text-sm text-muted-foreground mb-2">기부처</h3>
                            <p className="font-semibold text-lg mb-1">{match.restaurant_name}</p>
                            <p className="text-sm text-muted-foreground">{match.restaurant_address}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-muted-foreground mb-2">수혜처</h3>
                            <p className="font-semibold text-lg mb-1">{match.recipient_name}</p>
                            <p className="text-sm text-muted-foreground">{match.recipient_address}</p>
                          </div>
                        </div>
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{match.donation_item_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {match.donation_category}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>수량: {match.donation_quantity}개</span>
                            <span>소비기한: {match.donation_expiration_date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => handleViewDetail(match)} variant="outline" size="sm">
                          상세보기
                        </Button>
                        <Button
                          onClick={() => handleOpenActionDialog(match, "accept")}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          승인
                        </Button>
                        <Button
                          onClick={() => handleOpenActionDialog(match, "reject")}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          거절
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {pendingMatches.length === 0 && (
                <Card className="p-12">
                  <div className="text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">승인 대기 중인 매칭이 없습니다</h3>
                    <p className="text-muted-foreground">새로운 매칭 요청이 들어오면 여기에 표시됩니다</p>
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Accepted Matches */}
            <TabsContent value="accepted" className="space-y-4">
              {acceptedMatches.map((match) => (
                <Card key={match.match_id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                            승인 완료
                          </Badge>
                          <span className="text-sm text-muted-foreground">승인일: {match.updated_at}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold text-sm text-muted-foreground mb-2">기부처</h3>
                            <p className="font-semibold text-lg mb-1">{match.restaurant_name}</p>
                            <p className="text-sm text-muted-foreground">{match.restaurant_address}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-muted-foreground mb-2">수혜처</h3>
                            <p className="font-semibold text-lg mb-1">{match.recipient_name}</p>
                            <p className="text-sm text-muted-foreground">{match.recipient_address}</p>
                            {match.recipient_phone_number && (
                              <p className="text-sm text-primary font-medium mt-1">{match.recipient_phone_number}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{match.donation_item_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {match.donation_category}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>수량: {match.donation_quantity}개</span>
                            <span>소비기한: {match.donation_expiration_date}</span>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => handleViewDetail(match)} variant="outline" size="sm">
                        상세보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {acceptedMatches.length === 0 && (
                <Card className="p-12">
                  <div className="text-center">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">승인된 매칭이 없습니다</h3>
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Rejected Matches */}
            <TabsContent value="rejected" className="space-y-4">
              {rejectedMatches.map((match) => (
                <Card key={match.match_id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">
                            거절됨
                          </Badge>
                          <span className="text-sm text-muted-foreground">거절일: {match.updated_at}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold text-sm text-muted-foreground mb-2">기부처</h3>
                            <p className="font-semibold text-lg mb-1">{match.restaurant_name}</p>
                            <p className="text-sm text-muted-foreground">{match.restaurant_address}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-muted-foreground mb-2">수혜처</h3>
                            <p className="font-semibold text-lg mb-1">{match.recipient_name}</p>
                            <p className="text-sm text-muted-foreground">{match.recipient_address}</p>
                          </div>
                        </div>
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{match.donation_item_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {match.donation_category}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>수량: {match.donation_quantity}개</span>
                            <span>소비기한: {match.donation_expiration_date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {rejectedMatches.length === 0 && (
                <Card className="p-12">
                  <div className="text-center">
                    <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">거절된 매칭이 없습니다</h3>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedMatch && (
        <>
          <MatchDetailDialog match={selectedMatch} open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen} />
          <MatchActionDialog
            match={selectedMatch}
            actionType={actionType}
            open={isActionDialogOpen}
            onOpenChange={setIsActionDialogOpen}
            onSuccess={handleActionSuccess}
          />
        </>
      )}
    </div>
  )
}
