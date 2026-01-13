import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { errorResponse, badRequestResponse, serverErrorResponse } from './api-response';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isPublic: boolean = false,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: any) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, true, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

/**
 * Handle errors and return appropriate API response
 */
export function handleError(error: unknown): NextResponse {
  // Zod validation errors
  if (error instanceof ZodError) {
    return badRequestResponse('Validation failed', {
      errors: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // App errors
  if (error instanceof AppError) {
    const response = errorResponse(
      error.message,
      error.statusCode,
      error instanceof ValidationError ? { errors: error.errors } : undefined
    );
    
    // Add error code to response if available
    if (error.code) {
      const body = response.body as any;
      if (body) {
        body.code = error.code;
      }
    }
    
    return response;
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message: string };
    
    switch (prismaError.code) {
      case 'P2002':
        return errorResponse('Duplicate entry', 409);
      case 'P2025':
        return errorResponse('Record not found', 404);
      case 'P2003':
        return errorResponse('Foreign key constraint failed', 400);
      default:
        console.error('[Prisma Error]', prismaError);
    }
  }

  // Unknown errors - log and return generic message
  console.error('[Unhandled Error]', error);
  
  // In development, include error details
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    return serverErrorResponse(error.message, error);
  }
  
  return serverErrorResponse('Internal server error', error);
}

/**
 * Wrap async route handlers with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  }) as T;
}
