import { useState, useEffect } from "react";
import "./App.css";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import "./AppHeader.css";
import sessionManager from "./utils/sessionManager";
import Footer from "./components/Footer";
import { api, handleApiError } from "./utils/api";
import AiAssistant from "./components/AiAssistant";
import { FaEuroSign } from "react-icons/fa";

import {
  FaChartLine,
  FaShieldAlt,
  FaBolt,
  FaCheckCircle,
  FaClock,
  FaRupeeSign,
  FaStar,
  FaHandHoldingUsd,
  FaFileInvoice,
  FaExchangeAlt,
  FaLeaf,
  FaUsers,
  FaChartBar,
  FaTrophy,
} from "react-icons/fa";

function App() {
  const [user, setUser] = useState(() => {
    if (sessionManager.isSessionValid()) {
      const session = sessionManager.getSession();
      return session.userData;
    }
    return null;
  });

  const [showDemoMode, setShowDemoMode] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalLoans: 0,
    approvedLoans: 0,
    pendingLoans: 0,
    totalAmount: 0,
    recoveryRate: 0,
    activeAgents: 0,
    loading: true,
  });

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      alert("Your session has expired due to inactivity. Please log in again.");
    };

    window.addEventListener("sessionExpired", handleSessionExpired);

    const sessionCheckInterval = setInterval(() => {
      if (user && !sessionManager.isSessionValid()) {
        setUser(null);
        alert("Your session has expired. Please log in again.");
      }
    }, 60000);

    return () => {
      window.removeEventListener("sessionExpired", handleSessionExpired);
      clearInterval(sessionCheckInterval);
    };
  }, [user]);

  // ✅ FIXED: Fetch analytics data for admin and agent
  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        if (user.role === "admin") {
          // ✅ Fetch all loans for admin
          const loansData = await api.getAllLoans();
          const loans = loansData.data.loans || [];

          console.log("📊 App.jsx - Fetched Loans:", loans); // DEBUG

          // ✅ FIXED: Use SAME logic as Dashboard.jsx
          const totalLoans = loans.length;

          // Count ONLY recovered loans (same as Dashboard)
          const recoveredLoans = loans.filter((l) => {
            const status = (l.status || "").toLowerCase();
            const recoveryStatus = (l.recoveryStatus || "").toLowerCase();
            return status === "recovered" || recoveryStatus === "recovered";
          });
          const recoveredCount = recoveredLoans.length;

          // Count active/pending loans (NOT recovered, NOT written off)
          const activeLoans = loans.filter((l) => {
            const status = (l.status || "").toLowerCase();
            const recoveryStatus = (l.recoveryStatus || "").toLowerCase();
            return (
              status !== "recovered" &&
              status !== "written off" &&
              recoveryStatus !== "recovered"
            );
          }).length;

          // Calculate amounts
          const totalAmount = loans.reduce(
            (sum, l) => sum + parseFloat(l.amount || 0),
            0
          );
          const recoveredAmount = recoveredLoans.reduce(
            (sum, l) => sum + parseFloat(l.amount || 0),
            0
          );

          // ✅ Recovery Rate = (Recovered Count / Total Loans) * 100
          const recoveryRate =
            totalLoans > 0
              ? ((recoveredCount / totalLoans) * 100).toFixed(1)
              : 0;

          console.log("✅ App.jsx - Analytics:", {
            totalLoans,
            recoveredCount,
            activeLoans,
            recoveryRate,
          }); // DEBUG

          setAnalytics({
            totalLoans: totalLoans,
            approvedLoans: recoveredCount, // Renamed: now shows recovered
            pendingLoans: activeLoans, // Shows active/pending
            totalAmount: totalAmount,
            recoveryRate: recoveryRate, // ✅ FIXED calculation
            recoveredLoans: recoveredCount,
            loading: false,
          });
        } else if (user.role === "agent") {
          // ✅ Fetch agent's assigned loans
          const loansData = await api.getLoansByAgent(user.id);
          const loans = loansData.data.loans || [];

          // ✅ FIXED: Use SAME logic as Dashboard.jsx
          const totalLoans = loans.length;

          const recoveredLoans = loans.filter((l) => {
            const status = (l.status || "").toLowerCase();
            const recoveryStatus = (l.recoveryStatus || "").toLowerCase();
            return status === "recovered" || recoveryStatus === "recovered";
          });
          const recoveredCount = recoveredLoans.length;

          const activeLoans = loans.filter((l) => {
            const status = (l.status || "").toLowerCase();
            const recoveryStatus = (l.recoveryStatus || "").toLowerCase();
            return (
              status !== "recovered" &&
              status !== "written off" &&
              recoveryStatus !== "recovered"
            );
          }).length;

          const totalAmount = loans.reduce(
            (sum, l) => sum + parseFloat(l.amount || 0),
            0
          );

          // Success Rate for agent
          const successRate =
            totalLoans > 0
              ? ((recoveredCount / totalLoans) * 100).toFixed(1)
              : 0;

          setAnalytics({
            totalLoans: totalLoans,
            recoveredLoans: recoveredCount,
            inProgressLoans: activeLoans, // Active loans
            totalAmount: totalAmount,
            successRate: successRate, // Agent's success rate
            loading: false,
          });
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setAnalytics((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchAnalytics();

    // Refresh analytics every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = (userData, token) => {
    setUser(userData);
    sessionManager.initSession(token, userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    sessionManager.clearSession();
  };

  if (!user) {
    return (
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Home onLogin={handleLogin} />
        <Footer />
      </div>
    );
  }

  // Role-specific quick stats with live data
  const getRoleStats = () => {
    if (user.role === "admin") {
      return [
        {
          icon: <FaHandHoldingUsd />,
          value: analytics.loading ? "..." : `${analytics.recoveryRate}%`,
          label: "Recovery Rate",
          color: "#2948ff",
        },
        {
          icon: <FaChartLine />,
          value: analytics.loading ? "..." : analytics.totalLoans,
          label: "Total Loans",
          color: "#10b981",
        },
        {
          icon: <FaClock />,
          value: analytics.loading ? "..." : analytics.pendingLoans,
          label: "Pending",
          color: "#f59e0b",
        },
        {
          icon: <FaEuroSign />,
          value: analytics.loading
            ? "..."
            : `€${(analytics.totalAmount / 1000000).toFixed(1)}M`, // ✅ FIXED
          label: "Total Amount",
          color: "#d9822b",
        },
      ];
    } else if (user.role === "agent") {
      return [
        {
          icon: <FaFileInvoice />,
          value: analytics.loading ? "..." : analytics.totalLoans,
          label: "Active Cases",
          color: "#d9822b",
        },
        {
          icon: <FaCheckCircle />,
          value: analytics.loading ? "..." : `${analytics.successRate}%`,
          label: "Success Rate",
          color: "#10b981",
        },
        {
          icon: <FaTrophy />,
          value: analytics.loading ? "..." : analytics.recoveredLoans,
          label: "Recovered",
          color: "#2948ff",
        },
        {
          icon: <FaClock />,
          value: analytics.loading ? "..." : analytics.inProgressLoans,
          label: "In Progress",
          color: "#f59e0b",
        },
      ];
    } else {
      return [
        {
          icon: <FaBolt />,
          value: "5 min",
          label: "Approval",
          color: "#2948ff",
        },
        {
          icon: <FaShieldAlt />,
          value: "100%",
          label: "Secure",
          color: "#10b981",
        },
        {
          icon: <FaRupeeSign />,
          value: "9.99%",
          label: "Rate",
          color: "#d9822b",
        },
        {
          icon: <FaStar />,
          value: "Active",
          label: "Status",
          color: "#6366f1",
        },
      ];
    }
  };

  return (
    <div
      className="app-bg"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* Enhanced Header */}
      <header className="app-header">
        <div className="header-content-wrapper">
          {/* Logo & Brand */}
          <div className="header-brand">
            <div className="brand-icon">
              <FaChartLine size={28} />
            </div>
            <div className="brand-text">
              <span className="brand-name">RecoveryFlow</span>
              <span className="brand-tagline">SMART LENDING</span>
            </div>
          </div>

          {/* User Info */}
          <div className="header-user">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="User"
              className="user-avatar"
            />
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>

          {/* Dashboard Title */}
          <div className="header-title">
            <FaChartBar className="title-icon" />
            <span>{user.role} Dashboard</span>
          </div>

          {/* Logout Button */}
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </header>

      {/* Quick Stats Bar with Live Data */}
      <div className="stats-bar">
        <div className="stats-container">
          {getRoleStats().map((stat, index) => (
            <div
              key={index}
              className="stat-card"
              style={{ borderTopColor: stat.color }}
            >
              <div className="stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <div className="stat-value" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div style={{ flex: 1 }}>
        <Dashboard user={user} />
      </div>

      {/* Footer */}
      <Footer />

      <AiAssistant />
    </div>
  );
}

export default App;
