"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let animationId: number

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsScanning(true)
          setError(null)
        }
      } catch (err) {
        setError("Erro ao acessar a câmera. Verifique as permissões.")
        console.error("Camera error:", err)
      }
    }

    // Simulação de detecção de código de barras
    const detectBarcode = () => {
      if (isScanning && videoRef.current) {
        // Em uma implementação real, você usaria uma biblioteca como ZXing
        // Por enquanto, vamos simular com um clique
        animationId = requestAnimationFrame(detectBarcode)
      }
    }

    startCamera()
    detectBarcode()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isScanning])

  const handleManualInput = () => {
    const barcode = prompt("Digite o código de barras:")
    if (barcode) {
      onScan(barcode)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Scanner de Código de Barras</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="text-center space-y-4">
            <p className="text-red-500">{error}</p>
            <Button onClick={handleManualInput} className="w-full">
              Inserir Código Manualmente
            </Button>
          </div>
        ) : (
          <>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-red-500 border-dashed m-8 rounded-lg"></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Posicione o código de barras dentro da área destacada</p>
              <Button onClick={handleManualInput} variant="outline" className="w-full bg-transparent">
                Inserir Código Manualmente
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
