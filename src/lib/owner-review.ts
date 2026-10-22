import "server-only";
import { Buffer } from "node:buffer";
import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";

declare const verifiedReview: unique symbol;
export type OwnerReviewAccess = Readonly<{ [verifiedReview]: true }>;
const issuedAccess = new WeakMap<object, string>();

function configuration() {
  const local = process.env.NODE_ENV === "development" && process.env.VERCEL !== "1" && !process.env.VERCEL_ENV;
  const hostedPreview = process.env.NODE_ENV === "production" && process.env.VERCEL === "1" && process.env.VERCEL_ENV === "preview";
  const username = process.env.OWNER_REVIEW_USERNAME;
  const password = process.env.OWNER_REVIEW_PASSWORD;
  if ((!local && !hostedPreview) || process.env.OWNER_REVIEW_ENABLED !== "true"
    || !username || !/^[A-Za-z0-9_-]{3,64}$/.test(username)
    || !password || password.length < 32 || password.length > 256 || /[\r\n:]/.test(password)) return null;
  return { username, password, local };
}
function digest(value: string) { return createHash("sha256").update(value).digest(); }
export function ownerReviewEnabled(): boolean { return configuration() !== null; }

/** The request is authenticated here; no query, forwarded grant or public flag is trusted. */
export function authorizeOwnerReview(requestHeaders: Headers, protocol: string): OwnerReviewAccess | null {
  const config = configuration();
  if (!config || (protocol !== "https:" && !(config.local && protocol === "http:"))) return null;
  const authorization = requestHeaders.get("authorization");
  if (!authorization || authorization.length > 2048 || !/^Basic [A-Za-z0-9+/]+={0,2}$/i.test(authorization)) return null;
  const encoded = authorization.slice(6);
  const decoded = Buffer.from(encoded, "base64");
  if (decoded.toString("base64") !== encoded) return null;
  const expected = digest(`${config.username}:${config.password}`);
  if (!timingSafeEqual(digest(decoded.toString("utf8")), expected)) return null;
  const access = Object.freeze({}) as OwnerReviewAccess;
  issuedAccess.set(access, expected.toString("hex"));
  return access;
}
export function isOwnerReviewAccess(value: unknown): value is OwnerReviewAccess {
  const config = configuration();
  return !!config && typeof value === "object" && value !== null
    && issuedAccess.get(value) === digest(`${config.username}:${config.password}`).toString("hex");
}
export async function packageReviewAccess(query: Record<string, string | string[] | undefined>): Promise<OwnerReviewAccess | null> {
  if (query.preview !== "draft" || !ownerReviewEnabled()) return null;
  const requestHeaders = new Headers(await headers());
  // On hosting, the trusted TLS ingress must supply this header; proxy also checks the URL protocol.
  const protocol = requestHeaders.get("x-forwarded-proto") === "https" ? "https:" : "http:";
  return authorizeOwnerReview(requestHeaders, protocol);
}
