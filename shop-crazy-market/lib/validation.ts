/**
 * Input validation utilities
 * Simple validation functions for common use cases
 * For more complex validation, consider using Zod
 */

import { z } from "zod";

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePrice(price: number | string): boolean {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return !isNaN(numPrice) && numPrice > 0 && numPrice <= 1000000; // Max $10,000
}

export function validateQuantity(quantity: number | string): boolean {
  const numQty = typeof quantity === "string" ? parseInt(quantity) : quantity;
  return !isNaN(numQty) && numQty > 0 && numQty <= 10000;
}

export function sanitizeString(input: string, maxLength: number = 1000): string {
  // Remove potentially dangerous characters and limit length
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .trim()
    .slice(0, maxLength);
}

export function sanitizeFilename(filename: string): string {
  // Remove dangerous characters from filenames
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.\./g, "_") // Prevent directory traversal
    .slice(0, 255); // Max filename length
}

export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateCheckoutItems(items: any[]): ValidationResult {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, error: "Items array is required and cannot be empty" };
  }

  for (const item of items) {
    if (!item.productId || typeof item.productId !== "string") {
      return { valid: false, error: "Each item must have a valid productId" };
    }
    if (!validatePrice(item.price)) {
      return { valid: false, error: "Each item must have a valid price" };
    }
    if (!validateQuantity(item.quantity)) {
      return { valid: false, error: "Each item must have a valid quantity" };
    }
  }

  return { valid: true };
}

// Listing validation
export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const fileKeyOrUrl = z.string().min(1, "File is required"); // <-- NO regex pattern

export const createListingSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(2).max(5000),
  priceCents: z.coerce.number().int().nonnegative().max(10_000_000),
  currency: z.string().optional().default("usd"),
  category: z.string().optional(),
  images: z.array(z.string().min(1)).optional().default([]),
  thumbnails: z.array(z.string().min(1)).optional().default([]),
  // ✅ Accept keys OR URLs - optional, but if provided must have at least 1
  digitalFiles: z.array(fileKeyOrUrl).min(1, "Upload at least 1 digital file").optional(),
  // SEO & Discovery
  tags: z.array(z.string()).optional().default([]),
  searchKeywords: z.string().max(200).optional(),
  metaDescription: z.string().max(160).optional(),
  // Product Attributes
  sku: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  materials: z.string().max(200).optional(),
  dimensions: z.string().max(100).optional(),
  weight: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  countryOfOrigin: z.string().max(100).optional(),
  // Shipping
  shippingCostCents: z.coerce.number().int().nonnegative().optional(),
  processingTime: z.string().max(50).optional(),
  shippingMethods: z.array(z.string()).optional().default([]),
  // Policies
  returnPolicy: z.string().max(1000).optional(),
  returnWindowDays: z.coerce.number().int().nonnegative().optional(),
  warrantyInfo: z.string().max(200).optional(),
  careInstructions: z.string().max(500).optional(),
  // Draft
  isDraft: z.boolean().optional().default(false),
});

