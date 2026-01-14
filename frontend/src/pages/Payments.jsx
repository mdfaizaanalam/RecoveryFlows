import React, { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  api,
  handleApiError,
  handleApiSuccess,
  handleTokenExpiration,
} from "../utils/api";

function Payments({ user }) {
  const [payments, setPayments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState({ loanId: "", amount: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // ✅ Role-based configuration
  const roleConfig = {
    customer: {
      title: "💰 Make Payment",
      subtitle: "Select a loan and make your EMI payment",
      headerGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      historyTitle: "📋 My Payment History",
      historySubtitle: "Track all your payment transactions",
      historyGradient: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
      canPay: true,
      emptyMessage: "Select a loan above to make your first payment",
      emptyIcon: "💳",
    },
    agent: {
      title: "👀 View Customer Payments",
      subtitle: "Monitor payment activities for assigned loans",
      headerGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      historyTitle: "📊 Payment Tracking Dashboard",
      historySubtitle: "View all payment transactions for your loans",
      historyGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      canPay: false,
      emptyMessage: "Select a loan to view its payment history",
      emptyIcon: "📊",
    },
    admin: {
      title: "🔍 Payment Monitoring Center",
      subtitle: "Oversee all payment transactions across the platform",
      headerGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      historyTitle: "💼 Global Payment Records",
      historySubtitle: "Complete payment history for all loans",
      historyGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      canPay: false,
      emptyMessage: "Select a loan to view its payment records",
      emptyIcon: "💼",
    },
  };

  const config = roleConfig[user.role] || roleConfig.customer;

  // Helper: Calculate EMI and balance
  const getLoanDetails = (loanId) => {
    const loan = loans.find((l) => l.id === parseInt(loanId));
    if (!loan) return { emi: "", balance: "" };
    const principal = parseFloat(loan.amount);
    const rate = parseFloat(loan.interestRate) / 100 / 12;
    const n = parseInt(loan.termMonths);
    const emi =
      rate === 0
        ? principal / n
        : (principal * rate * Math.pow(1 + rate, n)) /
          (Math.pow(1 + rate, n) - 1);
    const paid = payments
      .filter((p) => p.loanId === loan.id)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalDue = emi * n;
    const balance = Math.max(0, totalDue - paid);
    const finalBalance = balance < 1 ? 0 : balance;

    return { emi: emi.toFixed(2), balance: finalBalance.toFixed(2) };
  };

  // Update amount when loan changes
  useEffect(() => {
    if (!form.loanId) return;
    const { emi } = getLoanDetails(form.loanId);
    setForm((f) => ({ ...f, amount: emi }));
  }, [form.loanId, loans]);

  // Fetch loans for payment (role-based)
  useEffect(() => {
    if (!user) return;

    const fetchLoans = async () => {
      try {
        let data;
        if (user.role === "customer") {
          data = await api.getLoansByCustomer(user.id);
        } else if (user.role === "agent") {
          data = await api.getLoansByAgent(user.id);
        } else {
          data = await api.getAllLoans();
        }
        setLoans(Array.isArray(data.data.loans) ? data.data.loans : []);
      } catch (err) {
        if (err.status === 401) {
          handleTokenExpiration();
        } else {
          handleApiError(err, setError);
        }
        setLoans([]);
      }
    };

    fetchLoans();
  }, [user]);

  // Fetch payments for selected loan
  useEffect(() => {
    if (!form.loanId) return setPayments([]);

    const fetchPayments = async () => {
      try {
        const data = await api.getPaymentsByLoan(form.loanId);
        setPayments(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        if (err.status === 401) {
          handleTokenExpiration();
        } else {
          handleApiError(err, setError);
        }
        setPayments([]);
      }
    };

    fetchPayments();
  }, [form.loanId]);

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    setShowSuccessAnimation(false);

    try {
      await api.createPayment({ loanId: form.loanId, amount: form.amount });

      setShowSuccessAnimation(true);
      setSuccess("Payment successful!");

      const data = await api.getPaymentsByLoan(form.loanId);
      setPayments(Array.isArray(data.data) ? data.data : []);

      setTimeout(() => {
        setShowSuccessAnimation(false);
        setSuccess("");
      }, 3000);
    } catch (err) {
      if (err.status === 401) {
        handleTokenExpiration();
      } else {
        handleApiError(err, setError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        minHeight: "100vh",
      }}
    >
      {/* 🎨 ENHANCED: Floating gradient background */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .payment-card-enter {
          animation: fadeInUp 0.6s ease-out;
        }

        .glassmorphism {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }

        .soft-shadow {
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.02),
            0 8px 16px rgba(0, 0, 0, 0.04),
            0 16px 32px rgba(0, 0, 0, 0.06);
        }

        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.04),
            0 12px 24px rgba(0, 0, 0, 0.06),
            0 24px 48px rgba(0, 0, 0, 0.08);
        }

        .input-enhanced {
          transition: all 0.3s ease;
        }

        .input-enhanced:focus {
          outline: none;
          border-color: #667eea !important;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
          transform: translateY(-1px);
        }

        .input-enhanced:hover:not(:disabled) {
          border-color: #a5b4fc !important;
        }

        .button-enhanced {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .button-enhanced::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .button-enhanced:hover::before {
          width: 300px;
          height: 300px;
        }

        .payment-row {
          transition: all 0.3s ease;
        }

        .payment-row:hover {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
          transform: translateX(4px);
        }
      `}</style>

      {/* 🎨 Floating Background Shapes */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            animation: "float 8s ease-in-out infinite",
            animationDelay: "0s",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-5%",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(118, 75, 162, 0.06) 0%, transparent 70%)",
            borderRadius: "50%",
            animation: "float 10s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(40, 167, 69, 0.04) 0%, transparent 70%)",
            borderRadius: "50%",
            animation: "float 12s ease-in-out infinite",
            animationDelay: "4s",
          }}
        />
      </div>

      {/* 🎨 ENHANCED: Header with role badge */}
      <div
        className="payment-card-enter"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2.5rem",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#1a202c",
              fontWeight: 800,
              fontSize: "2rem",
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Payment Management
          </h2>
          <p
            style={{
              margin: "0.75rem 0 0 0",
              color: "#64748b",
              fontSize: "1.05rem",
              fontWeight: 500,
            }}
          >
            {user.role === "customer" && "Manage your loan payments securely"}
            {user.role === "agent" && "Track payments for your assigned loans"}
            {user.role === "admin" && "Monitor all payment activities"}
          </p>
        </div>
        <div
          style={{
            padding: "0.75rem 1.75rem",
            background:
              user.role === "customer"
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : user.role === "agent"
                ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white",
            borderRadius: "50px",
            fontWeight: 700,
            fontSize: "0.9rem",
            textTransform: "uppercase",
            letterSpacing: "1px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>
            {user.role === "customer"
              ? "👤"
              : user.role === "agent"
              ? "👔"
              : "👨‍💼"}
          </span>
          {user.role}
        </div>
      </div>

      {/* 🎨 ENHANCED: Payment Form Section with Glassmorphism */}
      <div
        className="payment-card-enter glassmorphism soft-shadow hover-lift"
        style={{
          borderRadius: "24px",
          overflow: "hidden",
          marginBottom: "2.5rem",
          animationDelay: "0.1s",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: config.headerGradient,
            color: "white",
            padding: "2rem 2.5rem", // Add consistent padding
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h3
              style={{
                margin: "0 0 0.75rem 0",
                fontWeight: 700,
                fontSize: "1.75rem",
                letterSpacing: "-0.5px",
              }}
            >
              {config.title}
            </h3>
            <p
              style={{
                margin: 0,
                opacity: 0.95,
                fontSize: "1.05rem",
                fontWeight: 500,
              }}
            >
              {config.subtitle}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div style={{ padding: "2.5rem" }}>
          <form
            onSubmit={handlePay}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <select
              className="form-control input-enhanced"
              style={{
                fontSize: "1rem",
                padding: "1rem 1.25rem",
                borderRadius: "12px",
                border: "2px solid #e2e8f0",
                background: "#fff",
                fontWeight: 500,
                color: "#1a202c",
                cursor: "pointer",
              }}
              name="loanId"
              value={form.loanId}
              onChange={handleFormChange}
              required
            >
              <option value="" disabled>
                {user.role === "customer"
                  ? "🏦 Select Your Loan"
                  : "🏦 Select Loan to View"}
              </option>
              {loans
                .filter((l) => l.status === "approved")
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    Loan #{l.id} - €{parseFloat(l.amount).toLocaleString()}
                    {user.role !== "customer" && l.customerName
                      ? ` (${l.customerName})`
                      : ""}
                  </option>
                ))}
            </select>

            <input
              className="form-control input-enhanced"
              style={{
                fontSize: "1rem",
                padding: "1rem 1.25rem",
                borderRadius: "12px",
                border: "2px solid #e2e8f0",
                background:
                  form.loanId && getLoanDetails(form.loanId).balance === "0.00"
                    ? "#f8fafc"
                    : "#fff",
                fontWeight: 600,
                color: "#1a202c",
              }}
              name="amount"
              placeholder={
                config.canPay ? "💰 Amount" : "💰 EMI Amount (View Only)"
              }
              value={form.amount}
              onChange={handleFormChange}
              required
              disabled={
                !config.canPay ||
                (form.loanId && getLoanDetails(form.loanId).balance === "0.00")
              }
            />

            <button
              className="btn button-enhanced"
              style={{
                fontSize: "1rem",
                padding: "1rem 2rem",
                borderRadius: "12px",
                fontWeight: 700,
                border: "none",
                position: "relative",
                zIndex: 1,
                opacity:
                  !config.canPay ||
                  (form.loanId &&
                    getLoanDetails(form.loanId).balance === "0.00") ||
                  loading
                    ? 0.6
                    : 1,
                cursor:
                  !config.canPay ||
                  (form.loanId &&
                    getLoanDetails(form.loanId).balance === "0.00") ||
                  loading
                    ? "not-allowed"
                    : "pointer",
                background: !config.canPay
                  ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)"
                  : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                color: "white",
                boxShadow: !config.canPay
                  ? "0 4px 15px rgba(100, 116, 139, 0.3)"
                  : "0 4px 15px rgba(34, 197, 94, 0.4)",
                transform: "translateZ(0)",
              }}
              type="submit"
              disabled={
                !config.canPay ||
                (form.loanId &&
                  getLoanDetails(form.loanId).balance === "0.00") ||
                loading
              }
            >
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>⏳</span> Processing...
                </span>
              ) : !config.canPay ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>👁️</span> View Only
                </span>
              ) : (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>💳</span> Pay EMI
                </span>
              )}
            </button>
          </form>

          {/* Info message */}
          {!config.canPay && (
            <div
              className="payment-card-enter"
              style={{
                padding: "1.25rem 1.5rem",
                background:
                  "linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)",
                border: "2px solid rgba(251, 191, 36, 0.3)",
                borderRadius: "16px",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                animationDelay: "0.2s",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>ℹ️</span>
              <span
                style={{
                  color: "#92400e",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                }}
              >
                {user.role === "agent" &&
                  "You can view payment details but cannot process payments. Only customers can make payments."}
                {user.role === "admin" &&
                  "You have read-only access to monitor all payment activities."}
              </span>
            </div>
          )}

          {/* 🎨 ENHANCED: Loan Details Cards */}
          {form.loanId && (
            <div
              className="payment-card-enter"
              style={{
                marginBottom: "2rem",
                animationDelay: "0.3s",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                <div
                  className="hover-lift"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.08) 100%)",
                    padding: "1.75rem",
                    borderRadius: "16px",
                    border: "2px solid rgba(34, 197, 94, 0.2)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#16a34a",
                      marginBottom: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    💰 EMI Amount
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      color: "#16a34a",
                      letterSpacing: "-1px",
                    }}
                  >
                    €{getLoanDetails(form.loanId).emi}
                  </div>
                </div>

                <div
                  className="hover-lift"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)",
                    padding: "1.75rem",
                    borderRadius: "16px",
                    border: "2px solid rgba(251, 191, 36, 0.2)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#d97706",
                      marginBottom: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    💵 Remaining Balance
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      color: "#d97706",
                      letterSpacing: "-1px",
                    }}
                  >
                    €{getLoanDetails(form.loanId).balance}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fully Paid Badge */}
          {form.loanId && getLoanDetails(form.loanId).balance === "0.00" && (
            <div
              className="payment-card-enter"
              style={{
                textAlign: "center",
                padding: "1.5rem",
                animationDelay: "0.4s",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  color: "white",
                  padding: "1rem 2.5rem",
                  borderRadius: "50px",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>✅</span>
                Fully Paid
              </div>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div
              className="payment-card-enter"
              style={{
                marginTop: "1.5rem",
                padding: "1.25rem 1.5rem",
                background:
                  "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)",
                color: "#991b1b",
                borderRadius: "12px",
                border: "2px solid rgba(239, 68, 68, 0.3)",
                fontSize: "1rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                animationDelay: "0.5s",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>⚠️</span>
              {error}
            </div>
          )}
          {success && (
            <div
              className="payment-card-enter"
              style={{
                marginTop: "1.5rem",
                padding: "1.25rem 1.5rem",
                background:
                  "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)",
                color: "#166534",
                borderRadius: "12px",
                border: "2px solid rgba(34, 197, 94, 0.3)",
                fontSize: "1rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                animationDelay: "0.5s",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>✅</span>
              {success}
            </div>
          )}
        </div>
      </div>

      {/* Payment Success Animation */}
      {showSuccessAnimation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)",
              borderRadius: "28px",
              padding: "3rem 2.5rem",
              textAlign: "center",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.4)",
              maxWidth: "450px",
              width: "90%",
              border: "2px solid rgba(255, 255, 255, 0.5)",
            }}
          >
            <DotLottieReact
              src="https://lottie.host/9701ac69-f35b-46ed-9f46-e58f84ffa77c/QUVXQRcA8Y.lottie"
              style={{
                width: "220px",
                height: "220px",
                margin: "0 auto",
              }}
              loop={false}
              autoplay
            />
            <div
              style={{
                marginTop: "1.5rem",
                fontSize: "1.5rem",
                fontWeight: 800,
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.5px",
              }}
            >
              Payment Successful!
            </div>
            <div
              style={{
                marginTop: "0.75rem",
                fontSize: "1rem",
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              Your transaction has been processed
            </div>
          </div>
        </div>
      )}

      {/* 🎨 ENHANCED: Payment History with Modern Table */}
      <div
        className="payment-card-enter glassmorphism soft-shadow hover-lift"
        style={{
          borderRadius: "24px",
          overflow: "hidden",
          animationDelay: "0.2s",
        }}
      >
        <div
          style={{
            background: config.historyGradient,
            color: "white",
            padding: "2rem 2.5rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h3
              style={{
                margin: "0 0 0.75rem 0",
                fontWeight: 700,
                fontSize: "1.75rem",
                letterSpacing: "-0.5px",
              }}
            >
              {config.historyTitle}
            </h3>
            <p
              style={{
                margin: 0,
                opacity: 0.95,
                fontSize: "1.05rem",
                fontWeight: 500,
              }}
            >
              {config.historySubtitle} ({payments.length}{" "}
              {payments.length === 1 ? "payment" : "payments"})
            </p>
          </div>
        </div>

        <div style={{ padding: "0", overflowX: "auto" }}>
          {payments.length > 0 ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  <th
                    style={{
                      padding: "1.5rem",
                      fontWeight: 700,
                      color: "#334155",
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      textAlign: "center",
                    }}
                  >
                    Payment ID
                  </th>
                  <th
                    style={{
                      padding: "1.5rem",
                      fontWeight: 700,
                      color: "#334155",
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      textAlign: "center",
                    }}
                  >
                    Loan ID
                  </th>
                  <th
                    style={{
                      padding: "1.5rem",
                      fontWeight: 700,
                      color: "#334155",
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      textAlign: "right",
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      padding: "1.5rem",
                      fontWeight: 700,
                      color: "#334155",
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      textAlign: "center",
                    }}
                  >
                    Payment Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((p, index) => (
                    <tr
                      key={p.id}
                      className="payment-row"
                      style={{
                        borderBottom:
                          index < payments.length - 1
                            ? "1px solid #f1f5f9"
                            : "none",
                      }}
                    >
                      <td style={{ padding: "1.5rem", textAlign: "center" }}>
                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                            color: "white",
                            width: "42px",
                            height: "42px",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            margin: "0 auto",
                            boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                          }}
                        >
                          #{p.id}
                        </div>
                      </td>
                      <td style={{ padding: "1.5rem", textAlign: "center" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: "1rem",
                            background:
                              "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                            padding: "0.5rem 1rem",
                            borderRadius: "8px",
                            display: "inline-block",
                          }}
                        >
                          Loan #{p.loanId}
                        </div>
                      </td>
                      <td style={{ padding: "1.5rem", textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: 800,
                            color: "#16a34a",
                            fontSize: "1.25rem",
                            letterSpacing: "-0.5px",
                          }}
                        >
                          €{parseFloat(p.amount).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: "1.5rem", textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: "0.95rem",
                            color: "#64748b",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span>📅</span>
                          {new Date(p.createdAt).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
              <div
                style={{
                  fontSize: "4rem",
                  marginBottom: "1.5rem",
                  opacity: 0.2,
                }}
              >
                {config.emptyIcon}
              </div>
              <h4
                style={{
                  margin: "0 0 0.75rem 0",
                  color: "#1e293b",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  letterSpacing: "-0.5px",
                }}
              >
                No Payments Yet
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                {config.emptyMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Payments;
