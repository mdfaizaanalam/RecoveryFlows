// Session Management Utility - Production Safe
class SessionManager {
  constructor() {
    this.INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    this.SESSION_DURATION = 2 * 24 * 60 * 60 * 1000; // 2 days
    this.inactivityTimer = null;
    this.listenersSetup = false;
    // ✅ REMOVED: this.setupActivityListeners() - will setup on first login
  }

  // ✅ Check if running in browser
  isBrowser() {
    return typeof window !== 'undefined' && 
           typeof document !== 'undefined' && 
           typeof localStorage !== 'undefined';
  }

  // Initialize session when user logs in
  initSession(token, userData) {
    if (!this.isBrowser()) return; // ✅ Added check

    const sessionData = {
      token,
      userData,
      loginTime: Date.now(),
      lastActivity: Date.now()
    };
    
    try {
      localStorage.setItem('session', JSON.stringify(sessionData));
      this.setupActivityListeners(); // ✅ Setup here, not in constructor
      this.resetInactivityTimer();
      console.log('✅ Session initialized');
    } catch (error) {
      console.error('Failed to init session:', error);
    }
  }

  // Check if session is valid
  isSessionValid() {
    if (!this.isBrowser()) return false; // ✅ Added check

    const session = this.getSession();
    if (!session) return false;

    const now = Date.now();
    const timeSinceLogin = now - session.loginTime;
    const timeSinceLastActivity = now - session.lastActivity;

    // Check if session has expired (2 days)
    if (timeSinceLogin > this.SESSION_DURATION) {
      console.log('Session expired: 2 days limit');
      this.clearSession();
      return false;
    }

    // Check if user has been inactive for too long (15 minutes)
    if (timeSinceLastActivity > this.INACTIVITY_TIMEOUT) {
      console.log('Session expired: 15 min inactivity');
      this.clearSession();
      return false;
    }

    // Update last activity time
    this.updateLastActivity();
    return true;
  }

  // Get current session data
  getSession() {
    if (!this.isBrowser()) return null; // ✅ Added check

    try {
      const session = localStorage.getItem('session');
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error parsing session data:', error);
      return null;
    }
  }

  // Update last activity time
  updateLastActivity() {
    if (!this.isBrowser()) return; // ✅ Added check

    const session = this.getSession();
    if (session) {
      session.lastActivity = Date.now();
      try {
        localStorage.setItem('session', JSON.stringify(session));
      } catch (error) {
        console.error('Failed to update activity:', error);
      }
    }
  }

  // Reset inactivity timer
  resetInactivityTimer() {
    if (!this.isBrowser()) return; // ✅ Added check

    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivityTimeout();
    }, this.INACTIVITY_TIMEOUT);
  }

  // Handle inactivity timeout
  handleInactivityTimeout() {
    if (!this.isBrowser()) return; // ✅ Added check

    console.log('⏰ Session expired due to inactivity');
    this.clearSession();
    window.dispatchEvent(new CustomEvent('sessionExpired'));
  }

  // Clear session data
  clearSession() {
    if (!this.isBrowser()) return; // ✅ Added check

    try {
      localStorage.removeItem('session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = null;
      }
      console.log('🗑️ Session cleared');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  // Setup activity listeners
  setupActivityListeners() {
    if (!this.isBrowser()) return; // ✅ Added check
    if (this.listenersSetup) return; // ✅ Prevent duplicate setup

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      if (this.getSession()) {
        this.updateLastActivity();
        this.resetInactivityTimer();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, { passive: true });
    });

    this.listenersSetup = true;
    console.log('👂 Activity listeners ready');
  }

  // Get remaining session time in minutes
  getRemainingSessionTime() {
    const session = this.getSession();
    if (!session) return 0;

    const now = Date.now();
    const timeSinceLogin = now - session.loginTime;
    const remainingTime = this.SESSION_DURATION - timeSinceLogin;
    
    return Math.max(0, Math.floor(remainingTime / (60 * 1000)));
  }

  // Get remaining inactivity time in minutes
  getRemainingInactivityTime() {
    const session = this.getSession();
    if (!session) return 0;

    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;
    const remainingTime = this.INACTIVITY_TIMEOUT - timeSinceLastActivity;
    
    return Math.max(0, Math.floor(remainingTime / (60 * 1000)));
  }
}

export default new SessionManager();
