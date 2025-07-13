"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signInClient, signUpClient } from "@/lib/auth-client" // Importa as Server Actions
import { toast } from "@/hooks/use-toast"

interface LoginFormProps {
  onLogin: (user: any) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [signupData, setSignupData] = useState({ username: "", password: "", confirmPassword: "" })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!loginData.username.trim() || !loginData.password.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log("Tentando fazer login com:", loginData.username)
      const user = await signInClient(loginData.username, loginData.password)
      console.log("Login bem-sucedido:", user)

      onLogin(user)
      toast({
        title: "Login realizado",
        description: `Bem-vindo, ${user.username}!`,
      })
    } catch (error) {
      console.error("Erro no login:", error)
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!signupData.username.trim() || !signupData.password.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      })
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    if (signupData.password.length !== 4 || !/^\d{4}$/.test(signupData.password)) {
      toast({
        title: "Erro",
        description: "A senha deve ter exatamente 4 dígitos numéricos",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log("Tentando criar usuário:", signupData.username)
      const user = await signUpClient(signupData.username, signupData.password)
      console.log("Usuário criado:", user)

      toast({
        title: "Conta criada",
        description: "Usuário criado com sucesso! Faça login.",
      })

      // Limpar formulário e mudar para aba de login
      setSignupData({ username: "", password: "", confirmPassword: "" })

      // Opcional: preencher loginData para facilitar o login após o cadastro
      setLoginData({ username: signupData.username, password: signupData.password })
    } catch (error) {
      console.error("Erro no cadastro:", error)
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sistema de Entrada de Produtos Alessi</CardTitle>
          <CardDescription>Gerencie seus produtos com facilidade</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-username">Nome de Usuário</Label>
                  <Input
                    id="login-username"
                    value={loginData.username}
                    onChange={(e) => setLoginData((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="Digite seu nome de usuário"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Senha (4 dígitos)</Label>
                  <Input
                    id="login-password"
                    type="password"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={loginData.password}
                    onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Digite sua senha"
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="signup-username">Nome de Usuário</Label>
                  <Input
                    id="signup-username"
                    value={signupData.username}
                    onChange={(e) => setSignupData((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="Escolha um nome de usuário"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Senha (4 dígitos)</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={signupData.password}
                    onChange={(e) => setSignupData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Digite 4 números"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Repita os 4 números"
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Criando..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
