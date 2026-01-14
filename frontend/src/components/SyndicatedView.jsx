// LOCATION: frontend/src/components/SyndicatedView.jsx

import React, { useEffect, useState, useCallback } from "react";
import { api } from "../utils/api";
import { formatCurrency } from "../utils/currencyConfig";

function SyndicatedView({ user }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // ✅ NEW: Show refresh indicator

  // ✅ useCallback prevents function recreation on every render
  const fetchReport = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setIsRefreshing(true); // ✅ NEW: Silent refresh indicator
    }
    
    try {
      const res = await fetch(`${api.baseURL}/api/syndicated-loans/report`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const json = await res.json();
      setRows(json.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching syndicated report:", err);
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setIsRefreshing(false); // ✅ NEW: Remove refresh indicator
      }
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      // ✅ Initial fetch with loading spinner
      fetchReport(true);

      // ✅ Auto-refresh every 10 seconds WITHOUT loading spinner (smooth update)
      const intervalId = setInterval(() => {
        fetchReport(false); // false = no loading spinner, just updates data silently
      }, 10000); // 10 seconds

      // ✅ Cleanup on unmount
      return () => clearInterval(intervalId);
    } else {
      setLoading(false);
    }
  }, [user, fetchReport]);

  if (user?.role !== "admin") {
    return (
      <div
        style={{
          padding: "1.25rem",
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px dashed #ced4da",
          color: "#6c757d",
        }}
      >
        Syndicated lender report is available only for admin users.
      </div>
    );
  }

  return (
    <div
      style={{ padding: "1.5rem", background: "#f5f7fb", borderRadius: "12px" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.4rem" }}>
          Syndicated Lender Exposure
          {/* ✅ NEW: Live refresh indicator */}
          {isRefreshing && (
            <span
              style={{
                marginLeft: "0.5rem",
                fontSize: "0.7rem",
                color: "#10b981",
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
                  background: "#10b981",
                  animation: "pulse 1s infinite",
                }}
              />
              Updating...
            </span>
          )}
        </h3>
      </div>
      
      <p
        style={{
          margin: 0,
          color: "#6c757d",
          fontSize: "0.9rem",
          marginBottom: "1rem",
        }}
      >
        See lender‑wise exposure, recoveries and outstanding amounts across the
        syndicated portfolio.
        {lastUpdated && (
          <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#10b981" }}>
            • Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshes every 10s
          </span>
        )}
      </p>

      {loading && rows.length === 0 ? (
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
          <p style={{ marginTop: "0.5rem" }}>Loading lender report...</p>
        </div>
      ) : rows.length === 0 ? (
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
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏦</div>
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>
            No Syndicated Loans Yet
          </h4>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Syndicated lenders are automatically created for loans ≥ ₹200,000.
            <br />
            Approve a large loan to see lender exposure here.
          </p>
        </div>
      ) : (
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
                  Lender
                </th>
                <th
                  style={{
                    padding: "0.6rem",
                    textAlign: "right",
                    fontSize: "0.8rem",
                  }}
                >
                  Exposure
                </th>
                <th
                  style={{
                    padding: "0.6rem",
                    textAlign: "right",
                    fontSize: "0.8rem",
                  }}
                >
                  Recovered
                </th>
                <th
                  style={{
                    padding: "0.6rem",
                    textAlign: "right",
                    fontSize: "0.8rem",
                  }}
                >
                  Outstanding
                </th>
                <th
                  style={{
                    padding: "0.6rem",
                    textAlign: "center",
                    fontSize: "0.8rem",
                  }}
                >
                  Loans
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.lenderName}
                  style={{ borderTop: "1px solid #f1f3f5" }}
                >
                  <td style={{ padding: "0.6rem", fontSize: "0.8rem" }}>
                    <div style={{ fontWeight: 600 }}>{row.lenderName}</div>
                  </td>
                  <td
                    style={{
                      padding: "0.6rem",
                      fontSize: "0.8rem",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(row.totalExposure)}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem",
                      fontSize: "0.8rem",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(row.totalRecovered)}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem",
                      fontSize: "0.8rem",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(row.totalOutstanding)}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem",
                      fontSize: "0.8rem",
                      textAlign: "center",
                    }}
                  >
                    {row.loanCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default SyndicatedView;
