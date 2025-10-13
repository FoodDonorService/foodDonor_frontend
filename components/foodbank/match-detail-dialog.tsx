"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Package, Building2, Users, Phone } from "lucide-react"

interface MatchDetailDialogProps {
  match: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "승인 대기", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
  ACCEPTED: { label: "승인 완료", color: "bg-green-500/10 text-green-700 border-green-500/20" },
  REJECTED: { label: "거절됨", color: "bg-red-500/10 text-red-700 border-red-500/20" },
}

export function MatchDetailDialog({ match, open, onOpenChange }: MatchDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>매칭 상세 정보</DialogTitle>
            <Badge variant="outline" className={statusConfig[match.status].color}>
              {statusConfig[match.status].label}
            </Badge>
          </div>
          <DialogDescription>매칭 ID: {match.match_id}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Donation Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">기부 품목</h3>
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{match.donation_item_name}</p>
                  <p className="text-sm text-muted-foreground">{match.donation_category}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">수량</p>
                  <p className="font-medium">{match.donation_quantity}개</p>
                </div>
                <div>
                  <p className="text-muted-foreground">소비기한</p>
                  <p className="font-medium">{match.donation_expiration_date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">기부처 정보</h3>
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold">{match.restaurant_name}</p>
                  <p className="text-sm text-muted-foreground">{match.restaurant_address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recipient Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">수혜처 정보</h3>
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold">{match.recipient_name}</p>
                  <p className="text-sm text-muted-foreground">{match.recipient_address}</p>
                </div>
              </div>
              {match.recipient_phone_number && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <p className="font-medium">{match.recipient_phone_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">처리 내역</h3>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
              {match.created_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">요청일</span>
                  <span className="font-medium">{match.created_at}</span>
                </div>
              )}
              {match.updated_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{match.status === "ACCEPTED" ? "승인일" : "거절일"}</span>
                  <span className="font-medium">{match.updated_at}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
