// Multi-Tenant SaaS Helpdesk Types

export type Plan = 'free' | 'starter' | 'professional' | 'enterprise';
export type Role = 'admin' | 'agent' | 'customer';
export type TicketStatus = 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EmailStatus = 'pending' | 'sent' | 'failed';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  plan: Plan;
  max_agents: number;
  max_tickets_per_month: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  department: string | null;
  is_online: boolean;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  organization_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company: string | null;
  avatar_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  organization_id: string;
  ticket_number: number;
  subject: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  tags: string[];
  customer_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  due_date: string | null;
  sla_breach: boolean;
  satisfaction_rating: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer?: Customer;
  assignee?: Profile;
  creator?: Profile;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  organization_id: string;
  author_id: string | null;
  customer_id: string | null;
  content: string;
  is_internal: boolean;
  is_system: boolean;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: Profile;
  customer?: Customer;
}

export interface EmailQueueItem {
  id: string;
  organization_id: string;
  ticket_id: string | null;
  to_email: string;
  subject: string;
  body: string;
  template: string | null;
  status: EmailStatus;
  attempts: number;
  last_attempt_at: string | null;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface CannedResponse {
  id: string;
  organization_id: string;
  title: string;
  content: string;
  category: string | null;
  shortcut: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface KBArticle {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  content: string;
  category: string | null;
  is_published: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface ActivityLog {
  id: string;
  organization_id: string;
  ticket_id: string | null;
  actor_id: string | null;
  action: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  actor?: Profile;
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  avgResponseTime: number;
  satisfactionScore: number;
  ticketsByStatus: { status: TicketStatus; count: number }[];
  ticketsByPriority: { priority: TicketPriority; count: number }[];
  ticketsTrend: { date: string; count: number }[];
  topAgents: { agent: Profile; resolved: number; avgTime: number }[];
}

// Demo data for showcase
export const DEMO_TICKETS: Ticket[] = [
  {
    id: '1',
    organization_id: 'demo-org',
    ticket_number: 1001,
    subject: 'Unable to access dashboard after update',
    description: 'After the latest update, I cannot access my dashboard. Getting 403 error.',
    status: 'open',
    priority: 'high',
    category: 'Technical',
    tags: ['bug', 'urgent', 'dashboard'],
    customer_id: 'c1',
    assigned_to: 'a1',
    created_by: null,
    first_response_at: null,
    resolved_at: null,
    closed_at: null,
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    sla_breach: false,
    satisfaction_rating: null,
    metadata: {},
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    customer: {
      id: 'c1',
      organization_id: 'demo-org',
      email: 'john.doe@example.com',
      full_name: 'John Doe',
      phone: '+1 555-0123',
      company: 'Acme Corp',
      avatar_url: null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    assignee: {
      id: 'a1',
      organization_id: 'demo-org',
      email: 'sarah@support.com',
      full_name: 'Sarah Johnson',
      avatar_url: null,
      role: 'agent',
      department: 'Technical Support',
      is_online: true,
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '2',
    organization_id: 'demo-org',
    ticket_number: 1002,
    subject: 'Billing inquiry - invoice not received',
    description: 'I have not received my invoice for the last month. Please resend.',
    status: 'pending',
    priority: 'medium',
    category: 'Billing',
    tags: ['billing', 'invoice'],
    customer_id: 'c2',
    assigned_to: 'a2',
    created_by: null,
    first_response_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
    closed_at: null,
    due_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    sla_breach: false,
    satisfaction_rating: null,
    metadata: {},
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    customer: {
      id: 'c2',
      organization_id: 'demo-org',
      email: 'jane.smith@company.io',
      full_name: 'Jane Smith',
      phone: '+1 555-0456',
      company: 'Tech Solutions',
      avatar_url: null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    assignee: {
      id: 'a2',
      organization_id: 'demo-org',
      email: 'mike@support.com',
      full_name: 'Mike Chen',
      avatar_url: null,
      role: 'agent',
      department: 'Billing',
      is_online: true,
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '3',
    organization_id: 'demo-org',
    ticket_number: 1003,
    subject: 'Feature request: Dark mode support',
    description: 'Would love to have a dark mode option for the application.',
    status: 'in_progress',
    priority: 'low',
    category: 'Feature Request',
    tags: ['feature', 'ui', 'enhancement'],
    customer_id: 'c3',
    assigned_to: 'a1',
    created_by: null,
    first_response_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
    closed_at: null,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    sla_breach: false,
    satisfaction_rating: null,
    metadata: {},
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    customer: {
      id: 'c3',
      organization_id: 'demo-org',
      email: 'alex@startup.co',
      full_name: 'Alex Rivera',
      phone: null,
      company: 'StartupCo',
      avatar_url: null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '4',
    organization_id: 'demo-org',
    ticket_number: 1004,
    subject: 'URGENT: System down - Production issue',
    description: 'Our production environment is completely down. Need immediate assistance!',
    status: 'open',
    priority: 'urgent',
    category: 'Technical',
    tags: ['critical', 'production', 'outage'],
    customer_id: 'c4',
    assigned_to: null,
    created_by: null,
    first_response_at: null,
    resolved_at: null,
    closed_at: null,
    due_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    sla_breach: true,
    satisfaction_rating: null,
    metadata: {},
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    customer: {
      id: 'c4',
      organization_id: 'demo-org',
      email: 'cto@enterprise.com',
      full_name: 'Robert Chen',
      phone: '+1 555-9999',
      company: 'Enterprise Inc',
      avatar_url: null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '5',
    organization_id: 'demo-org',
    ticket_number: 1005,
    subject: 'How to export data to CSV?',
    description: 'I need to export my data for reporting. Where is the export option?',
    status: 'resolved',
    priority: 'low',
    category: 'General',
    tags: ['question', 'export', 'data'],
    customer_id: 'c5',
    assigned_to: 'a2',
    created_by: null,
    first_response_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    closed_at: null,
    due_date: null,
    sla_breach: false,
    satisfaction_rating: 5,
    metadata: {},
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    customer: {
      id: 'c5',
      organization_id: 'demo-org',
      email: 'data.analyst@corp.com',
      full_name: 'Emily Watson',
      phone: null,
      company: 'Data Corp',
      avatar_url: null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

export const DEMO_STATS: DashboardStats = {
  totalTickets: 1247,
  openTickets: 23,
  resolvedToday: 18,
  avgResponseTime: 2.4,
  satisfactionScore: 4.7,
  ticketsByStatus: [
    { status: 'open', count: 23 },
    { status: 'pending', count: 15 },
    { status: 'in_progress', count: 31 },
    { status: 'resolved', count: 892 },
    { status: 'closed', count: 286 },
  ],
  ticketsByPriority: [
    { priority: 'low', count: 342 },
    { priority: 'medium', count: 567 },
    { priority: 'high', count: 278 },
    { priority: 'urgent', count: 60 },
  ],
  ticketsTrend: [
    { date: '2024-01-01', count: 45 },
    { date: '2024-01-02', count: 52 },
    { date: '2024-01-03', count: 48 },
    { date: '2024-01-04', count: 61 },
    { date: '2024-01-05', count: 55 },
    { date: '2024-01-06', count: 38 },
    { date: '2024-01-07', count: 42 },
  ],
  topAgents: [],
};
