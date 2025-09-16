
-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('funder', 'grantee', 'auditor')) NOT NULL,
  name TEXT,
  bio TEXT,
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create grants table
CREATE TABLE public.grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  total_amount DECIMAL(20,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  funder_wallet TEXT NOT NULL,
  grantee_wallet TEXT,
  status TEXT CHECK (status IN ('draft', 'active', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
  application_deadline TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create milestones table
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES public.grants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(20,2) NOT NULL,
  deliverables TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'submitted', 'under_review', 'approved', 'rejected')) DEFAULT 'pending',
  order_index INTEGER NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  proof_url TEXT,
  proof_description TEXT,
  reviewer_wallet TEXT,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create grant applications table
CREATE TABLE public.grant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES public.grants(id) ON DELETE CASCADE,
  applicant_wallet TEXT NOT NULL,
  proposal_title TEXT NOT NULL,
  proposal_description TEXT NOT NULL,
  requested_amount DECIMAL(20,2),
  status TEXT CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')) DEFAULT 'pending',
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_wallet TEXT,
  review_notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table for DAO governance
CREATE TABLE public.milestone_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE,
  voter_wallet TEXT NOT NULL,
  vote TEXT CHECK (vote IN ('approve', 'reject')) NOT NULL,
  reasoning TEXT,
  vote_weight INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(milestone_id, voter_wallet)
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- RLS Policies for grants
CREATE POLICY "Anyone can view active grants" ON public.grants FOR SELECT USING (true);
CREATE POLICY "Funders can create grants" ON public.grants FOR INSERT WITH CHECK (true);
CREATE POLICY "Funders can update their grants" ON public.grants FOR UPDATE USING (funder_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- RLS Policies for milestones
CREATE POLICY "Anyone can view milestones" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "Grant funders can manage milestones" ON public.milestones FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.grants 
    WHERE grants.id = milestones.grant_id 
    AND grants.funder_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address'
  )
);

-- RLS Policies for grant applications
CREATE POLICY "Anyone can view applications" ON public.grant_applications FOR SELECT USING (true);
CREATE POLICY "Anyone can create applications" ON public.grant_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Applicants can update their applications" ON public.grant_applications FOR UPDATE USING (applicant_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- RLS Policies for milestone votes
CREATE POLICY "Anyone can view votes" ON public.milestone_votes FOR SELECT USING (true);
CREATE POLICY "Voters can create votes" ON public.milestone_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Voters can update their votes" ON public.milestone_votes FOR UPDATE USING (voter_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create indexes for better performance
CREATE INDEX idx_grants_funder_wallet ON public.grants(funder_wallet);
CREATE INDEX idx_grants_status ON public.grants(status);
CREATE INDEX idx_milestones_grant_id ON public.milestones(grant_id);
CREATE INDEX idx_grant_applications_grant_id ON public.grant_applications(grant_id);
CREATE INDEX idx_milestone_votes_milestone_id ON public.milestone_votes(milestone_id);
