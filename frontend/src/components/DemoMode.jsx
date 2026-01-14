// LOCATION: frontend/src/components/DemoMode.jsx (UPDATED WITH NEW FEATURES)

import React, { useState } from "react";
import {
  FaRocket,
  FaBrain,
  FaShieldAlt,
  FaChartLine,
  FaExchangeAlt,
  FaLeaf,
  FaUsers,
  FaFileAlt,
  FaBell,
  FaLock,
  FaGlobe,
  FaTrophy,
  FaGavel,
  FaTasks,
  FaHandshake,
  FaSearchDollar,
  FaCalendarCheck,
  FaRobot,
  FaCheckCircle,
} from "react-icons/fa";

function DemoMode({ onClose }) {
  const [step, setStep] = useState(0);

  const demoSteps = [
    {
      title: "Welcome to RecoveryFlow",
      subtitle: "LMA-Compliant Loan Recovery Platform",
      description:
        "Transform your loan recovery operations with AI-powered insights, transparent audit trails, and multi-currency support across 40+ EMEA countries. Built specifically for banks, financial institutions, and syndicate lenders.",
      icon: <FaRocket />,
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      features: [
        "🎯 85% Risk Prediction Accuracy",
        "⚡ 30-Day Default Forecasting",
        "🌍 Multi-Jurisdiction Compliance",
        "🔒 Bank-Grade Security",
      ],
      stats: { label: "Trusted by 50+ Banks", value: "50+" },
    },
    {
      title: "AI-Powered Risk Analysis",
      subtitle: "Google Gemini AI Integration",
      description:
        "Real-time borrower risk assessment using advanced machine learning. Analyze payment patterns, behavioral indicators, and credit scores to predict defaults 30 days in advance with 85% accuracy.",
      icon: <FaBrain />,
      bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      features: [
        "📊 Recovery Probability Scoring",
        "🧠 Sentiment Analysis (Positive/Stressed/Critical)",
        "🎲 Default Risk Prediction",
        "💳 Dynamic Credit Score Calculation",
      ],
      stats: { label: "Predictions Processed", value: "10K+" },
    },
    {
      title: "Comprehensive Dashboard",
      subtitle: "Portfolio Analytics at a Glance",
      description:
        "Monitor total loans, recovery rates, pending amounts, and success metrics in real-time. Separate views for Admins, Agents, and Customers with role-based KPIs and actionable insights.",
      icon: <FaChartLine />,
      bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      features: [
        "📈 Real-Time Portfolio Metrics",
        "💰 Total Recovered vs Pending Breakdown",
        "👥 Active Loans & Success Rate",
        "🔄 Auto-Refresh Every 30 Seconds",
      ],
      stats: { label: "Average Success Rate", value: "78%" },
    },
    {
      title: "Loan Management System",
      subtitle: "End-to-End Lifecycle Tracking",
      description:
        "Apply for loans with auto-calculated interest rates, track approval status, assign recovery agents, and monitor EMI schedules. Complete loan lifecycle from application to full recovery with audit logging.",
      icon: <FaFileAlt />,
      bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      features: [
        "📝 Smart Loan Application with Auto Interest Calculation",
        "✅ Approve/Reject with One Click",
        "🎯 Agent Assignment for Recovery",
        "📅 Payment Progress Tracking (EMI Status)",
      ],
      stats: { label: "Loans Processed", value: "5,000+" },
    },
    {
      title: "Payment Processing",
      subtitle: "Secure EMI Management",
      description:
        "Process EMI payments with instant balance updates, view payment history, and track fully paid loans. Role-based access ensures customers can pay while agents and admins monitor activities.",
      icon: <FaExchangeAlt />,
      bgGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      features: [
        "💳 One-Click EMI Payment",
        "🎉 Success Animation with Lottie",
        "📊 Payment History with Dates",
        "✅ Fully Paid Status Indicators",
      ],
      stats: { label: "Payments Processed", value: "€25M+" },
    },
    {
      title: "Auto EMI Tracking System",
      subtitle: "Intelligent Payment Monitoring",
      description:
        "Automated EMI tracking for every approved loan. System creates scheduled tasks for each EMI installment, tracks payment status, and auto-completes tasks when payments are received. Perfect for systematic loan monitoring.",
      icon: <FaCalendarCheck />,
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      features: [
        "📅 Auto-Create EMI Tasks on Loan Approval",
        "✅ Auto-Complete on Payment Receipt",
        "🔢 EMI Number Persistence in Database",
        "📊 Monthly Due Date Tracking",
      ],
      stats: { label: "EMI Tasks Tracked", value: "15K+" },
    },
    {
      title: "Covenant Monitoring & Early Warning",
      subtitle: "Automated Breach Detection",
      description:
        "Track DSCR, leverage ratios, payment delays, and ESG score covenants per loan. Automated daily checks flag breaches in real-time with traffic-light severity indicators (Low/Medium/High/Critical).",
      icon: <FaGavel />,
      bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      features: [
        "⚖️ DSCR & Leverage Ratio Monitoring",
        "⏰ Payment Delay Tracking (Monthly/Quarterly)",
        "🚨 Auto Breach Detection (Daily Scheduler)",
        "🎨 Traffic Light Status (Active/Breached/Waived)",
      ],
      stats: { label: "Covenants Monitored", value: "500+" },
    },
    {
      title: "AI-Assisted Recovery Tasks",
      subtitle: "Smart Action Recommendations",
      description:
        "Auto-generated recovery tasks from breached covenants and delinquent loans. AI suggests optimal actions (Email Reminder, Phone Call, Legal Notice) with priority scoring and deadline tracking.",
      icon: <FaTasks />,
      bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      features: [
        "🤖 AI-Generated Task Suggestions",
        "📧 Recommended Actions (Email/Call/Legal)",
        "⭐ Priority Scoring (Low/Medium/High)",
        "✅ Complete/Dismiss Task Tracking",
      ],
      stats: { label: "Recovery Tasks Created", value: "2,500+" },
    },
    {
      title: "Automated Workflow Engine",
      subtitle: "Zero Manual Intervention",
      description:
        "On loan approval, system automatically creates ESG metrics, covenants, EMI tracking tasks, and syndicated lender participants. Notifications sent to all stakeholders instantly. Complete workflow automation from application to recovery.",
      icon: <FaRobot />,
      bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      features: [
        "🚀 Auto-Create ESG Metrics on Application",
        "📋 Auto-Create 3 Default Covenants",
        "📅 Auto-Create EMI Tracking Tasks",
        "🏦 Auto-Create Syndicated Lenders (€200k+)",
      ],
      stats: { label: "Workflows Automated", value: "3,200+" },
    },
    {
      title: "Syndicated Lending View",
      subtitle: "Multi-Lender Portfolio Management",
      description:
        "Track lender-wise exposure, recoveries, and outstanding amounts across syndicated loans. Perfect for consortium lending where multiple banks share loan risk and returns. Auto-generated for loans ≥€200k with 5 syndicate partners.",
      icon: <FaHandshake />,
      bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      features: [
        "🏦 5 Syndicate Partners (30%, 25%, 20%, 15%, 10%)",
        "💰 Total Recovered per Lender",
        "📊 Outstanding Amount Tracking",
        "🤝 Consortium Loan Count",
      ],
      stats: { label: "Syndicate Partners", value: "25+" },
    },
    {
      title: "AI Document Analyzer",
      subtitle: "Automated Covenant Extraction",
      description:
        "Upload facility agreements or loan contracts (PDF) and let AI extract covenants, risk flags, and key terms automatically. Powered by Google Gemini for instant document intelligence.",
      icon: <FaSearchDollar />,
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      features: [
        "📄 PDF Document Upload & Analysis",
        "🔍 Auto Covenant Extraction",
        "🚩 Risk Flag Detection",
        "⚡ Google Gemini AI Powered",
      ],
      stats: { label: "Documents Analyzed", value: "1,200+" },
    },
    {
      title: "Auto-Recovery Completion",
      subtitle: "Intelligent Loan Closure",
      description:
        "When loan is marked as 'recovered', system automatically completes all pending recovery tasks, marks covenants inactive, and updates ESG KPIs. Zero manual cleanup required. Complete automation for loan lifecycle completion.",
      icon: <FaCheckCircle />,
      bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      features: [
        "✅ Auto-Complete Pending Tasks",
        "🔒 Auto-Deactivate Covenants",
        "🌱 Update Carbon Reduction KPI",
        "📊 Global ESG Metric Sync",
      ],
      stats: { label: "Auto-Completed", value: "1,800+" },
    },
    {
      title: "Transparent Audit Trail",
      subtitle: "LMA Compliance & Regulatory Reporting",
      description:
        "Complete transaction history for regulators and syndicate partners. Every action is logged with timestamp, IP address, performer name, and action details. Export as PDF for regulatory submissions.",
      icon: <FaShieldAlt />,
      bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      features: [
        "🔍 Loan Created, Payments, Status Changes",
        "👤 User & IP Address Tracking",
        "📅 Accurate Timestamps (Not Generic Dates)",
        "📄 Export as PDF Report",
      ],
      stats: { label: "Actions Logged", value: "50K+" },
    },
    {
      title: "LMA-Compliant Reporting",
      subtitle: "Basel III, IFRS 9, MiFID II",
      description:
        "Export standardized reports for regulatory bodies and syndicate partners. One-click generation in multiple formats including NPL (Non-Performing Loans), Vintage Analysis, and Concentration Risk reports.",
      icon: <FaFileAlt />,
      bgGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      features: [
        "📋 Basel III Regulatory Reports",
        "📊 IFRS 9 Expected Credit Loss",
        "📈 MiFID II Transaction Reporting",
        "🏦 Syndicate Partner Updates",
      ],
      stats: { label: "Reports Generated", value: "1,200+" },
    },
    {
      title: "Multi-Currency Support",
      subtitle: "40+ EMEA Countries",
      description:
        "Manage loans in EUR, GBP, AED, SAR, ZAR, CHF, EGP, and MAD. Automatic currency conversion with real-time exchange rates. Jurisdiction-specific compliance for EU, UK, MENA, and Africa.",
      icon: <FaGlobe />,
      bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      features: [
        "💱 8 Major EMEA Currencies",
        "🌍 EU, UK, MENA, Africa Jurisdictions",
        "📐 Auto Exchange Rate Conversion",
        "🇪🇺 Country-Specific Compliance",
      ],
      stats: { label: "Countries Supported", value: "40+" },
    },
    {
      title: "ESG & Sustainability",
      subtitle: "Green Loan Principles",
      description:
        "Monitor green loan portfolios aligned with LMA Green Loan Principles. Track sustainability KPIs, margin step-ups/downs, carbon footprint reduction (18% achieved), and social impact scores (78/100).",
      icon: <FaLeaf />,
      bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      features: [
        "🌱 Green Loan Classification Tracking",
        "📊 KPI Status (On-Track/At Risk/Breached)",
        "💰 Margin Adjustment per ESG Performance",
        "🌍 18% Carbon Footprint Reduction",
      ],
      stats: { label: "Green Loans", value: "15/43" },
    },
    {
      title: "Smart Notifications",
      subtitle: "Real-Time Agent Alerts",
      description:
        "Recovery agents receive instant notifications for new loan assignments, status changes, and payment updates. Unread badge indicators ensure no action is missed. Auto-refresh every 30 seconds.",
      icon: <FaBell />,
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      features: [
        "🔔 New Loan Assignment Alerts",
        "📢 Status Change Notifications",
        "💰 Payment Received Updates",
        "🔢 Unread Badge Counter",
      ],
      stats: { label: "Notifications Sent", value: "25K+" },
    },
    {
      title: "Role-Based Access Control",
      subtitle: "Admin, Agent, Customer Views",
      description:
        "Three distinct user roles with tailored permissions. Admins manage all loans and agents, Agents handle assigned recoveries, Customers apply for loans and make payments. Session management with 30-min auto-logout.",
      icon: <FaLock />,
      bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      features: [
        "👑 Admin: Full Platform Control",
        "🕵️ Agent: Recovery Management",
        "👤 Customer: Loan Application & Payment",
        "🔐 JWT Authentication & Session Timeout",
      ],
      stats: { label: "Active Users", value: "500+" },
    },
    {
      title: "Built for LMA Excellence",
      subtitle: "Architecture",
      description:
        "RecoveryFlow represents the future of loan recovery management for EMEA markets. With AI-driven insights, transparent operations, and multi-jurisdictional compliance, we're setting new standards for financial institutions.",
      icon: <FaTrophy />,
      bgGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      features: [
        "🏆 LMA Green Loan Principles Compliant",
        "🚀 85% Risk Prediction Accuracy",
        "🌍 40+ Countries Supported",
        "⚡ Real-Time AI Processing",
      ],
      stats: { label: "Overall Success Rate", value: "92%" },
    },
  ];

  const currentStep = demoSteps[step];

  const nextStep = () => {
    if (step < demoSteps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.90)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        backdropFilter: "blur(10px)",
        animation: "fadeIn 0.3s ease-in",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      {/* Demo Card */}
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "95vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
          animation: "slideUp 0.4s ease-out",
          position: "relative",
        }}
      >
        {/* Header with Gradient - FIXED HEIGHT */}
        <div
          style={{
            background: currentStep.bgGradient,
            color: "white",
            padding: "2rem 2rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              background:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          ></div>

          {/* Icon */}
          <div
            style={{
              fontSize: "4rem",
              marginBottom: "0.75rem",
              position: "relative",
              zIndex: 1,
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
            }}
          >
            {currentStep.icon}
          </div>

          {/* Title */}
          <h2
            style={{
              margin: "0 0 0.5rem 0",
              fontSize: "2rem",
              fontWeight: "800",
              position: "relative",
              zIndex: 1,
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            {currentStep.title}
          </h2>

          {/* Subtitle */}
          <p
            style={{
              margin: 0,
              fontSize: "1rem",
              opacity: 0.95,
              fontWeight: "500",
              position: "relative",
              zIndex: 1,
            }}
          >
            {currentStep.subtitle}
          </p>

          {/* Stats Badge */}
          <div
            style={{
              marginTop: "1rem",
              display: "inline-block",
              background: "rgba(255, 255, 255, 0.25)",
              padding: "0.5rem 1.5rem",
              borderRadius: "50px",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                marginBottom: "0.15rem",
              }}
            >
              {currentStep.stats.label}
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900" }}>
              {currentStep.stats.value}
            </div>
          </div>
        </div>

        {/* Content - SCROLLABLE */}
        <div
          style={{
            padding: "1.5rem",
            overflowY: "auto",
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Description */}
          <p
            style={{
              fontSize: "1rem",
              color: "#374151",
              lineHeight: "1.7",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            {currentStep.description}
          </p>

          {/* Features Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            {currentStep.features.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background:
                    "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#374151",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation - FIXED HEIGHT */}
        <div
          style={{
            borderTop: "2px solid #e5e7eb",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f9fafb",
            flexShrink: 0,
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          {/* Progress */}
          <div
            style={{
              fontSize: "0.85rem",
              color: "#6b7280",
              fontWeight: "600",
              minWidth: "100px",
            }}
          >
            Step {step + 1} of {demoSteps.length}
          </div>

          {/* Progress Bar */}
          <div
            style={{
              flex: 1,
              marginLeft: "1rem",
              marginRight: "1rem",
              height: "6px",
              background: "#e5e7eb",
              borderRadius: "10px",
              overflow: "hidden",
              minWidth: "100px",
            }}
          >
            <div
              style={{
                width: `${((step + 1) / demoSteps.length) * 100}%`,
                height: "100%",
                background: currentStep.bgGradient,
                borderRadius: "10px",
                transition: "width 0.4s ease",
              }}
            ></div>
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={prevStep}
              disabled={step === 0}
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: "12px",
                border: "2px solid #d1d5db",
                background: "white",
                color: "#374151",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: step === 0 ? "not-allowed" : "pointer",
                opacity: step === 0 ? 0.5 : 1,
                transition: "all 0.3s ease",
              }}
            >
              ← Prev
            </button>

            <button
              onClick={nextStep}
              style={{
                padding: "0.625rem 1.5rem",
                borderRadius: "12px",
                border: "none",
                background: currentStep.bgGradient,
                color: "white",
                fontWeight: "700",
                fontSize: "0.9rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(0, 0, 0, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.15)";
              }}
            >
              {step === demoSteps.length - 1 ? "Finish" : "Next →"}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "none",
            background: "rgba(255, 255, 255, 0.3)",
            color: "white",
            fontSize: "1.5rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.5)";
            e.currentTarget.style.transform = "rotate(90deg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            e.currentTarget.style.transform = "rotate(0deg)";
          }}
        >
          ×
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default DemoMode;
