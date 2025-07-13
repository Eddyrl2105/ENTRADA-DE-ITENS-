"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, CheckCircle, XCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { bulkUploadProducts } from "@/app/actions" // Importa a Server Action

interface MasterUploadProps {
  userId: string
  onUploadSuccess: () => void
}

export function MasterUpload({ userId, onUploadSuccess }: MasterUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadData, setUploadData] = useState("") // Simula dados de um CSV/JSON
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setUploadStatus("idle")

    try {
      // Simula a leitura e parsing de um arquivo (ex: CSV)
      // Para um CSV real, você usaria uma biblioteca como 'papaparse'
      const sampleProducts = [
        {
          codigo_pa: "PA_MASTER_001",
          descricao: "Tinta Acrílica Premium Azul",
          quantidade: 200,
          lote: "LOTE_AZUL_001",
          validade: "2025-06-30",
          codigo_barras: "9991112223331",
        },
        {
          codigo_pa: "PA_MASTER_002",
          descricao: "Tinta Esmalte Sintético Branco",
          quantidade: 150,
          lote: "LOTE_BRANCO_002",
          validade: "2025-09-15",
          codigo_barras: "9994445556662",
        },
        {
          codigo_pa: "PA_MASTER_003",
          descricao: "Verniz Marítimo Transparente",
          quantidade: 80,
          lote: "LOTE_VERNIZ_003",
          validade: "2026-01-20",
          codigo_barras: "9997778889993",
        },
      ]

      // Se houver dados no textarea, tente usá-los (simulando JSON)
      let dataToUpload = sampleProducts
      if (uploadData.trim()) {
        try {
          dataToUpload = JSON.parse(uploadData)
          if (!Array.isArray(dataToUpload) || dataToUpload.some((item) => !item.codigo_pa || !item.descricao)) {
            throw new Error("Formato de dados inválido. Esperado um array de objetos com 'codigo_pa' e 'descricao'.")
          }
        } catch (parseError) {
          toast({
            title: "Erro de formato",
            description: "Os dados inseridos manualmente não são um JSON válido ou estão no formato incorreto.",
            variant: "destructive",
          })
          setIsLoading(false)
          setUploadStatus("error")
          return
        }
      }

      const result = await bulkUploadProducts(userId, dataToUpload)

      toast({
        title: "Upload Concluído",
        description: result.message,
        variant: "default",
      })
      setUploadStatus("success")
      setUploadData("") // Limpa o textarea após o sucesso
      onUploadSuccess() // Notifica a página principal para atualizar a lista/dashboard
    } catch (error) {
      console.error("Erro no upload master:", error)
      toast({
        title: "Erro no Upload",
        description: error instanceof Error ? error.message : "Erro desconhecido ao realizar o upload.",
        variant: "destructive",
      })
      setUploadStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Master de Produtos</CardTitle>
        <CardDescription>
          Apenas usuários mestres podem usar esta função para adicionar produtos em massa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <Label htmlFor="upload-data">Dados para Upload (JSON ou deixe vazio para dados de exemplo)</Label>
            <Textarea
              id="upload-data"
              value={uploadData}
              onChange={(e) => setUploadData(e.target.value)}
              placeholder={`Exemplo:
[
  {
    "codigo_pa": "PA_NOVO_001",
    "descricao": "Tinta Verde Água",
    "quantidade": 50,
    "lote": "LOTE_VERDE_001",
    "validade": "2025-10-01",
    "codigo_barras": "1234567890123"
  },
  {
    "codigo_pa": "PA_NOVO_002",
    "descricao": "Diluente Universal",
    "quantidade": 20,
    "lote": "LOTE_DIL_001",
    "validade": "2026-03-15",
    "codigo_barras": "9876543210987"
  }
]`}
              rows={10}
              className="font-mono text-xs"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Deixe vazio para usar dados de exemplo ou cole um array JSON de produtos.
            </p>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              "Enviando..."
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Subir Novas Entradas
              </>
            )}
          </Button>
          {uploadStatus === "success" && (
            <div className="flex items-center text-green-600 mt-2">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Upload realizado com sucesso!</span>
            </div>
          )}
          {uploadStatus === "error" && (
            <div className="flex items-center text-red-600 mt-2">
              <XCircle className="h-5 w-5 mr-2" />
              <span>Erro ao realizar o upload. Verifique o console.</span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
