"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Download, Search, Trash2, RefreshCw, CalendarIcon, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import saveAs from "file-saver"

interface Product {
  id: string
  codigo_pa: string
  descricao: string
  quantidade: number
  lote: string
  validade: string
  codigo_barras: string | null
  user_id: string | null // Adicionado para o criador
  created_at: string
}

interface ProductListProps {
  userId: string
  refreshTrigger: number
}

export function ProductList({ userId, refreshTrigger }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [usersMap, setUsersMap] = useState<Map<string, string>>(new Map()) // Para mapear user_id para username

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("id, username")
      if (data) {
        const map = new Map<string, string>()
        data.forEach((user) => map.set(user.id, user.username))
        setUsersMap(map)
      } else {
        console.error("Erro ao carregar usuários para mapeamento:", error)
      }
    }
    fetchUsers()
  }, [])

  const fetchProducts = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true)

    try {
      let query = supabase.from("products").select("*").eq("user_id", userId).order("created_at", { ascending: false })

      if (startDate) {
        query = query.gte("created_at", format(startDate, "yyyy-MM-dd"))
      }
      if (endDate) {
        query = query.lte("created_at", format(endDate, "yyyy-MM-dd"))
      }

      const { data, error } = await query

      if (error) throw error

      setProducts(data || [])
      setFilteredProducts(data || []) // Inicializa filteredProducts com todos os dados

      if (showRefreshIndicator) {
        toast({
          title: "Dados atualizados",
          description: "Lista de produtos atualizada com sucesso",
        })
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      if (showRefreshIndicator) setIsRefreshing(false)
    }
  }

  const handleQuickRefresh = () => {
    fetchProducts(true)
  }

  useEffect(() => {
    fetchProducts()
  }, [userId, refreshTrigger, startDate, endDate]) // Re-fetch quando datas mudam

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.codigo_pa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.codigo_barras && product.codigo_barras.includes(searchTerm)),
    )
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  const exportToExcel = () => {
    if (filteredProducts.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "A lista está vazia ou não há produtos com os filtros aplicados.",
        variant: "destructive",
      })
      return
    }

    /* 1. Converte os dados para worksheet */
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProducts.map((product) => ({
        "Código PA": product.codigo_pa,
        Descrição: product.descricao,
        Quantidade: product.quantidade,
        Lote: product.lote,
        Validade: new Date(product.validade).toLocaleDateString("pt-BR"),
        "Código de Barras": product.codigo_barras || "",
        "Data Criação": new Date(product.created_at).toLocaleDateString("pt-BR"),
        "Adicionado Por": product.user_id ? usersMap.get(product.user_id) || "Desconhecido" : "N/A",
      })),
    )

    /* 2. Cria o workbook e o adiciona */
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos")

    /* 3. Define nome do arquivo */
    let filename = `produtos_${new Date().toISOString().split("T")[0]}`
    if (startDate && endDate) {
      filename = `produtos_${format(startDate, "yyyyMMdd")}_${format(endDate, "yyyyMMdd")}`
    } else if (startDate) {
      filename = `produtos_apos_${format(startDate, "yyyyMMdd")}`
    } else if (endDate) {
      filename = `produtos_ate_${format(endDate, "yyyyMMdd")}`
    }
    filename += ".xlsx"

    /* 4. Gera o arquivo em memória (ArrayBuffer) */
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

    /* 5. Cria Blob e baixa com FileSaver */
    const blob = new Blob([wbout], { type: "application/octet-stream" })
    saveAs(blob, filename)

    toast({
      title: "Exportação concluída",
      description: `Arquivo "${filename}" baixado com sucesso`,
    })
  }

  const deleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Produto excluído",
        description: "Produto removido com sucesso",
      })

      fetchProducts()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive",
      })
    }
  }

  const clearDateFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    toast({
      title: "Filtros de data limpos",
      description: "Exibindo todos os produtos.",
    })
  }

  if (isLoading) {
    return <div className="text-center">Carregando produtos...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Meus Produtos ({filteredProducts.length})</CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleQuickRefresh} disabled={isRefreshing} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button onClick={exportToExcel} disabled={filteredProducts.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-[200px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Data Início"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={ptBR} />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-[200px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Data Fim"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus locale={ptBR} />
              </PopoverContent>
            </Popover>
            {(startDate || endDate) && (
              <Button variant="outline" size="icon" onClick={clearDateFilters}>
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm || startDate || endDate
              ? "Nenhum produto encontrado com os filtros aplicados"
              : "Nenhum produto cadastrado por você."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código PA</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Código Barras</TableHead>
                  <TableHead>Adicionado Por</TableHead> {/* Nova coluna */}
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.codigo_pa}</TableCell>
                    <TableCell className="max-w-xs truncate">{product.descricao}</TableCell>
                    <TableCell>{product.quantidade}</TableCell>
                    <TableCell>{product.lote}</TableCell>
                    <TableCell>{new Date(product.validade).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{product.codigo_barras || "-"}</TableCell>
                    <TableCell>{product.user_id ? usersMap.get(product.user_id) || "Desconhecido" : "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
