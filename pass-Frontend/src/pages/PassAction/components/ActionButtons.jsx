
const buttonBaseStyle = {
  border: "none",
  fontWeight: "700",
  padding: "0.625rem 1.5rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontSize: "0.9rem",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  transition: "opacity 0.15s",
};

export const ActionButtons = ({
  mode,
  passData,
  isSubmitting,
  handleSubmitAction,
  navigate,
}) => {
  return (
    <div
      style={{
        marginTop: "3rem",
        paddingTop: "1.5rem",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "flex-end",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      {/* Back Button always present */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #cbd5e1",
          color: "#475569",
          fontWeight: "600",
          padding: "0.625rem 1.5rem",
          borderRadius: "0.5rem",
          cursor: "pointer",
          fontSize: "0.9rem",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          transition: "background-color 0.15s",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#f8fafc")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#ffffff")}
      >
        Cancel
      </button>

      {/* Mode 1: review-request action buttons */}
      {mode === "review-request" && passData.status === "Requested" && (
        <>
          <button
            onClick={() => handleSubmitAction("Rejected", true)}
            disabled={isSubmitting}
            style={{ ...buttonBaseStyle, backgroundColor: "#dc2626", color: "#ffffff" }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            Reject Request
          </button>
          <button
            onClick={() => handleSubmitAction("Pending")}
            disabled={isSubmitting}
            style={{ ...buttonBaseStyle, backgroundColor: "#0f766e", color: "#ffffff" }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            {isSubmitting ? "Processing..." : "Create Pass & Queue for Approval"}
          </button>
        </>
      )}

      {/* Mode 2: approve action buttons */}
      {mode === "approve" && passData.status === "Pending" && (
        <>
          <button
            onClick={() => handleSubmitAction("Rejected", true)}
            disabled={isSubmitting}
            style={{ ...buttonBaseStyle, backgroundColor: "#dc2626", color: "#ffffff" }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            Reject Pass
          </button>
          <button
            onClick={() => handleSubmitAction("Approved")}
            disabled={isSubmitting}
            style={{ ...buttonBaseStyle, backgroundColor: "#10b981", color: "#ffffff" }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            {isSubmitting ? "Approving..." : "Approve Pass"}
          </button>
        </>
      )}
    </div>
  );
};
