/**
 * Centralised API client — wraps axios with:
 *  - Base URL from NEXT_PUBLIC_API_URL
 *  - JWT access token attached to every request
 *  - Automatic token refresh on 401 (single-retry)
 *  - Tokens stored in localStorage
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// ─── Token helpers ────────────────────────────────────────────────────────────
// Only the access token is stored in localStorage.
// The refresh token lives in an httpOnly cookie (set/cleared by the backend).

const ACCESS_KEY = "th_access";

export const tokenStorage = {
  getAccess:  ()           => (typeof window !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null),
  setAccess:  (t: string)  => localStorage.setItem(ACCESS_KEY, t),
  clear:      ()           => localStorage.removeItem(ACCESS_KEY),
};

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
  withCredentials: true, // send httpOnly refresh-token cookie automatically
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor — attach access token ────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — refresh on 401 ───────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function processQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip refresh for auth endpoints themselves
    if (error.response?.status !== 401 || original._retry || original.url?.includes("/auth/")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue additional 401s while refresh is in progress
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers["Authorization"] = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // No body needed — backend reads refreshToken from httpOnly cookie
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      const newAccess = data.data?.accessToken;
      tokenStorage.setAccess(newAccess);
      processQueue(newAccess);
      original.headers["Authorization"] = `Bearer ${newAccess}`;
      return api(original);
    } catch {
      tokenStorage.clear();
      // Redirect to login if in browser
      if (typeof window !== "undefined") window.location.href = "/auth/login";
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── Typed helpers ────────────────────────────────────────────────────────────

export const apiGet  = <T>(url: string, params?: object) =>
  api.get<{ success: boolean; data: T }>(url, { params }).then((r) => r.data);

export const apiPost = <T>(url: string, body?: object) =>
  api.post<{ success: boolean; data: T; message?: string }>(url, body).then((r) => r.data);

export const apiPatch = <T>(url: string, body?: object) =>
  api.patch<{ success: boolean; data: T; message?: string }>(url, body).then((r) => r.data);

export const apiDelete = <T>(url: string) =>
  api.delete<{ success: boolean; data: T }>(url).then((r) => r.data);

/** Upload a file via multipart/form-data with optional progress callback (0-100). */
export const apiUpload = <T>(
  url: string,
  formData: FormData,
  onProgress?: (percent: number) => void
) =>
  api
    .post<{ success: boolean; data: T; message?: string }>(url, formData, {
      // Do NOT set Content-Type manually — axios sets it with the correct boundary
      // when the body is a FormData instance.
      headers: { "Content-Type": undefined },
      timeout: 120_000, // 2 minutes for large files
      onUploadProgress: onProgress
        ? (e) => {
            if (e.total) onProgress(Math.round((e.loaded / e.total) * 100));
          }
        : undefined,
    })
    .then((r) => r.data);

export default api;
