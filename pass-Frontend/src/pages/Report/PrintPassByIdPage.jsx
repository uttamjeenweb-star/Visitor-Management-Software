import { useState, useEffect } from "react";
import { getPassById } from "@/master/printCalling";
import { useEmployees } from "@/features/employee/useEmployee";
import { Printer, Search, Loader, ShieldAlert, ArrowLeft, Building, User, MapPin } from "lucide-react";
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
  paperSize: "Card", // "Card", "Thermal", "A4"
  orientation: "Portrait", // "Portrait", "Landscape"
  colorTheme: "dark", // "dark", "teal", "blue", "emerald"
  showBorders: true,
  bottomInstructions: "1. Please wear this badge visibly at all times within the facility.\n2. This pass is non-transferable and valid only for authorized areas.\n3. Return this pass to the security desk upon check-out.\n4. In case of emergency, follow instructions of safety wardens.",
};



export default function PrintPassByIdPage() {
  const [searchId, setSearchId] = useState("");
  const [passData, setPassData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [printSettings, setPrintSettings] = useState(DEFAULT_PRINT_SETTINGS);
  
  const { employees } = useEmployees();

  // Load configuration from local storage
  useEffect(() => {
    const saved = localStorage.getItem("vms_print_settings");
    if (saved) {
      try {
        setPrintSettings({ ...DEFAULT_PRINT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse print settings from localStorage", e);
      }
    }
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) return;

    setIsLoading(true);
    setError("");
    setPassData(null);

    try {
      const data = await getPassById(searchId.trim());
      if (data) {
        setPassData(data);
      } else {
        setError("No Gate Pass found matching this ID/Short Code.");
      }
    } catch (err) {
      console.error("Failed to fetch pass data:", err);
      setError(err?.response?.data?.message || "Failed to locate Gate Pass. Please check backend connectivity.");
    } finally {
      setIsLoading(false);
    }
  };

  const getEmployeeName = (id) => {
    if (!id) return "-";
    const emp = employees.find((e) => e._id === id || e.id === id);
    return emp ? emp.name : id;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: "0 1.5rem 4rem 1.5rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header Panel */}
      <div style={{ marginBottom: "2rem" }}>
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
          <Printer style={{ color: "#000000" }} />
          Print Gate Pass by ID
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0.35rem 0 0 0", fontWeight: "500" }}>
          Scan, input, or copy a visitor's Gate Pass ID / Short Code to immediately load and print their facility access badge.
        </p>
      </div>

      {/* Search Input Box */}
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
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "280px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: "700",
                color: "#475569",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.025em",
              }}
              htmlFor="searchId"
            >
              Enter Gate Pass ID or Short Code
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                id="searchId"
                placeholder="e.g. A7B8C9 or standard Pass database ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                style={{
                  width: "100%",
                  height: "2.75rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #cbd5e1",
                  padding: "0 1rem 0 2.5rem",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "#f8fafc",
                  transition: "border-color 0.15s ease",
                }}
              />
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchId.trim()}
            style={{
              height: "2.75rem",
              padding: "0 1.5rem",
              borderRadius: "0.375rem",
              backgroundColor: !searchId.trim() ? "#cbd5e1" : "#000000",
              color: "#ffffff",
              border: "none",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: !searchId.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              transition: "opacity 0.2s",
            }}
          >
            {isLoading ? <Loader className="animate-spin" size={16} /> : <Search size={16} />}
            Search Pass
          </button>
        </form>
      </div>

      {/* Main Results View */}
      {isLoading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 0" }}>
          <div
            style={{
              width: "3rem",
              height: "3rem",
              border: "4px solid #e2e8f0",
              borderTopColor: "#000000",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span style={{ marginTop: "1rem", color: "#64748b", fontWeight: "600" }}>Fetching Gate Pass records...</span>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fee2e2",
            color: "#991b1b",
            padding: "1.25rem",
            borderRadius: "0.5rem",
            fontSize: "0.9rem",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <ShieldAlert size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {passData && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2.5rem", alignItems: "start", flexWrap: "wrap" }}>
          
          {/* Left Column: Pass Card Preview Frame */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "2px dashed #cbd5e1",
              borderRadius: "0.75rem",
              padding: "2rem",
              display: "flex",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            <GatePassTemplate passData={passData} printSettings={printSettings} getEmployeeName={getEmployeeName} />
          </div>

          {/* Right Column: Printing Details and Actions */}
          <div
            style={{
              width: "300px",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Pass Metadata</span>
              <h3 style={{ margin: "0.25rem 0 0.5rem 0", color: "#0f172a", fontSize: "1.1rem", fontWeight: "700" }}>
                {passData.name}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.85rem", color: "#475569" }}>
                <div>Status: <strong style={{ color: passData.status === "Approved" ? "#03543f" : "#b45309" }}>{passData.status}</strong></div>
                <div>Created: <strong>{new Date(passData.createdAt).toLocaleDateString()}</strong></div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
              <button
                onClick={handlePrint}
                style={{
                  width: "100%",
                  height: "2.75rem",
                  borderRadius: "0.375rem",
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`,
                }}
              >
                <Printer size={18} /> Print Access Pass
              </button>
            </div>

            <div
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                fontSize: "0.75rem",
                color: "#166534",
                lineHeight: "1.4",
              }}
            >
              🎉 <strong>Print Settings Active:</strong> This pass will be formatted into a <strong>{printSettings.paperSize}</strong> size badge automatically.
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
