
import { z } from 'zod';

// Grant validation schemas
export const grantSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .refine(val => val.trim().length > 0, "Title cannot be empty"),
  
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  
  category: z.string()
    .min(1, "Category is required"),
  
  total_amount: z.number()
    .positive("Amount must be positive")
    .max(1000000, "Amount cannot exceed 1,000,000"),
  
  duration_days: z.number()
    .int("Duration must be a whole number")
    .positive("Duration must be positive")
    .max(1095, "Duration cannot exceed 3 years"), // 3 years max
  
  application_deadline: z.date()
    .refine(date => date > new Date(), "Deadline must be in the future"),
});

// Milestone validation schemas
export const milestoneSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  
  deliverables: z.string()
    .min(10, "Deliverables must be at least 10 characters")
    .max(2000, "Deliverables must be less than 2000 characters"),
  
  amount: z.number()
    .positive("Amount must be positive")
    .max(1000000, "Amount cannot exceed 1,000,000"),
  
  due_date: z.date().optional(),
});

// Grant application validation
export const grantApplicationSchema = z.object({
  proposal_title: z.string()
    .min(1, "Proposal title is required")
    .max(200, "Title must be less than 200 characters"),
  
  proposal_description: z.string()
    .min(50, "Proposal description must be at least 50 characters")
    .max(5000, "Description must be less than 5000 characters"),
  
  requested_amount: z.number()
    .positive("Requested amount must be positive")
    .optional(),
});

// Milestone submission validation
export const milestoneSubmissionSchema = z.object({
  proof_description: z.string()
    .min(20, "Proof description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  
  proof_url: z.string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 50 * 1024 * 1024, "File size cannot exceed 50MB")
    .refine(
      file => [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'text/markdown'
      ].includes(file.type),
      "File type not supported"
    ),
});

// Wallet address validation
export const walletAddressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

// IPFS hash validation
export const ipfsHashSchema = z.string()
  .regex(/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/, "Invalid IPFS hash");

// Input sanitization helper
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove basic HTML chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000 // 1 minute
): boolean => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
};
