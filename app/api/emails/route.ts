import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('email_queue')
            .select('*')
            .eq('organization_id', DEMO_ORG_ID)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
