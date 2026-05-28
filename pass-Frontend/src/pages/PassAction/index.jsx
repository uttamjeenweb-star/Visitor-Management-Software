/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { queryGet, queryPatch } from "@/shared/services/api";
import { useEmployees } from "@/features/employee/useEmployee";
import { useLocationUtils } from "@/shared/hooks/useLocation";

import { Timeline } from "./components/Timeline";
import { PassDetailSection } from "./components/PassDetailSection";
import { PhotoSection } from "./components/PhotoSection";
import { AccompanyingPersonsTable } from "./components/AccompanyingPersonsTable";
import { ActionButtons } from "./components/ActionButtons";

export default function PassActionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "view"; // "review-request", "approve", "view"

  const [passData, setPassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load employee choices for request review mode
  const { employees } = useEmployees();
  const { states, cities, setSelectedState } = useLocationUtils();

  // Fetch gate pass data
  const fetchPassData = async () => {
    try {
      setIsLoading(true);
      const res = await queryGet(`/capture/${id}`);
      if (res.data && res.data.data) {
        setPassData(res.data.data);
        if (res.data.data.state) {
          setSelectedState(res.data.data.state);
        }
      } else {
        setError("Pass not found.");
      }
    } catch (err) {
      console.error("Error fetching pass data:", err);
      setError("Failed to fetch pass details. Check backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPassData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Form field state change handler for "review-request" mode
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setPassData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for state transitions
  const handleSubmitAction = async (status, isRejection = false) => {
    let rejectionReason = "";
    if (isRejection) {
      rejectionReason = prompt("Please enter the reason for rejection:");
      if (rejectionReason === null) return; // user cancelled prompt
      if (!rejectionReason.trim()) {
        alert("Rejection reason is required.");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const payload = { status };
      if (isRejection) {
        payload.rejectionReason = rejectionReason.trim();
        payload.rejectedBy = "System Admin";
      }

      // If in review-request mode and moving to Pending, we also save the edited data
      if (mode === "review-request" && status === "Pending") {
        Object.assign(payload, {
          name: passData.name,
          mobileNo: passData.mobileNo,
          emailId: passData.emailId,
          companyName: passData.companyName,
          address: passData.address,
          state: passData.state,
          city: passData.city,
          representingVisitorType: passData.representingVisitorType,
          subLocation: passData.subLocation,
          toMeetWith: passData.toMeetWith,
          allowedHours: passData.allowedHours,
          purpose: passData.purpose,
        });
      }

      if (status === "Approved") {
        payload.approvedBy = "System Admin";
      }

      await queryPatch(`/capture/${id}/status`, payload);
      alert(`Gate pass successfully ${status === "Pending" ? "created" : status.toLowerCase()}!`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Action failed:", err);
      alert(err?.response?.data?.message || "Failed to update gate pass.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div
          className="spinner"
          style={{
            width: "3rem",
            height: "3rem",
            border: "4px solid #e2e8f0",
            borderTopColor: "#0f766e",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <span style={{ marginTop: "1rem", color: "#64748b", fontWeight: "500" }}>
          Loading pass details...
        </span>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !passData) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#991b1b" }}>
        <h2>⚠️ Error</h2>
        <p>{error || "Gate pass not found."}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn-secondary"
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1.5rem",
            borderRadius: "0.375rem",
            cursor: "pointer",
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const backendHost = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").replace("/api/v1", "");
  const resolveUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${backendHost}${url}`;
  };
  const photoUrl = resolveUrl(passData.photoUrl);

  // Helper to color-code status badge
  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return { bg: "#def7ec", text: "#03543f" };
      case "Pending":
        return { bg: "#fef3c7", text: "#92400e" };
      case "Requested":
        return { bg: "#e0f2fe", text: "#075985" };
      case "Checked-In":
        return { bg: "#e1f5fe", text: "#0288d1" };
      case "Checked-Out":
        return { bg: "#f3f4f6", text: "#374151" };
      case "Rejected":
        return { bg: "#fee2e2", text: "#9b1c1c" };
      default:
        return { bg: "#f1f5f9", text: "#475569" };
    }
  };

  const statusStyle = getStatusStyle(passData.status);
  const isEditable = mode === "review-request";

  return (
    <div
      style={{
        maxWidth: "65rem",
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Back to Dashboard Link */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "none",
          border: "none",
          color: "#0f766e",
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: "1.5rem",
          fontSize: "0.95rem",
        }}
      >
        ← Back to Dashboard
      </button>

      {/* Main card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "1rem",
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            padding: "2rem",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.6rem",
                  fontWeight: "800",
                  color: "#0f172a",
                  letterSpacing: "-0.025em",
                }}
              >
                Review Gate Pass
              </h1>
              <span
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "9999px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.text,
                  textTransform: "uppercase",
                }}
              >
                {passData.status}
              </span>
            </div>
            <p style={{ margin: "0.5rem 0 0 0", color: "#64748b", fontSize: "0.9rem", fontWeight: "500" }}>
              Gate Pass ID: <strong style={{ color: "#0f766e" }}>{passData.gatePassId || "-"}</strong>
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <span
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Pass Type
            </span>
            <div
              style={{
                marginTop: "0.25rem",
                backgroundColor: passData.gatePassType === "single" ? "#e0f2fe" : "#ede9fe",
                color: passData.gatePassType === "single" ? "#0369a1" : "#6d28d9",
                padding: "0.35rem 1rem",
                borderRadius: "0.5rem",
                fontWeight: "700",
                fontSize: "0.875rem",
                display: "inline-block",
              }}
            >
              {passData.gatePassType === "single" ? "Single Day" : "Multi Day"}
            </div>
          </div>
        </div>

        {/* Content body */}
        <div style={{ padding: "2rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {/* Form Fields Column */}
            <PassDetailSection
              isEditable={isEditable}
              passData={passData}
              handleFieldChange={handleFieldChange}
              employees={employees}
              states={states}
              cities={cities}
              setSelectedState={setSelectedState}
              setPassData={setPassData}
            />

            {/* Photo & Audit Timeline Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <PhotoSection photoUrl={photoUrl} passData={passData} />
              <Timeline passData={passData} />
            </div>
          </div>

          {/* Additional Accompanying Persons Section */}
          <AccompanyingPersonsTable passData={passData} backendHost={backendHost} />

          {/* Action Footer Panel */}
          <ActionButtons
            mode={mode}
            passData={passData}
            isSubmitting={isSubmitting}
            handleSubmitAction={handleSubmitAction}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}
