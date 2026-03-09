import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodIssue } from 'zod';

type ValidateTarget = 'body' | 'query' | 'params';

/**
 * Returns an Express middleware that validates req[target] against the given Zod schema.
 * On failure it sends a 400 with a structured errors array.
 * On success it replaces req[target] with the parsed (coerced) value and calls next().
 */
export const validate =
  (schema: ZodSchema, target: ValidateTarget = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.issues.map((e: ZodIssue) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    // Replace with coerced/parsed value
    (req as any)[target] = result.data;
    next();
  };