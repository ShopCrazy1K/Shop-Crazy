import { z } from 'zod';
import { ValidationError } from './error-handler';

/**
 * Validate request data against a Zod schema
 */
export async function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): Promise<z.infer<T>> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid input', error.issues);
    }
    throw error;
  }
}

/**
 * Validate URL query parameters
 */
export async function validateQuery<T extends z.ZodType>(
  schema: T,
  searchParams: URLSearchParams
): Promise<z.infer<T>> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return validateRequest(schema, params);
}

/**
 * Validate request body
 */
export async function validateBody<T extends z.ZodType>(
  schema: T,
  request: Request
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return validateRequest(schema, body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON in request body');
    }
    throw error;
  }
}

/**
 * Validate URL path parameters
 */
export function validateParams<T extends z.ZodType>(
  schema: T,
  params: Record<string, string | string[] | undefined>
): z.infer<T> {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid path parameters', error.issues);
    }
    throw error;
  }
}
