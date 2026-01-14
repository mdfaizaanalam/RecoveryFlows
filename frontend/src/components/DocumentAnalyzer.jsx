// LOCATION: frontend/src/components/DocumentAnalyzer.jsx

import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';

function DocumentAnalyzer({ loanId }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const qs = loanId ? `?loanId=${loanId}` : '';
      const res = await fetch(`${api.baseURL}/api/documents${qs}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const json = await res.json();
      setDocuments(json.data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      if (loanId) formData.append('loanId', loanId);

      const res = await fetch(`${api.baseURL}/api/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.message || 'Upload failed');
      } else {
        setFile(null);
        document.getElementById('file-input').value = '';
        fetchDocuments();
        alert('✅ Document uploaded successfully!');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (id) => {
    setAnalyzing(true);
    try {
      const res = await fetch(`${api.baseURL}/api/documents/${id}/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.message || 'Analysis failed');
      } else {
        fetchDocuments();
        alert('✅ Analysis completed successfully!');
      }
    } catch (err) {
      console.error('Analyze error:', err);
      alert('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const viewDetails = (doc) => {
    setSelectedDoc(doc);
  };

  const closeModal = () => {
    setSelectedDoc(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      UPLOADED: { color: '#3b82f6', bg: '#dbeafe', text: 'Uploaded' },
      PROCESSING: { color: '#f59e0b', bg: '#fef3c7', text: 'Processing...' },
      COMPLETED: { color: '#10b981', bg: '#d1fae5', text: 'Completed' },
      FAILED: { color: '#ef4444', bg: '#fee2e2', text: 'Failed' }
    };

    const config = statusMap[status] || statusMap.UPLOADED;

    return (
      <span
        style={{
          padding: '3px 8px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '600',
          color: config.color,
          backgroundColor: config.bg,
          display: 'inline-block'
        }}
      >
        {config.text}
      </span>
    );
  };

  const getRiskBadge = (riskLevel) => {
    if (!riskLevel) return null;

    const riskMap = {
      LOW: { color: '#10b981', bg: '#d1fae5', icon: '✓' },
      MEDIUM: { color: '#f59e0b', bg: '#fef3c7', icon: '⚠' },
      HIGH: { color: '#ef4444', bg: '#fee2e2', icon: '⚠' }
    };

    const config = riskMap[riskLevel] || riskMap.MEDIUM;

    return (
      <span
        style={{
          padding: '3px 8px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '600',
          color: config.color,
          backgroundColor: config.bg,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px'
        }}
      >
        {config.icon} {riskLevel}
      </span>
    );
  };

  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      borderRadius: '12px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Section - More Compact */}
      <div style={{ 
        padding: '20px 20px 16px 20px', 
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>
            📄 Document Analyzer (PDF)
          </h2>
        </div>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '13px', lineHeight: '1.4' }}>
          Upload facility agreements or loan docs (PDF) and run automated covenant & risk flag scans.
        </p>
      </div>

      {/* Upload Section - Inline Form */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
        <form onSubmit={handleUpload} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label htmlFor="file-input" style={{ 
              display: 'block',
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '6px'
            }}>
              Select PDF Document
            </label>
            <input
              id="file-input"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
              onChange={(e) => setFile(e.target.files[0])}
              style={{
                width: '100%',
                padding: '8px',
                border: '2px dashed #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!file || uploading}
            style={{
              padding: '8px 16px',
              backgroundColor: file && !uploading ? '#3b82f6' : '#d1d5db',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: file && !uploading ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {uploading ? '⏳ Uploading...' : '📤 Upload PDF'}
          </button>
        </form>
      </div>

      {/* Documents List - Compact Table */}
      <div style={{ 
        padding: '16px 20px', 
        flex: 1, 
        overflow: 'auto',
        minHeight: '200px',
        maxHeight: '400px'
      }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '15px', 
          fontWeight: '600', 
          color: '#111827' 
        }}>
          📋 Uploaded Documents ({documents.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>⏳</div>
            <p style={{ margin: 0, fontSize: '13px' }}>Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📄</div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>No documents uploaded yet</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Upload a PDF to get started</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}>
                    File Name
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}>
                    Loan
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}>
                    Size
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}>
                    Status
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}>
                    Risk
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}>
                    Uploaded
                  </th>
                  <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '12px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px', color: '#111827', fontWeight: '500', fontSize: '12px' }}>
                      📄 {doc.fileName.length > 20 ? doc.fileName.substring(0, 20) + '...' : doc.fileName}
                    </td>
                    <td style={{ padding: '8px', color: '#6b7280', fontSize: '12px' }}>
                      {doc.loanId ? `#${doc.loanId}` : '-'}
                    </td>
                    <td style={{ padding: '8px', color: '#6b7280', fontSize: '12px' }}>
                      {formatFileSize(doc.sizeBytes)}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {getStatusBadge(doc.status)}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {getRiskBadge(doc.riskLevel)}
                    </td>
                    <td style={{ padding: '8px', color: '#6b7280', fontSize: '11px' }}>
                      {formatDate(doc.createdAt)}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      {doc.status === 'UPLOADED' && (
                        <button
                          onClick={() => handleAnalyze(doc.id)}
                          disabled={analyzing}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: analyzing ? '#d1d5db' : '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: analyzing ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          {analyzing ? '⏳' : '🔍 Analyze'}
                        </button>
                      )}
                      {doc.status === 'COMPLETED' && (
                        <button
                          onClick={() => viewDetails(doc)}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          📊 Report
                        </button>
                      )}
                      {doc.status === 'FAILED' && (
                        <button
                          onClick={() => handleAnalyze(doc.id)}
                          disabled={analyzing}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#f59e0b',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: analyzing ? 'not-allowed' : 'pointer'
                          }}
                        >
                          🔄 Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Document Details */}
      {selectedDoc && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                backgroundColor: '#ffffff',
                zIndex: 10
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                  📊 DOCUMENT ANALYSIS SUMMARY
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  Document: {selectedDoc.fileName} • Loan: {selectedDoc.loanId ? `#${selectedDoc.loanId}` : 'Unlinked'} • {formatFileSize(selectedDoc.sizeBytes)}
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Status & Risk Level */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    Analysis Date
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    {selectedDoc.analyzedAt ? formatDate(selectedDoc.analyzedAt) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    Overall Risk Level
                  </p>
                  {getRiskBadge(selectedDoc.riskLevel)}
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    Confidence
                  </p>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    {selectedDoc.confidence || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Risk Flags */}
              {selectedDoc.riskFlags && selectedDoc.riskFlags.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    🔍 RISK FLAGS IDENTIFIED: {selectedDoc.riskFlags.length}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedDoc.riskFlags.map((flag, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        ⚠ {flag.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Covenants */}
              {selectedDoc.extractedCovenants && selectedDoc.extractedCovenants.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    📋 COVENANTS DETECTED: {selectedDoc.extractedCovenants.length}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedDoc.extractedCovenants.map((cov, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            {cov.type.replace(/_/g, ' ')}
                          </span>
                          <span
                            style={{
                              padding: '2px 8px',
                              backgroundColor: cov.severity === 'CRITICAL' ? '#fee2e2' : cov.severity === 'HIGH' ? '#fef3c7' : '#dbeafe',
                              color: cov.severity === 'CRITICAL' ? '#991b1b' : cov.severity === 'HIGH' ? '#92400e' : '#1e40af',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}
                          >
                            {cov.severity}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#6b7280' }}>
                          {cov.description}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                          Threshold: {cov.typical_threshold}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Terms */}
              {selectedDoc.keyTerms && selectedDoc.keyTerms.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    🔑 KEY TERMS: {selectedDoc.keyTerms.length}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                    {selectedDoc.keyTerms.map((term, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          backgroundColor: '#f0f9ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '8px'
                        }}
                      >
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                          {term.term}
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                          {term.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Summary */}
              {selectedDoc.analysisSummary && (
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    📝 DETAILED ANALYSIS
                  </h4>
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: '#374151',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace',
                      maxHeight: '400px',
                      overflow: 'auto'
                    }}
                  >
                    {selectedDoc.analysisSummary}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div
                style={{
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fbbf24',
                  borderRadius: '8px'
                }}
              >
                <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
                  ⚠️ <strong>RECOMMENDATIONS:</strong> {selectedDoc.riskFlags && selectedDoc.riskFlags.length > 0
                    ? 'Review critical terms with source document before final approval.'
                    : '✓ Standard terms - proceed with normal approval process.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentAnalyzer;
