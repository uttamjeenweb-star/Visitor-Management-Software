
const inputStyle = {
  width: "100%",
  height: "2.5rem",
  borderRadius: "0.375rem",
  border: "1px solid #cbd5e1",
  padding: "0 0.75rem",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
  backgroundColor: "#f8fafc",
};

const detailValueStyle = {
  padding: "0.625rem 0.875rem",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "0.375rem",
  fontSize: "0.9rem",
  fontWeight: "500",
  color: "#334155",
  boxSizing: "border-box",
};

export const PassDetailSection = ({
  isEditable,
  passData,
  handleFieldChange,
  employees,
  states,
  cities,
  setSelectedState,
  setPassData,
}) => {
  const LabelEl = isEditable ? "label" : "span";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Personal Section */}
      <div>
        <h3
          style={{
            margin: "0 0 1rem 0",
            fontSize: "1.05rem",
            fontWeight: "700",
            color: "#0f766e",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "0.5rem",
          }}
        >
          Personal Details
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <LabelEl
              htmlFor={isEditable ? "visitor-name-input" : undefined}
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: "600",
                color: "#64748b",
                marginBottom: "0.25rem",
              }}
            >
              Visitor Name
            </LabelEl>
            {isEditable ? (
              <input
                type="text"
                id="visitor-name-input"
                name="name"
                value={passData.name || ""}
                onChange={handleFieldChange}
                style={inputStyle}
              />
            ) : (
              <div style={detailValueStyle}>{passData.name || "-"}</div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <LabelEl
                htmlFor={isEditable ? "mobile-no-input" : undefined}
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#64748b",
                  marginBottom: "0.25rem",
                }}
              >
                Mobile No
              </LabelEl>
              {isEditable ? (
                <input
                  type="text"
                  id="mobile-no-input"
                  name="mobileNo"
                  value={passData.mobileNo || ""}
                  onChange={handleFieldChange}
                  style={inputStyle}
                />
              ) : (
                <div style={detailValueStyle}>{passData.mobileNo || "-"}</div>
              )}
            </div>
            <div>
              <LabelEl
                htmlFor={isEditable ? "email-id-input" : undefined}
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#64748b",
                  marginBottom: "0.25rem",
                }}
              >
                Email Address
              </LabelEl>
              {isEditable ? (
                <input
                  type="email"
                  id="email-id-input"
                  name="emailId"
                  value={passData.emailId || ""}
                  onChange={handleFieldChange}
                  style={inputStyle}
                />
              ) : (
                <div style={detailValueStyle}>{passData.emailId || "-"}</div>
              )}
            </div>
          </div>

          <div>
            <LabelEl
              htmlFor={isEditable ? "company-name-input" : undefined}
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: "600",
                color: "#64748b",
                marginBottom: "0.25rem",
              }}
            >
              Company Name
            </LabelEl>
            {isEditable ? (
              <input
                type="text"
                id="company-name-input"
                name="companyName"
                value={passData.companyName || ""}
                onChange={handleFieldChange}
                style={inputStyle}
              />
            ) : (
              <div style={detailValueStyle}>{passData.companyName || "-"}</div>
            )}
          </div>

          <div>
            <LabelEl
              htmlFor={isEditable ? "address-textarea" : undefined}
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: "600",
                color: "#64748b",
                marginBottom: "0.25rem",
              }}
            >
              Address
            </LabelEl>
            {isEditable ? (
              <textarea
                id="address-textarea"
                name="address"
                value={passData.address || ""}
                onChange={handleFieldChange}
                style={{ ...inputStyle, height: "60px", resize: "vertical" }}
              />
            ) : (
              <div style={{ ...detailValueStyle, whiteSpace: "pre-wrap" }}>
                {passData.address || "-"}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <LabelEl
                htmlFor={isEditable ? "state-select" : undefined}
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#64748b",
                  marginBottom: "0.25rem",
                }}
              >
                State
              </LabelEl>
              {isEditable ? (
                <select
                  id="state-select"
                  name="state"
                  value={passData.state || ""}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setPassData((prev) => ({ ...prev, state: e.target.value, city: "" }));
                  }}
                  style={inputStyle}
                >
                  <option value="">Select State</option>
                  {states.map((s, idx) => (
                    <option key={idx} value={s.isoCode}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={detailValueStyle}>{passData.state || "-"}</div>
              )}
            </div>
            <div>
              <LabelEl
                htmlFor={isEditable ? "city-select" : undefined}
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#64748b",
                  marginBottom: "0.25rem",
                }}
              >
                City
              </LabelEl>
              {isEditable ? (
                <select
                  id="city-select"
                  name="city"
                  value={passData.city || ""}
                  onChange={handleFieldChange}
                  disabled={!passData.state}
                  style={inputStyle}
                >
                  <option value="">Select City</option>
                  {cities.map((c, idx) => (
                    <option key={idx} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={detailValueStyle}>{passData.city || "-"}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visit Information Section */}
      <div>
        <h3
          style={{
            margin: "0 0 1rem 0",
            fontSize: "1.05rem",
            fontWeight: "700",
            color: "#0f766e",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "0.5rem",
          }}
        >
          Visit Details
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <LabelEl
                htmlFor={isEditable ? "visitor-type-input" : undefined}
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#64748b",
                  marginBottom: "0.25rem",
                }}
              >
                Visitor Type
              </LabelEl>
              {isEditable ? (
                <input
                  type="text"
                  id="visitor-type-input"
                  name="representingVisitorType"
                  value={passData.representingVisitorType || ""}
                  onChange={handleFieldChange}
                  style={inputStyle}
                />
              ) : (
                <div style={detailValueStyle}>{passData.representingVisitorType || "-"}</div>
              )}
            </div>
            <div>
              <LabelEl
                htmlFor={isEditable ? "meet-employee-select" : undefined}
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#64748b",
                  marginBottom: "0.25rem",
                }}
              >
                To Meet Employee
              </LabelEl>
              {isEditable ? (
                <select
                  id="meet-employee-select"
                  name="toMeetWith"
                  value={passData.toMeetWith || ""}
                  onChange={handleFieldChange}
                  style={inputStyle}
                >
                  <option value="">Select Employee</option>
                  {employees.map((e, idx) => (
                    <option key={idx} value={e._id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={detailValueStyle}>
                  {employees.find((e) => e._id === passData.toMeetWith)?.name ||
                    passData.toMeetWith ||
                    "-"}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <LabelEl
                htmlFor={isEditable ? "sub-location-input" : undefined}
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#64748b",
                  marginBottom: "0.25rem",
                }}
              >
                Sub Location
              </LabelEl>
              {isEditable ? (
                <input
                  type="text"
                  id="sub-location-input"
                  name="subLocation"
                  value={passData.subLocation || ""}
                  onChange={handleFieldChange}
                  style={inputStyle}
                />
              ) : (
                <div style={detailValueStyle}>{passData.subLocation || "-"}</div>
              )}
            </div>
            <div>
              <LabelEl
                htmlFor={isEditable ? "allowed-hours-input" : undefined}
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#64748b",
                  marginBottom: "0.25rem",
                }}
              >
                Allowed Hours
              </LabelEl>
              {isEditable ? (
                <input
                  type="text"
                  id="allowed-hours-input"
                  name="allowedHours"
                  value={passData.allowedHours || ""}
                  onChange={handleFieldChange}
                  style={inputStyle}
                />
              ) : (
                <div style={detailValueStyle}>
                  {passData.allowedHours ? `${passData.allowedHours} hrs` : "-"}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#64748b",
                  marginBottom: "0.25rem",
                }}
              >
                ID Type
              </span>
              <div style={detailValueStyle}>{passData.idType || "-"}</div>
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#64748b",
                  marginBottom: "0.25rem",
                }}
              >
                ID Number
              </span>
              <div style={detailValueStyle}>{passData.idNumber || "-"}</div>
            </div>
          </div>

          <div>
            <LabelEl
              htmlFor={isEditable ? "purpose-input" : undefined}
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: "600",
                color: "#64748b",
                marginBottom: "0.25rem",
              }}
            >
              Purpose
            </LabelEl>
            {isEditable ? (
              <input
                type="text"
                id="purpose-input"
                name="purpose"
                value={passData.purpose || ""}
                onChange={handleFieldChange}
                style={inputStyle}
              />
            ) : (
              <div style={detailValueStyle}>{passData.purpose || "-"}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
