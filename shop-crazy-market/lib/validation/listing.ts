// lib/validation/listing.ts

import { z } from "zod";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Allow: https://..., http://..., /uploads/..., or "file.png"
export const imageString = z
  .string()
  .min(1, "Image is required")
  .refine(
    (v) =>
      v.startsWith("http://") ||
      v.startsWith("https://") ||
      v.startsWith("/") ||
      /\.(png|jpg|jpeg|webp|gif)$/i.test(v),
    "Image must be a URL, a /path, or a filename ending in .png/.jpg/.jpeg/.webp/.gif"
  );

export const createListingSchema = z.object({
  title: z.string().min(2, "Title is too short").max(120, "Title too long"),
  description: z.string().min(2, "Description is too short").max(5000, "Description too long"),

  // Price in cents (form sends priceCents)
  priceCents: z.coerce.number().int().nonnegative("Price must be 0 or more").max(10000000, "Price too high"),

  // Images array (can accept single imageUrl or array)
  imageUrl: imageString.optional(),
  images: z.array(imageString).max(12, "Too many images").optional(),

  // Slug is optional (will be generated from title if not provided)
  slug: z.string().optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

