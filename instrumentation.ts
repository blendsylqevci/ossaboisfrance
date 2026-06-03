import type { Instrumentation } from "next";

/**
 * Server/edge observability hook. Sentry is fully optional: it only loads and
 * initializes when SENTRY_DSN is set, so without a DSN there is zero runtime
 * cost and zero build impact. Add SENTRY_DSN in the environment to activate.
 */
export async function register(): Promise<void> {
  if (!process.env.SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    enabled: process.env.NODE_ENV === "production",
  });
}

export const onRequestError: Instrumentation.onRequestError = async (...args) => {
  if (!process.env.SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
};
