// LOCATION: frontend/src/components/CovenantMonitoring.jsx

import React, { useState, useEffect } from "react";
import { api } from "../utils/api";

function CovenantMonitoring({ user, loanId }) {
  const [covenants, setCovenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const [formData, setFormData] = useState({
    loanId: loanId || "",
    type: "PAYMENT_DELAY",
    name: "",
    threshold: "",
    operator: "GREATER_THAN",
    frequency: "MONTHLY",
    severity: "MEDIUM",
    description: "",
  });

  useEffect(() => {
    fetchCovenants();

    // ✅ Real-time: 15 second refresh without blinking
    const interval = setInterval(() => {
      fetchCovenants();
    }, 15000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanId]);

  const fetchCovenants = async () => {
    // ✅ Only show loading on first fetch, not on refresh
    if (covenants.length === 0) {
      setLoading(true);
    }

    try {
      const params = loanId ? `?loanId=${loanId}` : "";
      const res = await fetch(`${api.baseURL}/api/covenants${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const json = await res.json();
      setCovenants(json.data || []);
      setLastFetchTime(new Date());
    } catch (err) {
      console.error("Error fetching covenants:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        loanId: loanId || formData.loanId,
        threshold: Number(formData.threshold),
      };

      const res = await fetch(`${api.baseURL}/api/covenants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Failed to create covenant");
        return;
      }

      setShowAddForm(false);
      setFormData((prev) => ({ ...prev, name: "", threshold: "" }));
      fetchCovenants();
    } catch (err) {
      console.error("Error creating covenant:", err);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      ACTIVE: "#28a745",
      BREACHED: "#dc3545",
      WAIVED: "#ffc107",
      INACTIVE: "#6c757d",
    };
    return map[status] || "#6c757d";
  };

  const getSeverityColor = (severity) => {
    const map = {
      LOW: "#17a2b8",
      MEDIUM: "#007bff",
      HIGH: "#fd7e14",
      CRITICAL: "#dc3545",
    };
    return map[severity] || "#6c757d";
  };

  // ✅ Calculate EMI payment status with EARLY WARNING using RECOVERY TASKS
  const getPaymentStatus = (loan) => {
    if (!loan || !loan.startDate) return { text: "N/A", color: "#6c757d" };

    const startDate = new Date(loan.startDate);
    const now = new Date();
    const daysSinceStart = Math.floor(
      (now - startDate) / (24 * 60 * 60 * 1000)
    );
    const monthsSinceStart = Math.floor(daysSinceStart / 30);
    const expectedPayments = Math.min(monthsSinceStart, loan.termMonths || 0);

    // Use completedTasks (from backend) as actual paid EMIs
    const completedPayments = loan.totalPayments || 0;
    const highestPaidEmi = loan.highestPaidEmi || 0;
    const pendingPayments = Math.max(0, expectedPayments - completedPayments);

    // Calculate days overdue for latest expected payment
    const latestExpectedPaymentMonth = expectedPayments;
    const latestExpectedPaymentDate = new Date(startDate);
    latestExpectedPaymentDate.setMonth(
      latestExpectedPaymentDate.getMonth() + latestExpectedPaymentMonth
    );
    const daysOverdue = Math.floor(
      (now - latestExpectedPaymentDate) / (24 * 60 * 60 * 1000)
    );

    // ✅ Check if ALL EMIs are paid
    if (completedPayments >= loan.termMonths && loan.termMonths > 0) {
      return {
        text: `✅ Fully Paid (${completedPayments}/${loan.termMonths} EMIs) - Loan Complete`,
        color: "#28a745",
        severity: "COMPLETED",
      };
    }

    // ✅ Check loan status
    if (loan.recoveryStatus === "recovered" || loan.status === "closed") {
      return {
        text: `✓ Fully Recovered (${completedPayments}/${loan.termMonths} EMIs)`,
        color: "#28a745",
        severity: "COMPLETED",
      };
    }

    // ✅ CRITICAL: Overdue beyond threshold (> 30 days)
    if (pendingPayments > 0 && daysOverdue > 7) {
      const nextEmiDue = highestPaidEmi + 1;
      return {
        text: `🚨 CRITICAL: ${daysOverdue} Days Overdue - EMI #${nextEmiDue} Not Paid (${completedPayments}/${expectedPayments})`,
        color: "#dc3545",
        severity: "CRITICAL",
      };
    }

    // Line ~80: WARNING threshold
    if (pendingPayments > 0 && daysOverdue >= 4 && daysOverdue <= 7) {
      // ✅ Changed from 15-30 to 4-7
      const nextEmiDue = highestPaidEmi + 1;
      return {
        text: `⚠ WARNING: ${daysOverdue} Days Late - EMI #${nextEmiDue} Approaching Breach (${completedPayments}/${expectedPayments})`,
        color: "#fd7e14",
        severity: "WARNING",
      };
    }

    // Line ~90: LATE threshold
    if (pendingPayments > 0 && daysOverdue > 0 && daysOverdue < 4) {
      // ✅ Changed from 15 to 4
      const nextEmiDue = highestPaidEmi + 1;
      return {
        text: `⏰ ${daysOverdue} Days Late - EMI #${nextEmiDue} Pending (${completedPayments}/${expectedPayments})`,
        color: "#ffc107",
        severity: "LATE",
      };
    }

    // ✅ ON TRACK: Payments up to date
    if (pendingPayments === 0 && completedPayments > 0) {
      return {
        text: `✓ EMI #${highestPaidEmi} Received - On Track (${completedPayments}/${loan.termMonths})`,
        color: "#28a745",
        severity: "ON_TRACK",
      };
    }

    // ✅ AWAITING: First EMI not yet due
    if (completedPayments === 0 && expectedPayments === 0) {
      return {
        text: "⏳ Awaiting First EMI",
        color: "#17a2b8",
        severity: "PENDING",
      };
    }

    return { text: "N/A", color: "#6c757d", severity: "UNKNOWN" };
  };

  // ✅ FIXED: Filter out ONLY admin-closed loans (keep fully paid until admin marks recovered/rejected)
  const activeCovenants = covenants
    .filter((cov) => cov.status !== "INACTIVE")
    .filter((cov) => {
      const loan = cov.Loan;
      if (!loan) return true;

      const loanStatus = (loan.status || "").toLowerCase();
      const recoveryStatus = (loan.recoveryStatus || "").toLowerCase();

      // ✅ UPDATED: Hide ONLY if admin explicitly marked as recovered/rejected/closed
      // Hide conditions:
      // 1. Loan status is 'recovered', 'rejected', or 'closed'
      // 2. Recovery status is 'recovered'
      const isAdminClosed =
        ["recovered", "rejected", "closed"].includes(loanStatus) ||
        recoveryStatus === "recovered";

      // ✅ Show covenant even if all EMIs paid, until admin marks as recovered/rejected
      return !isAdminClosed;
    });

  return (
    <div
      style={{ padding: "1.5rem", background: "#f5f7fb", borderRadius: "12px" }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
          gap: "1rem",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "1.4rem" }}>
            Covenants & Early Warning
            {/* ✅ IMPROVED: Show refresh time with pulsing dot */}
            <span
              style={{
                marginLeft: "0.5rem",
                fontSize: "0.7rem",
                color: "#28a745",
                fontWeight: 400,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#28a745",
                  animation: "pulse 2s infinite",
                }}
              />
              Auto-refreshing
            </span>
          </h3>
          <p
            style={{
              margin: "0.35rem 0 0 0",
              color: "#6c757d",
              fontSize: "0.9rem",
            }}
          >
            Track DSCR, leverage, payment delay and ESG score covenants per loan
            with automatic breach flags. Covenants are automatically created
            when loans are approved.
          </p>
          {/* ✅ ADDED: Show last update time */}
          {lastFetchTime && (
            <p
              style={{
                margin: "0.25rem 0 0 0",
                fontSize: "0.75rem",
                color: "#10b981",
              }}
            >
              Last updated: {lastFetchTime.toLocaleTimeString()} • Refreshes
              every 15 seconds
            </p>
          )}
        </div>
        {user?.role === "admin" && (
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            style={{
              padding: "0.6rem 1.1rem",
              borderRadius: "999px",
              border: "none",
              background:
                "linear-gradient(135deg, rgba(40,167,69,0.95) 0%, rgba(25,135,84,1) 100%)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(25,135,84,0.35)",
            }}
          >
            {showAddForm ? "✕ Close" : "+ Add Custom Covenant"}
          </button>
        )}
      </div>

      {/* Manual Add Form (Only for custom covenants) */}
      {showAddForm && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "1rem",
            marginBottom: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "2px solid #ffc107",
          }}
        >
          <div
            style={{
              background: "#fff3cd",
              padding: "0.75rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              border: "1px solid #ffc107",
            }}
          >
            <strong>ℹ️ Note:</strong> Default covenants (DSCR, Payment Delay,
            ESG Score) are automatically created when loans are approved. Use
            this form only to add custom covenants.
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: "0.75rem",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            }}
          >
            {!loanId && (
              <input
                type="number"
                placeholder="Loan ID"
                value={formData.loanId}
                onChange={(e) =>
                  setFormData({ ...formData, loanId: e.target.value })
                }
                required
                style={{
                  padding: "0.55rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                  fontSize: "0.9rem",
                }}
              />
            )}

            <input
              type="text"
              placeholder="Covenant name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              style={{
                padding: "0.55rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
                fontSize: "0.9rem",
              }}
            />

            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              style={{
                padding: "0.55rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
                fontSize: "0.9rem",
              }}
            >
              <option value="DSCR">DSCR</option>
              <option value="LEVERAGE">Leverage</option>
              <option value="PAYMENT_DELAY">Payment Delay</option>
              <option value="ESG_SCORE">ESG Score</option>
            </select>

            <input
              type="number"
              step="0.01"
              placeholder="Threshold"
              value={formData.threshold}
              onChange={(e) =>
                setFormData({ ...formData, threshold: e.target.value })
              }
              required
              style={{
                padding: "0.55rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
                fontSize: "0.9rem",
              }}
            />

            <select
              value={formData.frequency}
              onChange={(e) =>
                setFormData({ ...formData, frequency: e.target.value })
              }
              style={{
                padding: "0.55rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
                fontSize: "0.9rem",
              }}
            >
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="WEEKLY">Weekly</option>
              <option value="DAILY">Daily</option>
            </select>

            <select
              value={formData.severity}
              onChange={(e) =>
                setFormData({ ...formData, severity: e.target.value })
              }
              style={{
                padding: "0.55rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
                fontSize: "0.9rem",
              }}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </form>

          <button
            type="submit"
            onClick={handleSubmit}
            style={{
              marginTop: "0.75rem",
              padding: "0.55rem 1.4rem",
              borderRadius: "999px",
              border: "none",
              background:
                "linear-gradient(135deg, rgba(0,123,255,0.95) 0%, rgba(0,92,197,1) 100%)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            💾 Save Custom Covenant
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "1rem", textAlign: "center", color: "#6c757d" }}>
          <div
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #007bff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ marginTop: "0.5rem" }}>Loading covenants...</p>
        </div>
      ) : activeCovenants.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            background: "#ffffff",
            borderRadius: "12px",
            textAlign: "center",
            border: "2px dashed #ced4da",
            color: "#6c757d",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>
            No Covenants Yet
          </h4>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Covenants will appear automatically when loans are approved.
            <br />
            Waiting for approved loans...
          </p>
        </div>
      ) : (
        <div
          style={{
            marginTop: "0.5rem",
            overflowX: "auto",
            maxHeight: "450px",
            overflowY: "auto",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "720px",
            }}
          >
            <thead
              style={{
                background: "#f8f9fa",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              <tr>
                <th
                  style={{
                    padding: "0.75rem",
                    textAlign: "left",
                    fontSize: "0.8rem",
                  }}
                >
                  Covenant
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    textAlign: "left",
                    fontSize: "0.8rem",
                  }}
                >
                  Type
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    textAlign: "center",
                    fontSize: "0.8rem",
                  }}
                >
                  Threshold
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    textAlign: "left",
                    fontSize: "0.8rem",
                  }}
                >
                  EMI Payment Status
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    textAlign: "center",
                    fontSize: "0.8rem",
                  }}
                >
                  Severity
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    textAlign: "center",
                    fontSize: "0.8rem",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "0.75rem",
                    textAlign: "center",
                    fontSize: "0.8rem",
                  }}
                >
                  Last Checked
                </th>
              </tr>
            </thead>
            <tbody>
              {activeCovenants.map((cov) => {
                const paymentStatus = getPaymentStatus(cov.Loan);
                return (
                  <tr key={cov.id} style={{ borderTop: "1px solid #f1f3f5" }}>
                    <td style={{ padding: "0.6rem", fontSize: "0.85rem" }}>
                      <div style={{ fontWeight: 600 }}>{cov.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6c757d" }}>
                        Loan #{cov.loanId}
                        {cov.Loan?.Customer && ` • ${cov.Loan.Customer.name}`}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "0.6rem",
                        fontSize: "0.85rem",
                        textTransform: "capitalize",
                      }}
                    >
                      {cov.type.replace(/_/g, " ").toLowerCase()}
                    </td>
                    <td
                      style={{
                        padding: "0.6rem",
                        fontSize: "0.85rem",
                        textAlign: "center",
                      }}
                    >
                      {cov.threshold}
                    </td>
                    <td style={{ padding: "0.6rem", fontSize: "0.85rem" }}>
                      <span
                        style={{
                          color: paymentStatus.color,
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      >
                        {paymentStatus.text}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "0.6rem",
                        fontSize: "0.85rem",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.15rem 0.55rem",
                          borderRadius: "999px",
                          background: `${getSeverityColor(cov.severity)}1A`,
                          color: getSeverityColor(cov.severity),
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {cov.severity}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "0.6rem",
                        fontSize: "0.85rem",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          background: getStatusColor(cov.status),
                          marginRight: "0.35rem",
                          verticalAlign: "middle",
                        }}
                      />
                      <span>{cov.status}</span>
                    </td>
                    <td
                      style={{
                        padding: "0.6rem",
                        fontSize: "0.8rem",
                        textAlign: "center",
                        color: "#6c757d",
                      }}
                    >
                      {cov.lastChecked
                        ? new Date(cov.lastChecked).toLocaleString()
                        : "Not yet checked"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ ADDED: CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default CovenantMonitoring;
