
-- Create storage buckets for milestone proofs and grant files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('milestone-proofs', 'milestone-proofs', true, 52428800, ARRAY['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown']),
  ('grant-files', 'grant-files', true, 52428800, ARRAY['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown']);

-- Create comprehensive storage policies
CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
USING (bucket_id IN ('milestone-proofs', 'grant-files'));

CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('milestone-proofs', 'grant-files'));

CREATE POLICY "Users can update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('milestone-proofs', 'grant-files'));

CREATE POLICY "Users can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('milestone-proofs', 'grant-files'));

-- Update milestone_votes table to support DAO voting functionality
ALTER TABLE milestone_votes ADD COLUMN IF NOT EXISTS vote_type text DEFAULT 'milestone_approval';
ALTER TABLE milestone_votes ADD COLUMN IF NOT EXISTS stake_amount numeric DEFAULT 0;
ALTER TABLE milestone_votes ADD COLUMN IF NOT EXISTS reputation_weight numeric DEFAULT 1;

-- Create voting sessions table for structured voting periods
CREATE TABLE IF NOT EXISTS voting_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid REFERENCES milestones(id) ON DELETE CASCADE,
  session_type text NOT NULL DEFAULT 'milestone_approval',
  start_time timestamp with time zone NOT NULL DEFAULT now(),
  end_time timestamp with time zone NOT NULL,
  min_votes_required integer DEFAULT 3,
  approval_threshold numeric DEFAULT 0.66,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  final_result text CHECK (final_result IN ('approved', 'rejected', 'inconclusive')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on voting_sessions
ALTER TABLE voting_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for voting_sessions
CREATE POLICY "Anyone can view voting sessions"
ON voting_sessions FOR SELECT
USING (true);

CREATE POLICY "Only funders can create voting sessions"
ON voting_sessions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM milestones m
    JOIN grants g ON m.grant_id = g.id
    WHERE m.id = milestone_id AND g.funder_wallet = auth.jwt() ->> 'wallet_address'
  )
);

-- Update user_profiles to include voting power and reputation
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS voting_power numeric DEFAULT 1;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stake_amount numeric DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_activity timestamp with time zone DEFAULT now();

-- Create notifications table for real-time updates
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean DEFAULT false,
  related_grant_id uuid REFERENCES grants(id) ON DELETE CASCADE,
  related_milestone_id uuid REFERENCES milestones(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (user_wallet = auth.jwt() ->> 'wallet_address');

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (user_wallet = auth.jwt() ->> 'wallet_address');
