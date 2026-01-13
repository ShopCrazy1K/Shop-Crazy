import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: string,
  status: number = 400,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Create an unauthorized (401) response
 */
export function unauthorizedResponse(message = 'Authentication required') {
  return errorResponse(message, 401);
}

/**
 * Create a forbidden (403) response
 */
export function forbiddenResponse(message = 'Access denied') {
  return errorResponse(message, 403);
}

/**
 * Create a not found (404) response
 */
export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404);
}

/**
 * Create an internal server error (500) response
 */
export function serverErrorResponse(message = 'Internal server error', error?: any) {
  if (error) {
    console.error('[API Error]', error);
  }
  return errorResponse(message, 500);
}

/**
 * Create a bad request (400) response
 */
export function badRequestResponse(message = 'Bad request', details?: any) {
  return errorResponse(message, 400, details);
}

/**
 * Create a conflict (409) response
 */
export function conflictResponse(message = 'Resource conflict') {
  return errorResponse(message, 409);
}

/**
 * Create a rate limit (429) response
 */
export function rateLimitResponse(
  message = 'Too many requests',
  retryAfter?: number
) {
  const headers: Record<string, string> = {};
  if (retryAfter) {
    headers['Retry-After'] = retryAfter.toString();
  }
  
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status: 429,
      headers,
    }
  );
}
