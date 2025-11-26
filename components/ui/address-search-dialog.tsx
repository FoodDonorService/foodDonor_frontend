"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import DaumPostcodeEmbed from "react-daum-postcode"

interface AddressSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (data: { zonecode: string; address: string }) => void
}

export function AddressSearchDialog({ open, onOpenChange, onComplete }: AddressSearchDialogProps) {
  
  const handleComplete = (data: any) => {
    let fullAddress = data.address
    let extraAddress = ""

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname
      }
      if (data.buildingName !== "") {
        extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : ""
    }

    // 상위 컴포넌트로 선택된 주소 전달
    onComplete({
      zonecode: data.zonecode,
      address: fullAddress,
    })
    
    // 다이얼로그 닫기
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>주소 검색</DialogTitle>
        </DialogHeader>
        <div className="h-[500px] w-full">
          <DaumPostcodeEmbed 
            onComplete={handleComplete} 
            style={{ width: "100%", height: "100%" }}
            autoClose={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}