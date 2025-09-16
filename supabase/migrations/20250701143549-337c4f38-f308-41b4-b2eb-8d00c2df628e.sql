
-- Phase 1: Implement comprehensive Row Level Security (RLS) policies

-- First, let's create a security definer function to check user roles safely
CREATE OR REPLACE FUNCTION public.get_user_role(user_wallet TEXT)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_profiles 
  WHERE wallet_address = LOWER(user_wallet)
  LIMIT 1;
$$;

-- Function to check if user is grant participant (funder or grantee)
CREATE OR REPLACE FUNCTION public.is_grant_participant(grant_id UUID, user_wallet TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.grants 
    WHERE id = grant_id 
    AND (funder_wallet = LOWER(user_wallet) OR grantee_wallet = LOWER(user_wallet))
  );
$$;

-- Function to check if user is milestone reviewer (funder or auditor)
CREATE OR REPLACE FUNCTION public.can_review_milestone(milestone_id UUID, user_wallet TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.milestones m
    JOIN public.grants g ON m.grant_id = g.id
    WHERE m.id = milestone_id 
    AND (g.funder_wallet = LOWER(user_wallet) 
         OR public.get_user_role(user_wallet) = 'auditor')
  );
$$;

-- Update RLS policies for grants table
DROP POLICY IF EXISTS "Anyone can view active grants" ON public.grants;
DROP POLICY IF EXISTS "Funders can create grants" ON public.grants;
DROP POLICY IF EXISTS "Funders can update their grants" ON public.grants;

CREATE POLICY "Public can view active grants"
ON public.grants FOR SELECT
USING (status IN ('active', 'in_progress', 'completed'));

CREATE POLICY "Authenticated users can create grants"
ON public.grants FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'wallet_address' IS NOT NULL);

CREATE POLICY "Funders can update their grants"
ON public.grants FOR UPDATE
TO authenticated
USING (funder_wallet = LOWER(auth.jwt() ->> 'wallet_address'));

CREATE POLICY "Grant participants can view all grant details"
ON public.grants FOR SELECT
TO authenticated
USING (
  funder_wallet = LOWER(auth.jwt() ->> 'wallet_address') 
  OR grantee_wallet = LOWER(auth.jwt() ->> 'wallet_address')
  OR status IN ('active', 'completed')
);

-- Update RLS policies for milestones table
DROP POLICY IF EXISTS "Anyone can view milestones" ON public.milestones;
DROP POLICY IF EXISTS "Grant funders can manage milestones" ON public.milestones;

CREATE POLICY "Public can view approved milestones"
ON public.milestones FOR SELECT
USING (status = 'approved');

CREATE POLICY "Grant participants can view milestones"
ON public.milestones FOR SELECT
TO authenticated
USING (
  public.is_grant_participant(grant_id, auth.jwt() ->> 'wallet_address')
  OR public.get_user_role(auth.jwt() ->> 'wallet_address') = 'auditor'
);

CREATE POLICY "Grantees can submit milestones"
ON public.milestones FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.grants 
    WHERE id = milestones.grant_id 
    AND grantee_wallet = LOWER(auth.jwt() ->> 'wallet_address')
  )
  AND status IN ('pending', 'submitted')
);

CREATE POLICY "Reviewers can approve/reject milestones"
ON public.milestones FOR UPDATE
TO authenticated
USING (
  public.can_review_milestone(id, auth.jwt() ->> 'wallet_address')
  AND status IN ('submitted', 'under_review')
);

-- Update RLS policies for grant_applications table
DROP POLICY IF EXISTS "Anyone can view applications" ON public.grant_applications;
DROP POLICY IF EXISTS "Anyone can create applications" ON public.grant_applications;
DROP POLICY IF EXISTS "Applicants can update their applications" ON public.grant_applications;

CREATE POLICY "Grant funders can view applications"
ON public.grant_applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.grants 
    WHERE id = grant_applications.grant_id 
    AND funder_wallet = LOWER(auth.jwt() ->> 'wallet_address')
  )
);

CREATE POLICY "Applicants can view their applications"
ON public.grant_applications FOR SELECT
TO authenticated
USING (applicant_wallet = LOWER(auth.jwt() ->> 'wallet_address'));

CREATE POLICY "Authenticated users can create applications"
ON public.grant_applications FOR INSERT
TO authenticated
WITH CHECK (
  applicant_wallet = LOWER(auth.jwt() ->> 'wallet_address')
  AND EXISTS (
    SELECT 1 FROM public.grants 
    WHERE id = grant_id AND status = 'active'
  )
);

