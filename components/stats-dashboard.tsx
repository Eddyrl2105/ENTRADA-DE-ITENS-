"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, AlertTriangle, Palette, Paintbrush } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface StatsProps {
  userId: string
  refreshTrigger: number
}

export function StatsDashboard({ userId, refreshTrigger }: StatsProps) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    expiringSoon: 0,
    totalQuantity: 0,
    recentProducts: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total de produtos (todos os produtos no banco, não apenas do usuário)
        const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

        // Produtos vencendo em 30 dias (todos os produtos)
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        const { count: expiringSoon } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .lte("validade", thirtyDaysFromNow.toISOString().split("T")[0])

        // Total de quantidade (soma das quantidades de todos os produtos)
        const { data: quantityData } = await supabase.from("products").select("quantidade")

        const totalQuantity = quantityData?.reduce((sum, item) => sum + item.quantidade, 0) || 0

        // Produtos adicionados nos últimos 7 dias (todos os produtos)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { count: recentProducts } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .gte("created_at", sevenDaysAgo.toISOString())

        setStats({
          totalProducts: totalProducts || 0,
          expiringSoon: expiringSoon || 0,
          totalQuantity,
          recentProducts: recentProducts || 0,
        })
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error)
      }
    }

    fetchStats()
  }, [userId, refreshTrigger])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
          <Palette className="h-4 w-4 text-blue-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <p className="text-xs text-blue-200">Produtos cadastrados</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vencendo em 30 dias</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.expiringSoon}</div>
          <p className="text-xs text-yellow-200">Produtos próximos ao vencimento</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quantidade Total</CardTitle>
          <Paintbrush className="h-4 w-4 text-green-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalQuantity}</div>
          <p className="text-xs text-green-200">Unidades em estoque</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Adicionados (7 dias)</CardTitle>
          <Calendar className="h-4 w-4 text-purple-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recentProducts}</div>
          <p className="text-xs text-purple-200">Produtos recentes</p>
        </CardContent>
      </Card>
    </div>
  )
}
