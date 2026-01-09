import { request as undiciRequest } from "undici";

type Method = "GET" | "POST" | "PUT" | "DELETE";

export type ClientOptions = {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
};

export type ApiClientResponse<T> = { code: number; message: string; data: T };

type QueryValue = string | number | boolean | Array<string | number | boolean> | undefined;

function buildQuery(query?: Record<string, QueryValue>) {
  if (!query) return "";
  const entries = Object.entries(query).flatMap(([key, value]) => {
    if (value === undefined) return [];
    const values = Array.isArray(value) ? value : [value];
    return values.map((v) => [key, String(v)] as [string, string]);
  });
  const sp = new URLSearchParams(entries);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export class ApiClient {
  private baseUrl: string;
  private timeoutMs: number;
  private apiKey: string;

  constructor(opts: ClientOptions) {
    this.baseUrl = opts.baseUrl;
    this.timeoutMs = opts.timeoutMs ?? 10_000;
    this.apiKey = opts.apiKey;
  }

  private async send<T>(method: Method, path: string, opts?: { query?: Record<string, any>; body?: any }) {
    const qs = buildQuery(opts?.query);
    const url = new URL(path + qs, this.baseUrl).toString();
    const bodyStr = opts?.body !== undefined ? JSON.stringify(opts.body) : undefined;

    const headers = {
      "Content-Type": "application/json",
      authorization: `Bearer ${this.apiKey}`,
    } as const;

    const res = await undiciRequest(url, {
      method,
      headers,
      body: bodyStr,
      headersTimeout: this.timeoutMs,
      bodyTimeout: this.timeoutMs,
    });

    const text = await res.body.text();
    let parsed: unknown;
    let parseError: unknown;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        parseError = err;
      }
    }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      const parsedObj = typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : undefined;
      let message = text || `Request failed with status ${res.statusCode}`;
      if (parsedObj && typeof parsedObj.message === "string") {
        message = parsedObj.message;
      }
      throw new Error(`[LiquidlinkSDK] ${message}`);
    }
    if (!text || parseError) {
      throw new Error(`Invalid JSON: ${text}`);
    }
    if (parsed && typeof parsed === "object" && "code" in parsed) {
      const p = parsed as ApiClientResponse<T>;

      return p.data;
    }
    return parsed as T;
  }

  getJSON<T>(path: string, query?: Record<string, any>) {
    return this.send<T>("GET", path, { query });
  }

  postJSON<T>(path: string, body?: any, query?: Record<string, any>) {
    return this.send<T>("POST", path, { body, query });
  }

  putJSON<T>(path: string, body?: any, query?: Record<string, any>) {
    return this.send<T>("PUT", path, { body, query });
  }

  deleteJSON<T>(path: string, query?: Record<string, any>) {
    return this.send<T>("DELETE", path, { query });
  }
}
