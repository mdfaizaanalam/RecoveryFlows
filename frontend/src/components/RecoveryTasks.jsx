// LOCATION: frontend/src/components/RecoveryTasks.jsx

import React, { useEffect, useState } from "react";
import { api } from "../utils/api";
import { formatCurrency } from "../utils/currencyConfig";

function RecoveryTasks({ user, loanId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    // ✅ Only show loading spinner on first load
    if (tasks.length === 0) {
      setLoading(true);
    }

    try {
      const qs = loanId ? `?loanId=${loanId}` : "";
      const res = await fetch(`${api.baseURL}/api/recovery-task${qs}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const json = await res.json();

      // ✅ Filter out recovered/rejected loans on frontend too (double safety)
      const filteredData = (json.data || []).filter((task) => {
        const loan = task.Loan;
        if (!loan) return true;

        const loanStatus = (loan.status || "").toLowerCase();
        const recoveryStatus = (loan.recoveryStatus || "").toLowerCase();

        return loanStatus !== "rejected" && recoveryStatus !== "recovered";
      });

      setTasks(filteredData);
    } catch (err) {
      console.error("Error fetching recovery tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // ✅ Real-time updates every 10 seconds (reduced from 15 for faster updates)
    const interval = setInterval(() => {
      fetchTasks();
    }, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanId]);

  const getPriorityColor = (priority) => {
    const map = {
      LOW: "#17a2b8",
      MEDIUM: "#007bff",
      HIGH: "#fd7e14",
      URGENT: "#dc3545",
    };
    return map[priority] || "#6c757d";
  };

  const getStatusChipStyle = (status) => {
    const base = {
      PENDING: { bg: "#fff3cd", color: "#856404" },
      IN_PROGRESS: { bg: "#cfe2ff", color: "#084298" },
      COMPLETED: { bg: "#d1e7dd", color: "#0f5132" },
      CANCELLED: { bg: "#f8d7da", color: "#842029" },
    }[status] || { bg: "#e9ecef", color: "#495057" };

    return {
      padding: "0.2rem 0.55rem",
      borderRadius: "999px",
      background: base.bg,
      color: base.color,
      fontSize: "0.75rem",
      fontWeight: 600,
    };
  };

  return (
    <div
      style={{ padding: "1.5rem", background: "#f5f7fb", borderRadius: "12px" }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "1.4rem" }}>Recovery Tasks</h3>
          <p
            style={{
              margin: "0.35rem 0 0",
              color: "#6c757d",
              fontSize: "0.9rem",
            }}
          >
            View AI‑assisted recovery tasks created from breached covenants and
            delinquent loans.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "1rem", textAlign: "center", color: "#6c757d" }}>
          Loading recovery tasks...
        </div>
      ) : tasks.length === 0 ? (
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
          No active recovery tasks found.
        </div>
      ) : (
        <div
          style={{
            marginTop: "0.5rem",
            display: "grid",
            gap: "0.75rem",
            maxHeight: "500px",
            overflowY: "auto",
            paddingRight: "0.5rem",
          }}
        >
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "0.85rem 1rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                    Loan #{task.loanId}{" "}
                    {task.Loan?.amount
                      ? `• ${formatCurrency(task.Loan.amount)}`
                      : ""}
                    {task.Loan?.Customer && ` • ${task.Loan.Customer.name}`}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: getPriorityColor(task.priority),
                      }}
                    />
                    {task.priority}
                  </span>
                  <span style={getStatusChipStyle(task.status)}>
                    {task.status}
                  </span>
                </div>
              </div>

              {task.description && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#495057",
                    marginTop: "0.25rem",
                  }}
                >
                  {task.description}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  marginTop: "0.35rem",
                  fontSize: "0.75rem",
                  color: "#6c757d",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  Due:{" "}
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "Not set"}
                </div>
                <div>
                  Assigned:{" "}
                  {task.Loan?.Agent ? (
                    <span style={{ color: "#28a745", fontWeight: 600 }}>
                      {task.Loan.Agent.name}
                    </span>
                  ) : task.Assignee ? (
                    <span style={{ color: "#28a745", fontWeight: 600 }}>
                      {task.Assignee.name}
                    </span>
                  ) : (
                    <span style={{ color: "#dc3545", fontWeight: 600 }}>
                      Unassigned
                    </span>
                  )}
                </div>
              </div>

              {task.aiSuggestions && (
                <div
                  style={{
                    marginTop: "0.35rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "8px",
                    background: "#f8f9fa",
                    fontSize: "0.75rem",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                    AI Playbook
                  </div>
                  {task.aiSuggestions.summary && (
                    <div style={{ marginBottom: "0.25rem" }}>
                      {task.aiSuggestions.summary}
                    </div>
                  )}
                  {Array.isArray(task.aiSuggestions.steps) && (
                    <ul style={{ paddingLeft: "1rem", margin: 0 }}>
                      {task.aiSuggestions.steps.map((s, idx) => (
                        <li key={idx} style={{ marginBottom: "0.1rem" }}>
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecoveryTasks;
