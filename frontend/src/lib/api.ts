import { loadToken } from './auth';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

async function apiFetch(path: string, init?: RequestInit) {
  const token = loadToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
    if (!res.ok) {
      let msg = 'Request failed';
      try { 
        const j = await res.json(); 
        msg = j.detail || JSON.stringify(j); 
      } catch {}
      console.error('API Error:', msg);
      throw new Error(msg);
    }
    return res.json();
  } catch (error) {
    console.error('Network Error:', error);
    throw error;
  }
}

export const api = {
  get: (path: string) => apiFetch(path),
  post: (path: string, body?: any) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
};



