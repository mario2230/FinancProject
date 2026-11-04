import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/supabase';

interface AuthClient {
  signUpNewUser(email: string, senha: string): Promise<User | null>;
  getUser(): Promise<User | null>;
  getSession(): Promise<Session | null>;
  signInWithEmail(email: string, senha: string): Promise<User>;
  deslogarUser(): Promise<void>;
  atualizarSenha(senhaAtual: string, senhaNova: string): Promise<User>;
}

export function useAuth(): AuthClient {
  async function signUpNewUser(email: string, senha: string): Promise<User | null> {
    const { data, error } = await supabase.auth.signUp({ email, password: senha });

    if (error) throw error;

    return data.user;
  }

  async function getUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    return data.user;
  }

  async function getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return data.session;
  }

  async function signInWithEmail(email: string, senha: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) throw error;
    if (!data.user) throw new Error('O Supabase não retornou o usuário autenticado.');

    return data.user;
  }

  async function deslogarUser(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  }

  async function atualizarSenha(senhaAtual: string, senhaNova: string): Promise<User> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!userData.user?.email) throw new Error('Não há usuário autenticado com e-mail.');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: senhaAtual,
    });

    if (signInError) throw new Error('A senha atual não confere.');

    const { data, error } = await supabase.auth.updateUser({ password: senhaNova });

    if (error) throw error;
    if (!data.user) throw new Error('O Supabase não retornou o usuário atualizado.');

    return data.user;
  }

  return {
    signUpNewUser,
    getUser,
    getSession,
    signInWithEmail,
    deslogarUser,
    atualizarSenha,
  };
}
