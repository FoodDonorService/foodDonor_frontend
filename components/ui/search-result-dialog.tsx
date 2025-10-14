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
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Building2 } from "lucide-react"

interface SearchResult {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  phone_number: string
}

interface SearchResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  results: SearchResult[]
  onSelect: (result: SearchResult) => void
  role: string
}

export function SearchResultDialog({ 
  open, 
  onOpenChange, 
  results, 
  onSelect, 
  role 
}: SearchResultDialogProps) {
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)

  const handleSelect = () => {
    if (selectedResult) {
      onSelect(selectedResult)
      onOpenChange(false)
      setSelectedResult(null)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setSelectedResult(null)
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "DONOR": return "기부자"
      case "RECIPIENT": return "수혜처"
      case "FOOD_BANK": return "푸드뱅크"
      default: return role
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>검색 결과</DialogTitle>
          <DialogDescription>
            {getRoleLabel(role)} 중에서 원하는 항목을 선택해주세요. ({results.length}개 결과)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {results.map((result) => (
            <Card 
              key={result.id}
              className={`cursor-pointer transition-colors ${
                selectedResult?.id === result.id 
                  ? "ring-2 ring-primary bg-primary/5" 
                  : "hover:bg-muted/50"
              }`}
              onClick={() => setSelectedResult(result)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{result.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getRoleLabel(role)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{result.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{result.phone_number}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-muted-foreground/20">
                    {selectedResult?.id === result.id && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            취소
          </Button>
          <Button 
            onClick={handleSelect}
            disabled={!selectedResult}
          >
            선택
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
