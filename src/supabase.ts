import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_APP_SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error('Erro faltando informações do ENV. (url)');
}

if (!supabaseKey) {
  throw new Error('Erro faltando informações do ENV. (key)');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
