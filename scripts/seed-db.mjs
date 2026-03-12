// Seed the Supabase database with demo data
// Run with: node scripts/seed-db.mjs

const SUPABASE_URL = 'https://nztqhxsgxsejzzctomsv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56dHFoeHNneHNlanp6Y3RvbXN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc3MzA3MywiZXhwIjoyMDg4MzQ5MDczfQ.HD80n71b_6eq1JOdVl8aeiRm9wQumZTUizB3DJDEMVU';

const headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
};

async function seed() {
    console.log('🌱 Seeding Supabase database...\n');

    // 1. Create demo organization
    console.log('1. Creating demo organization...');
    let res = await fetch(`${SUPABASE_URL}/rest/v1/organizations`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation,resolution=merge-duplicates' },
        body: JSON.stringify({
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Demo Company',
            slug: 'demo',
            plan: 'professional',
            max_agents: 10,
            max_tickets_per_month: 1000,
        }),
    });
    if (!res.ok) {
        const text = await res.text();
        console.log('  Org result:', res.status, text);
    } else {
        console.log('  ✅ Organization created');
    }

    // 2. Seed customers
    console.log('2. Seeding customers...');
    const customers = [
        { organization_id: '00000000-0000-0000-0000-000000000001', email: 'john.doe@example.com', full_name: 'John Doe', company: 'Acme Corp' },
        { organization_id: '00000000-0000-0000-0000-000000000001', email: 'jane.smith@example.com', full_name: 'Jane Smith', company: 'Tech Solutions' },
        { organization_id: '00000000-0000-0000-0000-000000000001', email: 'bob.wilson@example.com', full_name: 'Bob Wilson', company: 'Global Industries' },
        { organization_id: '00000000-0000-0000-0000-000000000001', email: 'alice.johnson@example.com', full_name: 'Alice Johnson', company: 'StartupXYZ' },
        { organization_id: '00000000-0000-0000-0000-000000000001', email: 'charlie.brown@example.com', full_name: 'Charlie Brown', company: 'Design Studio' },
    ];

    for (const cust of customers) {
        res = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal,resolution=ignore-duplicates' },
            body: JSON.stringify(cust),
        });
        if (!res.ok && res.status !== 409) {
            console.log(`  ⚠️ Customer ${cust.email}:`, res.status, await res.text());
        }
    }
    console.log('  ✅ Customers seeded');

    // 3. Seed tickets
    console.log('3. Seeding demo tickets...');
    // First get customer IDs
    res = await fetch(`${SUPABASE_URL}/rest/v1/customers?organization_id=eq.00000000-0000-0000-0000-000000000001&select=id,email`, {
        headers,
    });
    const customerList = await res.json();
    const customerMap = {};
    for (const c of customerList) customerMap[c.email] = c.id;

    const tickets = [
        { subject: 'Unable to access dashboard after update', description: 'After the latest update, I cannot access my dashboard. Getting 403 error.', status: 'open', priority: 'high', category: 'Technical', tags: ['bug', 'urgent', 'dashboard'], customer_id: customerMap['john.doe@example.com'] },
        { subject: 'Billing inquiry - invoice not received', description: 'I have not received my invoice for the last month. Please resend.', status: 'pending', priority: 'medium', category: 'Billing', tags: ['billing', 'invoice'], customer_id: customerMap['jane.smith@example.com'] },
        { subject: 'Feature request: Dark mode support', description: 'Would love to have a dark mode option for the application.', status: 'in_progress', priority: 'low', category: 'Feature Request', tags: ['feature', 'ui', 'enhancement'], customer_id: customerMap['bob.wilson@example.com'] },
        { subject: 'URGENT: System down - Production issue', description: 'Our production environment is completely down. Need immediate assistance!', status: 'open', priority: 'urgent', category: 'Technical', tags: ['critical', 'production', 'outage'], sla_breach: true, customer_id: customerMap['alice.johnson@example.com'] },
        { subject: 'How to export data to CSV?', description: 'I need to export my data for reporting. Where is the export option?', status: 'resolved', priority: 'low', category: 'General', tags: ['question', 'export', 'data'], customer_id: customerMap['charlie.brown@example.com'] },
    ];

    for (const ticket of tickets) {
        res = await fetch(`${SUPABASE_URL}/rest/v1/tickets`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
                organization_id: '00000000-0000-0000-0000-000000000001',
                ...ticket,
            }),
        });
        if (!res.ok) {
            console.log(`  ⚠️ Ticket "${ticket.subject}":`, res.status, await res.text());
        }
    }
    console.log('  ✅ Tickets seeded');

    // 4. Seed canned responses
    console.log('4. Seeding canned responses...');
    const cannedResponses = [
        { title: 'Greeting', content: 'Hello! Thank you for reaching out to our support team. How can I help you today?', category: 'General', shortcut: '/greet' },
        { title: 'Password Reset', content: 'To reset your password, please visit our password reset page. If you continue to have issues, please let us know.', category: 'Account', shortcut: '/password' },
        { title: 'Escalation', content: 'I understand your concern. Let me escalate this to our senior support team who will be able to assist you further.', category: 'General', shortcut: '/escalate' },
        { title: 'Closing', content: 'Is there anything else I can help you with? If not, I will go ahead and close this ticket.', category: 'General', shortcut: '/close' },
        { title: 'Refund Request', content: 'I have processed your refund request. Please allow 5-7 business days for the amount to reflect in your account.', category: 'Billing', shortcut: '/refund' },
    ];

    for (const resp of cannedResponses) {
        res = await fetch(`${SUPABASE_URL}/rest/v1/canned_responses`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ organization_id: '00000000-0000-0000-0000-000000000001', ...resp }),
        });
        if (!res.ok) {
            console.log(`  ⚠️ Response "${resp.title}":`, res.status, await res.text());
        }
    }
    console.log('  ✅ Canned responses seeded');

    // 5. Seed KB articles
    console.log('5. Seeding KB articles...');
    const articles = [
        { title: 'Getting Started Guide', slug: 'getting-started', content: 'Welcome to our platform! This guide will help you get started with the basic features and functionalities.', category: 'Onboarding', is_published: true },
        { title: 'How to Reset Your Password', slug: 'password-reset', content: 'If you have forgotten your password, follow these steps to reset it securely.', category: 'Account', is_published: true },
        { title: 'Billing FAQ', slug: 'billing-faq', content: 'Find answers to commonly asked billing questions including payment methods, invoices, and refunds.', category: 'Billing', is_published: true },
        { title: 'Integration Guide', slug: 'integration-guide', content: 'Learn how to integrate our platform with your existing tools and services.', category: 'Technical', is_published: true },
    ];

    for (const art of articles) {
        res = await fetch(`${SUPABASE_URL}/rest/v1/kb_articles`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ organization_id: '00000000-0000-0000-0000-000000000001', ...art }),
        });
        if (!res.ok) {
            console.log(`  ⚠️ Article "${art.title}":`, res.status, await res.text());
        }
    }
    console.log('  ✅ KB articles seeded');

    console.log('\n🎉 Database seeded successfully!');
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
