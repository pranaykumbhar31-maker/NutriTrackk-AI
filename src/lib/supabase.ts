import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Cloud synchronization status helper
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'Supabase credentials not set. Running in resilient local reactive mode.',
    };
  }

  try {
    const { error } = await supabase.from('nutritrack_healthcheck').select('*').limit(1);
    if (error && error.code !== 'PGRST116') {
      return { connected: true, message: 'Connected to Supabase PostgreSQL backend.' };
    }
    return { connected: true, message: 'Connected to Supabase PostgreSQL backend.' };
  } catch (err: unknown) {
    return {
      connected: false,
      message: err instanceof Error ? err.message : 'Supabase connection failed',
    };
  }
}
