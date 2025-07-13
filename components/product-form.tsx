"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Save, Search, RefreshCw, Edit, X } from "lucide-react"
import { BarcodeScannerEnhanced } from "./barcode-scanner-enhanced"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface ProductFormProps {
  userId: string
  onProductAdded: () => void
}

export function ProductForm({ userId, onProductAdded }: ProductFormProps) {
  const [showScanner, setShowScanner] = useState(false)
  const [formData, setFormData] = useState({
    codigo_pa: "",
    descricao: "",
    quantidade: "",
    lote: "",
    validade: "",
    codigo_barras: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [manualMode, setManualMode] = useState(false) // Novo estado para o modo manual

  const searchProductByPA = async (codigoPA: string) => {
    if (!codigoPA.trim()) return

    setIsSearching(true)
    console.log(`Buscando por Código PA: ${codigoPA.trim()}`)
    try {
      // Buscar primeiro na tabela de códigos de barras
      const { data: barcodeData, error: barcodeError } = await supabase
        .from("barcodes")
        .select("*")
        .eq("codigo_pa", codigoPA.trim())
        .single()

      if (barcodeError && barcodeError.code !== "PGRST116") {
        // PGRST116 = no rows found
        console.error("Erro ao buscar em barcodes:", barcodeError)
      }
      console.log("Resultado da busca em barcodes:", barcodeData)

      if (barcodeData) {
        setFormData((prev) => ({
          ...prev,
          descricao: barcodeData.descricao || "",
          codigo_barras: barcodeData.codigo_barras || "",
        }))
        toast({
          title: "Produto encontrado",
          description: "Informações preenchidas automaticamente (de barcodes)",
        })
        return
      }

      // Se não encontrar em barcodes, buscar na tabela de products existentes
      // REMOVIDO: .eq("user_id", userId) para permitir busca global
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("codigo_pa", codigoPA.trim())
        .limit(1)
        .single()

      if (productError && productError.code !== "PGRST116") {
        // PGRST116 = no rows found
        console.error("Erro ao buscar em products:", productError)
      }
      console.log("Resultado da busca em products:", productData)

      if (productData) {
        setFormData((prev) => ({
          ...prev,
          descricao: productData.descricao || "",
          codigo_barras: productData.codigo_barras || "",
        }))
        toast({
          title: "Produto encontrado",
          description: "Dados preenchidos com base em produto existente (de products)",
        })
      } else {
        toast({
          title: "Produto não encontrado",
          description: "Código PA não encontrado na base de dados",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro geral ao buscar produto:", error)
      toast({
        title: "Erro na busca",
        description: "Erro ao buscar produto na base de dados",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleBarcodeScanned = async (barcode: string) => {
    setFormData((prev) => ({ ...prev, codigo_pa: barcode, codigo_barras: barcode }))
    setShowScanner(false)

    // Buscar informações do produto pelo código de barras
    await searchProductByPA(barcode)
  }

  const handlePAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, codigo_pa: value }))
  }

  const handlePABlur = () => {
    if (!manualMode && formData.codigo_pa.trim()) {
      searchProductByPA(formData.codigo_pa)
    }
  }

  const handleQuickRefresh = async () => {
    if (!formData.codigo_pa.trim()) {
      toast({
        title: "Código PA necessário",
        description: "Digite um Código PA para buscar informações",
        variant: "destructive",
      })
      return
    }
    await searchProductByPA(formData.codigo_pa)
  }

  const toggleManualMode = () => {
    setManualMode((prev) => !prev)
    if (!manualMode) {
      toast({
        title: "Modo Manual Ativado",
        description: "Você pode inserir Código PA e Descrição livremente.",
      })
    } else {
      toast({
        title: "Modo Manual Desativado",
        description: "A busca automática por Código PA está ativa novamente.",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("products").insert([
        {
          codigo_pa: formData.codigo_pa,
          descricao: formData.descricao,
          quantidade: Number.parseInt(formData.quantidade),
          lote: formData.lote,
          validade: formData.validade,
          codigo_barras: formData.codigo_barras || null,
          user_id: userId, // Mantém o user_id para rastreamento de quem adicionou
        },
      ])

      if (error) throw error

      toast({
        title: "Produto adicionado",
        description: "Produto salvo com sucesso",
      })

      setFormData({
        codigo_pa: "",
        descricao: "",
        quantidade: "",
        lote: "",
        validade: "",
        codigo_barras: "",
      })

      onProductAdded()
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (showScanner) {
    return <BarcodeScannerEnhanced onScan={handleBarcodeScanned} onClose={() => setShowScanner(false)} />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Entrada de Produto</CardTitle>
        <div className="flex gap-2">
          <Button type="button" variant={manualMode ? "default" : "outline"} size="sm" onClick={toggleManualMode}>
            {manualMode ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {manualMode ? "Sair do Modo Manual" : "Modo Manual"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleQuickRefresh}
            disabled={isSearching || !formData.codigo_pa.trim() || manualMode}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSearching ? "animate-spin" : ""}`} />
            Atualizar Dados
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="codigo_pa">Código PA</Label>
              <div className="flex gap-2">
                <Input
                  id="codigo_pa"
                  value={formData.codigo_pa}
                  onChange={handlePAChange}
                  onBlur={handlePABlur}
                  placeholder="Código PA"
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => searchProductByPA(formData.codigo_pa)}
                  disabled={isSearching || !formData.codigo_pa.trim() || manualMode}
                >
                  <Search className={`h-4 w-4 ${isSearching ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={() => setShowScanner(true)} className="mt-6">
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição do Produto</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição do produto"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                value={formData.quantidade}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantidade: e.target.value }))}
                placeholder="Quantidade"
                required
              />
            </div>

            <div>
              <Label htmlFor="lote">Lote</Label>
              <Input
                id="lote"
                value={formData.lote}
                onChange={(e) => setFormData((prev) => ({ ...prev, lote: e.target.value }))}
                placeholder="Número do lote"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="validade">Validade</Label>
            <Input
              id="validade"
              type="date"
              value={formData.validade}
              onChange={(e) => setFormData((prev) => ({ ...prev, validade: e.target.value }))}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Salvando..." : "Salvar Produto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
