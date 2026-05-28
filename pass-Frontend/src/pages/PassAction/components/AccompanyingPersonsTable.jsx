export const AccompanyingPersonsTable = ({ passData, backendHost }) => {
  if (!Array.isArray(passData.persons) || passData.persons.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "2.5rem" }}>
      <h3
        style={{
          margin: "0 0 1rem 0",
          fontSize: "1.1rem",
          fontWeight: "700",
          color: "#0f766e",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "0.5rem",
        }}
      >
        Accompanying Visitors ({passData.persons.length})
      </h3>

      <div
        style={{
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          borderRadius: "0.75rem",
          backgroundColor: "#ffffff",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.875rem",
            textAlign: "left",
          }}
        >
          <thead
            style={{
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <tr>
              <th
                style={{
                  padding: "0.75rem 1rem",
                  fontWeight: "600",
                  color: "#475569",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "0.75rem 1rem",
                  fontWeight: "600",
                  color: "#475569",
                }}
              >
                Phone No
              </th>
              <th
                style={{
                  padding: "0.75rem 1rem",
                  fontWeight: "600",
                  color: "#475569",
                }}
              >
                Aadhar Number
              </th>
              <th
                style={{
                  padding: "0.75rem 1rem",
                  fontWeight: "600",
                  color: "#475569",
                  textAlign: "center",
                }}
              >
                Identity File
              </th>
            </tr>
          </thead>
          <tbody>
            {passData.persons.map((person, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td
                  style={{
                    padding: "0.75rem 1rem",
                    color: "#1f2937",
                    fontWeight: "500",
                  }}
                >
                  {person.name || "-"}
                </td>
                <td style={{ padding: "0.75rem 1rem", color: "#4b5563" }}>
                  {person.phoneNo || "-"}
                </td>
                <td style={{ padding: "0.75rem 1rem", color: "#4b5563" }}>
                  {person.aadharNumber || "-"}
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                  {person.aadharFileUrl ? (
                    <a
                      href={person.aadharFileUrl.startsWith("http") ? person.aadharFileUrl : `${backendHost}${person.aadharFileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#0f766e",
                        fontWeight: "600",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      📄 View File
                    </a>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>No File</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
