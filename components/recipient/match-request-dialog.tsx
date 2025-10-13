"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MapPin, Package, Calendar, Building2 } from "lucide-react"
import { requestMatch } from "@/lib/api"
import { toast } from "sonner"

interface MatchRequestDialogProps {
  donation: {
    donation_id: number
    restaurant_name: string
    restaurant_address: string
    distance?: string
    item_name: string
    category: string
    quantity: number
    expiration_date: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (matchData: any) => void
}

export function MatchRequestDialog({ donation, open, onOpenChange, onSuccess }: MatchRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      const response = await requestMatch(donation.donation_id)

      if (response.status === "success") {
        toast.success("매칭 요청이 완료되었습니다")
        onOpenChange(false)
        if (onSuccess) {
          onSuccess(response.data)
        }
      }
    } catch (error) {
      console.error("[v0] Match request error:", error)
      toast.error("매칭 요청 중 오류가 발생했습니다")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>매칭 요청 확인</DialogTitle>
          <DialogDescription>다음 기부 품목에 대한 매칭을 요청하시겠습니까?</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">품목</p>
                <p className="font-semibold">{donation.item_name}</p>
                <p className="text-sm text-muted-foreground">{donation.category}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">기부처</p>
                <p className="font-semibold">{donation.restaurant_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">위치</p>
                <p className="font-medium">{donation.restaurant_address}</p>
                {donation.distance && <p className="text-sm text-primary font-medium">{donation.distance}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">수량</p>
                <p className="font-semibold">{donation.quantity}개</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">소비기한</p>
                <p className="font-semibold">{donation.expiration_date}</p>
              </div>
            </div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              매칭 요청 후 푸드뱅크의 승인을 기다려주세요. 승인되면 기부처와 연락하여 수령 일정을 조율할 수 있습니다.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "요청 중..." : "매칭 요청"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
