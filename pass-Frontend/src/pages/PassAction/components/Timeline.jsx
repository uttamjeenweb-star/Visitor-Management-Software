
function TimelineNode({ title, time, desc, subDesc, active, isError }) {
  const iconBg = active ? (isError ? "#fee2e2" : "#dcfce7") : "#f1f5f9";
  const iconColor = active ? (isError ? "#dc2626" : "#166534") : "#94a3b8";
  const iconBorder = active
    ? isError
      ? "2px solid #fca5a5"
      : "2px solid #86efac"
    : "2px solid #cbd5e1";

  return (
    <div style={{ display: "flex", gap: "1rem", position: "relative", zIndex: 2 }}>
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          backgroundColor: iconBg,
          border: iconBorder,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.75rem",
          color: iconColor,
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        {active ? (isError ? "✗" : "✓") : "•"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: "700", color: active ? "#0f172a" : "#64748b" }}>
            {title}
          </span>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "500" }}>
            {time}
          </span>
        </div>
        <span style={{ fontSize: "0.8rem", color: active ? "#475569" : "#94a3b8", fontWeight: "500" }}>
          {desc}
        </span>
        {subDesc && (
          <span style={{ fontSize: "0.8rem", color: "#b91c1c", fontWeight: "600", marginTop: "0.1rem" }}>
            {subDesc}
          </span>
        )}
      </div>
    </div>
  );
}

export const Timeline = ({ passData }) => {
  return (
    <div
      style={{
        borderRadius: "0.75rem",
        border: "1px solid #e2e8f0",
        padding: "1.5rem",
        backgroundColor: "#ffffff",
      }}
    >
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: "700", color: "#0f766e" }}>
        Pass Lifecycle & Audits
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative" }}>
        {/* Vertical bar */}
        <div
          style={{
            position: "absolute",
            left: "11px",
            top: "8px",
            bottom: "8px",
            width: "2px",
            backgroundColor: "#e2e8f0",
            zIndex: 1,
          }}
        />

        <TimelineNode
          title="Created / Requested"
          time={passData.createdAt ? new Date(passData.createdAt).toLocaleString() : "-"}
          desc={`Pass requested for date: ${new Date(passData.passDate).toLocaleDateString()}`}
          active={true}
        />

        {passData.status === "Rejected" ? (
          <>
            <TimelineNode
              title="Rejected"
              time={passData.rejectedAt ? new Date(passData.rejectedAt).toLocaleString() : "-"}
              desc={`Rejected by: ${passData.rejectedBy || "Admin"}`}
              subDesc={`Reason: "${passData.rejectionReason || "No reason provided"}"`}
              active={true}
              isError={true}
            />
            <TimelineNode
              title="Checked-In"
              desc="Not checked in (Pass is Rejected)"
              active={false}
            />
            <TimelineNode
              title="Checked-Out"
              desc="Not checked out"
              active={false}
            />
          </>
        ) : passData.status === "Expired" ? (
          <>
            <TimelineNode
              title="Approved"
              time={passData.approvedAt ? new Date(passData.approvedAt).toLocaleString() : "-"}
              desc={passData.approvedAt ? `Approved by: ${passData.approvedBy || "Admin"}` : "Awaiting approval"}
              active={!!passData.approvedAt}
            />
            <TimelineNode
              title="Expired"
              time={passData.to ? new Date(passData.to).toLocaleDateString() : new Date(passData.passDate).toLocaleDateString()}
              desc="Pass expired due to past validity date without check-in."
              active={true}
              isError={true}
            />
            <TimelineNode
              title="Checked-In"
              desc="Not checked in (Pass has Expired)"
              active={false}
            />
            <TimelineNode
              title="Checked-Out"
              desc="Not checked out"
              active={false}
            />
          </>
        ) : (
          <>
            <TimelineNode
              title="Approved"
              time={passData.approvedAt ? new Date(passData.approvedAt).toLocaleString() : "-"}
              desc={passData.approvedAt ? `Approved by: ${passData.approvedBy || "Admin"}` : "Awaiting approval"}
              active={!!passData.approvedAt}
            />

            <TimelineNode
              title="Checked-In"
              time={passData.checkedInAt ? new Date(passData.checkedInAt).toLocaleString() : "-"}
              desc={passData.checkedInAt ? `Checked in by: ${passData.checkedInBy || "Security"}` : "Not checked in yet"}
              active={!!passData.checkedInAt}
            />

            <TimelineNode
              title="Checked-Out"
              time={passData.checkedOutAt ? new Date(passData.checkedOutAt).toLocaleString() : "-"}
              desc={passData.checkedOutAt ? `Checked out by: ${passData.checkedOutBy || "Security"}` : "Not checked out yet"}
              active={!!passData.checkedOutAt}
            />
          </>
        )}
      </div>
    </div>
  );
};
