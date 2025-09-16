
-- Add smart contract integration fields to existing tables
ALTER TABLE grants ADD COLUMN contract_address TEXT;
ALTER TABLE grants ADD COLUMN contract_deployed BOOLEAN DEFAULT FALSE;
ALTER TABLE grants ADD COLUMN blockchain_network TEXT DEFAULT 'sepolia';

-- Add IPFS integration fields to existing tables
ALTER TABLE milestones ADD COLUMN ipfs_hash TEXT;
ALTER TABLE grant_applications ADD COLUMN ipfs_attachments JSONB DEFAULT '[]'::jsonb;

-- Create analytics aggregation tables for better performance
CREATE TABLE analytics_grant_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_grants INTEGER DEFAULT 0,
  total_funding NUMERIC DEFAULT 0,
  completed_grants INTEGER DEFAULT 0,
  active_grants INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  avg_completion_time_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE analytics_milestone_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_milestones INTEGER DEFAULT 0,
  submitted_milestones INTEGER DEFAULT 0,
  approved_milestones INTEGER DEFAULT 0,
  rejected_milestones INTEGER DEFAULT 0,
  avg_approval_time_hours NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE analytics_user_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_users INTEGER DEFAULT 0,
  active_funders INTEGER DEFAULT 0,
  active_grantees INTEGER DEFAULT 0,
  active_auditors INTEGER DEFAULT 0,
  new_registrations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE analytics_governance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_votes INTEGER DEFAULT 0,
  unique_voters INTEGER DEFAULT 0,
  avg_voting_participation_rate NUMERIC DEFAULT 0,
  consensus_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better analytics query performance (without problematic DATE functions)
CREATE INDEX IF NOT EXISTS idx_grants_contract_address ON grants(contract_address);
CREATE INDEX IF NOT EXISTS idx_grants_created_at ON grants(created_at);
CREATE INDEX IF NOT EXISTS idx_milestones_ipfs_hash ON milestones(ipfs_hash);
CREATE INDEX IF NOT EXISTS idx_milestones_status_created_at ON milestones(status, created_at);
CREATE INDEX IF NOT EXISTS idx_milestone_votes_created_at ON milestone_votes(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_created_at ON user_profiles(role, created_at);

-- Add unique constraints for analytics tables to prevent duplicate entries
ALTER TABLE analytics_grant_metrics ADD CONSTRAINT unique_grant_metrics_date UNIQUE(date);
ALTER TABLE analytics_milestone_metrics ADD CONSTRAINT unique_milestone_metrics_date UNIQUE(date);
ALTER TABLE analytics_user_metrics ADD CONSTRAINT unique_user_metrics_date UNIQUE(date);
ALTER TABLE analytics_governance_metrics ADD CONSTRAINT unique_governance_metrics_date UNIQUE(date);

-- Create storage bucket for IPFS backup/cache if needed
INSERT INTO storage.buckets (id, name, public) VALUES ('ipfs-cache', 'ipfs-cache', true) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for analytics tables (read-only for all authenticated users)
ALTER TABLE analytics_grant_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_milestone_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_governance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view grant metrics" ON analytics_grant_metrics FOR SELECT USING (true);
CREATE POLICY "Anyone can view milestone metrics" ON analytics_milestone_metrics FOR SELECT USING (true);
CREATE POLICY "Anyone can view user metrics" ON analytics_user_metrics FOR SELECT USING (true);
CREATE POLICY "Anyone can view governance metrics" ON analytics_governance_metrics FOR SELECT USING (true);
