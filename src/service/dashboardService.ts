import { supabase } from '../supabase';

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  expensePercentage: number;
}

export interface ExpenseCategory {
  categoria: string;
  valor: number;
}

export interface MonthlyComparison {
  mes: string;
  receitas: number;
  despesas: number;
}

export async function getFinancialSummary(): Promise<FinancialSummary> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuário não autenticado');

  const [incomes, expenses] = await Promise.all([
    supabase.from('receitas').select('valor').eq('user_id', user.id),

    supabase.from('despesas').select('valor').eq('user_id', user.id),
  ]);

  if (incomes.error) throw incomes.error;
  if (expenses.error) throw expenses.error;

  const totalIncome = (incomes.data || []).reduce((total, item) => total + Number(item.valor), 0);

  const totalExpense = (expenses.data || []).reduce((total, item) => total + Number(item.valor), 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: incomes.data.length + expenses.data.length,
    expensePercentage: totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0,
  };
}

export async function getExpensesByCategory(): Promise<ExpenseCategory[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase.from('despesas').select('categoria, valor').eq('user_id', user.id);

  if (error) throw error;

  const categories: Record<string, number> = {};

  data.forEach((item) => {
    categories[item.categoria] = (categories[item.categoria] || 0) + Number(item.valor);
  });

  return Object.entries(categories).map(([categoria, valor]) => ({
    categoria,
    valor,
  }));
}

export async function getMonthlyComparison(): Promise<MonthlyComparison[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuário não autenticado');

  const [incomes, expenses] = await Promise.all([
    supabase.from('receitas').select('valor, data').eq('user_id', user.id),

    supabase.from('despesas').select('valor, data').eq('user_id', user.id),
  ]);

  if (incomes.error) throw incomes.error;
  if (expenses.error) throw expenses.error;

  const months: Record<string, { receitas: number; despesas: number }> = {};

  function addTransactions(transactions: { valor: number; data: string }[], type: 'receitas' | 'despesas') {
    transactions.forEach((item) => {
      const month = item.data.substring(0, 7);

      if (!months[month]) {
        months[month] = { receitas: 0, despesas: 0 };
      }

      months[month][type] += Number(item.valor);
    });
  }

  addTransactions(incomes.data, 'receitas');
  addTransactions(expenses.data, 'despesas');

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, valores]) => ({
      mes,
      ...valores,
    }));
}
