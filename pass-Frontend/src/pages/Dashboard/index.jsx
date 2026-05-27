import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { queryGet, queryPatch } from "@/shared/services/api";
import { StatCard } from "./components/StatCard";
import { ActionFormCard } from "./components/ActionFormCard";
import { DashboardTable } from "./components/DashboardTable";
import { PrintPassModal } from "./components/PrintPassModal";
import { useAuth } from "@/features/auth/AuthContext";

export default function DashbordPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Evaluate Permissions based on RBAC array
  const perms = user?.roleRef?.permissions || [];
  const dbPerms = perms.find((p) => p.module === "Dashboard");
  const actions = dbPerms?.dashboardActions || {};
  const isSuperAdmin = user?.role === "Super Admin";

  // Actions
  const canCreatePass = actions.create_pass || isSuperAdmin;
  const canApprovePass = actions.approve || isSuperAdmin;
  const canCheckIn = actions.check_in || isSuperAdmin;
  const canCheckOut = actions.check_out || isSuperAdmin;
  const canPrintPass = actions.print || isSuperAdmin;
  const canViewDetail = actions.view_detail || isSuperAdmin;

  // List Visibilities
  const canViewRequestList = actions.view_requested_list || isSuperAdmin;
  const canViewPendingList = actions.view_pending_approval_list || isSuperAdmin;
  const canViewRejectedList = actions.view_rejected_list || isSuperAdmin;
  const canViewApprovedList = actions.view_approved_list || isSuperAdmin;
  const canViewInsideList = actions.view_inside_list || isSuperAdmin;
  const canViewMultiDayList = actions.view_multi_day_list || isSuperAdmin;
  const canViewExitedList = actions.view_exited_list || isSuperAdmin;
  const canViewExpiredList = actions.view_expired_list || isSuperAdmin;

  const [dashboardState, setDashboardState] = useState({
    stats: { totalCompaniesGuest: 0, todaysGuest: 0 },
    requestPassData: [],
    approvedPassData: [],
    multiDayPassData: [],
    insidePassData: [],
    exitApprovedPassData: [],
    pendingApprovalPassData: [],
    expiredPassData: [],
    rejectedPassData: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Printing modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPassForPrint, setSelectedPassForPrint] = useState(null);

  const handlePrintTrigger = (row) => {
    setSelectedPassForPrint(row);
    setIsPrintModalOpen(true);
  };

  // Fetch initial data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await queryGet("/capture/dashboard/data");
      if (res.data && res.data.data) {
        setDashboardState(res.data.data);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to fetch initial dashboard data. Check backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // SSE connection for Real-time database changes
    const apiUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").trim();
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || "";
    const sseUrl = `${apiUrl}/capture/dashboard/stream?token=${token}`;
    console.log("Connecting to SSE stream:", sseUrl);

    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        console.log("SSE Message Received:", parsed.event);
        if (parsed.event === "dashboard-update" && parsed.data) {
          setDashboardState(parsed.data);
          setError(null);
        }
      } catch (err) {
        console.error("SSE parse message error:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection error, retrying...", err);
      // Wait for 5 seconds before attempting to show error
      setTimeout(() => {
        setError("Real-time connection interrupted. Offline mode.");
      }, 5000);
    };

    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
  }, []);

  const handleUpdateStatus = async (passId, newStatus, additionalData = {}) => {
    try {
      await queryPatch(`/capture/${passId}/status`, { status: newStatus, ...additionalData });
      // The SSE broadcast will update all states automatically and instantly!
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err?.response?.data?.message || "Failed to update pass status.");
    }
  };

  const handleCheckIn = (row) => {
    const securityName = prompt(
      "Please enter the name of the security personnel logging this visitor IN:",
      "Security Gate 1",
    );
    if (securityName === null) return; // cancelled
    if (!securityName.trim()) {
      alert("Security personnel name is required.");
      return;
    }
    handleUpdateStatus(row.id, "Checked-In", { checkedInBy: securityName.trim() });
  };

  const handleCheckOut = (row) => {
    const securityName = prompt(
      "Please enter the name of the security personnel logging this visitor OUT:",
      "Security Gate 1",
    );
    if (securityName === null) return; // cancelled
    if (!securityName.trim()) {
      alert("Security personnel name is required.");
      return;
    }
    handleUpdateStatus(row.id, "Checked-Out", { checkedOutBy: securityName.trim() });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(0.9);
            opacity: 1;
          }
          70% {
            transform: scale(1.2);
            opacity: 0.5;
          }
          100% {
            transform: scale(0.9);
            opacity: 1;
          }
        }
      `}</style>

      {/* Top Navbar */}
      <header
        style={{
          width: "100%",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "4rem",
            padding: "0 2rem",
            maxWidth: "100%",
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ fontWeight: "800", fontSize: "1.4rem", color: "#0f766e", letterSpacing: "-0.025em" }}>
              Visitor Control Center
            </div>
            {/* Live syncing indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#f0fdf4",
                padding: "0.375rem 0.75rem",
                borderRadius: "9999px",
                border: "1px solid #dcfce7",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  animation: "pulse 2s infinite",
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "#166534", fontWeight: "600" }}>
                Real-Time Live
              </span>
            </div>
          </div>

          <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: "500" }}>
            Today:{" "}
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ display: "flex", flex: 1, boxSizing: "border-box" }}>
        <div style={{ flex: 1, padding: "2rem 0", boxSizing: "border-box" }}>
          <div style={{ maxWidth: "85rem", margin: "0 auto", boxSizing: "border-box" }}>
            {/* Error notifications */}
            {error && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fee2e2",
                  color: "#991b1b",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  marginBottom: "1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Top Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {/* Primary Action Button acting as a card */}
              {canCreatePass && (
                <button
                  onClick={() => navigate("/create-pass")}
                  style={{
                    height: "auto",
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2rem 1.5rem",
                    backgroundColor: "#f59e0b",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "0.75rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(245, 158, 11, 0.3)",
                    transition: "transform 0.2s, background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.backgroundColor = "#d97706";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.backgroundColor = "#f59e0b";
                  }}
                >
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>➕</div>
                  <span>Create New Gate Pass</span>
                </button>
              )}

              <StatCard
                title="Total Visitors Registered"
                value={dashboardState.stats.totalCompaniesGuest}
                icon="👥"
                colorHex="#ef4444"
              />
              <StatCard
                title="Today's Guests"
                value={dashboardState.stats.todaysGuest}
                icon="📅"
                colorHex="#3b82f6"
              />
            </div>

            {/* Quick Actions / Forms */}
            {(canCheckIn || canCheckOut) && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "1.5rem",
                  marginTop: "2rem",
                }}
              >
                {canCheckIn && (
                  <ActionFormCard
                    title="PASS LOG IN (Check-In)"
                    buttonText="Log In"
                    onSubmit={(visitorId) => handleUpdateStatus(visitorId, "Checked-In")}
                  />
                )}
                {canCheckOut && (
                  <ActionFormCard
                    title="PASS LOG OUT (Check-Out)"
                    buttonText="Log Out"
                    onSubmit={(visitorId) => handleUpdateStatus(visitorId, "Checked-Out")}
                  />
                )}
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5rem 0",
                }}
              >
                <div
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
                  Loading real data...
                </span>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : (
              /* Tables Section */
              <div style={{ marginTop: "1rem", paddingBottom: "5rem" }}>
                {canViewRequestList && (
                  <DashboardTable
                    title="Requested Passes (Awaiting Creation)"
                    columns={[
                      "PASS",
                      "GATE PASS ID",
                      "Pass Date",
                      "Name",
                      "Employee",
                      "Mobile No",
                      "Email-Id",
                    ]}
                    data={dashboardState.requestPassData}
                    actionLabel={canCreatePass ? "Create Pass" : undefined}
                    actionButtonColor="#f59e0b"
                    onAction={canCreatePass ? (row) => navigate(`/pass/${row.id}/action?mode=review-request`) : undefined}
                  />
                )}

                {canViewPendingList && (
                  <DashboardTable
                    title="Pending Approval Passes"
                    columns={[
                      "PASS",
                      "GATE PASS ID",
                      "Pass Date",
                      "Name",
                      "Employee",
                      "Mobile No",
                      "Email-Id",
                    ]}
                    data={dashboardState.pendingApprovalPassData}
                    actionLabel={canApprovePass ? "Review & Approve" : undefined}
                    actionButtonColor="#0f766e"
                    onAction={canApprovePass ? (row) => navigate(`/pass/${row.id}/action?mode=approve`) : undefined}
                  />
                )}

                {canViewRejectedList && (
                  <DashboardTable
                    title="Rejected Passes"
                    columns={[
                      "PASS",
                      "GATE PASS ID",
                      "Pass Date",
                      "Name",
                      "Employee",
                      "Mobile No",
                      "Rejected By",
                      "Rejection Reason",
                      "Status",
                    ]}
                    data={dashboardState.rejectedPassData}
                    actionLabel="View Details"
                    actionButtonColor="#475569"
                    onAction={(row) => navigate(`/pass/${row.id}/action?mode=view`)}
                  />
                )}

                {canViewApprovedList && (
                  <DashboardTable
                    title="Approved Visitor Passes (Ready to Check In)"
                    columns={["PASS", "GATE PASS ID", "Pass Date", "Timer", "Name", "Employee", "Mobile No"]}
                    data={dashboardState.approvedPassData}
                    actionLabel={canCheckIn ? "Check-In" : undefined}
                    actionButtonColor="#3b82f6"
                    onAction={canCheckIn ? (row) => handleCheckIn(row) : undefined}
                    showPrintAction={canPrintPass}
                    onPrint={canPrintPass ? (row) => handlePrintTrigger(row) : undefined}
                  />
                )}

                {canViewInsideList && (
                  <DashboardTable
                    title="Currently Inside Facility"
                    columns={[
                      "PASS",
                      "GATE PASS ID",
                      "Pass Date",
                      "Timer",
                      "Name",
                      "Employee",
                      "Mobile No",
                      "Checked-In By",
                      "Checked-In At",
                    ]}
                    data={dashboardState.insidePassData}
                    actionLabel={canCheckOut ? "Check-Out" : undefined}
                    actionButtonColor="#e11d48"
                    onAction={canCheckOut ? (row) => handleCheckOut(row) : undefined}
                    showPrintAction={canPrintPass}
                    onPrint={canPrintPass ? (row) => handlePrintTrigger(row) : undefined}
                  />
                )}

                {canViewMultiDayList && (
                  <DashboardTable
                    title="Multi Day Visit Passes"
                    columns={["GATE PASS ID", "Name", "Date", "Employee", "Mobile No", "Email-Id", "EXP Date", "Status"]}
                    data={dashboardState.multiDayPassData}
                    actionLabel="View Details"
                    actionButtonColor="#6d28d9"
                    onAction={(row) => navigate(`/pass/${row.id}/action?mode=view`)}
                  />
                )}

                {canViewExitedList && (
                  <DashboardTable
                    title="Exited Visitors (Exit Pass)"
                    columns={[
                      "PASS",
                      "GATE PASS ID",
                      "Pass Date",
                      "Name",
                      "Employee",
                      "Mobile No",
                      "Checked-In",
                      "Checked-Out",
                    ]}
                    data={dashboardState.exitApprovedPassData}
                    actionLabel={canViewDetail ? "View Details" : undefined}
                    actionButtonColor="#475569"
                    onAction={canViewDetail ? (row) => navigate(`/pass/${row.id}/action?mode=view`) : undefined}
                    showPrintAction={canPrintPass}
                    onPrint={canPrintPass ? (row) => handlePrintTrigger(row) : undefined}
                  />
                )}

                {canViewExpiredList && (
                  <DashboardTable
                    title="Expired Passes (Past Date)"
                    columns={[
                      "PASS",
                      "GATE PASS ID",
                      "Pass Date",
                      "Name",
                      "Employee",
                      "Mobile No",
                      "Status",
                    ]}
                    data={dashboardState.expiredPassData}
                    actionLabel="View Details"
                    actionButtonColor="#475569"
                    onAction={(row) => navigate(`/pass/${row.id}/action?mode=view`)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <PrintPassModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        passData={selectedPassForPrint}
      />
    </div>
  );
}
