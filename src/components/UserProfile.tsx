
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Star, 
  TrendingUp, 
  Award,
  Wallet
} from 'lucide-react';

interface UserProfileProps {
  walletAddress?: string;
  editable?: boolean;
}

export const UserProfile = ({ walletAddress, editable = false }: UserProfileProps) => {
  const { address } = useAccount();
  const { profile, loading, createProfile, updateProfile } = useProfile(walletAddress);
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(!profile);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    role: profile?.role || 'grantee' as 'funder' | 'grantee' | 'auditor',
  });

  const isOwnProfile = !walletAddress || address?.toLowerCase() === walletAddress?.toLowerCase();

  const handleSave = async () => {
    try {
      if (profile) {
        await updateProfile(formData);
      } else {
        await createProfile(formData);
      }

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to Save Profile",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      bio: profile?.bio || '',
      role: profile?.role || 'grantee',
    });
    setIsEditing(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'funder': return <Badge className="bg-blue-500">Funder</Badge>;
      case 'grantee': return <Badge className="bg-green-500">Grantee</Badge>;
      case 'auditor': return <Badge className="bg-purple-500">Auditor</Badge>;
      default: return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile
          </CardTitle>
          {isOwnProfile && editable && !isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Wallet Address */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Wallet className="w-4 h-4 text-gray-500" />
          <span className="font-mono text-sm">
            {(walletAddress || address)?.slice(0, 6)}...{(walletAddress || address)?.slice(-4)}
          </span>
        </div>

        {!profile && !isEditing ? (
          <div className="text-center py-6">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Profile Found</h3>
            <p className="text-gray-600 mb-4">
              {isOwnProfile ? 'Create your profile to get started.' : 'This user has not created a profile yet.'}
            </p>
            {isOwnProfile && (
              <Button onClick={() => setIsEditing(true)}>
                Create Profile
              </Button>
            )}
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'funder' | 'grantee' | 'auditor') => 
                  setFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="funder">Funder - Provide grants and funding</SelectItem>
                  <SelectItem value="grantee">Grantee - Apply for and execute grants</SelectItem>
                  <SelectItem value="auditor">Auditor - Review and vote on milestones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="mt-2"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Profile Information */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">{profile.name || 'Anonymous User'}</h3>
                {getRoleBadge(profile.role)}
              </div>
              {profile.bio && (
                <p className="text-gray-600">{profile.bio}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-lg font-semibold">{profile.reputation_score}</div>
                <div className="text-xs text-gray-500">Reputation</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-lg font-semibold">{profile.voting_power}</div>
                <div className="text-xs text-gray-500">Voting Power</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Award className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-lg font-semibold">${profile.stake_amount}</div>
                <div className="text-xs text-gray-500">Stake</div>
              </div>
            </div>

            {/* Member Since */}
            <div className="text-center text-sm text-gray-500 pt-2 border-t">
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
