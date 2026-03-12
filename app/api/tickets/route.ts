import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: userData } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        if (!userData?.organization_id) {
            return NextResponse.json({ error: 'User does not belong to an organization' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('tickets')
            .select('*, customer:customers(*)')
            .eq('organization_id', userData.organization_id)
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
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: userData } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        if (!userData?.organization_id) {
            return NextResponse.json({ error: 'User does not belong to an organization' }, { status: 403 });
        }

        const organization_id = userData.organization_id;

        // Upsert customer first
        let customerId: string | null = null;
        if (body.customer_email) {
            const { data: existingCustomer } = await supabase
                .from('customers')
                .select('id')
                .eq('organization_id', organization_id)
                .eq('email', body.customer_email)
                .single();

            if (existingCustomer) {
                customerId = existingCustomer.id;
            } else {
                const { data: newCustomer, error: custErr } = await supabase
                    .from('customers')
                    .insert({
                        organization_id: organization_id,
                        email: body.customer_email,
                        full_name: body.customer_email.split('@')[0],
                    })
                    .select('id')
                    .single();

                if (custErr) {
                    return NextResponse.json({ error: 'Failed to create customer: ' + custErr.message }, { status: 500 });
                }
                customerId = newCustomer?.id ?? null;
            }
        }

        // Insert ticket
        const { data: ticket, error } = await supabase
            .from('tickets')
            .insert({
                organization_id: organization_id,
                subject: body.subject,
                description: body.description,
                priority: body.priority || 'medium',
                category: body.category || null,
                customer_id: customerId,
                status: 'open',
                tags: body.tags || [],
            })
            .select('*, customer:customers(*)')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(ticket, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
