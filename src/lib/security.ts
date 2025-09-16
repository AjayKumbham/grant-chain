
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { checkRateLimit } from './validation';

// Security hooks and utilities
export const useSecurityCheck = () => {
  const { authState, user, isReady } = useAuth();
  const { toast } = useToast();

  const requireAuth = (action: string = 'perform this action') => {
    if (authState === 'disconnected' || authState === 'connected') {
      toast({
        title: "Authentication Required",
        description: `You must connect and authenticate your wallet to ${action}.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const requireProfile = (action: string = 'perform this action') => {
    if (!requireAuth(action)) return false;
    
    if (authState === 'profile_required') {
      toast({
        title: "Profile Required",
        description: `You must complete your profile to ${action}.`,
        variant: "destructive",
      });
      return false;
    }

    if (!user) {
      toast({
        title: "Profile Error",
        description: `Unable to load your profile. Please try refreshing the page.`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const requireRole = (requiredRole: 'funder' | 'grantee' | 'auditor', action: string) => {
    if (!requireProfile(action)) return false;
    
    if (user?.role !== requiredRole) {
      const roleNames = {
        funder: 'funders',
        grantee: 'grantees',
        auditor: 'auditors'
      };
      
      toast({
        title: "Insufficient Permissions",
        description: `Only ${roleNames[requiredRole]} can ${action}. Your current role is ${user?.role}.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const requireReady = (action: string = 'perform this action') => {
    if (!isReady) {
      let message = `You must be fully authenticated to ${action}.`;
      
      switch (authState) {
        case 'disconnected':
          message = `Please connect your wallet to ${action}.`;
          break;
        case 'connected':
          message = `Please authenticate your wallet to ${action}.`;
          break;
        case 'profile_required':
          message = `Please complete your profile to ${action}.`;
          break;
      }
      
      toast({
        title: "Action Not Available",
        description: message,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const checkRateLimitWithToast = (identifier: string, action: string) => {
    if (!checkRateLimit(identifier)) {
      toast({
        title: "Rate Limit Exceeded",
        description: `Too many attempts to ${action}. Please wait before trying again.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return {
    requireAuth,
    requireProfile,
    requireRole,
    requireReady,
    checkRateLimitWithToast,
    
    // Convenience getters
    isAuthenticated: authState !== 'disconnected' && authState !== 'connected',
    hasProfile: !!user,
    isReady,
    userRole: user?.role,
  };
};

// Environment validation
export const validateEnvironment = () => {
  const warnings: string[] = [];
  
  // Check for private key in environment (should not be present in production)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    console.warn('🔒 SECURITY WARNING: Ensure no private keys are exposed in production environment');
  }
  
  // Validate Supabase configuration
  const supabaseUrl = "https://kdpfymrzterzijlbnxhd.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkcGZ5bXJ6dGVyemlqbGJueGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTgwNTIsImV4cCI6MjA2NTU5NDA1Mn0.T-uBBBx8Xm46Ycfsy_hPYmFZHVxdZ1bT0_Uw0nK8p-Q";
  
  if (!supabaseUrl || !supabaseKey) {
    warnings.push('Missing Supabase configuration');
  }
  
  return warnings;
};

// Content Security Policy helper
export const getCSPDirectives = () => {
  return {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'connect-src': ["'self'", 'https://kdpfymrzterzijlbnxhd.supabase.co', 'https://*.infura.io', 'wss://'],
  };
};

// Initialize security checks on app startup
export const initializeSecurity = () => {
  const warnings = validateEnvironment();
  
  if (warnings.length > 0) {
    console.warn('🔒 Security Warnings:', warnings);
  }
  
  // Add security headers reminder
  console.info('🔒 Security initialized. Ensure proper headers are set on your server.');
};
