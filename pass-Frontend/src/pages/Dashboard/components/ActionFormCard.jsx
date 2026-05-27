import { useState } from "react";

export const ActionFormCard = ({ title, buttonText, onSubmit }) => {
  const [visitorId, setVisitorId] = useState("");

  const handleSubmit = () => {
    if (!visitorId.trim()) {
      alert("Please enter a valid Visitor ID.");
      return;
    }
    onSubmit && onSubmit(visitorId.trim());
    setVisitorId("");
  };

  const inputId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div
      style={{
        borderRadius: "0.75rem",
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
          borderTopLeftRadius: "0.75rem",
          borderTopRightRadius: "0.75rem",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "0.95rem",
            fontWeight: "700",
            textTransform: "uppercase",
            color: "#334155",
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </h3>
      </div>
      <div style={{ padding: "1.5rem" }}>
        <label
          htmlFor={inputId}
          style={{ fontSize: "0.875rem", fontWeight: "600", color: "#475569", display: "block" }}
        >
          Visitor Id
        </label>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <input
            type="text"
            id={inputId}
            name={inputId}
            placeholder="Enter ID..."
            value={visitorId}
            onChange={(e) => setVisitorId(e.target.value)}
            style={{
              flex: 1,
              height: "2.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #cbd5e1",
              padding: "0.5rem 0.875rem",
              fontSize: "0.875rem",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
              backgroundColor: "#f8fafc",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
          />
          <button
            onClick={handleSubmit}
            style={{
              backgroundColor: "#0f766e",
              color: "#ffffff",
              borderRadius: "0.5rem",
              padding: "0 1.5rem",
              height: "2.75rem",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.875rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 4px rgba(15, 118, 110, 0.2)",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#0d5c56")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#0f766e")}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
