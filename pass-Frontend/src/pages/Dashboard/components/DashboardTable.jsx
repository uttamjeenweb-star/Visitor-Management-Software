import React from "react";

export const DashboardTable = ({
  title,
  columns,
  data,
  actionLabel,
  actionButtonColor,
  onAction,
  showPrintAction = false,
  onPrint,
}) => (
  <div style={{ marginTop: "2.5rem" }}>
    <h2
      style={{
        color: "#0f766e",
        marginBottom: "1rem",
        fontSize: "1.25rem",
        fontWeight: "700",
        letterSpacing: "-0.015em",
        margin: "0 0 1rem 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span>{title}</span>
      <span
        style={{
          fontSize: "0.75rem",
          backgroundColor: "#f1f5f9",
          color: "#64748b",
          padding: "0.25rem 0.625rem",
          borderRadius: "9999px",
          fontWeight: "600",
        }}
      >
        {data.length} records
      </span>
    </h2>
    <div
      style={{
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        borderRadius: "0.75rem",
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
      }}
    >
      <div style={{ overflowX: "auto", width: "100%" }}>
        <table
          style={{
            width: "100%",
            fontSize: "0.875rem",
            textAlign: "left",
            borderCollapse: "collapse",
            whiteSpace: "nowrap",
          }}
        >
          <thead style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: "0.875rem 1.25rem",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {col}
                </th>
              ))}
              {(actionLabel || showPrintAction) && (
                <th
                  style={{
                    padding: "0.875rem 1.25rem",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    textAlign: "center",
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {columns.map((col, colIndex) => {
                    const key = col.toLowerCase().replace(/ /g, "_");
                    const val = row[key] || "-";

                    if (key === "status" || col === "Status") {
                      const isApproved = val === "Approved";
                      const isPending = val === "Pending";
                      const isCheckedIn = val === "Checked-In";
                      const isCheckedOut = val === "Checked-Out";
                      const bg = isApproved
                        ? "#def7ec"
                        : isPending
                        ? "#fef3c7"
                        : isCheckedIn
                        ? "#e1f5fe"
                        : isCheckedOut
                        ? "#f3f4f6"
                        : "#fee2e2";
                      const color = isApproved
                        ? "#03543f"
                        : isPending
                        ? "#92400e"
                        : isCheckedIn
                        ? "#0288d1"
                        : isCheckedOut
                        ? "#374151"
                        : "#9b1c1c";
                      return (
                        <td key={colIndex} style={{ padding: "0.875rem 1.25rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.625rem",
                              borderRadius: "9999px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              backgroundColor: bg,
                              color: color,
                            }}
                          >
                            {val}
                          </span>
                        </td>
                      );
                    }

                    if (key === "pass" || col === "PASS") {
                      const isMulti = val.toLowerCase().includes("multi");
                      const bg = isMulti ? "#ede9fe" : "#e0f2fe";
                      const color = isMulti ? "#5b21b6" : "#075985";
                      return (
                        <td key={colIndex} style={{ padding: "0.875rem 1.25rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.625rem",
                              borderRadius: "9999px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              backgroundColor: bg,
                              color: color,
                            }}
                          >
                            {val}
                          </span>
                        </td>
                      );
                    }

                    return (
                      <td key={colIndex} style={{ padding: "0.875rem 1.25rem", color: "#1f2937" }}>
                        {val}
                      </td>
                    );
                  })}
                  {(actionLabel || showPrintAction) && (
                    <td style={{ padding: "0.5rem 1.25rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", alignItems: "center" }}>
                        {actionLabel && (
                          <button
                            onClick={() => onAction && onAction(row)}
                            style={{
                              backgroundColor: actionButtonColor || "#0f766e",
                              color: "#ffffff",
                              borderRadius: "0.375rem",
                              padding: "0 1rem",
                              height: "2rem",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              border: "none",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                              transition: "opacity 0.2s",
                            }}
                            onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
                            onMouseLeave={(e) => (e.target.style.opacity = "1")}
                          >
                            {actionLabel}
                          </button>
                        )}
                        {showPrintAction && (
                          <button
                            onClick={() => onPrint && onPrint(row)}
                            title="Print Access Pass"
                            style={{
                              backgroundColor: "#f8fafc",
                              color: "#0f766e",
                              border: "1px solid #cbd5e1",
                              borderRadius: "0.375rem",
                              width: "2rem",
                              height: "2rem",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              boxSizing: "border-box",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#e2e8f0";
                              e.currentTarget.style.borderColor = "#0f766e";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#f8fafc";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actionLabel ? 1 : 0)}
                  style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "0.875rem" }}
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
