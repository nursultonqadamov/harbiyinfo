import "server-only";

import http from "node:http";
import https from "node:https";
import { randomBytes } from "node:crypto";

// Node's global fetch() (undici) hangs indefinitely connecting to sibling
// Docker containers on the production host -- confirmed by direct testing:
// plain `http.get`/`http.request` to the exact same host/port succeeds
// instantly, `fetch()` to it never resolves (by hostname OR literal IP),
// while `fetch()` to real internet hosts works fine. Root cause not
// pinned down (looks like an undici connection-pool bug specific to this
// container network), so container-to-container calls go through this
// tiny `http`-based shim instead of `fetch()`.

export type InternalResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
  text: () => Promise<string>;
};

async function buildMultipartBody(formData: FormData): Promise<{ body: Buffer; contentType: string }> {
  const boundary = `----InternalFetchBoundary${randomBytes(16).toString("hex")}`;
  const chunks: Buffer[] = [];

  for (const [key, value] of formData.entries()) {
    chunks.push(Buffer.from(`--${boundary}\r\n`));
    if (value instanceof File) {
      chunks.push(
        Buffer.from(
          `Content-Disposition: form-data; name="${key}"; filename="${value.name}"\r\nContent-Type: ${
            value.type || "application/octet-stream"
          }\r\n\r\n`
        )
      );
      chunks.push(Buffer.from(await value.arrayBuffer()));
    } else {
      chunks.push(Buffer.from(`Content-Disposition: form-data; name="${key}"\r\n\r\n${String(value)}`));
    }
    chunks.push(Buffer.from("\r\n"));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));

  return { body: Buffer.concat(chunks), contentType: `multipart/form-data; boundary=${boundary}` };
}

export async function internalFetch(
  url: string,
  init: { method?: string; headers?: Record<string, string>; body?: FormData | string } = {}
): Promise<InternalResponse> {
  const parsed = new URL(url);
  const headers: Record<string, string> = {
    // Django's SecurityMiddleware 301-redirects to HTTPS when
    // SECURE_SSL_REDIRECT is on (correctly, for real public traffic) --
    // this call is always the container-internal continuation of a request
    // whose public leg was already HTTPS (nginx terminates TLS), so tell
    // Django that directly rather than tripping the redirect.
    "X-Forwarded-Proto": "https",
    ...(init.headers || {}),
  };
  let bodyBuffer: Buffer | undefined;

  if (init.body instanceof FormData) {
    const { body, contentType } = await buildMultipartBody(init.body);
    bodyBuffer = body;
    headers["Content-Type"] = contentType;
  } else if (typeof init.body === "string") {
    bodyBuffer = Buffer.from(init.body);
  }
  if (bodyBuffer) headers["Content-Length"] = String(bodyBuffer.length);

  const client = parsed.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path: `${parsed.pathname}${parsed.search}`,
        method: init.method || "GET",
        headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf-8");
          const status = res.statusCode || 0;
          resolve({
            ok: status >= 200 && status < 300,
            status,
            json: async () => JSON.parse(text),
            text: async () => text,
          });
        });
      }
    );
    req.on("error", reject);
    if (bodyBuffer) req.write(bodyBuffer);
    req.end();
  });
}
