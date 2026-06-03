/**
 * Client-side observability. Sentry only loads when NEXT_PUBLIC_SENTRY_DSN is
 * set; the dynamic import keeps the SDK out of the main bundle otherwise.
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
      enabled: process.env.NODE_ENV === "production",
    });
  });
}
