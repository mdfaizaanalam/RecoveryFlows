import React, { useState } from 'react';
import { api, handleApiError, handleApiSuccess } from '../utils/api';
import { FaUserPlus } from 'react-icons/fa';
import { MdEmail, MdLock, MdPerson, MdPhone, MdGroups } from 'react-icons/md';

function Register({ onRegister, onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); 
    setSuccess('');
    setLoading(true);
    
    try {
      const payload = { ...form };
      if (form.role !== 'agent') delete payload.phone;
      
      // Register the user
      const registerData = await api.register(payload);
      
      // Automatically log in the user with the same credentials
      const loginData = await api.login({ 
        email: form.email, 
        password: form.password 
      });
      
      setSuccess('Registration successful! You have been automatically logged in.');
      
      // Call onLogin to set the user session
      onLogin && onLogin(loginData.data.user, loginData.data.token);
      
      // Clear form
      setForm({ name: '', email: '', password: '', role: 'customer', phone: '' });
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const formatErrorMessage = (errorMessage) => {
    if (errorMessage.includes('\n')) {
      return errorMessage.split('\n').map((line, index) => (
        <div key={index} style={{ marginBottom: '0.5rem' }}>
          {line}
        </div>
      ));
    }
    return errorMessage;
  };

  return (
    <>
      {/* Enhanced Register Form Header - Matching Login Design */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #d9822b 0%, #f4a460 100%)',
          width: '90px',
          height: '90px',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          boxShadow: '0 16px 40px rgba(217, 130, 43, 0.4)',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <FaUserPlus size={40} color="#fff" />
        </div>
        <h2 style={{ 
          fontWeight: 900, 
          color: '#0a0a0a', 
          marginBottom: '1rem',
          fontSize: '2.2rem',
          letterSpacing: '-0.8px'
        }}>
          Create Account
        </h2>
        <p style={{ 
          color: '#666', 
          fontSize: '1.1rem',
          margin: 0,
          lineHeight: 1.6
        }}>
          Join our platform and start your loan journey
        </p>
      </div>

      {/* Enhanced Register Form */}
      <form onSubmit={handleSubmit}>
        {/* Full Name Field */}
        <div style={{ marginBottom: '2.25rem' }}>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '0.9rem', 
            fontWeight: 800, 
            color: '#0a0a0a',
            fontSize: '1rem'
          }}>
            <MdPerson size={22} color="#d9822b" />
            Full Name
          </label>
          <input 
            name="name" 
            type="text" 
            placeholder="Enter your full name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.3rem 1.75rem',
              borderRadius: '16px',
              border: '2.5px solid #e9ecef',
              fontSize: '1.05rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: '#fff',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#d9822b';
              e.target.style.boxShadow = '0 0 0 5px rgba(217, 130, 43, 0.12)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e9ecef';
              e.target.style.boxShadow = 'none';
              e.target.style.transform = 'translateY(0)';
            }}
          />
        </div>

        {/* Email Field */}
        <div style={{ marginBottom: '2.25rem' }}>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '0.9rem', 
            fontWeight: 800, 
            color: '#0a0a0a',
            fontSize: '1rem'
          }}>
            <MdEmail size={22} color="#d9822b" />
            Email Address
          </label>
          <input 
            name="email" 
            type="email" 
            placeholder="Enter your email address" 
            value={form.email} 
            onChange={handleChange} 
            required 
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.3rem 1.75rem',
              borderRadius: '16px',
              border: '2.5px solid #e9ecef',
              fontSize: '1.05rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: '#fff',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#d9822b';
              e.target.style.boxShadow = '0 0 0 5px rgba(217, 130, 43, 0.12)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e9ecef';
              e.target.style.boxShadow = 'none';
              e.target.style.transform = 'translateY(0)';
            }}
          />
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: '2.25rem' }}>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '0.9rem', 
            fontWeight: 800, 
            color: '#0a0a0a',
            fontSize: '1rem'
          }}>
            <MdLock size={22} color="#d9822b" />
            Password
          </label>
          <input 
            name="password" 
            type="password" 
            placeholder="Create a password (min 6 characters)" 
            value={form.password} 
            onChange={handleChange} 
            required 
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.3rem 1.75rem',
              borderRadius: '16px',
              border: '2.5px solid #e9ecef',
              fontSize: '1.05rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: '#fff',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#d9822b';
              e.target.style.boxShadow = '0 0 0 5px rgba(217, 130, 43, 0.12)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e9ecef';
              e.target.style.boxShadow = 'none';
              e.target.style.transform = 'translateY(0)';
            }}
          />
        </div>

        {/* Account Type Field */}
        <div style={{ marginBottom: '2.25rem' }}>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '0.9rem', 
            fontWeight: 800, 
            color: '#0a0a0a',
            fontSize: '1rem'
          }}>
            <MdGroups size={22} color="#d9822b" />
            Account Type
          </label>
          <select 
            name="role" 
            value={form.role} 
            onChange={handleChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.3rem 1.75rem',
              borderRadius: '16px',
              border: '2.5px solid #e9ecef',
              fontSize: '1.05rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: '#fff',
              boxSizing: 'border-box',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#d9822b';
              e.target.style.boxShadow = '0 0 0 5px rgba(217, 130, 43, 0.12)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e9ecef';
              e.target.style.boxShadow = 'none';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <option value="customer">Customer</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Phone Number Field (Conditional for Agent) */}
        {form.role === 'agent' && (
          <div style={{ marginBottom: '2.25rem' }}>
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.9rem', 
              fontWeight: 800, 
              color: '#0a0a0a',
              fontSize: '1rem'
            }}>
              <MdPhone size={22} color="#d9822b" />
              Phone Number
            </label>
            <input 
              name="phone" 
              type="tel" 
              placeholder="Enter your phone number" 
              value={form.phone} 
              onChange={handleChange} 
              required 
              disabled={loading}
              style={{
                width: '100%',
                padding: '1.3rem 1.75rem',
                borderRadius: '16px',
                border: '2.5px solid #e9ecef',
                fontSize: '1.05rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: '#fff',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#d9822b';
                e.target.style.boxShadow = '0 0 0 5px rgba(217, 130, 43, 0.12)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e9ecef';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>
        )}

        {/* Submit Button - Matching Login Style */}
        <button 
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '1.4rem',
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '1.1rem',
            border: 'none',
            background: loading ? '#b8691f' : 'linear-gradient(135deg, #d9822b 0%, #f4a460 100%)',
            color: 'white',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.8 : 1,
            boxShadow: '0 12px 32px rgba(217, 130, 43, 0.35)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 16px 40px rgba(217, 130, 43, 0.45)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 12px 32px rgba(217, 130, 43, 0.35)';
            }
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        {/* Error Alert */}
        {error && (
          <div style={{ 
            whiteSpace: 'pre-line',
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            border: '2px solid #f87171',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginTop: '1.5rem',
            color: '#991b1b',
            fontSize: '0.95rem',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(248, 113, 113, 0.2)'
          }}>
            {formatErrorMessage(error)}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div style={{ 
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            border: '2px solid #34d399',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginTop: '1.5rem',
            color: '#065f46',
            fontSize: '0.95rem',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(52, 211, 153, 0.2)'
          }}>
            {success}
          </div>
        )}
      </form>

      {/* Footer - Already have account */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '3rem',
        paddingTop: '2.5rem',
        borderTop: '2px solid #f0f0f0'
      }}>
        <p style={{ 
          color: '#666', 
          fontSize: '1.05rem',
          margin: '0 0 1.25rem 0',
          fontWeight: 600
        }}>
          Already have an account?
        </p>
        <button 
          onClick={onRegister}
          type="button"
          style={{
            background: 'transparent',
            border: '2.5px solid #d9822b',
            color: '#d9822b',
            fontWeight: 800,
            padding: '1rem 2.5rem',
            borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            fontSize: '1.05rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#d9822b';
            e.target.style.color = 'white';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 24px rgba(217, 130, 43, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#d9822b';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Sign In Instead
        </button>
      </div>

      {/* Inline keyframe animation for pulse effect */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        `}
      </style>
    </>
  );
}

export default Register;
