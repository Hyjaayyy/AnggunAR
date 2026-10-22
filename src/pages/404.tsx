import NextError from "next/error";

/** Materialize Pages' standard error infrastructure for static-file HTTP errors.
 * Locale pages and public not-found handling remain in App Router/the proxy. */
export default function StaticErrorFallback() {
  return <NextError statusCode={404} />;
}
