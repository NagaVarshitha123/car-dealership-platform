import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: number;
  role: 'CUSTOMER' | 'ADMIN';
}

export function signToken(payload: TokenPayload): string {
  // env.jwtExpiresIn comes from process.env as a plain string (e.g. "1h"),
  // but @types/jsonwebtoken's SignOptions expects its own narrower
  // `number | StringValue` type. Casting through SignOptions here is safe
  // since jsonwebtoken parses this string the same way at runtime either way.
  const options: jwt.SignOptions = { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}
