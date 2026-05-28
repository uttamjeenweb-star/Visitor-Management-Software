import React from "react";

export const GatePassTemplate = ({ passData, printSettings, getEmployeeName }) => {
  if (!passData) return null;

  const backendHost = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").replace("/api/v1", "");
  const resolveUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${backendHost}${url}`;
  };
  const photoUrl = resolveUrl(passData.photoUrl);

  const primaryColor = "#000000";
  const bgColor = "#ffffff";
  const grayLight = "#f3f4f6";

  const getPassStyle = () => {
    const isThermal = printSettings.paperSize === "Thermal";
    const isA4 = printSettings.paperSize === "A4";

    return {
      width: isThermal ? "300px" : isA4 ? "100%" : "440px",
      minHeight: isThermal ? "450px" : isA4 ? "100%" : "280px",
      border: printSettings.showBorders ? "2px solid #000000" : "1px solid #000000",
      borderRadius: isThermal ? "0" : isA4 ? "0" : "4px",
      backgroundColor: bgColor,
      padding: isThermal ? "1rem 0.75rem" : "1.5rem",
      boxShadow: "none",
      boxSizing: "border-box",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      color: primaryColor,
    };
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: ${printSettings.paperSize === 'A4' ? 'A4 ' + (printSettings.orientation?.toLowerCase() || 'portrait') : 'auto'};
            margin: 0;
          }
          
          body * {
            visibility: hidden !important;
            background-color: transparent !important;
            box-shadow: none !important;
          }
          
          #printable-gatepass-frame, #printable-gatepass-frame * {
            visibility: visible !important;
          }
          
          #printable-gatepass-frame {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            transform: none !important;
            width: ${printSettings.paperSize === 'Thermal' ? '300px' : printSettings.paperSize === 'A4' ? '100%' : '440px'} !important;
            min-height: ${printSettings.paperSize === 'A4' ? '100%' : 'auto'} !important;
            border: ${printSettings.paperSize === 'A4' && !printSettings.showBorders ? 'none' : '2px solid #000000'} !important;
            box-shadow: none !important;
            padding: ${printSettings.paperSize === 'A4' ? '40px' : '2rem'} !important;
            margin: 0 !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      <div id="printable-gatepass-frame" style={getPassStyle()}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderBottom: "2px solid #000000",
            paddingBottom: "0.5rem",
            marginBottom: "0.75rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "900", color: "#000000", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {passData.companyName ? passData.companyName.toUpperCase() : "FACILITY ACCESS"}
          </h2>
          <div style={{ fontSize: "0.7rem", color: "#1f2937", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.2em", marginTop: "1px" }}>
            VISITOR GATE PASS
          </div>
          {printSettings.showPassType && (
            <span
              style={{
                fontSize: "0.6rem",
                fontWeight: "900",
                border: "1.5px solid #000000",
                backgroundColor: "#000000",
                color: "#ffffff",
                padding: "0.1rem 0.5rem",
                borderRadius: "2px",
                textTransform: "uppercase",
                marginTop: "0.35rem",
                letterSpacing: "0.05em"
              }}
            >
              {passData.gatePassType === "single" ? "Single Day Pass" : "Multi Day Pass"}
            </span>
          )}
        </div>

        {/* Body Content */}
        <div style={{ display: "flex", gap: "1rem", flex: 1, flexDirection: printSettings.orientation === 'Landscape' ? 'row' : 'row' }}>
          
          {/* Photo & QR verification side panel */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "110px", flexShrink: 0 }}>
            
            {/* Visitor Photo */}
            {printSettings.showPhoto && (
              <div
                style={{
                  width: "100px",
                  height: "115px",
                  border: "1.5px solid #000000",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Visitor" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%) contrast(1.1)" }} />
                ) : (
                  <div style={{ textAlign: "center", color: "#000000", fontSize: "0.6rem", fontWeight: "700" }}>
                    <span style={{ fontSize: "1.5rem", display: "block" }}>👤</span>
                    NO PHOTO
                  </div>
                )}
              </div>
            )}

            {/* High-Contrast Printed Pass Status Badge */}
            <div
              style={{
                width: "100px",
                border: "2px solid #000000",
                backgroundColor: 
                  passData.status === "Approved" ? "#dcfce7" :
                  passData.status === "Checked-In" ? "#e0f2fe" :
                  passData.status === "Checked-Out" ? "#f3f4f6" :
                  passData.status === "Rejected" ? "#fee2e2" :
                  "#fee2e2", // Expired
                color: "#000000",
                padding: "0.2rem 0.1rem",
                borderRadius: "3px",
                textAlign: "center",
                fontWeight: "900",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                boxSizing: "border-box",
              }}
            >
              {passData.status}
            </div>

            {/* High Contrast Monochrome QR code Verification Box */}
            <div style={{
              width: "100px",
              height: "100px",
              border: "1px solid #000000",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ffffff",
              padding: "0.25rem",
              boxSizing: "border-box"
            }}>
              <svg width="60" height="60" viewBox="0 0 29 29" style={{ shapeRendering: "crispEdges" }}>
                <path fill="#000000" d="M0 0h9v9H0zm1 1v7h7V1zm8 0h1v1H9zm1 1h1v1h-1zm-1 1h1v1H9zm1 1h1v1h-1zm2-4h9v9h-9zm1 1v7h7V1zm-4 7h1v1H9zm1 0h1v1h-1zm-1 1h1v1H9zm3-1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm-5 2h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm2 1h1v1h-1zm-9 2h1v1H9zm1 1h1v1h-1zm1-1h1v1h-1zm2 1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm3 0h1v1h-1zm-8 1h1v1H9zm1 1h1v1h-1zm1-1h1v1h-1zm3 1h1v1h-1zm2-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm-9 2h1v1H9zm1 1h1v1h-1zm1-1h1v1h-1zm3 0h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm0 2h9v9h-9zm1 1v7h7V13zm-10 2h1v1h-1zm1 1h1v1h-1zm-1 1h1v1H9zm1 1h1v1h-1zm2-3h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm2 1h1v1h-1zm-9 2h1v1H9zm1 1h1v1h-1zm1-1h1v1h-1zm2 1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm3 0h1v1h-1zm-8 1h1v1H9zm1 1h1v1h-1zm1-1h1v1h-1zm3 1h1v1h-1zm2-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm-9 2h1v1H9zm1 1h1v1h-1zm1-1h1v1h-1zm3 0h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm2-2h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm2 1h1v1h-1zm-9 2h1v1H9zm1 1h1v1h-1zm1-1h1v1h-1zm2 1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm3 0h1v1h-1zm-8 1h1v1H9zm1 1h1v1h-1zm1-1h1v1h-1zm3 1h1v1h-1zm2-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm-9 2h1v1H9zm1 1h1v1h-1zm1-1h1v1h-1zm3 0h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm0 2h9v9h-9zm1 1v7h7v-7zm-10 2h1v1h-1zm1 1h1v1h-1zm-1 1h1v1H9zm1 1h1v1h-1zm2-3h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm2 1h1v1h-1zm-9 2h1v1H9zm1 1h1v1h-1zm1-1h1v1h-1zm2 1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm3 0h1v1h-1zm-8 1h1v1H9zm1 1h1v1h-1zm1-1h1v1h-1zm3 1h1v1h-1zm2-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm-9 2h1v1H9zm1 1h1v1h-1zm1-1h1v1h-1zm3 0h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1zm1 1h1v1h-1zm1-1h1v1h-1z" />
              </svg>
              <span style={{ fontSize: "0.45rem", fontWeight: "800", marginTop: "2px", color: "#000000", letterSpacing: "0.05em" }}>VERIFIED</span>
            </div>
          </div>

          {/* Details list as formal ledger */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.15rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", color: "#000000", border: "1px solid #000000" }}>
              <tbody>
                {printSettings.showGatePassId && (
                  <tr style={{ borderBottom: "1px solid #000000" }}>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "800", width: "100px", textTransform: "uppercase", fontSize: "0.6rem", borderRight: "1px solid #000000", backgroundColor: grayLight }}>PASS ID</td>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "900", fontSize: "0.8rem", letterSpacing: "0.025em" }}>{passData.gatePassId || "-"}</td>
                  </tr>
                )}
                {printSettings.showName && (
                  <tr style={{ borderBottom: "1px solid #000000" }}>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "800", textTransform: "uppercase", fontSize: "0.6rem", borderRight: "1px solid #000000", backgroundColor: grayLight }}>VISITOR</td>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "900", fontSize: "0.8rem" }}>{passData.name ? passData.name.toUpperCase() : "-"}</td>
                  </tr>
                )}
                {printSettings.showMobileNo && (
                  <tr style={{ borderBottom: "1px solid #000000" }}>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "800", textTransform: "uppercase", fontSize: "0.6rem", borderRight: "1px solid #000000", backgroundColor: grayLight }}>MOBILE NO</td>
                    <td style={{ padding: "0.35rem 0.5rem" }}>{passData.mobileNo || "-"}</td>
                  </tr>
                )}
                {printSettings.showEmailId && passData.emailId && (
                  <tr style={{ borderBottom: "1px solid #000000" }}>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "800", textTransform: "uppercase", fontSize: "0.6rem", borderRight: "1px solid #000000", backgroundColor: grayLight }}>EMAIL ID</td>
                    <td style={{ padding: "0.35rem 0.5rem", textTransform: "lowercase" }}>{passData.emailId}</td>
                  </tr>
                )}
                {printSettings.showCompanyName && passData.companyName && (
                  <tr style={{ borderBottom: "1px solid #000000" }}>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "800", textTransform: "uppercase", fontSize: "0.6rem", borderRight: "1px solid #000000", backgroundColor: grayLight }}>REPRESENTING</td>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "800" }}>{passData.companyName.toUpperCase()}</td>
                  </tr>
                )}
                {printSettings.showEmployee && (
                  <tr style={{ borderBottom: "1px solid #000000" }}>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "800", textTransform: "uppercase", fontSize: "0.6rem", borderRight: "1px solid #000000", backgroundColor: grayLight }}>HOST</td>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "800" }}>{getEmployeeName ? getEmployeeName(passData.toMeetWith).toUpperCase() : (passData.toMeetWith || "-").toUpperCase()}</td>
                  </tr>
                )}
                {printSettings.showVisitArea && (
                  <tr style={{ borderBottom: "1px solid #000000" }}>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "800", textTransform: "uppercase", fontSize: "0.6rem", borderRight: "1px solid #000000", backgroundColor: grayLight }}>ALLOWED AREAS</td>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "900", color: "#000000" }}>
                      {Array.isArray(passData.visitArea) ? passData.visitArea.join(", ").toUpperCase() : passData.visitArea ? passData.visitArea.toUpperCase() : "N/A"}
                    </td>
                  </tr>
                )}
                {printSettings.showPurpose && (
                  <tr style={{ borderBottom: "1px solid #000000" }}>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "800", textTransform: "uppercase", fontSize: "0.6rem", borderRight: "1px solid #000000", backgroundColor: grayLight }}>PURPOSE</td>
                    <td style={{ padding: "0.35rem 0.5rem" }}>{passData.purpose || "General Meeting"}</td>
                  </tr>
                )}
                {printSettings.showPassDate && (
                  <tr style={{ borderBottom: "1px solid #000000" }}>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "800", textTransform: "uppercase", fontSize: "0.6rem", borderRight: "1px solid #000000", backgroundColor: grayLight }}>DATE / TIME</td>
                    <td style={{ padding: "0.35rem 0.5rem" }}>
                      {passData.passDate ? new Date(passData.passDate).toLocaleString() : (passData.createdAt ? new Date(passData.createdAt).toLocaleString() : "-")}
                    </td>
                  </tr>
                )}
                {printSettings.showAllowedHours && passData.allowedHours && (
                  <tr>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "800", textTransform: "uppercase", fontSize: "0.6rem", borderRight: "1px solid #000000", backgroundColor: grayLight }}>VALID LIMIT</td>
                    <td style={{ padding: "0.35rem 0.5rem", fontWeight: "900" }}>{passData.allowedHours} HOURS ONLY</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Accompanying Persons Table */}
        {printSettings.showAccompanyingPersons && passData.persons && passData.persons.length > 0 && (
          <div style={{ border: "1.5px solid #000000", padding: "0.5rem", fontSize: "0.7rem", marginTop: "0.5rem", backgroundColor: "#ffffff" }}>
            <div style={{ fontWeight: "900", color: "#000000", marginBottom: "0.25rem", textTransform: "uppercase", fontSize: "0.6rem", letterSpacing: "0.05em" }}>
              Accompanying Persons ({passData.persons.length} Total)
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #000000", color: "#000000", textAlign: "left" }}>
                  <th style={{ padding: "0.15rem 0", fontSize: "0.55rem", fontWeight: "800" }}>NAME</th>
                  <th style={{ padding: "0.15rem 0", fontSize: "0.55rem", fontWeight: "800" }}>CONTACT</th>
                  <th style={{ padding: "0.15rem 0", fontSize: "0.55rem", fontWeight: "800" }}>GOVT ID NO</th>
                </tr>
              </thead>
              <tbody>
                {passData.persons.map((person, index) => (
                  <tr key={person.id || index} style={{ borderBottom: index < passData.persons.length - 1 ? "1px dashed #000000" : "none" }}>
                    <td style={{ padding: "0.2rem 0", fontWeight: "700" }}>{person.name}</td>
                    <td style={{ padding: "0.2rem 0" }}>{person.phoneNo || "-"}</td>
                    <td style={{ padding: "0.2rem 0" }}>{person.aadharNumber || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Authorized Signatures Section */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1.25rem",
          paddingTop: "0.75rem",
          borderTop: "1.5px dashed #000000",
          pageBreakInside: "avoid"
        }}>
          <div style={{ textAlign: "center", width: "45%" }}>
            <div style={{ borderBottom: "1px solid #000000", width: "100%", height: "20px" }}></div>
            <span style={{ fontSize: "0.55rem", fontWeight: "800", textTransform: "uppercase", marginTop: "3px", display: "block", color: "#000000" }}>
              Visitor Signature
            </span>
          </div>
          <div style={{ textAlign: "center", width: "45%" }}>
            <div style={{ borderBottom: "1px solid #000000", width: "100%", height: "20px" }}></div>
            <span style={{ fontSize: "0.55rem", fontWeight: "800", textTransform: "uppercase", marginTop: "3px", display: "block", color: "#000000" }}>
              Security Officer / Sign
            </span>
          </div>
        </div>

        {/* Custom Bottom Instructions */}
        {printSettings.bottomInstructions && (
          <div
            style={{
              borderTop: "1px dashed #000000",
              paddingTop: "0.5rem",
              marginTop: "0.75rem",
              fontSize: "0.6rem",
              lineHeight: "1.4",
              color: "#000000",
              pageBreakInside: "avoid"
            }}
          >
            <div style={{ fontWeight: "900", fontSize: "0.55rem", textTransform: "uppercase", color: "#000000", marginBottom: "0.15rem", letterSpacing: "0.05em" }}>
              Security Access Terms:
            </div>
            {printSettings.bottomInstructions.split("\n").map((instruction, idx) => (
              <div key={idx} style={{ marginBottom: "0.05rem" }}>{instruction}</div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
