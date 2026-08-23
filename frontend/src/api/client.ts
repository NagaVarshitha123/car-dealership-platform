import { AuthResult, Vehicle } from '../types';

const BASE_URL = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? 'Request failed');
  }

  return data as T;
}

export const api = {
  register: (email: string, password: string) =>
    request<AuthResult>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  listVehicles: (token: string) => request<Vehicle[]>('/vehicles', { token }),

  searchVehicles: (token: string, params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return request<Vehicle[]>(`/vehicles/search?${query}`, { token });
  },

  createVehicle: (token: string, vehicle: Omit<Vehicle, 'id'>) =>
    request<Vehicle>('/vehicles', {
      method: 'POST',
      token,
      body: JSON.stringify(vehicle),
    }),

  updateVehicle: (token: string, id: number, vehicle: Partial<Omit<Vehicle, 'id'>>) =>
    request<Vehicle>(`/vehicles/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(vehicle),
    }),

  deleteVehicle: (token: string, id: number) =>
    request<void>(`/vehicles/${id}`, { method: 'DELETE', token }),

  purchaseVehicle: (token: string, id: number) =>
    request<Vehicle>(`/vehicles/${id}/purchase`, { method: 'POST', token }),

  restockVehicle: (token: string, id: number, amount: number) =>
    request<Vehicle>(`/vehicles/${id}/restock`, {
      method: 'POST',
      token,
      body: JSON.stringify({ amount }),
    }),
};
