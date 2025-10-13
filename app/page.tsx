import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, Building2, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <span className="text-2xl font-bold text-foreground">FoodShare</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/signup">
              <Button>회원가입</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
          음식 나눔으로
          <br />
          <span className="text-primary">따뜻한 세상</span>을 만듭니다
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
          기부자와 수혜처를 연결하는 스마트 식품 기부 매칭 플랫폼
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              시작하기 <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">누구를 위한 서비스인가요?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">기부자</h3>
              <p className="text-muted-foreground mb-4">음식점에서 남은 음식을 기부하고 사회에 기여하세요</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 간편한 기부 등록</li>
                <li>• 기부 내역 관리</li>
                <li>• 투명한 기록</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">수혜처</h3>
              <p className="text-muted-foreground mb-4">복지시설에서 필요한 식품을 신청하세요</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 거리순 기부처 조회</li>
                <li>• 간편한 매칭 신청</li>
                <li>• 실시간 상태 확인</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-bold mb-2">푸드뱅크</h3>
              <p className="text-muted-foreground mb-4">기부와 수혜를 중개하고 관리하세요</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 매칭 요청 관리</li>
                <li>• 승인/거절 처리</li>
                <li>• 통합 대시보드</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 FoodShare. 스마트시티 식품 기부 매칭 플랫폼</p>
        </div>
      </footer>
    </div>
  )
}
