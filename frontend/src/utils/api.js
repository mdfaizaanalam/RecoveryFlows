// API configuration
import sessionManager from './sessionManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ✅ Helper to safely get token (works in browser and build)
const getToken = () => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const api = {
  // Base configuration
  baseURL: API_BASE_URL,

  // Helper function to make API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = getToken(); // ✅ Safe token retrieval

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  },

  // Auth endpoints
  async login(credentials) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // ✅ Initialize session properly
    if (response.token && response.user) {
      sessionManager.initSession(response.token, response.user);
      
      // Store in localStorage (with browser check)
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }

    return response;
  },

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Customer endpoints
  async getCustomers() {
    return this.request('/api/customers');
  },

  async createCustomer(customerData) {
    return this.request('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  async updateCustomer(id, customerData) {
    return this.request(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  },

  async deleteCustomer(id) {
    return this.request(`/api/customers/${id}`, {
      method: 'DELETE',
    });
  },

  // Loan endpoints
  async getLoans() {
    return this.request('/api/loans');
  },

  async getAllLoans() {
    return this.request('/api/loans');
  },

  async getLoansByCustomer(customerId) {
    return this.request(`/api/loans/customer/${customerId}`);
  },

  async getLoansByAgent(agentId) {
    return this.request(`/api/loans/agent/${agentId}`);
  },

  async createLoan(loanData) {
    return this.request('/api/loans', {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
  },

  async updateLoan(id, loanData) {
    return this.request(`/api/loans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(loanData),
    });
  },

  async updateLoanStatus(id, status) {
    return this.request(`/api/loans/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async assignAgent(loanId, agentId) {
    return this.request(`/api/loans/${loanId}/assign-agent`, {
      method: 'PATCH',
      body: JSON.stringify({ agentId }),
    });
  },

  async updateRecoveryStatus(loanId, recoveryStatus) {
    return this.request(`/api/loans/${loanId}/recovery-status`, {
      method: 'PATCH',
      body: JSON.stringify({ recoveryStatus }),
    });
  },

  async deleteLoan(id) {
    return this.request(`/api/loans/${id}`, {
      method: 'DELETE',
    });
  },

  // Payment endpoints
  async getPayments() {
    return this.request('/api/payments');
  },

  async getPaymentsByLoan(loanId) {
    return this.request(`/api/payments/loan/${loanId}`);
  },

  async createPayment(paymentData) {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  async updatePayment(id, paymentData) {
    return this.request(`/api/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  },

  async deletePayment(id) {
    return this.request(`/api/payments/${id}`, {
      method: 'DELETE',
    });
  },

  // Agent endpoints
  async getAgents() {
    return this.request('/api/agents');
  },

  async getAllAgents() {
    return this.request('/api/agents');
  },

  async createAgent(agentData) {
    return this.request('/api/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  },

  async updateAgent(id, agentData) {
    return this.request(`/api/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    });
  },

  async deleteAgent(id) {
    return this.request(`/api/agents/${id}`, {
      method: 'DELETE',
    });
  },

  // Report endpoints
  async getReports() {
    return this.request('/api/reports');
  },

  async getRecoveryReport() {
    return this.request('/api/reports/recovery');
  },

  async getRecoveredLoans() {
    return this.request('/api/reports/recovered');
  },

  async getOutstandingLoans() {
    return this.request('/api/reports/outstanding');
  },

  // Notification endpoints
  async getNotifications() {
    return this.request('/api/notifications');
  },

  async getUnreadCount() {
    return this.request('/api/notifications/unread-count');
  },

  async markAsRead(id) {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllAsRead() {
    return this.request('/api/notifications/mark-all-read', {
      method: 'PATCH',
    });
  },

  async clearNotifications() {
    return this.request('/api/notifications/clear', {
      method: 'DELETE',
    });
  },

  // ESG ENDPOINTS
  async getESGDashboard() {
    return this.request('/api/esg/dashboard');
  },

  async getESGMetrics(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/api/esg${queryParams ? `?${queryParams}` : ''}`);
  },

  async createESGMetric(esgData) {
    return this.request('/api/esg', {
      method: 'POST',
      body: JSON.stringify(esgData),
    });
  },

  async updateESGMetric(id, esgData) {
    return this.request(`/api/esg/${id}`, {
      method: 'PUT',
      body: JSON.stringify(esgData),
    });
  },

  async recalculateCarbonKPIs() {
    return this.request('/api/esg/recalculate-carbon', {
      method: 'POST',
    });
  },

  // COVENANT ENDPOINTS
  async getCovenants(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/api/covenants${queryParams ? `?${queryParams}` : ''}`);
  },

  async getCovenantsByLoan(loanId) {
    return this.request(`/api/covenants?loanId=${loanId}`);
  },

  async createCovenant(covenantData) {
    return this.request('/api/covenants', {
      method: 'POST',
      body: JSON.stringify(covenantData),
    });
  },

  async updateCovenant(id, covenantData) {
    return this.request(`/api/covenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(covenantData),
    });
  },

  async getCovenantAuditTrail(covenantId) {
    return this.request(`/api/covenants/audit/${covenantId}`);
  },

  // RECOVERY TASK ENDPOINTS
  async getRecoveryTasks(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/api/recovery-task${queryParams ? `?${queryParams}` : ''}`);
  },

  async getRecoveryTasksByLoan(loanId) {
    return this.request(`/api/recovery-task?loanId=${loanId}`);
  },

  async createRecoveryTask(taskData) {
    return this.request('/api/recovery-task', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async updateRecoveryTask(id, taskData) {
    return this.request(`/api/recovery-task/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  async completeRecoveryTask(id) {
    return this.request(`/api/recovery-task/${id}/complete`, {
      method: 'PATCH',
    });
  },

  // SYNDICATED LOAN ENDPOINTS
  async getSyndicatedReport(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/api/syndicated-loans/report${queryParams ? `?${queryParams}` : ''}`);
  },

  async addLoanParticipant(participantData) {
    return this.request('/api/syndicated-loans/participant', {
      method: 'POST',
      body: JSON.stringify(participantData),
    });
  },

  async getLoanParticipants(loanId) {
    return this.request(`/api/syndicated-loans/participants/${loanId}`);
  },

  // DOCUMENT ANALYSIS ENDPOINTS
  async uploadDocument(formData) {
    const token = getToken(); // ✅ Safe token retrieval
    const url = `${this.baseURL}/api/documents/upload`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  },

  async getDocuments(loanId = null) {
    const endpoint = loanId ? `/api/documents?loanId=${loanId}` : '/api/documents';
    return this.request(endpoint);
  },

  async getDocumentAnalysis(documentId) {
    return this.request(`/api/documents/${documentId}`);
  },

  async deleteDocument(documentId) {
    return this.request(`/api/documents/${documentId}`, {
      method: 'DELETE',
    });
  },
};

// Error handling utility
export const handleApiError = (error, setError = null) => {
  console.error('API Error:', error);

  let errorMessage = 'An unexpected error occurred.';

  if (error.message.includes('401')) {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionManager.clearSession();
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    errorMessage = 'Session expired. Please log in again.';
  } else if (error.message.includes('403')) {
    errorMessage = 'Access denied. You do not have permission to perform this action.';
  } else if (error.message.includes('404')) {
    errorMessage = 'Resource not found.';
  } else if (error.message.includes('500')) {
    errorMessage = 'Server error. Please try again later.';
  } else {
    errorMessage = error.message || 'An unexpected error occurred.';
  }

  if (setError && typeof setError === 'function') {
    setError(errorMessage);
  }

  return errorMessage;
};

// Success handling utility
export const handleApiSuccess = (message, setSuccess) => {
  if (setSuccess && typeof setSuccess === 'function') {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 5000);
  }
};

// Token expiration handler
export const handleTokenExpiration = () => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionManager.clearSession();
  }
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sessionExpired'));
    window.location.href = '/';
  }
};
