import React from "react";

export const StatCard = ({ title, value, icon, colorHex }) => (
  <div
    style={{
      borderRadius: "0.75rem",
      border: "1px solid #e2e8f0",
      backgroundColor: "#ffffff",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
      display: "flex",
      flexDirection: "column",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow =
        "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.boxShadow =
        "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)";
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "1rem",
          height: "3.5rem",
          width: "3.5rem",
          fontSize: "1.75rem",
          backgroundColor: colorHex,
          color: "#ffffff",
          flexShrink: 0,
          boxShadow: `0 4px 10px ${colorHex}40`,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "0.875rem", lineHeight: "1.25rem", color: "#64748b", fontWeight: "600" }}>
          {title}
        </div>
        <div
          style={{
            fontSize: "2rem",
            lineHeight: 1.1,
            fontWeight: "700",
            letterSpacing: "-0.025em",
            marginTop: "0.25rem",
            color: "#0f172a",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  </div>
);
