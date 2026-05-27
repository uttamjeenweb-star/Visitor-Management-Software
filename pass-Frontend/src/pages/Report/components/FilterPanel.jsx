
import { Button } from "@/shared/ui/atoms/Button";
import { Calendar, Clock, Search } from "lucide-react";

const labelStyle = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: "700",
  color: "#475569",
  marginBottom: "0.375rem",
  textTransform: "uppercase",
  letterSpacing: "0.025em",
};

const inputStyle = {
  width: "100%",
  height: "2.5rem",
  borderRadius: "0.375rem",
  border: "1px solid #cbd5e1",
  padding: "0 2.25rem 0 0.75rem",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: "#f8fafc",
  transition: "border-color 0.15s ease",
};

const iconStyle = {
  position: "absolute",
  right: "0.75rem",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#94a3b8",
  pointerEvents: "none",
};

const selectStyle = {
  width: "100%",
  height: "2.5rem",
  borderRadius: "0.375rem",
  border: "1px solid #cbd5e1",
  padding: "0 0.5rem",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: "#ffffff",
};

export const FilterPanel = ({
  mode,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  searchId,
  setSearchId,
  selectedEmployee,
  setSelectedEmployee,
  selectedArea,
  setSelectedArea,
  passType,
  setPassType,
  status,
  setStatus,
  employees,
  visitorArea,
  loadingEmployees,
  loadingAreas,
  isLoading,
  handleGenerateReport,
  datePreset,
  handlePresetChange,
}) => {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "0.75rem",
        padding: "1.5rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        marginBottom: "2rem",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          alignItems: "end",
        }}
      >
        {/* Preset Select Dropdown */}
        <div>
          <label style={labelStyle} htmlFor="datePreset">Date Preset</label>
          <select
            id="datePreset"
            name="datePreset"
            value={datePreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            style={selectStyle}
          >
            {mode === "today" && <option value="Today">Today</option>}
            {mode === "generate" && <option value="Last Month">Last Month</option>}
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Quarter 1">Quarter 1 (Jan-Mar)</option>
            <option value="Quarter 2">Quarter 2 (Apr-Jun)</option>
            <option value="Quarter 3">Quarter 3 (Jul-Sep)</option>
            <option value="Quarter 4">Quarter 4 (Oct-Dec)</option>
            {mode === "generate" && <option value="Custom">Custom</option>}
          </select>
        </div>

        {/* Mode Generate Inputs */}
        {mode === "generate" && (
          <>
            <div>
              <label style={labelStyle} htmlFor="startDate">Start Date</label>
              <div style={{ position: "relative" }}>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={inputStyle}
                />
                <Calendar size={16} style={iconStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle} htmlFor="endDate">End Date</label>
              <div style={{ position: "relative" }}>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={inputStyle}
                />
                <Calendar size={16} style={iconStyle} />
              </div>
            </div>
          </>
        )}

        {/* Mode Today Lock Indicator */}
        {mode === "today" && (
          <div>
            <span style={labelStyle}>Reporting Period</span>
            <div
              style={{
                height: "2.5rem",
                borderRadius: "0.375rem",
                border: "1px solid #cbd5e1",
                padding: "0 0.75rem",
                fontSize: "0.85rem",
                backgroundColor: "#f1f5f9",
                color: "#475569",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: "600",
                boxSizing: "border-box",
              }}
            >
              <Clock size={16} style={{ color: "#0f766e" }} />
              <span>
                {datePreset === 'Today' 
                  ? `Today (${new Date().toLocaleDateString()})` 
                  : `${datePreset} (${startDate} to ${endDate})`}
              </span>
            </div>
          </div>
        )}

        {/* Find by ID/Name Search - for Today mode */}
        {mode === "today" && (
          <div>
            <label style={labelStyle} htmlFor="searchId">Search Visitor / Pass ID</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                id="searchId"
                name="searchId"
                placeholder="Enter ID or Visitor Name..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                style={inputStyle}
              />
              <Search size={16} style={iconStyle} />
            </div>
          </div>
        )}

        {/* Host Employee Select */}
        <div>
          <label style={labelStyle} htmlFor="hostEmployee">Host Employee</label>
          <select
            id="hostEmployee"
            name="hostEmployee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            disabled={loadingEmployees}
            style={selectStyle}
          >
            <option value="All">All Employees</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Visiting Area Select */}
        <div>
          <label style={labelStyle} htmlFor="visitingArea">Visiting Area</label>
          <select
            id="visitingArea"
            name="visitingArea"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            disabled={loadingAreas}
            style={selectStyle}
          >
            <option value="All">All Visiting Areas</option>
            {visitorArea.map((area) => (
              <option key={area._id || area.id} value={area.name}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pass Type (Single / Multi) Select - for Today mode */}
        {mode === "today" && (
          <div>
            <label style={labelStyle} htmlFor="passType">Pass Type</label>
            <select
              id="passType"
              name="passType"
              value={passType}
              onChange={(e) => setPassType(e.target.value)}
              style={selectStyle}
            >
              <option value="All">All Types</option>
              <option value="single">Single Day Pass</option>
              <option value="multi">Multi Day Pass</option>
            </select>
          </div>
        )}

        {/* Status Select */}
        <div>
          <label style={labelStyle} htmlFor="passStatus">Pass Status</label>
          <select
            id="passStatus"
            name="passStatus"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={selectStyle}
          >
            <option value="All">All Statuses</option>
            <option value="Requested">Requested</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Checked-In">Checked-In</option>
            <option value="Checked-Out">Checked-Out</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Generate Button - only visible for generate mode */}
        {mode === "generate" && (
          <Button
            onClick={handleGenerateReport}
            disabled={isLoading}
            style={{
              backgroundColor: "#0f766e",
              color: "#ffffff",
              height: "2.5rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(15, 118, 110, 0.2)",
            }}
          >
            <Search size={16} /> Generate Report
          </Button>
        )}
      </div>
    </div>
  );
};
