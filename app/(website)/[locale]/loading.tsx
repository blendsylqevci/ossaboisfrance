export default function Loading() {
  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
      }}
      aria-busy="true"
      aria-label="Chargement"
    >
      <span
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(94, 111, 79, 0.2)",
          borderTopColor: "#5E6F4F",
          borderRadius: "50%",
          display: "inline-block",
          animation: "obf-spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes obf-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
