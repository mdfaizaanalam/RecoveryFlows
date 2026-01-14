import React from 'react';
import { FaLinkedin, FaGithub, FaTwitter, FaEnvelope, FaShieldAlt, FaLeaf, FaChartLine, FaRocket, FaUsers } from 'react-icons/fa';
import { MdTrendingUp } from 'react-icons/md';

function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(to right, #1a1a2e, #16213e, #0f3460)',
      color: 'white',
      marginTop: 'auto',
      padding: '3rem 1.5rem 1.5rem',
      borderTop: '4px solid #00adb5',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        opacity: 0.03,
        background: 'radial-gradient(circle at 20% 50%, #00adb5 0%, transparent 50%), radial-gradient(circle at 80% 80%, #667eea 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Top Section - Brand & All Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
          gap: '3rem',
          marginBottom: '2.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          alignItems: 'start'
        }}
        className="footer-grid"
        >
          
          {/* Brand Column - Wider (1.5fr) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #00adb5, #667eea)',
                padding: '0.6rem',
                borderRadius: '10px',
                marginRight: '0.85rem',
                boxShadow: '0 4px 15px rgba(0, 173, 181, 0.3)'
              }}>
                <FaChartLine size={28} />
              </div>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '1.6rem', 
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #00adb5, #667eea)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  RecoveryFlow
                </h3>
                <p style={{ 
                  margin: '0.2rem 0 0 0', 
                  fontSize: '0.7rem', 
                  color: '#00adb5',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>
                  Smart Lending Platform
                </p>
              </div>
            </div>
            <p style={{ 
              fontSize: '0.9rem', 
              lineHeight: '1.6', 
              color: 'rgba(255, 255, 255, 0.75)',
              marginBottom: '1.5rem'
            }}>
              Transforming loan recovery with transparency, efficiency, and sustainable practices. Powered by advanced analytics and digital innovation.
            </p>
            
            {/* Social Icons */}
            <div style={{ display: 'flex', gap: '0.85rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <a 
                href="https://github.com/mdfaizaanalam/RecoveryFlow" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.08)',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#00adb5';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <FaGithub size={18} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.08)',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#00adb5';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <FaLinkedin size={18} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.08)',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#00adb5';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <FaTwitter size={18} />
              </a>
              <a 
                href="mailto:contact@recoveryflow.com" 
                style={{ 
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.08)',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#00adb5';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <FaEnvelope size={18} />
              </a>
            </div>
          </div>

          {/* Core Features - Equal Width (1fr) */}
          <div>
            <h4 style={{ 
              marginBottom: '1.25rem', 
              fontSize: '1.05rem', 
              fontWeight: 'bold',
              color: '#00adb5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaRocket size={17} />
              Core Features
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Digital Loan Management',
                'Real-time EMI Tracking',
                'Automated Interest Calculation',
                'Recovery Status Monitoring',
                'Comprehensive Analytics',
                'Document Management'
              ].map((feature, index) => (
                <li 
                  key={index}
                  style={{ 
                    marginBottom: '0.65rem', 
                    fontSize: '0.88rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = '#00adb5';
                    e.currentTarget.style.transform = 'translateX(3px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <span style={{ color: '#00adb5', marginRight: '0.65rem', fontSize: '1.1rem' }}>•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Innovation Pillars - Equal Width (1fr) */}
          <div>
            <h4 style={{ 
              marginBottom: '1.25rem', 
              fontSize: '1.05rem', 
              fontWeight: 'bold',
              color: '#00adb5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <MdTrendingUp size={17} />
              Innovation Pillars
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li 
                style={{ 
                  marginBottom: '0.65rem', 
                  fontSize: '0.88rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#4CAF50';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <FaLeaf style={{ marginRight: '0.65rem', color: '#4CAF50', fontSize: '1rem' }} />
                Sustainable Lending
              </li>
              <li 
                style={{ 
                  marginBottom: '0.65rem', 
                  fontSize: '0.88rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#FF9800';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <MdTrendingUp style={{ marginRight: '0.65rem', color: '#FF9800', fontSize: '1rem' }} />
                Transparency First
              </li>
              <li 
                style={{ 
                  marginBottom: '0.65rem', 
                  fontSize: '0.88rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#2196F3';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <FaShieldAlt style={{ marginRight: '0.65rem', color: '#2196F3', fontSize: '1rem' }} />
                Bank-Level Security
              </li>
              <li 
                style={{ 
                  marginBottom: '0.65rem', 
                  fontSize: '0.88rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#9C27B0';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span style={{ marginRight: '0.65rem', fontSize: '1rem' }}>🤝</span>
                Transparent Loan Trading
              </li>
              <li 
                style={{ 
                  marginBottom: '0.65rem', 
                  fontSize: '0.88rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#00adb5';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span style={{ marginRight: '0.65rem', fontSize: '1rem' }}>📊</span>
                Green Loan Analytics
              </li>
              <li 
                style={{ 
                  marginBottom: '0.65rem', 
                  fontSize: '0.88rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#00adb5';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span style={{ marginRight: '0.65rem', fontSize: '1rem' }}>📈</span>
                Performance Insights
              </li>
            </ul>
          </div>

          {/* Quick Links - Equal Width (1fr) */}
          <div>
            <h4 style={{ 
              marginBottom: '1.25rem', 
              fontSize: '1.05rem', 
              fontWeight: 'bold',
              color: '#00adb5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaUsers size={17} />
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { text: 'About Us', href: '#' },
                { text: 'How It Works', href: '#' },
                { text: 'Documentation', href: '#' },
                { text: 'Support Center', href: '#' },
                { text: 'Contact Us', href: '#' }
              ].map((link, index) => (
                <li key={index} style={{ marginBottom: '0.65rem' }}>
                  <a 
                    href={link.href}
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      textDecoration: 'none',
                      fontSize: '0.88rem',
                      transition: 'all 0.2s ease',
                      display: 'inline-block'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = '#00adb5';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          paddingBottom: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              © 2025 RecoveryFlow. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(76, 175, 80, 0.2)',
                color: '#4CAF50',
                padding: '0.25rem 0.7rem',
                borderRadius: '15px',
                fontSize: '0.72rem',
                fontWeight: '600',
                border: '1px solid rgba(76, 175, 80, 0.3)'
              }}>
                🌱 Eco-Friendly
              </span>
              <span style={{
                background: 'rgba(33, 150, 243, 0.2)',
                color: '#2196F3',
                padding: '0.25rem 0.7rem',
                borderRadius: '15px',
                fontSize: '0.72rem',
                fontWeight: '600',
                border: '1px solid rgba(33, 150, 243, 0.3)'
              }}>
                🔒 Secure
              </span>
              <span style={{
                background: 'rgba(255, 152, 0, 0.2)',
                color: '#FF9800',
                padding: '0.25rem 0.7rem',
                borderRadius: '15px',
                fontSize: '0.72rem',
                fontWeight: '600',
                border: '1px solid rgba(255, 152, 0, 0.3)'
              }}>
                📊 Transparent
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
            <a 
              href="#" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#00adb5'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#00adb5'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#00adb5'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        /* Desktop: 1.5fr 1fr 1fr 1fr */
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 2.5rem !important;
          }
        }

        /* Tablet: 2 columns */
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            text-align: left !important;
          }
        }

        /* Mobile: Single column, center Quick Links */
        @media (max-width: 480px) {
          .footer-grid > div:last-child {
            text-align: center !important;
          }
          
          .footer-grid > div:last-child ul {
            display: flex;
            flex-direction: column;
            align-items: center !important;
          }
        }
      `}</style>
    </footer>
  );
}

export default Footer;
