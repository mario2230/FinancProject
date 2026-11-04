import { supabase } from '../supabase';

export interface Expense {
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

export async function getExpenses(): Promise<Expense[]> {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from('despesas')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false });

  if (error) throw error;

  return data as Expense[];
}

export async function createExpense(expense: Expense): Promise<Expense> {
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from('despesas')
    .insert({
      ...expense,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return data as Expense;
}

export async function updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from('despesas')
    .update(expense)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return data as Expense;
}

export async function deleteExpense(id: string): Promise<void> {
  const userId = await getAuthenticatedUserId();
  const { error } = await supabase.from('despesas').delete().eq('id', id).eq('user_id', userId);

  if (error) throw error;
}
