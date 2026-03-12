import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
    try {
        const supabase = createAdminClient();

        // Get recent tickets as notifications
        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('id, subject, status, priority, created_at, customer:customers(full_name, email)')
            .eq('organization_id', DEMO_ORG_ID)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform tickets into notification-like items
        const notifications = (tickets || []).map((t: any) => ({
            id: t.id,
            title: `New ticket: ${t.subject}`,
            message: `From ${t.customer?.full_name || t.customer?.email || 'Unknown'} — ${t.priority} priority`,
            type: t.priority === 'urgent' ? 'urgent' : t.priority === 'high' ? 'warning' : 'info',
            read: t.status !== 'open',
            created_at: t.created_at,
        }));

        return NextResponse.json(notifications);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
