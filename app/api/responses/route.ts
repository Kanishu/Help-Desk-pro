import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('canned_responses')
            .select('*')
            .eq('organization_id', DEMO_ORG_ID)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('canned_responses')
            .insert({
                organization_id: DEMO_ORG_ID,
                title: body.title,
                content: body.content,
                category: body.category || null,
                shortcut: body.shortcut || null,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
