/* LOCATION: frontend/src/components/SmartRiskAnalyzer.jsx */
/* RESPONSIVE VERSION - Works on All Devices */

import React, { useState, useEffect } from "react";
import {
  analyzeRecoveryRisk,
  predictPaymentDefault,
  calculateCreditScore,
} from "../utils/geminiAI";
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Target,
  Brain,
  Zap,
} from "lucide-react";
import "./AiAssistant.css";

const SmartRiskAnalyzer = ({ loanData, paymentHistory, customerData }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState("risk");
  const [defaultPrediction, setDefaultPrediction] = useState(null);
  const [creditScore, setCreditScore] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // Load analysis history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("analysisHistory");
    if (history) {
      try {
        setAnalysisHistory(JSON.parse(history));
      } catch (e) {
        console.error("Failed to load analysis history:", e);
      }
    }
  }, []);
  
  // ✅ AUTO-RUN ANALYSIS WHEN DATA ARRIVES (NEW)
  useEffect(() => {
    // Only auto-run if we have valid data and haven't analyzed yet
    if (loanData && loanData.amount && !result && !loading) {
      console.log("🤖 Auto-running risk analysis with real data...");
      handleRiskAnalysis();
    }
  }, [loanData, paymentHistory, customerData]); // Re-run when data changes

  // Save analysis to history
  const saveToHistory = (analysisType, data) => {
    const newEntry = {
      type: analysisType,
      data,
      timestamp: new Date().toISOString(),
      loanId: loanData?.id,
    };

    const updatedHistory = [newEntry, ...analysisHistory].slice(0, 10);
    setAnalysisHistory(updatedHistory);
    localStorage.setItem("analysisHistory", JSON.stringify(updatedHistory));
  };

  // Risk Analysis - FIXED FOR REAL-TIME DATA
  const handleRiskAnalysis = async () => {
    setLoading(true);
    setActiveAnalysis("risk");

    try {
      // Validate real data exists
      if (!loanData || !loanData.amount) {
        throw new Error("No loan data available");
      }

      console.log("🔍 Real Loan Data:", loanData);
      console.log("📊 Real Payment History:", paymentHistory);

      // Use REAL data (no mock fallback)
      const analysis = await analyzeRecoveryRisk(
        loanData,
        paymentHistory || []
      );
      
      setResult(analysis);
      saveToHistory("risk", analysis);
    } catch (error) {
      console.error("Risk analysis error:", error);
      setResult({
        riskScore: 0,
        sentiment: "Error",
        strategy:
          error.message ||
          "Analysis failed. Please ensure loan data is loaded.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Default Prediction Analysis - FIXED FOR REAL-TIME DATA
  const handleDefaultPrediction = async () => {
    setLoading(true);
    setActiveAnalysis("default");

    try {
      // Validate real data exists
      if (!loanData || !loanData.amount) {
        throw new Error("No loan data available");
      }

      const historyData = paymentHistory || [];

      // Calculate real behavior metrics from actual payment data
      const behaviorData = {
        latePayments: historyData.filter(
          (p) => p.status === "late" || p.status === "Late"
        ).length,
        missedPayments: historyData.filter(
          (p) => p.status === "missed" || p.status === "pending"
        ).length,
        responsiveness:
          historyData.filter((p) => p.status === "completed").length >
          historyData.length / 2
            ? "Good"
            : "Poor",
        stressIndicators:
          historyData.filter((p) => p.status === "late").length > 2
            ? "High"
            : "Low",
      };

      console.log("⚠️ Real Behavior Data:", behaviorData);

      // Use REAL data (no mock fallback)
      const prediction = await predictPaymentDefault(
        loanData.id || 1,
        historyData,
        behaviorData
      );

      setDefaultPrediction(prediction);
      saveToHistory("default", prediction);
    } catch (error) {
      console.error("Default prediction error:", error);
      setDefaultPrediction({
        defaultRisk: "unknown",
        probability: 0,
        warnings: [error.message || "Analysis failed"],
        preventiveActions: ["Manual review required"],
        timeframe: "Unknown",
      });
    } finally {
      setLoading(false);
    }
  };

  // Credit Score Analysis - FIXED FOR REAL-TIME DATA
  const handleCreditScore = async () => {
    setLoading(true);
    setActiveAnalysis("credit");

    try {
      // Validate real data exists
      if (!customerData || !customerData.loanAmount) {
        throw new Error("No customer data available");
      }

      console.log("💳 Real Customer Data:", customerData);

      // Use REAL data (no mock fallback)
      const score = await calculateCreditScore(customerData);
      
      setCreditScore(score);
      saveToHistory("credit", score);
    } catch (error) {
      console.error("Credit score error:", error);
      setCreditScore({
        score: 0,
        grade: "Unknown",
        factors: [error.message || "Analysis failed - check data"],
      });
    } finally {
      setLoading(false);
    }
  };

  // Get risk level color
  const getRiskColor = (score) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  // Get grade color
  const getGradeColor = (grade) => {
    const colors = {
      Excellent: "#22c55e",
      Good: "#3b82f6",
      Fair: "#f59e0b",
      Poor: "#ef4444",
    };
    return colors[grade] || "#6b7280";
  };

  return (
    <div className="risk-card" style={{ 
      marginTop: "2rem",
      padding: "clamp(1rem, 3vw, 2rem)", // Responsive padding
      maxWidth: "100%",
      boxSizing: "border-box"
    }}>
      {/* 📱 RESPONSIVE STYLES */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .analyze-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .analyze-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* 📱 MOBILE FIRST RESPONSIVE */
        .risk-card {
          width: 100%;
          overflow-x: hidden;
        }

        .risk-header h3 {
          font-size: clamp(1.1rem, 4vw, 1.3rem) !important;
          flex-wrap: wrap;
        }

        .risk-header p {
          font-size: clamp(0.8rem, 2.5vw, 0.9rem) !important;
        }

        /* Button Container Responsive */
        .button-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (min-width: 640px) {
          .button-container {
            flex-direction: row;
            flex-wrap: wrap;
          }
        }

        .analyze-btn {
          width: 100% !important;
          flex: none !important;
          min-width: unset !important;
        }

        @media (min-width: 640px) {
          .analyze-btn {
            flex: 1 1 calc(50% - 0.375rem) !important;
          }
        }

        @media (min-width: 1024px) {
          .analyze-btn {
            flex: 1 1 calc(33.333% - 0.5rem) !important;
          }
        }

        /* Risk Grid Responsive */
        .risk-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .risk-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .risk-metric.strategy {
          grid-column: 1 / -1 !important;
        }

        /* Score Display Responsive */
        .risk-metric .score-display {
          font-size: clamp(2rem, 8vw, 3rem) !important;
        }

        .risk-metric .sentiment-display {
          font-size: clamp(1.3rem, 5vw, 1.8rem) !important;
        }

        /* Info Cards Grid */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .info-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
        }

        /* Credit Score Display */
        .credit-score-display {
          font-size: clamp(2.5rem, 10vw, 4rem) !important;
        }

        /* Ensure text doesn't overflow */
        .risk-card * {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        /* Smaller screens adjustments */
        @media (max-width: 480px) {
          .risk-metric {
            padding: 1rem !important;
          }

          .icon-size {
            width: 16px !important;
            height: 16px !important;
          }

          ul {
            font-size: 0.8rem !important;
            padding-left: 1rem !important;
          }
        }
      `}</style>

      <div
        className="risk-header"
        style={{
          borderBottom: "2px solid #e5e7eb",
          paddingBottom: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h3
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "1.3rem",
            color: "#1f2937",
          }}
        >
          <Brain className="icon-size" color="#4f46e5" size={28} />
          AI-Powered Analysis Suite
        </h3>
        <p
          style={{
            margin: "0.5rem 0 0 0",
            fontSize: "0.9rem",
            color: "#6b7280",
          }}
        >
          Advanced predictive analytics for informed decision-making
        </p>
      </div>

      {/* ✅ RESPONSIVE: Analysis Type Selector */}
      <div
        className="button-container"
        style={{
          marginBottom: "1.5rem",
        }}
      >
        <button
          className={`analyze-btn ${activeAnalysis === "risk" ? "active" : ""}`}
          onClick={handleRiskAnalysis}
          disabled={loading}
          style={{
            background: activeAnalysis === "risk" ? "#4f46e5" : "#f3f4f6",
            color: activeAnalysis === "risk" ? "white" : "#4b5563",
            border: activeAnalysis === "risk" ? "none" : "1px solid #e5e7eb",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontWeight: 600,
            fontSize: "0.875rem",
            transition: "all 0.2s",
          }}
        >
          {loading && activeAnalysis === "risk" ? (
            <Loader2 className="animate-spin icon-size" size={16} />
          ) : (
            <TrendingUp className="icon-size" size={16} />
          )}
          <span>Risk Analysis</span>
        </button>

        <button
          className={`analyze-btn ${
            activeAnalysis === "default" ? "active" : ""
          }`}
          onClick={handleDefaultPrediction}
          disabled={loading}
          style={{
            background: activeAnalysis === "default" ? "#f59e0b" : "#f3f4f6",
            color: activeAnalysis === "default" ? "white" : "#4b5563",
            border: activeAnalysis === "default" ? "none" : "1px solid #e5e7eb",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontWeight: 600,
            fontSize: "0.875rem",
            transition: "all 0.2s",
          }}
        >
          {loading && activeAnalysis === "default" ? (
            <Loader2 className="animate-spin icon-size" size={16} />
          ) : (
            <AlertTriangle className="icon-size" size={16} />
          )}
          <span>Default Risk</span>
        </button>

        <button
          className={`analyze-btn ${
            activeAnalysis === "credit" ? "active" : ""
          }`}
          onClick={handleCreditScore}
          disabled={loading}
          style={{
            background: activeAnalysis === "credit" ? "#10b981" : "#f3f4f6",
            color: activeAnalysis === "credit" ? "white" : "#4b5563",
            border: activeAnalysis === "credit" ? "none" : "1px solid #e5e7eb",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontWeight: 600,
            fontSize: "0.875rem",
            transition: "all 0.2s",
          }}
        >
          {loading && activeAnalysis === "credit" ? (
            <Loader2 className="animate-spin icon-size" size={16} />
          ) : (
            <Target className="icon-size" size={16} />
          )}
          <span>Credit Score</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            color: "#6b7280",
          }}
        >
          <Loader2
            className="animate-spin"
            size={48}
            style={{ margin: "0 auto 1rem" }}
          />
          <p style={{ fontSize: "clamp(0.9rem, 3vw, 1rem)", fontWeight: 500 }}>
            Analyzing with AI... This may take a few seconds
          </p>
        </div>
      )}

      {/* ✅ RESPONSIVE: Risk Analysis Results */}
      {!loading && activeAnalysis === "risk" && result && (
        <div className="risk-grid" style={{ animation: "fadeIn 0.5s ease-in" }}>
          <div
            className="risk-metric score"
            style={{
              background: `linear-gradient(135deg, ${getRiskColor(
                result.riskScore
              )}15 0%, ${getRiskColor(result.riskScore)}08 100%)`,
              border: `2px solid ${getRiskColor(result.riskScore)}40`,
              padding: "1.5rem",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
                flexWrap: "wrap",
                gap: "0.5rem"
              }}
            >
              <div
                style={{
                  fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
                  fontWeight: 600,
                  color: "#6b7280",
                }}
              >
                Recovery Probability
              </div>
              <ShieldCheck className="icon-size" size={20} color={getRiskColor(result.riskScore)} />
            </div>
            <div
              className="score-display"
              style={{
                fontSize: "3rem",
                fontWeight: "900",
                color: getRiskColor(result.riskScore),
                lineHeight: 1,
              }}
            >
              {result.riskScore}%
            </div>
            <div
              style={{
                marginTop: "0.75rem",
                height: "6px",
                background: "#e5e7eb",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${result.riskScore}%`,
                  height: "100%",
                  background: getRiskColor(result.riskScore),
                  borderRadius: "3px",
                  transition: "width 1s ease-out",
                }}
              ></div>
            </div>
          </div>

          <div
            className="risk-metric sentiment"
            style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              border: "2px solid #86efac",
              padding: "1.5rem",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
                flexWrap: "wrap",
                gap: "0.5rem"
              }}
            >
              <div
                style={{
                  fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
                  fontWeight: 600,
                  color: "#6b7280",
                }}
              >
                Borrower Sentiment
              </div>
              <Activity className="icon-size" size={20} color="#22c55e" />
            </div>
            <div
              className="sentiment-display"
              style={{
                fontSize: "1.8rem",
                fontWeight: "700",
                color: "#166534",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap"
              }}
            >
              {result.sentiment === "Positive" && "😊"}
              {result.sentiment === "Neutral" && "😐"}
              {result.sentiment === "Stressed" && "😰"}
              {result.sentiment === "Critical" && "😨"}
              <span>{result.sentiment}</span>
            </div>
          </div>

          <div
            className="risk-metric strategy"
            style={{
              background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
              border: "2px solid #c4b5fd",
              padding: "1.5rem",
              borderRadius: "12px",
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
                marginBottom: "0.75rem",
                color: "#5b21b6",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap"
              }}
            >
              <Zap className="icon-size" size={18} />
              <span>AI Recommended Strategy</span>
            </div>
            <div
              style={{
                fontSize: "clamp(0.9rem, 3vw, 1.05rem)",
                color: "#6b21a8",
                lineHeight: 1.6,
              }}
            >
              {result.strategy}
            </div>
          </div>
        </div>
      )}

      {/* ✅ RESPONSIVE: Default Prediction Results */}
      {!loading && activeAnalysis === "default" && defaultPrediction && (
        <div style={{ animation: "fadeIn 0.5s ease-in" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              border: "2px solid #fbbf24",
              padding: "clamp(1rem, 3vw, 1.5rem)",
              borderRadius: "12px",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
                flexWrap: "wrap",
                gap: "0.5rem"
              }}
            >
              <div
                style={{
                  fontSize: "clamp(1rem, 3vw, 1.1rem)",
                  fontWeight: 700,
                  color: "#92400e",
                }}
              >
                Default Risk Assessment
              </div>
              <AlertTriangle className="icon-size" size={24} color="#f59e0b" />
            </div>
            <div
              className="info-grid"
              style={{
                marginBottom: "1rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "clamp(0.75rem, 2vw, 0.8rem)",
                    color: "#92400e",
                    marginBottom: "0.25rem",
                  }}
                >
                  Risk Level
                </div>
                <div
                  style={{
                    fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
                    fontWeight: 900,
                    color: "#b45309",
                    textTransform: "uppercase",
                  }}
                >
                  {defaultPrediction.defaultRisk}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "clamp(0.75rem, 2vw, 0.8rem)",
                    color: "#92400e",
                    marginBottom: "0.25rem",
                  }}
                >
                  Probability
                </div>
                <div
                  style={{
                    fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
                    fontWeight: 900,
                    color: "#b45309",
                  }}
                >
                  {defaultPrediction.probability}%
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "clamp(0.75rem, 2vw, 0.8rem)",
                    color: "#92400e",
                    marginBottom: "0.25rem",
                  }}
                >
                  Timeframe
                </div>
                <div
                  style={{
                    fontSize: "clamp(0.9rem, 3vw, 1rem)",
                    fontWeight: 700,
                    color: "#b45309",
                  }}
                >
                  {defaultPrediction.timeframe}
                </div>
              </div>
            </div>
          </div>

          <div className="info-grid">
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                padding: "1rem",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(0.8rem, 2.5vw, 0.85rem)",
                  fontWeight: 700,
                  color: "#991b1b",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap"
                }}
              >
                <AlertTriangle className="icon-size" size={14} />
                <span>Warning Signs</span>
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1.25rem",
                  fontSize: "0.85rem",
                  color: "#7f1d1d",
                }}
              >
                {defaultPrediction.warnings.map((warning, idx) => (
                  <li key={idx} style={{ marginBottom: "0.25rem" }}>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "1rem",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(0.8rem, 2.5vw, 0.85rem)",
                  fontWeight: 700,
                  color: "#166534",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap"
                }}
              >
                <ShieldCheck className="icon-size" size={14} />
                <span>Preventive Actions</span>
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1.25rem",
                  fontSize: "0.85rem",
                  color: "#15803d",
                }}
              >
                {defaultPrediction.preventiveActions.map((action, idx) => (
                  <li key={idx} style={{ marginBottom: "0.25rem" }}>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ✅ RESPONSIVE: Credit Score Results */}
      {!loading && activeAnalysis === "credit" && creditScore && (
        <div style={{ animation: "fadeIn 0.5s ease-in" }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${getGradeColor(
                creditScore.grade
              )}15 0%, ${getGradeColor(creditScore.grade)}08 100%)`,
              border: `2px solid ${getGradeColor(creditScore.grade)}40`,
              padding: "clamp(1.5rem, 4vw, 2rem)",
              borderRadius: "12px",
              textAlign: "center",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
                color: "#6b7280",
                marginBottom: "0.5rem",
              }}
            >
              Credit Score
            </div>
            <div
              className="credit-score-display"
              style={{
                fontSize: "4rem",
                fontWeight: 900,
                color: getGradeColor(creditScore.grade),
                lineHeight: 1,
                marginBottom: "0.5rem",
              }}
            >
              {creditScore.score}
            </div>
            <div
              style={{
                display: "inline-block",
                padding: "0.5rem 1.5rem",
                background: getGradeColor(creditScore.grade),
                color: "white",
                borderRadius: "20px",
                fontWeight: 700,
                fontSize: "clamp(1rem, 3vw, 1.1rem)",
              }}
            >
              {creditScore.grade}
            </div>
            <div
              style={{
                marginTop: "1rem",
                fontSize: "clamp(0.75rem, 2vw, 0.85rem)",
                color: "#6b7280",
              }}
            >
              Score Range: 300-850
            </div>
          </div>

          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              padding: "1rem",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "clamp(0.85rem, 2.5vw, 0.9rem)",
                fontWeight: 700,
                color: "#374151",
                marginBottom: "0.75rem",
              }}
            >
              Key Factors Affecting Score:
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.25rem",
                fontSize: "0.85rem",
                color: "#6b7280",
              }}
            >
              {creditScore.factors.map((factor, idx) => (
                <li key={idx} style={{ marginBottom: "0.5rem" }}>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !result && !defaultPrediction && !creditScore && (
        <div
          style={{
            textAlign: "center",
            padding: "clamp(2rem, 5vw, 3rem) 1rem",
            color: "#6b7280",
          }}
        >
          <Brain size={64} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
          <p
            style={{
              fontSize: "clamp(1rem, 3vw, 1.1rem)",
              fontWeight: 500,
              marginBottom: "0.5rem",
            }}
          >
            Ready to Analyze
          </p>
          <p style={{ fontSize: "clamp(0.85rem, 2.5vw, 0.9rem)" }}>
            Click any analysis button above to get AI-powered insights
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartRiskAnalyzer;
