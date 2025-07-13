"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Camera, Keyboard } from "lucide-react"

interface BarcodeScannerEnhancedProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScannerEnhanced({ onScan, onClose }: BarcodeScannerEnhancedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [manualBarcode, setManualBarcode] = useState("")

  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsScanning(true)
          setError(null)
        }
      } catch (err) {
        setError("Erro ao acessar a câmera. Verifique as permissões.")
        setManualMode(true)
        console.error("Camera error:", err)
      }
    }

    if (!manualMode) {
      startCamera()
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [manualMode])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim())
    }
  }

  const simulateScan = () => {
    // Simular leitura de código de barras para demonstração
    const sampleBarcodes = ["7891234567890", "7891234567891", "7891234567892"]
    const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)]
    onScan(randomBarcode)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Scanner - Código PA</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!manualMode && !error ? (
          <>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-red-500 border-dashed m-8 rounded-lg"></div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button onClick={simulateScan} className="bg-red-600 hover:bg-red-700">
                  Simular Leitura
                </Button>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Escaneie o código para preencher o Código PA</p>
              <Button onClick={() => setManualMode(true)} variant="outline" className="w-full">
                <Keyboard className="h-4 w-4 mr-2" />
                Inserir Manualmente
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <Label htmlFor="manual-barcode">Código PA</Label>
              <Input
                id="manual-barcode"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Digite o código PA"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Confirmar
              </Button>
              {!error && (
                <Button type="button" variant="outline" onClick={() => setManualMode(false)}>
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        )}

        {error && (
          <div className="text-center">
            <p className="text-red-500 text-sm mb-2">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
