"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, MapPin, Phone, User, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { requestVolunteerTask, getMatchTaskResult, acceptRecipientMatch } from "@/lib/api"
import axios from "axios"

interface MatchingDialogProps {
  donation: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function MatchingDialog({ donation, open, onOpenChange, onSuccess }: MatchingDialogProps) {
  const [step, setStep] = useState<"LOADING" | "SELECT" | "CONFIRM">("LOADING")
  const [taskId, setTaskId] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<any[]>([])
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // 2. 결과 폴링 (재귀 호출 방식)
  const pollMatchResult = useCallback(async (tid: string) => {
    if (!open) return; // 다이얼로그 닫히면 중단

    try {
      console.log(`[Polling] Checking task status for: ${tid}`)
      const res = await getMatchTaskResult(tid)
      
      if (res.status === "COMPLETED") {
        console.log("[Polling] Match Completed!", res.data)
        
        if (res.data.recommended_recipients && res.data.recommended_recipients.length > 0) {
          setCandidates(res.data.recommended_recipients)
          setStep("SELECT")
        } else {
          toast.error("추천 가능한 수혜자를 찾지 못했습니다.")
          onOpenChange(false)
        }
      } else if (res.status === "FAILED") {
        console.error("[Polling] Match Failed")
        toast.error("AI 매칭 작업이 실패했습니다.")
        onOpenChange(false)
      } else {
        // PROCESSING 상태면 3초 뒤 재시도
        console.log("[Polling] Still processing... retrying in 3s")
        setTimeout(() => pollMatchResult(tid), 3000)
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log("[Polling] Task not created yet (404). Retrying in 3s...")
      setTimeout(() => pollMatchResult(tid), 3000)
      return // 여기서 함수 종료 (에러 던지지 않음)
    }

    console.error("[Polling] Error:", error)
    toast.error("매칭 상태 확인 중 오류가 발생했습니다.")
    onOpenChange(false) // 또는 재시도 로직 유지
    }
  }, [open, onOpenChange]) // 의존성 배열 추가

  // 1. 매칭 작업 시작
  const startMatchingProcess = useCallback(async () => {
    try {
      setStep("LOADING")
      console.log("[Matching] Requesting task for donation:", donation.donation_id)
      
      const response = await requestVolunteerTask(donation.donation_id)

      console.log("👉 서버 응답 전체 확인:", response)
      
      if (response.data && response.data.task_id) {
        const newTaskId = response.data.task_id
        console.log("[Matching] Task started. ID:", newTaskId)
        setTaskId(newTaskId)
        // 약간의 지연 후 폴링 시작
        setTimeout(() => pollMatchResult(newTaskId), 1000)
      } else {
        throw new Error("Task ID not received")
      }
    } catch (error) {
      console.error("Matching request failed:", error)
      toast.error("매칭 요청 중 오류가 발생했습니다.")
      onOpenChange(false)
    }
  }, [donation, onOpenChange, pollMatchResult])


  // 초기화 및 시작 로직
  useEffect(() => {
    if (open && donation) {
      // 상태 초기화 후 시작
      setTaskId(null)
      setCandidates([])
      setSelectedRecipientId(null)
      setIsProcessing(false)
      
      startMatchingProcess()
    }
  }, [open, donation, startMatchingProcess])


  // 3. 최종 선택 (확정)
  const handleConfirmMatch = async () => {
    if (!selectedRecipientId || !taskId) return

    setIsProcessing(true)
    try {
      await acceptRecipientMatch(taskId, selectedRecipientId)
      toast.success("배달 매칭이 확정되었습니다! 안전하게 배달해주세요.")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Confirm match error:", error)
      toast.error("매칭 확정 중 오류가 발생했습니다.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>봉사 매칭 프로세스</DialogTitle>
          <DialogDescription>
            {step === "LOADING" && "AI가 최적의 수혜자를 찾고 있습니다..."}
            {step === "SELECT" && "배달할 수혜자를 선택해주세요."}
          </DialogDescription>
        </DialogHeader>

        {/* 1. 로딩 화면 */}
        {step === "LOADING" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold text-lg">AI 매칭 분석 중</p>
              <p className="text-sm text-muted-foreground">잠시만 기다려주세요.</p>
            </div>
          </div>
        )}

        {/* 2. 수혜자 선택 화면 */}
        {step === "SELECT" && (
          <div className="space-y-4 py-4">
            <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
              {candidates.map((recipient) => (
                <Card 
                  key={recipient.recipient_id}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedRecipientId === recipient.recipient_id 
                      ? "border-primary bg-primary/5" 
                      : "border-transparent hover:border-muted"
                  }`}
                  onClick={() => setSelectedRecipientId(recipient.recipient_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold">{recipient.recipient_name}</span>
                      </div>
                      {selectedRecipientId === recipient.recipient_id && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {recipient.recipient_address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {recipient.phone_number || "연락처 없음"}
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-muted rounded text-xs">
                      <span className="font-semibold text-primary">추천 사유:</span> {recipient.reason_by_mcp}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
              <Button onClick={handleConfirmMatch} disabled={!selectedRecipientId || isProcessing}>
                {isProcessing ? "확정 중..." : "이 곳으로 배달하기"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}