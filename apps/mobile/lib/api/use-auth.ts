import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { LoginInput, RegisterInput } from '../types/auth';

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }: LoginInput) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async ({ name, email, password }: RegisterInput) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  });
}
