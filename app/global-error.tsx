"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global error boundary]", error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#FAF9F6",
          color: "#1E293B",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "24px",
            gap: "16px",
          }}
        >
          <h1 style={{ fontSize: "32px", margin: 0 }}>Ossa Bois France</h1>
          <p style={{ color: "#64748B", maxWidth: "480px", lineHeight: 1.6 }}>
            Une erreur inattendue est survenue. Veuillez réessayer.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#5E6F4F",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
