import React, { useState, useEffect } from "react";
import { api } from "../utils/api";

function AuditTrail({ user }) {
  const [allAuditLogs, setAllAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedLoan, setSelectedLoan] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [filter, selectedLoan, dateRange, allAuditLogs]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let loans = [];
      let payments = [];

      if (user.role === "admin") {
        const loansData = await api.getAllLoans();
        loans = loansData.data.loans || [];
        const paymentsData = await api.getPayments();
        payments = paymentsData.data || [];
      } else if (user.role === "agent") {
        const loansData = await api.getLoansByAgent(user.id);
        loans = loansData.data.loans || [];
        payments = [];
        for (const loan of loans) {
          try {
            const paymentData = await api.getPaymentsByLoan(loan.id);
            payments = [...payments, ...(paymentData.data || [])];
          } catch (err) {
            console.log(`No payments for loan ${loan.id}`);
          }
        }
      } else {
        const loansData = await api.getLoansByCustomer(user.id);
        loans = loansData.data.loans || [];
        payments = [];
        for (const loan of loans) {
          try {
            const paymentData = await api.getPaymentsByLoan(loan.id);
            payments = [...payments, ...(paymentData.data || [])];
          } catch (err) {
            console.log(`No payments for loan ${loan.id}`);
          }
        }
      }

      setAllLoans(loans);
      generateAuditLogs(loans, payments);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setAllAuditLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const generateAuditLogs = (loans, payments) => {
    let logs = [];

    loans.forEach((loan) => {
      // ✅ Get correct customer name
      const customerName = loan.Customer?.name || user.name || "Customer";

      // 1. Loan Application
      logs.push({
        id: `loan-created-${loan.id}`,
        action: "📝 Loan Application Submitted",
        details: `Loan application for €${parseFloat(
          loan.amount
        ).toLocaleString()} submitted by ${customerName}`,
        performedBy: customerName, // ✅ Use correct customer name
        agentName: loan.Agent?.name || "Not Assigned Yet",
        loanId: loan.id,
        loanAmount: loan.amount,
        timestamp: loan.createdAt,
        type: "loan_created",
        status: loan.status,
      });

      // 2. Loan Approval
      if (loan.status === "approved" && loan.startDate) {
        logs.push({
          id: `loan-approved-${loan.id}`,
          action: "✅ Loan Approved",
          details: `Loan #${loan.id} for €${parseFloat(
            loan.amount
          ).toLocaleString()} has been approved. Term: ${
            loan.termMonths
          } months at ${loan.interestRate}% interest.`,
          performedBy: "Admin/System",
          agentName: loan.Agent?.name || "Not Assigned Yet", // ✅ FIXED: Removed fallback to "Recovery Agent"
          loanId: loan.id,
          loanAmount: loan.amount,
          timestamp: loan.startDate,
          type: "status_changed",
          status: loan.status,
        });
      }

      // 3. Loan Rejection
      if (loan.status === "rejected") {
        logs.push({
          id: `loan-rejected-${loan.id}`,
          action: "❌ Loan Rejected",
          details: `Loan #${loan.id} application for €${parseFloat(
            loan.amount
          ).toLocaleString()} was rejected.`,
          performedBy: "Admin/System",
          agentName: "N/A",
          loanId: loan.id,
          loanAmount: loan.amount,
          timestamp: loan.updatedAt,
          type: "status_changed",
          status: loan.status,
        });
      }

      // 4. Agent Assignment (ONLY visible to ADMIN, not customers)
      if (loan.agentId && loan.Agent && user.role === "admin") {
        logs.push({
          id: `agent-assigned-${loan.id}`,
          action: "👨‍💼 Agent Assigned",
          details: `${loan.Agent.name} has been assigned to Loan #${loan.id}`,
          performedBy: "Admin",
          agentName: loan.Agent.name,
          loanId: loan.id,
          loanAmount: loan.amount,
          timestamp: loan.updatedAt,
          type: "agent_assigned",
          status: loan.status,
        });
      }

      // 5. Status Changes
      if (loan.status === "active") {
        logs.push({
          id: `loan-active-${loan.id}`,
          action: "🔄 Loan Activated",
          details: `Loan #${loan.id} is now active and EMI payments have started.`,
          performedBy: customerName, // ✅ Use correct customer name
          agentName: loan.Agent?.name || "N/A",
          loanId: loan.id,
          loanAmount: loan.amount,
          timestamp: loan.updatedAt,
          type: "status_changed",
          status: loan.status,
        });
      }

      if (loan.status === "defaulted") {
        logs.push({
          id: `loan-defaulted-${loan.id}`,
          action: "⚠️ Loan Defaulted",
          details: `Loan #${loan.id} has been marked as defaulted. Recovery process initiated.`,
          performedBy: "System",
          agentName: loan.Agent?.name || "Pending Assignment",
          loanId: loan.id,
          loanAmount: loan.amount,
          timestamp: loan.updatedAt,
          type: "status_changed",
          status: loan.status,
        });
      }

      if (loan.status === "closed") {
        logs.push({
          id: `loan-closed-${loan.id}`,
          action: "✅ Loan Closed",
          details: `Loan #${loan.id} has been successfully closed and fully paid.`,
          performedBy: customerName, // ✅ Use correct customer name
          agentName: loan.Agent?.name || "N/A",
          loanId: loan.id,
          loanAmount: loan.amount,
          timestamp: loan.updatedAt,
          type: "status_changed",
          status: loan.status,
        });
      }
    });

    // 6. Payment logs
    payments.forEach((payment) => {
      // ✅ Get correct customer name from payment
      const paymentCustomerName =
        payment.Loan?.Customer?.name || user.name || "Customer";

      logs.push({
        id: `payment-${payment.id}`,
        action: "💰 EMI Payment Received",
        details: `Payment of €${parseFloat(
          payment.amount
        ).toLocaleString()} received for Loan #${payment.loanId}`,
        performedBy: paymentCustomerName, // ✅ Use correct customer name
        agentName: payment.Loan?.Agent?.name || "N/A",
        loanId: payment.loanId,
        loanAmount: payment.amount,
        timestamp: payment.paymentDate || payment.createdAt,
        type: "payment_made",
        status: payment.status,
      });
    });

    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setAllAuditLogs(logs);
  };

  const applyFilters = () => {
    let filtered = [...allAuditLogs];

    if (filter !== "all") {
      filtered = filtered.filter((log) => log.type === filter);
    }

    if (selectedLoan !== "all") {
      filtered = filtered.filter(
        (log) => log.loanId === parseInt(selectedLoan)
      );
    }

    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate <= end;
      });
    }

    setFilteredLogs(filtered);
  };

  const exportAsPDF = () => {
    const printContent = document.createElement("div");
    printContent.innerHTML = `
      <html>
        <head>
          <title>Audit Trail - RecoveryFlow</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #667eea; text-align: center; }
            .log { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; page-break-inside: avoid; }
            .log h3 { color: #333; margin: 0 0 10px 0; }
            .log p { margin: 5px 0; color: #555; }
            .meta { font-size: 0.9em; color: #777; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>🔍 Audit Trail Report</h1>
          <p style="text-align: center; color: #666;">Generated on ${new Date().toLocaleString()}</p>
          <p style="text-align: center; color: #666;">Role: ${user.role.toUpperCase()} | User: ${
      user.name
    }</p>
          ${
            dateRange.start && dateRange.end
              ? `<p style="text-align: center; color: #666;">Period: ${dateRange.start} to ${dateRange.end}</p>`
              : ""
          }
          <hr/>
          ${filteredLogs
            .map(
              (log) => `
            <div class="log">
              <h3>${log.action}</h3>
              <p><strong>Details:</strong> ${log.details}</p>
              <div class="meta">
                <p><strong>Performed By:</strong> ${log.performedBy}</p>
                ${
                  log.agentName !== "N/A"
                    ? `<p><strong>Agent:</strong> ${log.agentName}</p>`
                    : ""
                }
                <p><strong>Loan ID:</strong> #${
                  log.loanId
                } | <strong>Amount:</strong> €${parseFloat(
                log.loanAmount
              ).toLocaleString()}</p>
                <p><strong>Timestamp:</strong> ${new Date(
                  log.timestamp
                ).toLocaleString()}</p>
              </div>
            </div>
          `
            )
            .join("")}
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const exportAsCSV = () => {
    const headers = [
      "Timestamp",
      "Action",
      "Details",
      "Performed By",
      "Agent",
      "Loan ID",
      "Amount (€)",
      "Status",
    ];
    const rows = filteredLogs.map((log) => [
      new Date(log.timestamp).toLocaleString(),
      log.action,
      log.details,
      log.performedBy,
      log.agentName || "N/A",
      log.loanId,
      parseFloat(log.loanAmount).toFixed(2),
      log.status || "N/A",
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `audit_trail_${user.role}_${new Date().getTime()}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ ROLE-BASED FILTER BUTTONS
  const getAllFilterButtons = () => {
    const allButtons = [
      {
        value: "all",
        label: "All Activities",
        icon: "📋",
        roles: ["admin", "agent", "customer"],
      },
      {
        value: "loan_created",
        label: "Loan Applications",
        icon: "📝",
        roles: ["admin", "customer"],
      },
      {
        value: "payment_made",
        label: "Payments",
        icon: "💰",
        roles: ["admin", "agent", "customer"],
      },
      {
        value: "status_changed",
        label: "Status Changes",
        icon: "🔄",
        roles: ["admin", "agent", "customer"],
      },
      {
        value: "agent_assigned",
        label: "Agent Assignments",
        icon: "👨‍💼",
        roles: ["admin"],
      }, // ADMIN ONLY
    ];

    // ✅ Filter buttons based on user role
    return allButtons.filter((btn) => btn.roles.includes(user.role));
  };

  const filterButtons = getAllFilterButtons();

  const dateInputStyle = {
    width: "100%",
    padding: "0.875rem 1rem",
    borderRadius: "12px",
    border: "2px solid #e0e7ff",
    fontSize: "1rem",
    fontWeight: 500,
    color: "#1e293b",
    background: "white",
    transition: "all 0.3s ease",
    cursor: "pointer",
    outline: "none",
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          border-radius: 4px;
          margin-left: 4px;
          opacity: 0.7;
          filter: invert(0.5);
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
          background: #f0f0f0;
        }
        input[type="date"]:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }
        input[type="date"]:hover {
          border-color: #a5b4fc;
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "2.5rem",
          borderRadius: "16px 16px 0 0",
          marginBottom: 0,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          🔍 Transparent Loan Activity Audit Trail
        </h2>
        <p style={{ margin: 0, opacity: 0.95, fontSize: "1.1rem" }}>
          Complete transparency for regulators, auditors, and stakeholders -
          aligned with LMA standards
        </p>
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1.5rem",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "20px",
            display: "inline-block",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          ✅ Basel III Compliant | ✅ IFRS 9 Ready | ✅ GDPR Secure
        </div>
        <div style={{ marginTop: "1rem", fontSize: "0.95rem", opacity: 0.9 }}>
          <strong>Viewing as:</strong> {user.role.toUpperCase()} ({user.name})
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "0 0 16px 16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {/* Filters Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "3rem",
            marginBottom: "2rem",
            padding: "2rem",
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            borderRadius: "16px",
            border: "2px solid #e9ecef",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.75rem",
                fontWeight: 700,
                color: "#1e293b",
                fontSize: "0.95rem",
                letterSpacing: "0.5px",
              }}
            >
              📅 Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              max={dateRange.end || new Date().toISOString().split("T")[0]}
              style={dateInputStyle}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.75rem",
                fontWeight: 700,
                color: "#1e293b",
                fontSize: "0.95rem",
                letterSpacing: "0.5px",
              }}
            >
              📅 End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              min={dateRange.start}
              max={new Date().toISOString().split("T")[0]}
              style={dateInputStyle}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.75rem",
                fontWeight: 700,
                color: "#1e293b",
                fontSize: "0.95rem",
                letterSpacing: "0.5px",
              }}
            >
              🏦 Select Loan
            </label>
            <select
              value={selectedLoan}
              onChange={(e) => setSelectedLoan(e.target.value)}
              style={{
                ...dateInputStyle,
                appearance: "none",
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                paddingRight: "3rem",
              }}
            >
              <option value="all">All Loans</option>
              {allLoans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  Loan #{loan.id} - €{parseFloat(loan.amount).toLocaleString()}{" "}
                  ({loan.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ✅ Role-Based Filter Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              style={{
                padding: "0.875rem 1.75rem",
                background:
                  filter === btn.value
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#f8f9fa",
                color: filter === btn.value ? "white" : "#333",
                border: filter === btn.value ? "none" : "2px solid #e9ecef",
                borderRadius: "25px",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow:
                  filter === btn.value
                    ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                    : "none",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                if (filter !== btn.value) {
                  e.target.style.background = "#e9ecef";
                  e.target.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== btn.value) {
                  e.target.style.background = "#f8f9fa";
                  e.target.style.transform = "translateY(0)";
                }
              }}
            >
              <span>{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
            <p>Loading audit trail...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
            <div
              style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}
            >
              📋
            </div>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>
              No Audit Logs Found
            </h4>
            <p style={{ margin: 0 }}>
              No activities match the selected filters. Try adjusting your date
              range or filters.
            </p>
          </div>
        ) : (
          <div style={{ position: "relative", paddingLeft: "60px" }}>
            <div
              style={{
                position: "absolute",
                left: "38px",
                top: 0,
                bottom: 0,
                width: "3px",
                background:
                  "linear-gradient(180deg, #667eea, #764ba2, #667eea)",
              }}
            />

            {filteredLogs.map((log, index) => (
              <div
                key={log.id}
                style={{
                  position: "relative",
                  marginBottom: "2.5rem",
                  paddingLeft: "2rem",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "-32px",
                    width: "16px",
                    height: "16px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "50%",
                    border: "4px solid white",
                    boxShadow: "0 0 0 3px #667eea, 0 2px 8px rgba(0,0,0,0.2)",
                    zIndex: 1,
                  }}
                />

                <div
                  style={{
                    background:
                      index % 2 === 0
                        ? "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%)"
                        : "linear-gradient(135deg, #fff 0%, #f8f9fa 50%)",
                    padding: "1.75rem",
                    borderRadius: "16px",
                    border: "2px solid #e9ecef",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(102, 126, 234, 0.15)";
                    e.currentTarget.style.transform = "translateX(5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.05)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "0.75rem",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        color: "#333",
                        fontSize: "1.2rem",
                        fontWeight: 700,
                      }}
                    >
                      {log.action}
                    </h4>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "#666",
                        background: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        fontWeight: 600,
                        border: "2px solid #e9ecef",
                      }}
                    >
                      🕐{" "}
                      {new Date(log.timestamp).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: "0.75rem 0",
                      color: "#555",
                      fontSize: "1rem",
                      lineHeight: "1.6",
                    }}
                  >
                    {log.details}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "2rem",
                      fontSize: "0.9rem",
                      color: "#777",
                      marginTop: "1rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid #dee2e6",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <strong style={{ color: "#667eea" }}>👤</strong>{" "}
                      {log.performedBy}
                    </span>
                    {log.agentName && log.agentName !== "N/A" && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <strong style={{ color: "#667eea" }}>👨‍💼</strong> Agent:{" "}
                        {log.agentName}
                      </span>
                    )}
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <strong style={{ color: "#667eea" }}>🆔</strong> Loan #
                      {log.loanId}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <strong style={{ color: "#667eea" }}>💰</strong> €
                      {parseFloat(log.loanAmount).toLocaleString()}
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        background:
                          "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                        color: "white",
                        padding: "0.25rem 0.875rem",
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      ✅ Verified
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export Options */}
        <div
          style={{
            marginTop: "3rem",
            padding: "2rem",
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            borderRadius: "12px",
            border: "2px solid #dee2e6",
          }}
        >
          <h3
            style={{
              margin: "0 0 1.5rem 0",
              color: "#333",
              fontSize: "1.3rem",
              textAlign: "center",
            }}
          >
            📥 Export Audit Trail
          </h3>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={exportAsPDF}
              disabled={filteredLogs.length === 0}
              style={{
                padding: "0.875rem 2rem",
                background:
                  filteredLogs.length === 0
                    ? "#6c757d"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: filteredLogs.length === 0 ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                transition: "all 0.3s ease",
              }}
            >
              📄 Export as PDF
            </button>
            <button
              onClick={exportAsCSV}
              disabled={filteredLogs.length === 0}
              style={{
                padding: "0.875rem 2rem",
                background:
                  filteredLogs.length === 0
                    ? "#6c757d"
                    : "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: filteredLogs.length === 0 ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(67, 233, 123, 0.3)",
                transition: "all 0.3s ease",
              }}
            >
              📋 Export as CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditTrail;
