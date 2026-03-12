-- Enable Row Level Security on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canned_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Organizations Policies
CREATE POLICY "org_select_own" ON public.organizations
  FOR SELECT USING (id = public.get_user_organization_id());

CREATE POLICY "org_update_admin" ON public.organizations
  FOR UPDATE USING (
    id = public.get_user_organization_id() 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Profiles Policies (users can see other users in same org)
CREATE POLICY "profiles_select_org" ON public.profiles
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Customers Policies (only visible within same organization)
CREATE POLICY "customers_select_org" ON public.customers
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "customers_insert_org" ON public.customers
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "customers_update_org" ON public.customers
  FOR UPDATE USING (organization_id = public.get_user_organization_id());

CREATE POLICY "customers_delete_org" ON public.customers
  FOR DELETE USING (organization_id = public.get_user_organization_id());

-- Tickets Policies (strict tenant isolation)
CREATE POLICY "tickets_select_org" ON public.tickets
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "tickets_insert_org" ON public.tickets
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "tickets_update_org" ON public.tickets
  FOR UPDATE USING (organization_id = public.get_user_organization_id());

CREATE POLICY "tickets_delete_admin" ON public.tickets
  FOR DELETE USING (
    organization_id = public.get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ticket Comments Policies
CREATE POLICY "comments_select_org" ON public.ticket_comments
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "comments_insert_org" ON public.ticket_comments
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "comments_update_own" ON public.ticket_comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "comments_delete_admin" ON public.ticket_comments
  FOR DELETE USING (
    author_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Email Queue Policies
CREATE POLICY "email_select_org" ON public.email_queue
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "email_insert_org" ON public.email_queue
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());

-- Canned Responses Policies
CREATE POLICY "canned_select_org" ON public.canned_responses
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "canned_insert_org" ON public.canned_responses
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "canned_update_org" ON public.canned_responses
  FOR UPDATE USING (organization_id = public.get_user_organization_id());

CREATE POLICY "canned_delete_org" ON public.canned_responses
  FOR DELETE USING (organization_id = public.get_user_organization_id());

-- KB Articles Policies
CREATE POLICY "kb_select_org" ON public.kb_articles
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "kb_insert_org" ON public.kb_articles
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "kb_update_org" ON public.kb_articles
  FOR UPDATE USING (organization_id = public.get_user_organization_id());

CREATE POLICY "kb_delete_org" ON public.kb_articles
  FOR DELETE USING (organization_id = public.get_user_organization_id());

-- Activity Logs Policies
CREATE POLICY "activity_select_org" ON public.activity_logs
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "activity_insert_org" ON public.activity_logs
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());
