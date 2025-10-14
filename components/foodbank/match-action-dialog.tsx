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
import { acceptMatch, rejectMatch } from "@/lib/api"
import { toast } from "sonner"

interface MatchActionDialogProps {
  match: any
  actionType: "accept" | "reject"
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function MatchActionDialog({ match, actionType, open, onOpenChange, onSuccess }: MatchActionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!match) {
      toast.error("매칭 정보를 찾을 수 없습니다")
      return
    }

    setIsSubmitting(true)
    try {
      let response
      if (actionType === "accept") {
        response = await acceptMatch(match.match_id)
      } else {
        response = await rejectMatch(match.match_id)
      }

      // response가 유효한지 확인
      if (!response) {
        toast.error("서버 응답을 받을 수 없습니다")
        return
      }

      if (response.status === "success") {
        toast.success(actionType === "accept" ? "매칭이 승인되었습니다" : "매칭이 거절되었습니다")
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(response.message || "처리 중 오류가 발생했습니다")
      }
    } catch (error) {
      console.error("[v0] Match action error:", error)
      toast.error("처리 중 오류가 발생했습니다")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{actionType === "accept" ? "매칭 승인" : "매칭 거절"}</DialogTitle>
          <DialogDescription>
            {actionType === "accept"
              ? "매칭을 승인하시겠습니까?"
              : "매칭을 거절하시겠습니까?"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {match ? (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-1">매칭 정보</p>
              <p className="text-sm text-muted-foreground">
                {match.donation_item_name} ({match.donation_quantity}개)
              </p>
              <p className="text-sm text-muted-foreground">
                {match.restaurant_name} → {match.recipient_name}
              </p>
            </div>
          ) : (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">매칭 정보를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={actionType === "accept" ? "bg-green-600 hover:bg-green-700" : ""}
            variant={actionType === "reject" ? "destructive" : "default"}
          >
            {isSubmitting ? "처리 중..." : actionType === "accept" ? "승인" : "거절"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
