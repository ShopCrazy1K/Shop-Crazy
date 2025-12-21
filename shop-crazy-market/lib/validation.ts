/**
 * Input validation utilities
 * Simple validation functions for common use cases
 * For more complex validation, consider using Zod
 */

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

