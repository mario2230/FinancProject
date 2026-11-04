import { supabase } from '../supabase';

export interface Income {
  id?: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  user_id?: string;
}

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error('Usuário não autenticado');

  return user.id;
}

export async function getIncomes(): Promise<Income[]> {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from('receitas')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false });

  if (error) throw error;

  return data as Income[];
}

export async function createIncome(income: Income): Promise<Income> {
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from('receitas')
    .insert({
      ...income,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return data as Income;
}

export async function updateIncome(id: string, income: Partial<Income>): Promise<Income> {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from('receitas')
    .update(income)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return data as Income;
}

export async function deleteIncome(id: string): Promise<void> {
  const userId = await getAuthenticatedUserId();
  const { error } = await supabase.from('receitas').delete().eq('id', id).eq('user_id', userId);

  if (error) throw error;
}
