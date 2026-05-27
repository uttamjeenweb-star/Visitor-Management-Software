
const badgeStyle = {
  fontSize: "0.75rem",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  border: "1px solid #cbd5e1",
  padding: "0.25rem 0.5rem",
  borderRadius: "0.25rem",
  fontWeight: "600",
};

export const PhotoSection = ({ photoUrl, passData }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Visitor Photo Card */}
      <div
        style={{
          borderRadius: "0.75rem",
          border: "1px solid #e2e8f0",
          padding: "1.25rem",
          backgroundColor: "#f8fafc",
          textAlign: "center",
        }}
      >
        <h4
          style={{
            margin: "0 0 0.75rem 0",
            color: "#475569",
            fontSize: "0.9rem",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Visitor Photo Capture
        </h4>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Captured Visitor"
            style={{
              width: "100%",
              maxHeight: "260px",
              objectFit: "cover",
              borderRadius: "0.5rem",
              border: "1px solid #cbd5e1",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#cbd5e1",
              borderRadius: "0.5rem",
              color: "#64748b",
              fontWeight: "500",
            }}
          >
            No Image Captured
          </div>
        )}
      </div>

      {/* Carry With & Visit Area Badges */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <span
            style={{
              display: "block",
              fontSize: "0.8rem",
              fontWeight: "600",
              color: "#64748b",
              marginBottom: "0.5rem",
            }}
          >
            Carry With
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
            {Array.isArray(passData.carryWith) && passData.carryWith.length > 0 ? (
              passData.carryWith.map((item, idx) => (
                <span key={idx} style={badgeStyle}>
                  {item}
                </span>
              ))
            ) : (
              <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>None</span>
            )}
          </div>
        </div>

        <div>
          <span
            style={{
              display: "block",
              fontSize: "0.8rem",
              fontWeight: "600",
              color: "#64748b",
              marginBottom: "0.5rem",
            }}
          >
            Allowed Visit Areas
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
            {Array.isArray(passData.visitArea) && passData.visitArea.length > 0 ? (
              passData.visitArea.map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    ...badgeStyle,
                    backgroundColor: "#f0fdf4",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  {item}
                </span>
              ))
            ) : (
              <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>None</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
