-- Seed Demo Organization (for testing/demo purposes)
INSERT INTO public.organizations (id, name, slug, plan, max_agents, max_tickets_per_month)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Company',
  'demo',
  'professional',
  10,
  1000
) ON CONFLICT (slug) DO NOTHING;

-- Seed Demo Customers
INSERT INTO public.customers (organization_id, email, full_name, company)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'john.doe@example.com', 'John Doe', 'Acme Corp'),
  ('00000000-0000-0000-0000-000000000001', 'jane.smith@example.com', 'Jane Smith', 'Tech Solutions'),
  ('00000000-0000-0000-0000-000000000001', 'bob.wilson@example.com', 'Bob Wilson', 'Global Industries'),
  ('00000000-0000-0000-0000-000000000001', 'alice.johnson@example.com', 'Alice Johnson', 'StartupXYZ'),
  ('00000000-0000-0000-0000-000000000001', 'charlie.brown@example.com', 'Charlie Brown', 'Design Studio')
ON CONFLICT (organization_id, email) DO NOTHING;

-- Seed Canned Responses
INSERT INTO public.canned_responses (organization_id, title, content, category, shortcut)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Greeting', 'Hello! Thank you for reaching out to our support team. How can I help you today?', 'General', '/greet'),
  ('00000000-0000-0000-0000-000000000001', 'Password Reset', 'To reset your password, please visit our password reset page at [link]. If you continue to have issues, please let us know.', 'Account', '/password'),
  ('00000000-0000-0000-0000-000000000001', 'Escalation', 'I understand your concern. Let me escalate this to our senior support team who will be able to assist you further. You should hear back within 24 hours.', 'General', '/escalate'),
  ('00000000-0000-0000-0000-000000000001', 'Closing', 'Is there anything else I can help you with? If not, I''ll go ahead and close this ticket. Feel free to reopen it if you have any further questions!', 'General', '/close'),
  ('00000000-0000-0000-0000-000000000001', 'Refund Request', 'I''ve processed your refund request. Please allow 5-7 business days for the amount to reflect in your account. Thank you for your patience.', 'Billing', '/refund')
ON CONFLICT DO NOTHING;

-- Seed Knowledge Base Articles
INSERT INTO public.kb_articles (organization_id, title, slug, content, category, is_published)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Getting Started Guide', 'getting-started', 'Welcome to our platform! This guide will help you get started with the basic features and functionalities...', 'Onboarding', true),
  ('00000000-0000-0000-0000-000000000001', 'How to Reset Your Password', 'password-reset', 'If you''ve forgotten your password, follow these steps to reset it securely...', 'Account', true),
  ('00000000-0000-0000-0000-000000000001', 'Billing FAQ', 'billing-faq', 'Find answers to commonly asked billing questions including payment methods, invoices, and refunds...', 'Billing', true),
  ('00000000-0000-0000-0000-000000000001', 'Integration Guide', 'integration-guide', 'Learn how to integrate our platform with your existing tools and services...', 'Technical', true)
ON CONFLICT (organization_id, slug) DO NOTHING;
