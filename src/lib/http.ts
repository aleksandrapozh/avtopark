// Тонкая обёртка над fetch, которая:
// 1. Всегда шлёт Content-Type: application/json
// 2. Автоматически парсит JSON
// 3. Кидает осмысленную ошибку, если статус не 2xx

export class HttpError extends Error {
  status: number;
  issues?: unknown;

  constructor(message: string, status: number, issues?: unknown) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

async function handle<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.error ?? `HTTP ${res.status}`;
    throw new HttpError(message, res.status, data?.issues);
  }
  return data as T;
}

export const http = {
  get<T>(url: string): Promise<T> {
    return fetch(url, { method: "GET" }).then(handle<T>);
  },
  post<T>(url: string, body: unknown): Promise<T> {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle<T>);
  },
  patch<T>(url: string, body: unknown): Promise<T> {
    return fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle<T>);
  },
  delete<T>(url: string): Promise<T> {
    return fetch(url, { method: "DELETE" }).then(handle<T>);
  },
};