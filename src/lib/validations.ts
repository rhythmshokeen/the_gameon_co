import { z } from "zod";

// ─── Auth Schemas ──────────────────────────────────────

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["ATHLETE", "COACH", "ORGANIZER"], {
    message: "Please select a role",
  }),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Profile Schemas ───────────────────────────────────

export const athleteProfileSchema = z.object({
  sport: z.string().min(1, "Sport is required").max(100),
  position: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  height: z.coerce.number().min(50).max(300).optional(),
  weight: z.coerce.number().min(20).max(300).optional(),
  experienceYears: z.coerce.number().min(0).max(50).optional(),
  nationality: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
});

// ─── Performance Stat Schema ───────────────────────────

export const performanceStatSchema = z.object({
  metricName: z.string().min(1, "Metric name is required").max(100),
  metricValue: z.string().min(1, "Value is required").max(50),
  unit: z.string().max(30).optional(),
});

// ─── Achievement Schema ────────────────────────────────

export const achievementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  date: z.string().optional(),
});

// ─── Media Schema ──────────────────────────────────────

export const mediaHighlightSchema = z.object({
  mediaUrl: z.string().url("Must be a valid URL"),
  mediaType: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]),
  title: z.string().max(200).optional(),
});

// ─── Competition Schemas ───────────────────────────────

export const competitionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  sport: z.string().min(1, "Sport is required"),
  location: z.string().min(1, "Location is required").max(200),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  level: z.enum(["Amateur", "Semi-Pro", "Professional", "Open"]),
  description: z.string().max(5000).optional(),
  maxParticipants: z.coerce.number().min(1).optional(),
  entryFee: z.coerce.number().min(0).optional(),
  prizeInfo: z.string().max(500).optional(),
});

// ─── Application Schema ────────────────────────────────

export const applicationSchema = z.object({
  competitionId: z.string().min(1, "Competition ID is required"),
  message: z.string().max(1000).optional(),
});

// ─── Search Schema ─────────────────────────────────────

export const searchSchema = z.object({
  query: z.string().min(1).max(200),
  type: z.enum(["all", "athletes", "competitions", "organizers"]).optional(),
});

// ─── Type exports ──────────────────────────────────────

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type AthleteProfileInput = z.infer<typeof athleteProfileSchema>;
export type PerformanceStatInput = z.infer<typeof performanceStatSchema>;
export type AchievementInput = z.infer<typeof achievementSchema>;
export type MediaHighlightInput = z.infer<typeof mediaHighlightSchema>;
export type CompetitionInput = z.infer<typeof competitionSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
