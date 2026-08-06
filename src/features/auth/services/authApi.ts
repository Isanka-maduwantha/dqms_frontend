import { CONFIG } from '@config';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  nic: string;
  phone: string;
  email: string;
  password: string;
}

export async function loginUser(payload: LoginPayload) {
  const response = await fetch(CONFIG?.LOGIN_API_URL || 'http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return response;
}

export async function registerUser(payload: RegisterPayload) {
  const response = await fetch(CONFIG?.REGISTER_API_URL || 'http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return response;
}
