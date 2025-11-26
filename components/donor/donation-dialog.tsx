"use client"

import type React from "react"
import { useState, useEffect } from "react" // 👈 useEffect 추가
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createDonation } from "@/lib/api"
import { toast } from "sonner"

interface DonationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (donationData: any) => void
}

const categories = ["한식", "중식", "일식", "양식", "빵/제과", "반찬류", "음료", "과일", "채소", "기타"]

export function DonationDialog({ open, onOpenChange, onSuccess }: DonationDialogProps) {
  const [formData, setFormData] = useState({
    category: "",
    item_name: "",
    quantity: 0,
    expiration_date: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. 다이얼로그가 열릴 때마다 폼 초기화
  useEffect(() => {
    if (open) {
      setFormData({
        category: "",
        item_name: "",
        quantity: 0,
        expiration_date: "",
      })
      setIsSubmitting(false)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 2. 제출 전 수량 검증
    if (formData.quantity <= 0) {
      toast.error("수량은 1개 이상이어야 합니다")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await createDonation({
        category: formData.category,
        item_name: formData.item_name,
        quantity: formData.quantity,
        expiration_date: formData.expiration_date,
      })

      if (response.status === "success") {
        toast.success("기부 품목이 등록되었습니다")
        onOpenChange(false)
        
        // Call success callback with donation data
        if (onSuccess) {
          onSuccess({
            donation_id: response.data.donation_id,
            category: formData.category,
            item_name: formData.item_name,
            quantity: formData.quantity,
            expiration_date: formData.expiration_date,
            status: "AVAILABLE", // 새로 등록된 기부는 기부 가능 상태
            created_at: new Date().toISOString().split('T')[0]
          })
        }
      }
    } catch (error) {
      console.error("[v0] Create donation error:", error)
      toast.error("기부 등록 중 오류가 발생했습니다")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>기부 품목 등록</DialogTitle>
          <DialogDescription>기부할 음식 정보를 입력해주세요</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item_name">품목명</Label>
              <Input
                id="item_name"
                placeholder="예: 크림빵"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">수량</Label>
              <Input
                id="quantity"
                type="number"
                min="1" // 3. HTML 기본 검증
                placeholder="예: 20"
                value={formData.quantity === 0 ? "" : formData.quantity.toString()}
                onChange={(e) => {
                  // 4. 음수 입력 방지 로직
                  const val = Number(e.target.value)
                  if (val < 0) return
                  setFormData({ ...formData, quantity: val })
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiration_date">소비기한</Label>
              <Input
                id="expiration_date"
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "등록 중..." : "등록하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}