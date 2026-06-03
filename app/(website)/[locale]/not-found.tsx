import Link from "next/link";

export default function NotFound() {
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
        Erreur 404
      </p>
      <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", margin: 0, color: "#1E293B" }}>
        Page introuvable
      </h1>
      <p style={{ maxWidth: "520px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
        La page que vous recherchez n&apos;existe pas ou a été déplacée. Découvrez nos
        maisons à ossature bois ou revenez à l&apos;accueil.
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px" }}>
        <Link
          href="/fr"
          style={{
            background: "#5E6F4F",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/fr/maisons"
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
          Voir nos maisons
        </Link>
      </div>
    </section>
  );
}
