"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Website error boundary]", error);
  }, [error]);

  return (
    <section
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "80px 24px",
        gap: "18px",
      }}
    >
      <p
        style={{
          fontSize: "13px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "#5E6F4F",
          fontWeight: 700,
          margin: 0,
        }}
      >
        Une erreur est survenue
      </p>
      <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", margin: 0, color: "#1E293B" }}>
        Quelque chose s&apos;est mal passé
      </h1>
      <p style={{ maxWidth: "520px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
        Nous rencontrons un problème technique temporaire. Vous pouvez réessayer ou
        revenir à l&apos;accueil.
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px" }}>
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
        <Link
          href="/fr"
          style={{
            background: "transparent",
            color: "#5E6F4F",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            border: "1px solid #5E6F4F",
          }}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </section>
  );
}
