
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, AlertCircle, Loader2 } from 'lucide-react';

const profileSchema = z.object({
  role: z.enum(['funder', 'grantee', 'auditor'], {
    required_error: "Please select a role",
  }),
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .refine(val => val.trim().length > 0, "Name cannot be empty"),
  bio: z.string()
    .max(1000, "Bio must be less than 1000 characters")
    .optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileSetup: React.FC = () => {
  const { createProfile, loading, error, authState } = useAuth();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      bio: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (authState !== 'profile_required') {
      return;
    }

    await createProfile({
      role: data.role,
      name: data.name.trim(),
      bio: data.bio?.trim(),
    });
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'funder':
        return 'Create and fund grants, review applications, and monitor project progress';
      case 'grantee':
        return 'Apply for grants, submit milestones, and receive funding for your projects';
      case 'auditor':
        return 'Review milestone submissions, participate in voting, and help maintain quality';
      default:
        return '';
    }
  };

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader className="text-center">
        <User className="w-12 h-12 mx-auto mb-4 text-green-500" />
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Set up your profile to start participating in the GrantChain ecosystem
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Role *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your primary role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="funder">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Funder</span>
                          <span className="text-xs text-muted-foreground">Fund and manage grants</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="grantee">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Grantee</span>
                          <span className="text-xs text-muted-foreground">Apply for and execute projects</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="auditor">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Auditor</span>
                          <span className="text-xs text-muted-foreground">Review and vote on milestones</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {field.value && (
                    <FormDescription className="text-sm">
                      {getRoleDescription(field.value)}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your name or organization" 
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be displayed publicly on your profile and grant activities.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself, your experience, or your organization..."
                      className="min-h-[100px] resize-none"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    Share your background, expertise, or goals. This helps others understand your experience.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || authState !== 'profile_required'}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Create Profile & Continue'
                )}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-6 text-xs text-muted-foreground text-center">
          You can update your profile information later in your account settings.
        </div>
      </CardContent>
    </Card>
  );
};
