import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      // Use AuthContext login
      const result = await login(formData.email, formData.password);
      // Redirect based on role
      const userRole = result?.mongoUser?.role;
      if (userRole === 'authority') {
        navigate('/authority-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      background: `
        radial-gradient(ellipse at top, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at bottom, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
        linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 100%)
      `,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      boxSizing: 'border-box',
    }}>
      {/* Animated background */}
      <div className="login-bg-animated" />

      <div className="login-container" style={{
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 10,
        padding: '16px',
      }}>
        <div className="login-form" style={{
          padding: '40px',
          borderRadius: '16px',
          background: `
            linear-gradient(145deg, 
              rgba(255, 255, 255, 0.1) 0%, 
              rgba(255, 255, 255, 0.05) 100%
            )
          `,
          backdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          color: '#fff',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {/* Top highlight */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          }} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 12px rgba(0,0,0,0.3)',
              marginBottom: '8px',
              letterSpacing: '-0.025em',
              margin: '0 0 8px 0',
            }}>
              Welcome Back
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '1.1rem',
              fontWeight: 400,
              margin: 0,
            }}>
              Sign in to continue your journey
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="error-alert" style={{
              marginBottom: '24px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(244, 67, 54, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
              color: '#ffcdd2',
              fontSize: '0.95rem',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {/* Email Field */}
            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focusedField === 'email' ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                  zIndex: 1,
                  fontSize: '20px',
                }} className="icon">
                  📧
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 50px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${focusedField === 'email' ? 'rgba(96, 165, 250, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: '#fff',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '32px', position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focusedField === 'password' ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                  zIndex: 1,
                  fontSize: '20px',
                }} className="icon">
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '16px 50px 16px 50px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${focusedField === 'password' ? 'rgba(96, 165, 250, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: '#fff',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className={`password-toggle-btn${showPassword ? ' active' : ''}`}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="submit-btn"
              style={{
                width: '100%',
                padding: '16px 32px',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: isFormValid 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255,255,255,0.1)',
                color: isFormValid ? '#fff' : 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(10px)',
                cursor: isFormValid && !loading ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '24px',
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid rgba(255,255,255,0.7)',
                    borderRadius: '50%',
                  }} />
                </>
              ) : (
                <>
                  Sign In
                  <span style={{ fontSize: '16px' }}>→</span>
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '16px',
                fontSize: '0.95rem',
              }}>
                Don't have an account?
              </p>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="create-account-btn"
              >
                Create Account
              </button>
            </div>
          </form>

          {/* Demo credentials info */}
          {/*
          <div style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.85rem',
              margin: '0 0 8px 0',
            }}>
              💡 Demo Credentials
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              margin: 0,
              fontFamily: 'Monaco, Consolas, monospace',
            }}>
              Email: demo@example.com<br />
              Password: password
            </p>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}

export default Login;