"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, MapPin, Phone, User, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { requestVolunteerTask, getMatchTaskResult, acceptRecipientMatch } from "@/lib/api"
import axios from "axios" // 404 에러 체크용

interface MatchingDialogProps {
  donation: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function MatchingDialog({ donation, open, onOpenChange, onSuccess }: MatchingDialogProps) {
  // 상태 관리: EMPTY 단계 포함
  const [step, setStep] = useState<"LOADING" | "SELECT" | "CONFIRM" | "EMPTY">("LOADING")
  const [taskId, setTaskId] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<any[]>([])
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // 2. 결과 폴링 (실제 API 사용)
  const pollMatchResult = useCallback(async (tid: string) => {
    if (!open) return;

    try {
      console.log(`[Polling] Checking task status for: ${tid}`)
      const res = await getMatchTaskResult(tid) // 실제 API 호출

      if (res.status === "COMPLETED") {
        console.log("[Polling] Match Completed!", res.data)
        
        // 결과 목록이 있는지 확인
        if (res.data.recommended_recipients && res.data.recommended_recipients.length > 0) {
          setCandidates(res.data.recommended_recipients)
          setStep("SELECT")
        } else {
          // 결과가 없으면 EMPTY 화면으로 전환
          setStep("EMPTY")
        }
      } else if (res.status === "FAILED") {
        console.error("[Polling] Match Failed")
        toast.error("AI 매칭 작업이 실패했습니다.")
        onOpenChange(false)
      } else {
        // 아직 진행 중(PENDING/PROCESSING)이면 3초 후 재시도
        setTimeout(() => pollMatchResult(tid), 3000)
      }
    } catch (error: any) {
      // 404 Not Found는 "아직 생성 안 됨"으로 간주하고 재시도
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log("[Polling] Task not created yet (404). Retrying in 3s...")
        setTimeout(() => pollMatchResult(tid), 3000)
        return
      }

      console.error("[Polling] Error:", error)
      toast.error("매칭 상태 확인 중 오류가 발생했습니다.")
      onOpenChange(false)
    }
  }, [open, onOpenChange])

  // 1. 매칭 작업 시작 (실제 API 사용)
  const startMatchingProcess = useCallback(async () => {
    try {
      setStep("LOADING")
      console.log("[Matching] Requesting task for donation:", donation.donation_id)
      
      const response = await requestVolunteerTask(donation.donation_id)
      
      // 서버 응답 구조 확인 (task_id 위치)
      // DTO 구조가 { status, message, task_id } 인지 { status, message, data: { task_id } } 인지에 따라 조정
      // 현재 서버가 data 안에 넣어주는 것으로 가정 (이전 대화 맥락)
      let newTaskId = null;
      if (response.data && response.data.task_id) {
        newTaskId = response.data.task_id;
      } else if (response.data.task_id) {
        newTaskId = response.data.task_id;
      }

      if (newTaskId) {
        console.log("[Matching] Task started. ID:", newTaskId)
        setTaskId(newTaskId)
        // 1초 뒤 폴링 시작
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
      onSuccess() // 목록 새로고침 등 후속 처리
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
            {step === "EMPTY" && "매칭 결과를 확인해주세요."}
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

        {/* 2. 수혜자 선택 화면 (결과 있음) */}
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

        {/* 3. 결과 없음 화면 (EMPTY) */}
        {step === "EMPTY" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="rounded-full bg-muted p-4">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-bold text-xl">매칭 가능한 수혜자가 없습니다</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                현재 조건에 맞는 수혜자를 찾지 못했습니다.<br/>
                잠시 후 다시 시도해주시거나<br/>
                다른 기부 물품을 선택해주세요.
              </p>
            </div>
            <DialogFooter className="w-full sm:justify-center">
              <Button size="lg" onClick={() => onOpenChange(false)} className="min-w-[120px]">
                확인
              </Button>
            </DialogFooter>
          </div>
        )}

      </DialogContent>
    </Dialog>
  )
}