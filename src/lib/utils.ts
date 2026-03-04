import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date range
 */
export function formatDateRange(start: Date | string, end: Date | string): string {
  return `${formatDate(start)} — ${formatDate(end)}`;
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Calculate profile completion percentage
 */
export function calculateProfileCompletion(profile: Record<string, unknown>): number {
  const fields = ["sport", "position", "bio", "height", "weight", "experienceYears", "nationality", "city"];
  const filled = fields.filter((field) => profile[field] !== null && profile[field] !== undefined && profile[field] !== "");
  return Math.round((filled.length / fields.length) * 100);
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Delay for simulating loading states in dev
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
