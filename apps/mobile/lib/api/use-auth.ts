import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { LoginInput, RegisterInput } from '../types/auth';

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: LoginInput) =>
      supabase.auth.signInWithPassword({ email, password }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: ({ name, email, password }: RegisterInput) =>
      supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      }),
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: () => supabase.auth.signOut(),
  });
}
