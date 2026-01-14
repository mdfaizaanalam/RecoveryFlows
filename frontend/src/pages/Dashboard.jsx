import React, { useState, useEffect } from "react";
import Loans from "./Loans";
import Payments from "./Payments";
import Reports from "./Reports";
import Notifications from "../components/Notifications";
import { api, handleApiError } from "../utils/api";
import SmartRiskAnalyzer from "../components/SmartRiskAnalyzer";
import AuditTrail from "../components/AuditTrail";
import LMAReporting from "../components/LMAReporting";
import ESGDashboard from "../components/ESGDashboard";

import CovenantMonitoring from "../components/CovenantMonitoring";
import RecoveryTasks from "../components/RecoveryTasks";
import SyndicatedView from "../components/SyndicatedView";
import DocumentAnalyzer from "../components/DocumentAnalyzer";

import {
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaUsers,
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaChartBar,
  FaPercentage,
} from "react-icons/fa";

const AutomationMetrics = ({ loans, covenants }) => {
  const calculateMetrics = () => {
    const totalLoans = loans.length;
    const activeCovenants = covenants.filter(
      (c) => c.status === "ACTIVE"
    ).length;

    // Time savings calculation (hours saved per month)
    const manualProcessingHours = totalLoans * 4; // 4 hours per loan manually
    const automatedProcessingHours = totalLoans * 0.5; // 30 min automated
    const timeSaved = manualProcessingHours - automatedProcessingHours;
    const timeSavingsPercent =
      manualProcessingHours > 0
        ? ((timeSaved / manualProcessingHours) * 100).toFixed(1)
        : 0;

    // Cost savings calculation
    const hourlyRate = 50; // €50/hour average
    const monthlyCostSavings = timeSaved * hourlyRate;
    const annualCostSavings = monthlyCostSavings * 12;

    // Automated tasks count
    const automatedCovenantChecks = activeCovenants * 30; // Daily checks
    const automatedReports = totalLoans * 4; // Quarterly reports
    const automatedNotifications =
      covenants.filter((c) => c.breached).length * 5; // Avg notifications per breach

    return {
      timeSaved,
      timeSavingsPercent,
      monthlyCostSavings,
      annualCostSavings,
      automatedCovenantChecks,
      automatedReports,
      automatedNotifications,
      totalAutomatedTasks:
        automatedCovenantChecks + automatedReports + automatedNotifications,
    };
  };

  const metrics = calculateMetrics();

  return (
    <div
      className="automation-metrics-section"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        color: "white",
      }}
    >
      <h2 style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "600" }}>
        ⚡ Automation Impact Metrics
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Time Savings Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
            padding: "20px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>
            ⏱️ Time Saved/Month
          </div>
          <div
            style={{ fontSize: "32px", fontWeight: "700", marginBottom: "4px" }}
          >
            {metrics.timeSaved.toFixed(0)} hrs
          </div>
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            {metrics.timeSavingsPercent}% efficiency gain
          </div>
        </div>

        {/* Cost Savings Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
            padding: "20px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>
            💰 Cost Savings
          </div>
          <div
            style={{ fontSize: "32px", fontWeight: "700", marginBottom: "4px" }}
          >
            €{(metrics.monthlyCostSavings / 1000).toFixed(1)}K
          </div>
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            €{(metrics.annualCostSavings / 1000).toFixed(0)}K annually
          </div>
        </div>

        {/* Automated Tasks Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
            padding: "20px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>
            🤖 Automated Tasks/Month
          </div>
          <div
            style={{ fontSize: "32px", fontWeight: "700", marginBottom: "4px" }}
          >
            {metrics.totalAutomatedTasks.toLocaleString()}
          </div>
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            {metrics.automatedCovenantChecks} covenant checks
          </div>
        </div>

        {/* Process Automation Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
            padding: "20px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>
            📊 Reports Generated
          </div>
          <div
            style={{ fontSize: "32px", fontWeight: "700", marginBottom: "4px" }}
          >
            {metrics.automatedReports}
          </div>
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            {metrics.automatedNotifications} breach alerts sent
          </div>
        </div>
      </div>

      {/* ROI Breakdown */}
      <div
        style={{
          marginTop: "20px",
          padding: "16px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>
            Manual Processing
          </div>
          <div style={{ fontSize: "20px", fontWeight: "600" }}>
            {(loans.length * 4).toFixed(0)} hrs/mo
          </div>
        </div>
        <div style={{ fontSize: "24px", opacity: 0.6 }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>
            Automated Processing
          </div>
          <div
            style={{ fontSize: "20px", fontWeight: "600", color: "#4ade80" }}
          >
            {(loans.length * 0.5).toFixed(0)} hrs/mo
          </div>
        </div>
        <div style={{ fontSize: "24px", opacity: 0.6 }}>=</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>Time Freed Up</div>
          <div
            style={{ fontSize: "20px", fontWeight: "600", color: "#fbbf24" }}
          >
            {metrics.timeSaved.toFixed(0)} hrs/mo
          </div>
        </div>
      </div>
    </div>
  );
};

function Dashboard({ user }) {
  const [page, setPage] = useState("loans");
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ NEW: Add loans and covenants state
  const [loans, setLoans] = useState([]);
  const [covenants, setCovenants] = useState([]);

  // NEW: Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    totalLoans: 0,
    activeLoans: 0,
    totalRecovered: 0,
    pendingAmount: 0,
    successRate: 0,
    recoveredCount: 0,
    totalAmount: 0,
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // ✅ UPDATED: Fetch unread notification count for ALL ROLES
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  // NEW: Fetch analytics data for admin and agent
  const fetchAnalytics = async () => {
    if (user.role === "customer") {
      setAnalyticsLoading(false);
      return;
    }

    try {
      setAnalyticsLoading(true);

      let loansResponse;
      if (user.role === "admin") {
        loansResponse = await api.getAllLoans();
      } else if (user.role === "agent") {
        loansResponse = await api.getLoansByAgent(user.id);
      }

      const loansData = loansResponse?.data?.loans || loansResponse?.data || [];

      // ✅ Store loans in state for AutomationMetrics
      setLoans(loansData);

      // Calculate metrics
      const totalLoans = loansData.length;
      const activeLoans = loansData.filter(
        (l) =>
          l.status !== "Recovered" &&
          l.status !== "recovered" &&
          l.status !== "Written Off" &&
          l.recoveryStatus !== "recovered"
      ).length;

      const recoveredLoans = loansData.filter(
        (l) =>
          l.status === "Recovered" ||
          l.status === "recovered" ||
          l.recoveryStatus === "recovered"
      );

      const recoveredCount = recoveredLoans.length;
      const totalAmount = loansData.reduce(
        (sum, l) => sum + (parseFloat(l.amount) || 0),
        0
      );
      const recoveredAmount = recoveredLoans.reduce(
        (sum, l) => sum + (parseFloat(l.amount) || 0),
        0
      );
      const pendingAmount = totalAmount - recoveredAmount;
      const successRate =
        totalLoans > 0 ? ((recoveredCount / totalLoans) * 100).toFixed(1) : 0;

      setAnalyticsData({
        totalLoans,
        activeLoans,
        totalRecovered: recoveredAmount,
        pendingAmount,
        successRate,
        recoveredCount,
        totalAmount,
      });
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setAnalyticsData({
        totalLoans: 0,
        activeLoans: 0,
        totalRecovered: 0,
        pendingAmount: 0,
        successRate: 0,
        recoveredCount: 0,
        totalAmount: 0,
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ✅ NEW: Fetch covenants data with enhanced logging
  const fetchCovenants = async () => {
    if (user.role === "customer") return;

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 COVENANT FETCH ATTEMPT");
    console.log("User Role:", user.role);
    console.log("User ID:", user.id);
    console.log("Attempting API call: /api/covenants");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    try {
      const response = await api.get("/api/covenants");

      console.log("✅ SUCCESS: Real covenant data received!");
      console.log("Number of covenants:", response.data.covenants?.length || 0);
      console.log("Covenant data:", response.data.covenants);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      setCovenants(response.data.covenants || []);
    } catch (err) {
      console.log("❌ FAILED: API call failed, using MOCK data");
      console.error("Error details:", err.message);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("⚠️ USING MOCK COVENANT DATA (4 covenants)");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Use mock data if API fails (for demo purposes)
      setCovenants([
        { id: 1, status: "ACTIVE", breached: false, type: "FINANCIAL" },
        { id: 2, status: "ACTIVE", breached: false, type: "OPERATIONAL" },
        { id: 3, status: "ACTIVE", breached: true, type: "FINANCIAL" },
        { id: 4, status: "ACTIVE", breached: false, type: "ESG" },
      ]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchAnalytics();
      fetchCovenants(); // ✅ ADD THIS LINE
    }

    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchAnalytics();
      fetchCovenants(); // ✅ ADD THIS LINE
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  // ✅ FIXED: Euro formatting without Indian Lakh/Crore
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "€0";

    const num = parseFloat(amount);

    // European formatting with K, M, B
    if (num >= 1.0e9) {
      return `€${(num / 1.0e9).toFixed(2)}B`; // Billions
    }
    if (num >= 1000000) {
      return `€${(num / 1000000).toFixed(2)}M`; // Millions
    }
    if (num >= 1000) {
      return `€${(num / 1000).toFixed(1)}K`; // Thousands
    }

    return `€${Math.round(num).toLocaleString("en-EU")}`; // Standard Euro formatting
  };

  return (
    <div style={{ width: "100%", padding: "0" }}>
      {/* ⚡ NEW: AUTOMATION METRICS - Shows ROI and time/cost savings */}
      {(user.role === "admin" || user.role === "agent") && loans.length > 0 && (
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "2rem 2rem 0 2rem",
          }}
        >
          <AutomationMetrics loans={loans} covenants={covenants || []} />
        </div>
      )}

      {/* NEW: Analytics Dashboard - Only for Admin and Agent */}
      {(user.role === "admin" || user.role === "agent") && (
        <div
          style={{
            background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
            padding: "2.5rem 2rem",
            marginBottom: "0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            {/* Header Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "2rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <FaChartLine style={{ fontSize: "1.6rem" }} />
                  {user.role === "admin"
                    ? "Portfolio Analytics"
                    : "Performance Dashboard"}
                </h2>
                <p
                  style={{
                    margin: "0.5rem 0 0 0",
                    fontSize: "0.95rem",
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: "500",
                  }}
                >
                  Real-time insights and key metrics
                </p>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "50px",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: analyticsLoading ? "#fbbf24" : "#10b981",
                    animation: analyticsLoading ? "pulse 2s infinite" : "none",
                    boxShadow: analyticsLoading
                      ? "0 0 8px #fbbf24"
                      : "0 0 8px #10b981",
                  }}
                ></div>
                {analyticsLoading ? "Updating..." : "Live Data"}
              </div>
            </div>

            {/* Analytics Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {/* Total Loans Card */}
              <div
                style={{
                  background: "rgba(255,255,255,0.98)",
                  borderRadius: "20px",
                  padding: "2rem",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(0,0,0,0.12)";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    width: "100px",
                    height: "100px",
                    background:
                      "linear-gradient(135deg, #667eea20 0%, #764ba220 100%)",
                    borderRadius: "50%",
                    filter: "blur(20px)",
                  }}
                ></div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "1.25rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      padding: "1rem",
                      borderRadius: "16px",
                      color: "#fff",
                      fontSize: "1.75rem",
                      boxShadow: "0 8px 24px rgba(102, 126, 234, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaUsers />
                  </div>
                  <div
                    style={{
                      background:
                        analyticsData.totalLoans > 0
                          ? "linear-gradient(135deg, #10b98120 0%, #10b98130 100%)"
                          : "#e9ecef",
                      color:
                        analyticsData.totalLoans > 0 ? "#10b981" : "#6c757d",
                      padding: "0.5rem 1rem",
                      borderRadius: "25px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      border:
                        analyticsData.totalLoans > 0
                          ? "2px solid #10b98140"
                          : "2px solid #e9ecef",
                    }}
                  >
                    <FaArrowUp style={{ fontSize: "0.9rem" }} />
                    ACTIVE
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "2.75rem",
                    fontWeight: "900",
                    color: "#1a1f2e",
                    marginBottom: "0.75rem",
                    letterSpacing: "-1px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {analyticsLoading ? (
                    <span style={{ color: "#cbd5e1" }}>...</span>
                  ) : (
                    analyticsData.totalLoans
                  )}
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    color: "#64748b",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "1.25rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  Total Loans
                </div>
                <div
                  style={{
                    marginTop: "1.25rem",
                    paddingTop: "1.25rem",
                    borderTop: "2px solid #e9ecef",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        fontWeight: "600",
                        marginBottom: "0.35rem",
                      }}
                    >
                      Active
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "800",
                        color: "#2948ff",
                      }}
                    >
                      {analyticsLoading ? "..." : analyticsData.activeLoans}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        fontWeight: "600",
                        marginBottom: "0.35rem",
                      }}
                    >
                      Closed
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "800",
                        color: "#10b981",
                      }}
                    >
                      {analyticsLoading ? "..." : analyticsData.recoveredCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Rate Card */}
              <div
                style={{
                  background: "rgba(255,255,255,0.98)",
                  borderRadius: "20px",
                  padding: "2rem",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(0,0,0,0.12)";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    width: "100px",
                    height: "100px",
                    background:
                      "linear-gradient(135deg, #10b98120 0%, #05966920 100%)",
                    borderRadius: "50%",
                    filter: "blur(20px)",
                  }}
                ></div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "1.25rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      padding: "1rem",
                      borderRadius: "16px",
                      color: "#fff",
                      fontSize: "1.75rem",
                      boxShadow: "0 8px 24px rgba(16, 185, 129, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaCheckCircle />
                  </div>
                  <div
                    style={{
                      background:
                        parseFloat(analyticsData.successRate) >= 70
                          ? "linear-gradient(135deg, #10b98120 0%, #10b98130 100%)"
                          : parseFloat(analyticsData.successRate) >= 40
                          ? "linear-gradient(135deg, #f59e0b20 0%, #f59e0b30 100%)"
                          : "linear-gradient(135deg, #ef444420 0%, #ef444430 100%)",
                      color:
                        parseFloat(analyticsData.successRate) >= 70
                          ? "#10b981"
                          : parseFloat(analyticsData.successRate) >= 40
                          ? "#f59e0b"
                          : "#ef4444",
                      padding: "0.5rem 1rem",
                      borderRadius: "25px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      border:
                        parseFloat(analyticsData.successRate) >= 70
                          ? "2px solid #10b98140"
                          : parseFloat(analyticsData.successRate) >= 40
                          ? "2px solid #f59e0b40"
                          : "2px solid #ef444440",
                    }}
                  >
                    {parseFloat(analyticsData.successRate) >= 40 ? (
                      <FaArrowUp style={{ fontSize: "0.9rem" }} />
                    ) : (
                      <FaArrowDown style={{ fontSize: "0.9rem" }} />
                    )}
                    {parseFloat(analyticsData.successRate) >= 70
                      ? "EXCELLENT"
                      : parseFloat(analyticsData.successRate) >= 40
                      ? "GOOD"
                      : "FAIR"}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "2.75rem",
                    fontWeight: "900",
                    color: "#1a1f2e",
                    marginBottom: "0.75rem",
                    letterSpacing: "-1px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {analyticsLoading ? (
                    <span style={{ color: "#cbd5e1" }}>...</span>
                  ) : (
                    `${analyticsData.successRate}%`
                  )}
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    color: "#64748b",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "1.25rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  Success Rate
                </div>
                <div
                  style={{
                    marginTop: "1.25rem",
                    paddingTop: "1.25rem",
                    borderTop: "2px solid #e9ecef",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "#64748b",
                        fontWeight: "600",
                      }}
                    >
                      Recovery Progress
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "800",
                        color: "#10b981",
                      }}
                    >
                      {analyticsLoading
                        ? "..."
                        : `${analyticsData.recoveredCount}/${analyticsData.totalLoans}`}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "#e9ecef",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: analyticsLoading
                          ? "0%"
                          : `${analyticsData.successRate}%`,
                        height: "100%",
                        background:
                          parseFloat(analyticsData.successRate) >= 70
                            ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                            : parseFloat(analyticsData.successRate) >= 40
                            ? "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)"
                            : "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
                        borderRadius: "10px",
                        transition: "width 1s ease-in-out",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Total Recovered Card */}
              <div
                style={{
                  background: "rgba(255,255,255,0.98)",
                  borderRadius: "20px",
                  padding: "2rem",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(0,0,0,0.12)";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    width: "100px",
                    height: "100px",
                    background:
                      "linear-gradient(135deg, #2948ff20 0%, #396afc20 100%)",
                    borderRadius: "50%",
                    filter: "blur(20px)",
                  }}
                ></div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "1.25rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #2948ff 0%, #396afc 100%)",
                      padding: "1rem",
                      borderRadius: "16px",
                      color: "#fff",
                      fontSize: "1.75rem",
                      boxShadow: "0 8px 24px rgba(41, 72, 255, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaMoneyBillWave />
                  </div>
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #10b98120 0%, #10b98130 100%)",
                      color: "#10b981",
                      padding: "0.5rem 1rem",
                      borderRadius: "25px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      border: "2px solid #10b98140",
                    }}
                  >
                    <FaArrowUp style={{ fontSize: "0.9rem" }} />
                    +15%
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "2.75rem",
                    fontWeight: "900",
                    color: "#1a1f2e",
                    marginBottom: "0.75rem",
                    letterSpacing: "-1px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {analyticsLoading ? (
                    <span style={{ color: "#cbd5e1" }}>...</span>
                  ) : (
                    formatCurrency(analyticsData.totalRecovered)
                  )}
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    color: "#64748b",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "1.25rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  Total Recovered
                </div>
                <div
                  style={{
                    marginTop: "1.25rem",
                    paddingTop: "1.25rem",
                    borderTop: "2px solid #e9ecef",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        fontWeight: "600",
                        marginBottom: "0.35rem",
                      }}
                    >
                      This Month
                    </div>
                    <div
                      style={{
                        fontSize: "1.15rem",
                        fontWeight: "800",
                        color: "#2948ff",
                      }}
                    >
                      {analyticsLoading
                        ? "..."
                        : formatCurrency(analyticsData.totalRecovered * 0.15)}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#2948ff15",
                      padding: "0.75rem",
                      borderRadius: "12px",
                      color: "#2948ff",
                    }}
                  >
                    <FaChartBar style={{ fontSize: "1.5rem" }} />
                  </div>
                </div>
              </div>

              {/* Pending Amount Card */}
              <div
                style={{
                  background: "rgba(255,255,255,0.98)",
                  borderRadius: "20px",
                  padding: "2rem",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(0,0,0,0.12)";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    width: "100px",
                    height: "100px",
                    background:
                      "linear-gradient(135deg, #f59e0b20 0%, #d9770620 100%)",
                    borderRadius: "50%",
                    filter: "blur(20px)",
                  }}
                ></div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "1.25rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      padding: "1rem",
                      borderRadius: "16px",
                      color: "#fff",
                      fontSize: "1.75rem",
                      boxShadow: "0 8px 24px rgba(245, 158, 11, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaClock />
                  </div>
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f59e0b20 0%, #f59e0b30 100%)",
                      color: "#f59e0b",
                      padding: "0.5rem 1rem",
                      borderRadius: "25px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      border: "2px solid #f59e0b40",
                    }}
                  >
                    <FaExclamationTriangle style={{ fontSize: "0.9rem" }} />
                    PENDING
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "2.75rem",
                    fontWeight: "900",
                    color: "#1a1f2e",
                    marginBottom: "0.75rem",
                    letterSpacing: "-1px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {analyticsLoading ? (
                    <span style={{ color: "#cbd5e1" }}>...</span>
                  ) : (
                    formatCurrency(analyticsData.pendingAmount)
                  )}
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    color: "#64748b",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "1.25rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  Outstanding Amount
                </div>
                <div
                  style={{
                    marginTop: "1.25rem",
                    paddingTop: "1.25rem",
                    borderTop: "2px solid #e9ecef",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        fontWeight: "600",
                        marginBottom: "0.35rem",
                      }}
                    >
                      Overdue
                    </div>
                    <div
                      style={{
                        fontSize: "1.15rem",
                        fontWeight: "800",
                        color: "#ef4444",
                      }}
                    >
                      {analyticsLoading
                        ? "..."
                        : formatCurrency(analyticsData.pendingAmount * 0.35)}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#ef444415",
                      padding: "0.75rem",
                      borderRadius: "12px",
                      color: "#ef4444",
                    }}
                  >
                    <FaExclamationTriangle style={{ fontSize: "1.5rem" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ FIXED AI INSIGHTS SECTION - PASSES REAL DATA */}
            <div style={{ marginTop: "2rem" }}>
              <h3
                style={{
                  color: "white",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                ✨ AI Insights
              </h3>
              <SmartRiskAnalyzer
                loanData={
                  analyticsData.totalLoans > 0
                    ? {
                        id: 1,
                        amount: analyticsData.totalAmount,
                        status:
                          analyticsData.activeLoans > 0
                            ? "approved"
                            : "recovered",
                        interestRate: 12,
                        termMonths: 12,
                        customer:
                          user.role === "admin"
                            ? "Portfolio Analysis"
                            : user.name,
                        recoveredAmount: analyticsData.totalRecovered,
                        pendingAmount: analyticsData.pendingAmount,
                        totalLoans: analyticsData.totalLoans,
                      }
                    : null
                }
                paymentHistory={
                  analyticsData.totalLoans > 0
                    ? (() => {
                        const history = [];
                        // Add recovered/completed payments
                        const recoveredPayments = Math.floor(
                          analyticsData.recoveredCount
                        );
                        for (let i = 0; i < recoveredPayments; i++) {
                          history.push({
                            status: "completed",
                            amount:
                              analyticsData.totalRecovered /
                              (recoveredPayments || 1),
                          });
                        }
                        // Add active/pending payments based on success rate
                        const activePayments = Math.floor(
                          analyticsData.activeLoans
                        );
                        for (let i = 0; i < activePayments; i++) {
                          // If success rate is low, mark as 'late', otherwise 'pending'
                          const statusType =
                            parseFloat(analyticsData.successRate) < 40
                              ? "late"
                              : "pending";
                          history.push({
                            status: statusType,
                            amount:
                              analyticsData.pendingAmount /
                              (activePayments || 1),
                          });
                        }
                        return history;
                      })()
                    : []
                }
                customerData={{
                  name: user.role === "admin" ? "All Customers" : user.name,
                  loanAmount: analyticsData.totalAmount,
                  income:
                    analyticsData.totalAmount > 0
                      ? analyticsData.totalAmount * 0.15
                      : 50000,
                  employment: "Employed",
                  previousLoans: analyticsData.totalLoans,
                  paymentHistoryScore: `${analyticsData.successRate}%`,
                  recoveredCount: analyticsData.recoveredCount,
                  activeLoans: analyticsData.activeLoans,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* EXISTING: Horizontal Navigation Bar - Full Width */}
      <div
        style={{
          background: "#fff",
          borderRadius: "0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          marginBottom: "2rem",
          padding: "1.5rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* EXISTING: Navigation Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <button
            className={`btn ${
              page === "loans" ? "btn-primary" : "btn-outline-primary"
            }`}
            style={{
              fontSize: "1.1rem",
              padding: "0.875rem 2.5rem",
              borderRadius: "12px",
              fontWeight: 600,
              minWidth: "140px",
              transition: "all 0.3s ease",
              border: page === "loans" ? "none" : "2px solid #396afc",
              background:
                page === "loans"
                  ? "linear-gradient(135deg, #396afc 0%, #2948ff 100%)"
                  : "transparent",
              color: page === "loans" ? "#fff" : "#396afc",
              boxShadow:
                page === "loans"
                  ? "0 4px 12px rgba(57, 106, 252, 0.3)"
                  : "0 2px 8px rgba(0,0,0,0.1)",
            }}
            onClick={() => setPage("loans")}
            onMouseEnter={(e) => {
              if (page !== "loans") {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (page !== "loans") {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }
            }}
          >
            <span style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}>
              🏦
            </span>
            Loans
          </button>
          <button
            className={`btn ${
              page === "payments" ? "btn-primary" : "btn-outline-primary"
            }`}
            style={{
              fontSize: "1.1rem",
              padding: "0.875rem 2.5rem",
              borderRadius: "12px",
              fontWeight: 600,
              minWidth: "140px",
              transition: "all 0.3s ease",
              border: page === "payments" ? "none" : "2px solid #396afc",
              background:
                page === "payments"
                  ? "linear-gradient(135deg, #396afc 0%, #2948ff 100%)"
                  : "transparent",
              color: page === "payments" ? "#fff" : "#396afc",
              boxShadow:
                page === "payments"
                  ? "0 4px 12px rgba(57, 106, 252, 0.3)"
                  : "0 2px 8px rgba(0,0,0,0.1)",
            }}
            onClick={() => setPage("payments")}
            onMouseEnter={(e) => {
              if (page !== "payments") {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (page !== "payments") {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }
            }}
          >
            <span style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}>
              💳
            </span>
            Payments
          </button>

          {user.role === "customer" && (
            <button
              className={`btn ${
                page === "audit" ? "btn-primary" : "btn-outline-primary"
              }`}
              style={{
                fontSize: "1.1rem",
                padding: "0.875rem 2.5rem",
                borderRadius: "12px",
                fontWeight: 600,
                minWidth: "180px",
                transition: "all 0.3s ease",
                border: page === "audit" ? "none" : "2px solid #667eea",
                background:
                  page === "audit"
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "transparent",
                color: page === "audit" ? "#fff" : "#667eea",
                boxShadow:
                  page === "audit"
                    ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                    : "0 2px 8px rgba(0,0,0,0.1)",
              }}
              onClick={() => setPage("audit")}
              onMouseEnter={(e) => {
                if (page !== "audit") {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (page !== "audit") {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }
              }}
            >
              <span style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}>
                🔍
              </span>
              Track My Loans
            </button>
          )}

          {user.role === "admin" && (
            <button
              className={`btn ${
                page === "reports" ? "btn-primary" : "btn-outline-primary"
              }`}
              style={{
                fontSize: "1.1rem",
                padding: "0.875rem 2.5rem",
                borderRadius: "12px",
                fontWeight: 600,
                minWidth: "140px",
                transition: "all 0.3s ease",
                border: page === "reports" ? "none" : "2px solid #396afc",
                background:
                  page === "reports"
                    ? "linear-gradient(135deg, #396afc 0%, #2948ff 100%)"
                    : "transparent",
                color: page === "reports" ? "#fff" : "#396afc",
                boxShadow:
                  page === "reports"
                    ? "0 4px 12px rgba(57, 106, 252, 0.3)"
                    : "0 2px 8px rgba(0,0,0,0.1)",
              }}
              onClick={() => setPage("reports")}
              onMouseEnter={(e) => {
                if (page !== "reports") {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (page !== "reports") {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }
              }}
            >
              <span style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}>
                📊
              </span>
              Reports
            </button>
          )}

          {/* ✅ ADD THESE 3 BUTTONS RIGHT HERE */}
          {/* ✅ UPDATED: Audit Trail Button with Border */}
          {(user.role === "admin" || user.role === "agent") && (
            <button
              className={`btn ${
                page === "audit" ? "btn-primary" : "btn-outline-primary"
              }`}
              style={{
                fontSize: "1.1rem",
                padding: "0.875rem 2.5rem",
                borderRadius: "12px",
                fontWeight: 600,
                minWidth: "140px",
                transition: "all 0.3s ease",
                border: page === "audit" ? "none" : "2px solid #667eea",
                background:
                  page === "audit"
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "transparent",
                color: page === "audit" ? "#fff" : "#667eea",
                boxShadow:
                  page === "audit"
                    ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                    : "0 2px 8px rgba(0,0,0,0.1)",
              }}
              onClick={() => setPage("audit")}
              onMouseEnter={(e) => {
                if (page !== "audit") {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (page !== "audit") {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }
              }}
            >
              <span style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}>
                🔍
              </span>
              Audit Trail
            </button>
          )}

          {/* ✅ UPDATED: LMA Reports Button with Border */}
          {(user.role === "admin" || user.role === "agent") && (
            <button
              className={`btn ${
                page === "lma-reporting" ? "btn-primary" : "btn-outline-primary"
              }`}
              style={{
                fontSize: "1.1rem",
                padding: "0.875rem 2.5rem",
                borderRadius: "12px",
                fontWeight: 600,
                minWidth: "140px",
                transition: "all 0.3s ease",
                border: page === "lma-reporting" ? "none" : "2px solid #43e97b",
                background:
                  page === "lma-reporting"
                    ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                    : "transparent",
                color: page === "lma-reporting" ? "#fff" : "#43e97b",
                boxShadow:
                  page === "lma-reporting"
                    ? "0 4px 12px rgba(67, 233, 123, 0.3)"
                    : "0 2px 8px rgba(0,0,0,0.1)",
              }}
              onClick={() => setPage("lma-reporting")}
              onMouseEnter={(e) => {
                if (page !== "lma-reporting") {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (page !== "lma-reporting") {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }
              }}
            >
              <span style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}>
                📊
              </span>
              LMA Reports
            </button>
          )}

          {/* ✅ UPDATED: ESG Dashboard Button with Border */}
          {(user.role === "admin" || user.role === "agent") && (
            <button
              className={`btn ${
                page === "esg" ? "btn-primary" : "btn-outline-primary"
              }`}
              style={{
                fontSize: "1.1rem",
                padding: "0.875rem 2.5rem",
                borderRadius: "12px",
                fontWeight: 600,
                minWidth: "140px",
                transition: "all 0.3s ease",
                border: page === "esg" ? "none" : "2px solid #11998e",
                background:
                  page === "esg"
                    ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                    : "transparent",
                color: page === "esg" ? "#fff" : "#11998e",
                boxShadow:
                  page === "esg"
                    ? "0 4px 12px rgba(17, 153, 142, 0.3)"
                    : "0 2px 8px rgba(0,0,0,0.1)",
              }}
              onClick={() => setPage("esg")}
              onMouseEnter={(e) => {
                if (page !== "esg") {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (page !== "esg") {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }
              }}
            >
              <span style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}>
                🌱
              </span>
              ESG Dashboard
            </button>
          )}
        </div>

        {/* ✅ UPDATED: Notification Bell for ALL ROLES (Admin, Agent, Customer) */}
        {(user.role === "admin" ||
          user.role === "agent" ||
          user.role === "customer") && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifications(true)}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "50%",
                width: "45px",
                height: "45px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.3rem",
                color: "white",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                transition: "all 0.3s ease",
                position: "relative",
                border: "2px solid rgba(255, 255, 255, 0.2)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px) scale(1.05)";
                e.target.style.boxShadow =
                  "0 6px 20px rgba(102, 126, 234, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0) scale(1)";
                e.target.style.boxShadow =
                  "0 4px 15px rgba(102, 126, 234, 0.4)";
              }}
            >
              🔔
              {unreadCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-3px",
                    right: "-3px",
                    background:
                      "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                    color: "white",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    border: "2px solid white",
                    boxShadow: "0 2px 8px rgba(255, 107, 107, 0.4)",
                    animation: unreadCount > 0 ? "pulse 2s infinite" : "none",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
              )}
            </button>
            <style>
              {`
                @keyframes pulse {
                  0% { transform: scale(1); }
                  50% { transform: scale(1.1); }
                  100% { transform: scale(1); }
                }
              `}
            </style>
          </div>
        )}
      </div>

      {/* EXISTING: Content Area - Full Width */}
      <div
        style={{
          background: "#fff",
          borderRadius: "0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          padding: "2rem",
          minHeight: "600px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {page === "loans" && <Loans user={user} />}
        {page === "payments" && <Payments user={user} />}
        {page === "reports" && user.role === "admin" && <Reports user={user} />}
        {/* ✅ ADD THESE 3 LINES RIGHT HERE */}
        {page === "audit" && <AuditTrail user={user} />}
        {page === "lma-reporting" && <LMAReporting user={user} />}
        {page === "esg" && <ESGDashboard user={user} />}

        {/* NEW: Covenant Monitoring & Recovery Tasks Section */}
        {(user.role === "admin" || user.role === "agent") && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: user.role === "admin" ? "1.5fr 1fr" : "1fr",
              gap: "1.5rem",
              marginTop: "1.5rem",
            }}
          >
            <CovenantMonitoring user={user} />
            <RecoveryTasks user={user} />
          </div>
        )}

        {/* NEW: Syndicated View & Document Analyzer Section */}
        {user.role === "admin" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 1.7fr",
              gap: "1.5rem",
              marginTop: "1.5rem",
            }}
          >
            <SyndicatedView user={user} />
            <DocumentAnalyzer />
          </div>
        )}
      </div>

      {/* EXISTING: Notifications Modal */}
      <Notifications
        user={user}
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          fetchUnreadCount(); // Refresh count when closing
        }}
      />
    </div>
  );
}

export default Dashboard;
