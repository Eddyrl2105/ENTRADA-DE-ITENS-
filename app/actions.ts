"use server"

import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

/**
 * Registra um novo usuário no sistema.
 * @param username O nome de usuário.
 * @param password A senha de 4 dígitos.
 * @returns O objeto do usuário criado.
 * @throws Error se o nome de usuário já existir ou ocorrer um erro no banco de dados.
 */
export async function signUp(username: string, password: string) {
  if (!username || !password) {
    throw new Error("Nome de usuário e senha são obrigatórios.")
  }
  if (password.length !== 4 || !/^\d{4}$/.test(password)) {
    throw new Error("A senha deve ter exatamente 4 dígitos numéricos.")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const { data: existingUser } = await supabase.from("users").select("username").eq("username", username).single()

  if (existingUser) {
    throw new Error("Nome de usuário já existe.")
  }

  const { data, error } = await supabase
    .from("users")
    .insert([{ username: username.trim(), password_hash: hashedPassword }])
    .select()
    .single()

  if (error) {
    console.error("Erro no cadastro (Server Action):", error)
    throw new Error(`Erro ao criar usuário: ${error.message}`)
  }

  revalidatePath("/") // Revalida a página para refletir o novo usuário
  return data
}

/**
 * Autentica um usuário no sistema.
 * @param username O nome de usuário.
 * @param password A senha.
 * @returns O objeto do usuário autenticado.
 * @throws Error se o usuário não for encontrado ou a senha estiver incorreta.
 */
export async function signIn(username: string, password: string) {
  if (!username || !password) {
    throw new Error("Nome de usuário e senha são obrigatórios.")
  }

  const { data: user, error } = await supabase.from("users").select("*").eq("username", username.trim()).single()

  if (error || !user) {
    console.error("Erro ao buscar usuário (Server Action):", error)
    throw new Error("Usuário ou senha incorretos.")
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash)

  if (!isValidPassword) {
    throw new Error("Usuário ou senha incorretos.")
  }

  revalidatePath("/") // Revalida a página após o login
  return user
}

/**
 * Simula o upload em massa de produtos por um usuário mestre.
 * Em uma implementação real, isso processaria um arquivo CSV/Excel.
 * @param userId O ID do usuário que está tentando o upload.
 * @param productsData Um array de objetos de produto a serem inseridos.
 * @returns Um objeto com o status da operação.
 * @throws Error se o usuário não for mestre ou ocorrer um erro na inserção.
 */
export async function bulkUploadProducts(userId: string, productsData: any[]) {
  const { data: user, error: userError } = await supabase.from("users").select("is_master").eq("id", userId).single()

  if (userError || !user || !user.is_master) {
    throw new Error("Apenas usuários mestres podem realizar esta operação.")
  }

  const productsToInsert = productsData.map((product) => ({
    ...product,
    user_id: userId, // Atribui o master user como criador
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  const { error: insertError } = await supabase.from("products").insert(productsToInsert)

  if (insertError) {
    console.error("Erro ao inserir produtos em massa:", insertError)
    throw new Error(`Erro ao salvar produtos em massa: ${insertError.message}`)
  }

  revalidatePath("/") // Revalida a página para refletir os novos produtos
  return { success: true, message: `${productsData.length} produtos adicionados com sucesso!` }
}
