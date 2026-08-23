export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: string | number;
  quantity: number;
}

export interface AuthResult {
  token: string;
  user: User;
}
