/**
 * API client — simple axios wrapper.
 * No auth required — all tools are free.
 */

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// No-op token storage (auth removed)
export const tokenStorage = {
  getAccess:  (): string | null => null,
  setAccess:  (_t: string)      => {},
  clear:      ()                => {},
};

export const apiGet = <T>(url: string, params?: object) =>
  api.get<{ success: boolean; data: T }>(url, { params }).then((r) => r.data);

export const apiPost = <T>(url: string, body?: object) =>
  api.post<{ success: boolean; data: T; message?: string }>(url, body).then((r) => r.data);

export const apiPatch = <T>(url: string, body?: object) =>
  api.patch<{ success: boolean; data: T; message?: string }>(url, body).then((r) => r.data);

export const apiDelete = <T>(url: string) =>
  api.delete<{ success: boolean; data: T }>(url).then((r) => r.data);

export const apiUpload = <T>(
  url: string,
  formData: FormData,
  onProgress?: (percent: number) => void
) =>
  api
    .post<{ success: boolean; data: T; message?: string }>(url, formData, {
      headers: { "Content-Type": undefined },
      timeout: 120_000,
      onUploadProgress: onProgress
        ? (e) => { if (e.total) onProgress(Math.round((e.loaded / e.total) * 100)); }
        : undefined,
    })
    .then((r) => r.data);

export default api;