CREATE POLICY "Applicants can update pending applications"
ON public.grant_applications FOR UPDATE
TO authenticated
USING (
  applicant_wallet = LOWER(auth.jwt() ->> 'wallet_address')
  AND status = 'pending'
);

CREATE POLICY "Grant funders can review applications"
ON public.grant_applications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.grants 
    WHERE id = grant_applications.grant_id 
    AND funder_wallet = LOWER(auth.jwt() ->> 'wallet_address')
  )
  AND status IN ('pending', 'under_review')
);

-- Update RLS policies for milestone_votes table
DROP POLICY IF EXISTS "Anyone can view votes" ON public.milestone_votes;
DROP POLICY IF EXISTS "Voters can create votes" ON public.milestone_votes;
DROP POLICY IF EXISTS "Voters can update their votes" ON public.milestone_votes;

CREATE POLICY "Grant participants can view votes"
ON public.milestone_votes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.milestones m
    JOIN public.grants g ON m.grant_id = g.id
    WHERE m.id = milestone_votes.milestone_id
    AND (g.funder_wallet = LOWER(auth.jwt() ->> 'wallet_address')
         OR g.grantee_wallet = LOWER(auth.jwt() ->> 'wallet_address')
         OR public.get_user_role(auth.jwt() ->> 'wallet_address') = 'auditor')
  )
);

CREATE POLICY "Eligible users can vote on milestones"
ON public.milestone_votes FOR INSERT
TO authenticated
WITH CHECK (
  voter_wallet = LOWER(auth.jwt() ->> 'wallet_address')
  AND (public.get_user_role(auth.jwt() ->> 'wallet_address') IN ('auditor', 'funder'))
  AND EXISTS (
    SELECT 1 FROM public.milestones 
    WHERE id = milestone_id AND status = 'submitted'
  )
);

CREATE POLICY "Voters can update their votes"
ON public.milestone_votes FOR UPDATE
TO authenticated
USING (
  voter_wallet = LOWER(auth.jwt() ->> 'wallet_address')
  AND EXISTS (
    SELECT 1 FROM public.milestones 
    WHERE id = milestone_id AND status = 'submitted'
  )
);

-- Update RLS policies for user_profiles table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Anyone can view public profile info"
ON public.user_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can create their own profile"
ON public.user_profiles FOR INSERT
TO authenticated
WITH CHECK (wallet_address = LOWER(auth.jwt() ->> 'wallet_address'));

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (wallet_address = LOWER(auth.jwt() ->> 'wallet_address'));

-- Update RLS policies for notifications table
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_wallet = LOWER(auth.jwt() ->> 'wallet_address'));

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can mark their notifications as read"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_wallet = LOWER(auth.jwt() ->> 'wallet_address'))
WITH CHECK (user_wallet = LOWER(auth.jwt() ->> 'wallet_address'));

-- Create input validation constraints
ALTER TABLE public.grants 
ADD CONSTRAINT check_positive_amount CHECK (total_amount > 0),
ADD CONSTRAINT check_positive_duration CHECK (duration_days > 0),
ADD CONSTRAINT check_valid_status CHECK (status IN ('draft', 'active', 'in_progress', 'completed', 'cancelled'));

ALTER TABLE public.milestones 
ADD CONSTRAINT check_positive_milestone_amount CHECK (amount > 0),
ADD CONSTRAINT check_valid_milestone_status CHECK (status IN ('pending', 'submitted', 'under_review', 'approved', 'rejected')),
ADD CONSTRAINT check_non_negative_order CHECK (order_index >= 0);

ALTER TABLE public.grant_applications 
ADD CONSTRAINT check_valid_application_status CHECK (status IN ('pending', 'under_review', 'approved', 'rejected'));

ALTER TABLE public.milestone_votes 
ADD CONSTRAINT check_valid_vote CHECK (vote IN ('approve', 'reject')),
ADD CONSTRAINT check_positive_vote_weight CHECK (vote_weight > 0);

-- Add string length constraints for security
ALTER TABLE public.grants 
ADD CONSTRAINT check_title_length CHECK (char_length(title) BETWEEN 1 AND 200),
ADD CONSTRAINT check_description_length CHECK (char_length(description) BETWEEN 1 AND 5000);

ALTER TABLE public.milestones 
ADD CONSTRAINT check_milestone_title_length CHECK (char_length(title) BETWEEN 1 AND 200),
ADD CONSTRAINT check_milestone_description_length CHECK (char_length(description) BETWEEN 1 AND 2000);

ALTER TABLE public.user_profiles 
ADD CONSTRAINT check_name_length CHECK (name IS NULL OR char_length(name) BETWEEN 1 AND 100),
ADD CONSTRAINT check_bio_length CHECK (bio IS NULL OR char_length(bio) <= 1000);
