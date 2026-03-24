import Constants from 'expo-constants';
import { supabase } from '../supabase';

const API_PORT = 3000;

function getBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  // On physical devices, localhost resolves to the device, not the dev machine.
  // Expo's debugger connection exposes the host machine's LAN IP via hostUri.
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    return `http://${debuggerHost.split(':')[0]}:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

const BASE_URL = getBaseUrl();

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

function buildFetchOptions(
  options: RequestInit,
  authHeader: Record<string, string>,
): RequestInit {
  return {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const authHeader = await getAuthHeader();
  const response = await fetch(url, buildFetchOptions(options, authHeader));

  if (response.status === 401) {
    const { error } = await supabase.auth.refreshSession();
    if (error) {
      await supabase.auth.signOut();
      throw new Error('Unauthorized');
    }
    const freshAuth = await getAuthHeader();
    const retry = await fetch(url, buildFetchOptions(options, freshAuth));
    if (!retry.ok) {
      if (retry.status === 401) await supabase.auth.signOut();
      throw new Error('Unauthorized');
    }
    return retry.json() as Promise<T>;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? 'Request failed');
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
