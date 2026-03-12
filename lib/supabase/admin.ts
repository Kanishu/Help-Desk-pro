import { createClient } from '@supabase/supabase-js';

// Server-side admin client that bypasses RLS
// Only use this in API routes (server-side), never on the client
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
    });
}
