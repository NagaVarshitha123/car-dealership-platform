import { PrismaClient, Role } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError, ValidationError } from '../utils/errors';

export interface RegisterInput {
  email: string;
  password: string;
  role?: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: { id: number; email: string; role: Role };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthService {
  constructor(private readonly prisma: PrismaClient) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const { email, password } = input;

    if (!email || !EMAIL_RE.test(email)) {
      throw new ValidationError('A valid email is required');
    }
    if (!password || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await hashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role: input.role ?? Role.CUSTOMER,
      },
    });

    const token = signToken({ userId: user.id, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken({ userId: user.id, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }
}
