import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

// Augment Express's Request type so downstream handlers can read req.user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Verifies the Bearer token on the Authorization header and attaches the
 * decoded payload to req.user. Rejects the request with 401 if the token
 * is missing or invalid.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length);

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

/**
 * Must run after `authenticate`. Rejects the request with 403 if the
 * authenticated user is not an ADMIN.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin privileges required');
  }
  next();
}
