import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('organizations')
            .select('name, settings')
            .eq('id', DEMO_ORG_ID)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const supabase = createAdminClient();

        const updateData: Record<string, any> = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.settings !== undefined) updateData.settings = body.settings;

        const { data, error } = await supabase
            .from('organizations')
            .update(updateData)
            .eq('id', DEMO_ORG_ID)
            .select('name, settings')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
