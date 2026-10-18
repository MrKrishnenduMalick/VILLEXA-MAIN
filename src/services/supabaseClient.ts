import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key-here')
);

/**
 * Singleton Supabase Client
 * Gated by Row Level Security (RLS) on PostgreSQL and Supabase Storage.
 */
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

/**
 * Verifies if the currently authenticated session belongs to an authorized admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Direct security definer function call or app_admins check
    const { data, error } = await supabase.rpc('is_admin');
    if (error || data !== true) {
      // Fallback: check app_admins table directly with RLS
      const { data: adminRecord, error: adminErr } = await supabase
        .from('app_admins')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (adminErr || !adminRecord) return false;
      return true;
    }
    return Boolean(data);
  } catch (err) {
    console.error('Failed to verify admin status:', err);
    return false;
  }
}
