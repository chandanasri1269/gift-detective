import { z } from "zod";

// ==========================================
// Authentication Schemas
// ==========================================
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ==========================================
// Recipient Schemas
// ==========================================
export const recipientSchema = z.object({
  name: z.string().min(1, "Recipient name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  age: z.coerce.number().int().positive().optional().nullable(),
  gender: z.string().optional().nullable(),
  interests: z.array(z.string()).default([]),
  personalityTraits: z.array(z.string()).default([]),
  favoriteColors: z.array(z.string()).default([]),
  likes: z.array(z.string()).default([]),
  dislikes: z.string().optional().nullable(),
  budgetMin: z.coerce.number().nonnegative().optional().nullable(),
  budgetMax: z.coerce.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateRecipientSchema = recipientSchema.partial();

// ==========================================
// Occasion Schemas
// ==========================================
export const occasionSchema = z.object({
  recipientId: z.string().min(1, "Recipient ID is required"),
  title: z.string().min(1, "Occasion title is required"),
  type: z.string().min(1, "Occasion type is required"),
  date: z.coerce.date(),
  budget: z.coerce.number().positive().optional().nullable(),
});

export const updateOccasionSchema = occasionSchema.partial().omit({ recipientId: true });

// ==========================================
// Gift Query Schemas
// ==========================================
export const giftQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  vibe: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ==========================================
// Quiz & Recommendation Schemas
// ==========================================
export const quizAnalyzeSchema = z.object({
  recipient: z.object({
    name: z.string().optional().default("the recipient"),
    relationship: z.string().optional().default("Friend"),
    age: z.coerce.number().int().positive().optional(),
    gender: z.string().optional(),
    interests: z.array(z.string()).default([]),
    personalityTraits: z.array(z.string()).default([]),
    favoriteColors: z.array(z.string()).default([]),
    likes: z.array(z.string()).default([]),
    dislikes: z.union([z.string(), z.array(z.string())]).default([]),
  }),
  occasion: z
    .object({
      type: z.string().default("General"),
      title: z.string().optional(),
      date: z.coerce.date().optional(),
    })
    .optional()
    .default({ type: "General" }),
  budget: z
    .object({
      min: z.coerce.number().nonnegative().optional(),
      max: z.coerce.number().positive().optional(),
    })
    .optional()
    .default({}),
});

// ==========================================
// Saved Gift Schemas
// ==========================================
export const savedGiftSchema = z.object({
  giftIdeaId: z.string().min(1, "Gift Idea ID is required"),
  recipientId: z.string().optional().nullable(),
  status: z.enum(["CONSIDERING", "PURCHASED", "ARCHIVED"]).default("CONSIDERING"),
  customNotes: z.string().optional().nullable(),
});

export const updateSavedGiftSchema = z.object({
  status: z.enum(["CONSIDERING", "PURCHASED", "ARCHIVED"]).optional(),
  customNotes: z.string().optional().nullable(),
});
