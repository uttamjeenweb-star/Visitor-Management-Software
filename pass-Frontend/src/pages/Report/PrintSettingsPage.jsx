import { useState, useEffect } from "react";
import { Sliders, Save, CheckCircle, RotateCcw, Eye, ShieldAlert } from "lucide-react";
import { GatePassTemplate } from "@/shared/ui/GatePassTemplate";

// Default print configuration
const DEFAULT_PRINT_SETTINGS = {
  showPassType: true,
  showGatePassId: true,
  showPassDate: true,
  showAllowedHours: true,
  showName: true,
  showEmployee: true,
  showMobileNo: true,
  showEmailId: true,
  showCompanyName: true,
  showPurpose: true,
  showVisitArea: true,
  showPhoto: true,
  showAccompanyingPersons: true,
  paperSize: "A4", // "Card", "Thermal", "A4"
  orientation: "Portrait", // "Portrait", "Landscape"
  showBorders: true,
  bottomInstructions: "1. Please wear this badge visibly at all times within the facility.\n2. This pass is non-transferable and valid only for authorized areas.\n3. Return this pass to the security desk upon check-out.\n4. In case of emergency, follow instructions of safety wardens.",
};

export default function PrintSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_PRINT_SETTINGS);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Load configuration from local storage
  useEffect(() => {
    const saved = localStorage.getItem("vms_print_settings");
    if (saved) {
      try {
        setSettings({ ...DEFAULT_PRINT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse print settings from localStorage", e);
      }
    }
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("vms_print_settings", JSON.stringify(updated));
      return updated;
    });
    triggerSavedIndicator();
  };

  const handleSelect = (key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem("vms_print_settings", JSON.stringify(updated));
      return updated;
    });
    triggerSavedIndicator();
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem("vms_print_settings", JSON.stringify(updated));
      return updated;
    });
    triggerSavedIndicator();
  };

  const triggerSavedIndicator = () => {
    setShowSavedToast(true);
    const timer = setTimeout(() => setShowSavedToast(false), 2000);
    return () => clearTimeout(timer);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset print configuration to default?")) {
      setSettings(DEFAULT_PRINT_SETTINGS);
      localStorage.setItem("vms_print_settings", JSON.stringify(DEFAULT_PRINT_SETTINGS));
      triggerSavedIndicator();
    }
  };

  const handleManualSave = () => {
    localStorage.setItem("vms_print_settings", JSON.stringify(settings));
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };
  // Render mock pass using the shared Template


  return (
    <div style={{ padding: "0 1.5rem 4rem 1.5rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Toast Notification */}
      <div
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "1.5rem",
          backgroundColor: "#10b981",
          color: "#ffffff",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          fontWeight: "600",
          boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.4)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          transform: showSavedToast ? "translateY(0)" : "translateY(-100px)",
          opacity: showSavedToast ? 1 : 0,
          transition: "transform 0.3s ease, opacity 0.3s ease",
          zIndex: 9999,
        }}
      >
        <CheckCircle size={18} />
        <span>Settings Auto-Saved!</span>
      </div>

      {/* Page Title Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "800",
              color: "#0f172a",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              letterSpacing: "-0.025em",
            }}
          >
            <Sliders style={{ color: "#000000" }} />
            Print Settings Configuration
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0.35rem 0 0 0", fontWeight: "500" }}>
            Customize what fields appear on the gate pass, the size format, custom security instructions, and print themes.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={handleReset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#f1f5f9",
              color: "#475569",
              border: "1px solid #cbd5e1",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
          >
            <RotateCcw size={16} /> Reset Default
          </button>
          <button
            onClick={handleManualSave}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#000000",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.5rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`,
              transition: "opacity 0.2s",
            }}
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "2rem" }}>
        
        {/* Settings Panel Card (Left Side) */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "0.75rem",
            border: "1px solid #e2e8f0",
            padding: "1.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "1.75rem",
          }}
        >
          {/* Format Settings */}
          <div>
            <h3 style={{ margin: "0 0 1rem 0", color: "#334155", fontSize: "1rem", fontWeight: "700", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem" }}>
              1. Print Layout Format
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "0.35rem" }}>
                  Paper / Badge Size
                </label>
                <select
                  value={settings.paperSize}
                  onChange={(e) => handleSelect("paperSize", e.target.value)}
                  style={{
                    width: "100%",
                    height: "2.5rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #cbd5e1",
                    padding: "0 0.5rem",
                    fontSize: "0.875rem",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <option value="Card">Standard ID Card (3.5" x 2.25")</option>
                  <option value="Thermal">Thermal Slip (80mm Continuous)</option>
                  <option value="A4">A4 Half-Page Document</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600", color: "#475569" }}>
                <input
                  type="checkbox"
                  checked={settings.showBorders}
                  onChange={() => handleToggle("showBorders")}
                  style={{ width: "1.1rem", height: "1.1rem", accentColor: "#000000", cursor: "pointer" }}
                />
                Show Accent Border
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600", color: "#475569" }}>
                <input
                  type="checkbox"
                  checked={settings.orientation === "Landscape"}
                  onChange={() => handleSelect("orientation", settings.orientation === "Portrait" ? "Landscape" : "Portrait")}
                  style={{ width: "1.1rem", height: "1.1rem", accentColor: "#000000", cursor: "pointer" }}
                />
                Landscape Mode
              </label>
            </div>
          </div>

          {/* Toggle Fields */}
          <div>
            <h3 style={{ margin: "0 0 1rem 0", color: "#334155", fontSize: "1rem", fontWeight: "700", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem" }}>
              2. Custom Visible Fields
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
              {[
                { key: "showPhoto", label: "Visitor Photo" },
                { key: "showPassType", label: "Pass Type Indicator" },
                { key: "showGatePassId", label: "Gate Pass ID Code" },
                { key: "showPassDate", label: "Pass Issue Date" },
                { key: "showAllowedHours", label: "Hours Allowed Limit" },
                { key: "showName", label: "Visitor Name" },
                { key: "showMobileNo", label: "Mobile Number" },
                { key: "showEmailId", label: "Email Address" },
                { key: "showCompanyName", label: "Company Name" },
                { key: "showEmployee", label: "Host Employee Name" },
                { key: "showVisitArea", label: "Allowed Office Areas" },
                { key: "showPurpose", label: "Purpose of Visit" },
                { key: "showAccompanyingPersons", label: "Accompanying Persons" },
              ].map((field) => (
                <div
                  key={field.key}
                  onClick={() => handleToggle(field.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.375rem",
                    backgroundColor: settings[field.key] ? "#f3f4f6" : "#f8fafc",
                    border: `1px solid ${settings[field.key] ? "#d1d5db" : "#e2e8f0"}`,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", fontWeight: "600", color: settings[field.key] ? "#000000" : "#64748b" }}>
                    {field.label}
                  </span>
                  
                  {/* Styled Mini Toggle Switch */}
                  <div
                    style={{
                      width: "1.75rem",
                      height: "0.9rem",
                      borderRadius: "9999px",
                      backgroundColor: settings[field.key] ? "#000000" : "#cbd5e1",
                      position: "relative",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: "0.75rem",
                        height: "0.75rem",
                        borderRadius: "50%",
                        backgroundColor: "#ffffff",
                        position: "absolute",
                        top: "0.075rem",
                        left: settings[field.key] ? "0.9rem" : "0.1rem",
                        transition: "left 0.2s",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Security Instructions */}
          <div>
            <h3 style={{ margin: "0 0 0.75rem 0", color: "#334155", fontSize: "1rem", fontWeight: "700", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem" }}>
              3. Pass Bottom Instructions
            </h3>
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.75rem", color: "#64748b", fontWeight: "500" }}>
              Define rules and directions printed at the bottom of every pass. Keep each instruction on a new line.
            </p>
            <textarea
              name="bottomInstructions"
              value={settings.bottomInstructions}
              onChange={handleTextChange}
              placeholder="Enter directions..."
              rows={4}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "0.8rem",
                lineHeight: "1.4",
                borderRadius: "0.375rem",
                border: "1px solid #cbd5e1",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                backgroundColor: "#f8fafc",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            />
          </div>
        </div>

        {/* Live Mockup Preview Panel (Right Side) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "2px dashed #cbd5e1",
              borderRadius: "0.75rem",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              minHeight: "450px",
              boxSizing: "border-box",
            }}
          >
            {/* Live Indicator Badge */}
            <div
              style={{
                alignSelf: "stretch",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#475569", fontWeight: "700", fontSize: "0.85rem" }}>
                <Eye size={16} /> Live Printing Mockup Preview
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "9999px",
                  fontWeight: "700",
                  letterSpacing: "0.05em",
                }}
              >
                REALTIME PREVIEW
              </div>
            </div>

            <GatePassTemplate 
              passData={{
                gatePassId: "GP-A7B8C9",
                name: "Jane Doe",
                mobileNo: "+1 (555) 019-2834",
                emailId: "jane.doe@gmail.com",
                companyName: "Google DeepMind",
                toMeetWith: "John Smith (IT Dev)",
                visitArea: ["Server Room", "Conf Hall A"],
                purpose: "Technical Integration Meeting",
                allowedHours: 8,
                createdAt: new Date().toISOString(),
                passDate: new Date().toISOString(),
                status: "Approved",
                gatePassType: "single",
                persons: [
                  { name: "Bob Smith", phoneNo: "+1...23", aadharNumber: "1234" },
                  { name: "Alice Johnson", phoneNo: "+1...56", aadharNumber: "5678" }
                ],
                photoUrl: ""
              }}
              printSettings={settings}
              getEmployeeName={(id) => id}
            />
          </div>

          {/* Quick Notice about browser margins */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              padding: "1rem",
              backgroundColor: "#fffbe6",
              border: "1px solid #ffe58f",
              borderRadius: "0.5rem",
              color: "#d48806",
              fontSize: "0.8rem",
              lineHeight: "1.4",
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0, color: "#faad14" }} />
            <div>
              <strong>Printer Layout Tip:</strong> When using the physical browser print window, make sure to set <strong>Margins</strong> to <i>None</i> or <i>Minimum</i> and toggle <strong>Background graphics</strong> <i>ON</i> to get accurate colors and border formatting.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
