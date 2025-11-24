"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Mail, Loader2, AlertCircle } from "lucide-react"
import { confirmSignUp, resendSignUpCode } from "@/lib/auth"
import { toast } from "sonner"

interface VerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  onVerificationSuccess: (email: string) => void
}

export function VerificationDialog({ open, onOpenChange, email, onVerificationSuccess }: VerificationDialogProps) {
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<"initial" | "resending">("initial")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("인증 코드는 6자리 숫자입니다.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Amplify의 confirmSignUp 함수 호출
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      })

      // 2. 성공 처리
      onVerificationSuccess(email) // 성공했음을 상위 컴포넌트에 알림
      onOpenChange(false) // 다이얼로그 닫기
      toast.success("✅ 이메일 인증이 완료되었습니다.")
    } catch (err: any) {
      console.error("Verification Error:", err)
      if (err.name === "CodeMismatchException") {
        setError("인증 코드가 일치하지 않습니다. 다시 확인해주세요.")
      } else if (err.name === "NotAuthorizedException") {
        // 이미 유효한 토큰이 있는 상태일 때 (재로그인 시도 필요)
        onVerificationSuccess(email)
      } else {
        setError(err.message || "인증 중 알 수 없는 오류가 발생했습니다.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setStatus("resending")
    setError(null)
    try {
      // 1. 코드 재전송
      await resendSignUpCode({ username: email })
      toast.info("📩 인증 코드를 다시 전송했습니다. 메일함을 확인해주세요.")
    } catch (err: any) {
      console.error("Resend Error:", err)
      setError("코드 재전송에 실패했습니다.")
    } finally {
      setStatus("initial")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            이메일 인증
          </DialogTitle>
          <DialogDescription>
            {email} 주소로 발송된 6자리 인증 코드를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 pt-4">
          
          {/* OTP 입력 필드 */}
          <InputOTP 
            maxLength={6} 
            value={code} 
            onChange={(value) => {
              setCode(value);
              setError(null);
            }}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} {...slot} index={index} className="w-12 h-12 text-xl" />
                ))}
              </InputOTPGroup>
            )}
          />
          
          {/* 에러 메시지 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>인증 실패</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* 재전송 버튼 */}
          <Button 
            variant="link" 
            onClick={handleResend}
            disabled={status === "resending" || isSubmitting}
            className="text-sm text-muted-foreground"
          >
            {status === "resending" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                재전송 중...
              </>
            ) : (
              "인증 코드를 받지 못하셨나요? (재전송)"
            )}
          </Button>
          
          {/* 확인 버튼 */}
          <Button 
            onClick={handleVerify} 
            className="w-full"
            disabled={isSubmitting || code.length !== 6}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                인증 확인 중...
              </>
            ) : (
              "인증 코드 확인"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}