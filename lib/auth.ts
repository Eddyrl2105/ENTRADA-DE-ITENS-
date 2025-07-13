import { supabase } from "./supabase"
import bcrypt from "bcryptjs"

export async function signUp(username: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from("users")
    .insert([{ username, password_hash: hashedPassword }])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signIn(username: string, password: string) {
  const { data: user, error } = await supabase.from("users").select("*").eq("username", username).single()

  if (error || !user) {
    throw new Error("Usuário não encontrado")
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash)

  if (!isValidPassword) {
    throw new Error("Senha incorreta")
  }

  return user
}
