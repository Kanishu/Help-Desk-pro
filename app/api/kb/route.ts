import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('kb_articles')
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
            .from('kb_articles')
            .insert({
                organization_id: DEMO_ORG_ID,
                title: body.title,
                slug: body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                content: body.content,
                category: body.category || null,
                is_published: true,
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
