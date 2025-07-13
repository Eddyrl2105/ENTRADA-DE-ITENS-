"use client"

// Este arquivo agora apenas importa e re-exporta as Server Actions
// A lógica de autenticação e hash de senha foi movida para app/actions.ts

import { signIn as serverSignIn, signUp as serverSignUp } from "@/app/actions"

export async function signUpClient(username: string, password: string) {
  return serverSignUp(username, password)
}

export async function signInClient(username: string, password: string) {
  return serverSignIn(username, password)
}
