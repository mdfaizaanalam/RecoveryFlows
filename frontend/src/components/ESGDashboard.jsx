import React, { useState, useEffect } from "react";
import { api, handleApiError } from "../utils/api"; // ✅ CHANGED

function ESGDashboard({ user }) {
  // Real API data state
  const [summary, setSummary] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: Carbon Progress State
  const [carbonProgress, setCarbonProgress] = useState({
    current: 0,
    target: 20,
  });

  // Mock visual data state (for top section)
  const [esgMetrics, setEsgMetrics] = useState({
    greenLoanPercentage: 0,
    socialImpactScore: 0,
    governanceCompliance: 0,
    carbonFootprintReduction: 0,
    totalGreenLoans: 0,
    totalLoans: 0,
  });

  // ✅ UPDATED: Fetch real API data + Calculate Carbon Reduction
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const json = await api.getESGDashboard(); // ✅ CHANGED
      setSummary(json.summary || null);
      setMetrics(json.data || []);

      // Update visual metrics with real data
      if (json.summary) {
        const greenPercentage =
          json.summary.totalLoans > 0
            ? (
                (json.summary.greenLoans / json.summary.totalLoans) *
                100
              ).toFixed(0)
            : 0;

        // ✅ NEW: Calculate Carbon Reduction from Green Loans
        if (json.data) {
          // Filter green loans
          const greenLoans = json.data.filter((m) => m.greenLoanClassification);

          // Filter completed/recovered green loans
          const completedGreenLoans = greenLoans.filter(
            (m) =>
              m.Loan?.status === "recovered" ||
              m.Loan?.status === "closed" ||
              m.Loan?.recoveryStatus === "recovered"
          );

          const carbonCurrent = completedGreenLoans.length;
          const carbonTarget = 20;

          // Update carbon progress state
          setCarbonProgress({ current: carbonCurrent, target: carbonTarget });

          // Calculate percentage
          const carbonPercentage =
            carbonTarget > 0
              ? ((carbonCurrent / carbonTarget) * 100).toFixed(0)
              : 0;

          setEsgMetrics({
            greenLoanPercentage: parseInt(greenPercentage),
            socialImpactScore: 78, // Keep mock for now
            governanceCompliance: 92, // Keep mock for now
            carbonFootprintReduction: parseInt(carbonPercentage), // ✅ REAL DATA
            totalGreenLoans: json.summary.greenLoans,
            totalLoans: json.summary.totalLoans,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching ESG dashboard:", err);
      handleApiError(err); // ✅ CHANGED
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const getStatusBadge = (status) => {
    const map = {
      ON_TRACK: { bg: "#d1e7dd", color: "#0f5132" },
      AT_RISK: { bg: "#fff3cd", color: "#856404" },
      BREACHED: { bg: "#f8d7da", color: "#842029" },
    }[status] || { bg: "#e9ecef", color: "#495057" };

    return (
      <span
        style={{
          padding: "0.2rem 0.55rem",
          borderRadius: "999px",
          background: map.bg,
          color: map.color,
          fontSize: "0.75rem",
          fontWeight: 600,
        }}
      >
        {status}
      </span>
    );
  };

  const getMarginLabel = (marginAdjustment) => {
    if (!marginAdjustment) return "Base margin";
    if (marginAdjustment > 0) return `Base + ${marginAdjustment} bps`;
    return `Base ${marginAdjustment} bps`;
  };

  const esgPrinciples = [
    {
      title: "LMA Green Loan Principles",
      icon: "🌿",
      description: "Framework for sustainability-linked lending",
      status: "Compliant",
      color: "#38ef7d",
    },
    {
      title: "EU Taxonomy Alignment",
      icon: "🇪🇺",
      description: "Classification system for sustainable activities",
      status: "Aligned",
      color: "#667eea",
    },
    {
      title: "Social Bond Principles",
      icon: "🤝",
      description: "Guidelines for social impact lending",
      status: "Adopted",
      color: "#f093fb",
    },
    {
      title: "Sustainability Linked",
      icon: "🎯",
      description: "Performance-based ESG targets",
      status: "Active",
      color: "#43e97b",
    },
  ];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
          color: "white",
          padding: "3rem 2rem",
          borderRadius: "20px",
          marginBottom: "3rem",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(17, 153, 142, 0.3)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "2.5rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          🌱 ESG & Sustainable Lending Dashboard
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "1.2rem",
            opacity: 0.95,
            maxWidth: "900px",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: "1.6",
          }}
        >
          Aligned with LMA's mission for sustainability in loan markets across
          Europe, Middle East & Africa
        </p>
        <div
          style={{
            marginTop: "1.5rem",
            display: "inline-block",
            padding: "0.75rem 2rem",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "25px",
            fontSize: "0.95rem",
            fontWeight: 600,
            backdropFilter: "blur(10px)",
          }}
        >
          🎯 Supporting UN Sustainable Development Goals
        </div>
      </div>

      {/* Main ESG Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginBottom: "3rem",
        }}
      >
        {/* Environmental */}
        <div
          style={{
            background: "#fff",
            padding: "2.5rem",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            borderTop: "5px solid #38ef7d",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow =
              "0 8px 28px rgba(56, 239, 125, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌍</div>
          <h3
            style={{
              color: "#333",
              marginBottom: "1.5rem",
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            Environmental
          </h3>
          <div
            style={{
              fontSize: "3.5rem",
              fontWeight: 700,
              color: "#38ef7d",
              marginBottom: "1rem",
              textShadow: "0 2px 4px rgba(56, 239, 125, 0.3)",
            }}
          >
            {esgMetrics.greenLoanPercentage}%
          </div>
          <p
            style={{
              color: "#666",
              margin: "0 0 1.5rem 0",
              fontSize: "1.05rem",
              fontWeight: 600,
            }}
          >
            Green/Sustainable Loans
          </p>
          <div
            style={{
              padding: "1rem",
              background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
              borderRadius: "10px",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.9rem", color: "#666" }}>
                Green Loans
              </span>
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#38ef7d",
                }}
              >
                {esgMetrics.totalGreenLoans} / {esgMetrics.totalLoans}
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#e9ecef",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${esgMetrics.greenLoanPercentage}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #11998e, #38ef7d)",
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              color: "#666",
              fontSize: "0.95rem",
            }}
          >
            <li
              style={{ padding: "0.5rem 0", borderBottom: "1px solid #f8f9fa" }}
            >
              ✓ Renewable energy projects
            </li>
            <li
              style={{ padding: "0.5rem 0", borderBottom: "1px solid #f8f9fa" }}
            >
              ✓ Energy efficiency improvements
            </li>
            <li style={{ padding: "0.5rem 0" }}>
              ✓ Circular economy initiatives
            </li>
          </ul>
        </div>

        {/* Social */}
        <div
          style={{
            background: "#fff",
            padding: "2.5rem",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            borderTop: "5px solid #667eea",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow =
              "0 8px 28px rgba(102, 126, 234, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</div>
          <h3
            style={{
              color: "#333",
              marginBottom: "1.5rem",
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            Social Impact
          </h3>
          <div
            style={{
              fontSize: "3.5rem",
              fontWeight: 700,
              color: "#667eea",
              marginBottom: "1rem",
              textShadow: "0 2px 4px rgba(102, 126, 234, 0.3)",
            }}
          >
            {esgMetrics.socialImpactScore}/100
          </div>
          <p
            style={{
              color: "#666",
              margin: "0 0 1.5rem 0",
              fontSize: "1.05rem",
              fontWeight: 600,
            }}
          >
            Social Responsibility Score
          </p>
          <div
            style={{
              padding: "1rem",
              background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
              borderRadius: "10px",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.9rem", color: "#666" }}>
                Impact Rating
              </span>
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#667eea",
                }}
              >
                High
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#e9ecef",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${esgMetrics.socialImpactScore}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #667eea, #764ba2)",
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              color: "#666",
              fontSize: "0.95rem",
            }}
          >
            <li
              style={{ padding: "0.5rem 0", borderBottom: "1px solid #f8f9fa" }}
            >
              ✓ SME support programs
            </li>
            <li
              style={{ padding: "0.5rem 0", borderBottom: "1px solid #f8f9fa" }}
            >
              ✓ Financial inclusion initiatives
            </li>
            <li style={{ padding: "0.5rem 0" }}>
              ✓ Community development loans
            </li>
          </ul>
        </div>

        {/* Governance */}
        <div
          style={{
            background: "#fff",
            padding: "2.5rem",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            borderTop: "5px solid #f093fb",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow =
              "0 8px 28px rgba(240, 147, 251, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚖️</div>
          <h3
            style={{
              color: "#333",
              marginBottom: "1.5rem",
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            Governance
          </h3>
          <div
            style={{
              fontSize: "3.5rem",
              fontWeight: 700,
              color: "#f093fb",
              marginBottom: "1rem",
              textShadow: "0 2px 4px rgba(240, 147, 251, 0.3)",
            }}
          >
            {esgMetrics.governanceCompliance}%
          </div>
          <p
            style={{
              color: "#666",
              margin: "0 0 1.5rem 0",
              fontSize: "1.05rem",
              fontWeight: 600,
            }}
          >
            Compliance Rate
          </p>
          <div
            style={{
              padding: "1rem",
              background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
              borderRadius: "10px",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.9rem", color: "#666" }}>
                Compliance Status
              </span>
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#f093fb",
                }}
              >
                Excellent
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#e9ecef",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${esgMetrics.governanceCompliance}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #f093fb, #f5576c)",
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              color: "#666",
              fontSize: "0.95rem",
            }}
          >
            <li
              style={{ padding: "0.5rem 0", borderBottom: "1px solid #f8f9fa" }}
            >
              ✓ LMA Green Loan Principles
            </li>
            <li
              style={{ padding: "0.5rem 0", borderBottom: "1px solid #f8f9fa" }}
            >
              ✓ Transparent reporting standards
            </li>
            <li style={{ padding: "0.5rem 0" }}>
              ✓ Ethical recovery practices
            </li>
          </ul>
        </div>
      </div>

      {/* LMA Principles Compliance */}
      <div
        style={{
          background: "#fff",
          padding: "2.5rem",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          marginBottom: "3rem",
        }}
      >
        <h3
          style={{
            margin: "0 0 2rem 0",
            color: "#333",
            fontSize: "1.8rem",
            textAlign: "center",
            fontWeight: 700,
          }}
        >
          🎯 LMA Sustainable Finance Principles
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {esgPrinciples.map((principle, index) => (
            <div
              key={index}
              style={{
                padding: "2rem",
                background: `linear-gradient(135deg, ${principle.color}15 0%, ${principle.color}05 100%)`,
                borderRadius: "12px",
                border: `2px solid ${principle.color}40`,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow = `0 8px 20px ${principle.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                {principle.icon}
              </div>
              <h4
                style={{
                  margin: "0 0 0.75rem 0",
                  color: "#333",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                }}
              >
                {principle.title}
              </h4>
              <p
                style={{
                  margin: "0 0 1rem 0",
                  color: "#666",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                }}
              >
                {principle.description}
              </p>
              <div
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1.25rem",
                  background: principle.color,
                  color: "white",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                ✓ {principle.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ UPDATED: Carbon Footprint Reduction - REAL DATA */}
      <div
        style={{
          background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
          padding: "3rem 2rem",
          borderRadius: "16px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(17, 153, 142, 0.3)",
          marginBottom: "3rem",
        }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🌲</div>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "2rem", fontWeight: 700 }}>
          Carbon Reduction Target
        </h3>

        {/* ✅ NEW: Display Real Carbon Progress */}
        <div
          style={{
            fontSize: "4rem",
            fontWeight: 700,
            marginBottom: "1rem",
            textShadow: "0 4px 8px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <span style={{ color: "#fff" }}>{carbonProgress.current}</span>
          <span style={{ fontSize: "2.5rem", opacity: 0.8 }}>/</span>
          <span style={{ color: "rgba(255,255,255,0.85)" }}>
            {carbonProgress.target}
          </span>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            width: "60%",
            maxWidth: "400px",
            margin: "0 auto 1.5rem auto",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "12px",
            padding: "0.5rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "12px",
              background: "rgba(255,255,255,0.3)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${esgMetrics.carbonFootprintReduction}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg, #fff, rgba(255,255,255,0.8))",
                borderRadius: "8px",
                transition: "width 1s ease",
                boxShadow: "0 2px 8px rgba(255,255,255,0.4)",
              }}
            />
          </div>
          <div
            style={{
              marginTop: "0.75rem",
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#fff",
            }}
          >
            Progress: {esgMetrics.carbonFootprintReduction}%
          </div>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "1.2rem",
            opacity: 0.95,
            maxWidth: "700px",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: "1.6",
          }}
        >
          Through green loan financing, we've helped reduce carbon emissions
          equivalent to planting <strong>10,000 trees</strong> across EMEA
          region
        </p>

        {/* ✅ NEW: Status Badge */}
        <div
          style={{
            marginTop: "1.5rem",
            display: "inline-block",
            padding: "0.75rem 2rem",
            background:
              carbonProgress.current >= carbonProgress.target
                ? "rgba(16, 185, 129, 0.3)"
                : "rgba(255, 255, 255, 0.2)",
            borderRadius: "25px",
            fontSize: "0.95rem",
            fontWeight: 700,
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(255,255,255,0.4)",
          }}
        >
          {carbonProgress.current >= carbonProgress.target
            ? "✅ Target Achieved!"
            : `🎯 ${carbonProgress.target - carbonProgress.current} more to go`}
        </div>
      </div>

      {/* ========== REAL API DATA SECTION BELOW ========== */}
      <div
        style={{
          padding: "1.5rem",
          background: "#f5f7fb",
          borderRadius: "12px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(25,135,84,1) 0%, rgba(11,94,57,1) 100%)",
            borderRadius: "14px",
            padding: "1.4rem",
            color: "#fff",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.5rem" }}>
            📊 Real-Time ESG Portfolio Tracking
          </h3>
          <p style={{ margin: "0.4rem 0 0", fontSize: "0.9rem", opacity: 0.9 }}>
            Live sustainability-linked KPIs, covenant status, and margin
            adjustments per loan
          </p>
        </div>

        {loading ? (
          <div
            style={{ padding: "1rem", textAlign: "center", color: "#6c757d" }}
          >
            Loading ESG metrics...
          </div>
        ) : !summary ? (
          <div
            style={{
              padding: "1.25rem",
              background: "#ffffff",
              borderRadius: "12px",
              textAlign: "center",
              border: "1px dashed #ced4da",
              color: "#6c757d",
            }}
          >
            No ESG metrics configured yet. Create ESG metrics via API to see
            live data here.
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "0.85rem",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                  Total ESG Loans
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                  {summary.totalLoans}
                </div>
              </div>
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "0.85rem",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                  Green Loans
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                  {summary.greenLoans}
                </div>
              </div>
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "0.85rem",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                  On‑Track KPIs
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                  {summary.onTrack}
                </div>
              </div>
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "0.85rem",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                  At Risk
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                  {summary.atRisk}
                </div>
              </div>
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "0.85rem",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                  Breached KPIs
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                  {summary.breached}
                </div>
              </div>
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "0.85rem",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                  Avg ESG Score
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                  {summary.avgESGScore}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "0.85rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "720px",
                }}
              >
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    <th
                      style={{
                        padding: "0.6rem",
                        textAlign: "left",
                        fontSize: "0.8rem",
                      }}
                    >
                      Loan
                    </th>
                    <th
                      style={{
                        padding: "0.6rem",
                        textAlign: "left",
                        fontSize: "0.8rem",
                      }}
                    >
                      ESG Score
                    </th>
                    <th
                      style={{
                        padding: "0.6rem",
                        textAlign: "left",
                        fontSize: "0.8rem",
                      }}
                    >
                      KPI
                    </th>
                    <th
                      style={{
                        padding: "0.6rem",
                        textAlign: "center",
                        fontSize: "0.8rem",
                      }}
                    >
                      KPI Status
                    </th>
                    <th
                      style={{
                        padding: "0.6rem",
                        textAlign: "center",
                        fontSize: "0.8rem",
                      }}
                    >
                      Linked Margin
                    </th>
                    <th
                      style={{
                        padding: "0.6rem",
                        textAlign: "center",
                        fontSize: "0.8rem",
                      }}
                    >
                      Green?
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => (
                    <tr key={m.id} style={{ borderTop: "1px solid #f1f3f5" }}>
                      <td style={{ padding: "0.6rem", fontSize: "0.8rem" }}>
                        <div style={{ fontWeight: 600 }}>Loan #{m.loanId}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6c757d" }}>
                          Amount: {m.Loan?.amount}
                        </div>
                      </td>
                      <td style={{ padding: "0.6rem", fontSize: "0.8rem" }}>
                        {m.esgScore ?? "-"}
                      </td>
                      <td style={{ padding: "0.6rem", fontSize: "0.8rem" }}>
                        <div>{m.sustainabilityKPI || "-"}</div>
                        <div style={{ fontSize: "0.7rem", color: "#6c757d" }}>
                          {m.kpiCurrent != null && m.kpiTarget != null
                            ? `${m.kpiCurrent} / ${m.kpiTarget}`
                            : ""}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "0.6rem",
                          fontSize: "0.8rem",
                          textAlign: "center",
                        }}
                      >
                        {getStatusBadge(m.kpiStatus)}
                      </td>
                      <td
                        style={{
                          padding: "0.6rem",
                          fontSize: "0.8rem",
                          textAlign: "center",
                        }}
                      >
                        {getMarginLabel(m.marginAdjustment)}
                      </td>
                      <td
                        style={{
                          padding: "0.6rem",
                          fontSize: "0.8rem",
                          textAlign: "center",
                        }}
                      >
                        {m.greenLoanClassification ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ESGDashboard;
