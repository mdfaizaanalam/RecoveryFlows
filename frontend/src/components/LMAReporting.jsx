import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';


function LMAReporting({ user }) {
  const [reportType, setReportType] = useState('recovery_performance');
  const [dateRange, setDateRange] = useState({ 
    start: '', 
    end: new Date().toISOString().split('T')[0] 
  });
  const [generating, setGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    { 
      id: 'recovery_performance', 
      name: 'Recovery Performance Report', 
      icon: '📈',
      description: 'Analyze recovery rates, cycle times, and portfolio performance',
      standards: ['Basel III', 'IFRS 9']
    },
    { 
      id: 'risk_assessment', 
      name: 'Portfolio Risk Assessment', 
      icon: '⚠️',
      description: 'Comprehensive risk scoring and default probability analysis',
      standards: ['Basel III', 'LMA Standards']
    },
    { 
      id: 'compliance_audit', 
      name: 'Compliance & Audit Report', 
      icon: '✅',
      description: 'Regulatory compliance verification and audit trail documentation',
      standards: ['MiFID II', 'GDPR', 'FCA']
    },
    { 
      id: 'esg_sustainability', 
      name: 'ESG & Sustainability Metrics', 
      icon: '🌱',
      description: 'Green loan tracking and sustainability performance indicators',
      standards: ['LMA Green Loan Principles', 'EU Taxonomy']
    }
  ];

  const currentReport = reportTypes.find(r => r.id === reportType);

  // ✅ Fetch real data based on user role
  const fetchReportData = async () => {
    try {
      let loans, payments;
      
      if (user.role === 'admin') {
        const loansData = await api.getAllLoans();
        loans = loansData.data.loans || [];
        const paymentsData = await api.getPayments();
        payments = paymentsData.data || [];
      } else if (user.role === 'agent') {
        const loansData = await api.getLoansByAgent(user.id);
        loans = loansData.data.loans || [];
        payments = [];
        for (const loan of loans) {
          const paymentData = await api.getPaymentsByLoan(loan.id);
          payments = [...payments, ...(paymentData.data || [])];
        }
      } else {
        const loansData = await api.getLoansByCustomer(user.id);
        loans = loansData.data.loans || [];
        payments = [];
        for (const loan of loans) {
          const paymentData = await api.getPaymentsByLoan(loan.id);
          payments = [...payments, ...(paymentData.data || [])];
        }
      }

      // Filter by date range
      if (dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        loans = loans.filter(loan => {
          const loanDate = new Date(loan.createdAt);
          return loanDate >= startDate && loanDate <= endDate;
        });
        
        payments = payments.filter(payment => {
          const paymentDate = new Date(payment.createdAt);
          return paymentDate >= startDate && paymentDate <= endDate;
        });
      }

      return { loans, payments };
    } catch (err) {
      console.error('Failed to fetch report data:', err);
      setError('Failed to load data. Please try again.');
      return { loans: [], payments: [] };
    }
  };

  // ✅ Generate CSV reports
  const generateReport = async () => {
    if (!dateRange.start || !dateRange.end) {
      setError('⚠️ Please select both start and end dates');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const data = await fetchReportData();
      
      let csvContent = '';
      let filename = '';


      switch (reportType) {
        case 'recovery_performance':
          csvContent = generateRecoveryPerformanceCSV(data);
          filename = `Recovery_Performance_${dateRange.start}_to_${dateRange.end}.csv`;
          break;
        case 'risk_assessment':
          csvContent = generateRiskAssessmentCSV(data);
          filename = `Risk_Assessment_${dateRange.start}_to_${dateRange.end}.csv`;
          break;
        case 'compliance_audit':
          csvContent = generateComplianceAuditCSV(data);
          filename = `Compliance_Audit_${dateRange.start}_to_${dateRange.end}.csv`;
          break;
        case 'esg_sustainability':
          csvContent = generateESGReportCSV(data);
          filename = `ESG_Sustainability_${dateRange.start}_to_${dateRange.end}.csv`;
          break;
        default:
          csvContent = generateRecoveryPerformanceCSV(data);
          filename = `Report_${dateRange.start}_to_${dateRange.end}.csv`;
      }

      downloadCSV(csvContent, filename);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Report generation failed:', err);
      setError('❌ Report generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // CSV Generation Functions
  const generateRecoveryPerformanceCSV = (data) => {
    const { loans, payments } = data;
    let csv = `Report Type,Recovery Performance Report\nGenerated By,${user.name} (${user.role})\nDate Range,${dateRange.start} to ${dateRange.end}\n\n`;
    csv += 'Loan ID,Customer,Amount (€),Status,Recovery Status,Payments Made,Total Paid (€),Balance (€)\n';
    
    loans.forEach(loan => {
      const loanPayments = payments.filter(p => p.loanId === loan.id);
      const totalPaid = loanPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const balance = parseFloat(loan.amount) - totalPaid;
      csv += `${loan.id},${loan.Customer?.name || 'N/A'},€${loan.amount},${loan.status},${loan.recoveryStatus || 'pending'},${loanPayments.length},€${totalPaid.toFixed(2)},€${balance.toFixed(2)}\n`;
    });
    
    const totalLoans = loans.length;
    const recoveredLoans = loans.filter(l => l.recoveryStatus === 'recovered').length;
    const totalAmount = loans.reduce((sum, l) => sum + parseFloat(l.amount), 0);
    const totalRecovered = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    csv += `\n\nSummary\nTotal Loans,${totalLoans}\nRecovered Loans,${recoveredLoans}\nRecovery Rate,${totalLoans > 0 ? (recoveredLoans / totalLoans * 100).toFixed(2) : 0}%\nTotal Amount,€${totalAmount.toFixed(2)}\nTotal Recovered,€${totalRecovered.toFixed(2)}\n`;
    return csv;
  };

  const generateRiskAssessmentCSV = (data) => {
    const { loans, payments } = data;
    let csv = `Report Type,Portfolio Risk Assessment\nGenerated By,${user.name} (${user.role})\nDate Range,${dateRange.start} to ${dateRange.end}\n\n`;
    csv += 'Loan ID,Customer,Amount (€),Interest Rate,Term (months),Payment Progress,Risk Level\n';
    
    loans.forEach(loan => {
      const loanPayments = payments.filter(p => p.loanId === loan.id);
      const paymentProgress = (loanPayments.length / loan.termMonths * 100).toFixed(1);
      let riskLevel = paymentProgress < 30 ? 'High' : paymentProgress < 60 ? 'Medium' : 'Low';
      csv += `${loan.id},${loan.Customer?.name || 'N/A'},€${loan.amount},${loan.interestRate}%,${loan.termMonths},${paymentProgress}%,${riskLevel}\n`;
    });
    return csv;
  };

  const generateComplianceAuditCSV = (data) => {
    const { loans, payments } = data;
    let csv = `Report Type,Compliance & Audit Report\nGenerated By,${user.name} (${user.role})\nDate Range,${dateRange.start} to ${dateRange.end}\n\n`;
    csv += 'Loan ID,Customer,Agent,Amount (€),Status,Created Date,Last Updated\n';
    
    loans.forEach(loan => {
      csv += `${loan.id},${loan.Customer?.name || 'N/A'},${loan.Agent?.name || 'Unassigned'},€${loan.amount},${loan.status},${new Date(loan.createdAt).toLocaleDateString()},${new Date(loan.updatedAt).toLocaleDateString()}\n`;
    });
    
    csv += '\n\nPayment Audit Trail\nPayment ID,Loan ID,Amount (€),Date,Status\n';
    payments.forEach(payment => {
      csv += `${payment.id},${payment.loanId},€${payment.amount},${new Date(payment.createdAt).toLocaleDateString()},Completed\n`;
    });
    return csv;
  };

  const generateESGReportCSV = (data) => {
    const { loans, payments } = data;
    let csv = `Report Type,ESG & Sustainability Metrics\nGenerated By,${user.name} (${user.role})\nDate Range,${dateRange.start} to ${dateRange.end}\n\n`;
    csv += 'Metric,Value\n';
    csv += `Total Green Loans,${loans.length}\nTotal Sustainable Financing,€${loans.reduce((sum, l) => sum + parseFloat(l.amount), 0).toFixed(2)}\n`;
    return csv;
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="lma-reporting-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', width: '100%', boxSizing: 'border-box' }}>
      {/* 📱 RESPONSIVE STYLES */}
      <style>{`
        /* Base container */
        .lma-reporting-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: clamp(1rem, 3vw, 2rem);
          box-sizing: border-box;
        }

        /* Header responsive */
        .lma-header {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
          padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 3vw, 2rem);
          border-radius: clamp(12px, 3vw, 20px);
          margin-bottom: clamp(1.5rem, 4vw, 3rem);
          text-align: center;
          box-shadow: 0 8px 24px rgba(67, 233, 123, 0.3);
        }

        .lma-header h2 {
          margin: 0;
          font-size: clamp(1.5rem, 5vw, 2.5rem) !important;
          font-weight: 700;
          margin-bottom: clamp(0.5rem, 2vw, 1rem);
          line-height: 1.2;
        }

        .lma-header p {
          margin: 0;
          opacity: 0.95;
          font-size: clamp(0.9rem, 2.5vw, 1.2rem) !important;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        /* Badge container responsive */
        .lma-badges {
          margin-top: clamp(1rem, 3vw, 1.5rem);
          display: flex;
          gap: clamp(0.5rem, 2vw, 1rem);
          justify-content: center;
          flex-wrap: wrap;
        }

        .lma-badge {
          padding: clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.8rem, 2.5vw, 1.25rem);
          background: rgba(255,255,255,0.2);
          border-radius: 20px;
          font-size: clamp(0.75rem, 2vw, 0.9rem);
          font-weight: 600;
          backdrop-filter: blur(10px);
          white-space: nowrap;
        }

        /* Report cards grid */
        .report-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
          gap: clamp(1rem, 2.5vw, 1.5rem);
          margin-bottom: clamp(1.5rem, 4vw, 3rem);
        }

        /* Report card responsive */
        .report-card {
          padding: clamp(1.5rem, 3vw, 2rem);
          border-radius: clamp(12px, 2.5vw, 16px);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .report-card.selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 12px 28px rgba(102, 126, 234, 0.4);
        }

        .report-card:not(.selected) {
          background: #fff;
          color: #333;
          border: 3px solid #e9ecef;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .report-card-icon {
          font-size: clamp(2.5rem, 6vw, 3.5rem);
          margin-bottom: clamp(0.75rem, 2vw, 1rem);
        }

        .report-card h3 {
          margin: 0 0 clamp(0.5rem, 1.5vw, 0.75rem) 0;
          font-size: clamp(1rem, 2.5vw, 1.2rem) !important;
          font-weight: 700;
          line-height: 1.3;
        }

        .report-card p {
          margin: 0 0 clamp(0.75rem, 2vw, 1rem) 0;
          font-size: clamp(0.85rem, 2vw, 0.95rem) !important;
          line-height: 1.6;
        }

        .report-card-standards {
          display: flex;
          gap: clamp(0.4rem, 1vw, 0.5rem);
          flex-wrap: wrap;
        }

        .standard-badge {
          font-size: clamp(0.7rem, 1.5vw, 0.75rem);
          padding: clamp(0.2rem, 0.5vw, 0.25rem) clamp(0.5rem, 1.5vw, 0.75rem);
          border-radius: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .selected-badge {
          position: absolute;
          top: clamp(0.75rem, 2vw, 1rem);
          right: clamp(0.75rem, 2vw, 1rem);
          background: rgba(255,255,255,0.3);
          padding: clamp(0.4rem, 1vw, 0.5rem) clamp(0.6rem, 1.5vw, 0.75rem);
          border-radius: 20px;
          font-size: clamp(0.7rem, 1.5vw, 0.8rem);
          font-weight: 600;
        }

        /* Date range section responsive */
        .date-range-section {
          background: #fff;
          padding: clamp(1.5rem, 3vw, 2.5rem);
          border-radius: clamp(12px, 2.5vw, 16px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          margin-bottom: clamp(1.5rem, 3vw, 2rem);
          border: 2px solid #e9ecef;
        }

        .date-range-section h3 {
          margin: 0 0 clamp(1.5rem, 3vw, 2rem) 0;
          color: #333;
          font-size: clamp(1.2rem, 3vw, 1.5rem) !important;
          text-align: center;
        }

        .date-range-controls {
          display: flex;
          gap: clamp(1.5rem, 4vw, 4rem);
          flex-wrap: wrap;
          align-items: end;
          justify-content: center;
        }

        .date-input-wrapper {
          flex: 1;
          min-width: min(220px, 100%);
          max-width: 100%;
        }

        .date-input-wrapper label {
          display: block;
          margin-bottom: clamp(0.5rem, 1.5vw, 0.75rem);
          color: #666;
          font-weight: 600;
          font-size: clamp(0.85rem, 2vw, 0.95rem);
        }

        .date-input-wrapper input {
          width: 100%;
          padding: clamp(0.75rem, 2vw, 1rem);
          border-radius: clamp(8px, 2vw, 10px);
          border: 2px solid #e9ecef;
          font-size: clamp(0.9rem, 2vw, 1rem);
          font-weight: 500;
          cursor: pointer;
          box-sizing: border-box;
        }

        /* Generate button responsive */
        .generate-button {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
          border: none;
          padding: clamp(0.75rem, 2vw, 1rem) clamp(2rem, 4vw, 3rem);
          border-radius: clamp(8px, 2vw, 10px);
          font-size: clamp(0.9rem, 2vw, 1.05rem);
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);
          min-width: min(200px, 100%);
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .generate-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        /* Message boxes responsive */
        .message-box {
          margin-top: clamp(1.5rem, 3vw, 2rem);
          padding: clamp(1rem, 2.5vw, 1.25rem) clamp(1.5rem, 3vw, 2rem);
          border-radius: clamp(10px, 2vw, 12px);
          font-size: clamp(0.9rem, 2vw, 1rem);
          font-weight: 600;
          text-align: center;
        }

        /* Report preview section */
        .report-preview {
          background: #fff;
          padding: clamp(1.5rem, 3vw, 2.5rem);
          border-radius: clamp(12px, 2.5vw, 16px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 2px solid #e9ecef;
        }

        .report-preview h3 {
          margin: 0 0 clamp(1.5rem, 3vw, 2rem) 0;
          color: #333;
          font-size: clamp(1.2rem, 3vw, 1.5rem) !important;
          text-align: center;
        }

        .report-preview ul {
          color: #555;
          line-height: 2.2;
          font-size: clamp(0.9rem, 2vw, 1.05rem);
          list-style: none;
          padding: 0;
          max-width: 800px;
          margin: 0 auto;
        }

        .report-preview li {
          padding: clamp(0.6rem, 1.5vw, 0.75rem) clamp(1rem, 2.5vw, 1.5rem);
          margin-bottom: clamp(0.6rem, 1.5vw, 0.75rem);
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: clamp(8px, 2vw, 10px);
          border-left: 4px solid #43e97b;
        }

        /* Multi-jurisdiction box */
        .multi-jurisdiction {
          margin-top: clamp(1.5rem, 3vw, 2.5rem);
          padding: clamp(1.5rem, 3vw, 2rem);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: clamp(10px, 2vw, 12px);
          color: white;
          text-align: center;
        }

        .multi-jurisdiction h4 {
          margin: 0 0 clamp(0.75rem, 2vw, 1rem) 0;
          font-size: clamp(1.1rem, 2.5vw, 1.3rem);
        }

        .multi-jurisdiction p {
          margin: 0;
          font-size: clamp(0.9rem, 2vw, 1rem);
          opacity: 0.95;
          line-height: 1.6;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .date-range-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .date-input-wrapper,
          .generate-button {
            width: 100%;
          }

          .report-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Tablet adjustments */
        @media (min-width: 769px) and (max-width: 1024px) {
          .report-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Ensure no overflow */
        * {
          box-sizing: border-box;
        }
      `}</style>

      {/* Header */}
      <div className="lma-header">
        <h2>
          📊 LMA-Compliant Reporting Suite
        </h2>
        <p>
          Export standardized reports for regulators, investors, and syndicate partners
        </p>
        <div className="lma-badges">
          <span className="lma-badge">
            ✅ Basel III
          </span>
          <span className="lma-badge">
            ✅ IFRS 9
          </span>
          <span className="lma-badge">
            ✅ MiFID II
          </span>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="report-grid">
        {reportTypes.map(type => (
          <div
            key={type.id}
            className={`report-card ${reportType === type.id ? 'selected' : ''}`}
            onClick={() => setReportType(type.id)}
            onMouseEnter={(e) => {
              if (reportType !== type.id) {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
              }
            }}
            onMouseLeave={(e) => {
              if (reportType !== type.id) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
              }
            }}
          >
            {reportType === type.id && (
              <div className="selected-badge">
                ✓ Selected
              </div>
            )}
            
            <div className="report-card-icon">{type.icon}</div>
            <h3>
              {type.name}
            </h3>
            <p>
              {type.description}
            </p>
            <div className="report-card-standards">
              {type.standards.map(std => (
                <span key={std} className="standard-badge" style={{
                  background: reportType === type.id 
                    ? 'rgba(255,255,255,0.2)' 
                    : '#f8f9fa'
                }}>
                  {std}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Date Range & Generate */}
      <div className="date-range-section">
        <h3>
          📅 Select Reporting Period
        </h3>
        <div className="date-range-controls">
          <div className="date-input-wrapper">
            <label>
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              max={dateRange.end || new Date().toISOString().split('T')[0]}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
            />
          </div>
          
          <div className="date-input-wrapper">
            <label>
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              min={dateRange.start}
              max={new Date().toISOString().split('T')[0]}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
            />
          </div>

          <button
            className="generate-button"
            onClick={generateReport}
            disabled={generating || !dateRange.start || !dateRange.end}
            onMouseEnter={(e) => {
              if (!generating && dateRange.start && dateRange.end) {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 20px rgba(67, 233, 123, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!generating && dateRange.start && dateRange.end) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(67, 233, 123, 0.3)';
              }
            }}
          >
            {generating ? (
              <>
                <span style={{ marginRight: '0.5rem' }}>⏳</span>
                Generating...
              </>
            ) : (
              <>
                <span style={{ marginRight: '0.5rem' }}>📥</span>
                Generate Report
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="message-box" style={{
            background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
            color: '#721c24',
            border: '2px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="message-box" style={{
            background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
            color: '#155724',
            border: '2px solid #c3e6cb'
          }}>
            ✅ Report generated successfully! Download started.
          </div>
        )}
      </div>

      {/* Report Preview */}
      <div className="report-preview">
        <h3>
          📋 {currentReport?.name} Includes:
        </h3>
        <ul>
          <li>
            ✅ LMA-standardized data formats for cross-border consistency
          </li>
          <li style={{ borderLeftColor: '#667eea' }}>
            ✅ Regulatory compliance metrics (Basel III, IFRS 9, MiFID II)
          </li>
          <li style={{ borderLeftColor: '#f093fb' }}>
            ✅ Recovery rate analysis and portfolio benchmarking
          </li>
          <li style={{ borderLeftColor: '#ffc107' }}>
            ✅ Borrower risk segmentation with AI-powered insights
          </li>
          <li style={{ borderLeftColor: '#28a745' }}>
            ✅ Workflow efficiency metrics and process optimization
          </li>
          <li style={{ borderLeftColor: '#dc3545' }}>
            ✅ Digital signature validation and timestamp verification
          </li>
        </ul>


        <div className="multi-jurisdiction">
          <h4>
            🌍 Multi-Jurisdiction Support
          </h4>
          <p>
            Reports automatically adapt to EU, UK, MENA, and African regulatory requirements
          </p>
        </div>
      </div>


      {/* ✅ Added CSS to force date picker appearance */}
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.7;
          width: 20px;
          height: 20px;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
        input[type="date"]::-webkit-inner-spin-button,
        input[type="date"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default LMAReporting;
