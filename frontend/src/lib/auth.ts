import { API_BASE_URL } from './api';

export type LoginResult = { access_token: string; token_type: string };

export async function login(username: string, password: string): Promise<LoginResult> {
  const body = new URLSearchParams();
  body.append('username', username);
  body.append('password', password);
  body.append('grant_type', 'password');

  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? 'Login failed');
  return res.json();
}

export async function signup(payload: { username: string; password: string; role: 'admin' | 'user'; village?: string }): Promise<{ msg: string }> {
  const res = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? 'Signup failed');
  return res.json();
}

export async function getMe(token: string) {
  const res = await fetch(`${API_BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export function saveToken(token: string) {
  localStorage.setItem('token', token);
}

export function loadToken(): string | null {
  return localStorage.getItem('token');
}

export function clearToken() {
  localStorage.removeItem('token');
}


