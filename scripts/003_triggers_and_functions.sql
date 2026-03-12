-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_ticket_comments_updated_at
  BEFORE UPDATE ON public.ticket_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_canned_responses_updated_at
  BEFORE UPDATE ON public.canned_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_kb_articles_updated_at
  BEFORE UPDATE ON public.kb_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to auto-queue email on ticket creation
CREATE OR REPLACE FUNCTION public.queue_ticket_notification()
RETURNS TRIGGER AS $$
DECLARE
  customer_email TEXT;
  org_name TEXT;
BEGIN
  -- Get customer email
  SELECT email INTO customer_email FROM public.customers WHERE id = NEW.customer_id;
  SELECT name INTO org_name FROM public.organizations WHERE id = NEW.organization_id;
  
  IF customer_email IS NOT NULL THEN
    INSERT INTO public.email_queue (
      organization_id,
      ticket_id,
      to_email,
      subject,
      body,
      template
    ) VALUES (
      NEW.organization_id,
      NEW.id,
      customer_email,
      'Ticket #' || NEW.ticket_number || ' Created: ' || NEW.subject,
      'Your support request has been received. We will get back to you shortly.',
      'ticket_created'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ticket_created
  AFTER INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.queue_ticket_notification();

-- Function to log ticket status changes
CREATE OR REPLACE FUNCTION public.log_ticket_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.activity_logs (
      organization_id,
      ticket_id,
      actor_id,
      action,
      details
    ) VALUES (
      NEW.organization_id,
      NEW.id,
      auth.uid(),
      'status_changed',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
    
    -- Set resolved_at if status changed to resolved
    IF NEW.status = 'resolved' THEN
      NEW.resolved_at = NOW();
    END IF;
    
    -- Set closed_at if status changed to closed
    IF NEW.status = 'closed' THEN
      NEW.closed_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ticket_status_change
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.log_ticket_status_change();

-- Function to set first response time
CREATE OR REPLACE FUNCTION public.set_first_response_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_internal = FALSE AND NEW.author_id IS NOT NULL THEN
    UPDATE public.tickets
    SET first_response_at = NOW()
    WHERE id = NEW.ticket_id 
      AND first_response_at IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ticket_comment_created
  AFTER INSERT ON public.ticket_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_first_response_time();

-- Function to handle new user signup (creates profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
