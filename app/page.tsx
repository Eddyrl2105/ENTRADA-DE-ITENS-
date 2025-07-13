"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/login-form"
import { ProductForm } from "@/components/product-form"
import { ProductList } from "@/components/product-list"
import { Package, LogOut, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { StatsDashboard } from "@/components/stats-dashboard"
import { supabase } from "@/lib/supabase"
import { MasterUpload } from "@/components/master-upload"

interface User {
  id: string
  username: string
  is_master?: boolean // Adicionado para identificar master user
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState("entrada") // Estado para controlar a aba ativa

  useEffect(() => {
    const loadUser = async () => {
      const savedUser = localStorage.getItem("user")
      if (savedUser) {
        const parsedUser: User = JSON.parse(savedUser)
        // Revalidar o status de master do usuário ao carregar
        const { data, error } = await supabase.from("users").select("is_master").eq("id", parsedUser.id).single()
        if (data && !error) {
          setUser({ ...parsedUser, is_master: data.is_master })
        } else {
          setUser(parsedUser)
        }
      }
    }
    loadUser()
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    setActiveTab("entrada") // Redireciona para a aba de entrada após o login
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("user")
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    })
    setActiveTab("entrada") // Volta para a aba de entrada após o logout
  }

  const handleProductAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Sistema de Entrada de Produtos Alessi</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Olá, {user.username}</span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsDashboard userId={user.id} refreshTrigger={refreshTrigger} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
            <TabsTrigger value="entrada">Entrada de Produtos</TabsTrigger>
            <TabsTrigger value="lista">Lista de Produtos</TabsTrigger>
            {user.is_master && (
              <TabsTrigger value="upload-master">
                <Upload className="h-4 w-4 mr-2" />
                Upload Master
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="entrada" className="mt-6">
            <ProductForm userId={user.id} onProductAdded={handleProductAdded} />
          </TabsContent>

          <TabsContent value="lista" className="mt-6">
            <ProductList userId={user.id} refreshTrigger={refreshTrigger} />
          </TabsContent>

          {user.is_master && (
            <TabsContent value="upload-master" className="mt-6">
              <MasterUpload userId={user.id} onUploadSuccess={handleProductAdded} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
